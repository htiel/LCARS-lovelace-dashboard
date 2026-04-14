# LCARS v4.13.0 — Visual Enhancement Creative Brief

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Date**: Stardate 2026.04.13  
**Status**: SPEC ONLY — No implementation  
**Review Required**: Geordi La Forge (LCARS design compliance), Worf (security review if any external resources)  
**Constraint**: Pure CSS + HTML within LitElement. No canvas, WebGL, or external libraries.  
**Inspiration Sources**: `general.png` (Main Engineering), `thermostat.png` (Environmental), `pool panel.png` (Communications), `battery panel 1.png` (Warp Core)

---

## Cross-Panel Shared Motifs

Before diving into per-panel specifics, these are reusable CSS building blocks referenced throughout. Each panel composes from this vocabulary.

| Motif | Description | CSS Technique |
|-------|-------------|---------------|
| **Pill Badge** | Rounded-capsule readout with label left, value right (from `thermostat.png` HUMID 63%) | `border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0; display: inline-flex` |
| **Data Pips** | Row of small squares/dots along a panel edge — decorative telemetry (from `pool panel.png` bottom strip) | Repeating `background: repeating-linear-gradient` or pseudo-element grid |
| **Numeric Code** | 6–8 digit decorative stardate-style number (053-11974 from `general.png`) | `::before` / `::after` content with `attr()` or CSS custom property |
| **Segment Bar** | Discrete stacked blocks instead of smooth fill (from `general.png` DILITHIUM/PLASMA meters) | `background: repeating-linear-gradient(to top, color 0 segH, transparent segH segH+gap)` |
| **Ring Gauge** | Partial donut arc using `conic-gradient` on a rounded element (from `general.png` center rings) | `conic-gradient(from Xdeg, color 0 Ydeg, transparent Ydeg)` with `border-radius: 50%` |
| **Glow Halo** | Soft radial color bleed behind active elements | `box-shadow: 0 0 Xpx Ypx color` or `filter: drop-shadow()` |
| **Scan Line** | Horizontal luminous sweep across a surface | `@keyframes` translating a thin gradient pseudo-element top→bottom |

---

## 1. Device Panel (Base)

The base panel that all others extend. Enhancements here cascade to every panel type unless overridden.

### 1.1 — Frame Breathing Pulse

- **What it does**: The panel's border color subtly cycles between 90% and 100% opacity on a slow sinusoidal loop, giving the impression the panel is "alive" — a powered-on console drawing energy from the EPS grid.
- **Where it goes**: `.lcars-device-panel` border (all four sides)
- **LCARS justification**: On TNG, active LCARS consoles have a barely-perceptible luminance variation — they're backlit displays with plasma-phosphor substrates, not dead-flat paint. A static border reads as "powered off."
- **Animation details**: `@keyframes lcars-frame-breathe` — `opacity: 0.88` → `1.0` → `0.88`. Duration: `4s`. Timing: `ease-in-out`. Trigger: always on (ambient). Respects `prefers-reduced-motion: reduce` → disabled.

### 1.2 — Data Pip Footer Strip

- **What it does**: A 4px-tall decorative strip of tiny squares runs along the bottom edge of every panel — alternating between the panel's frame color and transparent gaps. Pure decoration that evokes the segmented data readout strips visible at the bottom of the `pool panel.png` Communications display.
- **Where it goes**: `.lcars-device-panel::after` pseudo-element, `position: absolute; bottom: 0; left: 0; right: 0; height: 4px`
- **LCARS justification**: Every TNG/DS9 LCARS console has these micro-segmented decorative strips along edges — they imply high-density data bus activity. Okuda used them to fill dead space and add visual rhythm. (Source: `pool panel.png` bottom edge)
- **Animation details**: None (static). The strip is cosmetic. Optional: a single bright pip could sweep left→right every 8s to imply data flow, using `@keyframes pip-sweep` translating a brighter segment.

### 1.3 — Header Numeric Code Watermark

