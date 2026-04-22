import logging
import yaml
import json
import os
import shutil
import re

from .load_plugins import load_plugins
from .load_dashboard import load_dashboard
from .const import DOMAIN, VERSION
from .process_yaml import process_yaml, reload_configuration
from .notifications import notifications
from datetime import datetime

import voluptuous as vol
from homeassistant.core import HomeAssistant, callback
from homeassistant.config import ConfigType
from homeassistant.components import frontend, websocket_api
from homeassistant.util import slugify
from homeassistant.const import Platform

from collections import OrderedDict
from typing import Any, Mapping, MutableMapping, Optional

from yaml.representer import Representer
import collections
import asyncio

_LOGGER = logging.getLogger(__name__)


# ─── Security: Path component validation ───
def _validate_path_component(value):
    """Reject path traversal or separator characters in user-supplied path segments."""
    if not value or not re.match(r'^[a-zA-Z0-9_\-\.]+$', str(value)):
        raise vol.Invalid(f"Invalid path component: {value!r}")
    if '..' in str(value):
        raise vol.Invalid(f"Path traversal detected: {value!r}")
    return str(value)


def _safe_path(base_dir, *parts):
    """Ensure resolved path stays within base_dir."""
    full = os.path.realpath(os.path.join(base_dir, *parts))
    if not full.startswith(os.path.realpath(base_dir) + os.sep) and full != os.path.realpath(base_dir):
        raise ValueError(f"Path traversal blocked: {os.path.join(*parts)}")
    return full


# ─── Security: Allowlisted config keys ───
ALLOWED_BOOL_KEYS = frozenset({"disabled", "hidden", "favorite", "hide_in_sidebar", "show_on_homepage"})
ALLOWED_SORT_TYPES = frozenset({"sort_order", "sort_order_floor"})


# ─── H4: Per-file YAML lock to prevent concurrent read-modify-write races ───
_yaml_locks = {}

def _get_yaml_lock(rel_path):
    """Get or create an asyncio.Lock for a given YAML file path."""
    if rel_path not in _yaml_locks:
        _yaml_locks[rel_path] = asyncio.Lock()
    return _yaml_locks[rel_path]


# ─── JSON parse helper (C2: guard all json.loads calls) ───
def _safe_json_loads(connection, msg_id, raw, label="data"):
    """Parse JSON string, send error result and return None on failure."""
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        _LOGGER.warning("Invalid JSON in %s: %s", label, e)
        connection.send_result(msg_id, {"error": f"Invalid JSON in {label}"})
        return None


# ─── File I/O helpers (proper handle management) ───
async def _read_yaml_file(hass, rel_path):
    """Read a YAML config file safely with proper file handle management."""
    full = hass.config.path(rel_path)
    def _read():
        if not os.path.exists(full):
            _LOGGER.debug("YAML file not found, returning empty: %s", rel_path)
            return OrderedDict()
        _LOGGER.debug("Reading YAML: %s", rel_path)
        with open(full, "r", encoding="utf-8") as f:
            result = yaml.safe_load(f) or OrderedDict()
        _LOGGER.debug("Loaded YAML %s: %d keys", rel_path, len(result) if isinstance(result, dict) else 0)
        return result
    return await hass.async_add_executor_job(_read)


async def _write_yaml_file(hass, rel_path, data):
    """Write a dict to a YAML config file, creating dirs as needed."""
    full = hass.config.path(rel_path)
    def _write():
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
        _LOGGER.debug("Wrote YAML: %s", rel_path)
    await hass.async_add_executor_job(_write)


async def _load_card_dir_nested(hass, rel_path):
    """Load YAML card files from a two-level directory (subdir/file.yaml)."""
    result = {}
    full = hass.config.path(rel_path)
    if not await hass.async_add_executor_job(os.path.isdir, full):
        return result
    subdirs = await hass.async_add_executor_job(os.listdir, full)
    for subdir in subdirs:
        subdir_path = os.path.join(full, subdir)
        if not await hass.async_add_executor_job(os.path.isdir, subdir_path):
            continue
        result[subdir] = {}
        fnames = sorted(await hass.async_add_executor_job(os.listdir, subdir_path))
        for fname in fnames:
            if fname.endswith('.yaml'):
                try:
                    content = await _read_yaml_file(hass, f"{rel_path}/{subdir}/{fname}")
                    result[subdir][fname] = content
                except Exception as err:
                    _LOGGER.warning("Failed to load %s/%s/%s: %s", rel_path, subdir, fname, err)
    return result


