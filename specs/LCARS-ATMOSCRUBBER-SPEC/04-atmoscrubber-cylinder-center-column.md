## 3. Atmoscrubber Cylinder (Center Column)

The centerpiece visualization: a vertical cylinder representing the air filtration column. Particles drift upward through it — dirty air enters the bottom, clean air exits the top.

### Cylinder CSS

```css
.atmos-cylinder {
  grid-area: core;
  position: relative;
  align-self: center;
  justify-self: center;

  /* Cylinder dimensions — vertical, narrow */
  width: 4rem;
  height: 100%;
  min-height: 10rem;
  max-height: 18rem;

  /* Pill shape — rounded top and bottom caps */
  border-radius: 2rem;

  /* Cylinder body — subtle gradient NOT on the fill, but structural shading
     to convey 3D cylindrical form. This is the ONE exception to "no gradients" —
     the cylinder itself is a structural element, not a button or panel.
     Bracer Jack Rule 1 applies to UI chrome, not data visualizations.
     The gradient is minimal: a 10% brightness shift to imply curvature. */
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.03) 60%,
      rgba(255,255,255,0) 100%
    ),
    var(--lcars-bg);

  /* Border uses the dynamic AQI color */
  border: 2px solid var(--atmos-quality-color, var(--lcars-ice));

  /* Overflow hidden to clip particles */
  overflow: hidden;

  /* Transition for color changes */
  transition: border-color var(--lcars-transition-slow);
}
```

### Cylinder Internal Structure

```
┌──────────┐  ← rounded cap (clean air exit)
│ ░  ▒  ░  │  ← particles drifting up
│  ░    ▒  │
│ ▒  ░     │
│    ░  ▒  │
│ ░     ░  │
│  ▒  ░    │
│ ░    ▒ ░ │
│   ░   ░  │
└──────────┘  ← rounded cap (dirty air intake)
```

### Tick Marks (AQI Scale)

Horizontal tick marks along the left edge of the cylinder, spaced evenly, representing AQI thresholds. These are purely decorative/informational — they don't change with data.

```css
.atmos-cylinder-ticks {
  position: absolute;
  top: 1rem;        /* Below the rounded cap */
  bottom: 1rem;     /* Above the rounded cap */
  left: 0;
  width: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.atmos-tick {
  width: 100%;
  height: 2px;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0.4;
  transition: background var(--lcars-transition-slow);
}

/* 5 ticks: corresponding to AQI thresholds 50, 100, 150, 200, 300 */
/* The active tick (closest to current AQI) gets full opacity */
.atmos-tick.active {
  opacity: 1;
  height: 3px;
}
```

### Fill Level (Optional — Fan Speed Indicator)

An inner fill rectangle that rises from the bottom, height proportional to fan speed percentage (0% = off/idle, 100% = turbo). For sensor-only devices, this shows AQI level instead.

```css
.atmos-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0.12;
  border-radius: 0 0 2rem 2rem;
  transition: height 1s ease-out, background var(--lcars-transition-slow);
  /* Height set by JS: style="height: ${fillPercent}%" */
}
```

### v4.13.0 Visual Enhancements

> **[Data C-5 / R-4]** Particle count reduced from 8–12 to 6 max. Dual animation
> (rise + drift) merged into single `lcars-particle-float` keyframe to halve
> compositor layers. Existing §3 `atmos-particle-rise` is superseded by this
> section — consolidate during implementation.

#### Enhanced Particle Drift
Particles now vary in size (2–6px), opacity (0.3–0.8), speed (3–6s), and gain ±4px horizontal drift as they rise — floating like real particulate matter in an air column, not marching in rigid lines. (Source: Bracer Jack — empty space is beautiful; the particles fill the cylinder without cluttering it. Source: System 47 — animation tempo is methodical.)

