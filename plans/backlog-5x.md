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

## Epic 0 · v5.0.1 Stabilization (QA Review — beta.7)

> Compiled from full QA review by Geordi (A11y/LCARS), Wesley (UX/Innovation), Data (HA Standards), Worf (Security), and Riker (Priority Triage).
> Deduplicated and sorted by implementation priority. Legacy alias IDs preserved for traceability.

### Batch 1 · Security Blockers

#### 5X-B09 · Restrict Static Asset Exposure — `DONE` · Priority: CRITICAL · Size: S · WSJF: 7.50
`load_plugins.py` registers the entire `js/` directory as a public static path, exposing `package.json`, `webpack.config.js`, `src/`, and `vendor/` to all authenticated users. Only the compiled bundle and `.LICENSE.txt` should be served.
**Aliases**: WORF-SEC-001
**OWASP**: A05:2021 — Security Misconfiguration

#### 5X-B10 · Enforce `!include` Path Boundaries — `DONE` · Priority: CRITICAL · Size: S · WSJF: 6.50
`_include_yaml` in `process_yaml.py` resolves paths with `os.path.abspath` but does not validate the result stays within the HA config directory. `_safe_path` exists in `__init__.py` but is not applied here.
**Aliases**: WORF-SEC-003
**OWASP**: A03:2021 — Injection (Path Traversal)

#### 5X-B01 · Replace Sidebar Auto-Reorder Hack — `DONE` · Priority: CRITICAL · Size: M · WSJF: 5.00
Remove `_apply_sidebar_order`'s private API (`async_user_store`) dependency. It crosses user-isolation boundaries (writes to ALL users), accepts unvalidated order items, and fails silently for non-admin users. The JS-side `ensureLcarsSidebarTop()` is the correct approach — remove the Python backend hack entirely.
**Aliases**: 5X-B01, WORF-SEC-002, WORF-SEC-004, WORF-SEC-008

#### 5X-B11 · Cap Blueprint YAML Depth and Complexity — `DONE` · Priority: HIGH · Size: M · WSJF: 3.33
`ws_handle_install_blueprint` has a 256KB size limit but no nesting depth or key count limit. `yaml.safe_load` prevents code execution but not resource exhaustion via deeply nested structures.
**Aliases**: WORF-SEC-006

### Batch 2 · Functional Beta Blockers

#### 5X-B03 · System Automation Must Render LCARS, Not Raw HA Cards — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
System Automation area renders default HA cards instead of LCARS-styled surfaces. Classification gap — automations/scripts not routed through LCARS rendering pipeline.
**Aliases**: GEO-504, WC5-001, 5X-B03

#### 5X-B04 · Fix Camera Proxy 500s During Area Navigation — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
HTTP 500 errors from camera proxy endpoints when navigating between areas. Likely race condition on camera stream teardown/setup.
**Aliases**: 5X-B04

#### 5X-B15 · Filter Camera-Derived CO/Alarm Noise from Life Support — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.00
Camera diagnostic CO/alarm sensors should not appear on Life Support. These are camera subsystem sensors, not real safety devices.
**Aliases**: WC5-003

#### 5X-B08 · Handle Unadopted UniFi Cameras — `DONE` · Priority: HIGH · Size: M · WSJF: 3.67
Unadopted cameras show ambiguous "ADOPT DEVICE" CTA. Either filter unadopted cameras or render an explicit recovery state.
**Aliases**: GEO-506, 5X-B08

### Batch 3 · Accessibility and Semantics

#### 5X-B05 · Fix Summary Bar Contrast Across Dashboards — `DONE` · Priority: CRITICAL · Size: M · WSJF: 4.67
Engineering and Life Support summary bars have WCAG contrast failures — colored text on colored backgrounds compounded by 0.6 opacity on labels. Shared summary-bar CSS treatment inconsistent across dashboards.
**Aliases**: GEO-501, GEO-502, GEO-507, GEO-517

#### 5X-B13 · Add Accessible Labels for Truncated Sidebar Buttons — `DONE` · Priority: CRITICAL · Size: S · WSJF: 5.00
Sidebar area buttons with truncated names have no `title` attribute or `aria-label`, making them undiscoverable to keyboard and assistive-tech users.
**Aliases**: GEO-503

