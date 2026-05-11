DOMAIN = "lcars_dashboard"
VERSION = "5.5.3"

# Configuration keys
CONF_DASHBOARDS = "dashboards"
CONF_DASHBOARD_ORDER = "dashboard_order"

# Dashboard registry — canonical definitions
# url_path uses "lcars-" prefix to avoid collisions with user-created HA dashboards
DASHBOARD_REGISTRY = {
    "habitat":       {"default_title": "Habitat",       "default_icon": "mdi:home",        "url_path": "lcars-habitat"},
    "security":      {"default_title": "Tactical",      "default_icon": "mdi:shield",      "url_path": "lcars-security"},
    "power":         {"default_title": "Power Distribution", "default_icon": "mdi:flash",  "url_path": "lcars-power"},
    "environmental": {"default_title": "Life Support",  "default_icon": "mdi:thermometer",  "url_path": "lcars-environmental"},
    "lighting":      {"default_title": "Illumination",  "default_icon": "mdi:lightbulb",   "url_path": "lcars-lighting"},
    "cetacean":      {"default_title": "Cetacean Ops",  "default_icon": "mdi:dolphin",     "url_path": "lcars-cetacean"},
    # 5X-3.3 / 5.2.0 — Subspace Relay (Network) per LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md
    # require_admin=True per Worf spec §15 — client/host/MAC data is sensitive even for read-only
    "network":       {"default_title": "Subspace Relay", "default_icon": "mdi:lan",         "url_path": "lcars-network",      "require_admin": True},
    # 5X-3.5 / 5.3.0 — Medical Bay per LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md
    # require_admin=True per Worf §16 — PHI-equivalent vitals; default-disabled (default_enabled=False).
    "medical":       {"default_title": "Medical Bay",   "default_icon": "mdi:medical-bag", "url_path": "lcars-medical",      "require_admin": True, "default_enabled": False},
    # 5X-3.6 / 5.4.0 — Starship Health (Engineering) per LCARS-STARSHIP-HEALTH-DASHBOARD-SPEC.md
    # require_admin=True per Worf 5.4.1 review B1: surfaces HA core/OS version, addon counts,
    # process names — CVE-fingerprintable. Operational telemetry only (no PHI), default-enabled
    # for the admin role.
    "starship-health": {"default_title": "Starship Health", "default_icon": "mdi:rocket-launch-outline", "url_path": "lcars-starship-health", "require_admin": True},
}

# Default set of dashboards enabled on a fresh install or when no options exist.
# Derived from DASHBOARD_REGISTRY: every entry where default_enabled is not False (5X-B40 / #115).
DEFAULT_DASHBOARDS = [k for k, v in DASHBOARD_REGISTRY.items() if v.get("default_enabled", True)]

# Pinned to match registry length; readers (config_flow, options UI) iterate the registry directly.
# Use an explicit guard rather than `assert` so the check survives `python -O`.
MAX_DASHBOARDS = 9
if MAX_DASHBOARDS != len(DASHBOARD_REGISTRY):
    raise RuntimeError(
        f"MAX_DASHBOARDS drift: const={MAX_DASHBOARDS} registry={len(DASHBOARD_REGISTRY)}"
    )
