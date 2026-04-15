## 7. Pool/Spa Panel

### 7.1 — Water Body Caustic Shimmer

- **What it does**: The pool and spa cross-section viewscreens gain a subtle animated caustic pattern — overlapping translucent shapes that slowly drift and morph, simulating light refracting through water. The effect is gentle: barely-visible moving highlights over the existing viewscreen area.
- **Where it goes**: `.lcars-water-viewscreen::after` — pseudo-element with multiple `radial-gradient` backgrounds at different sizes, animated with `background-position` shift
- **LCARS justification**: Cetacean Ops observation windows on the Enterprise-D show water with light caustics visible through the viewport. The pool viewscreen is literally an observation window into a water body. Static water looks like a solid block — moving caustics say "this is a fluid."
- **Animation details**: `@keyframes lcars-caustic-drift` — `background-position: 0% 0%, 50% 50%, 25% 75%` → `100% 100%, 150% 50%, 125% 25%`. Duration: `12s`. Timing: `linear infinite`. Three overlapping radial gradients in `--lcars-ice` at 6% opacity each. Respects `prefers-reduced-motion`.

### 7.2 — Heating Active Indicator

- **What it does**: When a water body's heater is actively running, a thin animated gradient bar appears below the viewscreen — warm colors flowing left to right like heat being injected. When heating is off, the bar is a static dim gray line. Replaces the current text-only "HEAT: ON/OFF" status.
- **Where it goes**: `.lcars-heat-status-bar` element below each water body viewscreen
- **LCARS justification**: Energy flow indicators on TNG Engineering displays show animated gradient bars when power is being transferred — EPS conduit displays have flowing energy patterns. The heater is an energy system; its status should look like one.
- **Animation details**: `@keyframes lcars-heat-flow` — `background-position: 0% 0%` → `200% 0%` on a `linear-gradient(90deg, var(--lcars-tomato), var(--lcars-golden-orange), var(--lcars-tomato))` with `background-size: 200% 100%`. Duration: `2s`. Timing: `linear infinite`. Height: 3px. Only when heating.

### 7.3 — Chemistry Sensor Alert Thresholds

- **What it does**: Chemistry readouts (pH, ORP, Salt, Saturation) gain color-coded pill badges (§2.1 pattern) with threshold-reactive coloring: in-range = `--lcars-ice`, borderline = `--lcars-golden-orange`, out-of-range = `--lcars-tomato` with gentle pulse. The pill background subtly reflects water health.
- **Where it goes**: `.lcars-chemistry-sensor` elements in the left telemetry column — converted to pill badge format
- **LCARS justification**: Environmental monitoring stations aboard the Enterprise color-code atmospheric readings by safe/warning/critical bands. The chemistry column IS an environmental report — water instead of air. Color-coded thresholds are standard Starfleet monitoring protocol.
- **Animation details**: Out-of-range pulse: `@keyframes lcars-chem-alert` — `opacity: 0.8→1.0`. Duration: `1.5s`. In-range/borderline: static color, `transition: background-color 500ms ease-out` when value crosses a threshold.

### 7.4 — IntelliBrite Color Swatch Glow

- **What it does**: The currently active light color mode swatch in the IntelliBrite selector gains a soft glow outline in its representative color — a halo that says "this mode is active." When switching modes, the glow animates from the old swatch to the new one using a shared `::after` element translating across the row.
- **Where it goes**: `.lcars-intellibrite-swatch.active` — `box-shadow: 0 0 8px 2px var(--swatch-color)` plus a `.lcars-intellibrite-row::after` traveling indicator
- **LCARS justification**: Lighting control panels on Trek show the active program with a visible energy halo — the selected option glows. The traveling indicator (like §3.4 mode strip) adds the LCARS "smooth transition" between states.
- **Animation details**: Indicator travel: `transition: transform 300ms ease-out`. Glow: static `box-shadow` on active swatch. On mode change, outgoing swatch fades glow over 200ms, incoming swatch gains glow over 200ms.

### 7.5 — Pump Status Running Indicator

- **What it does**: When a pump toggle shows ON, a small animated spinner appears next to the toggle — three dots chasing each other in a circle, indicating mechanical rotation. When OFF, the dots are static and dim. This tiny animation conveys "motor is spinning" at a glance.
- **Where it goes**: `.lcars-pump-toggle.on .pump-spinner` — three 4px circles in a `display: inline-flex` container
- **LCARS justification**: Mechanical systems on TNG (turbolifts, shuttle bay doors, tractor beams) show rotating activity indicators when operating. A pump is a mechanical system. Static text "ON" is insufficient — you need to see it *running*.
- **Animation details**: `@keyframes lcars-pump-spin` — the three dots rotate around a center point via `transform: rotate()` at staggered 120° offsets. Duration: `1.2s`. Timing: `linear infinite`. Each dot fades in opacity as it trails: lead dot at 100%, second at 60%, third at 30%.

---