#### 5X-B02 · Humanize Update-Domain State Text — `DONE` · Priority: CRITICAL · Size: S · WSJF: 5.50
`update` domain entities show raw "OFF" instead of meaningful LCARS copy like "UP TO DATE" or "UPDATE AVAILABLE". Also affects "Firmware: OFF" display.
**Aliases**: GEO-510, WC5-004, 5X-B02

#### 5X-B14 · Hide Media Transport in Paused/Standby — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.50
Media transport controls visible when player is paused, idle, or standby. Carry-forward from 4X-63.
**Aliases**: GEO-505, 4X-63

#### 5X-B07 · Guard Battery 0% with Availability Context — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.00
Bare "0%" displayed without distinguishing unavailable/unknown/no-telemetry from genuinely depleted battery.
**Aliases**: GEO-511, WC5-008, 5X-B07

### Batch 4 · Shell, Layout, and Navigation

#### 5X-B17 · Compact Sparse Areas and Cap Deck Scroll Length — `TODO` · Priority: MEDIUM · Size: L · WSJF: 2.20
Single-light and low-entity areas waste 80%+ viewport. Deck/floor view expands to 7800px+ unusable scroll. Absorbs the sparse-room portion of the Neetwork complaint.
**Aliases**: WC5-002, WC5-005, GEO-514, WC5-007

#### 5X-B16 · Restore Navigation and Floor Context While Scrolling — `TODO` · Priority: HIGH · Size: M · WSJF: 3.00
No active dashboard indicator in cross-dashboard nav. Floor context lost during long illumination scroll. Floor separators lack color-blind clarity.
**Aliases**: WC5-009, WC5-012, GEO-515

#### 5X-B25 · Add Cross-Dashboard Deep Links — `TODO` · Priority: LOW · Size: M · WSJF: 1.33
Link related panels/destinations directly once shell/nav state is reliable.
**Aliases**: WC5-014

### Batch 5 · Panel Semantics and Visual Polish

#### 5X-B18 · Fix EV Charger Empty-State Regression — `DONE` · Priority: CRITICAL · Size: S · WSJF: 4.00
EV charger panel renders empty with N/A values. Show actionable empty-state copy or suppress panel when no valid data exists.
**Aliases**: WC5-010

#### 5X-B06 · Normalize Shortened Labels and Remove Redundant Suffixes — `DONE` · Priority: HIGH · Size: M · WSJF: 3.00
`_shortenName()` leaves model-number tails, repeated area names, and tactical sensor redundancy in truncated names.
**Aliases**: GEO-509, WC5-006, 5X-B06, 4X-62

#### 5X-B19 · Improve Tactical Status Affordances — `DONE` · Priority: HIGH · Size: S · WSJF: 3.50
Missing tactical camera summary badge. Red-alert threshold animation doesn't match actual alarm state.
**Aliases**: WC5-011, GEO-513

#### 5X-B20 · Improve Environmental Telemetry Readability — `DONE` · Priority: HIGH · Size: S · WSJF: 3.00
AQI meter scale ambiguous. Life Support sparklines too small to read at a glance.
**Aliases**: GEO-512, WC5-013

#### 5X-B23 · Remove `require()` from Render Template Path — `TODO` · Priority: MEDIUM · Size: S · WSJF: 2.00
Anti-pattern in template/render path that should be eliminated before it spreads.
**Aliases**: GEO-516

### Batch 6 · Deferred Hardening

#### 5X-B12 · Audit and Selectively Update npm Dependencies — `TODO` · Priority: MEDIUM · Size: L · WSJF: 1.80
Targeted audit/update constrained by `lit-html` 1.x compatibility limits. Should follow beta blockers to avoid toolchain destabilization.
**Aliases**: WORF-SEC-005

### Triaged Out (Not LCARS Code Defects)

- **GEO-508** — "DINNING ROOM" is a Home Assistant area naming typo, not an LCARS defect
- **GEO-514 / WC5-007** (naming portion) — "Neetwork" is HA naming drift; sparse-layout symptom carried in 5X-B17

