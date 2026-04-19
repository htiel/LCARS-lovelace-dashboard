## 9. Animation

### v4.13.0 Visual Enhancements

#### Condition-Reactive Ambient Glow
A radial gradient behind the temperature readout, tinted by current weather condition — sunny=gold, cloudy=gray, rain=blue, storm=flickering violet, snow=white. When Data scans a planetary atmosphere, the sensor display tints to match conditions; this viewscreen does the same. (Source: Bracer Jack — simplicity; empty space is beautiful; color carries semantic meaning.)

```css
/* ── Condition color map (set via JS on state change) ── */
:host([condition="sunny"])       { --weather-ambient-color: var(--lcars-gold); }
:host([condition="partlycloudy"]){ --weather-ambient-color: var(--lcars-sunflower); }
:host([condition="cloudy"])      { --weather-ambient-color: var(--lcars-gray); }
:host([condition="rainy"])       { --weather-ambient-color: var(--lcars-ice); }
:host([condition="pouring"])     { --weather-ambient-color: var(--lcars-blue); }
:host([condition="snowy"])       { --weather-ambient-color: var(--lcars-space-white); }
:host([condition="lightning"])   { --weather-ambient-color: var(--lcars-lilac); }
:host([condition="windy"])       { --weather-ambient-color: var(--lcars-bluey); }
:host([condition="fog"])         { --weather-ambient-color: var(--lcars-violet-creme); }

.lcars-weather-viewscreen {
  position: relative;
  overflow: hidden;
}

.lcars-weather-viewscreen::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 45%,
    var(--weather-ambient-color, var(--lcars-gray)) 0%,
    transparent 70%
  );
  opacity: 0.15;
  transition: background 1s ease-out, opacity 1s ease-out;
  pointer-events: none;
  z-index: 0;
}

/* ── Storm flicker — irregular opacity jitter ── */
/* Duration 4s (not 3s) provides 2.0 Hz effective rate — 33% headroom below
   WCAG 2.3.1 general flash threshold of 3 Hz [Worf M2] */
:host([condition="lightning"]) .lcars-weather-viewscreen::before {
  animation: lcars-storm-flicker 4s steps(8, end) infinite;
}

@keyframes lcars-storm-flicker {
  0%   { opacity: 0.12; }
  12%  { opacity: 0.24; }
  25%  { opacity: 0.10; }
  37%  { opacity: 0.22; }
  50%  { opacity: 0.14; }
  62%  { opacity: 0.25; }
  75%  { opacity: 0.11; }
  87%  { opacity: 0.20; }
  100% { opacity: 0.12; }
}
```

Glow `z-index: 0` sits behind temperature text (`z-index: 1`). JS sets the `condition` attribute on the host element from `weather.condition` state. Storm flicker uses `steps()` to avoid smooth interpolation — lightning is abrupt, not sinusoidal.

#### Wind Compass Animated Needle
Smooth CSS-transitioned rotation to new bearing via shortest path. When wind exceeds 20 mph, a ±5° oscillation overlays to convey gusty conditions. Helm vector indicators on TNG smoothly rotate to new headings; the compass is a miniature nav deflector display. (Source: Bracer Jack §Animation — simple and snappy.)

```css
.lcars-wind-compass .needle {
  transition: transform 800ms ease-out;
  transform: rotate(var(--wind-deg, 0deg));
  transform-origin: 50% 50%;
  will-change: transform;
}

/* ── Gusty conditions: JS adds .gusty when speed > 20 mph ── */
.lcars-wind-compass .needle.gusty {
  animation: lcars-gust-oscillate 0.8s ease-in-out infinite alternate;
}

@keyframes lcars-gust-oscillate {
  from { transform: rotate(calc(var(--wind-deg, 0deg) - 5deg)); }
  to   { transform: rotate(calc(var(--wind-deg, 0deg) + 5deg)); }
}
```

JS must normalize `--wind-deg` to avoid >180° jumps (always rotate the short way). When `.gusty` is added, the oscillation keyframes override the transition — gusty wind means continuous movement, not a settled needle.

#### Forecast Strip Temperature Range Bars
Thin vertical gradient bars between high/low temps per forecast day. Height proportional to the day's temp range relative to the 7-day spread. Bars grow from zero on data update with 60ms staggered cascade. Inspired by the `thermostat.png` precipitation bar chart pattern. (Source: TheLCARS.com — flat color, no gradients on interactive elements; data bars are decorative telemetry.)

```css
.lcars-forecast-day .temp-range-bar {
  width: 3px;
  height: var(--range-height, 0px); /* set by JS: maps temp range to 8–40px */
  margin: 0.125rem auto;
  border-radius: 1.5px;
  background: linear-gradient(
    to top,
    var(--lcars-ice) 0%,
    var(--lcars-sunflower) 50%,
    var(--lcars-butterscotch) 100%
  );
  transform: scaleY(0);
  transform-origin: bottom center;
  animation: lcars-bar-grow 400ms ease-out forwards;
  animation-delay: calc(var(--day-index, 0) * 60ms);
}

@keyframes lcars-bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
```

The gradient is acceptable here — this is a data visualization element, not a button or interactive control. JS sets `--range-height` per day and `--day-index` (0–6) for stagger.

#### Sun Arc Day Progress
Semicircular SVG arc from sunrise to sunset with a bright dot tracking current sun position. The dot carries a gold drop-shadow glow — a miniature astrometrics orbital tracker. Before sunrise and after sunset, the arc dims and the dot hides. (Source: Ex Astris Scientia — orbital arc displays are consistent across all TNG-era LCARS.)

