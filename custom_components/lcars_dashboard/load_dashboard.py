import logging

from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.components.lovelace import _register_panel

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

def load_dashboard(hass, config_entry):

    _LOGGER.debug("Loading dashboard panel with config_entry options: %s", config_entry.options)

    sidepanel_title = "LCARS Dashboard"
    sidepanel_icon = "mdi:alpha-d-box"

    if("sidepanel_title" in config_entry.options):
        sidepanel_title = config_entry.options["sidepanel_title"]

    if("sidepanel_icon" in config_entry.options):
        sidepanel_icon = config_entry.options["sidepanel_icon"]

    dashboard_url = "lcars-dashboard"
    dashboard_config = {
        "mode": "yaml",
        "icon": sidepanel_icon,
        "title": sidepanel_title,
        "filename": "custom_components/lcars_dashboard/lovelace/ui-lovelace.yaml",
        "show_in_sidebar": True,
        "require_admin": False,
    }

    _LOGGER.debug("Registering Lovelace panel: url=%s, title=%s, icon=%s", dashboard_url, sidepanel_title, sidepanel_icon)

    hass.data["lovelace"].dashboards[dashboard_url] = LovelaceYAML(hass, dashboard_url, dashboard_config)

    _register_panel(hass, dashboard_url, "yaml", dashboard_config, False)

    _LOGGER.debug("Dashboard panel registered successfully")
