## 8. Animation Specifications

### 8.1 Critical Draw Frame Pulse

When any circuit in the panel exceeds 3000W (or total exceeds configurable threshold):

```css
.lcars-power-panel[data-alert="critical"] {
  --panel-frame-color: var(--lcars-tomato);
  animation: lcars-distress-pulse var(--lcars-anim-pulse-urgent) ease-in-out infinite;
  --pulse-color-a: var(--lcars-tomato);
  --pulse-color-b: rgba(255, 85, 85, 0.3);
}
```

Reuses `lcars-distress-pulse` from `lcars-shared-animations.js`. Gated behind `prefers-reduced-motion`.

### 8.2 Value Update Flash

When a power reading changes:

```css
.power-circuit-watts.updated,
.power-summary-value.updated {
  animation: lcars-value-flash var(--lcars-anim-flash) ease-out;
  --flash-return-color: transparent;
}
```

Reuses `lcars-value-flash` from shared animations. Brief gold flash → fade back to transparent.

### 8.3 Tile Stagger Load

On initial render, tiles fade in with stagger delay:

```css
.power-circuit-tile {
  animation: lcars-tile-fadein 200ms ease-out backwards;
  animation-delay: calc(var(--tile-index, 0) * var(--lcars-anim-stagger));
}

@keyframes lcars-tile-fadein {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Maximum stagger: 20 tiles × 50ms = 1s total. All tiles beyond index 20 appear at 1s delay (capped to stay under the 1-second animation budget per Source 2 animation rules).

### 8.4 `prefers-reduced-motion` Budget

Total concurrent animations per panel at any time:

| State | Concurrent Animations | Within Budget (≤6) |
|-------|---------------------|--------------------|
| Normal operation | 0 (all values are static between updates) | ✓ |
| Value update | 1 flash per changed value (300ms, non-looping) | ✓ |
| Initial load | Up to 20 stagger fades (200ms each, non-looping) | ✓ (transient) |
| Critical alert | 1 frame pulse (looping) + 1 indicator pulse | ✓ |
| Worst case | 1 frame pulse + 1 indicator + 1 value flash | ✓ (3 total) |

---