```css
.lcars-sun-arc {
  width: 100%;
  height: 2rem;
  margin: var(--lcars-gap, 0.25rem) 0;
}

.lcars-sun-arc .arc-track {
  fill: none;
  stroke: var(--lcars-gray);
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.3;
}

.lcars-sun-arc .arc-progress {
  fill: none;
  stroke: var(--lcars-sunflower);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: var(--arc-length, 100);
  stroke-dashoffset: var(--arc-remaining, 100);
  transition: stroke-dashoffset 60s linear;
}

.lcars-sun-arc .sun-dot {
  r: 3;
  fill: var(--lcars-gold);
  filter: drop-shadow(0 0 3px var(--lcars-gold));
  transition: cx 60s linear, cy 60s linear;
}

/* ── Night mode: before sunrise / after sunset ── */
.lcars-sun-arc.night .arc-track  { opacity: 0.15; }
.lcars-sun-arc.night .arc-progress { opacity: 0; }
.lcars-sun-arc.night .sun-dot    { opacity: 0; }
```

SVG structure: `<path class="arc-track">` (full semi), `<path class="arc-progress">` (filled portion), `<circle class="sun-dot">`. JS updates `--arc-remaining` and dot `cx`/`cy` every 60 seconds.

#### Precipitation Probability Pips
10 tiny pips per forecast day (5×2 grid) representing precipitation probability. Filled pips use `--lcars-ice`, empty pips use dim `--lcars-gray`. LCARS tactical displays show shield strength as lit/unlit segments — probability as spatial blocks is native LCARS vocabulary. (Source: Bracer Jack — discrete segments, not percentages.)

```css
.lcars-forecast-day .precip-pips {
  display: grid;
  grid-template-columns: repeat(5, 4px);
  grid-template-rows: repeat(2, 4px);
  gap: 1px;
  justify-content: center;
  margin-top: 0.125rem;
}

.lcars-forecast-day .precip-pip {
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: var(--lcars-gray);
  opacity: 0.3;
  transition: opacity 200ms ease-out, background-color 200ms ease-out;
}

.lcars-forecast-day .precip-pip.filled {
  background: var(--lcars-ice);
  opacity: 1;
  animation: lcars-pip-light 200ms ease-out both;
  animation-delay: calc(var(--pip-index, 0) * 30ms);
}

@keyframes lcars-pip-light {
  from { opacity: 0.3; }
  to   { opacity: 1.0; }
}
```

JS renders 10 pip elements per day, applies `.filled` to the first N where N = `Math.round(precip_probability / 10)`. Each pip is 4×4px with 1px gap — total footprint is 24×9px. Meets WCAG 2.5.8: pips are decorative (the numeric `%` value remains as accessible text).

#### Weather Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Ambient: disable storm flicker, gust oscillation */
  :host([condition="lightning"]) .lcars-weather-viewscreen::before {
    animation: none;
    opacity: 0.18; /* static mid-value */
  }
  .lcars-wind-compass .needle.gusty {
    animation: none;
  }

  /* State transitions: instant */
  .lcars-weather-viewscreen::before {
    transition-duration: 0ms;
  }
  .lcars-wind-compass .needle {
    transition-duration: 0ms;
  }
  .lcars-sun-arc .arc-progress,
  .lcars-sun-arc .sun-dot {
    transition-duration: 0ms;
  }

  /* Confirmations: halved duration, still plays */
  .lcars-forecast-day .temp-range-bar {
    animation-duration: 200ms;
  }
  .lcars-forecast-day .precip-pip.filled {
    animation-duration: 100ms;
    animation-delay: 0ms; /* no stagger */
  }
}
```

### Viewscreen Activation

Reuse the existing `viewscreen-activate` keyframes from the Device Panel Spec §7:

```css
.weather-media {
  animation: viewscreen-activate 600ms ease-out both;
}

@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

### Condition Change Transition

When the weather condition changes (e.g., sunny → cloudy), the frame color, glyph color, and temperature text smoothly transition:

```css
.lcars-weather-panel {
  transition: border-color var(--lcars-transition-slow);
}

.weather-header {
  transition: border-color var(--lcars-transition-slow);
}
```

`--lcars-transition-slow` is 600ms — slow enough to see the atmospheric shift, fast enough not to lag.

### Wind Direction Rotation

When wind bearing changes, the compass arrow smoothly rotates:

```css
.weather-wind-arrow,
.weather-wind-arrowhead {
  transition: transform 0.8s ease-out;
}
```

### Panel Cascade Entry

```css
.lcars-weather-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Forecast Tile Cascade

Forecast tiles enter with a staggered delay — like a sensor scan populating results left-to-right:

```css
.weather-forecast-tile {
  animation: forecast-tile-in 200ms ease-out both;
}

.weather-forecast-tile:nth-child(1) { animation-delay: 50ms; }
.weather-forecast-tile:nth-child(2) { animation-delay: 100ms; }
.weather-forecast-tile:nth-child(3) { animation-delay: 150ms; }
.weather-forecast-tile:nth-child(4) { animation-delay: 200ms; }
.weather-forecast-tile:nth-child(5) { animation-delay: 250ms; }
.weather-forecast-tile:nth-child(6) { animation-delay: 300ms; }
.weather-forecast-tile:nth-child(7) { animation-delay: 350ms; }

@keyframes forecast-tile-in {
  0%   { opacity: 0; transform: translateY(0.5rem); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Reduced Motion (All Animations)

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-weather-panel,
  .weather-media,
  .weather-forecast-tile,
  .lcars-weather-panel.severe,
  .weather-lightning-active .sensor-indicator {
    animation: none !important;
  }
  .lcars-weather-panel,
  .weather-header {
    transition: none !important;
  }
  .weather-wind-arrow,
  .weather-wind-arrowhead {
    transition: none !important;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---
