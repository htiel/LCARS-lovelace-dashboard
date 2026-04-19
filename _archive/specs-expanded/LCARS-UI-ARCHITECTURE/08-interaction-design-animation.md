## 7. Interaction Design & Animation

### Core Timing Constants

```css
:host {
  --lcars-transition-speed:    200ms;
  --lcars-transition-function: ease-out;
  --lcars-fade-speed:          300ms;
}

@media (prefers-reduced-motion: reduce) {
  :host {
    --lcars-transition-speed:    0ms;
    --lcars-fade-speed:          0ms;
  }
}
```

**Rule**: All animations ≤ 1 second. Most are 200–300ms. LCARS conveys advanced technology through **understated confidence**, not flashy motion.

### v4.13.0 Visual Vocabulary

The following shared animation motifs are introduced in v4.13.0. Each panel spec references these by name. All respect `prefers-reduced-motion: reduce`.

| Motif | Description | Duration | Panels Using |
|---|---|---|---|
| **Frame Breathing Pulse** | Border color oscillates between full and 70% brightness | 3s ease-in-out infinite | Device, Climate (HVAC action), Pool/Spa (heating) |
| **Data Pip Footer** | Row of 4px squares as micro-heatmap or status indicator | Static (transition 500ms) | Device, Climate (24h temp), Alarm (zone status) |
| **Header Numeric Code** | 6-digit pseudo-random code from entity_id hash | Static | Device (shared) |
| **Button Press Ripple** | Circular opacity wave from press point, 300ms | 300ms ease-out, single fire | Device (shared) |
| **Viewscreen Power-On Scanline** | Horizontal bright line sweeps top→bottom on first render | 600ms ease-out, single fire | Device, Climate, Media, Weather |
| **Setpoint Confirm Flash** | Scale 1.05× + gold text-shadow on value change | 400ms ease-out, single fire | Climate (target temp) |
| **Travelling Indicator Bar** | 2px gold bar slides between active items | 300ms ease-out transition | Climate (mode strip), Pool/Spa (IntelliBrite) |
| **Audio Waveform** | 32 vertical bars oscillating at random heights | 400ms alternate infinite | Media (playing state) |
| **Viewscreen Glow** | Pulsing box-shadow spread on active viewscreen | 3s ease-in-out infinite | Media (playing), Atmoscrubber (AQI) |
| **Progress Luminous Head** | 4px gold pip with glow at playback position | 2s ease-in-out infinite | Media (progress bar) |
| **Red Alert Strobe** | Frame + ambient glow rapid pulse | 1s linear infinite | Alarm (triggered) |
| **Shield Reactive Glow** | SVG drop-shadow by security state | 0.5–3s, state-dependent | Alarm |
| **Countdown Urgency** | 4-tier color + pulse escalation | 0.5–2s by tier | Alarm |
| **Condition Ambient Glow** | Radial gradient tinted by weather condition | 1s transition (storm: 3s flicker) | Weather |
| **Wind Compass Needle** | Smooth rotation + gust oscillation on high wind | 800ms transition + 0.8s oscillation | Weather |
| **Forecast Range Bars** | Gradient bars growing with 60ms stagger | 400ms ease-out, single fire | Weather |
| **Sun Arc Tracker** | SVG semicircle with gold dot tracking sun position | 60s linear transition | Weather |
| **Precip Probability Pips** | 10-pip 5×2 grid, lit count = probability/10 | 200ms + 30ms stagger | Weather |
| **Water Caustic Shimmer** | 3 radial gradients drifting at 6% opacity | 12s linear infinite | Pool/Spa |
| **EPS Heat Flow** | Warm gradient bar scrolling left→right | 2s linear infinite | Pool/Spa (heating) |
| **Chemistry Threshold Badges** | Pill badges color-coded by ok/warn/critical | 500ms transition + 1.5s pulse | Pool/Spa |
| **Pump Spinner** | 3 dots rotating when pump ON | 1.2s linear infinite | Pool/Spa |
| **Barberpole Flow** | Diagonal stripes scrolling through fill bar | 0.6s linear infinite | Irrigation (active zone) |
| **Zone Completion Flash** | Row flashes ice-to-dark on cycle end | 2s ease-out, single fire | Irrigation |
| **Schedule Proximity Glow** | Text-shadow intensifies as scheduled run nears | 10s transition (continuous) | Irrigation |
| **Rain Delay Badge** | ☁ pill with 1px bob | 3s ease-in-out infinite | Irrigation |
| **Enhanced Particle Drift** | Varied size/opacity/speed + horizontal drift | 3–6s per particle | Atmoscrubber |
| **AQI Cylinder Glow** | Inset box-shadow by AQI level, unhealthy pulse | 2s pulse (unhealthy only) | Atmoscrubber |
| **Filter Life Segments** | 10-segment discrete bar with threshold colors | 300ms transition + 1s pulse | Atmoscrubber |
| **Sparkline Draw-On** | stroke-dashoffset reveals line left→right | 1.5s + 200ms stagger | Atmoscrubber |
| **Preset Mode Wipe** | ::before width transition on button activation | 250ms ease-out | Atmoscrubber |
| **Sensor Row Stagger** | Cascade-appear for extended sensor columns | 250ms + 80ms stagger | Air Purifier (BlueAir) |
| **CO₂ Threshold Colors** | 3-tier color mapping: ice/sunflower/tomato by ppm | Instant (transition inherited) | Air Purifier (BlueAir) |
| **Filter Expired Flash** | Single-fire tomato box-shadow on filter expiry | 600ms ease-out, single fire | Air Purifier (BlueAir) |
| **Tile Comfort Glow** | Ambient box-shadow by thermal state (warm/cool) | 3s ease-in-out infinite | Temp/Humidity Grid |
| **Floor Label Scan-In** | Horizontal wipe-in on floor group labels | 200ms + 200ms stagger | Temp/Humidity Grid |
| **Tile Sparkline Draw** | stroke-dashoffset draw-on per tile sparkline | 1.2s + 50ms stagger | Temp/Humidity Grid |
| **Summary Row Pulse** | Ship-average border breathing pulse | 4s ease-in-out infinite | Temp/Humidity Grid |
| **Hot/Cold Alert Pulse** | Border pulse on extreme temp tiles only | 1.5s (hot) / 2s (cold) | Temp/Humidity Grid |
| **Value Change Ripple** | Left-border width+color flash on data update | 300ms ease-out, single fire | Temp/Humidity Grid |

