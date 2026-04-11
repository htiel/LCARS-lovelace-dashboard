# Home Assistant Documentation Reference
## Compiled 2026-04-11 — Data's Research Archive

---

## A. Custom Card Development

### Lifecycle & API

Custom cards are defined as **custom elements** (Web Components). HA calls methods in this order:

1. **Element created** — `customElements.define("my-card", MyCard)`
2. **`setConfig(config)`** — Called when card config is set/updated. Must store config. Throw error if config is invalid.
3. **`connectedCallback()`** — Card is attached to DOM. Use `context-request` event to get `hass` states (new pattern as of 2025+).
4. **`set hass(hass)`** — *(Legacy pattern)* Called whenever any state changes. The `hass` object contains all states, services, user info. In the new pattern, use `context-request` with `subscribe: true`.
5. **`render()`** — (Lit) Render the card UI.
6. **`disconnectedCallback()`** — Card removed from DOM. Unsubscribe from context here.

### New Context-Request Pattern (2025+)
```js
connectedCallback() {
  const event = new CustomEvent('context-request', {
    bubbles: true, composed: true, cancelable: true,
  });
  event.context = 'states'; // key HA's user context provider uses
  event.subscribe = true;   // subscribe to future updates
  // ... dispatch and handle
}
```

### Sizing Methods

- **`getCardSize()`** — For **masonry view**. Returns integer (rough height in ~50px units). Used to distribute cards across columns.
- **`getGridOptions()`** — For **sections view**. Returns grid sizing object:
  ```js
  getGridOptions() {
    return {
      rows: 3,        // default row count
      columns: 6,     // default column count (section = 12 cols)
      min_rows: 3,    // minimum rows
      max_rows: 3,    // maximum rows
    };
  }
  ```
  - Section grid: 12 columns per section
  - Cell width: ~30px (section width / 12)
  - Cell height: 56px
  - Gap between cells: 8px

### Graphical Card Configuration (Editor)

```js
class ContentCardExample extends HTMLElement {
  static getConfigElement() {
    return document.createElement("content-card-editor");
  }
  static getStubConfig() {
    return { entity: "sun.sun" };
  }
}
```

Register card for discovery:
```js
window.customCards = window.customCards || [];
window.customCards.push({
  type: "content-card-example",
  name: "Content Card Example",
  description: "A custom card example"
});
```

### Card Type Convention
- Define element as `content-card-example`
- Use in YAML as `type: custom:content-card-example`
- Prefix `custom:` tells HA to look for a custom element

### view_layout Property
Cards can store custom data in `view_layout` key for custom views (position, dimensions, etc.):
```yaml
- type: weather-card
  view_layout:
    key: 1234
    width: 54px
  entity: weather.my_weather
```

### layout_options (Sections View)
Override grid sizing per card instance:
```yaml
type: tile
entity: sensor.temperature
layout_options:
  grid_columns: 3
  grid_rows: 3
```

---

## B. Custom View Layout

### Interface
```ts
interface LovelaceViewElement {
  hass?: HomeAssistant;
  lovelace?: Lovelace;
  index?: number;
  cards?: Array<LovelaceCard | HuiErrorCard>;
  badges?: LovelaceBadge[];
  setConfig(config: LovelaceViewConfig): void;
}
```

### Key Points
- Cards and badges are **created and maintained by core** — passed to the view
- The custom view's job is **layout only** — position and display the cards
- View receives `cards` as a property (array of already-instantiated card elements)
- Implement `setConfig(_config)` for view configuration
- Use `view_layout` in card config to store per-card position data

### Card Management Events
```js
// Delete 4th card (0-indexed)
this.dispatchEvent(new CustomEvent("ll-delete-card", { detail: { path: [3] } }));
// Edit card
this.dispatchEvent(new CustomEvent("ll-edit-card", { detail: { path: [3] } }));
// Create new card
this.dispatchEvent(new CustomEvent("ll-create-card"));
```

### Example
```js
class MyNewView extends LitElement {
  setConfig(_config) {}
  static get properties() {
    return { cards: { type: Array, attribute: false } };
  }
  render() {
    if (!this.cards) return html``;
    return html`${this.cards.map((card) => html`<div>${card}</div>`)}`;
  }
}
customElements.define("my-new-view", MyNewView);
```

YAML usage: `type: custom:my-new-view`

---

## C. Custom Strategies

