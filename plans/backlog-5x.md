# LCARS Dashboard — 5.x Backlog

> Beta branch (`5.0`). Breaking changes — multi-dashboard architecture, config flow picker.
> Merge direction: 4.0 → 5.0 periodically. Never 5.0 → 4.0.
>
> Completed items archived to `_archive/plans/backlog-5x-shipped.md`.

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |

---

## Open Bugs (from Epic 0 QA Review)

#### 5X-B16 · Restore Navigation and Floor Context While Scrolling — `TODO` · Priority: HIGH · Size: M · WSJF: 3.00 · [#83](https://github.com/htiel/LCARS-lovelace-dashboard/issues/83)
No active dashboard indicator in cross-dashboard nav. Floor context lost during long illumination scroll. Floor separators lack color-blind clarity.
**Aliases**: WC5-009, WC5-012, GEO-515

#### 5X-B17 · Compact Sparse Areas and Cap Deck Scroll Length — `TODO` · Priority: MEDIUM · Size: L · WSJF: 2.20 · [#84](https://github.com/htiel/LCARS-lovelace-dashboard/issues/84)
Single-light and low-entity areas waste 80%+ viewport. Deck/floor view expands to 7800px+ unusable scroll. Absorbs the sparse-room portion of the Neetwork complaint.
**Aliases**: WC5-002, WC5-005, GEO-514, WC5-007

#### 5X-B25 · Add Cross-Dashboard Deep Links — `TODO` · Priority: LOW · Size: M · WSJF: 1.33 · [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87)
Link related panels/destinations directly once shell/nav state is reliable.
**Aliases**: WC5-014

#### 5X-B23 · Remove `require()` from Render Template Path — `TODO` · Priority: MEDIUM · Size: S · WSJF: 2.00 · [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85)
Anti-pattern in template/render path that should be eliminated before it spreads.
**Aliases**: GEO-516

#### 5X-B12 · Audit and Selectively Update npm Dependencies — `TODO` · Priority: MEDIUM · Size: L · WSJF: 1.80 · [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86)
Targeted audit/update constrained by `lit-html` 1.x compatibility limits. Should follow beta blockers to avoid toolchain destabilization.
**Aliases**: WORF-SEC-005

### Triaged Out (Not LCARS Code Defects)

- **GEO-508** — "DINNING ROOM" is a Home Assistant area naming typo, not an LCARS defect
- **GEO-514 / WC5-007** (naming portion) — "Neetwork" is HA naming drift; sparse-layout symptom carried in 5X-B17

### Summary
| Severity | Total | Remaining |
|----------|-------|-----------|
| HIGH | 1 | 1 |
| MEDIUM | 3 | 3 |
| LOW | 1 | 1 |
| **Total** | **5** | **5** |

---

## Epic 3 · Tactical Dashboard Enhancements

> Identified by Wesley's gap analysis against real-world security dashboards (Dwains, SmartFace, UniFi Protect, SimpliSafe).
> **GitHub**: [#90](https://github.com/htiel/LCARS-lovelace-dashboard/issues/90)

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
> **GitHub**: [#91](https://github.com/htiel/LCARS-lovelace-dashboard/issues/91)

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
> **GitHub**: [#92](https://github.com/htiel/LCARS-lovelace-dashboard/issues/92)

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

#### 5X-ENG-7 · Grid 0W Investigation — `TODO` · Priority: HIGH · Size: S · [#88](https://github.com/htiel/LCARS-lovelace-dashboard/issues/88)
Grid shows 0W ONLINE while house draws 2550W. Likely wrong entity matched by GRID_KEYWORDS regex or missing grid sensor. Investigate Emporia Vue main panel entity.

#### 5X-ENG-8 · Battery Classification Cleanup — `TODO` · Priority: MEDIUM · Size: S · [#89](https://github.com/htiel/LCARS-lovelace-dashboard/issues/89)
Motion sensors and Wallbox Vilya showing as battery cards. Filter out non-storage battery entities (device_class=battery but not actual energy storage devices).

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
