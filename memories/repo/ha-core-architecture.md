# Home Assistant Core Architecture Reference
> Compiled 2026-04-11 from HA developer docs, core source, and WebSocket API docs.
> HA Current Release: 2026.4.1 | Core repo: home-assistant/core

---

## A. Core Architecture

### Boot Sequence
1. HA Core starts → loads `homeassistant/core.py` → creates `HomeAssistant` instance
2. Loads core config (`configuration.yaml`)
3. Sets up core integrations (`homeassistant`, `http`, `websocket_api`, `frontend`, etc.)
4. For each integration in config or config entries: calls `async_setup(hass, config)` then `async_setup_entry(hass, entry)` for each config entry
5. Events fire: `EVENT_HOMEASSISTANT_START` → `EVENT_HOMEASSISTANT_STARTED`
6. For custom_components: same lifecycle, loaded from `config/custom_components/`

### The `hass` Object
| Attribute | Type | Purpose |
|---|---|---|
| `hass` | `HomeAssistant` | Main instance. Start, stop, enqueue jobs |
| `hass.config` | `Config` | Core config: location, temp prefs, config dir path |
| `hass.states` | `StateMachine` | Set/get entity states. `async_set()`, `get()` |
| `hass.bus` | `EventBus` | Fire and listen to events. `async_fire()`, `async_listen()` |
| `hass.services` | `ServiceRegistry` | Register/call service actions |
| `hass.data` | `dict` | Per-integration data storage. Key: `DOMAIN` |

### Where `hass` is Available
- **Component**: `setup(hass, config)` or `async_setup(hass, config)`
- **Platform**: `setup_platform(hass, config, add_entities, discovery_info)`
- **Entity**: `self.hass` (after added via `add_entities`)

### Four Registries — How They Relate

```
Floor Registry
  └── Area Registry (area has floor_id)
        └── Device Registry (device has area_id)
              └── Entity Registry (entity has device_id AND/OR area_id)
```

- **entity_id** → human-readable identifier (`light.kitchen`)
- **device_id** → HA-generated UUID for a physical device
- **area_id** → HA-generated slug for a physical area
- **floor_id** → HA-generated slug for a floor
- Entity can have BOTH device_id AND area_id (entity area overrides device area for display)
- Finding all entities for a device: `er.async_entries_for_device(entity_registry, device_id)`
- Finding all devices for an area: `dr.async_entries_for_area(device_registry, area_id)`
- Finding all areas for a floor: `ar.async_entries_for_floor(area_registry, floor_id)`

---

## B. Integration Development

### manifest.json Fields
```json
{
  "domain": "lcars_dashboard",          // Required. Must match directory name
  "name": "LCARS Dashboard",            // Required. Display name
  "version": "3.8.0",                   // Required for custom_components (semver)
  "documentation": "https://...",        // Required
  "issue_tracker": "https://...",        // Optional (auto-gen for core)
  "codeowners": ["@user"],              // Required
  "dependencies": ["lovelace", "http", "frontend"],  // HA integrations loaded first
  "after_dependencies": [],              // Optional dependencies (loaded if configured)
  "requirements": [],                    // PyPI packages (pinned versions)
  "config_flow": true,                  // Requires config_flow.py
  "single_config_entry": true,          // Only one config entry allowed
  "integration_type": "hub",            // hub|device|service|entity|helper|hardware|system|virtual
  "iot_class": "calculated",            // assumed_state|cloud_polling|cloud_push|local_polling|local_push|calculated
  "homeassistant": "2025.4.0",          // Minimum HA version
  "loggers": []                          // Logger names for requirements
}
```

### `__init__.py` Patterns

#### async_setup_entry (config-entry-based)
```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = MyData(...)
    
    # Forward to platforms
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor", "light"])
    
    return True
```

#### async_unload_entry
```python
async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, ["sensor"])
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
```

#### async_setup (legacy YAML-based — our integration uses BOTH)
```python
async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up component."""
    hass.states.async_set("domain.entity", "value")
    return True
```

### Config Flow (`config_flow.py`)
```python
class ExampleConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            # validate
            return self.async_create_entry(title="Title", data=user_input)
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required("host"): str}),
            errors=errors
        )
```

