import logging
import os

from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.components.lovelace import _register_panel

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


def _register_single_dashboard(hass, url_path, yaml_path, title, icon, show_in_sidebar=True):
    """Register a single Lovelace YAML dashboard with HA's panel system.

    Args:
        hass: Home Assistant instance
        url_path: URL path for the dashboard (e.g., 'lcars-dashboard')
        yaml_path: Relative path to the YAML file from HA config dir
        title: Sidebar panel title
        icon: Sidebar panel icon (mdi: format)
        show_in_sidebar: Whether to show in the sidebar (default True)
    """
    dashboard_config = {
        "mode": "yaml",
        "icon": icon,
        "title": title,
        "filename": yaml_path,
        "show_in_sidebar": show_in_sidebar,
        "require_admin": False,
    }

    full_yaml_path = hass.config.path(yaml_path)
    if not os.path.exists(full_yaml_path):
        _LOGGER.error("Dashboard YAML not found: %s (resolved: %s)", yaml_path, full_yaml_path)
        return

    _LOGGER.debug("Registering Lovelace panel: url=%s, title=%s, icon=%s, yaml=%s", url_path, title, icon, yaml_path)

    try:
        hass.data["lovelace"].dashboards[url_path] = LovelaceYAML(hass, url_path, dashboard_config)
        _register_panel(hass, url_path, "yaml", dashboard_config, False)
        _LOGGER.debug("Dashboard panel registered successfully: /%s", url_path)
    except Exception as err:
        _LOGGER.error("Failed to register dashboard panel: %s", err, exc_info=True)


def load_dashboard(hass, config_entry):

    _LOGGER.debug("Loading dashboard panel: title=%s, icon=%s", 
                   config_entry.options.get("sidepanel_title", "LCARS Dashboard"),
                   config_entry.options.get("sidepanel_icon", "mdi:alpha-d-box"))

    sidepanel_title = config_entry.options.get("sidepanel_title", "LCARS Dashboard")
    sidepanel_icon = config_entry.options.get("sidepanel_icon", "mdi:alpha-d-box")

    _register_single_dashboard(
        hass,
        url_path="lcars-dashboard",
        yaml_path="custom_components/lcars_dashboard/lovelace/ui-lovelace.yaml",
        title=sidepanel_title,
        icon=sidepanel_icon,
    )