```css
.lcars-atmos-particle {
  position: absolute;
  border-radius: 50%;
  background: var(--atmos-quality-color, var(--lcars-ice));
  will-change: transform, opacity;
  /* ── Per-particle variation via CSS custom properties set by JS ── */
  width: var(--particle-size, 3px);
  height: var(--particle-size, 3px);
  opacity: var(--particle-opacity, 0.5);
  /* [Data R-4] Single merged keyframe replaces dual rise + drift */
  animation: lcars-particle-float var(--particle-speed, 4s) linear infinite;
  animation-delay: var(--particle-delay, 0s);
}

@keyframes lcars-particle-float {
  from {
    transform: translateY(100%) translateX(calc(var(--particle-drift, 4px) * -1));
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity, 0.5);
  }
  90% {
    opacity: var(--particle-opacity, 0.5);
  }
  to {
    transform: translateY(-100%) translateX(var(--particle-drift, 4px));
    opacity: 0;
  }
}
```

JS generates **6** particles (max) with randomized custom properties:
- `--particle-size`: `Math.random() * 4 + 2` → 2–6px
- `--particle-opacity`: `Math.random() * 0.5 + 0.3` → 0.3–0.8
- `--particle-speed`: `Math.random() * 3 + 3` → 3–6s
- `--particle-drift`: `Math.random() * 4 + 1` → 1–4px
- `--particle-delay`: `Math.random() * -6` → staggered start

The merged keyframe composes vertical travel with horizontal oscillation in a single animation. Fade-in at 10% and fade-out at 90% prevents particles popping at cylinder edges. Concurrent animation count: 6 particles × 1 animation + AQI pulse + breathe = **8** (all GPU-composited, per budget footnote).

#### AQI Cylinder Ambient Glow
Internal `box-shadow` on the cylinder, colored by AQI level: Good=ice, Moderate=sunflower, USG=golden-orange, Unhealthy=tomato. The warp core glows from within — so does an active atmospheric processing column. (Source: TheLCARS.com — glow halos are permitted for status; Bracer Jack — color carries assigned meaning per the 4-color rule.)

```css
.lcars-atmos-cylinder {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  background: var(--lcars-black, #000);
  box-shadow: inset 0 0 12px 4px var(--atmos-quality-color, var(--lcars-ice));
  transition: box-shadow 1s ease-out;
}

/* ── AQI color map ── */
:host([aqi-level="good"])      { --atmos-quality-color: var(--lcars-ice); }
:host([aqi-level="moderate"])  { --atmos-quality-color: var(--lcars-sunflower); }
:host([aqi-level="usg"])       { --atmos-quality-color: var(--lcars-golden-orange); }
:host([aqi-level="unhealthy"]) { --atmos-quality-color: var(--lcars-tomato); }

/* ── Unhealthy pulse ── */
:host([aqi-level="unhealthy"]) .lcars-atmos-cylinder {
  animation: lcars-aqi-warn 2s ease-in-out infinite;
}

@keyframes lcars-aqi-warn {
  0%, 100% { box-shadow: inset 0 0 12px 4px var(--lcars-tomato); }
  50%      { box-shadow: inset 0 0 18px 6px var(--lcars-tomato); }
}
```

Four AQI colors map to four assigned meanings — at Bracer Jack's 4-color threshold. The inset shadow creates the "glowing from within" effect without adding a pseudo-element. Unhealthy pulse expands the glow radius, not opacity — the column breathes brighter.

#### Filter Life Segment Bar
10-segment discrete bar replacing smooth fill. Full segments lit in `--lcars-ice`, depleted dark. Below 30% = `--lcars-golden-orange`. Below 10% = `--lcars-tomato` with pulse. The `general.png` DILITHIUM/PLASMA/WARP CORE bars ARE the canonical LCARS consumable meter. (Source: TheLCARS.com — segment bars per creative brief §2.4.)

