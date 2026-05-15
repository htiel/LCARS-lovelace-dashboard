"""LCARS Dashboard version sensor.
Based on Dwains Dashboard by Dwain Scheeren (https://github.com/dwainscheeren/dwains-lovelace-dashboard).
"""
from homeassistant.components.sensor import SensorEntity
from .const import DOMAIN, VERSION

import logging

_LOGGER = logging.getLogger(__name__)


# DeadCodePass:start — async_setup_platform is the legacy YAML-platform entry point.
# This integration is config-entry-only (config_flow: true in manifest.json), so HA
# never invokes this function. Flagged v5.13.0-beta.1 cleanup audit; pending deletion.
# async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
#     """Setup sensor platform."""
#     async_add_entities([LcarsVersionSensor(hass)])
# DeadCodePass:end


async def async_setup_entry(hass, config_entry, async_add_devices):
    """Setup sensor platform."""
    async_add_devices([LcarsVersionSensor(hass)])


class LcarsVersionSensor(SensorEntity):
    """LCARS Dashboard installed version sensor — no external calls."""

    def __init__(self, hass):
        """Initialize the sensor."""
        self._hass = hass
        self._state = VERSION

    @property
    def unique_id(self):
        """Return a unique ID to use for this sensor."""
        return "lcars-dashboard-version"

    @property
    def name(self):
        """Return the name of the sensor."""
        return "LCARS Dashboard Version"

    @property
    def icon(self):
        """Return the icon of the sensor."""
        return "mdi:star-four-points"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return extra attributes."""
        return {"installed_version": VERSION}

    async def async_update(self):
        """Version is static — no external call needed."""
        self._state = VERSION