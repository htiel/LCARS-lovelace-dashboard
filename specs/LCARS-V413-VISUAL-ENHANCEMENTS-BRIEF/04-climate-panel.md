## 3. Climate Panel

### 3.1 — Arc Gauge Ring Segments

- **What it does**: The SVG temperature arc currently renders as a smooth colored stroke. This enhancement overlays radial tick marks at each degree, creating a segmented ring gauge effect — like the concentric ring indicators in `general.png`. The arc becomes a series of discrete lit segments rather than a smooth band.
- **Where it goes**: `.lcars-climate-arc` SVG — add a `stroke-dasharray` pattern to the arc path, or overlay a radial tick mask
- **LCARS justification**: The `general.png` center shows segmented ring gauges with alternating gray/gold sections. Smooth arcs look like modern material design. Segmented arcs look like LCARS. The discontinuity conveys "individual sensor samples."
- **Animation details**: When target temperature changes, the arc's `stroke-dashoffset` animates to the new position. `transition: stroke-dashoffset 800ms ease-in-out`. The newly-lit segment at the leading edge flashes `--lcars-gold` briefly.

### 3.2 — HVAC Action Frame Pulse

- **What it does**: When the HVAC is actively heating or cooling (not idle), the panel frame border gently pulses in sync with the action — warm butterscotch pulsing when heating, cool ice-blue pulsing when cooling. Adds urgency: the system is actively working.
- **Where it goes**: `.lcars-climate-panel[data-hvac-action="heating"]` / `[data-hvac-action="cooling"]` border animation
- **LCARS justification**: On TNG, environmental substations show pulsing indicators when atmospheric processors are actively running — the display communicates "the system is currently engaged" vs. "the system is idle and monitoring." A static frame means idle. A pulsing frame means active.
- **Animation details**: `@keyframes lcars-hvac-pulse` — border-color oscillates between the action color and a 70% brightness version. Duration: `2s`. Timing: `ease-in-out`. Only when HVAC action is `heating` or `cooling`, not when `idle` or `off`.

### 3.3 — Setpoint Button Glow Feedback

- **What it does**: When the + or – setpoint buttons are pressed, the target temperature number briefly glows with a soft halo and scales up by 5% before settling back — visual confirmation that the setpoint changed.
- **Where it goes**: `.lcars-target-temp` text element when adjacent `.lcars-setpoint-btn` is activated
- **LCARS justification**: Environmental control adjustments on TNG always produced a visible response on the readout — the number updates with emphasis, not silently. The operator needs confirmation the ship heard them.
- **Animation details**: `@keyframes lcars-setpoint-confirm` — `transform: scale(1.05); text-shadow: 0 0 8px var(--lcars-gold)` → `transform: scale(1); text-shadow: none`. Duration: `400ms`. Trigger: on setpoint change event.

### 3.4 — Mode Strip Active Indicator

- **What it does**: The currently active HVAC mode pill (HEAT, COOL, AUTO, etc.) gains a thin animated underline — a bright 2px bar that slides horizontally from the previous selection to the new one when modes change. Other pills have no underline.
- **Where it goes**: `.lcars-mode-strip` — a `::after` pseudo-element on the strip container that `translateX()` to the active pill's position
- **LCARS justification**: LCARS mode selectors on TNG consoles use a "traveling indicator" — a bright bar that slides between options when toggled. It's smoother than just swapping colors, and communicates state transition.
- **Animation details**: `transition: transform 300ms ease-out`. The bar width matches the active pill width. Color: `--lcars-gold`. Height: 2px. Position: bottom of the mode strip.

### 3.5 — Ambient Temperature Data Pips

- **What it does**: Below the sensor telemetry column, a row of 24 tiny squares represents the last 24 hours of temperature readings as a micro heatmap. Each pip is colored from `--lcars-ice` (cold) through `--lcars-sunflower` (warm) to `--lcars-tomato` (hot). A miniature 24-hour history at a glance.
- **Where it goes**: `.lcars-sensor-column::after` — a flex row of 24 `<span>` elements, each 4px × 4px with `border-radius: 1px`
- **LCARS justification**: Environmental sensor substations on TNG display 24-hour trend micro-indicators — tiny colored blocks showing atmospheric conditions over time. The data pips from `pool panel.png` serve this same function: dense data in minimal space.
- **Animation details**: New pip (current hour) fades in with `opacity 0→1 over 500ms` when the hour rolls over. Otherwise static.

---
