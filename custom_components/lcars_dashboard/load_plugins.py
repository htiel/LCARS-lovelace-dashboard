import logging
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import HomeAssistantHTTP
from homeassistant.components.http import StaticPathConfig

DATA_EXTRA_MODULE_URL = 'frontend_extra_module_url'

_LOGGER = logging.getLogger(__name__)

from .const import VERSION

async def load_plugins(hass, name):
    #_LOGGER.warning(f"load_plugins() version: {VERSION}")

    add_extra_js_url(hass, f"/lcars_dashboard/js/lcars-dashboard.js?version={VERSION}")

    await hass.http.async_register_static_paths(
        [StaticPathConfig("/lcars_dashboard/js", hass.config.path(f"custom_components/{name}/js"), True)]
    )
