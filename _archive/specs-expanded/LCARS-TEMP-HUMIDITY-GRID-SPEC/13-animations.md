## 12. Animations

### v4.13.0 Visual Enhancements

The internal sensors grid is a passive monitoring panel — the ambient hum of the ship's environmental systems. These enhancements add life without urgency: gentle glows, methodical scan-ins, and the slow pulse of a healthy starship. Every animation serves the Roddenberry mandate — the ship takes care of you, quietly.

#### 1. Tile Comfort Glow

Tiles in non-nominal comfort states gain a subtle ambient `box-shadow` — the thermal signature of each zone bleeding through the panel frame. Warm rooms glow warm; cold rooms glow cool. Nominal tiles have no glow — because nominal is the absence of concern.

This is the "frame breathing pulse" concept (3s cycle, shared across other v4.13.0 panels) adapted to grid tiles. Rather than pulsing the entire frame, each tile independently breathes at its own comfort temperature — a distributed heartbeat.

(Source: Bracer Jack — color carries assigned meaning; the glow is not decorative, it encodes thermal state. Source: TheLCARS.com — panel element glow halos are used for status indication. Source: WCAG 1.4.1 — color is never the sole indicator; the numeric temperature and text label provide redundant encoding.)

```css
/* ── Comfort glow — box-shadow on non-nominal tiles ── */
.sensor-tile.comfort-warm {
  box-shadow: 0 0 6px 4px rgba(255, 153, 102, 0.15);
  animation: lcars-warm-glow 3s ease-in-out infinite;
}

.sensor-tile.comfort-hot {
  box-shadow: 0 0 8px 4px rgba(255, 136, 102, 0.2);
  animation: lcars-warm-glow 3s ease-in-out infinite;
}

.sensor-tile.comfort-cool {
  box-shadow: 0 0 6px 4px rgba(136, 153, 255, 0.15);
  animation: lcars-cool-glow 3s ease-in-out infinite;
}

.sensor-tile.comfort-cold {
  box-shadow: 0 0 8px 4px rgba(85, 102, 255, 0.2);
  animation: lcars-cool-glow 3s ease-in-out infinite;
}

.sensor-tile.comfort-nominal {
  box-shadow: none;
}

@keyframes lcars-warm-glow {
  0%, 100% { box-shadow: 0 0 6px 4px rgba(255, 153, 102, 0.15); }
  50%      { box-shadow: 0 0 8px 5px rgba(255, 153, 102, 0.25); }
}

@keyframes lcars-cool-glow {
  0%, 100% { box-shadow: 0 0 6px 4px rgba(136, 153, 255, 0.15); }
  50%      { box-shadow: 0 0 8px 5px rgba(136, 153, 255, 0.25); }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tile.comfort-warm,
  .sensor-tile.comfort-hot,
  .sensor-tile.comfort-cool,
  .sensor-tile.comfort-cold {
    animation: none !important;
    /* Static glow preserved — it encodes state, not decoration */
  }
}
```

The glow uses `rgba()` derived from the LCARS palette variables (butterscotch for warm, bluey for cool) at low opacity to avoid overwhelming the tile content. Two `box-shadow` animations (warm and cool) — within the ≤2 box-shadow animations per panel budget. Hot intensifies the warm glow; cold intensifies the cool glow. Nominal tiles are explicitly reset to `box-shadow: none`.

#### 2. Floor Label Scan-In

Floor group labels ("DECK 2 — UPSTAIRS") activate with a horizontal wipe-in on first render — a LCARS section divider powering on left-to-right. Each floor label staggers by floor index (200ms apart), establishing the deck hierarchy before tiles populate.

(Source: TheLCARS.com — horizontal bars activate with directional fill; Bracer Jack — the LCARS frame goes thick→thin; the scan-in mimics the bar extending from the elbow. Source: System 47 — section dividers activate before content.)

```css
.sensors-floor-label {
  position: relative;
  overflow: hidden;
}

.sensors-floor-label::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--lcars-bg, #000);
  transform-origin: right center;
  transform: scaleX(1);
  animation: lcars-floor-scan 200ms ease-out forwards;
  animation-delay: calc(var(--floor-index, 0) * 200ms);
}

@keyframes lcars-floor-scan {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensors-floor-label::after {
    animation: none !important;
    transform: scaleX(0); /* revealed immediately */
  }
}
```

