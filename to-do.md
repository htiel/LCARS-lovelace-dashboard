Level 1 Changes for 4.x.x
    
    1. **TODO** — Add BlueAir air purifier support to the environment panel. The Admiral has a Blue Pure 311i Max (via `ha_blueair` integration). Verify the environment panel's auto-detection heuristic picks up BlueAir devices — they may expose `fan` domain entities with speed control and possibly `sensor` entities for filter life. Similar to VeSync purifier handling.

    2. **IN PROGRESS** — Spec + CSS + color utilities done (v4.13.0). Renderer not yet implemented. Add standalone room temperature/humidity sensor grid support to the environment panel. The Admiral has 14+ SwitchBot meters (WoTHP) providing per-room temperature and humidity, plus a SwitchBot CO2 meter (WoTHPc). These are sensor-only devices (no controls) that should render as compact readout rows in the environment panel, similar to the existing sensor-only mode for monitor-only air quality devices.

    **IMPLEMENTATION NOTES:**
    - **Detection**: Devices with ≥2 of `device_class` in {`temperature`, `humidity`} but no `fan`/`air_quality` domain entities → render in sensor-only environment mode (no atmoscrubber cylinder, just the readout grid).
    - **CO2 meter**: If a SwitchBot device has `co2` or `carbon_dioxide` device_class, include it in the AQ sensor list — it should trigger the full atmoscrubber visualization.
    - **Multi-sensor rooms**: If a room has both a SwitchBot meter AND an Awair, group them under the same environment panel rather than creating duplicate panels.

    3. impliment an Power Pannel for power usage, empooira vue, kasa energy monitors, anything that provides voltage, wattage, or amps.  Some devices alos provide a switch. so in each room with shuch devices we should group them into a pane, left aligned (not under the existing pannles). under switches and lights or devices that do not have energy monitoring.  ther should be a distinct section in hte panel per device or circuit, if it has a switch that she be first, then the stats for the device, voltage can be just a number, but perhaps we can put smal graphs for the KW over time, amperage could aslo just be a pint in time number. Real time devices like the "Kasa Dog heating pad" in my json example is a good exapme of a device with a switch as are the powerstrips in the server room. The Emporia vue plug in provides a lot of data and does not have switches, but I do have a plan to reflash these Emporta Vues to ESP32 engermonitors.  Look up the specs for flashing an Emporia Vue to  ESP32 to get references to that. or check Eric's json file.  I want to be able to look at this for a room and see the devices, or for a virtual room like the area called "main panel" this is my electical panel with two emporia views in so no swithces just monitors.  You can use graphs, bar charts, doughnuts, etc. what ever makes sense and has good LCARS asthetics. Alos some of the devices are duplicate ahd hidden so make sure you respect the hidden devices.

    ESP32 sources to start.
    https://fuzznotes.com/posts/flash-emporia-vue-3-with-esphome/
    https://emporia-vue-local.github.io/docs/tutorial/configuration/
    https://medium.com/@rorygallagher2010/taking-my-data-back-removing-my-emporia-vue-electricity-monitor-from-the-cloud-7b67de716f24


    4. Archetecture, in prep for 5.0 I think we need to get out of monolithic files into a more OO archetecture if that is possible in HA.  Problem: we will break the ingel dashboard into mutiple dashboards, we will have a "habitat" which is the current area view where we nav by area and see everyting in the area, but will add views for things like "security" will will pull together all camera, alarms, motion sensors accross all rooms into a "single pane of glass"  I want to keep the individual pannels consistant acorss dashboars with an update once and the it updates all of the dashboards.  Train Data on proper software arhctecture for Python, js, or other languages needed for this. as well as what HA can do without breaking  My thogut is that we will have a group of code (code,css,etc.) per pannel that get incuded or called form the dashboard files.  If we want to chage say the media panel we will jsut edit that code and any dashboard that include the media panel will use that code block. so we should end up with a code block per spec sheet. and perhaps to take it a but further if there are common elements like the boarder that only changes color between pannels we can break the border out as well to help dirve consistancy and ease of editing for future updates. below are two sources I could find but search for more for java script or other languages. and make sure you look in the HA repos for examples.

    Sources for Data's education
