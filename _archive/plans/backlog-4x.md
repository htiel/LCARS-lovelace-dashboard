# LCARS Dashboard — 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.17.0 (current)

---

## Status Key

| Tag | Meaning |
|-----|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Active work |
| `BLOCKED` | Waiting on dependency |
| `DONE` | Shipped — listed for context until next release |

---

## Backlog

### 4X-1 · BlueAir Air Purifier Support — `DONE` · Priority: MEDIUM · Size: S

**Shipped in**: v4.14.0 (2026-04-14)
**Spec**: `specs/LCARS-AIR-PURIFIER-VERIFICATION-SPEC.md`

Verify the environment panel's auto-detection heuristic picks up BlueAir devices (Blue Pure 311i Max via `ha_blueair` integration). They expose `fan` domain entities with speed control and `sensor` entities for filter life. Similar to existing VeSync purifier handling.

**Acceptance criteria**:
- BlueAir purifiers detected and rendered by the atmoscrubber panel
- No regression for existing VeSync purifiers
- Entity ID patterns documented

---

### 4X-2 · Temp/Humidity Sensor Grid (SwitchBot Meters) — `DONE` · Priority: HIGH · Size: M

**Shipped in**: v4.14.0 (2026-04-14)
**Spec**: `specs/LCARS-TEMP-HUMIDITY-GRID-SPEC.md`
**Done so far**: Spec, CSS, color utilities, v4.13.0 visual enhancements all shipped. Renderer not yet implemented.

14+ SwitchBot meters (WoTHP) providing per-room temperature and humidity, plus a SwitchBot CO2 meter (WoTHPc). Sensor-only devices (no controls) that render as compact readout rows.

**Implementation notes**:
- **Detection**: Devices with ≥2 of `device_class` in {`temperature`, `humidity`} but no `fan`/`air_quality` domain entities → sensor-only environment mode (no atmoscrubber cylinder, just the readout grid).
- **CO2 meter**: If a SwitchBot device has `co2` or `carbon_dioxide` device_class, include it in the AQ sensor list — triggers full atmoscrubber visualization.
- **Multi-sensor rooms**: If a room has both a SwitchBot meter AND an Awair, group them under the same environment panel (no duplicates).

**Acceptance criteria**:
- SwitchBot meters render per-room compact readout grid
- CO2 meter triggers atmoscrubber mode
- Multi-sensor rooms merged into single panel

---

### 4X-3 · Power Panel (Energy Monitoring) — `DONE` · Priority: HIGH · Size: XL

**Shipped in**: v4.15.0 (2026-04-14), hotfix v4.15.1
**Spec**: `specs/LCARS-POWER-PANEL-SPEC.md` (Phase 3 — Reconciled, Implementation-Ready)
**Addendum**: `specs/LCARS-POWER-PANEL-WESLEY-ADDENDUM.md` (Phase 3 — Reconciled)
**Plan**: `plans/v4.15.0-implementation-plan.md` (Phase 4 — Awaiting Admiral Review)

Per-area power monitoring panel for Emporia Vue, Kasa energy monitors, and any device providing voltage, wattage, or amps. Devices with a switch show the toggle first, then stats. Devices without switches (Emporia Vue) show monitoring only.