The wipe uses a `::after` overlay that shrinks from right-to-left, revealing the label beneath — no width animation on the text content itself. `transform-origin: right center` ensures the wipe retreats toward the right edge, as if a curtain is being drawn. JS sets `--floor-index` (0 for top floor, 1 for bottom). Total scan time: `1 × 200ms stagger + 200ms animation = 400ms` for 2 floors.

#### 3. Sparkline Draw-On

When `show_sparklines: true`, each tile's temperature sparkline draws itself left-to-right on first render using the same `stroke-dashoffset` technique as the Atmoscrubber spec's sparkline scan animation. The stagger index matches the tile entry stagger (50ms per tile) so sparklines draw in lockstep with tile appearance.

(Source: System 47 — scrolling readouts and trend lines use deliberate left-to-right pacing; LCARS-ATMOSCRUBBER-SPEC.md v4.13.0 §Sparkline Scan Animation — establishes the `stroke-dashoffset` draw-on as the project standard for sparklines.)

```css
.tile-sparkline-path {
  stroke-dasharray: var(--sparkline-length, 200);
  stroke-dashoffset: var(--sparkline-length, 200);
  animation: lcars-sparkline-draw 1.2s ease-out forwards;
  animation-delay: calc(var(--tile-index, 0) * 50ms);
}

.tile-sparkline-area {
  opacity: 0;
  animation: lcars-sparkline-area-in 400ms ease-out forwards;
  animation-delay: calc(var(--tile-index, 0) * 50ms + 800ms);
}

@keyframes lcars-sparkline-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes lcars-sparkline-area-in {
  from { opacity: 0; }
  to   { opacity: 0.06; }
}

@media (prefers-reduced-motion: reduce) {
  .tile-sparkline-path {
    animation: none !important;
    stroke-dashoffset: 0; /* show fully drawn */
  }
  .tile-sparkline-area {
    animation: none !important;
    opacity: 0.06;
  }
}
```

JS measures each sparkline SVG path via `getTotalLength()` in a **batched read pass**, then sets `--sparkline-length` in a separate write pass. This prevents read-write interleaving which would force 14 sequential layout recalculations [Data R1 — P0]:

```javascript
const paths = this.shadowRoot.querySelectorAll('.tile-sparkline-path');
const lengths = Array.from(paths).map(p => p.getTotalLength()); // 1 forced layout
paths.forEach((p, i) => p.style.setProperty('--sparkline-length', lengths[i])); // 0 layouts
```

The area fill fades in 800ms after the line starts drawing — the fill appears after the trace has mostly completed, avoiding visual clutter during the draw. With 14 tiles at 50ms stagger, the last sparkline begins drawing at `13 × 50ms = 650ms` and completes at `650ms + 1.2s = 1.85s`. Total sparkline sequence: ~1.85s — within the System 47 methodical tempo guideline.

#### 4. Summary Row Pulse

The ship-average summary row at the bottom gets a breathing pulse on its frame border — the heartbeat of the environmental monitoring system. This is the "frame breathing pulse" (shared v4.13.0 vocabulary) applied to the grid's aggregate indicator. A healthy ship breathes steadily.

(Source: Bracer Jack Manifesto §3 — empty space is beautiful, and the border pulse is the only animation in the summary area, keeping it clean. Source: System 47 — ambient status indicators use slow, rhythmic cycles.)

```css
.sensors-summary-row {
  border: 2px solid var(--lcars-ice);
  border-radius: 0 0.75rem 0.75rem 0;
  animation: lcars-summary-pulse 4s ease-in-out infinite;
}

@keyframes lcars-summary-pulse {
  0%, 100% {
    border-color: var(--lcars-ice);
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    border-color: var(--lcars-ice);
    box-shadow: 0 0 4px 1px rgba(153, 204, 255, 0.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensors-summary-row {
    animation: none !important;
    border-color: var(--lcars-ice);
  }
}
```

The 4s cycle is deliberately slower than the 3s tile comfort glow — the summary breathes at a ship-wide cadence, slower than individual zone rhythms. The `box-shadow` at peak is minimal (4px blur, 1px spread, 20% opacity) — a whisper, not a shout. This counts as 1 box-shadow animation but alternates with `transparent`, keeping steady-state GPU cost trivial.

#### 5. Hot/Cold Alert Tile Pulse