### Dashboard Strategy
```js
class StrategyDemo {
  static async generate(config, hass) {
    return { title: "Generated", views: [...] };
  }
}
customElements.define("ll-strategy-my-demo", StrategyDemo);
```
YAML: `strategy: { type: custom:my-demo }`

### View Strategy
Same pattern, but generates a single view's config. Element name: `ll-strategy-view-my-demo`.

### Key Registry WS Calls for Strategies
```js
const [areas, devices, entities] = await Promise.all([
  hass.callWS({ type: "config/area_registry/list" }),
  hass.callWS({ type: "config/device_registry/list" }),
  hass.callWS({ type: "config/entity_registry/list" }),
]);
```

### Best Practice
Dashboard strategy should delegate to view strategies for lazy loading — views render only when opened.

---

## D. Camera Integration Deep Dive

### Properties (Developer)
| Property | Type | Default | Description |
|---|---|---|---|
| `brand` | str\|None | None | Manufacturer |
| `frame_interval` | float | 0.5 | Interval between frames |
| `is_on` | bool | True | Camera on/off |
| `is_recording` | bool | False | Recording state |
| `is_streaming` | bool | False | Streaming state |
| `model` | str\|None | None | Camera model |
| `motion_detection_enabled` | bool | False | Motion detection active |
| `use_stream_for_stills` | bool | False | Use stream integration for still images |

### States (CameraState enum)
- `RECORDING` — currently recording
- `STREAMING` — currently streaming
- `IDLE` — idle

### Supported Features (CameraEntityFeature)
- `ON_OFF` — supports turn_on/turn_off
- `STREAM` — supports streaming

### Stream Types
- **HLS** (default) — `StreamType.HLS`, uses `stream` component, supports recording
- **WebRTC** — Direct browser-camera connection via `async_handle_async_webrtc_offer` + `async_on_webrtc_candidate`. Does NOT use `stream` component, does NOT support recording
- **MJPEG** — Legacy, frame-by-frame JPEG streaming

### Methods
- `camera_image(width, height)` / `async_camera_image(width, height)` → `bytes | None`
- `stream_source()` → URL usable by ffmpeg (e.g., RTSP URL). Requires `CameraEntityFeature.STREAM`
- `async_handle_async_webrtc_offer(offer_sdp, session_id, send_message)` — WebRTC
- `async_on_webrtc_candidate(session_id, candidate)` — WebRTC ICE candidates
- `close_webrtc_session(session_id)` — Optional cleanup

### REST API Endpoint
`GET /api/camera_proxy/<camera_entity_id>` — Returns camera still image (requires auth)

### User-Facing Actions
- `camera.snapshot` — Take still image, save to file
- `camera.record` — Record video (requires `stream` integration)
- `camera.play_stream` — Play live stream on media player
- `camera.turn_on` / `camera.turn_off`
- `camera.enable_motion_detection` / `camera.disable_motion_detection`

### Preload Stream Option
Starts camera feed on HA startup, keeps stream alive. Reduces latency but increases CPU.

---

## E. Entity Device Classes — Complete Reference

### Sensor Device Classes (SensorDeviceClass)
ABSOLUTE_HUMIDITY, APPARENT_POWER, AQI, AREA, ATMOSPHERIC_PRESSURE, BATTERY, BLOOD_GLUCOSE_CONCENTRATION, CO2, CO, CONDUCTIVITY, CURRENT, DATA_RATE, DATA_SIZE, DATE, DISTANCE, DURATION, ENERGY, ENERGY_DISTANCE, ENERGY_STORAGE, ENUM, FREQUENCY, GAS, HUMIDITY, ILLUMINANCE, IRRADIANCE, MOISTURE, MONETARY, NITROGEN_DIOXIDE, NITROGEN_MONOXIDE, NITROUS_OXIDE, OZONE, PH, PM1, PM25, PM4, PM10, POWER, POWER_FACTOR, PRECIPITATION, PRECIPITATION_INTENSITY, PRESSURE, REACTIVE_ENERGY, REACTIVE_POWER, SIGNAL_STRENGTH, SOUND_PRESSURE, SPEED, SULPHUR_DIOXIDE, TEMPERATURE, TEMPERATURE_DELTA, TIMESTAMP, VOLATILE_ORGANIC_COMPOUNDS, VOLATILE_ORGANIC_COMPOUNDS_PARTS, VOLTAGE, VOLUME, VOLUME_FLOW_RATE, VOLUME_STORAGE, WATER, WEIGHT, WIND_DIRECTION, WIND_SPEED

