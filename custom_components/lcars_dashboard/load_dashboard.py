import logging
import os
import re

from homeassistant.components import frontend
from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.components.lovelace import _register_panel

from .const import CONF_DASHBOARDS, DASHBOARD_REGISTRY, DEFAULT_DASHBOARDS, DOMAIN

_LOGGER = logging.getLogger(__name__)

# Reserved HA panel paths — never register these
_HA_RESERVED_PATHS = frozenset({
    "lovelace", "config", "developer-tools", "history", "logbook",
    "map", "energy", "media-browser", "profile", "hassio",
    "lcars-dashboard",  # Legacy v4.x path — prevent collision during migration
})

_URL_PATH_RE = re.compile(r'^[a-z][a-z0-9\-]{1,39}$')


def _validate_url_path(url_path):
    """Validate a dashboard URL path is safe to register."""
    if url_path in _HA_RESERVED_PATHS:
        raise ValueError(f"Reserved panel path: {url_path}")
    if not _URL_PATH_RE.match(url_path):
        raise ValueError(f"Invalid URL path format: {url_path}")
    return url_path


def _register_single_dashboard(hass, url_path, yaml_path, title, icon, show_in_sidebar=True, require_admin=False):
    """Register a single Lovelace YAML dashboard with HA's panel system.

    Args:
        hass: Home Assistant instance
        url_path: URL path for the dashboard (e.g., 'lcars-habitat')
        yaml_path: Relative path to the YAML file from HA config dir
        title: Sidebar panel title
        icon: Sidebar panel icon (mdi: format)
        show_in_sidebar: Whether to show in the sidebar (default True)
        require_admin: Restrict dashboard to admin users (default False)
    """
    _validate_url_path(url_path)

    dashboard_config = {
        "mode": "yaml",
        "icon": icon,
        "title": title,
        "filename": yaml_path,
        "show_in_sidebar": show_in_sidebar,
        "require_admin": bool(require_admin),
    }

    full_yaml_path = hass.config.path(yaml_path)
    if not os.path.exists(full_yaml_path):
        _LOGGER.warning("Dashboard YAML not found, skipping: %s (resolved: %s)", yaml_path, full_yaml_path)
        return False

    _LOGGER.debug("Registering Lovelace panel: url=%s, title=%s, icon=%s, yaml=%s", url_path, title, icon, yaml_path)

    try:
        hass.data["lovelace"].dashboards[url_path] = LovelaceYAML(hass, url_path, dashboard_config)
        _register_panel(hass, url_path, "yaml", dashboard_config, False)
        _LOGGER.debug("Dashboard panel registered successfully: /%s", url_path)
        return True
    except Exception as err:
        _LOGGER.error("Failed to register dashboard panel /%s: %s", url_path, err, exc_info=True)
        return False


def load_dashboards(hass, config_entry):
    """Register all enabled dashboards from config entry options.

    Returns list of url_paths that were successfully registered.
    """
    enabled = config_entry.options.get(CONF_DASHBOARDS, DEFAULT_DASHBOARDS)
    registered = []

    for db_key in enabled:
        meta = DASHBOARD_REGISTRY.get(db_key)
        if not meta:
            _LOGGER.warning("Unknown dashboard key in config: %s — skipping", db_key)
            continue

        title = config_entry.options.get(f"{db_key}_title", meta["default_title"])
        icon = config_entry.options.get(f"{db_key}_icon", meta["default_icon"])
        require_admin = meta.get("require_admin", False)
        yaml_path = f"custom_components/lcars_dashboard/lovelace/ui-lovelace-{db_key}.yaml"

        # For habitat, use the existing ui-lovelace.yaml
        if db_key == "habitat":
            yaml_path = "custom_components/lcars_dashboard/lovelace/ui-lovelace.yaml"

        if _register_single_dashboard(hass, meta["url_path"], yaml_path, title, icon, require_admin=require_admin):
            registered.append(meta["url_path"])

    _LOGGER.info("Registered %d dashboard(s): %s", len(registered), ", ".join(registered))
    return registered


def unload_dashboards(hass):
    """Unregister ALL possible dashboard panels."""
    for meta in DASHBOARD_REGISTRY.values():
        url_path = meta["url_path"]
        try:
            frontend.async_remove_panel(hass, url_path)
            hass.data.get("lovelace", {}).get("dashboards", {}).pop(url_path, None)
            _LOGGER.debug("Unregistered dashboard panel: /%s", url_path)
        except (KeyError, AttributeError):
            pass  # Panel wasn't registered — fine

    # Also clean up legacy v4.x panel if it exists
    try:
        frontend.async_remove_panel(hass, "lcars-dashboard")
    except (KeyError, AttributeError):
        pass
