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

---

## Open Bugs (from beta.35 Quad-Agent QA — Geordi/Wesley/Worf/Data, May 2026)

> Full review: `localinfo/qa-screenshots/beta35/REVIEW-SUMMARY.md` (27 screenshots covering 17 Habitat areas + 5 dashboards)

#### 5X-B26 · Power Dashboard Double-Counts Battery Port Telemetry as Circuit Load — `TODO` · Priority: HIGH · Size: M · [#93](https://github.com/htiel/LCARS-lovelace-dashboard/issues/93)
EcoFlow UPS Air port sensors are counted both as battery flow AND as discrete circuits → ~1 kW phantom load. Fix: exclude any sensor whose `device_id` matches a device that already produced a battery card.
**Aliases**: Data P1-3, Geordi #6

#### 5X-B27 · Filter prototype_*/debug_*/test_* Entities From Area Discovery — `TODO` · Priority: HIGH · Size: S · [#97](https://github.com/htiel/LCARS-lovelace-dashboard/issues/97)
PROTOTYPE BUTTON 1-8 visible on Office page in production. Add reserved-prefix filter to area enumeration.
**Aliases**: Geordi #29

#### 5X-B28 · Habitat Mobile Sidebar — Collapse Area Buttons to Icon-Only — `TODO` · Priority: MEDIUM · Size: S · [#94](https://github.com/htiel/LCARS-lovelace-dashboard/issues/94)
Beta.37 narrowed sidebar to ~88px on mobile per Geordi. Habitat has 15-30+ areas — at 88px wide, area names truncate to 2-3 chars (unrecognizable). **Captain's call:** drop text entirely on mobile, render only the area's `mdi:` icon centered. More LCARS-canonical (PADD-style pictograms), no new component needed, all areas reachable in one tap. Tactical/Power/LS/Lighting unaffected (≤6 buttons with their own icons).
**Aliases**: Geordi mobile-spec follow-up

#### 5X-B29 · Tactical Donut Center Text Fails WCAG 1.4.3 — `TODO` · Priority: MEDIUM · Size: S · [#95](https://github.com/htiel/LCARS-lovelace-dashboard/issues/95)
`0/1 LOCKED` is tomato-on-tomato (~1.5:1). Fix in `lcars-ring-gauge.js` so all donuts render center text on opaque dark background regardless of ring color.
**Aliases**: Geordi #18

#### 5X-B30 · Off-Palette Green in AQI Rings and RGB Preset Chips — `TODO` · Priority: MEDIUM · Size: S · [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96)
LCARS canon has no green. Replace AQI "GOOD" tier with `var(--lcars-ice)`; document RGB chip rule.
**Aliases**: Geordi #26

#### 5X-B31 · Placeholder Rendering — `— 0W` / `—%` Parses As "Minus" — `TODO` · Priority: MEDIUM · Size: S · [#98](https://github.com/htiel/LCARS-lovelace-dashboard/issues/98)
Replace em-dash-before-unit with bare `—`, `NO DATA`, or grayed last value. Add `formatOrDash(value, unit)` helper to enforce.
**Aliases**: Geordi #16

#### 5X-B32 · DECK 1/2 Sidebar Headers Use Gradient — Violates Bracer Jack Rule #1 — `TODO` · Priority: MEDIUM · Size: S · [#100](https://github.com/htiel/LCARS-lovelace-dashboard/issues/100)
Replace gradient with single flat color. Add stylelint rule to flag any future `gradient(` outside whitelisted decorative spots.
**Aliases**: Geordi #5

#### 5X-B33 · Camera access_token Leaks Via `<img src>` URL — `TODO` · Priority: MEDIUM · Size: M · [#99](https://github.com/htiel/LCARS-lovelace-dashboard/issues/99)
Token in DOM, history, screenshots, proxy logs. Move to fetch+blob with cookie auth, or migrate to `<ha-camera-stream>`.
**Aliases**: Worf P2-1 (pre-existing)

#### 5X-F4 · Life Support — Replace Presence Dot With 24h Sparkline Strip — `TODO` · Priority: LOW · Size: S · [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101)
Top Wesley innovation pick (S effort / L value). Same single-cell footprint, far more information. Recorder data already in HA.
**Aliases**: Wesley A1

## Open Bugs (from beta.38 Spec Audit — May 2026, multi-agent reverse-engineering pass)