### Sensor State Classes
- `MEASUREMENT` — Current value (temp, humidity, power). Tracks min/max/mean.
- `MEASUREMENT_ANGLE` — Same but for angles in degrees (wind direction).
- `TOTAL` — Accumulating total (can increase and decrease). Tracks accumulated growth/decline.
- `TOTAL_INCREASING` — Monotonically increasing total, reset detection on decrease >10%.

### Binary Sensor Device Classes (BinarySensorDeviceClass)
BATTERY, BATTERY_CHARGING, CO, COLD, CONNECTIVITY, DOOR, GARAGE_DOOR, GAS, HEAT, LIGHT, LOCK, MOISTURE, MOTION, MOVING, OCCUPANCY, OPENING, PLUG, POWER, PRESENCE, PROBLEM, RUNNING, SAFETY, SMOKE, SOUND, TAMPER, UPDATE, VIBRATION, WINDOW

### Switch Device Classes (SwitchDeviceClass)
- `OUTLET` — Power outlet
- `SWITCH` — Generic switch

### Cover Device Classes (CoverDeviceClass)
AWNING, BLIND, CURTAIN, DAMPER, DOOR, GARAGE, GATE, SHADE, SHUTTER, WINDOW

### Cover Supported Features (CoverEntityFeature)
OPEN, CLOSE, SET_POSITION, STOP, OPEN_TILT, CLOSE_TILT, SET_TILT_POSITION, STOP_TILT

### Climate HVAC Modes (HVACMode)
OFF, HEAT, COOL, HEAT_COOL, AUTO, DRY, FAN_ONLY

### Climate HVAC Actions (HVACAction)
OFF, PREHEATING, HEATING, COOLING, DRYING, FAN, IDLE, DEFROSTING

### Climate Presets
NONE, ECO, AWAY, BOOST, COMFORT, HOME, SLEEP, ACTIVITY

### Climate Supported Features (ClimateEntityFeature)
TARGET_TEMPERATURE, TARGET_TEMPERATURE_RANGE, TARGET_HUMIDITY, FAN_MODE, PRESET_MODE, SWING_MODE, SWING_HORIZONTAL_MODE, TURN_ON, TURN_OFF

### Media Player Device Classes (MediaPlayerDeviceClass)
- `tv` — Television
- `speaker` — Speakers/stereo
- `receiver` — Audio/video receiver

### Media Player States (MediaPlayerState)
OFF, ON, IDLE, PLAYING, PAUSED, BUFFERING

### Media Player Supported Features (MediaPlayerEntityFeature)
BROWSE_MEDIA, CLEAR_PLAYLIST, GROUPING, MEDIA_ANNOUNCE, MEDIA_ENQUEUE, NEXT_TRACK, PAUSE, PLAY, PLAY_MEDIA, PREVIOUS_TRACK, REPEAT_SET, SEARCH_MEDIA, SEEK, SELECT_SOUND_MODE, SELECT_SOURCE, SHUFFLE_SET, STOP, TURN_OFF, TURN_ON, VOLUME_MUTE, VOLUME_SET, VOLUME_STEP

### Light Color Modes (ColorMode)
UNKNOWN, ONOFF, BRIGHTNESS, COLOR_TEMP, HS, RGB, RGBW, RGBWW, WHITE, XY

### Light Supported Features (LightEntityFeature)
EFFECT, FLASH, TRANSITION

---

## F. REST API Endpoints

Base URL: `http://IP:8123/api/`
Auth header: `Authorization: Bearer TOKEN`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/` | API running check |
| GET | `/api/config` | HA configuration |
| GET | `/api/components` | Loaded components |
| GET | `/api/events` | Event listeners |
| GET | `/api/services` | Available services |
| GET | `/api/history/period/<timestamp>` | History data |
| GET | `/api/logbook/<timestamp>` | Logbook entries |
| GET | `/api/states` | All entity states |
| GET | `/api/states/<entity_id>` | Single entity state |
| GET | `/api/error_log` | Error log |
| GET | `/api/camera_proxy/<entity_id>` | Camera still image |
| GET | `/api/calendars` | All calendars |
| GET | `/api/calendars/<entity_id>?start=&end=` | Calendar events |
| POST | `/api/states/<entity_id>` | Set entity state |
| POST | `/api/events/<event_type>` | Fire event |
| POST | `/api/services/<domain>/<service>` | Call service action |
| POST | `/api/template` | Render template |
| POST | `/api/config/core/check_config` | Validate config |
| POST | `/api/intent/handle` | Handle intent |
| DELETE | `/api/states/<entity_id>` | Remove entity |

Status codes: 200/201 success, 400/401/404/405 errors.

---

## G. WebSocket API

### Connection Flow
1. Connect to `ws://IP:8123/api/websocket`
2. **Auth phase** — Server sends `auth_required`, client sends `{ type: "auth", access_token: "TOKEN" }`
3. **Feature enablement phase** — Optional
4. **Command phase** — Send commands with incrementing `id`