async def _load_card_dir_flat(hass, rel_path):
    """Load YAML card files from a single-level directory (file.yaml → key without extension)."""
    result = {}
    full = hass.config.path(rel_path)
    if not await hass.async_add_executor_job(os.path.isdir, full):
        return result
    fnames = await hass.async_add_executor_job(os.listdir, full)
    for fname in fnames:
        if fname.endswith('.yaml'):
            try:
                content = await _read_yaml_file(hass, f"{rel_path}/{fname}")
                result[fname.replace(".yaml", "")] = content
            except Exception as err:
                _LOGGER.warning("Failed to load %s/%s: %s", rel_path, fname, err)
    return result

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    _LOGGER.info("LCARS Dashboard v%s starting setup", VERSION)
    _LOGGER.debug("Python %s, HA %s", __import__('sys').version.split()[0], hass.config.version if hasattr(hass.config, 'version') else 'unknown')

    hass.data[DOMAIN] = {
        "notifications": {},
        "commands": {},
        'latest_version': "",
        "areas": OrderedDict(),
        "entities": OrderedDict(),
        "devices": OrderedDict(),
        "homepage_header": OrderedDict(),
    }

    _LOGGER.debug("Registering %d websocket commands", 28)
    websocket_api.async_register_command(hass, websocket_get_configuration)
    websocket_api.async_register_command(hass, websocket_get_blueprints)

    websocket_api.async_register_command(hass, ws_handle_install_blueprint)
    websocket_api.async_register_command(hass, ws_handle_delete_blueprint)

    websocket_api.async_register_command(hass, ws_handle_add_card)
    websocket_api.async_register_command(hass, ws_handle_remove_card)

    websocket_api.async_register_command(hass, ws_handle_edit_entity)
    websocket_api.async_register_command(hass, ws_handle_edit_entity_card)
    websocket_api.async_register_command(hass, ws_handle_edit_entity_popup)
    websocket_api.async_register_command(hass, ws_handle_edit_entity_favorite)
    websocket_api.async_register_command(hass, ws_handle_edit_entity_bool_value)
    websocket_api.async_register_command(hass, ws_handle_edit_entities_bool_value)
    websocket_api.async_register_command(hass, ws_handle_edit_device_button)
    websocket_api.async_register_command(hass, ws_handle_edit_device_card)
    websocket_api.async_register_command(hass, ws_handle_edit_device_popup)
    websocket_api.async_register_command(hass, ws_handle_edit_device_bool_value)
    websocket_api.async_register_command(hass, ws_handle_remove_device_card)
    websocket_api.async_register_command(hass, ws_handle_remove_device_popup)
    websocket_api.async_register_command(hass, ws_handle_remove_entity_card)
    websocket_api.async_register_command(hass, ws_handle_remove_entity_popup)

    websocket_api.async_register_command(hass, ws_handle_edit_area_button)
    websocket_api.async_register_command(hass, ws_handle_edit_area_bool_value)

    websocket_api.async_register_command(hass, ws_handle_edit_homepage_header)

    websocket_api.async_register_command(hass, ws_handle_edit_more_page_button)
    websocket_api.async_register_command(hass, ws_handle_edit_more_page)
    websocket_api.async_register_command(hass, ws_handle_remove_more_page)
    websocket_api.async_register_command(hass, ws_handle_add_more_page_to_navbar)

    websocket_api.async_register_command(hass, ws_handle_sort_area_button)
    websocket_api.async_register_command(hass, ws_handle_sort_device_button)
    websocket_api.async_register_command(hass, ws_handle_sort_entity)
    websocket_api.async_register_command(hass, ws_handle_sort_more_page)

    websocket_api.async_register_command(hass, ws_handle_panel_order_get)
    websocket_api.async_register_command(hass, ws_handle_panel_order_set)
    websocket_api.async_register_command(hass, ws_handle_panel_column_get)
    websocket_api.async_register_command(hass, ws_handle_panel_column_set)

    await load_plugins(hass, DOMAIN)

    notifications(hass, DOMAIN)

    _LOGGER.info("LCARS Dashboard v%s setup complete — %d WS commands registered", VERSION, 28)
    
    return True

yaml.add_representer(collections.OrderedDict, Representer.represent_dict)

@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): "lcars_dashboard/configuration/get"})
async def websocket_get_configuration(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Mapping[str, Any],
) -> None:
    """Return dashboard configuration. Gracefully handles missing/stale config files."""

    _LOGGER.debug("configuration/get requested")

    try:
        # Load config files with proper file handle management
        hass.data[DOMAIN]["areas"] = await _read_yaml_file(hass, "lcars-dashboard/configs/areas.yaml")
        hass.data[DOMAIN]["entities"] = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")
        hass.data[DOMAIN]["devices"] = await _read_yaml_file(hass, "lcars-dashboard/configs/devices.yaml")
        hass.data[DOMAIN]["homepage_header"] = await _read_yaml_file(hass, "lcars-dashboard/configs/settings.yaml")
        panel_overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_overrides.yaml")
        panel_column_overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_column_overrides.yaml")

        area_cards = await _load_card_dir_nested(hass, "lcars-dashboard/configs/cards/areas")
        device_cards = await _load_card_dir_nested(hass, "lcars-dashboard/configs/cards/devices")
        entity_cards = await _load_card_dir_flat(hass, "lcars-dashboard/configs/cards/entities")
        entities_popup = await _load_card_dir_flat(hass, "lcars-dashboard/configs/cards/entities_popup")
        devices_card = await _load_card_dir_flat(hass, "lcars-dashboard/configs/cards/devices_card")
        devices_popup = await _load_card_dir_flat(hass, "lcars-dashboard/configs/cards/devices_popup")

        more_pages = {}
        if await hass.async_add_executor_job(os.path.isdir, hass.config.path("lcars-dashboard/configs/more_pages")):
            subdirs = await hass.async_add_executor_job(os.listdir, hass.config.path("lcars-dashboard/configs/more_pages"))
            for subdir in subdirs:
                # WORF-SEC-008: Validate subdirectory names
                try:
                    _validate_path_component(subdir)
                except vol.Invalid:
                    _LOGGER.warning("Skipping invalid more_pages dirname: %r", subdir)
                    continue
                page_path = hass.config.path(f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml")
                config_path = f"lcars-dashboard/configs/more_pages/{subdir}/config.yaml"
                if await hass.async_add_executor_job(os.path.exists, page_path):
                    content = await _read_yaml_file(hass, config_path)
                    if content:
                        more_pages[subdir] = content

        _LOGGER.debug(
            "configuration/get complete: %d areas, %d entities, %d devices, %d area_cards, %d more_pages",
            len(hass.data[DOMAIN]["areas"]) if isinstance(hass.data[DOMAIN]["areas"], dict) else 0,
            len(hass.data[DOMAIN]["entities"]) if isinstance(hass.data[DOMAIN]["entities"], dict) else 0,
            len(hass.data[DOMAIN]["devices"]) if isinstance(hass.data[DOMAIN]["devices"], dict) else 0,
            len(area_cards),
            len(more_pages),
        )

        connection.send_result(
            msg["id"],
            {
                "areas": hass.data[DOMAIN]["areas"],
                "area_cards": area_cards,
                "device_cards": device_cards,
                "entity_cards": entity_cards,
                "entities_popup": entities_popup,
                "entities": hass.data[DOMAIN]["entities"],
                "devices": hass.data[DOMAIN]["devices"],
                "homepage_header": hass.data[DOMAIN]["homepage_header"],
                "more_pages": more_pages,
                "installed_version": VERSION,
                "devices_card": devices_card,
                "devices_popup": devices_popup,
                "panel_overrides": panel_overrides,
                "panel_column_overrides": panel_column_overrides if isinstance(panel_column_overrides, dict) else {},
                "debug": logging.getLogger("custom_components.lcars_dashboard").getEffectiveLevel() <= logging.DEBUG,
            }
        )
    except Exception as err:
        _LOGGER.error("LCARS configuration/get failed: %s", err, exc_info=True)
        # Always send a result so the frontend doesn't hang
        connection.send_result(
            msg["id"],
            {
                "areas": OrderedDict(),
                "area_cards": {},
                "device_cards": {},
                "entity_cards": {},
                "entities_popup": {},
                "entities": OrderedDict(),
                "devices": OrderedDict(),
                "homepage_header": OrderedDict(),
                "more_pages": {},
                "installed_version": VERSION,
                "devices_card": {},
                "devices_popup": {},
                "panel_overrides": {},
                "panel_column_overrides": {},
                "debug": logging.getLogger("custom_components.lcars_dashboard").getEffectiveLevel() <= logging.DEBUG,
            }
        )


#get_blueprints
#at callback -> websocket_api.async_response
@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): "lcars_dashboard/get_blueprints"})
async def websocket_get_blueprints(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Mapping[str, Any],
) -> None:
    """Return a list of installed blueprints asynchronously."""

    _LOGGER.debug("get_blueprints requested")
    blueprints = {}

    blueprints_dir = hass.config.path("lcars-dashboard/blueprints")

    if await hass.async_add_executor_job(os.path.isdir, blueprints_dir):
        file_list = await hass.async_add_executor_job(os.listdir, blueprints_dir)

        for fname in file_list:
            if fname.endswith(".yaml"):
                try:
                    content = await _read_yaml_file(hass, f"lcars-dashboard/blueprints/{fname}")
                    if content:
                        blueprints[fname] = content
                except Exception as e:
                    _LOGGER.error("Error loading blueprint %s: %s", fname, e)

    connection.send_result(
        msg["id"],
        {
            "blueprints": blueprints,
        }
    )


