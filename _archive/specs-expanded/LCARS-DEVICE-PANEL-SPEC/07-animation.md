## 7. Animation

### Viewscreen Activation (Existing)

Reuse the existing `viewscreen-activate` keyframes from `lcars-homepage-card.js`:
```css
@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```
Duration: 600ms. This is the classic "screen turning on" effect — horizontal scan lines expanding outward.

### Sensor State Change Flash

When a binary sensor changes state (e.g., motion detected → clear), the value text briefly flashes brighter:

```css
@keyframes sensor-state-flash {
  0%   { filter: brightness(1.8); }
  100% { filter: brightness(1); }
}

.device-sensor-line[data-changed] .sensor-state-value {
  animation: sensor-state-flash 400ms ease-out;
}
```

Apply `data-changed` attribute briefly via JS on `updated()` lifecycle when the state value changes. Remove after animation completes.

### Panel Cascade Entry

Reuse the existing `lcars-cascade-in` animation from the homepage card:
```css
.lcars-device-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-device-panel,
  .device-panel-media img,
  .device-sensor-line[data-changed] .sensor-state-value {
    animation: none !important;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3 and our existing pattern in `lcars-styles.js`.

### v4.13.0 Visual Enhancements (Device Panel Base)

These enhancements apply to `LcarsDevicePanelBase` and cascade to all concrete panel types (camera, climate, media, alarm, etc.) unless explicitly overridden.

**Design Review**: Geordi La Forge — all five proposals verified against Bracer Jack core rules (flat/vector, no gradients, no 3D), Okuda screen reference (Ex Astris Scientia), and System 47 animation tempo. No violations found.

#### 7.6 Frame Breathing Pulse

A barely-perceptible opacity cycle on the panel border — the console is powered and drawing from the EPS grid. On TNG, active LCARS consoles have a subtle luminance variation from their plasma-phosphor backlight substrates. A static border reads as "powered off."

```css
@keyframes lcars-frame-breathe {
  0%, 100% { opacity: 0.88; }
  50%      { opacity: 1; }
}

.lcars-device-panel {
  animation: lcars-frame-breathe 4s ease-in-out infinite;
}
```

- **Trigger**: Always-on ambient. Active whenever the panel is visible.
- **Performance**: Animates `opacity` only — GPU-composited, no layout/paint.

#### 7.7 Data Pip Footer Strip

A 4px decorative strip of micro-segmented squares along the panel's bottom edge — alternating frame colour and transparent gaps. Canonical Okuda edge decoration implying data-bus activity.

```css
.lcars-device-panel {
  position: relative;
}

.lcars-device-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: repeating-linear-gradient(
    to right,
    var(--panel-frame-color, var(--lcars-butterscotch)) 0 4px,
    transparent 4px 8px
  );
  border-radius: 0 0 0.75rem 0.75rem;
  pointer-events: none;
}
```

**Optional sweep pip** (data flow indicator):

```css
@keyframes lcars-pip-sweep {
  0%   { left: -4px; }
  100% { left: 100%; }
}

.lcars-device-panel::before {
  content: '';
  position: absolute;
  bottom: 0;
  width: 4px;
  height: 4px;
  background: var(--lcars-space-white);
  z-index: 1;
  animation: lcars-pip-sweep 8s linear infinite;
  pointer-events: none;
}
```

#### 7.8 Header Numeric Code Watermark

A faint decorative 6-8 digit alphanumeric code (e.g., `047-31842`) right-aligned in the panel header at 40% opacity. Deterministic per entity ID.

> **[Worf M3]** Do NOT use CSS `content: attr(data-panel-code)` on a pseudo-element —
> screen readers announce CSS-generated `content:` text. Use a real `<span>` with
> `aria-hidden="true"` instead. Visual appearance is identical.

```css
.lcars-panel-header .panel-code-watermark {
  position: absolute;
  right: var(--lcars-gap);
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Antonio', sans-serif;
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--lcars-gray);
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
}
```

**DOM** (Lit `render()` — inside `.lcars-panel-header`):
```javascript
html`<span class="panel-code-watermark" aria-hidden="true">
  ${this._generatePanelCode(entityId)}
</span>`
```

**Code generation** (Lit `render()`):

```javascript
_generatePanelCode(entityId) {
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) {
    hash = ((hash << 5) - hash + entityId.charCodeAt(i)) | 0;
  }
  // [Data L-4] Use % 1000000 for consistent 6-digit output with 3-3 split
  const num = Math.abs(hash) % 1000000;
  const raw = String(num).padStart(6, '0');
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}
```

#### 7.9 Button Press Ripple Flash

Bright flat expanding disc radiates outward from centre on pill button press.

```css
.lcars-button {
  position: relative;
  overflow: hidden;
}

@keyframes lcars-button-flash {
  0%   { transform: scale(0); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

.lcars-button:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--lcars-gold);
  transform-origin: center;
  transform: translate(-50%, -50%) scale(0);
  animation: lcars-button-flash 250ms ease-out forwards;
  pointer-events: none;
}
```

#### 7.10 Viewscreen Power-On Scanline

Single bright horizontal line sweeps top→bottom on first render — display "coming online."

```css
@keyframes lcars-scanline {
  0%   { transform: translateY(-100%); opacity: 0.6; }
  80%  { opacity: 0.6; }
  100% { transform: translateY(calc(100% + 2px)); opacity: 0; }
}

.lcars-media-viewscreen.scanning::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--lcars-space-white);
  z-index: 2;
  animation: lcars-scanline 600ms ease-in forwards;
  pointer-events: none;
}
```

#### Reduced Motion — v4.13.0 Additions

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-device-panel { animation: none !important; }
  .lcars-device-panel::before { animation: none !important; }
  .lcars-button:active::after { animation: none !important; }
  .lcars-media-viewscreen.scanning::before { animation: none !important; }
}
```

---