### Key WS Commands
| Type | Purpose |
|---|---|
| `subscribe_events` | Subscribe to event stream (optional event_type filter) |
| `subscribe_trigger` | Subscribe to trigger |
| `fire_event` | Fire event |
| `call_service` | Call service action |
| `get_states` | Fetch all states |
| `get_config` | Fetch HA config |
| `get_services` | Fetch all service actions |
| `get_panels` | Fetch registered panels |
| `validate_config` | Validate trigger/condition/action |
| `config/area_registry/list` | List areas |
| `config/device_registry/list` | List devices |
| `config/entity_registry/list` | List entities |
| `config/entity_registry/list_for_display` | Compact entity list for UI |

### Entity Registry Display Response
Compact format with abbreviated keys:
- `ei` = entity_id, `pl` = platform, `ai` = area_id, `di` = device_id
- `en` = entity name, `hn` = has_entity_name, `ec` = entity_category
- `ic` = icon, `lb` = labels

### Extending WebSocket API (Python Side)
```python
from homeassistant.components import websocket_api

@websocket_api.websocket_command({
    vol.Required("type"): "my_domain/my_command",
    vol.Optional("entity_id"): str,
})
@callback
def ws_handle(hass, connection, msg):
    connection.send_result(msg["id"], {"data": "value"})

# For async I/O:
@websocket_api.websocket_command({...})
@websocket_api.async_response
async def ws_handle_async(hass, connection, msg):
    result = await do_something()
    connection.send_result(msg["id"], result)

# Register in async_setup:
async def async_setup(hass, config):
    websocket_api.async_register_command(hass, ws_handle)
```

### Calling from Frontend (JavaScript)
```js
hass.connection.sendMessagePromise({
  type: 'my_domain/my_command',
  entity_id: 'sensor.example',
}).then(
  (resp) => console.log(resp.result),
  (err) => console.error(err)
);
// For fire-and-forget:
hass.connection.sendMessage({...});
```

---

## H. Jinja2 Template Functions — Complete Catalog

### States (10 functions)
- `states('entity_id')` — Get state value. Iterate all: `states` / `states.sensor` etc.
- `is_state('entity_id', 'value')` — Test state equality
- `state_attr('entity_id', 'attribute')` — Get attribute value
- `is_state_attr('entity_id', 'attr', 'value')` — Test attribute value
- `has_value('entity_id')` — True if not unavailable/unknown
- `expand(group)` — Expand groups to entity state objects
- `closest(location)` — Find closest entity
- `distance(lat, lon)` — Calculate distance
- `state_translated('entity_id')` — Translated state
- `state_attr_translated('entity_id', 'attr')` — Translated attribute

### Areas (5)
- `areas()` — All area IDs
- `area_id('name')` — Area ID from name/entity/device
- `area_name('id')` — Area name from ID/entity/device
- `area_entities('area')` — Entity IDs in area
- `area_devices('area')` — Device IDs in area

### Devices (5)
- `device_id('entity_or_name')` — Device ID
- `device_name('id')` — Device name
- `device_attr('id', 'attr')` — Device attribute
- `is_device_attr('id', 'attr', 'value')` — Test device attribute
- `device_entities('device_id')` — Entities for device

### Entities (5)
- `integration_entities('integration')` — Entities for integration
- `config_entry_id('entity_id')` — Config entry ID
- `config_entry_attr('entry_id', 'attr')` — Config entry attribute
- `entity_name('entity_id')` — Friendly name
- `is_hidden_entity('entity_id')` — Hidden check

### Floors (5)
- `floors()` — All floor IDs
- `floor_id('name')` — Floor ID
- `floor_name('id')` — Floor name
- `floor_areas('floor')` — Areas on floor
- `floor_entities('floor')` — Entities on floor