- **What it does**: A faint decorative numeric code (e.g., "047-31842") appears right-aligned in the panel header bar area, rendered in `--lcars-gray` at 40% opacity. Each panel instance generates a deterministic code from the entity ID hash so it's consistent but unique.
- **Where it goes**: `.lcars-panel-header::after` pseudo-element, `position: absolute; right: var(--lcars-gap); font-size: 0.625rem; opacity: 0.4`
- **LCARS justification**: Numeric codes are *everywhere* on LCARS — `general.png` shows "053-11974" and "031-01972" flanking the wireframe globe. They suggest internal system identifiers, ODN routing numbers, or subsystem codes. Every Starfleet console has them.
- **Animation details**: None (static). The code is decorative metadata.

### 1.4 — Button Press Ripple Flash

- **What it does**: When any LCARS pill button is tapped/clicked, a bright flash radiates outward from the press point, then fades. The button momentarily brightens to `--lcars-gold` at the contact point and returns to its base color over 200ms.
- **Where it goes**: `.lcars-button:active::after` pseudo-element with radial gradient, scaling from 0 to 1
- **LCARS justification**: On the show, when actors press LCARS buttons, the touched region flares brighter — the backlit panel responding to capacitive touch. Okuda animated these as bright flash frames in post-production. A button that just changes color without a flash feels dead.
- **Animation details**: `@keyframes lcars-button-flash` — `scale(0), opacity: 0.8` → `scale(2.5), opacity: 0`. Duration: `250ms`. Timing: `ease-out`. Trigger: `:active` state.

### 1.5 — Viewscreen Power-On Scanline

- **What it does**: When a panel first renders (or when the viewscreen content changes), a single bright horizontal line sweeps from top to bottom of the media viewscreen area, like a CRT warming up. A classic "display initializing" effect.
- **Where it goes**: `.lcars-media-viewscreen::before` pseudo-element
- **LCARS justification**: The Enterprise viewscreen consistently shows a horizontal scan sweep when activating or switching feeds. It's one of the most recognizable LCARS visual signatures — the display "coming online."
- **Animation details**: `@keyframes lcars-scanline` — `translateY(-100%)` → `translateY(100%)` with a thin (2px) horizontal white gradient at 60% opacity. Duration: `600ms`. Timing: `ease-in`. Trigger: on component `firstUpdated()` or when media source changes (add/remove a `.scanning` class). Runs once, not looping.

---

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

## 4. Media Card

### 4.1 — Audio Waveform Visualizer

- **What it does**: Below the album art viewscreen, a decorative animated waveform bar runs when media is playing — a series of thin vertical bars that oscillate at randomized heights, styled in cyan with a red accent at peaks. Directly inspired by the `pool panel.png` Communications waveform display.
- **Where it goes**: New element `.lcars-audio-waveform` inserted between artwork and track title. Contains ~32 `<span>` bars, each 2px wide with `var(--lcars-gap)` spacing.
- **LCARS justification**: The `pool panel.png` Communications display has *exactly this* — a cyan+red audio waveform with a center bright glow. When media plays aboard the Enterprise, the console shows a waveform or audio-spectrum readout. It's the most visually striking element in the Communications reference.
- **Animation details**: `@keyframes lcars-waveform-barN` (one per bar group, offset) — each bar's `height` oscillates between a random min (10%) and max (60-100%). Duration: varies per bar (300ms–600ms, randomized via CSS custom properties). Timing: `ease-in-out alternate infinite`. Paused when media state is `idle`/`paused`. Center bars run taller (50-100%), edge bars shorter (10-50%) — creates the center-bright-spot from the reference. Apply `prefers-reduced-motion` guard.

### 4.2 — Album Art Viewscreen Border Glow

- **What it does**: When media is actively playing, the viewscreen border gains a soft outward glow in the panel's frame color (`--lcars-african-violet` for media). The glow pulses gently — the viewscreen is "energized" and displaying content.
- **Where it goes**: `.lcars-media-viewscreen` when `.playing` — `box-shadow: 0 0 12px 2px var(--lcars-african-violet)`
- **LCARS justification**: Active viewscreens on the Enterprise have a visible luminance halo at their edges — the display emits light into the surrounding LCARS frame. An inactive viewscreen has no glow. This distinguishes "now playing" from "standby" at a distance.
- **Animation details**: `@keyframes lcars-viewscreen-glow` — `box-shadow` spread oscillates between `2px` and `6px`. Duration: `3s`. Timing: `ease-in-out`. Only when playing. Idle = no glow, no animation.

