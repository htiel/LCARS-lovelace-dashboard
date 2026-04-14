# LCARS Dashboard — 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.14.1 (current) → 4.15.0+

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

### 4X-3 · Power Panel (Energy Monitoring) — `TODO` · Priority: HIGH · Size: XL

**Target version**: 4.15.0
**Spec**: Needs spec — draft from to-do notes below.

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

### 4X-4 · Architecture Refactor (Pre-5.0 Enabler) — `TODO` · Priority: CRITICAL · Size: XL

**Target version**: 4.16.0
**Spec**: `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` — **COMPLETE** (Data, 2026-04-14)

Break the monolithic `lcars-homepage-card.js` (5,848 lines) into reusable panel components. Each panel type becomes its own `customElements.define()` web component extending a shared `LcarsBasePanel` base class. Homepage card becomes a thin orchestrator (~1,200 lines).

**Architecture decision** (from Data's research):
- Pattern: Custom elements with shared base class (same as HA core `hui-*-card` and Mushroom `MushroomBaseCard`)
- CSS: 3-tier composition (base → frame → panel-specific) — eliminates ~600 lines of duplication (21%)
- Bundle: Single bundle stays, +0.3% overhead from module boundaries
- Migration: 11 PRs, ascending complexity, each independently shippable

**Migration order** (1 PR each):
1. Foundation: `lcars-base-panel.js` + `panels/` directory + `panelFrameStyles`
2. Irrigation (87 lines — smallest, proves pattern)
3. Weather (164 lines — tests utility module imports)
4. Environment (215 lines)
5. Camera (247 lines)
6. Media (248 lines)
7. Pool/Spa (223 lines)
8. Alarm (294 lines — Worf security review for PIN extraction)
9. Climate (303 lines)
10. Battery (404 lines — largest, most complex)
11. Cleanup: dead CSS removal, final bundle size comparison

**Enables**: v5.0 multi-dashboard — same `<lcars-climate-panel>` on Habitat, Environmental, and Power dashboards with different entity lists, identical rendering.

**Sources (Data's research)**:
- Lit composition docs: https://lit.dev/docs/composition/overview/
- HA frontend patterns: https://github.com/home-assistant/frontend
- Mushroom architecture: https://github.com/piitaya/lovelace-mushroom
- https://en.wikipedia.org/wiki/Object-oriented_programming
- https://realpython.com/python3-object-oriented-programming/

---

### 4X-5 · Camera Loading & Offline States — `DONE` · Priority: MEDIUM · Size: S

**Shipped in**: v4.14.1 (2026-04-14)
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

## Wesley's 4.x Enhancement Ideas (Backlog — Unscheduled)

These are creative enhancement ideas for existing panels. Not committed to a version.

### Environment Panel Enhancements
- CSS `@property --aqi-hue` with `syntax: '<angle>'` — GPU-accelerated color interpolation for cylinder gradient. Baseline: Widely Available (Jan 2025).
- AQI "alert condition" escalation: 0-50 "All clear" (green) → 150+ "Red alert" (frame pulses red).
- Optional Web Audio API ambient hum tied to fan speed. *Worf: AudioContext requires user gesture.*

### Floor Navigation Enhancements
- "Deck numbering" config option — display floor names as "DECK 1", "DECK 2". `level` from floor registry maps naturally.
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