Key flow results: `async_show_form()`, `async_create_entry()`, `async_abort()`, `async_external_step()`, `async_show_progress()`, `async_show_menu()`

### custom_components vs built-in
- Same architecture, identical lifecycle
- custom_components **must** have `version` in manifest.json
- custom_components live in `config/custom_components/<domain>/`
- core integrations live in `homeassistant/components/<domain>/`
- custom_components can override core integrations (same domain name)

### WebSocket Command Registration (Python side)

#### Pattern 1: Decorator-based (preferred)
```python
from homeassistant.components import websocket_api

@websocket_api.websocket_command({
    vol.Required("type"): "my_domain/my_command",
    vol.Required("entity_id"): str,
    vol.Optional("value"): int,
})
@websocket_api.async_response
async def websocket_my_command(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle my command."""
    # Do work...
    connection.send_result(msg["id"], {"key": "value"})

# Registration in async_setup or async_setup_entry:
websocket_api.async_register_command(hass, websocket_my_command)
```

#### Pattern 2: Explicit registration (legacy)
```python
websocket_api.async_register_command(
    hass,
    "my_domain/command",     # command type string
    handler_function,         # handler
    vol.Schema({...})         # schema
)
```

#### Key decorators
- `@websocket_api.websocket_command({schema})` — defines command type + validation schema
- `@websocket_api.async_response` — wraps async handler in background task with error handling
- `@websocket_api.require_admin` — requires admin user
- `@callback` — for sync handlers (no `async_response` needed)

#### Response methods on `connection`
- `connection.send_result(msg["id"], data)` — success response
- `connection.send_error(msg["id"], code, message)` — error response
- `connection.send_message(messages.event_message(msg["id"], data))` — streaming event

---

## C. Entity Architecture

### Entity Base Class Properties

#### Generic Properties (written to state machine on every update)
| Property | Type | Default | Description |
|---|---|---|---|
| `assumed_state` | bool | False | State is assumed, not read from device |
| `attribution` | str | None | Branding text |
| `available` | bool | True | Device reachable |
| `device_class` | str | None | Domain-specific classification |
| `entity_picture` | str | None | URL of picture for entity |
| `extra_state_attributes` | dict | None | Additional state data (minimize!) |
| `has_entity_name` | bool | False | **Mandatory for new integrations** |
| `name` | str | None | Entity name |
| `should_poll` | bool | True | HA polls entity for updates |
| `state` | str/int/float | None | Entity state (usually from domain base) |
| `supported_features` | int | None | Bitmask of supported features |
| `translation_key` | str | None | For translated names/states |

#### Registry Properties (read when entity added, require `unique_id`)
| Property | Type | Default | Description |
|---|---|---|---|
| `device_info` | DeviceInfo | None | Device registry descriptor |
| `entity_category` | EntityCategory | None | `CONFIG`, `DIAGNOSTIC`, or `None` |
| `entity_registry_enabled_default` | bool | True | Enabled when first registered |
| `entity_registry_visible_default` | bool | True | Visible when first registered |
| `unique_id` | str | None | **Must be unique within a platform** |

#### Property Implementation (3 ways)
1. **Property method**: `@property def name(self): return "X"`
2. **Class/instance attribute**: `_attr_name = "X"` or `self._attr_name = "X"`
3. **EntityDescription**: Dataclass-based declarative approach

#### Lifecycle Hooks
- `async_added_to_hass()` — entity_id and hass assigned, before first state write
- `async_will_remove_from_hass()` — about to be removed

#### Updating Strategies
- **Polling**: `should_poll = True` (default), implement `update()` or `async_update()`
- **Push**: `should_poll = False`, call `self.async_schedule_update_ha_state()`

### SensorEntity
Key properties:
| Property | Type | Description |
|---|---|---|
| `device_class` | SensorDeviceClass | Type (TEMPERATURE, ENERGY, BATTERY, POWER, etc.) |
| `native_value` | str/int/float/date/datetime | **Required**. The sensor value |
| `native_unit_of_measurement` | str | Unit (°C, kWh, %, W, etc.) |
| `state_class` | SensorStateClass | MEASUREMENT, TOTAL, TOTAL_INCREASING |
| `suggested_display_precision` | int | Decimal places for display |
| `options` | list[str] | For ENUM device class only |
| `last_reset` | datetime | For accumulating sensors |

