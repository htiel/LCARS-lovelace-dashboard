import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlowWithConfigEntry
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_DASHBOARDS,
    CONF_DASHBOARD_ORDER,
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
    """Three-step options: select dashboards → configure titles/icons → set sidebar order."""

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
            self._config_input = user_input
            return await self.async_step_dashboard_order()

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

    async def async_step_dashboard_order(self, user_input=None):
        """Step 3: Set sidebar display order for enabled dashboards."""
        if user_input is not None:
            # Collect ordered keys from position selects
            ordered = []
            for i in range(1, len(self._selected) + 1):
                key = user_input.get(f"position_{i}")
                if key and key not in ordered:
                    ordered.append(key)
            # Add any missing (shouldn't happen, but safety)
            for key in self._selected:
                if key not in ordered:
                    ordered.append(key)

            # Build final result
            result = {
                CONF_DASHBOARDS: self._selected,
                CONF_DASHBOARD_ORDER: ordered,
            }
            for key in self._selected:
                result[f"{key}_title"] = self._config_input.get(
                    f"{key}_title",
                    DASHBOARD_REGISTRY[key]["default_title"],
                )
                result[f"{key}_icon"] = self._config_input.get(
                    f"{key}_icon",
                    DASHBOARD_REGISTRY[key]["default_icon"],
                )
            return self.async_create_entry(data=result)

        # Build position select schema
        existing_order = list(
            self.config_entry.options.get(CONF_DASHBOARD_ORDER, self._selected)
        )
        # Filter to only enabled dashboards, preserving saved order
        current_order = [k for k in existing_order if k in self._selected]
        # Add any newly enabled dashboards at the end
        for k in self._selected:
            if k not in current_order:
                current_order.append(k)

        # Build choices: key → display title (use config_input titles if set)
        choices = {}
        for key in self._selected:
            title = self._config_input.get(
                f"{key}_title",
                DASHBOARD_REGISTRY[key]["default_title"],
            )
            choices[key] = title

        schema_dict = {}
        for i, key in enumerate(current_order, 1):
            schema_dict[
                vol.Required(f"position_{i}", default=key)
            ] = vol.In(choices)

        return self.async_show_form(
            step_id="dashboard_order",
            data_schema=vol.Schema(schema_dict),
        )