### 4.3 — Transport Button Active States

- **What it does**: The play/pause button gains a persistent glow ring when active (playing = bright, paused = dim pulse). Skip buttons flash on press. Shuffle/repeat pills show a small "lit" indicator dot when enabled — a 4px colored circle in the top-right corner.
- **Where it goes**: `.lcars-transport-btn.active` for play state, `.lcars-transport-btn:active` for skip flash, `.lcars-transport-btn[data-enabled]::before` for indicator dot
- **LCARS justification**: TNG console buttons show persistent illumination when their function is engaged — not just a color change but a visible "this is ON" glow state. The dot indicator matches Okuda's "active function" micro-pip used on tactical consoles.
- **Animation details**: Play button: constant `box-shadow: 0 0 6px var(--lcars-gold)`. Paused: `@keyframes lcars-pause-pulse` pulsing the shadow 0→6px, duration `2s`. Skip buttons: existing `lcars-button-flash` from §1.4. Indicator dot: static, `background: var(--lcars-gold); width: 4px; height: 4px; border-radius: 50%`.

### 4.4 — Progress Bar Luminous Head

- **What it does**: The playback progress bar's leading edge (the point between played and unplayed) gains a bright vertical pip — a 4px-wide, 100%-height bright accent that marks the "now" position. It subtly glows, acting as a playhead indicator visible from across the room.
- **Where it goes**: `.lcars-progress-bar .played::after` — `width: 4px; background: var(--lcars-gold); box-shadow: 0 0 6px var(--lcars-gold)`
- **LCARS justification**: LCARS progress indicators (seen in transporter and replicator sequences) always have a visible "head" marker — a bright point showing current position in a process. A flat two-tone bar without a head marker lacks the precision that LCARS demands.
- **Animation details**: Soft glow pulse: `@keyframes lcars-playhead-glow` — `box-shadow` 4px → 8px → 4px. Duration: `2s`. Always on while playing. Position moves via CSS `width %` of the played portion.

### 4.5 — Idle State Standby Pulse

- **What it does**: When media is idle, the viewscreen area shows a single small `♪` glyph (already specified) with a slow breathing opacity pulse — the console is in low-power standby, not dead.
- **Where it goes**: `.lcars-media-idle .standby-glyph`
- **LCARS justification**: Unmanned consoles on TNG still show subtle activity — a slowly pulsing Starfleet chevron or a dim standby indicator. A completely black panel looks broken. The breathing pulse says "I'm here, ready when you are."
- **Animation details**: `@keyframes lcars-standby-breathe` — `opacity: 0.2` → `0.5` → `0.2`. Duration: `4s`. Timing: `ease-in-out infinite`. Apply `prefers-reduced-motion` guard.

---

## 5. Alarm Panel

### 5.1 — Red Alert Frame Strobe

- **What it does**: When the alarm is in `triggered` state, the panel frame rapidly pulses between `--lcars-tomato` and 50% brightness red — a true Red Alert strobe. This is the most aggressive animation in the entire dashboard: it demands immediate attention.
- **Where it goes**: `.lcars-alarm-panel[data-state="triggered"]` border animation
- **LCARS justification**: *RED ALERT.* The entire bridge bathes in pulsing red. This is the single most iconic visual state in all of Star Trek. When the alarm triggers, there is zero subtlety. The frame screams.
- **Animation details**: `@keyframes lcars-red-alert` — `border-color: var(--lcars-tomato)` → `border-color: #882222` → `var(--lcars-tomato)`. Duration: `1s`. Timing: `linear infinite`. **Must** respect `prefers-reduced-motion` → falls back to static tomato border (no strobe). Consider also toggling a `box-shadow: 0 0 20px var(--lcars-tomato)` in sync for ambient room glow on dark screens.

### 5.2 — Shield Icon Reactive Glow