State classes:
- `MEASUREMENT` — current point-in-time value (temperature, humidity)
- `TOTAL` — accumulating value that can increase/decrease (net energy)
- `TOTAL_INCREASING` — monotonically increasing, resets to 0 periodically

### CameraEntity
Key properties:
| Property | Type | Default | Description |
|---|---|---|---|
| `brand` | str | None | Camera manufacturer |
| `frame_interval` | float | 0.5 | Seconds between frames |
| `is_on` | bool | True | Camera powered on |
| `is_recording` | bool | False | Currently recording |
| `is_streaming` | bool | False | Currently streaming |
| `model` | str | None | Camera model |
| `motion_detection_enabled` | bool | False | Motion detection active |
| `use_stream_for_stills` | bool | False | Use stream integration for still images |

States: `RECORDING`, `STREAMING`, `IDLE`

Supported features (`CameraEntityFeature`):
- `ON_OFF` — supports turn_on/turn_off
- `STREAM` — supports streaming

Key methods:
- `camera_image(width, height)` / `async_camera_image(width, height)` → `bytes | None`
- `stream_source()` → `str | None` (RTSP URL for ffmpeg)
- `async_handle_async_webrtc_offer()` — for WebRTC cameras

`entity_picture` for cameras: automatically served via `/api/camera_proxy/<entity_id>`

### Entity Categories
- `None` — Primary entity (default). Shown in dashboard.
- `EntityCategory.CONFIG` — Configuration entity (e.g., a switch to toggle device backlight)
- `EntityCategory.DIAGNOSTIC` — Read-only diagnostic (e.g., RSSI, firmware version)

---

## D. Frontend Architecture

### Lovelace Dashboard
- YAML mode: `mode: yaml`, `filename:` points to root YAML file
- Views are loaded via `!include_dir_merge_list views/`
- Cards are custom elements: `customElements.define('my-card', MyCard)`

### Custom Card Lifecycle
```javascript
class MyCard extends HTMLElement {
  setConfig(config) { /* called once with card config */ }
  set hass(hass) { /* called on every state change */ }
  getCardSize() { return 1; }
}
customElements.define('my-card', MyCard);
```

### Frontend `hass` Object (JavaScript side)
Available in `set hass(hass)`:
- `hass.states` — `{entity_id: {state, attributes, last_changed, ...}}`
- `hass.entities` — entity registry entries (from `config/entity_registry/list_for_display`)
- `hass.devices` — device registry entries
- `hass.areas` — area registry entries
- `hass.config` — core config (latitude, longitude, unit_system, etc.)
- `hass.user` — current user
- `hass.language` — current UI language
- `hass.themes` — loaded themes
- `hass.panels` — registered panels
- `hass.services` — available services
- `hass.callService(domain, service, data, target)` — call a service
- `hass.callWS(msg)` — call websocket command
- `hass.connection` — the underlying WS connection object

### Frontend ↔ Backend Communication
- **WebSocket API**: `/api/websocket` — real-time bidirectional (primary)
- **REST API**: `/api/...` — traditional HTTP (secondary)
- JS library: `home-assistant-js-websocket`

### WebSocket Entity Registry for Display
`config/entity_registry/list_for_display` returns compact entity data:
| Key | Full Name | Description |
|---|---|---|
| `ei` | Entity ID | `light.living_room` |
| `pl` | Platform | `hue` |
| `ai` | Area ID | area this entity belongs to |
| `di` | Device ID | device this entity belongs to |
| `en` | Entity Name | display name |
| `hn` | Has Entity Name | true if integration-provided |
| `ec` | Entity Category | index into `entity_categories` map |
| `hb` | Hidden By | true if hidden |
| `ic` | Icon | custom user icon |
| `tk` | Translation Key | for name translation |
| `lb` | Labels | list of label IDs |
| `dp` | Display Precision | sensor display precision |

Only enabled entities included. Disabled entities filtered out.

### Custom Panels
- `LovelaceYAML` panel type for YAML-mode custom dashboards
- Registered via `hass.http.register_static_path()` + frontend panel registration
- Our dashboard registers at `/lcars-dashboard` URL

---

## E. Device and Area Registries (Full Structure)

