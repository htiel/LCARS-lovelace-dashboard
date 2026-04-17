# LCARS Dashboard — 5.x Backlog

> Beta branch (`5.0`). Breaking changes — multi-dashboard architecture, config flow picker.
> Merge direction: 4.0 → 5.0 periodically. Never 5.0 → 4.0.

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped — listed for context until next release |

---

## Epic 1 · Branch & Release Setup

### 5X-1 · Create 5.0 Branch + HACS Beta Track — `TODO` · Priority: CRITICAL · Size: S

Set up the `5.0` branch with GitHub pre-release tags so users can opt in via HACS.

**Implementation notes**:
- Create `5.0` branch from current `4.0` HEAD
- Tag last stable 4.x commit as a GitHub Release (not pre-release) — anchors stable users
- Publish 5.0 work as GitHub Releases with pre-release tags (`v5.0.0-beta.1`, etc.)
- `4.0` stays default branch and stable HACS track. No changes to `hacs.json` on either branch.
- When 5.0 is stable: publish `v5.0.0`, merge into `4.0`, tag as new stable
- Document migration path in README on `5.0` branch

**Depends on**: 4X-4 (architecture refactor) should land first

---

## Epic 2 · Multi-Dashboard Architecture

### 5X-2.0 · Dashboard Registration Framework — `TODO` · Priority: CRITICAL · Size: L

Rework `load_dashboard.py` to support registering multiple independent Lovelace dashboards, each with its own YAML template, entity filter, and layout.

**Pattern**: Each dashboard = `url_path` + `title` + `ui-lovelace-{name}.yaml` + entity filter config.

---

### 5X-2.1 · "Habitat" Dashboard (Rename + Cleanup) — `TODO` · Priority: HIGH · Size: M

Rename existing dashboard from "LCARS Dashboard" to "Habitat." Remove the list/devices view — area view only.

**Breaking changes**:
- `url_path`: `lcars-dashboard` → `habitat` (bookmarks break)
- List view removed

**Implementation notes**:
- `load_dashboard.py`: Change `title` → "Habitat", `url_path` → `habitat`
- Remove `02.devices.yaml` (or equivalent) from `ui-lovelace.yaml` views array
- Update `lcars-navigation-card.js` to remove list-view switching logic

---

### 5X-2.2 · "Security" Dashboard — `TODO` · Priority: HIGH · Size: L

Single pane of glass for all locks, cameras, alarm panels, and security sensors across all areas.

**Entity filter**: `domain` in {`lock`, `camera`, `alarm_control_panel`, `binary_sensor`} where `device_class` in {`door`, `window`, `motion`, `occupancy`, `safety`, `tamper`, `smoke`, `gas`, `vibration`}

**Layout**: Floor → Area → Entities. Summary bar: "3 doors open, 2 cameras active, all locks secured."

**Creative enhancements** (Wesley):
- "Red Alert" mode: `alarm_control_panel` triggered → frame elbows/bars pulse tomato ↔ black. Optional klaxon via Web Audio (opt-in).
- Camera grid as "Tactical Display": 2×2/3×2 grid with viewscreen-frame corner brackets.

**Reference cards**: Mushroom Alarm/Lock Cards, `frigate-hass-card` (event timeline).

---

### 5X-2.3 · "Power" Dashboard — `TODO` · Priority: HIGH · Size: L

All battery panels, electrical sensors, power consumption in one view.

**Entity filter**: `device_class` in {`battery`, `power`, `energy`, `voltage`, `current`} + Emporia Vue entities.

**Layout**: Battery warp cores at top. Energy consumption grouped by area/circuit below. Whole-home summary bar (total consumption, grid import/export).

**Creative enhancements** (Wesley):
- "Warp Core Status" header: total stored kWh, current draw W, estimated runtime. Horizontal depleting bar.
- EPS Power Grid SVG schematic with animated dots along paths.
- 7-day energy consumption bar chart using HA long-term statistics API.

**Reference cards**: `power-flow-card-plus`, `sankey-chart`, `tesla-style-solar-power-card`.

---

### 5X-2.4 · "Environmental" Dashboard — `TODO` · Priority: MEDIUM · Size: L

All air quality, thermostats, climate, humidity in one view.

**Entity filter**: `device_class` in {`temperature`, `humidity`, `pm25`, `pm10`, `carbon_dioxide`, `volatile_organic_compounds`, `aqi`} OR `domain` in {`climate`, `fan`, `air_quality`, `humidifier`}

**Layout**: Floor-grouped. Each area shows environment panel + climate panels + standalone sensors. Top summary: indoor vs outdoor temp, worst AQI, HVAC alerts.

**Reference cards**: `simple-thermostat`, `weather-card`.

---

### 5X-2.5 · "Lighting" Dashboard — `TODO` · Priority: MEDIUM · Size: L

All lighting and switches in one view.

**Entity filter**: `domain` in {`light`, `switch`, `cover`} (blinds/shades). Exclude `switch` entities already exposed as `light` via switch_as_x.

**Layout**: Floor-grouped. Brightness sliders for dimmable lights, toggle pills for on/off. Summary: "12 LIGHTS ACTIVE / 47 TOTAL."