- **What it does**: The shield SVG in the viewscreen responds to alarm state with layered glow effects: Disarmed = cool blue static glow. Armed Home = warm amber static glow. Armed Away = bright amber with slow pulse. Triggered = red with rapid pulse (sync with §5.1). The shield itself is the status beacon.
- **Where it goes**: `.lcars-shield-icon` SVG element — apply `filter: drop-shadow(0 0 Xpx color)` with dynamic values
- **LCARS justification**: The Enterprise shield status display shows the ship outline with a color-coded energy field around it — blue for shields up and holding, amber for shields at reduced power, red for shields failing. The shield icon IS the tactical readout.
- **Animation details**: Disarmed: `filter: drop-shadow(0 0 8px var(--lcars-ice))` static. Armed: `@keyframes lcars-shield-armed` — drop-shadow spread `6px→12px→6px`. Duration: `3s`. Triggered: `@keyframes lcars-shield-critical` — drop-shadow rapid cycle, duration: `0.5s`. Color set via CSS custom property `--shield-glow-color`.

### 5.3 — Keypad Button Tactile Flash

- **What it does**: Each keypad digit, when pressed, emits the `lcars-button-flash` ripple (§1.4) AND briefly shows the pressed digit in an enlarged ghost above the button (like a phone keyboard preview) that fades up and out over 200ms.
- **Where it goes**: `.lcars-keypad-btn:active::before` — pseudo-element positioned above the button, showing the digit character at 150% scale
- **LCARS justification**: Starship security keypads (seen in VOY "Basics" and DS9 brig scenes) show a magnified confirmation of the pressed key — the operator sees what they've entered. On a touchscreen without physical keys, this visual feedback is critical.
- **Animation details**: `@keyframes lcars-key-preview` — `opacity: 1; transform: translateY(-100%) scale(1.5)` → `opacity: 0; transform: translateY(-150%) scale(1.5)`. Duration: `200ms`. Timing: `ease-out`. Trigger: `:active` state.

### 5.4 — Countdown Timer Urgency Escalation

- **What it does**: During the arm/disarm countdown, the countdown number progressively changes: >15s = normal `--lcars-sunflower` text, 10-15s = `--lcars-golden-orange` with gentle pulse, 5-10s = `--lcars-tomato` with faster pulse, <5s = `--lcars-tomato` with scale pulsing (number grows/shrinks slightly). Urgency increases as time runs out.
- **Where it goes**: `.lcars-countdown-display` text element
- **LCARS justification**: Self-destruct countdowns on TNG/VOY show escalating visual urgency — the numbers get more intense, the display more insistent as time expires. The alarm countdown is literally a self-destruct sequence for your security system's grace period.
- **Animation details**: `@keyframes lcars-countdown-urgent` — at <5s: `transform: scale(1.0)→scale(1.1)→scale(1.0)`. Duration decreases with time: 2s → 1s → 0.5s. Color transitions via CSS variable `--countdown-color` updated by JS.

### 5.5 — Zone Status Micro-Pips

- **What it does**: Each zone in the zone roster gets a small colored dot prefix — green for OK, amber for bypass, red for fault/open. When a zone changes state, the dot briefly flashes bright before settling to its new color.
- **Where it goes**: `.lcars-zone-row::before` — `width: 6px; height: 6px; border-radius: 50%; background: var(--zone-status-color)`
- **LCARS justification**: Tactical displays on the Enterprise show status pips for individual subsystems — small colored indicators showing per-unit readiness. Worf's tactical display uses exactly this pattern: rows of system names with status dots.
- **Animation details**: State change flash: `@keyframes lcars-pip-flash` — `background: white; transform: scale(1.5)` → `background: var(--zone-status-color); transform: scale(1)`. Duration: `300ms`.

---

## 6. Weather Panel

### 6.1 — Condition-Reactive Ambient Glow

- **What it does**: The viewscreen area gains a subtle full-bleed ambient glow behind the temperature number, colored by weather condition: sunny = warm golden glow, cloudy = cool gray, rain = deep blue, storm = flickering violet, snow = bright white. The glow is a radial gradient positioned behind the text — the "atmosphere" of the atmosphere.
- **Where it goes**: `.lcars-weather-viewscreen::before` — `background: radial-gradient(circle at 50% 50%, var(--weather-ambient-color) 0%, transparent 70%); opacity: 0.15`
- **LCARS justification**: When Data scans a planet's atmosphere, the sensor display tints to match conditions — ice worlds glow cool blue, volcanic worlds glow orange. The display itself becomes a visual summary of its content. The glow is data, not decoration.
- **Animation details**: Storm state adds `@keyframes lcars-storm-flicker` — opacity jitters between 0.1 and 0.25 at irregular intervals (use `steps()` timing). Duration: `3s`. Other conditions: static glow, `transition: background 1s ease-out` when condition changes.