```css
.lcars-filter-bar {
  display: flex;
  gap: 2px;
  height: 0.75rem;
  align-items: stretch;
}

.lcars-filter-bar .segment {
  flex: 1;
  border-radius: 1px;
  background: var(--lcars-gray);
  opacity: 0.2;
  transition: opacity 300ms ease-out, background-color 500ms ease-out;
}

.lcars-filter-bar .segment.lit {
  opacity: 1;
  background: var(--lcars-ice);
}

/* ── Warning: below 30% (3 segments) ── */
.lcars-filter-bar[data-level="warn"] .segment.lit {
  background: var(--lcars-golden-orange);
}

/* ── Critical: below 10% (1 segment) ── */
.lcars-filter-bar[data-level="critical"] .segment.lit {
  background: var(--lcars-tomato);
}

.lcars-filter-bar[data-level="critical"] .segment.lit:last-of-type {
  animation: lcars-filter-critical 1s ease-in-out infinite;
}

@keyframes lcars-filter-critical {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1.0; }
}
```

JS renders 10 segments. For `filter_life` of N%: light up `Math.round(N / 10)` segments (left to right), set `data-level`: `"ok"` (≥30%), `"warn"` (10–29%), `"critical"` (<10%). Only the last lit segment pulses at critical.

#### Sparkline Scan Animation
`stroke-dashoffset` draw-on animation for trend sparklines — each line draws itself left to right on first render as if being plotted by a live sensor. (Source: System 47 — scrolling readouts use deliberate pacing.)

```css
.lcars-sparkline path {
  fill: none;
  stroke: var(--sparkline-color, var(--lcars-ice));
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: var(--path-length, 200);
  stroke-dashoffset: var(--path-length, 200);
  animation: lcars-sparkline-draw 1.5s ease-out forwards;
  animation-delay: calc(var(--sparkline-index, 0) * 200ms);
}

@keyframes lcars-sparkline-draw {
  to { stroke-dashoffset: 0; }
}

/* ── Per-sparkline colors (within approved palette) ── */
.lcars-sparkline[data-metric="pm25"]  { --sparkline-color: var(--lcars-ice); }
.lcars-sparkline[data-metric="aqi"]   { --sparkline-color: var(--lcars-sunflower); }
.lcars-sparkline[data-metric="co2"]   { --sparkline-color: var(--lcars-almond); }
.lcars-sparkline[data-metric="voc"]   { --sparkline-color: var(--lcars-lilac); }

/* ── New data point fade-in (rightmost segment) ── */
.lcars-sparkline .new-point {
  animation: lcars-datapoint-in 500ms ease-out;
}

@keyframes lcars-datapoint-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

JS measures each SVG path's `getTotalLength()` and sets `--path-length` accordingly. `--sparkline-index` (0–3) provides the 200ms stagger.

#### Preset Mode Transition Wipe
Directional fill wipe on preset mode switch — the new selection fills left→right as the old empties. (Source: Bracer Jack — clean shapes; the wipe is a single `width` transition on a pseudo-element.)

```css
.lcars-preset-btn {
  position: relative;
  overflow: hidden;
  padding: 0.25rem 0.75rem;
  border-radius: var(--lcars-btn-radius, 1.5rem);
  background: var(--lcars-gray);
  color: var(--lcars-space-white);
  font-family: var(--lcars-font, 'Antonio', sans-serif);
  text-transform: uppercase;
  font-size: 0.75rem;
  cursor: pointer;
  border: none;
  z-index: 0;
}

.lcars-preset-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--lcars-ice);
  width: 0%;
  transition: width 250ms ease-out;
  z-index: -1;
  border-radius: inherit;
}

.lcars-preset-btn.active::before {
  width: 100%;
}