### Device Registry Entry (`DeviceEntry`)
| Field | Type | Description |
|---|---|---|
| `id` | str | HA-generated unique ID |
| `name` | str | Device name |
| `name_by_user` | str \| None | User-customized name |
| `area_id` | str \| None | Area the device is in |
| `config_entries` | set[str] | Config entries linked to device |
| `connections` | set[tuple] | `(type, identifier)` e.g. MAC address |
| `identifiers` | set[tuple] | `(DOMAIN, id)` external identifiers |
| `manufacturer` | str \| None | Manufacturer name |
| `model` | str \| None | Model name |
| `model_id` | str \| None | Model identifier |
| `sw_version` | str \| None | Firmware version |
| `hw_version` | str \| None | Hardware version |
| `serial_number` | str \| None | Serial number (not necessarily unique) |
| `via_device` | tuple \| None | Parent device identifier |
| `configuration_url` | str \| None | Config URL |
| `entry_type` | DeviceEntryType \| None | `None` or `service` |

Access: `dr.async_get(hass)` → `DeviceRegistry`
- `registry.async_get(device_id)` → DeviceEntry
- `dr.async_entries_for_area(registry, area_id)` → list[DeviceEntry]

### Area Registry Entry (`AreaEntry`)
| Field | Type | Description |
|---|---|---|
| `id` | str | HA-generated slug (e.g., "living_room") |
| `name` | str | Display name |
| `floor_id` | str \| None | Floor this area is on |
| `icon` | str \| None | MDI icon |
| `picture` | str \| None | Picture URL |
| `aliases` | set[str] | Alternative names |
| `labels` | set[str] | Label IDs |
| `temperature_entity_id` | str \| None | Climate sensor for area |
| `humidity_entity_id` | str \| None | Humidity sensor for area |
| `created_at` | datetime | Creation timestamp |
| `modified_at` | datetime | Last modified timestamp |

Access: `ar.async_get(hass)` → `AreaRegistry`
- `registry.async_get_area(area_id)` → AreaEntry
- `registry.async_get_area_by_name(name)` → AreaEntry
- `registry.async_list_areas()` → Iterable[AreaEntry]
- `ar.async_entries_for_floor(registry, floor_id)` → list[AreaEntry]

### Floor Registry Entry (`FloorEntry`)
| Field | Type | Description |
|---|---|---|
| `floor_id` | str | HA-generated slug |
| `name` | str | Display name |
| `icon` | str \| None | MDI icon |
| `level` | int \| None | Sort order / physical level |
| `aliases` | set[str] | Alternative names |
| `created_at` | datetime | Creation timestamp |
| `modified_at` | datetime | Last modified timestamp |

Access: `fr.async_get(hass)` → `FloorRegistry`

### Entity Registry Entry (`RegistryEntry`)
| Field | Type | Description |
|---|---|---|
| `entity_id` | str | e.g., `light.kitchen` |
| `unique_id` | str | Integration-provided unique ID |
| `platform` | str | Integration that created it |
| `device_id` | str \| None | Device this entity belongs to |
| `area_id` | str \| None | Area (overrides device area) |
| `config_entry_id` | str \| None | Config entry |
| `disabled_by` | RegistryEntryDisabler \| None | Who disabled it |
| `hidden_by` | RegistryEntryHider \| None | Who hid it |
| `entity_category` | EntityCategory \| None | CONFIG, DIAGNOSTIC, None |
| `name` | str \| None | User-customized name |
| `original_name` | str \| None | Integration-provided name |
| `icon` | str \| None | User-customized icon |
| `has_entity_name` | bool | Uses integration name pattern |
| `labels` | set[str] | Label IDs |
| `options` | dict | Per-domain options (e.g., sensor display_precision) |

Access: `er.async_get(hass)` → `EntityRegistry`
- `registry.async_get(entity_id)` → RegistryEntry
- `er.async_entries_for_device(registry, device_id)` → list[RegistryEntry]
- `er.async_entries_for_area(registry, area_id)` → list[RegistryEntry]

### Traversal Patterns
```python
# All entities for a device
entity_reg = er.async_get(hass)
entities = er.async_entries_for_device(entity_reg, device_id)

# All devices for an area
device_reg = dr.async_get(hass)
devices = dr.async_entries_for_area(device_reg, area_id)

# All areas for a floor
area_reg = ar.async_get(hass)
areas = ar.async_entries_for_floor(area_reg, floor_id)

# All entities for an area (direct + via devices)
direct_entities = er.async_entries_for_area(entity_reg, area_id)
for device in dr.async_entries_for_area(device_reg, area_id):
    device_entities = er.async_entries_for_device(entity_reg, device.id)
```

