# LCARS Dashboard — 4.x Backlog

> Stable branch (`4.0`). Non-breaking feature additions, bug fixes, and optimizations.
> Version: 4.17.1 (current)

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

### 4X-7 · NUT (Network UPS Tools) Battery Panel Support — `TODO` · Priority: HIGH · Size: M

**GitHub Issue**: TBD
**Spec**: None yet

Add NUT-monitored UPS devices (CyberPower, APC, Tripp Lite, Eaton, etc.) to the warp core battery panel. The existing battery detector checks for `device_class: battery` + `%` unit — NUT's "Battery charge" sensor matches this, but the panel's entity partition logic expects EcoFlow-style I/O power entities. NUT uses a different entity shape.

**Key NUT entities** (from HA `nut` integration):
| Entity | Device Class | Unit | Panel Mapping |
|--------|-------------|------|---------------|
| Battery charge | `battery` | `%` | SOC gauge (warp core fill) |
| Battery runtime | `duration` | `s` | Telemetry — estimated runtime |
| Battery voltage | `voltage` | `V` | Telemetry |
| Battery temperature | `temperature` | `°C` | Telemetry |
| Input voltage | `voltage` | `V` | Telemetry — grid input |
| Output voltage | `voltage` | `V` | Telemetry — output |
| Load | `power_factor` | `%` | Telemetry — UPS load |
| Output real power | `power` | `W` | Power out (discharge indicator) |
| Input real power | `power` | `W` | Power in (charge indicator) |
| Charging status | — | — | Charge state (charging/discharging/floating) |
| Status | — | — | Human-readable status ("Online", "On Battery") |

**Implementation notes**:
- **Detection**: NUT devices already trigger battery detector (has `battery` dc + `%`). The issue is `_partitionBatteryEntities()` — it uses EcoFlow-specific `ioType` heuristics for power I/O that won't match NUT entity patterns.
- **Partition updates**: Extend `_partitionBatteryEntities()` to recognize NUT patterns:
  - `sensor.*_battery_charge` → SOC
  - `sensor.*_output_real_power` or `sensor.*_real_power` → power out
  - `sensor.*_input_real_power` → power in  
  - `sensor.*_battery_runtime` → telemetry (show as formatted duration, not raw seconds)
  - `sensor.*_load` → telemetry (show as `XX%` load)
  - `sensor.*_status` → badge text (replaces charge state label)
- **Charging status mapping**: NUT's charging status sensor (`charging`, `discharging`, `floating`, `resting`) maps to warp core charge animation state
- **Runtime display**: Format `battery_runtime` seconds → "Xh Ym" for panel display
- **NUT buttons**: `test.battery.start.quick`, `beeper.enable/disable` — render as LCARS option strip controls if available
- **NUT switches**: Per-outlet power switches on managed PDUs — render as toggle pills

**Acceptance criteria**:
- NUT UPS devices auto-detected and rendered with warp core visualization
- SOC gauge shows battery charge percentage
- Power flow arrows show charging/discharging based on NUT status
- Battery runtime displayed in human-readable format
- Input/output voltage, load % displayed as telemetry sensors
- No regression for existing EcoFlow/Victron/Tesla battery devices

---

### 4X-8 · Climate Panel Visual Refresh — `TODO` · Priority: MEDIUM · Size: M

**GitHub Issue**: TBD
**Spec**: Existing `specs/LCARS-CLIMATE-PANEL-SPEC/`

The climate panel is functionally complete (SVG arc, setpoint controls, HVAC/fan/preset mode strips, fault indicators) but looks plain compared to newer panels like power and environment. Refresh the visual treatment to match the LCARS polish level of the v4.16+ panels.

**Current state**: Basic SVG arc, flat mode strips, minimal visual hierarchy. No viewscreen-style focal element. The panel renders correctly but feels like a data form, not an LCARS console.

**Proposed enhancements**:
- **Temperature arc upgrade**: Thicker segmented arc with gradient fill (cold→hot), animated current-temperature marker, labeled tick marks at min/max/target
- **Viewscreen-style thermostat display**: Central focal area with large current temp readout, ambient glow keyed to HVAC action (butterscotch=heating, ice=cooling, gray=idle)
- **Mode strip visual upgrade**: Active mode pill gets filled background + glow (not just underline). Match `<lcars-option-strip>` shared component styling
- **Sensor readout grid**: Humidity, outdoor temp, fault indicators in `<lcars-sensor-row>` format (currently inline)
- **Dual setpoint visual**: Heat/cool range displayed as colored band on the arc (butterscotch low, ice high)

**Acceptance criteria**:
- Climate panel visual quality matches environment/power panel polish level
- All existing functionality preserved (setpoints, modes, faults)
- Animations respect `prefers-reduced-motion`
- WCAG 2.2 AA compliance maintained

---

### 4X-9 · Pool & Spa Panel Visual Refresh — `TODO` · Priority: MEDIUM · Size: M

**GitHub Issue**: TBD
**Spec**: Existing `specs/LCARS-POOL-SPA-PANEL-SPEC/`

The pool panel is functionally complete (dual body frames, chemistry readouts, pump/circuit controls, IntelliBrite lighting) but the body viewscreens are plain text displays. Upgrade to match the visual richness of other panels.

**Current state**: Pool/spa bodies are simple temp + setpoint displays with text labels. Chemistry sensors are inline values. The caustic shimmer animation (v4.13.0) exists but the overall layout feels utilitarian.

**Proposed enhancements**:
- **Water body viewscreen**: Styled viewscreen frame around each pool/spa body (like camera viewscreen) with animated water caustic effect as the background, temperature overlay, heating indicator bar
- **Chemistry sensor badges**: Color-coded badge pills for pH, ORP, salt (green=optimal, yellow=acceptable, red=alert) replacing inline text — match the LCARS sensor badge pattern from atmoscrubber
- **SVG water temperature arc**: Mini temperature arcs per body (similar to climate arc but smaller/simpler) showing current vs target
- **Pump status indicators**: Running/stopped visual indicator with spinner animation (exists in v4.13.0 but only on primary pump — extend to all)
- **Circuit toggle upgrade**: Use `<lcars-option-strip>` or sliding track toggles for circuit controls instead of basic pills

**Acceptance criteria**:
- Pool panel visual quality matches environment/power panel polish level  
- Dual body viewscreens have distinct visual framing (pool=ice, spa=butterscotch)
- Chemistry sensors display as color-coded badges with threshold coloring
- All existing functionality preserved
- Animations respect `prefers-reduced-motion`

---

## Wesley's Enhancement Ideas (Unscheduled)

Carried forward from 4.x archive. Creative enhancement ideas — not committed to a version.

### Environment Panel
- CSS `@property --aqi-hue` with `syntax: '<angle>'` — GPU-accelerated color interpolation for cylinder gradient
- AQI "alert condition" escalation: 0–50 "All clear" (green) → 150+ "Red alert" (frame pulses red)
- Optional Web Audio API ambient hum tied to fan speed. *Worf: AudioContext requires user gesture.*

### Floor Navigation
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
