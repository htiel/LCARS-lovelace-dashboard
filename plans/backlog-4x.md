# LCARS Dashboard - 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.19.0 (current stable)
>
> Completed items through 4.18.8 archived to `_archive/plans/backlog-4x.md`.
>
> **Prioritized using WSJF** (Weighted Shortest Job First).
> WSJF = Cost of Delay / Job Size.
> Cost of Delay = Business Value + Time Criticality + Risk Reduction (each 1–5).
> Size: XS=1, S=2, M=3, L=5, XL=8.

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped - archived after release |

---

## WSJF Scoring

| ID | Title | BV | TC | RR | CoD | Size | WSJF | Priority |
|----|-------|----|----|----|-----|------|------|----------|
| 4X-27 | Clean up hass.data[DOMAIN] | 2 | 1 | 3 | 6 | 1 | 6.00 | HIGH |
| 4X-34 | Replace legacy 'D' icon | 3 | 1 | 2 | 6 | 1 | 6.00 | HIGH |
| 4X-32 | Switches missing from Illumination | 4 | 3 | 3 | 10 | 2 | 5.00 | HIGH |
| 4X-31 | Env + air purifier clipping | 4 | 3 | 3 | 10 | 3 | 3.33 | HIGH |
| 4X-28 | Migrate open() to helpers | 2 | 1 | 3 | 6 | 2 | 3.00 | MEDIUM |
| 4X-29 | Responsive breakpoints | 4 | 2 | 3 | 9 | 3 | 3.00 | MEDIUM |
| 4X-42 | Consolidate alarm+security | 3 | 2 | 3 | 8 | 3 | 2.67 | MEDIUM |
| 4X-38 | Life Support panel cluttered | 5 | 4 | 4 | 13 | 5 | 2.60 | HIGH |
| 4X-45 | Thermostat not matching spec | 5 | 4 | 3 | 12 | 5 | 2.40 | MEDIUM |
| 4X-43 | Media: Apple TV + HomePods | 3 | 2 | 2 | 7 | 3 | 2.33 | MEDIUM |
| 4X-36 | Weather not using panel | 5 | 3 | 3 | 11 | 5 | 2.20 | MEDIUM |
| 4X-37 | Pool/spa not using panel | 5 | 3 | 3 | 11 | 5 | 2.20 | MEDIUM |
| 4X-35 | Alarm panel mismatch | 4 | 2 | 3 | 9 | 5 | 1.80 | MEDIUM |
| 4X-30 | Reduce gradients homepage | 2 | 1 | 2 | 5 | 3 | 1.67 | MEDIUM |
| 4X-41 | Blinds/covers panel | 2 | 1 | 2 | 5 | 3 | 1.67 | MEDIUM |
| 4X-44 | Platform-to-panel routing | 5 | 3 | 5 | 13 | 8 | 1.63 | MEDIUM |
| 4X-33 | Gear edit: panel reorder | 4 | 2 | 2 | 8 | 5 | 1.60 | MEDIUM |
| 4X-39 | Nest Protect panel | 3 | 2 | 3 | 8 | 5 | 1.60 | MEDIUM |
| 4X-40 | GE Home appliance panel | 3 | 2 | 2 | 7 | 5 | 1.40 | LOW |

---

## Backlog (WSJF Order)

### 4X-27 - Clean up hass.data[DOMAIN] in async_unload_entry - `DONE v4.18.9` - Priority: HIGH - Size: XS - WSJF: 6.00

