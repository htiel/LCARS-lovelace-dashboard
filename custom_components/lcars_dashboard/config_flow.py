import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlowWithConfigEntry
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_DASHBOARDS,
    DASHBOARD_REGISTRY,
    DEFAULT_DASHBOARDS,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

# Multi-select choices: key → display label
DASHBOARD_CHOICES = {
    key: meta["default_title"] for key, meta in DASHBOARD_REGISTRY.items()
}


@config_entries.HANDLERS.register("lcars_dashboard")
class LcarsDashboardConfigFlow(ConfigFlow):
    """Handle first-time setup. Single instance only."""

    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(
            title="LCARS Dashboard",
            data={},
            options={CONF_DASHBOARDS: DEFAULT_DASHBOARDS},
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return LcarsDashboardOptionsFlow(config_entry)


class LcarsDashboardOptionsFlow(OptionsFlowWithConfigEntry):
    """Two-step options: select dashboards → configure titles/icons."""

    async def async_step_init(self, user_input=None):
        """Step 1: Select which dashboards to enable."""
        if user_input is not None:
            self._selected = user_input[CONF_DASHBOARDS]
            if not self._selected:
                return self.async_show_form(
                    step_id="init",
                    data_schema=self._init_schema(),
                    errors={"base": "no_dashboards_selected"},
                )
            return await self.async_step_dashboard_config()

        self._selected = list(
            self.config_entry.options.get(CONF_DASHBOARDS, DEFAULT_DASHBOARDS)
        )
        return self.async_show_form(
            step_id="init",
            data_schema=self._init_schema(),
        )

    def _init_schema(self):
        return vol.Schema(
            {
                vol.Required(
                    CONF_DASHBOARDS,
                    default=self._selected,
                ): cv.multi_select(DASHBOARD_CHOICES),
            }
        )

    async def async_step_dashboard_config(self, user_input=None):
        """Step 2: Set title + icon for each enabled dashboard."""
        if user_input is not None:
            result = {CONF_DASHBOARDS: self._selected}
            for key in self._selected:
                result[f"{key}_title"] = user_input.get(
                    f"{key}_title",
                    DASHBOARD_REGISTRY[key]["default_title"],
                )
                result[f"{key}_icon"] = user_input.get(
                    f"{key}_icon",
                    DASHBOARD_REGISTRY[key]["default_icon"],
                )
            return self.async_create_entry(data=result)

        # Build dynamic schema for enabled dashboards only
        schema_dict = {}
        existing = self.config_entry.options
        for key in self._selected:
            meta = DASHBOARD_REGISTRY[key]
            schema_dict[
                vol.Optional(
                    f"{key}_title",
                    default=existing.get(f"{key}_title", meta["default_title"]),
                )
            ] = str
            schema_dict[
                vol.Optional(
                    f"{key}_icon",
                    default=existing.get(f"{key}_icon", meta["default_icon"]),
                )
            ] = str

        return self.async_show_form(
            step_id="dashboard_config",
            data_schema=vol.Schema(schema_dict),
        )