### Labels (7)
- `labels()` / `labels('entity_id')` — All labels or labels for entity/device/area
- `label_id('name')` — Label ID
- `label_name('id')` — Label name
- `label_description('id')` — Label description
- `label_entities('label')` — Entities with label
- `label_devices('label')` — Devices with label
- `label_areas('label')` — Areas with label

### Date & Time (15)
- `now()` — Current local datetime
- `utcnow()` — Current UTC datetime
- `today_at('HH:MM')` — Today at time
- `as_timestamp(dt)` — To UNIX timestamp
- `as_datetime(ts)` — To datetime
- `as_local(dt)` — To local timezone
- `as_timedelta(str)` — Parse ISO duration
- `timedelta(days=, hours=, ...)` — Create timedelta
- `strptime(str, format)` — Parse time string
- `time_since(dt)` — Human-readable elapsed (`relative_time` deprecated)
- `time_until(dt)` — Human-readable remaining
- `timestamp_custom(ts, fmt)` — Format timestamp
- `timestamp_local(ts)` — Format as local
- `timestamp_utc(ts)` — Format as UTC

### Math (27)
abs, acos, asin, atan, atan2, average, bitwise_and, bitwise_or, bitwise_xor, clamp, cos, divisibleby, e, even, log, max, median, min, odd, pi, remap, sin, sqrt, statistical_mode, tan, tau, wrap

### Collections (30)
attr, batch, combine, dictsort, difference, first, flatten, from_json, groupby, intersect, items, last, length, map, merge_response, reject, rejectattr, reverse, select, selectattr, set, shuffle, slice, sort, sum, symmetric_difference, to_json, tuple, union, unique

### Regex (7)
match, regex_findall, regex_findall_index, regex_match, regex_replace, regex_search, search

### Type Conversion (29)
add, bool, boolean, callable, default, defined, false, float, float_test, in, int, integer, is_defined, is_number, iterable, list, mapping, multiply, none, number, round, sameas, sequence, string, string_test, tojson, true, typeof, undefined

### Strings (24)
capitalize, center, escape, filesizeformat, forceescape, format, indent, join, lower, ordinal, pprint, replace, safe, slugify, striptags, title, trim, truncate, upper, urlencode, urlize, wordcount, wordwrap, xmlattr

### Encoding (9)
base64_decode, base64_encode, from_hex, md5, pack, sha1, sha256, sha512, unpack

### Functional (14)
apply, as_function, contains, cycler, dict, iif, joiner, lipsum, namespace, ord, random, range, version, zip

### Repairs (2)
issue, issues

---

## I. Dashboard Architecture (Sections View / Project Grace)

### View Types (as of 2026.4)
1. **Sections** (default) — Grid-based, drag-and-drop, responsive Z-layout
2. **Masonry** — Column-based auto-packing (legacy default)
3. **Panel** — Single full-width card
4. **Sidebar** — Two columns (wide + narrow)

### Sections View Grid System
- Each section has an internal grid of cards
- Section widths are equal, laid out left→right (Z-pattern)
- Sections reflow responsively based on screen width
- Cards inside sections maintain relative position across screen sizes
- `--grid-max-section-count` CSS variable controls max sections per row (default: 4)
- Cards define size via `getGridOptions()` or `layout_options` in YAML

### View YAML Config
```yaml
views:
  - title: Home
    type: sections  # or masonry, panel, sidebar
    sections:
      - title: Living Room
        cards:
          - type: tile
            entity: light.living_room
            layout_options:
              grid_columns: 4
              grid_rows: 1
```

### View Configuration Variables
- `type` — View type (sections, masonry, panel, sidebar)
- `title` — View name
- `path` — URL path segment
- `icon` — MDI icon
- `show_icon_and_title` — Show both icon and title
- `badges` — Entity badges
- `cards` — Card list
- `background` — Background image config (image, opacity, size, alignment, repeat, attachment)
- `theme` — Override theme
- `visible` — User-based visibility
- `subview` — Mark as subview (no tab, back button)
- `back_path` — Custom back navigation path

---

## J. Config Entries

### Lifecycle States
not loaded → setup in progress → loaded / setup error / setup retry / migration error
loaded → unload in progress → not loaded / failed unload

### Key Methods
- `async_setup_entry(hass, entry)` — Set up config entry
- `async_unload_entry(hass, entry)` — Clean up on unload
- `async_remove_entry(hass, entry)` — Clean up on deletion
- `async_migrate_entry(hass, entry)` — Version migration