**GitHub Issue**: [#27](https://github.com/htiel/LCARS-lovelace-dashboard/issues/27)

HA convention is `hass.data.pop(DOMAIN, None)` in `async_unload_entry`. Current code leaves stale data (4 empty OrderedDicts). Found by Data during v4.18.8 review.

**Acceptance criteria**:
- `async_unload_entry` calls `hass.data.pop(DOMAIN, None)` after platform unload

---

### 4X-34 - Replace legacy 'D' dashboard icon from Dwains Dashboard - `DONE v4.18.9` - Priority: HIGH - Size: XS - WSJF: 6.00

**GitHub Issue**: [#34](https://github.com/htiel/LCARS-lovelace-dashboard/issues/34)

The sidebar/panel icon is still the letter 'D' carried over from the Dwains Dashboard codebase. Replace with an LCARS-appropriate icon or suitable MDI icon.

**Acceptance criteria**:
- Dashboard icon no longer shows the legacy 'D'
- New icon reflects LCARS branding

---

### 4X-32 - Switches for plugs/lights missing from Illumination panel Circuits - `DONE v4.18.9` - Priority: HIGH - Size: S - WSJF: 5.00

**GitHub Issue**: [#32](https://github.com/htiel/LCARS-lovelace-dashboard/issues/32)

Switch-domain entities that control plugs or lights (e.g. smart plugs powering lamps) are not included in the Illumination panel's Circuits section. These should be surfaced alongside other lighting controls.

**Acceptance criteria**:
- Switch entities controlling plugs or lights in a room appear in the Illumination panel under Circuits
- Existing light-domain entity behavior is unchanged

---

### 4X-31 - Environmental + air purifier panels clip in consolidated room view - `DONE v4.18.9 — REOPENED as 4X-46` - Priority: HIGH - Size: M - WSJF: 3.33

**GitHub Issue**: [#31](https://github.com/htiel/LCARS-lovelace-dashboard/issues/31) → reopened as [#44](https://github.com/htiel/LCARS-lovelace-dashboard/issues/44)

v4.18.9 fix (overflow: visible) was insufficient. Clipping persists in the Life Support panel's nested environment substation. Root cause likely in a parent container constraint.

---

### 4X-46 - Life Support panel still clipping nested environment substation - `TODO` - Priority: HIGH - Size: M - WSJF: 3.33

**GitHub Issue**: [#44](https://github.com/htiel/LCARS-lovelace-dashboard/issues/44)

Reopened from 4X-31. The `overflow: visible` fix in v4.18.9 did not fully resolve clipping. The Awair atmoscrubber sparkline tray at the bottom of the Life Support panel is cut off. Root cause may be in the homepage card's room container, the panel frame's outer div, or a parent flex/grid height constraint.

---

### 4X-28 - Migrate remaining open() patterns to helpers - `DONE v4.19.0` - Priority: MEDIUM - Size: M (re-scoped) - WSJF: 3.00

**GitHub Issue**: [#28](https://github.com/htiel/LCARS-lovelace-dashboard/issues/28)

`more_pages` config loading in `websocket_get_configuration` still uses `async_add_executor_job(open, ...)` instead of the new `_read_yaml_file` helper. Inconsistent with refactored helpers. Found by Data during v4.18.8 review.

**Acceptance criteria**:
- All file I/O in `__init__.py` uses `_read_yaml_file` / `_write_yaml_file` helpers
- No direct `open()` calls remain outside the helper functions

---

### 4X-29 - Add responsive breakpoints to remaining panels - `TODO` - Priority: MEDIUM - Size: M - WSJF: 3.00

**GitHub Issue**: [#29](https://github.com/htiel/LCARS-lovelace-dashboard/issues/29)

Only power, life support, illumination, and homepage have responsive breakpoints. 8 panels need single-column fallback below ~480px: alarm, battery, camera, climate, environment, irrigation, media, pool-spa, weather. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- All panel grid layouts collapse to single-column below 480px
- No horizontal overflow on mobile viewports
- Existing desktop layouts unchanged

---

### 4X-42 - Consolidate alarm + security panels and rename - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.67

Alarm panel (SimpliSafe, etc.) and security panel (locks like Schlage, door/window sensors, motion) should be consolidated or clearly linked under a unified security/tactical panel. Consider renaming to 'Tactical' or 'Security Operations'. Locks (Schlage), alarm systems (SimpliSafe), door/window sensors, and motion sensors all belong together.

**Acceptance criteria**:
- Alarm and security entities render in a unified or clearly linked panel structure
- Locks, alarm controls, door/window sensors, and motion sensors all accessible
- Panel naming is consistent and LCARS-themed

---


### 4X-45 - Thermostat rendering does not match LCARS climate panel spec - `TODO` - Priority: HIGH - Size: L - WSJF: 2.40

**GitHub Issue**: [#43](https://github.com/htiel/LCARS-lovelace-dashboard/issues/43)

The thermostat/climate panel renders with a generic HA climate dial instead of the designed LCARS climate panel layout. Missing dual setpoint controls, humidity display, mode selector, and fan speed in LCARS styling. 3 Nest thermostats (platform: `nest`) in the test house. See `localinfo/bugs/Thermostat actual.png` vs `Thermostat render.png`.

**Acceptance criteria**:
- Climate panel renders with LCARS frame and header bar
- Dual heat/cool setpoint controls displayed
- Humidity, mode selector, and fan speed controls in LCARS styling
- Matches LCARS climate panel spec render

---

### 4X-43 - Media panel: consolidate Apple TV + HomePods per room - `TODO` - Priority: MEDIUM - Size: M - WSJF: 2.33

When a room has both an Apple TV and one or two HomePods, they should render as a single consolidated media panel. Apple TV can use HomePods in the same room as speakers, so the primary view should be the Apple TV media controls with HomePods shown as a secondary speaker/output section. HomePods still work independently so they can't be hidden — they need a less prominent but accessible sub-section within the Apple TV media panel.

**Acceptance criteria**:
- Apple TV and HomePods in the same room render as a single media panel
- Apple TV is the primary control surface (playback, artwork, transport)
- HomePods appear as a secondary speaker/output section
- HomePods remain independently controllable (volume, play/pause)
- Rooms with only HomePods (no Apple TV) render a standalone speaker panel

---

### 4X-36 - Weather station not rendering as LCARS weather panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#36](https://github.com/htiel/LCARS-lovelace-dashboard/issues/36)

Weather station entities (e.g. Tempest) render as a flat grid of generic sensor pills with raw unformatted values and truncated labels instead of the LCARS weather panel. See `localinfo/bugs/Weather not using panel.png`.

**Entity registry note** (from test house):
- `weather.home` — Met integration, `area_id: null`
- WeatherFlow Tempest station (platform: `weatherflow`, device ST-00127631), 23 sensor entities, all `area_id: null`
- Key issue: entities not assigned to any area, and `weatherflow` platform sensors not being detected as weather panel candidates

**Acceptance criteria**:
- Weather station entities detected and rendered using LCARS weather panel
- Values formatted with appropriate precision
- Full readable sensor labels
- Weather-specific layout per LCARS Weather Panel spec

---

### 4X-37 - Pool/spa sensors not rendering as LCARS Cetacean Ops panel - `TODO` - Priority: HIGH - Size: L - WSJF: 2.20

**GitHub Issue**: [#37](https://github.com/htiel/LCARS-lovelace-dashboard/issues/37)

Pool and spa entities render as generic sensor pills and a Power Systems panel with unlabeled 'POOL EQUIPMENT' circuit tiles instead of the LCARS Cetacean Ops panel. See `localinfo/bugs/Pool not using panel.png` vs `Pool render.png`.

**Entity registry note** (from test house):
- Platform: `screenlogic` (Pentair), 19 entities, all `area_id: null`
- Key issue: `screenlogic` platform not being detected for Cetacean Ops panel routing; entities dumped into generic sensor pills and Power Systems instead

**Acceptance criteria**:
- Pool/spa entities detected and rendered using LCARS Cetacean Ops panel
- Pool and spa temperature displays with setpoint controls
- Chemistry section with labeled values (pH, chlorine, alkalinity, salt)
- Named circuit toggle buttons (pump, waterfall, jets, lights)

---

### 4X-35 - Alarm panel does not match spec render - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.80

**GitHub Issue**: [#35](https://github.com/htiel/LCARS-lovelace-dashboard/issues/35)

The alarm panel renders as a generic HA alarm card instead of the designed LCARS alarm panel. Missing LCARS header bar, door/sensor status list, styled keypad layout, and mode buttons. See `localinfo/bugs/Alarm Panel actual.png` vs `Alarm Panel Render.png`.

**Entity registry note** (from test house):
- `alarm_control_panel.alarm_control_panel` — SimpliSafe
- `alarm_control_panel.blink_blinkifi` — Blink
- 94 additional SimpliSafe entities (door/window sensors, motion, locks) + 21 Blink entities, all tagged `alarm`
- Panel IS rendering but as a generic HA alarm card instead of the LCARS spec design.

**Acceptance criteria**:
- Alarm panel renders with LCARS frame, header bar, and stardate
- Door/sensor status list displayed alongside the alarm controls
- Number keypad and mode buttons match spec styling

---

### 4X-30 - Reduce gradient usage in legacy homepage card - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#30](https://github.com/htiel/LCARS-lovelace-dashboard/issues/30)

20+ gradient uses in `lcars-homepage-card.js` (camera overlays, scroll fades, edit indicators). Some are functional (mask-image for scroll fade) but several are decorative, violating Bracer Jack Rule 1. Found by Geordi during v4.18.7 review.

**Acceptance criteria**:
- Audit all `linear-gradient` / `radial-gradient` uses in homepage card
- Remove purely decorative gradients
- Document functional gradients (scroll fades, mask-image) as intentional exceptions

---

### 4X-41 - New panel: Blinds/shades/covers control panel - `TODO` - Priority: LOW - Size: M - WSJF: 1.67

**GitHub Issue**: [#41](https://github.com/htiel/LCARS-lovelace-dashboard/issues/41)

Cover/blind entities (e.g. Bond integration) have no dedicated LCARS panel. Currently fall into security by domain, but blinds/shades are distinct from security covers. Could be themed as 'Viewport Controls' or 'Observation Ports'.

**Acceptance criteria**:
- Cover entities for blinds/shades detected and routed to dedicated panel
- Open/close/position controls displayed per cover
- Panel follows LCARS design language

---

### 4X-44 - Implement platform-to-panel routing for all tagged integrations - `TODO` - Priority: HIGH - Size: XL - WSJF: 1.63

**GitHub Issue**: [#42](https://github.com/htiel/LCARS-lovelace-dashboard/issues/42)

Entity-to-panel routing needs full implementation based on the combined entity registry analysis (5,958 entities, 2 test houses). Reference data in `localinfo/combined.entities.csv`. Covers 17 panel targets across 20+ integrations. Includes 3 new panels (hazard_detection, galley_systems, viewport_controls) and diagnostic entity filtering.

**Acceptance criteria**:
- All listed platforms route to the correct panel
- New panels created for hazard_detection, galley_systems, viewport_controls
- Entities not matching any rule fall through to generic device panel
- entity_category: diagnostic/config entities excluded from room panels

---

### 4X-33 - Gear edit mode: persistent panel order/placement override per room - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)

Allow users to reorder and reposition panels within a room via gear (edit) mode. Overrides persist across reloads and HA reboots. A reset option restores the default auto-generated order.

**Acceptance criteria**:
- Gear edit mode exposes panel reorder controls (drag-and-drop or up/down arrows)
- Panel order overrides are saved persistently per room
- Room renders respect the saved override on reload
- A reset/clear option restores default panel ordering
- Override survives dashboard restarts and HA reboots

---

### 4X-39 - New panel: Nest Protect / smoke-CO-heat detector safety panel - `TODO` - Priority: MEDIUM - Size: L - WSJF: 1.60

**GitHub Issue**: [#39](https://github.com/htiel/LCARS-lovelace-dashboard/issues/39)

Nest Protect devices (~23 entities each) have no dedicated panel. 167 entities across 7 devices in the test house covering smoke/CO/heat status, self-tests, occupancy, battery, and config. Needs a purpose-built safety panel (e.g. 'Fire Suppression' or 'Hazard Detection') with per-room detector status, battery overview, and self-test summary.

**Acceptance criteria**:
- `nest_protect` platform entities detected and routed to dedicated panel
- Safety status (smoke, CO, heat) prominently displayed per device/room
- Battery health and self-test status visible at a glance
- Panel follows LCARS design language

---

### 4X-40 - New panel: GE Home SmartHQ appliance panel - `TODO` - Priority: LOW - Size: L - WSJF: 1.40

**GitHub Issue**: [#40](https://github.com/htiel/LCARS-lovelace-dashboard/issues/40)

GE Home (SmartHQ) appliances (oven, Advantium microwave, beverage/ice system) have no dedicated panel. 34 entities in the test house covering cook modes, timers, temperatures, and appliance diagnostics. Needs a purpose-built appliance panel (e.g. 'Replicator Bay' or 'Galley Systems').

**Acceptance criteria**:
- `ge_home` platform entities detected and routed to dedicated panel
- Active cooking status and timers prominently displayed
- Temperature and mode information visible
- Panel follows LCARS design language
