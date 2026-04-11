import logging
import os
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import HomeAssistantHTTP
from homeassistant.components.http import StaticPathConfig

DATA_EXTRA_MODULE_URL = 'frontend_extra_module_url'

_LOGGER = logging.getLogger(__name__)

from .const import VERSION

async def load_plugins(hass, name):
    js_url = f"/lcars_dashboard/js/lcars-dashboard.js?version={VERSION}"
    static_dir = hass.config.path(f"custom_components/{name}/js")

    _LOGGER.debug("Registering JS plugin: %s", js_url)

    # Verify the JS bundle exists
    bundle_path = os.path.join(static_dir, "lcars-dashboard.js")
    if not os.path.exists(bundle_path):
        _LOGGER.error("JS bundle not found: %s", bundle_path)
    else:
        bundle_size = os.path.getsize(bundle_path)
        _LOGGER.debug("JS bundle verified: %s (%d bytes)", bundle_path, bundle_size)

    add_extra_js_url(hass, js_url)

    await hass.http.async_register_static_paths(
        [StaticPathConfig("/lcars_dashboard/js", static_dir, True)]
    )

    _LOGGER.debug("Static path registered: /lcars_dashboard/js -> %s", static_dir)