---

## F. Key Python APIs We Use

### homeassistant.components.websocket_api
```python
from homeassistant.components import websocket_api

# Registration
websocket_api.async_register_command(hass, handler_func)

# Decorators
@websocket_api.websocket_command({vol.Required("type"): "domain/command", ...})
@websocket_api.async_response      # for async handlers
@websocket_api.require_admin       # admin-only
@callback                          # for sync handlers

# Connection methods
connection.send_result(msg["id"], data)
connection.send_error(msg["id"], error_code, message)
connection.send_message(messages.event_message(msg["id"], event_data))

# Error codes
websocket_api.ERR_NOT_FOUND
websocket_api.ERR_NOT_ALLOWED
websocket_api.ERR_INVALID_FORMAT
websocket_api.ERR_HOME_ASSISTANT_ERROR
websocket_api.ERR_UNKNOWN_ERROR
```

### homeassistant.components.lovelace
- `LovelaceYAML` — YAML-mode dashboard class
- Panel registration via `_register_panel()`

### homeassistant.helpers registries
```python
from homeassistant.helpers import (
    entity_registry as er,
    device_registry as dr,
    area_registry as ar,
    floor_registry as fr,
)

# Get registry instances (singleton per hass)
entity_reg = er.async_get(hass)
device_reg = dr.async_get(hass)
area_reg = ar.async_get(hass)
floor_reg = fr.async_get(hass)

# Device registration (auto via entity.device_info or manual)
device_reg.async_get_or_create(
    config_entry_id=entry.entry_id,
    identifiers={(DOMAIN, serial)},
    name="Device Name",
    manufacturer="Mfg",
    model="Model",
)
```

### homeassistant.core
```python
from homeassistant.core import HomeAssistant, callback

# @callback — marks a function as safe to call from event loop (no I/O)
@callback
def my_sync_handler(hass, ...):
    pass

# StateMachine
hass.states.async_set(entity_id, state, attributes)
state = hass.states.get(entity_id)

# EventBus
hass.bus.async_fire("my_event", {"data": "value"})
unsub = hass.bus.async_listen("my_event", handler)

# Services
hass.services.async_register(DOMAIN, "service_name", handler, schema)
```

### voluptuous Schemas
```python
import voluptuous as vol
import homeassistant.helpers.config_validation as cv

schema = vol.Schema({
    vol.Required("type"): "domain/command",
    vol.Required("entity_id"): cv.entity_id,
    vol.Optional("value", default=0): int,
    vol.Optional("name"): cv.string,
})
```

---

## G. WebSocket API Protocol (Frontend ↔ Backend)

### Connection Flow
1. Client connects to `/api/websocket`
2. Server sends `auth_required`
3. Client sends `{type: "auth", access_token: "..."}`
4. Server sends `auth_ok` or `auth_invalid`
5. Command phase: client sends `{id: N, type: "command", ...}`, server responds `{id: N, type: "result", success: true/false, result: ...}`

### Built-in Commands
| Command | Description |
|---|---|
| `get_states` | Dump all current entity states |
| `get_config` | Get HA core config |
| `get_services` | Get all registered service actions |
| `get_panels` | Get all registered panels |
| `subscribe_events` | Subscribe to event bus (optional `event_type` filter) |
| `unsubscribe_events` | Unsubscribe |
| `subscribe_trigger` | Subscribe to automation triggers |
| `call_service` | Call a service action |
| `fire_event` | Fire an event |
| `config/entity_registry/list_for_display` | Compact entity list for UI |
| `extract_from_target` | Resolve target → entities/devices/areas |
| `ping` / `pong` | Heartbeat |

### Custom Commands (our integration)
Registered via `websocket_api.async_register_command()` in `async_setup()`.
Command types use `lcars_dashboard/` prefix (e.g., `lcars_dashboard/configuration/get`).

### Message IDs
Every command from client includes incrementing `id` integer.
Server includes same `id` in response for correlation.
Subscription events also include the original subscription `id`.