**Key devices** (from Admiral's setup):
- Kasa smart plugs with energy monitoring (e.g., "Kasa Dog heating pad") — switch + power stats
- Kasa power strips (server room) — per-outlet switch + power stats
- Emporia Vue — whole-panel energy monitoring, no switches, multiple circuits
- Area "Main Panel" — electrical panel with 2 Emporia Vues, monitors only

**Implementation notes**:
- Group into per-area panel, left-aligned (not under existing panels)
- Distinct section per device or circuit
- Switch (if present) → stats: voltage (number), kW (sparkline graph), amperage (point-in-time number)
- Respect `hidden_by` — skip duplicate/hidden entities
- Future: Emporia Vue → ESPHome ESP32 reflash for local-only monitoring

**Visualization options**: Sparkline graphs for kW over time, bar charts, doughnut charts — LCARS aesthetic.

**ESP32 reflash references**:
- https://fuzznotes.com/posts/flash-emporia-vue-3-with-esphome/
- https://emporia-vue-local.github.io/docs/tutorial/configuration/
- https://medium.com/@rorygallagher2010/taking-my-data-back-removing-my-emporia-vue-electricity-monitor-from-the-cloud-7b67de716f24

**Wesley's reference cards**:
- `power-flow-card-plus` (flixlix, 700+ stars) — animated SVG power flow arrows
- `sankey-chart` (MindFreeze) — Sankey/flow diagrams for energy distribution
- `tesla-style-solar-power-card` (reptilex) — animated dot-along-path power flow

---

### 4X-4 · Architecture Refactor (Pre-5.0 Enabler) — `DONE` · Priority: CRITICAL · Size: XL

**Shipped in**: v4.17.0 (2026-04-15)
**Spec**: `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` — **IMPLEMENTED**

Break the monolithic `lcars-homepage-card.js` (5,848 lines) into reusable panel components. Each panel type becomes its own `customElements.define()` web component extending a shared `LcarsBasePanel` base class. Homepage card becomes a thin orchestrator (~1,200 lines).

**What shipped**:
- 10 extracted panel custom elements (alarm, battery, camera, climate, environment, irrigation, media, pool-spa, power, weather)
- `LcarsBasePanel` abstract base class with `render()` → `renderContent()` → `renderBadge()` pattern
- 5 shared components: `<lcars-panel-frame>`, `<lcars-sensor-row>`, `<lcars-section-divider>`, `<lcars-option-strip>`, `<lcars-setpoint>`
- 3-tier CSS composition eliminating ~600 lines of duplicated frame/header/sensor CSS
- Power panel innerHTML XSS fix (replaced with lit-html render)
- Bundle: 566 KiB (down from 573 KiB pre-extraction) — net savings from CSS dedup + dead code removal

**Enables**: v5.0 multi-dashboard — same `<lcars-climate-panel>` on Habitat, Environmental, and Power dashboards with different entity lists, identical rendering.

---

### 4X-5 · Camera Loading & Offline States — `DONE` · Priority: MEDIUM · Size: S

**Shipped in**: v4.14.1, hotfixes v4.16.2, v4.16.3 (2026-04-14)
**Spec**: None — bug fix / UX improvement

Camera viewscreens currently show a blank or broken state while loading or when the camera is offline/unresponsive. Replace with proper LCARS-styled loading and error states.

**Desired behavior**:
1. **Loading**: Render a static placeholder image with "CONNECTING..." text while the camera stream loads. LCARS frame renders immediately; viewscreen area shows the placeholder.
2. **Loaded**: Once the camera image/stream loads successfully, replace the placeholder with the live feed (existing viewscreen activation animation).
3. **Offline/Error**: If the image fails to load (camera offline, no stream, timeout), replace with a "CAMERA OFFLINE" message with full LCARS visual flare — frame color shift, scan line, appropriate iconography.

**Implementation notes**:
- Use `<img>` `onload`/`onerror` events (or `loadeddata` for stream) to detect state transitions
- Loading placeholder should be a styled `<div>`, not an actual image file — keeps bundle clean
- Offline state should feel deliberate, not broken — LCARS aesthetic for "system unavailable"
- Consider `prefers-reduced-motion` for any offline animation
- Respect existing viewscreen activation animation timing

**Acceptance criteria**:
- Camera panel shows "CONNECTING..." placeholder immediately on render
- Live feed replaces placeholder once loaded (with viewscreen activation animation)
- Failed/offline cameras show "CAMERA OFFLINE" with LCARS styling
- No flash of broken image icon at any point
- Works with both snapshot and stream camera entities

---

### 4X-6 · Consolidated Power Panel (Area Grouping) — `DONE` · Priority: HIGH · Size: L

**Shipped in**: v4.16.0, hotfixes v4.16.1–v4.16.6 (2026-04-14)
**Spec**: `specs/LCARS-CONSOLIDATED-POWER-PANEL-SPEC.md` (Wesley draft + Geordi review)

Currently each power device gets its own separate panel in the right column — extremely wasteful when an area has multiple power strips, Vue circuits, and monitored plugs. Consolidate ALL power devices in an area into a SINGLE "POWER SYSTEMS" panel in the left content flow (bottom of normal device stack).

**Key changes**:
- New `_buildPowerCollection()` aggregates all power device groups per area
- Single consolidated panel replaces N individual panels → ~80% vertical space reduction
- Three sections: CIRCUITS (tile grid), MONITORED DEVICES (rows), POWER STRIPS (parent→child blocks)
- Every metric (watts, energy, voltage) clickable → opens HA more-info dialog
- Sparklines removed from tiles (popover-only) to save space
- Panel renders in left column (normal content flow), not right panel column

**Geordi amendments (APPROVED WITH CONDITIONS)**:
1. Transition separator between normal devices and power panel
2. Corner brackets (`::before`/`::after`) + asymmetric border-radius on frame
3. Min tile height `3rem` (WCAG touch target compliance)
4. Specific `aria-label` per clickable value (not generic "View details")
5. `:focus-visible` outline on circuit tiles
6. Section accent bars (butterscotch/ice/african-violet) for visual grouping
7. Truncation pattern for sections with 12+ items ("SHOW ALL" pill)

**Acceptance criteria**:
- All power devices in an area render in a single consolidated panel
- Panel positioned at bottom of left content column
- Strips show parent header → indented child outlets with individual toggles
- Vue circuits displayed as compact tile grid
- Plugs displayed as compact device rows with toggle + watts
- All wattage/energy values clickable for more-info
- Keyboard accessible with proper ARIA structure
- Responsive: 4-col → 3-col → 2-col → 1-col tile grid

---

### 4X-7 · NUT (Network UPS Tools) Battery Panel Support — `DONE` · v4.17.2 · Priority: HIGH · Size: M

**GitHub Issue**: [#7](https://github.com/htiel/LCARS-lovelace-dashboard/issues/7)
**Shipped in**: v4.17.2 (2026-04-15)

Add NUT-monitored UPS devices (CyberPower, APC, Tripp Lite, Eaton, etc.) to the warp core battery panel. NUT devices have `device_class: battery` + `%` but no `device_class: power` entities — they use load%, voltage, runtime, and status codes instead of EcoFlow-style I/O power entities.

**Key changes**:
- Battery detector extended: recognizes NUT pattern (battery + voltage/load/status, no power-class entities)
- NUT-specific partition path in `_partitionBatteryEntities()`: captures load%, status codes, runtime, voltage
- NUT status code parsing: `OL`=online, `OB`=on battery, `CHRG`=charging, `LB`=low battery, `FSD`=forced shutdown
- Watts computed from `load% × nominal_real_power` when nominal power entity is enabled
- Battery runtime formatted as `Xh Ym`
- Grid→UPS→Load conduit flow replaces per-port I/O pairs
- No visual changes — reuses existing warp core, SOC gauge, conduit animations

**Reference device**: CyberPower CP1500PFCRM2U (2U rackmount, 1500VA/1000W) via NUT integration

**Acceptance criteria**:
- NUT UPS auto-detected and rendered in warp core battery panel
- SOC gauge, status badge, load, runtime, voltage all displayed
- Grid→UPS→Load power flow based on NUT status codes
- No regression for EcoFlow/Victron/Tesla battery devices

---

## Wesley's 4.x Enhancement Ideas (Backlog — Unscheduled)

These are creative enhancement ideas for existing panels. Not committed to a version.

### Environment Panel Enhancements
- CSS `@property --aqi-hue` with `syntax: '<angle>'` — GPU-accelerated color interpolation for cylinder gradient. Baseline: Widely Available (Jan 2025).
- AQI "alert condition" escalation: 0-50 "All clear" (green) → 150+ "Red alert" (frame pulses red).
- Optional Web Audio API ambient hum tied to fan speed. *Worf: AudioContext requires user gesture.*

### Floor Navigation Enhancements
- View Transition API (`document.startViewTransition()`) — turbolift-style vertical slide between floors. Wrap in `prefers-reduced-motion`.

### Web API Adoption

| API | Baseline | Use | Priority |
|-----|----------|-----|----------|
| Popover API | Widely Available | Replace `lcars-popup.js` — zero-JS top layer, light-dismiss, focus trapping | HIGH |
| View Transition API | Widely Available | Area/floor switching crossfades, turbolift deck transitions | HIGH |
| Scroll-Driven Animations | Newly Available | Panels "power up" on scroll into viewport | MEDIUM |
| `text-wrap: balance` | Widely Available | Panel headers — prevent orphan words | LOW |
| CSS Anchor Positioning | Limited (Chrome 125+) | Future tooltips/popovers. Monitor. | EXPLORE |
| `field-sizing: content` | Newly Available | Config/search inputs auto-size | LOW |
