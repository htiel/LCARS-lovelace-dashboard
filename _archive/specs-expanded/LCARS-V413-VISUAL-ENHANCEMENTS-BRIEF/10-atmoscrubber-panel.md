## 9. Atmoscrubber Panel

### 9.1 — Particle Rise Animation Enhancement

- **What it does**: The existing particle animation in the cylinder gets enhanced: particles now vary in size (2px–6px), opacity (0.3–0.8), and rise speed (3s–6s). Additionally, particles gain a subtle horizontal drift (±4px sinusoidal) as they rise — they don't just go straight up, they float like real particulate matter in an air column.
- **Where it goes**: `.lcars-atmos-particle` elements within `.lcars-atmos-cylinder`
- **LCARS justification**: Atmospheric processing displays on TNG show particle flow with naturalistic movement — the contaminants drift through the scrubber column, not march in rigid lines. Variable speed and drift create the illusion of a real fluid dynamic, which is what an air purifier IS.
- **Animation details**: Enhance existing `@keyframes` with: `@keyframes lcars-particle-rise-N` (multiple variants) — `transform: translateY(100%) translateX(0)` → `translateY(-100%) translateX(var(--drift-x))` where `--drift-x` varies per particle using `calc(sin(var(--particle-index) * 1.8) * 4px)` approximated by alternating `translateX(4px)` / `translateX(-4px)` keyframes. Duration: randomized via CSS custom property per particle.

### 9.2 — AQI Cylinder Ambient Glow

- **What it does**: The cylinder itself gains a soft internal glow colored by AQI level — green for Good, yellow for Moderate, orange for Unhealthy for Sensitive, red for Unhealthy. The glow radiates from within the cylinder shape as if the atmospheric processing column is illuminated by its own plasma.
- **Where it goes**: `.lcars-atmos-cylinder` — `box-shadow: inset 0 0 12px 4px var(--atmos-quality-color)`
- **LCARS justification**: The warp core glows from within. The atmospheric processing columns on starships are illuminated by their operational state — clean air = calm blue, contaminated air = warning amber/red. An unlit cylinder looks inactive. The internal glow says "scrubbers are running, here's what they're processing."
- **Animation details**: Static glow that transitions color on AQI change: `transition: box-shadow 1s ease-out`. No pulsing for Good/Moderate. Unhealthy adds gentle pulse: `@keyframes lcars-aqi-warn` — `box-shadow` intensity oscillates. Duration: `2s`.

### 9.3 — Filter Life Segment Bar

- **What it does**: The filter life percentage bar converts to a 10-segment discrete bar (§2.4 pattern) — full segments lit in `--lcars-ice`, depleted segments dark. Below 30%, remaining segments shift to `--lcars-golden-orange`. Below 10%, the last segment pulses `--lcars-tomato`.
- **Where it goes**: `.lcars-filter-bar` — replace smooth fill with 10-segment flex container
- **LCARS justification**: Consumable supplies on TNG (dilithium crystals, replicator rations, photon torpedoes) are shown as segment meters — exactly like `general.png` DILITHIUM/PLASMA/WARP CORE bars. The filter is a consumable. Segment bars are THE canonical LCARS consumable meter.
- **Animation details**: Low-filter pulse: `@keyframes lcars-filter-critical` — last lit segment opacity `0.5→1.0→0.5`. Duration: `1s`. Other segments: static, `transition: opacity 300ms` when segment count changes.

### 9.4 — Sparkline Scan Animation

- **What it does**: The 24-hour trend sparklines along the bottom gain a "drawing" animation on initial render — each line draws itself left to right as if being plotted by a sensor in real time. When data updates (hourly), the newest data point at the right edge fades in while the oldest scrolls off the left.
- **Where it goes**: `.lcars-sparkline path` SVG elements
- **LCARS justification**: Sensor trend displays on TNG show data being actively plotted — the trace draws across the display in real time. A pre-drawn static line looks like a historical record. An animated draw says "this is LIVE sensor data flowing in right now."
- **Animation details**: Initial draw: `stroke-dasharray: var(--path-length); stroke-dashoffset: var(--path-length)` → `stroke-dashoffset: 0`. Duration: `1.5s`. Timing: `ease-out`. Staggered per sparkline: `animation-delay: calc(var(--sparkline-index) * 200ms)`. New data point: `@keyframes lcars-datapoint-in` — `opacity: 0→1` over `500ms` on the rightmost segment.

### 9.5 — Preset Mode Transition Wipe

- **What it does**: When switching between preset modes (AUTO → SLEEP → TURBO), the mode selector radio buttons transition with a horizontal wipe — the new selection's pill fills from left to right as the old selection's pill empties from left to right. Not a color swap, a directional fill transition.
- **Where it goes**: `.lcars-preset-btn::before` pseudo-element acting as the fill overlay — `width` transitions from 0 to 100%
- **LCARS justification**: LCARS mode transitions use directional wipe animations — the new state overrides the old with a visible sweep. This is how phaser power level selectors work on tactical consoles: the bar fills toward the selected position. Instant color swaps feel un-LCARS.
- **Animation details**: `transition: width 250ms ease-out`. Outgoing button: `::before width 100%→0%`. Incoming button: `::before width 0%→100%`. Direction: always left-to-right (toward the "more active" direction for TURBO, reversible for SLEEP).

---