### Quick Wins (Size S)
5X-B09, 5X-B10, 5X-B13, 5X-B02, 5X-B14, 5X-B07, 5X-B18, 5X-B20, 5X-B23, 5X-B19

### Larger Refactors (Size M–L)
5X-B01, 5X-B03, 5X-B04, 5X-B08, 5X-B11, 5X-B16, 5X-B17, 5X-B12

### Summary
| Severity | Total | Done | Remaining |
|----------|-------|------|-----------|
| CRITICAL | 12 | 12 | 0 |
| HIGH | 7 | 5 | 2 |
| MEDIUM | 3 | 0 | 3 |
| LOW | 1 | 0 | 1 |
| **Total** | **23** | **17** | **6** |

---

## Epic 3 · Tactical Dashboard Enhancements

> Identified by Wesley's gap analysis against real-world security dashboards (Dwains, SmartFace, UniFi Protect, SimpliSafe).

#### 5X-TAC-1 · Tactical Log — Event Timeline — `TODO` · Priority: HIGH · Size: M
24h event timeline below the camera grid. Scrollable column of LCARS pills showing door/motion/alarm events with timestamps, entity names, and severity coloring (tomato=breach, sunflower=motion, ice=seal/arrive, gray=clear).
**Data source**: `logbook/get_events` WS API filtered to tactical entity IDs, capped at ~20 entries.

#### 5X-TAC-2 · Crew Manifest — Person/Presence Awareness — `TODO` · Priority: HIGH · Size: S
Compact row of person entity pills in the summary bar area. Shows who's home/away with status colors (butterscotch=home, gray=away, ice=custom zone). Adds `person` domain to tactical entity scope.

#### 5X-TAC-3 · Viewscreen Focus — Tap-to-Enlarge Camera — `TODO` · Priority: MEDIUM · Size: M
Tapping a camera tile expands it to full grid width with remaining cameras in a filmstrip row below. Tap again to de-focus. CSS grid state management only — no new data dependencies.

#### 5X-TAC-4 · Lock Summary in Summary Bar — `TODO` · Priority: LOW · Size: S
Add LOCKS block to tactical summary bar when lock entities exist. `ENGAGED` (all locked) = ice, `{n} UNSECURED` = tomato.

#### 5X-TAC-5 · Alarm-State Adaptive Density — `TODO` · Priority: LOW · Size: S
Auto-expand timeline and camera focus when armed away. Compact when disarmed. Behavioral enhancement tied to 5X-TAC-1.

#### 5X-TAC-6 · Tactical Dashboard Visual Redesign — `TODO` · Priority: HIGH · Size: L
Full visual overhaul of the Tactical dashboard with inspiration from professional security systems (UniFi Protect, SimpliSafe, SmartFace). Explore non-rectangular layouts: ship/house schematics, perimeter diagrams, zone maps. Wesley to research and design, Geordi to LCARS-ify.

---

## Epic 4 · Life Support Dashboard Enhancements

> Visual comparison against ChatGPT Life Support mockup (Apr 26 2026). Wesley gap analysis.

#### 5X-LS-4 · Air Purifier Table Enrichment — `TODO` · Priority: MEDIUM · Size: M
Add MODEL column, FAN SPEED as fraction, AIR QUALITY IMPROVEMENT % with inline bar. Requires device model attribute lookup and fan speed mapping.

#### 5X-LS-5 · Temp/Humidity Trend Sparklines — `TODO` · Priority: MEDIUM · Size: M
Per-zone mini sparkline in TREND column. Requires `recorder/statistics_during_period` WS API for 24h history.

#### 5X-LS-6 · Outdoor Temp/Humidity Row — `TODO` · Priority: LOW · Size: S
Add outdoor row from weather integration entity (`weather.home`) to temp table.

#### 5X-LS-7 · Air Quality History (24H) Chart — `TODO` · Priority: LOW · Size: M
AQI line chart with GOOD/MODERATE/UNHEALTHY zone bands. Requires statistics API.

#### 5X-LS-8 · Environment History (24H) Chart — `TODO` · Priority: LOW · Size: M
Dual-axis temp + humidity line chart. Same statistics API dependency.

#### 5X-LS-9 · Alerts & Notifications Panel — `TODO` · Priority: MEDIUM · Size: M
Timestamped event log with severity dots and source labels. Shares pattern with 5X-TAC-1 (tactical event timeline). Requires `logbook/get_events` WS API.

