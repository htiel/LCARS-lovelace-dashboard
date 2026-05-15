"""Medical Bay multi-user profile binding store.

Persists a Captain-curated mapping from sensor "binding keys" (platform:account
identifiers, or HAE prefixes) to HA `person.*` entities. The frontend's
discoverProfiles() consumes this mapping to bucket medical sensors into
person-scoped Biofunction Cards instead of relying on its single-bucket
heuristic collapse.

Storage: lcars-dashboard/configs/medical_profiles.yaml (atomic writes, per-file
asyncio lock, size + depth caps reused from __init__.py).

WS surface:
  - lcars_dashboard/medical_profiles/get  (admin: full mapping; non-admin: own profile only)
  - lcars_dashboard/medical_profiles/set  (admin only)

Both commands return / accept the full mapping object; partial updates are the
caller's responsibility (read-modify-write under the per-file lock).

See plans/v5.12.0-multi-user-mapping-plan.md for design context and
specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md sections 4.5 / 5.4 / 7.7 for the
authoritative resolver / composition / privacy contract.
"""

import logging
import re
from collections import OrderedDict
from typing import Any, Mapping

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

MEDICAL_PROFILES_PATH = "lcars-dashboard/configs/medical_profiles.yaml"

EVENT_MEDICAL_PROFILES_UPDATED = "lcars_dashboard_medical_profiles_updated"

# Validation: HA person entity_ids and binding keys.
_PERSON_ID_RE = re.compile(r"^person\.[a-z0-9_]+$")
_BINDING_KEY_RE = re.compile(r"^[a-z0-9_]+:[A-Za-z0-9_\-]+$")
_ENTITY_ID_RE = re.compile(r"^[a-z_][a-z0-9_]*\.[a-z0-9_]+$")

# Bounds: keep persisted mapping small enough that the resolver stays cheap.
_MAX_PROFILES = 32
_MAX_BINDINGS_PER_PROFILE = 16
_MAX_OVERRIDES_PER_PROFILE = 64

DEFAULT_MAPPING = {
    "version": 1,
    "respect_user_scoping": True,
    "profiles": [],
}


def _validate_mapping(data: Any) -> tuple[bool, str | None, dict | None]:
    """Validate a mapping payload. Returns (ok, error_message, normalized).

    Normalization: drops unknown top-level keys, ensures `profiles` is a list,
    coerces `respect_user_scoping` to bool, deduplicates bindings within a
    profile while preserving order.
    """
    if not isinstance(data, dict):
        return False, "Mapping must be a JSON object", None

    version = data.get("version", 1)
    if not isinstance(version, int) or version < 1:
        return False, "version must be a positive integer", None

    respect_scoping = bool(data.get("respect_user_scoping", True))

    profiles_raw = data.get("profiles", [])
    if not isinstance(profiles_raw, list):
        return False, "profiles must be a list", None
    if len(profiles_raw) > _MAX_PROFILES:
        return False, f"profiles exceeds {_MAX_PROFILES} entries", None

    seen_ids: set[str] = set()
    seen_bindings: set[str] = set()
    normalized_profiles: list[dict] = []

    for idx, p in enumerate(profiles_raw):
        if not isinstance(p, dict):
            return False, f"profiles[{idx}] must be an object", None

        pid = p.get("id")
        if not isinstance(pid, str) or not _PERSON_ID_RE.match(pid):
            return False, f"profiles[{idx}].id must match 'person.<slug>'", None
        if pid in seen_ids:
            return False, f"profiles[{idx}].id duplicates an earlier profile", None
        seen_ids.add(pid)

        label = p.get("label")
        if label is not None and not isinstance(label, str):
            return False, f"profiles[{idx}].label must be a string or omitted", None
        if isinstance(label, str) and len(label) > 64:
            return False, f"profiles[{idx}].label exceeds 64 chars", None

        bindings_raw = p.get("bindings", [])
        if not isinstance(bindings_raw, list):
            return False, f"profiles[{idx}].bindings must be a list", None
        if len(bindings_raw) > _MAX_BINDINGS_PER_PROFILE:
            return False, (
                f"profiles[{idx}].bindings exceeds "
                f"{_MAX_BINDINGS_PER_PROFILE} entries"
            ), None
        bindings_norm: list[str] = []
        for b in bindings_raw:
            if not isinstance(b, str) or not _BINDING_KEY_RE.match(b):
                return False, (
                    f"profiles[{idx}].bindings entries must match "
                    "'<platform>:<account_id>'"
                ), None
            if b in seen_bindings:
                return False, (
                    f"binding {b!r} appears in more than one profile"
                ), None
            seen_bindings.add(b)
            if b not in bindings_norm:
                bindings_norm.append(b)

        overrides_raw = p.get("entity_overrides", {}) or {}
        if not isinstance(overrides_raw, dict):
            return False, (
                f"profiles[{idx}].entity_overrides must be an object"
            ), None
        include_raw = overrides_raw.get("include", []) or []
        exclude_raw = overrides_raw.get("exclude", []) or []
        if not isinstance(include_raw, list) or not isinstance(exclude_raw, list):
            return False, (
                f"profiles[{idx}].entity_overrides.include / .exclude "
                "must be lists"
            ), None
        total = len(include_raw) + len(exclude_raw)
        if total > _MAX_OVERRIDES_PER_PROFILE:
            return False, (
                f"profiles[{idx}].entity_overrides exceeds "
                f"{_MAX_OVERRIDES_PER_PROFILE} entries"
            ), None
        for label_, lst in (("include", include_raw), ("exclude", exclude_raw)):
            for eid in lst:
                if not isinstance(eid, str) or not _ENTITY_ID_RE.match(eid):
                    return False, (
                        f"profiles[{idx}].entity_overrides.{label_} entries "
                        "must be valid entity_ids"
                    ), None

        normalized_profiles.append(
            {
                "id": pid,
                **({"label": label} if label is not None else {}),
                "bindings": bindings_norm,
                "entity_overrides": {
                    "include": list(include_raw),
                    "exclude": list(exclude_raw),
                },
            }
        )

    return True, None, {
        "version": version,
        "respect_user_scoping": respect_scoping,
        "profiles": normalized_profiles,
    }