#install_blueprint
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/install_blueprint",
        vol.Required("yamlCode"): str,
    }
)
@websocket_api.async_response
async def ws_handle_install_blueprint(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle save new blueprint."""

    _LOGGER.debug("install_blueprint called")

    # WORF-SEC-007: Size limit — reject payloads over 256 KB
    raw_yaml = msg["yamlCode"]
    if len(raw_yaml) > 262144:
        _LOGGER.warning("Blueprint payload too large: %d bytes", len(raw_yaml))
        connection.send_result(msg["id"], {"error": "Blueprint payload exceeds 256 KB limit"})
        return

    filecontent = yaml.safe_load(raw_yaml)

    if not filecontent.get("blueprint"):
        _LOGGER.warning('no blueprint data')
        connection.send_result(
            msg["id"],
            {
                "error": "Blueprint has invalid data"
            },
        )
        return

    if not filecontent.get("card"):
        _LOGGER.warning('no card')
        connection.send_result(
            msg["id"],
            {
                "error": "Blueprint has no card"
            },
        )
        return

    # WORF-SEC-007: Validate blueprint name is a non-empty string
    bp_name = filecontent.get("blueprint", {}).get("name")
    if not bp_name or not isinstance(bp_name, str) or not bp_name.strip():
        connection.send_result(msg["id"], {"error": "Blueprint name is required and must be a string"})
        return

    filename = slugify(bp_name)+".yaml"

    if filecontent.get("button_card_templates"):
        await _write_yaml_file(hass, f"lcars-dashboard/button_card_templates/blueprints/{filename}", filecontent.get("button_card_templates"))
        filecontent.pop("button_card_templates")

    if filecontent.get("apexcharts_card_templates"):
        await _write_yaml_file(hass, f"lcars-dashboard/apexcharts_card_templates/blueprints/{filename}", filecontent.get("apexcharts_card_templates"))
        filecontent.pop("apexcharts_card_templates")

    await _write_yaml_file(hass, f"lcars-dashboard/blueprints/{filename}", filecontent)

    connection.send_result(
        msg["id"],
        {
            "succesfull": filename
        },
    )




#delete_blueprint
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/delete_blueprint",
        vol.Required("blueprint"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_delete_blueprint(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle delete blueprint."""

    _LOGGER.debug("delete_blueprint called: %s", msg.get("blueprint"))
    
    filename = _safe_path(hass.config.path("lcars-dashboard"), "blueprints", msg["blueprint"])

    def _delete():
        if os.path.exists(filename):
            os.remove(filename)
    await hass.async_add_executor_job(_delete)
    
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Blueprint deleted succesfull"
        },
    )