#### 5X-B34 · Camera Panel — `.camera-frame` Click-Only, No Keyboard Activation — `DONE` (v5.1.0-beta.38) · Priority: HIGH · Size: S · [#103](https://github.com/htiel/LCARS-lovelace-dashboard/issues/103)
Shipped: added `role="button"`, `tabindex="0"`, `aria-label`, and Enter/Space `@keydown` handler. WCAG 2.1.1 satisfied.
**Aliases**: Geordi spec-audit camera-1

#### 5X-B35 · Hazard Panel — Alarm State Has No `aria-live` Announcement — `DONE` (v5.1.0-beta.38) · Priority: HIGH · Size: S · [#105](https://github.com/htiel/LCARS-lovelace-dashboard/issues/105)
Shipped: badge wrapped in `role="alert" aria-live="assertive"` (alert state) and `role="status" aria-live="polite"` (clear state). WCAG 4.1.3 satisfied. **Note:** HZ-04 fail-open posture (sunflower frame on integration outage) is *not* fixed in this batch — deferred for follow-up.
**Aliases**: Worf+Geordi HZ-01 (HZ-04 deferred)

#### 5X-B36 · Audio — `lcars-audio.js` Cues Not Documented in `LCARS-AUDIO-SPEC.md` — `TODO` · Priority: MEDIUM · Size: M · [#107](https://github.com/htiel/LCARS-lovelace-dashboard/issues/107)
Spec drift: `coverAction`, `lightToggle`, `switchToggle`, `scriptFire`, `climateAdjust` (cross-domain reuse) all exist in code but are absent from the audio spec's 7-sound vocabulary. Audit + sync. Decide on `climateAdjust` → `analogAdjust` rename.
**Aliases**: spec-audit audio-1

#### 5X-B37 · Battery Panel — Dead CSS, Redundant Partition in `renderBadge`, Slider <24px Target, Animation Budget — `TODO` · Priority: MEDIUM · Size: M · [#109](https://github.com/htiel/LCARS-lovelace-dashboard/issues/109)
Six CSS selectors orphaned after panel-frame extraction; `renderBadge()` re-runs full classification pipeline on every render; 20px slider track fails WCAG 2.5.8; 7–9 concurrent animations exceed project budget; English-only regex classifier breaks i18n.
**Aliases**: Data spec-audit battery-1..5

#### 5X-B38 · Illumination — Drag-Reorder Needs Keyboard Alt; Color Preset Target ≤24px; `--lcars-green` Not in Theme — `TODO` · Priority: MEDIUM · Size: S · [#111](https://github.com/htiel/LCARS-lovelace-dashboard/issues/111)
Edit-mode drag-reorder fails WCAG 2.5.7 (no keyboard alternative). Color preset buttons at 1.5rem (24px) at WCAG 2.5.8 minimum, sub-pixel risk. `--lcars-green` referenced inline (`#66bb6a`) but not in canonical theme palette.
**Aliases**: Geordi spec-audit illum-1..3

### Triaged Out (Not LCARS Code Defects)

- **GEO-508** — "DINNING ROOM" is a Home Assistant area naming typo, not an LCARS defect
- **GEO-514 / WC5-007** (naming portion) — "Neetwork" is HA naming drift; sparse-layout symptom carried in 5X-B17
- **BETA.33 footer on Power dashboard** — flagged by Geordi/Data in beta.35 review; root-caused to browser/HACS cache. All layouts read version from `package.json` at build time. No code fix needed.

### Summary
| Severity | Total | Remaining |
|----------|-------|-----------|
| HIGH | 5 | 3 |
| MEDIUM | 13 | 13 |
| LOW | 2 | 2 |
| **Total** | **20** | **18** |

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

#### 5X-ENG-1 · Power Flow Topology Visualization — `IN PROGRESS` · Priority: HIGH · Size: M
Visual connection between Sources → Distribution Bus → Load Circuits using solid LCARS structural bars as "power conduits". Solid 6px EPS conduits from sources, 4px trunk from bus to circuits, `prefers-reduced-motion` fallback, keyboard accessibility on all interactive elements.

#### 5X-ENG-2 · Load Grouping Summary — `DONE` · Priority: MEDIUM · Size: M
Group summary row above circuit list showing per-category totals (HVAC total, LIGHTING total, etc.). **Shipped with v5.1.0 engineering redesign** — `_classifyCircuit()` heuristic + `CATEGORY_META` colors + grouped pill headers + per-category watt totals.

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