https://en.wikipedia.org/wiki/Object-oriented_programming
https://realpython.com/python3-object-oriented-programming/





    
Breaking Changes and Rev to Versions 5.x.x
    
    
    
    1. Set up a new 5.0 branch with GitHub pre-release tags so users can opt in to the beta via HACS.

    **IMPLEMENTATION NOTES:**
    - Create `5.0` branch from current `4.0` HEAD.
    - Tag the last stable 4.x commit as a GitHub Release (e.g., `v4.10.3`) — **not** marked as pre-release. This anchors stable users.
    - Publish 5.0 work as GitHub Releases with pre-release tags (e.g., `v5.0.0-beta.1`, `v5.0.0-beta.2`) — **marked as pre-release**. Users enable "Show beta versions" in HACS to see these.
    - `4.0` stays the default branch and the stable HACS track. No changes to `hacs.json` needed on either branch.
    - When 5.0 is stable, publish a full release (`v5.0.0`), merge `5.0` into `4.0` (or rename `5.0` to default), and tag it as the new stable.
    - Document migration path in README on the `5.0` branch — what breaks, what to back up, how to switch.

    2. I want to change the way dashboards are created and be able to add more than just the one.
    2.1 Clean up the existing dashboard and remove the list view, make it just the area view, and rename the dashboard name from LCARS Dashboard to "Habitat."

    **IMPLEMENTATION NOTES:**
    - In `load_dashboard.py`, the dashboard is registered via `hass.data["lovelace"]["dashboards"]`. Change the `title` from "LCARS Dashboard" to "Habitat". Update `url_path` from `lcars-dashboard` to `habitat` (will break existing bookmarks — document as breaking change).
    - Remove the "list view" — this is likely `02.devices.yaml` or the more-pages views. Delete the view YAML and remove the corresponding entry from `ui-lovelace.yaml` views array.
    - Update `lcars-navigation-card.js` to remove any view-switching logic for the list view.

    2.2 Create a new root-level dashboard called "Security" and pull all of the locks, cameras, and other security-type sensors onto that dashboard, keeping the cards as designed but bringing a single security view.

    **IMPLEMENTATION NOTES:**
    - **Python side**: In `load_dashboard.py`, register a second Lovelace dashboard with `url_path: "security"`, `title: "Security"`. Each dashboard needs its own `ui-lovelace-security.yaml` template.
    - **Entity filtering**: New card (or reuse `lcars-homepage-card.js` with a `mode` config) that filters entities globally (all areas) by security-relevant criteria: `domain` in {`lock`, `camera`, `alarm_control_panel`, `binary_sensor`} where `device_class` in {`door`, `window`, `motion`, `occupancy`, `safety`, `tamper`, `smoke`, `gas`, `vibration`}.
    - **Layout**: Group by area (floor > area > entities). Cameras get their existing panel treatment. Locks/sensors get toggle/sensor renderers. Top-level summary bar: "3 doors open, 2 cameras active, all locks secured" type status.
    - **Card reuse**: The existing camera panel, sensor renderers, and toggle renderers can be shared. The new dashboard just uses a different entity selection filter.

    2.3 Create a new root-level dashboard called "Power" that brings together all the battery cards, other electrical sensors, power consumption, etc.

    **IMPLEMENTATION NOTES:**
    - Same pattern as security: new `ui-lovelace-power.yaml`, registered in `load_dashboard.py`.
    - Entity filter: `device_class` in {`battery`, `power`, `energy`, `voltage`, `current`} OR detected as battery panel device. Also pull in Emporia Vue energy monitoring entities.
    - Layout: Battery panels at top (existing warp core cards). Below: energy consumption sensors grouped by area/circuit. Could add a whole-home power summary bar at the top showing total consumption, solar generation, grid import/export.
    - Future: integrate with HA Energy dashboard data (`/api/energy/solar_forecast`, etc.).

    2.4 Create a new root-level dashboard called "Environmental" that pulls together all the air quality, thermostats, etc. cards into a single view.

    **IMPLEMENTATION NOTES:**
    - Entity filter: `device_class` in {`temperature`, `humidity`, `pm25`, `pm10`, `carbon_dioxide`, `volatile_organic_compounds`, `aqi`} OR `domain` in {`climate`, `fan`, `air_quality`, `humidifier`}.
    - Reuses the environment panel cards from 4.x item #1. Plus climate/thermostat panels.
    - Layout: Floor-grouped view. Each area shows its environment panel (if it has one) + standalone temp/humidity sensors. Top summary: indoor vs outdoor temp, worst AQI reading, any HVAC alerts.

    2.5 Add a lighting dashboard to see and control all lighting and switches in the house.

    **IMPLEMENTATION NOTES:**
    - **Entity filter**: `domain` in {`light`, `switch`}, plus `cover` entities with `device_class` in {`blind`, `curtain`, `shade`} since they affect lighting. Exclude `switch` entities that are already exposed as `light` via switch_as_x (check `hidden_by` on the switch side — same pattern as the v4.6.2 fix).
    - **Layout**: Floor-grouped view (reuse floor-nav pattern from 4.x #2). Each area shows its lights/switches grouped by device. For lights with `brightness` support, show a horizontal LCARS slider bar for dimming + color temp. For on/off-only lights and switches, show toggle pills.
    - **Summary header**: "12 LIGHTS ACTIVE / 47 TOTAL" status bar at top. Color breakdown: count by light color temperature (warm/cool/daylight) if `color_temp_kelvin` is available.
    - **Light groups**: If the user has HA light groups, render them as "master control" toggles at the top of each area — toggle dims/brightens all lights in the group. Individual lights below.
    - **Color lights**: For lights with `supported_color_modes` including `hs` or `rgb`, render a compact LCARS color picker strip — a row of preset color pills (warm white, cool white, red, blue, green, purple) plus a "custom" button that opens more-info. Keep it simple — most people use presets.
    - **Scene integration**: If `scene` entities exist that target lights in this area, render them as LCARS shortcut buttons at the bottom of the area section — e.g., "MOVIE MODE", "MORNING", "EVENING".
    - **Reference cards**: Mushroom Light Card (`piitaya/lovelace-mushroom`) — clean brightness slider + color temp arc. light-entity-card (`ljmerza/light-entity-card`) — per-feature controls (brightness, color temp, RGB). Neither is LCARS-styled but both show good entity capability detection.


Wesley Crusher's Recommendations
=================================

### Reference Cards to Borrow From

**For Environment Panel (4.x #1):**
- **mini-graph-card** (`kalkih/mini-graph-card`, 3.8k stars, MIT) — Self-contained SVG sparkline renderer ~4 KiB. `color_thresholds` with interpolation = AQI-to-LCARS-color mapping. `points_per_hour` + `aggregate_func` for lighter 24h history queries.
- **Mushroom Fan Card** (`piitaya/lovelace-mushroom`) — Clean `fan.set_percentage` / `fan.set_preset_mode` patterns, handles oscillation toggle and direction.

**For Security Dashboard (5.x #2.2):**
- **Mushroom Alarm Card** (`piitaya/lovelace-mushroom`) — `alarm_control_panel` service calls with PIN input. Mode-based icon switching → LCARS "alert condition" states (green/yellow/red).
- **Mushroom Lock Card** — Lock/unlock with confirmation dialog → LCARS "COMMAND AUTHORIZATION REQUIRED" dialog.
- **frigate-hass-card** (`dermotduffy/frigate-hass-card`, 1.5k+ stars, MIT) — Event timeline with detected objects over time → "tactical log" scrollable timeline of motion/person detection events.

**For Power Dashboard (5.x #2.3):**
- **power-flow-card-plus** (`flixlix/power-flow-card-plus`, 700+ stars) — Animated SVG power flow arrows (grid → home → battery → solar) with dots along paths. Retheme as EPS power grid schematic.
- **sankey-chart** (`MindFreeze/ha-sankey-chart`) — Sankey/flow diagrams for energy distribution → Federation power distribution diagram.
- **tesla-style-solar-power-card** (`reptilex/tesla-style-solar-power-card`) — Animated dot-along-path power flow, transferable to warp core I/O flow arrows.

**For Environmental Dashboard (5.x #2.4):**
- **simple-thermostat** (`nervetattoo/simple-thermostat`, 808 stars, MIT, LitElement/TS) — Setpoint controls, HVAC mode buttons, `faults` array pattern (binary sensors as header badges → "system alerts").
- **weather-card** (`bramkragten/weather-card`) — Outdoor conditions context next to indoor readings = "planetary sensor array readout."

**For Floor Navigation (4.x #2):**
- **Mushroom Strategy** (`DigiLive/mushroom-strategy`, v3.0, 633 stars) — `StrategyFloor` class iterates `hass.floors`, groups areas by `floor_id`, sorts by `level`. Validate `_getFloorEntities()` approach.


### Additional 5.0 Dashboard Ideas

**2.6 "Comm" — Communications & Media Dashboard**
- Entity filter: `domain` in {`media_player`, `tts`, `notify`, `stt`} + Assist/voice pipeline entities
- "Hailing frequencies" — all media players grouped by area with transport controls as LCARS pill buttons
- Intercom: ESP32-S3 + ESPHome voice satellites → show status, allow broadcast messages
- Commbadge animation: subtle pulse on area header when audio is playing

**2.7 "Ops" — Operations & Automation Dashboard**
- Entity filter: `domain` in {`automation`, `script`, `scene`, `input_boolean`, `input_select`, `schedule`, `timer`, `counter`}
- Automations with last-triggered timestamps, enabled/disabled toggle
- "Mission log" — scrollable timeline of recent automation executions from HA logbook API
- Manual scene/script triggers as LCARS "standing orders" buttons
- Group by HA labels (2024.4+) or by area

**2.8 "Stellar Cartography" — Network & Presence Dashboard**
- Entity filter: `domain` in {`device_tracker`, `person`, `zone`} + network integrations (UniFi, Netgear)
- Network topology: devices grouped by connection type (Wi-Fi, Ethernet, Zigbee, Thread, Bluetooth)
- Person tracking: who's home/away, zone-based status
- Device connectivity health: signal strength, bandwidth, uptime
- ESP32 BLE Proxy nodes per room → room-level presence on a floor plan


### Creative Enhancements to Existing Items

**4.x #1 — Environment Panel:**
- CSS `@property --aqi-hue` with `syntax: '<angle>'` — GPU-accelerated color interpolation for cylinder gradient without JS. Baseline: Widely Available (Jan 2025).
- AQI "alert condition" escalation: 0-50 = "All clear" (green), 51-100 = "Advisory" (yellow), 101-150 = "Yellow alert" (amber pulse), 150+ = "Red alert" (panel frame pulses red).
- Optional: Web Audio API ambient hum tied to fan speed — low-frequency oscillator (50-80Hz), gain mapped to fan.percentage/100. User preference toggle. *Worf flag: AudioContext requires user gesture.*

**4.x #2 — Floor Navigation:**
- "Deck numbering" config option — display floor names as "DECK 1", "DECK 2" etc. `level` from floor registry maps naturally.
- View Transition API (`document.startViewTransition()`) — vertical slide between floors like a turbolift. Baseline: Widely Available. Wrap in `prefers-reduced-motion`. Progressively enhances, fallback = instant swap.

**5.x #2.2 — Security Dashboard:**
- **"Red Alert" mode**: When `alarm_control_panel` state = `triggered`, entire frame elbows/bars pulse `--lcars-tomato` ↔ `--lcars-black`. Optional klaxon via Web Audio (opt-in).
- Camera grid as "Tactical Display": 2×2 / 3×2 grid with corner brackets (viewscreen frame). Active = bright border, offline = dimmed + "NO SIGNAL" overlay.

**5.x #2.3 — Power Dashboard:**
- "Warp Core Status" summary header: total stored kWh, current draw W, estimated runtime. Horizontal LCARS bar graph depleting left-to-right.
- EPS Power Grid SVG schematic with animated dots along paths. `--lcars-ice` normal, `--lcars-tomato` overcurrent, `--lcars-gold` charging.
- 7-day energy consumption bar chart using HA long-term statistics API. Pill-shaped bars with `border-radius`.

**5.x #2.5 — Config Flow:**
- Allow dashboard renaming in options flow (e.g., "Bridge" instead of "Habitat"). Store in `entry.options["dashboard_names"]`.
- Dashboard icon selection: `mdi:home-group` (Habitat), `mdi:shield-lock` (Security), `mdi:lightning-bolt` (Power), `mdi:leaf` (Environmental).


### Web APIs to Adopt

| API | Baseline | Use | Priority |
|-----|----------|-----|----------|
| **Popover API** (`popover` attr) | Widely Available | Replace `lcars-popup.js` — zero-JS top layer, light-dismiss, focus trapping, Escape to close. Animate with `@starting-style` + `transition-behavior: allow-discrete`. Major accessibility win. | HIGH |
| **View Transition API** | Widely Available | Area/floor switching crossfades. `view-transition-name` on key elements. Turbolift deck transitions. | HIGH |
| **Scroll-Driven Animations** | Newly Available (Chrome 115+, FF 144+, Safari 18.4+) | Panels "power up" as they scroll into viewport. `animation-timeline: view()` draws LCARS frame borders on entry. Wrap in `@supports`. | MEDIUM |
| **`text-wrap: balance`** | Widely Available | Panel headers / area names — prevents orphan words on multi-line headings. Trivial to add. | LOW |
| **CSS Anchor Positioning** | Limited (Chrome 125+ only) | Future tooltips/popovers anchored to telemetry values. Monitor for broader support. | EXPLORE |
| **`field-sizing: content`** | Newly Available | Config/search text inputs auto-size to content. | LOW |


### IoT / ESPHome Ideas

- **mmWave Presence** — ESP32-C3 + HLK-LD2410B per room (~$8/node). `binary_sensor.room_occupancy`. Rooms with detected presence get brighter nav button + "life signs detected" indicator. ESPHome YAML, no C++.
- **Voice "Computer"** — ESP32-S3 + Micro Wake Word + I2S mic/speaker → "Computer, red alert" triggers automations. Show as "comm terminals" on Comm dashboard.
- **NFC Access Panels** — ESP32 + PN532 NFC at entry points. Tag scan → `tag_scanned` event → arm/disarm/unlock. Show as "access log entries" on Security dashboard.


### Priority Summary

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| HIGH | Popover API migration for popups | Accessibility + code reduction | Medium |
| HIGH | View Transition API for area/floor switching | Polish, Trek feel | Low |
| HIGH | mini-graph-card sparkline pattern for env panel | Lightweight history viz | Low |
| MEDIUM | Scroll-driven animations for panel entry | Visual delight | Low |
| MEDIUM | "Comm" dashboard (2.6) | Unique Trek feature | Medium |
| MEDIUM | power-flow-card-plus patterns for Power dashboard | Animated EPS grid | Medium |
| MEDIUM | Red Alert mode on Security dashboard | Signature feature | Low |
| LOW | `text-wrap: balance` on headings | Polish | Trivial |
| LOW | "Ops" dashboard (2.7) | Power user feature | Medium |
| LOW | Web Audio ambient hum | Immersion | Low |
| EXPLORE | CSS Anchor Positioning for tooltips | Future, limited support | — |
| EXPLORE | mmWave presence indicators in nav | Hardware dependency | Variable |

*Geordi flags*: View Transitions, Popover API, and scroll-driven animations all need `prefers-reduced-motion` wrapping per WCAG 2.3.3.
*Worf flags*: Web Audio requires user gesture. NFC tag automations must validate tag IDs server-side. Do NOT adopt any `EVAL:` patterns from referenced cards — arbitrary JS execution from config is a vector.

    2.6 create a configurations setting on the integrateon setup page that allows the user to "subscribe" to the different dashboards that they want to add.  allow this to be reconfigured as needed

    **IMPLEMENTATION NOTES:**
    - **Config flow**: Update `config_flow.py` to add an `OptionsFlow` step. Present checkboxes: `☑ Habitat (areas)`, `☑ Security`, `☐ Power`, `☐ Environmental`. Store selections in `entry.options["dashboards"]` as a list of strings.
    - **Dashboard registration**: In `load_dashboard.py`, read `entry.options.get("dashboards", ["habitat"])` and only register the selected dashboards. On options update (user changes selection), unregister removed dashboards and register new ones — HA supports `hass.data["lovelace"]["dashboards"].pop(url_path)` for removal.
    - **Default**: Only "Habitat" enabled by default. Others opt-in. This keeps the initial experience simple.
    - **UI**: The options flow should also allow renaming each dashboard (e.g., user wants "Bridge" instead of "Habitat").
    - **Schema**: Use `vol.Optional(CONF_DASHBOARDS, default=["habitat"]): cv.multi_select({"habitat": "Habitat (Areas)", "security": "Security", "power": "Power Systems", "environmental": "Environmental", "lighting": "Lighting"})` in the options schema.