**Features**:
- Light groups → master control toggles per area
- Color lights → preset color pills (warm white, cool white, red, blue, green, purple) + custom
- Scene integration → LCARS shortcut buttons ("MOVIE MODE", "MORNING", "EVENING")

**Reference cards**: Mushroom Light Card, `light-entity-card`.

---

### 5X-2.6 · Dashboard Config Flow (Subscribe/Unsubscribe) — `TODO` · Priority: HIGH · Size: M

Integration options flow that lets users select which dashboards to enable.

**Implementation notes**:
- Update `config_flow.py` → `OptionsFlow` step with checkboxes: Habitat, Security, Power, Environmental, Lighting
- Store in `entry.options["dashboards"]` as list of strings
- `load_dashboard.py` reads options, registers/unregisters dashboards on change
- Default: only "Habitat" enabled
- Allow renaming dashboards (e.g., "Bridge" instead of "Habitat")
- Schema: `vol.Optional(CONF_DASHBOARDS, default=["habitat"]): cv.multi_select({...})`

---

## Epic 3 · Additional Dashboards (Wesley's Ideas)

### 5X-3.1 · "Comm" — Communications & Media Dashboard — `TODO` · Priority: MEDIUM · Size: L

**Entity filter**: `domain` in {`media_player`, `tts`, `notify`, `stt`} + Assist/voice pipeline entities

- "Hailing frequencies" — all media players grouped by area with transport controls as LCARS pill buttons
- Intercom: ESP32-S3 + ESPHome voice satellites → show status, allow broadcast messages
- Commbadge animation: subtle pulse on area header when audio is playing

---

### 5X-3.2 · "Ops" — Operations & Automation Dashboard — `TODO` · Priority: LOW · Size: L

**Entity filter**: `domain` in {`automation`, `script`, `scene`, `input_boolean`, `input_select`, `schedule`, `timer`, `counter`}

- Automations with last-triggered timestamps, enabled/disabled toggle
- "Mission log" — scrollable timeline from HA logbook API
- Scene/script triggers as LCARS "standing orders" buttons
- Group by HA labels (2024.4+) or by area

---

### 5X-3.3 · "Stellar Cartography" — Network & Presence Dashboard — `TODO` · Priority: LOW · Size: XL

**Entity filter**: `domain` in {`device_tracker`, `person`, `zone`} + network integrations (UniFi, Netgear)

- Network topology by connection type (Wi-Fi, Ethernet, Zigbee, Thread, Bluetooth)
- Person tracking: home/away, zone-based
- Device health: signal strength, bandwidth, uptime
- ESP32 BLE Proxy nodes per room → room-level presence

---

## Wesley's IoT / Hardware Ideas (Backlog — Unscheduled)

### mmWave Room Presence
ESP32-C3 + HLK-LD2410B per room (~$8/node). `binary_sensor.room_occupancy`. Rooms with presence get brighter nav button + "life signs detected." ESPHome YAML, no C++.

### Voice "Computer"
ESP32-S3 + Micro Wake Word + I2S mic/speaker → "Computer, red alert" triggers automations. Show as "comm terminals" on Comm dashboard.

### NFC Access Panels
ESP32 + PN532 NFC at entry points. Tag scan → `tag_scanned` event → arm/disarm/unlock. Show as "access log" on Security dashboard. *Worf: validate tag IDs server-side.*

---

## Wesley's Reference Card Index

| Panel/Dashboard | Card | Repo | Stars | Notes |
|-----------------|------|------|-------|-------|
| Environment | mini-graph-card | `kalkih/mini-graph-card` | 3.8k | SVG sparkline, color thresholds |
| Environment | Mushroom Fan Card | `piitaya/lovelace-mushroom` | — | fan.set_percentage patterns |
| Security | Mushroom Alarm Card | `piitaya/lovelace-mushroom` | — | alarm_control_panel + PIN |
| Security | Mushroom Lock Card | `piitaya/lovelace-mushroom` | — | Lock/unlock + confirmation |
| Security | frigate-hass-card | `dermotduffy/frigate-hass-card` | 1.5k+ | Event timeline |
| Power | power-flow-card-plus | `flixlix/power-flow-card-plus` | 700+ | Animated SVG power flow |
| Power | sankey-chart | `MindFreeze/ha-sankey-chart` | — | Sankey/flow diagrams |
| Power | tesla-style-solar-power-card | `reptilex/tesla-style-solar-power-card` | — | Dot-along-path power flow |
| Environmental | simple-thermostat | `nervetattoo/simple-thermostat` | 808 | Setpoint controls, fault badges |
| Environmental | weather-card | `bramkragten/weather-card` | — | Outdoor conditions |
| Floor Nav | Mushroom Strategy | `DigiLive/mushroom-strategy` | 633 | Floor iteration, area grouping |
| Lighting | Mushroom Light Card | `piitaya/lovelace-mushroom` | — | Brightness slider + color arc |
| Lighting | light-entity-card | `ljmerza/light-entity-card` | — | Per-feature controls |