#edit_area_button
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_area_button",
        vol.Optional("icon"): str,
        vol.Optional("areaId"): str,
        vol.Optional("floor"): str,
        vol.Optional("disableArea"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_area_button(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving editing area button."""

    _LOGGER.debug("edit_area_button called: areaId=%s", msg.get("areaId"))

    if(msg["areaId"]):

        areas = await _read_yaml_file(hass, "lcars-dashboard/configs/areas.yaml")

        area = areas.get(msg["areaId"])

        if not area:
            areas[msg["areaId"]] = OrderedDict()

        areas[msg["areaId"]].update({
            "icon": msg["icon"],
            "floor": msg["floor"],
            "disabled": msg["disableArea"],
        })

        await _write_yaml_file(hass, "lcars-dashboard/configs/areas.yaml", areas)

        
    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Area button saved"
        },
    )


 
#edit_area_bool_value
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_area_bool_value",
        vol.Required("areaId"): str,
        vol.Optional("key"): vol.In(ALLOWED_BOOL_KEYS),
        vol.Optional("value"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_area_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit area bool value command."""

    areas = await _read_yaml_file(hass, "lcars-dashboard/configs/areas.yaml")

    area = areas.get(msg["areaId"])

    if not area:
        areas[msg["areaId"]] = OrderedDict()

    areas[msg["areaId"]].update({
            msg["key"]: msg["value"]
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/areas.yaml", areas)


    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Area bool value set succesfully"
        },
    )




#edit_homepage_header
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_homepage_header",
        vol.Optional("disableClock"): bool,
        vol.Optional("amPmClock"): bool,
        vol.Optional("disableWelcomeMessage"): bool,
        vol.Optional("v2Mode"): bool,
        vol.Optional("disableSensorGraph"): bool,
        vol.Optional("weatherEntity"): str,
        vol.Optional("invertCover"): bool,
        vol.Optional("alarmEntity"): str,

    }
)
@websocket_api.async_response
async def ws_handle_edit_homepage_header(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving editing homepage header."""
    
    homepage_header = await _read_yaml_file(hass, "lcars-dashboard/configs/settings.yaml")

    homepage_header.update({
        "disable_clock": msg["disableClock"],
        "am_pm_clock": msg["amPmClock"],
        "disable_welcome_message": msg["disableWelcomeMessage"],
        "v2_mode": msg["v2Mode"],
        "disable_sensor_graph": msg["disableSensorGraph"],
        "invert_cover": msg["invertCover"],
        "weather_entity": msg["weatherEntity"],
        "alarm_entity": msg["alarmEntity"],
    })

    await _write_yaml_file(hass, "lcars-dashboard/configs/settings.yaml", homepage_header)

    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Homepage header saved"
        },
    )


#edit_device_button
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_device_button",
        vol.Optional("icon"): str,
        vol.Optional("device"): str,
        vol.Optional("showInNavbar"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_device_button(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving editing area button."""
    
    if(msg["device"]):
        devices = await _read_yaml_file(hass, "lcars-dashboard/configs/devices.yaml")

        device = devices.get(msg["device"])

        if not device:
            devices[msg["device"]] = OrderedDict()

        devices[msg["device"]].update({
            "icon": msg["icon"],
            "show_in_navbar": msg["showInNavbar"],
        })

        await _write_yaml_file(hass, "lcars-dashboard/configs/devices.yaml", devices)

    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")
    hass.bus.async_fire("lcars_dashboard_navigation_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device button saved"
        },
    )




#edit_device_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_device_card",
        vol.Required("cardData"): str,
        vol.Required("domain"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_edit_device_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving device card."""

    _LOGGER.debug("edit_device_card called: domain=%s", msg.get("domain"))

    filecontent = _safe_json_loads(connection, msg["id"], msg["cardData"], "cardData")
    if filecontent is None: return

    path = "lcars-dashboard/configs/cards/devices_card/"
    filename = hass.config.path(path+"/"+msg['domain']+".yaml")


    #ff = open(filename, 'w+')
    def _write_card():

        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, "w", encoding="utf-8") as ff:

            yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

    await hass.async_add_executor_job(_write_card)
    
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device card saved"
        },
    )



#remove_device_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_device_card",
        vol.Required("domain"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_remove_device_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove domain card command."""

    path = "lcars-dashboard/configs/cards/devices_card"
    filename = hass.config.path(path+"/"+msg["domain"]+".yaml")

    await hass.async_add_executor_job(lambda: os.remove(filename) if os.path.exists(filename) else None)

    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")
    
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity card removed succesfully"
        },
    )


#edit_device_popup
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_device_popup",
        vol.Required("cardData"): str,
        vol.Required("domain"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_edit_device_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving device popup."""

    _LOGGER.debug("edit_device_popup called: domain=%s", msg.get("domain"))

    filecontent = _safe_json_loads(connection, msg["id"], msg["cardData"], "cardData")
    if filecontent is None: return

    path = "lcars-dashboard/configs/cards/devices_popup/"
    filename = hass.config.path(path+"/"+msg['domain']+".yaml")


    #ff = open(filename, 'w+')
    def _write_card():

        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, "w", encoding="utf-8") as ff:

            yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

    await hass.async_add_executor_job(_write_card)
    
    hass.bus.async_fire("lcars_dashboard_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device popup saved"
        },
    )



#remove_device_popup
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_device_popup",
        vol.Required("domain"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_remove_device_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove domain popup command."""

    path = "lcars-dashboard/configs/cards/devices_popup"
    filename = hass.config.path(path+"/"+msg["domain"]+".yaml")

    await hass.async_add_executor_job(lambda: os.remove(filename) if os.path.exists(filename) else None)

    hass.bus.async_fire("lcars_dashboard_reload")
    
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device popup removed succesfully"
        },
    )



#remove_entity_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_entity_card",
        vol.Required("entityId"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_remove_entity_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove entity card command."""

    path = "lcars-dashboard/configs/cards/entities"
    filename = hass.config.path(path+"/"+msg["entityId"]+".yaml")

    await hass.async_add_executor_job(lambda: os.remove(filename) if os.path.exists(filename) else None)

    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")
    
    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity card removed succesfully"
        },
    )


#remove_entity_popup
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_entity_popup",
        vol.Required("entityId"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_remove_entity_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove entity card command."""

    path = "lcars-dashboard/configs/cards/entities_popup"
    filename = hass.config.path(path+"/"+msg["entityId"]+".yaml")

    await hass.async_add_executor_job(lambda: os.remove(filename) if os.path.exists(filename) else None)

    hass.bus.async_fire("lcars_dashboard_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity card removed succesfully"
        },
    )