### 6.2 — Wind Compass Animated Needle

- **What it does**: The wind direction indicator gains a smooth animated rotation when wind direction updates — the compass needle doesn't jump to the new bearing, it rotates to it via the shortest path. When wind speed exceeds 20mph, the needle adds a subtle oscillation (±5°) to convey gusty conditions.
- **Where it goes**: `.lcars-wind-compass .needle` SVG element — `transform: rotate(var(--wind-deg))`
- **LCARS justification**: Navigation deflector controls on TNG show vector indicators that smoothly rotate to new headings — they never snap. Helm control is continuous, not discrete. The wind compass is a miniature navigation display.
- **Animation details**: `transition: transform 800ms ease-out` for heading changes. Gusty overlay: `@keyframes lcars-gust-oscillate` — `rotate(calc(var(--wind-deg) - 5deg))` → `rotate(calc(var(--wind-deg) + 5deg))`. Duration: `0.8s alternate infinite`. Only when wind speed > 20mph threshold (set via JS class `.gusty`).

### 6.3 — Forecast Strip Temperature Range Bars

- **What it does**: The 7-day forecast strip's high/low numbers gain thin vertical colored bars between them — a visual temperature RANGE indicator. The bar spans from low (bottom, blue) to high (top, warm) with a gradient fill. The bar height is proportional to the temp range across the 7-day spread — wide-range days have tall bars, narrow-range days have short bars. Inspired by `thermostat.png` precipitation bar chart.
- **Where it goes**: `.lcars-forecast-day .temp-range-bar` — new `<div>` element between high and low temp numbers
- **LCARS justification**: The `thermostat.png` reference shows gradient bar charts for hourly precipitation. This same visual pattern applied to temperature ranges gives the forecast strip *shape* — not just numbers but a visual contour of the week ahead.
- **Animation details**: On data update, bars grow from 0 to their target height over 400ms with `@keyframes lcars-bar-grow` — `scaleY(0)→scaleY(1)`. `transform-origin: bottom`. Staggered by day index: `animation-delay: calc(var(--day-index) * 60ms)` for a left-to-right cascade effect.

### 6.4 — Sun Arc Day Progress

- **What it does**: The sunrise/sunset time display gains a thin semicircular arc above it representing the day's arc from sunrise to sunset. A bright dot tracks the sun's current position along the arc. Before sunrise and after sunset, the dot is absent and the arc dims to 20% opacity. From `thermostat.png` sun/moon indicators.
- **Where it goes**: `.lcars-sun-arc` — new SVG element, half-circle path, positioned between viewscreen and forecast strip
- **LCARS justification**: Astrometrics displays show orbital arcs for planetary bodies with current-position indicators. The sun arc is a miniature orbital display — where is our star right now? This turns a pair of timestamp numbers into a visual position readout.
- **Animation details**: The sun dot position updates via `stroke-dashoffset` keyed to current time between sunrise/sunset. `transition: stroke-dashoffset 60s linear` (updates every minute, transitions smoothly). The dot has a soft glow: `filter: drop-shadow(0 0 3px var(--lcars-gold))`.

### 6.5 — Precipitation Probability Pips

- **What it does**: Below each forecast day, the precipitation percentage is rendered as a row of 10 tiny pips (5×2 grid) — filled pips = probability. 30% = 3 filled pips out of 10. Filled pips are `--lcars-ice`, empty pips are `--lcars-gray` at 30% opacity. A spatial representation of probability rather than a number.
- **Where it goes**: `.lcars-forecast-day .precip-pips` — 10 `<span>` elements in a `display: grid; grid-template-columns: repeat(5, 4px); gap: 1px` container
- **LCARS justification**: LCARS represents probability and fill levels with discrete indicator blocks, not percentages. On TNG's tactical displays, shield strength is shown as lit/unlit segments. Precipitation probability mapped to the same visual language feels native.
- **Animation details**: On data update, pips light sequentially with 30ms stagger: `animation-delay: calc(var(--pip-index) * 30ms)`. `@keyframes lcars-pip-light` — `opacity: 0.3→1.0`. Duration: `200ms`.

