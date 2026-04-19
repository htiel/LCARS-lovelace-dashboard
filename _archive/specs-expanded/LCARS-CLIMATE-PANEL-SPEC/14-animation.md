## 13. Animation

### v4.13.0 Visual Enhancements

#### Arc Gauge Ring Segments
The SVG temperature arc gains a `stroke-dasharray` pattern to render as discrete lit segments rather than a smooth band — matching the concentric segmented ring indicators visible in `general.png` Main Engineering. On setpoint change, `stroke-dashoffset` animates to the new position and the leading segment flashes gold.

```css
.lcars-climate-arc path.arc-fill {
  stroke-dasharray: 6 2;
  stroke-linecap: butt;
  transition: stroke-dashoffset 800ms ease-in-out;
}

.lcars-climate-arc path.arc-fill.setpoint-changed {
  animation: lcars-arc-flash 400ms ease-out 1;
}

@keyframes lcars-arc-flash {
  0%   { stroke: var(--lcars-gold); filter: brightness(1.4); }
  100% { stroke: var(--lcars-butterscotch); filter: brightness(1); }
}
```

#### HVAC Action Frame Pulse
When HVAC is actively heating or cooling, the panel frame border pulses — warm butterscotch for heating, cool ice for cooling. Static frame = idle.

```css
.lcars-climate-panel[data-hvac-action="heating"] {
  animation: lcars-hvac-pulse 2s ease-in-out infinite;
  --pulse-color: var(--lcars-butterscotch);
}

.lcars-climate-panel[data-hvac-action="cooling"] {
  animation: lcars-hvac-pulse 2s ease-in-out infinite;
  --pulse-color: var(--lcars-ice);
}

@keyframes lcars-hvac-pulse {
  0%, 100% { border-color: var(--pulse-color); }
  50%      { border-color: color-mix(in srgb, var(--pulse-color) 70%, black); }
}
```

> **[Data M-4]** `color-mix(in srgb)` requires Chrome ≥111, Safari ≥16.2,
> Firefox ≥113. If older browser support is needed, provide a fallback
> hardcoded `rgba()` value for each pulse color.

#### Setpoint Button Glow Feedback
Target temperature briefly scales up 5% with gold text-shadow on setpoint change — visual confirmation the ship heard you.

```css
.lcars-target-temp.confirm {
  animation: lcars-setpoint-confirm 400ms ease-out 1;
}

@keyframes lcars-setpoint-confirm {
  0% { transform: scale(1.05); text-shadow: 0 0 8px var(--lcars-gold); }
  100% { transform: scale(1); text-shadow: 0 0 0 transparent; }
}
```

#### Mode Strip Active Indicator
2px gold bar slides between HVAC mode pills on mode change.

```css
.lcars-mode-strip::after {
  content: '';
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--lcars-gold);
  border-radius: 1px;
  transition: transform 300ms ease-out, width 300ms ease-out;
  width: var(--indicator-width, 60px);
  transform: translateX(var(--indicator-x, 0));
}
```

#### Ambient Temperature Data Pips
24 tiny 4px squares forming a 24-hour temperature micro-heatmap below the sensor column.

```css
.lcars-temp-pips {
  display: flex;
  gap: 2px;
  padding-top: var(--lcars-gap, 0.25rem);
}

.lcars-temp-pips .pip {
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: var(--pip-color, var(--lcars-gray));
  transition: opacity 500ms ease-out;
}
```

#### Climate Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .lcars-climate-panel[data-hvac-action="heating"],
  .lcars-climate-panel[data-hvac-action="cooling"] { animation: none; }
  .lcars-target-temp.confirm { animation: none; }
  .lcars-mode-strip::after { transition: none; }
  .lcars-climate-arc path.arc-fill { transition: stroke-dashoffset 0ms; }
  .lcars-climate-arc path.arc-fill.setpoint-changed { animation: none; }
}
```

### Viewscreen Activation

Reuse the existing `viewscreen-activate` keyframes from the Device Panel Spec §7:

```css
.climate-media {
  animation: viewscreen-activate 600ms ease-out both;
}

@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

### Frame Color Transition

When `hvac_action` changes (heating → cooling → idle), the frame color transitions smoothly:

```css
.lcars-climate-panel {
  transition: border-color var(--lcars-transition-slow);
}

.climate-header {
  transition: border-color var(--lcars-transition-slow);
}
```

`--lcars-transition-slow` is 600ms — slow enough to notice the shift, fast enough not to lag.

### Setpoint Value Flash

When the user adjusts a setpoint, the value text briefly flashes brighter:

```css
@keyframes setpoint-flash {
  0%   { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

.climate-setpoint-value[data-changed] {
  animation: setpoint-flash 300ms ease-out;
}
```

### Panel Cascade Entry

```css
.lcars-climate-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-climate-panel,
  .climate-media,
  .climate-arc-progress.heating,
  .climate-arc-progress.cooling,
  .climate-setpoint-value[data-changed],
  .climate-fault-indicator.active {
    animation: none !important;
  }
  .lcars-climate-panel {
    transition: none !important;
  }
}
```

---