#### Performance Budget (per panel)
- ≤ 6 concurrent CSS animations (perceptible; GPU-composited transients during first-render stagger are exempt)
- ≤ 2 `box-shadow` keyframe definitions per panel; instances limited by visual perceptibility (clustered identical animations count as 1 perceptual unit)
- All looping animations gated behind `prefers-reduced-motion`
- Prefer `transform` and `opacity` for GPU-composited animations
- No gradients on interactive controls (buttons, toggles)

### 7.1 View Navigation Transition

When the user taps a sidebar nav button to switch views (Home → Devices → More):

```
1. Current content fades out      (opacity 1→0, 150ms ease-out)
2. New content fades in           (opacity 0→1, 200ms ease-in)
3. Header bar title updates       (instant text swap during fade gap)
4. Active sidebar button changes  (background → gold, 100ms)
```

```css
/* Content area transition */
.lcars-content--exiting {
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.lcars-content--entering {
  opacity: 0;
  animation: lcars-fade-in 200ms ease-in forwards;
}

@keyframes lcars-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### 7.2 Area Selection (Expand/Contract)

When an area button is tapped in the homepage:

```
1. Button pulses gold briefly       (background → gold, 100ms)
2. Area detail panel slides in      (transform: translateX, 250ms ease-out)
   — OR —
   View navigates to area subview   (uses view navigation transition above)
3. Button returns to normal color   (200ms)
```

```css
/* Area expand animation */
.lcars-area-detail--entering {
  animation: lcars-slide-in-right 250ms ease-out forwards;
}

.lcars-area-detail--exiting {
  animation: lcars-slide-out-right 200ms ease-in forwards;
}

@keyframes lcars-slide-in-right {
  from { transform: translateX(2rem); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes lcars-slide-out-right {
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(2rem); opacity: 0; }
}
```

### 7.3 Button Press Feedback

```
1. On pointerdown: background → gold (instant, no transition)
2. On pointerup:   background → original (200ms ease-out)
```

This mimics the TNG console — buttons flash immediately on press.

### 7.4 Popup Open/Close

```
1. Overlay fades in                  (opacity 0→0.85, 200ms)
2. Popup frame scales from center    (scale 0.95→1, opacity 0→1, 200ms)
3. On close: reverse                 (200ms)
```

```css
.lcars-popup-overlay--entering {
  animation: lcars-overlay-in 200ms ease-out forwards;
}

@keyframes lcars-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lcars-popup--entering {
  animation: lcars-popup-scale-in 200ms ease-out forwards;
}

@keyframes lcars-popup-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
```

### 7.5 Scrolling Number Decoration (Status Panels)

For decorative data readouts (non-functional — purely aesthetic LCARS chrome):

```javascript
// Generate random scrolling numbers — code-generated, NOT keyframed
// Per System 47 reference: fixed-width monospace numerals
// Tempo: deliberately slow (update every 100-200ms)

function generateLCARSReadout(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Update at 150ms interval — methodical, not frantic
setInterval(() => {
  readoutEl.textContent = generateLCARSReadout();
}, 150);
```

```css
.lcars-readout {
  font-family: 'Courier New', monospace;  /* Exception: monospace for number readouts only */
  font-size: var(--lcars-font-body);
  color: var(--lcars-text-heading);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
```

---