---

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

## 8. Irrigation Panel

### 8.1 — Zone Fill Bar Water Flow Animation

- **What it does**: The active zone's fill bar (currently a static progressing bar) gains an animated internal pattern — thin diagonal stripes scrolling left to right within the filled portion, simulating water flowing through the pipe. Idle zones have a solid dim bar.
- **Where it goes**: `.lcars-zone-fillbar.active .fill` — `background: repeating-linear-gradient(-45deg, var(--lcars-ice) 0 4px, rgba(153,204,255,0.5) 4px 8px); background-size: 11.3px 100%; animation: lcars-flow`
- **LCARS justification**: Fluid/gas flow indicators on TNG Engineering displays show animated stripe patterns within conduit visualizations — deuterium flowing to the warp core, coolant flowing through EPS taps. Water in a pipe should look like fluid in a conduit.
- **Animation details**: `@keyframes lcars-flow` — `background-position: 0 0` → `11.3px 0` (one full stripe width). Duration: `0.6s`. Timing: `linear infinite`. The diagonal stripes create a barberpole/candy-stripe scroll effect.

### 8.2 — Zone Completion Flash

- **What it does**: When a zone's watering cycle completes (transitions from active to idle), the zone row briefly flashes green-to-dark — a confirmation that the cycle finished successfully. The row border-left gets a green accent for 2 seconds then fades.
- **Where it goes**: `.lcars-zone-row.completing` — triggered by JS when zone state transitions from watering to idle
- **LCARS justification**: Task completion on LCARS consoles always produces a confirmation flash — the transporter cycle complete flash, the replicator materialization finish. The system says "done" with a brief visual event, not just a text change.
- **Animation details**: `@keyframes lcars-zone-complete` — `border-left: 3px solid var(--lcars-ice); background: rgba(153,204,255,0.1)` → `border-left: 3px solid transparent; background: transparent`. Duration: `2s`. Runs once.

### 8.3 — Schedule Countdown Proximity Glow

- **What it does**: As the next scheduled run approaches (within 1 hour), the "NEXT RUN" text in the schedule sidebar gains an increasingly bright glow — dim at 60 minutes out, bright at 0 minutes. At T-0, the text flashes and the panel transitions to active state.
- **Where it goes**: `.lcars-schedule-next[data-proximity]` — `text-shadow` intensity keyed to `--schedule-proximity` custom property (0.0–1.0)
- **LCARS justification**: Mission countdown displays on TNG show increasing visual urgency as the scheduled event approaches — the console communicates "upcoming" with growing intensity, not just a static timestamp.
- **Animation details**: `text-shadow: 0 0 calc(var(--schedule-proximity) * 8px) var(--lcars-ice)`. Updated by JS every minute. At T-0: `@keyframes lcars-schedule-go` — brief white flash then settle to active-zone styling. Duration: `500ms`.

### 8.4 — Rain Delay Cloud Badge

- **What it does**: When rain delay is active, a pill badge (§2.1 pattern) appears in the schedule sidebar with a `☁` glyph and the delay duration — styled in `--lcars-ice` with a soft drop shadow to look like a cloud. The badge gently bobs up and down (1px) on a slow cycle — the cloud is floating.
- **Where it goes**: `.lcars-rain-delay-badge` — new pill element in schedule column, only visible when rain delay > 0
- **LCARS justification**: Environmental alerts on TNG show condition badges — small capsule indicators that appear when a specific condition is active. The rain delay is a weather-intelligence override; it deserves its own status badge, not just a text change in an existing field.
- **Animation details**: `@keyframes lcars-cloud-bob` — `translateY(0px)→translateY(-1px)→translateY(0px)`. Duration: `3s`. Timing: `ease-in-out infinite`. Respects `prefers-reduced-motion`.