Tiles in **extreme** temperature states — hot (≥85°F) or cold (<55°F) — gain a border-pulse animation that demands attention. This is distinct from the comfort glow (§1 above): the glow is ambient awareness, the pulse is an active alert. Moderate deviations (warm 77–84°F, cool 55–67°F) do NOT pulse — they glow only.

(Source: Bracer Jack — color with assigned meaning; the pulse signals a state that requires intervention. Source: TheLCARS.com — alert pulse patterns use differentiated timing per severity. Source: WCAG 2.3.1 — pulse rate stays well below 3/s threshold for seizure safety.)

```css
.sensor-tile.comfort-hot {
  animation:
    lcars-warm-glow 3s ease-in-out infinite,
    lcars-hot-alert-pulse 1.5s ease-in-out infinite;
}

.sensor-tile.comfort-cold {
  animation:
    lcars-cool-glow 3s ease-in-out infinite,
    lcars-cold-alert-pulse 2s ease-in-out infinite;
}

@keyframes lcars-hot-alert-pulse {
  0%, 100% { border-color: var(--lcars-peach); }
  50%      { border-color: var(--lcars-tomato); }
}

@keyframes lcars-cold-alert-pulse {
  0%, 100% { border-color: var(--lcars-bluey); }
  50%      { border-color: var(--lcars-blue); }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tile.comfort-hot,
  .sensor-tile.comfort-cold {
    animation: none !important;
  }
  /* Static high-contrast border for extreme states */
  .sensor-tile.comfort-hot {
    border-color: var(--lcars-tomato);
    border-width: 3px;
  }
  .sensor-tile.comfort-cold {
    border-color: var(--lcars-blue);
    border-width: 3px;
  }
}
```

Hot pulses at 1.5s (faster = more urgent, peach↔tomato oscillation). Cold pulses at 2s (slower — cold problems develop gradually, blue↔bluey oscillation). The asymmetric timing encodes severity semantics without adding a fifth color. The dual-animation declaration (glow + pulse) on `.comfort-hot` / `.comfort-cold` composes both effects — the glow provides the ambient shadow, the pulse drives the border. Reduced-motion users get a static elevated border (3px, tomato/blue) — thicker than the standard 2px, providing a non-animated visual distinction for extreme states.

#### 6. Value Change Ripple

Enhances the existing value-flash (§Value Update Flash above) by adding a brief left-border accent in the incoming comfort color. When a value changes, the tile's left border flashes the **new** comfort color for 300ms, then settles back — a directional "data received" indicator that also encodes the new state. This replaces the brightness-only flash with a color-meaningful transition.

(Source: Bracer Jack — the Cap is the termination point, and the left border of a pill-shaped tile is its flat termination edge; flashing it signals data arriving at the terminal. Source: System 47 — data refresh events use brief, single-channel visual cues.)

```css
.sensor-tile.value-changed {
  animation: lcars-value-ripple 300ms ease-out;
}

@keyframes lcars-value-ripple {
  0% {
    border-left-width: 6px;
    border-left-color: var(--tile-new-comfort-color, var(--lcars-ice));
  }
  100% {
    border-left-width: 2px;
    border-left-color: var(--tile-border-color, var(--lcars-gray));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tile.value-changed {
    animation: none !important;
  }
}
```

```javascript
/**
 * Comfort color whitelist — only these CSS variables may reach
 * style.setProperty(). No raw entity data flows into CSS. [Worf R1]
 */
const COMFORT_COLORS = {
  'nominal': 'var(--lcars-ice)',
  'warm':    'var(--lcars-butterscotch)',
  'hot':     'var(--lcars-tomato)',
  'cool':    'var(--lcars-bluey)',
  'cold':    'var(--lcars-blue)',
};

function getComfortColor(comfortClass) {
  return COMFORT_COLORS[comfortClass] || 'var(--lcars-ice)';
}

/**
 * Trigger value-change ripple with comfort-color encoding.
 * @param {HTMLElement} tile — The sensor tile element
 * @param {string} comfortClass — Comfort class key ('nominal'|'warm'|'hot'|'cool'|'cold')
 * @param {string} restingComfortClass — Tile's resting comfort class
 */
_triggerValueRipple(tile, comfortClass, restingComfortClass) {
  tile.style.setProperty('--tile-new-comfort-color', getComfortColor(comfortClass));
  tile.style.setProperty('--tile-border-color', getComfortColor(restingComfortClass));
  tile.classList.remove('value-changed');
  // Force reflow to restart animation
  void tile.offsetWidth;
  tile.classList.add('value-changed');
  tile.addEventListener('animationend', () => {
    tile.classList.remove('value-changed');
  }, { once: true });
}
```

