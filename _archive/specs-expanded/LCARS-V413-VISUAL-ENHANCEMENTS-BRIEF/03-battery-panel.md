## 2. Battery Panel

*Note: Warp core column redesign is Geordi's domain — these enhancements target the surrounding panel chrome, sensor readouts, and slider controls.*

### 2.1 — Sensor Pill Badges

- **What it does**: Replaces plain text sensor readouts (voltage, current, temperature) with pill-shaped badge elements — label on the left in a colored block, value on the right in a contrasting block. Directly inspired by the `thermostat.png` HUMID/HPA/MPH/CLOUD badges.
- **Where it goes**: `.lcars-sensor-readout` elements in the sensor telemetry column. Each becomes a `display: inline-flex` with two children: `.pill-label` (colored background) and `.pill-value` (dark background, light text).
- **LCARS justification**: The pill badge is canonical LCARS vocabulary — `thermostat.png` Environmental panel shows exactly this pattern. Label+value capsules are how LCARS presents discrete sensor data when horizontal space is available.
- **Animation details**: On value change, `.pill-value` briefly flashes to `--lcars-gold` background for 300ms then returns — indicating a fresh data update. `@keyframes pill-flash` — `background-color: var(--lcars-gold)` → original. Triggered by adding/removing `.updated` class on state change.

### 2.2 — Slider Snap Detent Feedback

- **What it does**: When a slider (brightness, volume, etc.) crosses a 10% boundary, the slider thumb momentarily widens by 2px and emits a tiny glow pulse — haptic-like visual feedback for discrete "click" positions.
- **Where it goes**: `.lcars-slider input[type=range]::-webkit-slider-thumb` and equivalent `::-moz-range-thumb`
- **LCARS justification**: Physical LCARS consoles (the prop panels built for TNG) had detented sliders — you could feel positions. The visual detent communicates that the system registered the input. This is the screen equivalent of tactile feedback.
- **Animation details**: `@keyframes lcars-detent-pulse` — `box-shadow: 0 0 4px var(--lcars-gold)` → `box-shadow: 0 0 0 transparent`. Duration: `150ms`. Trigger: via JS `input` event detecting 10% boundary crossing, adding a transient class.

### 2.3 — Charge State Glow Aura

- **What it does**: A soft glow halo appears behind the battery percentage readout, colored by charge state: `--lcars-ice` (>60%), `--lcars-golden-orange` (20-60%), `--lcars-tomato` (<20%). The glow intensity scales with charge level — fully charged = bright, depleted = dim and red.
- **Where it goes**: `.lcars-battery-percentage` element, using `box-shadow` with dynamic color and spread
- **LCARS justification**: On TNG, power level readouts on Engineering consoles have a colored luminance behind the numeric display — the brighter the glow, the more power available. When the warp core is failing, Engineering goes dim and red. This maps battery charge to the same "power presence" visual.
- **Animation details**: Static glow, no animation. Color and spread update reactively on state change. Transition: `box-shadow 500ms ease-out`.

### 2.4 — Segment Bar Meter

- **What it does**: Replaces smooth battery fill bars with discrete stacked segment bars — 10 segments for 0-100%, each a rounded rectangle that lights up or stays dark. Directly from `general.png` DILITHIUM/PLASMA/WARP CORE vertical meters.
- **Where it goes**: `.lcars-battery-fill-bar` — refactored from `background: linear-gradient(to right, ...)` to a `display: flex; gap: 2px` container with 10 child `<span>` segments.
- **LCARS justification**: *This is the definitive LCARS meter.* The `general.png` reference image shows exactly this pattern — three vertical segment bars with numbered scales 1-6. Smooth gradients are not LCARS. Discrete segments are.
- **Animation details**: When charge changes, newly lit/unlit segments transition with `opacity 300ms ease-out` — segments don't just appear/disappear, they fade in/out like plasma-phosphor cells energizing.

---