#### 5X-LS-10 · Pluralization Fix — `DONE` · Priority: LOW · Size: S
"1 ZONES" → "1 ZONE". Singular/plural for all summary counts.

#### 5X-LS-11 · CO₂ Warning Threshold — `TODO` · Priority: MEDIUM · Size: S
Add color-coded threshold indicator for CO₂ >1000 ppm. Currently shows 1229 PPM as neutral text.

#### 5X-LS-12 · Circular AQI Gauge — `TODO` · Priority: MEDIUM · Size: M
SVG ring gauge for AQI score (like mockup). Circles now allowed per design direction. Arc fills proportional to AQI value, color-coded by tier (ice=good, sunflower=moderate, tomato=unhealthy). Score number centered inside ring.

#### 5X-LS-13 · Circular Thermostat Dials — `TODO` · Priority: MEDIUM · Size: M
SVG circular dial for each thermostat zone (like mockup). Shows current temp inside circle, setpoint as arc marker, COOLING/HEATING mode as ring color (ice=cooling, butterscotch=heating, gray=idle). Tap to open thermostat controls.

#### 5X-LS-14 · Overview Card Circular Gauges — `TODO` · Priority: LOW · Size: M
Add small circular gauge indicators to the 4 overview cards (like mockup). Temperature ring in Environment card, AQI ring in Air Quality card, aggregate setpoint in Thermostats card.

---

## Epic 5 · Engineering Dashboard Enhancements

> Visual comparison against ChatGPT Power Distribution mockup (Apr 26 2026). Wesley gap analysis.

#### 5X-ENG-1 · Power Flow Topology Visualization — `TODO` · Priority: HIGH · Size: M
Visual connection between Sources → Distribution Bus → Load Circuits using solid LCARS structural bars as "power conduits". Currently sections are stacked without visual flow connection.

#### 5X-ENG-2 · Load Grouping Summary — `TODO` · Priority: MEDIUM · Size: M
Group summary row above circuit list showing per-category totals (HVAC total, LIGHTING total, etc.). Requires circuit classification logic by entity name heuristics.

#### 5X-ENG-3 · Voltage/Frequency/Current Data — `TODO` · Priority: LOW · Size: S
Add structured key-value fields to source cards if voltage/frequency entities exist.

#### 5X-ENG-4 · Power History (24H) Chart — `TODO` · Priority: LOW · Size: M
Three-line chart: total production, battery power, total consumption. Shared chart renderer with 5X-LS-7/8.

#### 5X-ENG-5 · Power Balance Metric — `TODO` · Priority: LOW · Size: S
Production − Consumption computed metric in System Status sidebar.

#### 5X-ENG-6 · Source Contribution Proportional Bar — `TODO` · Priority: LOW · Size: S
Stacked horizontal bar showing Grid/Battery/Generator proportions (NOT donut chart).

#### 5X-ENG-9 · Battery SOC Circular Gauge — `TODO` · Priority: MEDIUM · Size: M
SVG ring gauge for each battery showing state of charge. Arc fills proportional to SOC%, color-coded (ice>50%, sunflower 20-50%, tomato<20%). Replaces/supplements the current SOC bar. Power flow direction indicated by arc animation direction (charging vs discharging).

#### 5X-ENG-10 · Power Flow Donut/Ring — `TODO` · Priority: LOW · Size: M
Circular ring chart showing power source contribution proportions (Grid/Battery/Solar). Alternative to 5X-ENG-6 stacked bar — circles now allowed. Ring segments proportional to wattage contribution.

#### 5X-ENG-7 · Grid 0W Investigation — `TODO` · Priority: HIGH · Size: S
Grid shows 0W ONLINE while house draws 2550W. Likely wrong entity matched by GRID_KEYWORDS regex or missing grid sensor. Investigate Emporia Vue main panel entity.

#### 5X-ENG-8 · Battery Classification Cleanup — `TODO` · Priority: MEDIUM · Size: S
Motion sensors and Wallbox Vilya showing as battery cards. Filter out non-storage battery entities (device_class=battery but not actual energy storage devices).

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