#edit_entity
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entity",
        vol.Required("entity"): str,
        vol.Optional("friendlyName"): str,
        vol.Optional("disableEntity"): bool,
        vol.Optional("hideEntity"): bool,
        vol.Optional("excludeEntity"): bool,
        vol.Optional("rowSpan"): str,
        vol.Optional("colSpan"): str,
        vol.Optional("rowSpanLg"): str,
        vol.Optional("colSpanLg"): str,
        vol.Optional("rowSpanXl"): str,
        vol.Optional("colSpanXl"): str,
        vol.Optional("customCard"): bool,
        vol.Optional("customPopup"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entity(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving editing entity."""

    _LOGGER.debug("edit_entity called: entity=%s", msg.get("entity"))

    async with _get_yaml_lock("lcars-dashboard/configs/entities.yaml"):
        entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

        entity = entities.get(msg["entity"])

        if not entity:
            entities[msg["entity"]] = OrderedDict()

        entities[msg["entity"]].update({
                "hidden": msg["hideEntity"],
                "excluded": msg["excludeEntity"],
                "disabled": msg["disableEntity"],
                "friendly_name": msg["friendlyName"],
                "col_span": msg["colSpan"],
                "row_span": msg["rowSpan"],
                "col_span_lg": msg["colSpanLg"],
                "row_span_lg": msg["rowSpanLg"],
                "col_span_xl": msg["colSpanXl"],
                "row_span_xl": msg["rowSpanXl"],
                "custom_card": msg["customCard"],
                "custom_popup": msg["customPopup"],
            })

        await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)


    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity saved"
        },
    )



#edit_entity_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entity_card",
        vol.Required("cardData"): str,
        vol.Required("entityId"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entity_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit entity card command."""

    filecontent = _safe_json_loads(connection, msg["id"], msg["cardData"], "cardData")
    if filecontent is None: return

    path = "lcars-dashboard/configs/cards/entities/"
    filename = hass.config.path(path+"/"+msg['entityId']+".yaml")


    #ff = open(filename, 'w+')
    def _write_card():

        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, "w", encoding="utf-8") as ff:

            yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

    await hass.async_add_executor_job(_write_card)

    #Enable use custom card for the entity settings by default
    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    entity = entities.get(msg["entityId"])

    if not entity:
        entities[msg["entityId"]] = OrderedDict()

    entities[msg["entityId"]].update({
            "custom_card": True,
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)

    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Card added succesfully"
        },
    )


#edit_entity_popup
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entity_popup",
        vol.Required("cardData"): str,
        vol.Required("entityId"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entity_popup(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit entity popup command."""

    filecontent = _safe_json_loads(connection, msg["id"], msg["cardData"], "cardData")
    if filecontent is None: return

    path = "lcars-dashboard/configs/cards/entities_popup/"
    filename = hass.config.path(path+"/"+msg['entityId']+".yaml")


    #ff = open(filename, 'w+')
    def _write_card():

        os.makedirs(os.path.dirname(filename), exist_ok=True)

        with open(filename, "w", encoding="utf-8") as ff:

            yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

    await hass.async_add_executor_job(_write_card)

    #Enable use custom card for the entity settings by default
    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    entity = entities.get(msg["entityId"])

    if not entity:
        entities[msg["entityId"]] = OrderedDict()

    entities[msg["entityId"]].update({
            "custom_popup": True,
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)

    hass.bus.async_fire("lcars_dashboard_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Popup added succesfully"
        },
    )



#edit_entity_favorite
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entity_favorite",
        vol.Required("entityId"): _validate_path_component,
        vol.Optional("favorite"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entity_favorite(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit entity favorite command."""

    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    entity = entities.get(msg["entityId"])

    if not entity:
        entities[msg["entityId"]] = OrderedDict()

    entities[msg["entityId"]].update({
            "favorite": msg["favorite"]
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)


    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Popup added succesfully"
        },
    )

 
#edit_entity_bool_value
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entity_bool_value",
        vol.Required("entityId"): _validate_path_component,
        vol.Optional("key"): vol.In(ALLOWED_BOOL_KEYS),
        vol.Optional("value"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entity_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit entity bool value command."""

    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    entity = entities.get(msg["entityId"])

    if not entity:
        entities[msg["entityId"]] = OrderedDict()

    entities[msg["entityId"]].update({
            msg["key"]: msg["value"]
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)


    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity bool value set succesfully"
        },
    )



#edit_entities_bool_value
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_entities_bool_value",
        vol.Required("entities"): str,
        vol.Optional("key"): vol.In(ALLOWED_BOOL_KEYS),
        vol.Optional("value"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_entities_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit entities bool value command."""

    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    entitiesInput = _safe_json_loads(connection, msg["id"], msg["entities"], "entities")
    if entitiesInput is None: return
    if not isinstance(entitiesInput, list):
        connection.send_result(msg["id"], {"error": "Expected a JSON array of entity IDs"})
        return

    _LOGGER.debug("edit_entity_bool_value entities input: %s", entitiesInput)

    for num, entityId in enumerate(entitiesInput, start=1):
        entity = entities.get(entityId)

        if not entity:
            entities[entityId] = OrderedDict()

        entities[entityId].update({
            msg["key"]: msg["value"]
        })

    _LOGGER.debug("edit_entity_bool_value entities result: %s", entities)

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)

    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entities bool value set succesfully"
        },
    )