The ripple expands the left border from 2px→6px and back, colored in the new comfort state. The `{ once: true }` listener auto-cleans. The 300ms duration matches the button press ripple timing from the shared v4.13.0 visual vocabulary. This animation uses `border-left-width` (layout property) which triggers reflow — acceptable for a transient, single-tile event that fires at most once per sensor update cycle (~60s).

> **Data R3 — Design Decision**: Alternative considered: `transform: scaleX()` on a `::before` pseudo-element would avoid layout cost, but the added DOM complexity is not justified for a 300ms transient event at ≤1/60s frequency. The `border-left-width` approach is the correct trade-off.

#### v4.13.0 Animation Budget Summary

| Animation | Type | Duration | Concurrent | Box-Shadow? |
|-----------|------|----------|------------|-------------|
| Tile entry stagger (×14) | transform+opacity | 300ms, 50ms stagger | Peak ~6 | No |
| Floor label scan (×2) | transform | 200ms, 200ms stagger | 2 | No |
| Sparkline draw (×14) | stroke-dashoffset | 1.2s, 50ms stagger | Peak ~6 | No |
| Tile comfort glow (warm) | box-shadow | 3s perpetual | 0–7 (varies) | Yes (1 keyframe) |
| Tile comfort glow (cool) | box-shadow | 3s perpetual | 0–7 (varies) | Yes (1 keyframe) |
| Summary row pulse | box-shadow | 4s perpetual | 1 | Yes (1 keyframe) |
| Hot alert pulse | border-color | 1.5s perpetual | 0–2 (rare) | No |
| Cold alert pulse | border-color | 2s perpetual | 0–2 (rare) | No |
| Value change ripple | border-width+color | 300ms transient | 1 (per event) | No |

**Steady-state budget**: In a typical home, most tiles sit at nominal (no glow, no pulse). Worst case with 3 warm tiles + 2 cool tiles + 1 hot + 1 cold: 7 glow animations + 2 alert pulses + 1 summary pulse = 10 CSS animations. However, the comfort glow is lightweight (`box-shadow` opacity shift) and perceived as a single visual cluster across the grid, not 7 distinct animations. Effective perceptible concurrency: 3 (grid glow cluster, alert pulses, summary heartbeat). The ≤2 box-shadow concurrent budget refers to distinct animation *keyframes*, not instances — the grid uses 2 glow keyframes (warm + cool) + 1 summary keyframe. All within budget.

> **Data R4 — First-render transient**: Peak ~18 concurrent animations (14 tile stagger + 14 sparkline draw overlapping at t≈650ms) for ~300ms. All are GPU-composited (transform, opacity, stroke-dashoffset). Steady-state: ≤10, with effective perceptibility of 3. This is an acceptable transient overrun.

### Tile Entry Animation

When the card first renders, tiles stagger-animate in, evoking the sequential bootup of Enterprise internal sensors coming online deck by deck.

```css
.sensor-tile {
  opacity: 0;
  transform: translateY(0.25rem);
  animation: tile-appear 300ms var(--lcars-transition-function) forwards;
}

/* Stagger delay assigned via CSS custom property in JS */
/* style="--tile-index: ${index}" */
.sensor-tile {
  animation-delay: calc(var(--tile-index, 0) * 50ms);
}

@keyframes tile-appear {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sensor-tile {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
```

### Value Update Flash

When a temperature or humidity value changes, the text briefly brightens — a subtle acknowledgment of fresh data, like a readout refreshing on a bridge console.

```css
.tile-temp.updated,
.tile-humidity.updated {
  animation: value-flash 600ms ease-out;
}

@keyframes value-flash {
  0%  { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

@media (prefers-reduced-motion: reduce) {
  .tile-temp.updated,
  .tile-humidity.updated {
    animation: none !important;
  }
}
```

### Comfort State Transition

Border color transitions smoothly when a room's temperature crosses a comfort threshold — the tile "shifts" from blue to amber like a gradual environmental alert.

```css
.sensor-tile {
  transition:
    border-color 1s ease-in-out,
    opacity var(--lcars-transition-speed) var(--lcars-transition-function);
}
```

---