---

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

## Accessibility & Motion Safety

All animated enhancements **MUST** be gated behind:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all continuous/looping animations */
  /* Keep single-fire confirmations (button flash, completion flash) but reduce duration by 50% */
  /* Keep static glows — they're not motion, they're color */
}
```

> **[Worf R5] Security Invariant**: No `innerHTML`, `unsafeHTML()`, or direct DOM
> `textContent` assignment is used for entity-derived data. All rendering flows
> through LitElement `html` tagged template auto-escaping. This invariant MUST be
> maintained across all v4.13.0 implementations.

Animations fall into three categories:

| Category | Motion Setting: `no-preference` | Motion Setting: `reduce` |
|----------|-------------------------------|--------------------------|
| **Ambient loops** (breathing, waveform, caustics, particle drift, pump spin) | Full animation | Disabled — static fallback |
| **State transitions** (glow changes, color shifts, bar fills) | Animated transition | Instant transition (0ms duration) |
| **Confirmations** (button flash, completion flash, key preview) | Full animation | Duration halved, still plays |

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Total concurrent CSS animations per visible panel | ≤ 6 |
| Max animation duration (ambient) | ≤ 12s |
| Max animation duration (confirmation) | ≤ 500ms |
| Pseudo-elements per panel | ≤ 4 |
| `box-shadow` animations (GPU-intensive) | ≤ 2 per panel |
| All animations use `will-change` | Only on elements actively animating |
| `transform` and `opacity` preferred over | `width`, `height`, `top`, `left`, `background-position` |

---

## Next Steps

1. **Geordi review**: Validate that all proposals align with LCARS UI Architecture spec, color assignments, and Bracer Jack rules. Particular attention to: pill badge styling consistency, segment bar sizing against the grid system, and whether the waveform visualizer conflicts with media card layout.
2. **Worf review**: No external resources or CSP changes in this brief. All CSS-only. No security concerns anticipated, but flag if any `content:` properties or pseudo-elements could interfere with screen reader output.
3. **Implementation order**: Start with cross-panel shared motifs (§1 Device Panel base), then layer panel-specific enhancements. Shared CSS keyframes and mixins first.
4. **Prototype**: Build a single demo panel with all §1 enhancements to validate the breathing/glow/flash feel before rolling out to all 9 panel types.

---

## Worf + Data — v4.13.0 Visual Enhancements Review (Brief)

**Date**: Stardate 2026.04.13

### Worf (Security)
**Verdict**: APPROVED WITH CONDITIONS

- **[R5 — APPLIED]** Security invariant documented: no `innerHTML`/`unsafeHTML`/`textContent` for entity data; all rendering via LitElement `html` tagged template auto-escaping.
- Motion taxonomy (ambient/transition/confirmation) is well-structured. All categories properly gated behind `prefers-reduced-motion`.
- No external resources, no CSP changes, no new dependencies. Pure CSS + HTML within LitElement.

### Data (Architecture)
**Verdict**: APPROVED

- Performance budget is sound. ≤6 concurrent + ≤2 box-shadow per panel is enforceable.
- Accessibility categories well-defined. Implementation order recommendation correct.
- **Estimated bundle impact** across all 9 specs: ~12.6 KiB net (after DRY extraction), ~4.2 KiB gzipped = 4.6% of 277 KiB bundle. Post-v4.13.0 estimated: ~290 KiB. Acceptable.

### Cross-Spec DRY Recovery (Data)

| Duplicated Pattern | Instances | Est. Savings | Resolution |
|---|---|---|---|
| `viewscreen-activate` keyframes | 5 specs | 1.6 KiB | `lcars-shared-animations.js` module |
| `cascade-in` keyframes | 4 specs | 180B | Shared module |
| Distress/fault pulse variants | 5 specs | 280B | Parametric `lcars-distress-pulse` |
| State→color switch functions | 8 functions | 1.75 KiB | `STATE_COLOR_MAP` in `lcars-color-utils.js` |
| Reduced-motion boilerplate | 9 specs | 800B | `lcars-reduced-motion.js` |
| **Total recoverable** | | **~5.3 KiB** | |