#add_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/add_card",
        vol.Optional("card_data"): str,
        vol.Optional("area_id"): _validate_path_component,
        vol.Optional("domain"): _validate_path_component,
        vol.Optional("position"): str,
        vol.Optional("filename"): _validate_path_component,
        vol.Optional("page"): str,
        vol.Optional("rowSpan"): str,
        vol.Optional("colSpan"): str,
        vol.Optional("rowSpanLg"): str,
        vol.Optional("colSpanLg"): str,
        vol.Optional("rowSpanXl"): str,
        vol.Optional("colSpanXl"): str,

    }
)
@websocket_api.async_response
async def ws_handle_add_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle add new card command."""

    _LOGGER.debug("add_card called: page=%s, area_id=%s, domain=%s", msg.get("page"), msg.get("area_id"), msg.get("domain"))

    card_parsed = _safe_json_loads(connection, msg["id"], msg.get("card_data", ""), "card_data")
    if card_parsed is None: return

    if not msg["filename"]:
        type = card_parsed.get('type')
    else:
        type = msg["filename"]

    if type:
        filecontent = card_parsed

        #filecontent.update({"position": msg["position"]})
        filecontent["col_span"] = msg["colSpan"]
        filecontent["row_span"] = msg["rowSpan"]
        filecontent["col_span_lg"] = msg["colSpanLg"]
        filecontent["row_span_lg"] = msg["rowSpanLg"]
        filecontent["col_span_xl"] = msg["colSpanXl"]
        filecontent["row_span_xl"] = msg["rowSpanXl"]
        filecontent['position'] = msg["position"]

        if(msg["page"] == 'areas'):
            path = "lcars-dashboard/configs/cards/areas/"+msg['area_id']
        elif(msg["page"] == 'devices'):
            path = "lcars-dashboard/configs/cards/devices/"+msg['domain']
        filename = hass.config.path(path+"/"+type+".yaml")

        def _write_card():
            nonlocal filename
            os.makedirs(os.path.dirname(filename), exist_ok=True)

            if not msg["filename"]:
                if os.path.exists(filename) and os.stat(filename).st_size != 0:
                    filename = hass.config.path(path+"/"+type+datetime.now().strftime("%Y%m%d%H%M%S")+".yaml")
                    os.makedirs(os.path.dirname(filename), exist_ok=True)

            with open(filename, "w", encoding="utf-8") as ff:
                yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

        await hass.async_add_executor_job(_write_card)

        hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
        hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

        connection.send_result(
            msg["id"],
            {
                "succesfull": "card added succesfully"
            },
        )

#remove_card
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_card",
        vol.Optional("area_id"): _validate_path_component,
        vol.Optional("domain"): _validate_path_component,
        vol.Optional("filename"): _validate_path_component,
        vol.Optional("page"): str,
    }
)
@websocket_api.async_response
async def ws_handle_remove_card(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove card command."""

    _LOGGER.debug("remove_card called: filename=%s, page=%s", msg.get("filename"), msg.get("page"))

    if(msg["domain"]):
        path = "lcars-dashboard/configs/cards/devices/"+msg['domain']
    else:
        path = "lcars-dashboard/configs/cards/areas/"+msg['area_id']

    filename = hass.config.path(path+"/"+msg["filename"]+".yaml")

    await hass.async_add_executor_job(lambda: os.remove(filename) if os.path.exists(filename) else None)

    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")
    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "card removed succesfully"
        },
    )


#edit_more_page_button
#NOT USED
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_more_page_button",
        vol.Optional("more_page"): _validate_path_component,
        vol.Optional("name"): str,
        vol.Optional("icon"): str,
        vol.Optional("showInNavbar"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_more_page_button(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle saving editing more page button."""

    if (msg["more_page"]):
        config_rel_path = f"lcars-dashboard/configs/more_pages/{msg['more_page']}/config.yaml"

        configFile = await _read_yaml_file(hass, config_rel_path)

        configFile.update({
            "name": msg["name"],
            "icon": msg["icon"],
            "show_in_navbar": msg["showInNavbar"],
        })

        await _write_yaml_file(hass, config_rel_path, configFile)

    # Trigger a reload event after saving
    hass.bus.async_fire("lcars_dashboard_homepage_card_reload")

    # Send the response back to the connection
    connection.send_result(
        msg["id"],
        {
            "succesfull": "More page button saved"
        },
    )


#edit_more_page
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_more_page",
        vol.Optional("card_data"): str,
        vol.Optional("foldername"): _validate_path_component,
        vol.Optional("name"): str,
        vol.Optional("icon"): str,
        vol.Optional("showInNavbar"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_more_page(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit more page command."""
    
    if not msg["foldername"]:
        more_page_folder = slugify(msg["name"])
    else:
        more_page_folder = msg["foldername"]

    filecontent = _safe_json_loads(connection, msg["id"], msg.get("card_data", ""), "card_data")
    if filecontent is None: return

    path_to_more_page = hass.config.path("lcars-dashboard/configs/more_pages/"+more_page_folder+"/page.yaml")

    def _write_card():
        nonlocal path_to_more_page, more_page_folder
        os.makedirs(os.path.dirname(path_to_more_page), exist_ok=True)

        if not msg["foldername"]:
            if os.path.exists(path_to_more_page) and os.stat(path_to_more_page).st_size != 0:
                more_page_folder = more_page_folder+datetime.now().strftime("%Y%m%d%H%M%S")
                path_to_more_page = hass.config.path("lcars-dashboard/configs/more_pages/"+more_page_folder+"/page.yaml")
                os.makedirs(os.path.dirname(path_to_more_page), exist_ok=True)

        with open(path_to_more_page, "w", encoding="utf-8") as ff:
            yaml.dump(filecontent, ff, default_flow_style=False, sort_keys=False)

    await hass.async_add_executor_job(_write_card)

    # Prepare config.yaml content
    configFile = OrderedDict()
    configFile.update({
        "name": msg["name"],
        "icon": msg["icon"],
        "show_in_navbar": msg["showInNavbar"],
    })

    await _write_yaml_file(hass, f"lcars-dashboard/configs/more_pages/{more_page_folder}/config.yaml", configFile)
    #end config.yaml

    # Call reload config to rebuild the yaml for pages too
    hass.bus.async_fire("lcars_dashboard_reload")
    hass.bus.async_fire("lcars_dashboard_navigation_card_reload")

    #hass.services.call(DOMAIN, "reload")

    await reload_configuration(hass)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "More page saved succesfully"
        },
    )


