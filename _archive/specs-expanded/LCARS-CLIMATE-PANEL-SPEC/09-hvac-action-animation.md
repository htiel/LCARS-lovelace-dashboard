## 8. HVAC Action Animation

The current HVAC action is communicated through subtle ambient animation on the temperature arc. This provides an additional visual channel beyond color.

### Heating Pulse

When `hvac_action` is `heating`, the arc progress stroke gently pulses brighter — like the warmth of a furnace cycling.

```css
.climate-arc-progress.heating {
  animation: climate-heating-pulse 2s ease-in-out infinite;
}

@keyframes climate-heating-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.7; }
}
```

### Cooling Pulse

When `hvac_action` is `cooling`, the arc progress gently cycles opacity in the opposite rhythm — cooler, more mechanical.

```css
.climate-arc-progress.cooling {
  animation: climate-cooling-pulse 3s ease-in-out infinite;
}

@keyframes climate-cooling-pulse {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 1; }
}
```

### Idle — No Animation

When idle, the arc is static with full opacity. Stillness communicates "at rest."

### Off — Dimmed

```css
.climate-arc-progress.off {
  opacity: 0.25;
}

.climate-arc-bg.off {
  opacity: 0.15;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .climate-arc-progress.heating,
  .climate-arc-progress.cooling {
    animation: none !important;
    opacity: 1;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3.

---
