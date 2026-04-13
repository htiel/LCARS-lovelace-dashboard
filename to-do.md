Level 1 Changes for 4.x.x
    1. ✅ **DONE (v4.7.0, a56c748)** — Environment panel with atmoscrubber cylinder, AQ detection heuristic, entity partitioning, 24h sparklines, fan preset controls, panel ordering. Using the card framework, make an "environment" card that brings together the area's air quality, temperature, humidity, air purifier type sensors, controls, and fans. Modeled like the battery card where the display is a cylinder with air flowing through it tied to the fan speed of the air purifier if there is one, sensors or diagnostics to the left, controls and switches to the right, graphed 24-hour history of the quality sensors under where the power graphs are in the battery card. Make sure this card sits under the security card but above the battery card. Consult all agents.

    **IMPLEMENTATION NOTES:**
    - **Detection**: New `PANEL_TYPE_ENVIRONMENT` in `_getDevicePanelType()`. Trigger: device has ≥2 of: `device_class` in {`temperature`, `humidity`, `pm25`, `pm10`, `volatile_organic_compounds`, `carbon_dioxide`, `aqi`} OR domain is `fan`/`air_quality`. Covers Awair Elements, ecobee, standalone fans.
    - **Partition**: New `_partitionEnvironmentEntities(entries, categoryEntities)` → `{ quality[], climate[], fans[], controls[], diagnostics[] }`. Quality = AQI/PM/VOC/CO2 sensors. Climate = temp/humidity. Fans = fan domain entities. Controls/diagnostics via existing `_getDeviceCategoryEntities()`.
    - **Visualization**: Center column = CSS cylinder ("atmoscrubber") with animated particle dots flowing upward. Speed tied to `fan.speed_percentage` or `fan.percentage` attribute. Color shifts: green (good AQI) → yellow → orange → red (hazardous). Idle = slow ambient drift.
    - **History graph**: Bottom row (replacing I/O flow area). Use HA's `history` API via `this._hass.callWS({ type: 'history/history_during_period', ... })` for 24h of quality sensors. Render as simple SVG sparklines — one line per sensor (AQI, PM2.5, temp, humidity) with color-coded traces. Keep it lightweight — no charting library.
    - **Panel ordering**: In `_renderAreaContent()`, sort `panelDevices` by type: camera → environment → battery. Add `PANEL_ORDER` const map.
    - **Bundle impact**: Estimate +5-8 KiB for panel renderer + CSS + sparkline SVG generation.
    - **Agent consults**: Geordi (cylinder design, color mapping, sparkline layout), Data (history API integration, partition logic), Wesley (particle animation tied to fan speed).

    **REFERENCE: [purifier-card](https://github.com/denysdovhan/purifier-card) (v2.8.0, MIT, LitElement/TS)**
    Patterns to borrow or adapt:
    - **AQI display with leading-zero formatting**: Their `renderAQI()` pads values < 10 with `00`, < 100 with `0` in a dimmed `number-off` class. Good LCARS aesthetic — adapt with monospace LCARS font and `--lcars-orange` active / `--lcars-gray` dim.
    - **Round-slider for fan speed**: They use the `round-slider` custom element for percentage control. We could adapt this as a vertical or horizontal LCARS slider bar rather than a circular one — more on-brand — but the service call pattern (`fan.set_percentage`, `fan.set_preset_mode`) is directly reusable.
    - **Preset mode shortcuts toolbar**: Their toolbar renders preset_mode buttons (Silent, Auto, 25%, 50%, etc.) with active highlighting. Map this to our LCARS option strip pattern (pill buttons, gold=active) already built for battery config selects. Reuse `fan.set_preset_mode` service call.
    - **Stats section**: Row of stat blocks (attribute or entity value + unit + subtitle) with dividers. Similar to our telemetry row — keep our LCARS grid layout but borrow their flexible `entity_id OR attribute` resolution pattern for showing filter life, motor speed, etc.
    - **State-dependent image swap**: They swap `purifier-working.gif` / `purifier-standby.png` based on `state === 'on'`. Our cylinder animation should similarly pause/dim when fan is off — use CSS `animation-play-state: paused` tied to entity state rather than swapping images.
    - **What NOT to borrow**: Their round card layout, `ha-card` wrapper (we render inside our panel grid), `custom-card-helpers` dependency (we use direct hass API), GIF-based animation (we'll use CSS/SVG), `ha-template` for Jinja2 eval (unnecessary complexity for our auto-discovered entities).

    2. ✅ **DONE (v4.9.0)** — Floor-grouped area navigation with combined floor view, drill-down to area, map-based entity cache. Arrange the area dashboard by floor in the navbar using the area configuration, so each floor gets its sections and the areas are below the floor. If I click on the floor it should combine all the devices in that floor in a single view, and then I can drill down by selecting the actual room/area.

    **IMPLEMENTATION NOTES:**
    - **Data source**: `this._hass.floors` (HA floor registry, available since HA 2024.2+). Each floor has `floor_id`, `name`, `level` (integer sort order), and `icon`. Areas have `floor_id` linking to their floor.
    - **Navigation card changes**: In `lcars-navigation-card.js`, group area buttons by floor. Render floor headers as wider LCARS separator bars (full sidebar width, different color — e.g., `--lcars-lilac`). Floor button click sets `selectedFloor` instead of `selectedArea`.
    - **Floor view**: When a floor is selected (not an area), `_getAreaEntities()` needs a floor-level variant `_getFloorEntities(floorId)` that unions all entities from all areas on that floor. Render as a combined view with area-name subheaders within each device group.
    - **Drill-down**: Click floor → shows combined floor view. Click area under floor → standard area view. Back button or floor re-click returns to floor view.
    - **Fallback**: Areas with no `floor_id` get grouped under an "Unassigned" section at the bottom.
    - **CSS**: Floor header buttons get distinct styling — taller, different color, maybe small floor icon. Area buttons remain as-is but indented or smaller under their floor.
    - **Bundle impact**: ~2-3 KiB. Mostly logic changes in nav card + minor CSS.

    3. ✅ **DONE (v4.10.1–4.10.3)** — Full agent audit pass: Data logic fixes, Worf security hardening, Geordi accessibility pass, elbow alignment fix, brand/ images for HACS.

    **COMPLETED FIXES:**
    - **v4.10.1 (HIGH/CRITICAL)**: D1 config loading guard, D5 env cache cap, D7 timer cleanup, D8 div-by-zero guard, D9 dead property removal, D10 MutationObserver timeout, W-H1 path validation on 21 schemas + safe_path for rmtree, W-H2 SandboxedEnvironment scoped to config dir, W-M1 require_admin on read endpoints
    - **v4.10.2 (MEDIUM/LOW)**: P1 semantic headings (h2/h3/h4), P2 main element landmark, P6 aria-hidden decorative bars, P8/P9 contrast fixes (gray→sky), O1/R2 keyboard on total-lines, O2/R1 slider ARIA + keyboard, O3 sensor-line keyboard, O4 edit pip keyboard + focus-visible, W-L1 debug log level
    - **v4.10.3**: Elbow stem alignment with area buttons (elbow-w 9.5→10.5rem, removed +2rem cutout offset, inner curve 1.5rem)
    - **Brand images**: Created `brand/` directory with icon.png, icon@2x.png, logo.png, logo@2x.png for HA 2026.3+ integration branding

    Full pass for each agent. Worf should make sure there is no code injection risk of people naming devices and causing security issues. Geordi should do a full accessibility pass making sure tab orders are correct and heading levels guide the screen reader from area, device, entities, etc.



Breaking Changes and Rev to Versions 5.x.x
    1. Set up a new 5.0 branch, so users could stay on 4.0 or select version 5.0 in HACS.

    **IMPLEMENTATION NOTES:**
    - Create `5.0` branch from current `3.0` HEAD. The `3.0` branch name is legacy from the Dwains fork — consider renaming to `main` or `stable` at this point.
    - HACS uses the `hacs.json` `"homeassistant"` field and GitHub release tags for version selection. To let users pick v4 vs v5: (a) tag the last 4.x commit (e.g., `v4.7.x`), (b) set up GitHub Releases with separate release tracks, (c) update `hacs.json` on the 5.0 branch with the new version.
    - Consider: HACS "default" branch in `hacs.json` controls which branch users get. You could set `"default_branch": "5.0"` while keeping `3.0` as a selectable alternative, or use HACS version constraints.
    - Document migration path in README — what breaks, what to back up, how to switch branches.

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