#remove_more_page
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/remove_more_page",
        vol.Required("foldername"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_remove_more_page(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle remove more page command."""

    path_to_more_page = _safe_path(hass.config.path("lcars-dashboard"), "configs", "more_pages", msg["foldername"], "page.yaml")
    #_LOGGER.warning(f"Removing more_page: {msg["foldername"]} -- {path_to_more_page}")

    #if os.path.exists(path_to_more_page):
    if await hass.async_add_executor_job(os.path.exists, path_to_more_page):
        #remove folder and content
        #shutil.rmtree(hass.config.path("lcars-dashboard/configs/more_pages/"+msg["foldername"]), ignore_errors=True)
        folder_path = _safe_path(hass.config.path("lcars-dashboard"), "configs", "more_pages", msg["foldername"])
        await hass.async_add_executor_job(shutil.rmtree, folder_path, True)

    hass.bus.async_fire("lcars_dashboard_navigation_card_reload")

    await reload_configuration(hass)

    hass.bus.async_fire("lcars_dashboard_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "More page removed succesfully"
        },
    )



#add_more_page_to_navbar
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/add_more_page_to_navbar",
        vol.Required("more_page"): _validate_path_component,
    }
)
@websocket_api.async_response
async def ws_handle_add_more_page_to_navbar(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle add more page to navbar command."""

    #if os.path.exists(hass.config.path("lcars-dashboard/configs/more_pages/"+msg["more_page"]+"/config.yaml")):
    #    with open(hass.config.path("lcars-dashboard/configs/more_pages/"+msg["more_page"]+"/config.yaml")) as f:
    #        configFile = yaml.safe_load(f)
    #else:
    #    configFile = OrderedDict()
    #
    #    configFile.update({
    #        "show_in_navbar": "True"
    #    })
    #
    #    with open(hass.config.path("lcars-dashboard/configs/more_pages/"+msg["more_page"]+"/config.yaml"), 'w') as f:
    #        yaml.safe_dump(configFile, f, default_flow_style=False)

    #call reload config to rebuild the yaml for pages too
    hass.bus.async_fire("lcars_dashboard_reload")
    hass.bus.async_fire("lcars_dashboard_navigation_card_reload")

    await reload_configuration(hass)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "More page removed succesfully"
        },
    )


#sort_area_button
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/sort_area_button",
        vol.Required("sortData"): str,
        vol.Required("sortType"): vol.In(ALLOWED_SORT_TYPES),
    }
)
@websocket_api.async_response
async def ws_handle_sort_area_button(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle sort area buttons command."""

    sortData = _safe_json_loads(connection, msg["id"], msg["sortData"], "sortData")
    if sortData is None: return

    sortType = msg["sortType"]

    areas = await _read_yaml_file(hass, "lcars-dashboard/configs/areas.yaml")

    for num, area_id in enumerate(sortData, start=1):
        if areas.get(area_id):
            areas[area_id].update({
                sortType: num,
            })
        else:
            areas[area_id] = OrderedDict({
                sortType: num,
            })

    await _write_yaml_file(hass, "lcars-dashboard/configs/areas.yaml", areas)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Area buttons sorted succesfully"
        },
    )




#edit_device_bool_value
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/edit_device_bool_value",
        vol.Required("device"): str,
        vol.Optional("key"): vol.In(ALLOWED_BOOL_KEYS),
        vol.Optional("value"): bool,
    }
)
@websocket_api.async_response
async def ws_handle_edit_device_bool_value(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle edit device bool value command."""

    devices = await _read_yaml_file(hass, "lcars-dashboard/configs/devices.yaml")

    entity = devices.get(msg["device"])

    if not entity:
        devices[msg["device"]] = OrderedDict()

    devices[msg["device"]].update({
            msg["key"]: msg["value"]
        })

    await _write_yaml_file(hass, "lcars-dashboard/configs/devices.yaml", devices)

    hass.bus.async_fire("lcars_dashboard_devicespage_card_reload")

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device bool value set succesfully"
        },
    )



#sort_device_button
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/sort_device_button",
        vol.Required("sortData"): str,
    }
)
@websocket_api.async_response
async def ws_handle_sort_device_button(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle sort device buttons command."""

    sortData = _safe_json_loads(connection, msg["id"], msg["sortData"], "sortData")
    if sortData is None: return

    devices = await _read_yaml_file(hass, "lcars-dashboard/configs/devices.yaml")

    for num, device_id in enumerate(sortData, start=1):
        if devices.get(device_id):
            devices[device_id].update({
                "sort_order": num,
            })
        else:
            devices[device_id] = OrderedDict({
                "sort_order": num,
            })

    await _write_yaml_file(hass, "lcars-dashboard/configs/devices.yaml", devices)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Device buttons sorted succesfully"
        },
    )

#sort_entity
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/sort_entity",
        vol.Required("sortData"): str,
        vol.Required("sortType"): vol.In(ALLOWED_SORT_TYPES),
    }
)
@websocket_api.async_response
async def ws_handle_sort_entity(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle sort entity cards."""

    sortData = _safe_json_loads(connection, msg["id"], msg["sortData"], "sortData")
    if sortData is None: return

    sortType = msg["sortType"]

    entities = await _read_yaml_file(hass, "lcars-dashboard/configs/entities.yaml")

    for num, entity_id in enumerate(sortData, start=1):
        if entities.get(entity_id):
            entities[entity_id].update({
                sortType: num,
            })
        else:
            entities[entity_id] = OrderedDict({
                sortType: num,
            })

    await _write_yaml_file(hass, "lcars-dashboard/configs/entities.yaml", entities)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "Entity cards sorted succesfully"
        },
    )