### Platform Forwarding
```python
await hass.config_entries.async_forward_entry_setups(config_entry, ["light", "sensor", "switch"])
```

### Config Subentries
Logically separate stored config into sub-parts (e.g., auth in entry, locations as subentries).

---

## K. Internationalization (i18n)

### strings.json Structure
```json
{
  "title": "Integration Name",
  "config": {
    "step": { "init": { "title": "...", "data": { "api_key": "API Key" } } },
    "error": { "invalid_api_key": "Invalid API key" },
    "abort": { "already_configured": "..." }
  },
  "entity": {
    "sensor": {
      "my_sensor": { "name": "My Sensor", "state": { "idle": "Idle" } }
    }
  },
  "services": {
    "my_action": { "name": "Name", "description": "Desc", "fields": {...} }
  },
  "exceptions": {
    "my_error": { "message": "Error with {param}" }
  }
}
```

### Key Categories
title, common, config, options, config_subentries, device, device_automation, entity, entity_component, exceptions, issues, selectors, services

### References
Use `[%key:component::sensor::entity_component::temperature::name%]` to reference existing translations.

---

## L. LovelaceYAML Deprecation Assessment

### Current Status (as of 2026-04-11)
- **No explicit deprecation timeline found** in any of the crawled documentation pages
- The HA docs still reference YAML-mode dashboards at `https://www.home-assistant.io/dashboards/`
- The developer docs still document `LovelaceYAML` patterns
- The `lovelace` integration remains a core dependency
- Sections view supports full YAML configuration

### What IS Happening
- **Project Grace** (Dashboard Chapter 1, March 2024) introduced Sections as the new default view
- UI-first approach is clearly the strategic direction
- YAML dashboards still work but receive less attention
- The default dashboard is now Sections view (formerly Masonry)

### Risk Assessment for LCARS Dashboard
- **Low immediate risk** — YAML mode still fully functional
- **Medium-term risk** — LovelaceYAML panel registration pattern could be deprecated
- **Mitigation strategy** — Monitor `homeassistant.components.lovelace` changes, consider strategy-based approach as alternative

### What Replaces It
- **Custom strategies** (`ll-strategy-*`) are the modern programmatic equivalent
- A dashboard strategy can generate full YAML-equivalent configs dynamically
- This is architecturally closer to what LCARS Dashboard does (auto-generation)

---

## M. Extending WebSocket API (Frontend Integration Pattern)

### Python-Side Registration
```python
from homeassistant.components import websocket_api

@websocket_api.websocket_command({
    vol.Required("type"): "my_domain/command",
    vol.Optional("entity_id"): str,
})
@callback  # For sync/in-memory operations
def ws_handler(hass, connection, msg):
    connection.send_result(msg["id"], {"key": "value"})

@websocket_api.websocket_command({...})
@websocket_api.async_response  # For I/O operations
async def ws_async_handler(hass, connection, msg):
    data = await fetch_data()
    connection.send_result(msg["id"], data)
    # Or on error:
    connection.send_error(msg["id"], "error_code", "Error message")

# Register:
websocket_api.async_register_command(hass, ws_handler)
```

### JavaScript-Side Calling
```js
// Promise-based (wait for response):
const resp = await hass.connection.sendMessagePromise({
  type: 'my_domain/command',
  entity_id: 'sensor.x',
});
console.log(resp.result);

// Fire-and-forget:
hass.connection.sendMessage({ type: 'my_domain/notify' });
```

---

## N. More Info Dialogs

To add a more-info dialog for a domain (core frontend only):
1. Add domain to `DOMAINS_WITH_MORE_INFO` in `/common/const.ts`
2. Create `more-info-<domain>.js` in `/dialogs/more-info/controls/`
3. Import in `/dialogs/more-info/more-info-content.ts`

**Note:** This is a core frontend modification, not available to custom integrations directly.

---

## O. Registering Resources

Custom cards/strategies/views are loaded as resources:
1. Place JS files in `<config>/www/` → accessible at `/local/`
2. Register as resource: UI (Settings → Resources) or YAML:
   ```yaml
   resources:
     - url: /local/my-card.js
       type: module
   ```
3. Our integration uses `add_extra_js_url` + `StaticPathConfig` to inject `lcars-dashboard.js` automatically.

---

*End of reference document. Total: 29 pages successfully crawled, ~200 distinct API/entity/template facts cataloged.*