.lcars-preset-btn.active {
  color: var(--lcars-bg, #000);
}

.lcars-preset-btn:hover {
  filter: brightness(1.2);
}
```

The `::before` pseudo-element wipes from 0% → 100% width on activation. Only `width` is animated so the pill shape's border-radius is preserved. No gradients on the button per strict LCARS rules.

#### Atmoscrubber Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient: disable particles, AQI pulse, sparkline draw */
  .lcars-atmos-particle {
    animation: none;
    opacity: var(--particle-opacity, 0.4);
  }
  :host([aqi-level="unhealthy"]) .lcars-atmos-cylinder {
    animation: none;
  }
  .lcars-filter-bar[data-level="critical"] .segment.lit:last-of-type {
    animation: none;
    opacity: 1;
  }
  .lcars-sparkline path {
    animation: none;
    stroke-dashoffset: 0; /* show fully drawn */
  }

  /* State transitions: instant */
  .lcars-atmos-cylinder {
    transition-duration: 0ms;
  }
  .lcars-preset-btn::before {
    transition-duration: 0ms;
  }
  .lcars-filter-bar .segment {
    transition-duration: 0ms;
  }

  /* Confirmations: halved */
  .lcars-sparkline .new-point {
    animation-duration: 250ms;
  }
}
```

### Particle Animation

Particles are small circles that drift upward through the cylinder, simulating air flow through the scrubber. Their speed is tied to fan speed.

```css
/* Particle container — absolute positioned inside the cylinder */
.atmos-particles {
  position: absolute;
  inset: 1rem 0.5rem;  /* inset from rounded caps */
  overflow: hidden;
  pointer-events: none;
}

/* Individual particle */
.atmos-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--atmos-quality-color, var(--lcars-ice));
  opacity: 0;
  animation: atmos-particle-rise var(--atmos-particle-speed, 4s) ease-in-out infinite;
  /* Each particle gets a random animation-delay and horizontal offset via JS */
}

/* Small particle variant */
.atmos-particle.sm {
  width: 3px;
  height: 3px;
  opacity: 0;
}

/* Large particle variant */
.atmos-particle.lg {
  width: 6px;
  height: 6px;
  opacity: 0;
}

@keyframes atmos-particle-rise {
  0% {
    transform: translateY(100%) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100%) translateX(var(--atmos-particle-drift, 0.5rem));
    opacity: 0;
  }
}
```

### Particle Speed ↔ Fan Speed

```javascript
/**
 * Map fan speed percentage to particle animation duration.
 * Faster fan = faster particles (shorter duration).
 * Idle/off = slow ambient drift.
 */
function getParticleSpeed(fanSpeedPercent) {
  if (fanSpeedPercent == null || fanSpeedPercent <= 0) {
    return '6s';    /* Idle drift — slow, ambient */
  }
  // Linear interpolation: 100% speed → 1.5s, 1% speed → 5.5s
  const duration = 5.5 - (fanSpeedPercent / 100) * 4;
  return `${Math.max(1.5, duration).toFixed(1)}s`;
}
```

### Particle Count

- **8 particles** in the cylinder at any time (staggered via `animation-delay`)
- Mix of `.sm` (3), default (3), `.lg` (2) sizes
- Each particle gets a random `left` offset (10%–90%) and `animation-delay` (0s–variable based on speed) set via inline style in JS
- Each particle gets a random `--atmos-particle-drift` custom property between `-0.5rem` and `0.5rem` for horizontal wander

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .atmos-particle {
    animation: none !important;
    opacity: 0.3;  /* Static, visible but not moving */
  }
  .atmos-fill {
    transition: none !important;
  }
}
```

### Hazardous Pulse (AQI > 300)

```css
.atmos-cylinder.hazardous {
  animation: atmos-hazard-pulse 1s ease-in-out infinite;
}

@keyframes atmos-hazard-pulse {
  0%, 100% { border-color: var(--lcars-alert); }
  50%      { border-color: rgba(255, 85, 85, 0.4); }
}

@media (prefers-reduced-motion: reduce) {
  .atmos-cylinder.hazardous {
    animation: none !important;
    border-color: var(--lcars-alert);
    border-width: 3px;  /* Static thicker border as reduced-motion alternative */
  }
}
```

---