#sort_more_page
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/sort_more_page",
        vol.Required("sortData"): str,
    }
)
@websocket_api.async_response
async def ws_handle_sort_more_page(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle sort more pages command."""

    sortData = _safe_json_loads(connection, msg["id"], msg["sortData"], "sortData")
    if sortData is None: return

    for item in sortData:
        _validate_path_component(item)

    for num, more_page in enumerate(sortData, start=1):
        config_rel = f"lcars-dashboard/configs/more_pages/{more_page}/config.yaml"
        configFile = await _read_yaml_file(hass, config_rel)

        configFile.update({
            "sort_order": num,
        })

        await _write_yaml_file(hass, config_rel, configFile)

    connection.send_result(
        msg["id"],
        {
            "succesfull": "More pages sorted succesfully"
        },
    )


#panel_order_get
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/panel_order/get",
    }
)
@websocket_api.async_response
async def ws_handle_panel_order_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Return panel order overrides for all areas."""
    overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_overrides.yaml")
    connection.send_result(msg["id"], {"panel_overrides": overrides})


#panel_order_set
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/panel_order/set",
        vol.Required("area_id"): _validate_path_component,
        vol.Required("panel_order"): str,
    }
)
@websocket_api.async_response
async def ws_handle_panel_order_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save panel order override for a specific area."""
    area_id = msg["area_id"]
    panel_order = _safe_json_loads(connection, msg["id"], msg["panel_order"], "panel_order")
    if panel_order is None:
        return
    if not isinstance(panel_order, list):
        connection.send_error(msg["id"], "invalid_format", "panel_order must be a JSON array of panel type strings")
        return
    if len(panel_order) > 50:
        connection.send_error(msg["id"], "invalid_format", "panel_order exceeds maximum of 50 entries")
        return
    # Validate entries: panel type (a-z_) or panelType:deviceId format, max 80 chars
    import re
    _PANEL_ID_RE = re.compile(r'^[a-z_][a-z0-9_:]{0,79}$')
    for item in panel_order:
        if not isinstance(item, str) or not _PANEL_ID_RE.match(item):
            connection.send_error(msg["id"], "invalid_format", "Each panel_order entry must be a panel ID string (a-z, 0-9, underscore, colon, max 80 chars)")
            return

    async with _get_yaml_lock("lcars-dashboard/configs/panel_overrides.yaml"):
        overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_overrides.yaml")
        if not isinstance(overrides, dict):
            overrides = OrderedDict()

        if len(panel_order) == 0:
            # Clear override for this area
            overrides.pop(area_id, None)
        else:
            overrides[area_id] = panel_order

        await _write_yaml_file(hass, "lcars-dashboard/configs/panel_overrides.yaml", overrides)

    connection.send_result(msg["id"], {"successful": "Panel order saved"})


#panel_column_get
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/panel_column/get",
    }
)
@websocket_api.async_response
async def ws_handle_panel_column_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Return panel column overrides for all areas."""
    overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_column_overrides.yaml")
    connection.send_result(msg["id"], {"panel_column_overrides": overrides if isinstance(overrides, dict) else {}})


#panel_column_set
@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lcars_dashboard/panel_column/set",
        vol.Required("area_id"): _validate_path_component,
        vol.Required("panel_columns"): str,
    }
)
@websocket_api.async_response
async def ws_handle_panel_column_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Save panel column overrides for a specific area."""
    area_id = msg["area_id"]
    panel_columns = _safe_json_loads(connection, msg["id"], msg["panel_columns"], "panel_columns")
    if panel_columns is None:
        return
    if not isinstance(panel_columns, dict):
        connection.send_error(msg["id"], "invalid_format", "panel_columns must be a JSON object mapping panel types to 'left' or 'right'")
        return
    if len(panel_columns) > 50:
        connection.send_error(msg["id"], "invalid_format", "panel_columns exceeds maximum of 50 entries")
        return
    import re
    _PANEL_ID_RE = re.compile(r'^[a-z_][a-z0-9_:]{0,79}$')
    _VALID_COLUMNS = {'left', 'right'}
    for key, val in panel_columns.items():
        if not isinstance(key, str) or not _PANEL_ID_RE.match(key):
            connection.send_error(msg["id"], "invalid_format", "Each key must be a panel ID string (a-z, 0-9, underscore, colon, max 80 chars)")
            return
        if val not in _VALID_COLUMNS:
            connection.send_error(msg["id"], "invalid_format", "Each value must be 'left' or 'right'")
            return

    async with _get_yaml_lock("lcars-dashboard/configs/panel_column_overrides.yaml"):
        overrides = await _read_yaml_file(hass, "lcars-dashboard/configs/panel_column_overrides.yaml")
        if not isinstance(overrides, dict):
            overrides = OrderedDict()

        if len(panel_columns) == 0:
            overrides.pop(area_id, None)
        else:
            overrides[area_id] = panel_columns

        await _write_yaml_file(hass, "lcars-dashboard/configs/panel_column_overrides.yaml", overrides)

    connection.send_result(msg["id"], {"successful": "Panel column overrides saved"})


async def async_setup_entry(hass, config_entry):
    _LOGGER.debug("async_setup_entry starting for %s", config_entry.entry_id)

    try:
        await process_yaml(hass, config_entry)
        _LOGGER.debug("process_yaml completed successfully")
    except Exception as err:
        _LOGGER.error("process_yaml failed: %s", err, exc_info=True)
        return False

    try:
        load_dashboard(hass, config_entry)
        _LOGGER.debug("load_dashboard completed successfully")
    except Exception as err:
        _LOGGER.error("load_dashboard failed: %s", err, exc_info=True)
        return False

    config_entry.add_update_listener(_update_listener)

    #hass.async_add_job( # Deprecated, trying with hass.async_create_task() ...
    await hass.config_entries.async_forward_entry_setups(
        config_entry, ["sensor"]
    )

    _LOGGER.debug("async_setup_entry complete — sensor platform forwarded")
    return True

async def async_remove_entry(hass, config_entry):
    _LOGGER.info("LCARS Dashboard is being uninstalled")

    frontend.async_remove_panel(hass, "lcars-dashboard")

async def async_unload_entry(hass, config_entry):
    """Unload a config entry."""
    _LOGGER.debug("Unloading LCARS Dashboard")
    unload_ok = await hass.config_entries.async_unload_platforms(config_entry, ["sensor"])
    if unload_ok:
        hass.data.pop(DOMAIN, None)
    frontend.async_remove_panel(hass, "lcars-dashboard")
    return unload_ok

async def _update_listener(hass, config_entry):
    _LOGGER.debug("Config entry update listener triggered")

    await process_yaml(hass, config_entry)

    hass.bus.async_fire("lcars_dashboard_reload")

    return True