def _normalize_loaded(raw: Any) -> dict:
    """Coerce a freshly-loaded YAML payload into the canonical mapping shape.

    Tolerates missing keys / wrong top-level types by falling back to defaults
    rather than raising — a corrupt mapping file should degrade to "no mapping
    configured" rather than break the dashboard.
    """
    if not isinstance(raw, dict):
        return dict(DEFAULT_MAPPING)
    ok, _err, norm = _validate_mapping(raw)
    if not ok or norm is None:
        return dict(DEFAULT_MAPPING)
    return norm


@websocket_api.websocket_command(
    {vol.Required("type"): "lcars_dashboard/medical_profiles/get"}
)
@websocket_api.async_response
async def ws_medical_profiles_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Mapping[str, Any],
) -> None:
    """Return the persisted medical profile mapping, scoped to the viewer.

    Per-user trust model (v5.13.0-beta.1, Worf S1-1 fix):
      - Admin: receives the full mapping (every profile + bindings + overrides).
        Required so the binding editor and admin dashboards can render and edit
        the entire household.
      - Non-admin / kiosk: receives only the profile linked to the viewer's own
        `person.*` (matched via `person.<slug>.user_id == connection.user.id`).
        Bindings and entity_overrides are returned for that single profile only
        — they reveal the viewer's own integration accounts, which the viewer
        already controls. No other household member's bindings are exposed.
      - Viewer with no linked person (kiosk-only HA user): receives an empty
        profiles list; the frontend falls back to the v5.11 heuristic bucket.
    """
    from . import _read_yaml_file  # local import to avoid circular at module load

    raw = await _read_yaml_file(hass, MEDICAL_PROFILES_PATH)
    mapping = _normalize_loaded(raw)

    user = connection.user
    if user is not None and user.is_admin:
        connection.send_result(msg["id"], mapping)
        return

    viewer_user_id = user.id if user is not None else None
    viewer_person_id: str | None = None
    if viewer_user_id:
        for state in hass.states.async_all("person"):
            if state.attributes.get("user_id") == viewer_user_id:
                viewer_person_id = state.entity_id
                break

    filtered_profiles = (
        [p for p in mapping.get("profiles", []) if p.get("id") == viewer_person_id]
        if viewer_person_id
        else []
    )

    connection.send_result(
        msg["id"],
        {
            "version": mapping.get("version", 1),
            "respect_user_scoping": mapping.get("respect_user_scoping", True),
            "profiles": filtered_profiles,
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/medical_profiles/set",
        vol.Required("data"): dict,
    }
)
@websocket_api.async_response
async def ws_medical_profiles_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Mapping[str, Any],
) -> None:
    """Replace the full medical profile mapping. Admin-only.

    Atomic via the existing per-file YAML lock. On success, fires
    EVENT_MEDICAL_PROFILES_UPDATED so other connected sessions can invalidate
    their cached copy.
    """
    from . import _write_yaml_file, _read_yaml_file, _get_yaml_lock, _check_depth

    payload = msg.get("data")
    if not _check_depth(payload):
        connection.send_error(
            msg["id"],
            "payload_too_deep",
            "medical_profiles payload exceeds maximum nesting depth",
        )
        return

    ok, err, norm = _validate_mapping(payload)
    if not ok or norm is None:
        connection.send_error(msg["id"], "invalid_format", err or "invalid mapping")
        return

    async with _get_yaml_lock(MEDICAL_PROFILES_PATH):
        # Read-modify-write isn't strictly required (full replacement) but
        # taking the lock keeps us serialized against any concurrent writer.
        _ = await _read_yaml_file(hass, MEDICAL_PROFILES_PATH)
        # Persist as a plain dict (yaml.add_representer handles OrderedDict
        # globally in __init__.py; using OrderedDict for stable key order).
        ordered = OrderedDict(
            [
                ("version", norm["version"]),
                ("respect_user_scoping", norm["respect_user_scoping"]),
                (
                    "profiles",
                    [
                        OrderedDict(
                            [
                                ("id", p["id"]),
                                *(
                                    [("label", p["label"])]
                                    if "label" in p
                                    else []
                                ),
                                ("bindings", list(p["bindings"])),
                                (
                                    "entity_overrides",
                                    OrderedDict(
                                        [
                                            ("include", list(p["entity_overrides"]["include"])),
                                            ("exclude", list(p["entity_overrides"]["exclude"])),
                                        ]
                                    ),
                                ),
                            ]
                        )
                        for p in norm["profiles"]
                    ],
                ),
            ]
        )
        await _write_yaml_file(hass, MEDICAL_PROFILES_PATH, ordered)

    hass.bus.async_fire(EVENT_MEDICAL_PROFILES_UPDATED)

    _LOGGER.debug(
        "medical_profiles/set persisted: %d profile(s), respect_user_scoping=%s",
        len(norm["profiles"]),
        norm["respect_user_scoping"],
    )
    connection.send_result(msg["id"], {"ok": True})


def register_medical_profiles(hass: HomeAssistant) -> None:
    """Register the medical_profiles WS commands. Called from async_setup."""
    websocket_api.async_register_command(hass, ws_medical_profiles_get)
    websocket_api.async_register_command(hass, ws_medical_profiles_set)
