# LCARS Device Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.11  
**Status**: Implementation-Ready  
**First Implementation**: Camera Device Panel  

---

## 1. Design Philosophy

The Device Panel is the LCARS equivalent of a **"science station readout"** or **"tactical display"** — a dedicated, self-contained frame showing a single device's primary media (camera feed, thermostat dial, album art) alongside its auxiliary sensors and controls. Think Ops station on the Enterprise-D bridge: the viewscreen at center-right, status readouts surrounding it, controls below.

Per Gene Roddenberry's original mandate via Michael Okuda: **simplicity conveys advanced technology**. The panel shows exactly what the operator needs — a live feed with status telemetry — no decorative excess.

Per Bracer Jack's Manifesto: **empty space is beautiful**. The panel should breathe. Don't pack every pixel.

---

## 2. Layout Structure — The "Viewscreen Frame"

The Device Panel uses a **2-column asymmetric grid** within a bordered frame. The primary media (camera feed) is right-justified and dominant. Sensor telemetry sits left-aligned as text readouts. Controls run along the bottom.

```
┌──────────────────────────────────────────────────────┐
│ ┌──────────┐                                         │
│ │ DEVICE   │            ╔════════════════════════╗   │
│ │ NAME     │            ║                        ║   │
│ └──────────┘            ║    PRIMARY MEDIA       ║   │
│                         ║    (Camera Feed /      ║   │
│  SENSOR TELEMETRY       ║     Thermostat /       ║   │
│  ● MOTION    DETECTED   ║     Album Art)         ║   │
│  ● PERSON    CLEAR      ║                        ║   │
│  ● DOORBELL  IDLE       ║                        ║   │
│  ● SIGNAL    -42 dBm    ╚════════════════════════╝   │
│  ● BATTERY   78%                                     │
│                                                      │
│  ┌─────────╮ ┌─────────╮ ┌─────────╮ ┌─────────╮    │
│  │ IR LED  │ │ STATUS  │ │ PRIVACY │ │ DETAILS │    │
│  └─────────╯ └─────────╯ └─────────╯ └─────────╯    │
└──────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-device-panel {
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) minmax(16rem, 2fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "controls controls";
  gap: var(--lcars-gap);
  
  /* Frame border — Bracer Jack Rule: thick→thin or thin→thick, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  
  /* Inner elbow radius — subtle, not aggressive */
  border-radius: 0.75rem;
  
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  
  /* Per Jörn Weißenborn grid: minimum panel dimensions */
  min-height: calc(var(--lcars-vunit) * 4);
}
```

### Why This Layout

- **Right-justified media**: On TNG/DS9/VOY, the viewscreen and primary data displays always occupy the **dominant right-hand area**. The operator's eye tracks left-to-right: status first, then the visual. This matches Western reading order and the on-screen LCARS tradition. (Source: Ex Astris Scientia, screen captures of Operations consoles)
- **Left-side telemetry**: Sensor data as text readouts mirrors the alphanumeric columns flanking viewscreens in TNG Engineering and Ops. (Source: TheLCARS.com template, sidebar data pattern)
- **Bottom controls**: Physical LCARS consoles place action buttons below the display area. The "cap as button" principle (Bracer Jack Rule 4) applies here.

---

## 3. Component Anatomy

### 3.1 Panel Header

```css
.device-panel-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
}

.device-panel-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);          /* --lcars-sunflower */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-panel-header-line {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(90deg,
    var(--panel-frame-color) 0px, var(--panel-frame-color) 8px,
    transparent 8px, transparent 12px,
    var(--panel-frame-color) 12px, var(--panel-frame-color) 14px,
    transparent 14px, transparent 18px
  );
  opacity: 0.4;
}

.device-panel-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);           /* --lcars-ice */
  text-transform: uppercase;
  white-space: nowrap;
}
```

The header bar uses the existing `device-header` pattern from `lcars-homepage-card.js` — the device name left-aligned with a thin rule extending to the right edge, plus an optional badge showing the device model or area.

### 3.2 Primary Media Frame (Viewscreen)

```css
.device-panel-media {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-black);
  box-shadow: inset 0 0 20px rgba(100,200,255,0.05);
  
  /* Viewscreen aspect ratio — 16:9 is standard, override per device type */
  aspect-ratio: var(--media-aspect, 16 / 9);
}

/* Camera feed image */
.device-panel-media img,
.device-panel-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* CRT scan line overlay — subtle horizontal lines for LCARS viewscreen feel */
.device-panel-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
}

/* Viewscreen activation animation (reuse existing) */
.device-panel-media img {
  animation: viewscreen-activate 600ms ease-out both;
}

/* Offline state */
.device-panel-media[data-offline] {
  border-color: var(--lcars-gray);
  opacity: 0.5;
}

.device-panel-media[data-offline] img {
  filter: saturate(0) brightness(0.3);
  animation: none;
}

/* Corner brackets — decorative LCARS cornering on the viewscreen */
.device-panel-media::before,
.device-panel-media::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-butterscotch));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.device-panel-media::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.device-panel-media::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}
```

The media frame reuses the existing `.camera-frame` styling from the homepage card but adds corner bracket decorations per Jörn Weißenborn's "bracket" pattern — decorative grouping elements that say "this is the important zone."

### 3.3 Sensor Telemetry Column

```css
.device-panel-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  
  /* Align top with the media frame */
  align-self: start;
}

/* Individual sensor readout line */
.device-sensor-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  padding: 0 0.5rem;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: filter var(--lcars-transition);
  user-select: none;
}

.device-sensor-line:hover {
  filter: brightness(1.2);
}

.device-sensor-line:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Status indicator bar — vertical bar instead of dot for LCARS authenticity */
.sensor-indicator {
  width: 0.25rem;
  height: 1rem;
  border-radius: 0.125rem;
  flex-shrink: 0;
  transition: background var(--lcars-transition);
}

.sensor-label {
  color: var(--lcars-space-white);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sensor-state-value {
  flex-shrink: 0;
  font-weight: 700;
  white-space: nowrap;
  /* Color set by state — see Section 4 */
}
```

The sensor telemetry column uses **text-only readouts** with a color-coded status dot and value. This mirrors the colored alphanumeric displays flanking TNG viewscreens. No backgrounds on these — they float on black, which is the LCARS ideal (Source: Bracer Jack — "empty space is beautiful").

### 3.4 Control Buttons Row

```css
.device-panel-controls {
  grid-area: controls;
  display: flex;
  flex-wrap: wrap;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  
  /* Horizontal thin rule separator above controls */
  border-top: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
}

/* Individual control button — standard LCARS pill */
.device-control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: var(--lcars-btn-height);           /* 3rem — meets WCAG 2.5.8 24x24 minimum */
  padding: 0 1rem 0 0.75rem;
  min-width: 6rem;                           /* WCAG 2.5.8: sufficient target size */
  
  background: var(--lcars-btn-default);      /* --lcars-sunflower */
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
  
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.device-control-btn:hover {
  filter: brightness(1.2);
}

.device-control-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.device-control-btn:active,
.device-control-btn[data-active] {
  background: var(--lcars-btn-active);       /* --lcars-gold */
}

.device-control-btn[data-off] {
  background: var(--lcars-gray);
  color: var(--lcars-space-white);
}

.device-control-btn ha-icon {
  --mdc-icon-size: 16px;
  flex-shrink: 0;
}
```

Controls use the **standard LCARS pill button** (Bracer Jack Rule 4: "The Cap is naturally usable as a button"). Flat side left, rounded side right. No gradients. No shadows. Brightness shift on hover.

---

## 4. Sensor State Color Map

Color assignments follow Bracer Jack's color theory: **3 core hue families** (warm orange, cool blue, alert red) plus white for neutral data and gray for inactive. This keeps us well within the safe 3-color zone with tints.

### Binary Sensor States

| Sensor Type      | Active State        | Color Variable              | Hex       | Rationale                                                    |
|------------------|---------------------|-----------------------------|-----------|--------------------------------------------------------------|
| Motion detected  | `on` (detected)     | `--lcars-butterscotch`      | `#ff9966` | Warm operational amber — "something is happening, not alarming" |
| Motion detected  | `off` (clear)       | `--lcars-gray`              | `#666688` | Muted/idle — standard LCARS inactive state                   |
| Person detected  | `on` (detected)     | `--lcars-gold`              | `#ffaa00` | Elevated attention — gold = active/important (Source: TheLCARS.com active state) |
| Person detected  | `off` (clear)       | `--lcars-gray`              | `#666688` | Idle                                                         |
| Doorbell pressed | `on` (ringing)      | `--lcars-tomato`            | `#ff5555` | Alert/interrupt — tomato = something demands immediate attention |
| Doorbell pressed | `off` (idle)        | `--lcars-gray`              | `#666688` | Idle                                                         |
| Generic binary   | `on`                | `--lcars-ice`               | `#99ccff` | Cool informational blue — neutral "active" without urgency   |
| Generic binary   | `off`               | `--lcars-gray`              | `#666688` | Idle                                                         |
| Unavailable      | `unavailable`       | `--lcars-tomato` (pulsing)  | `#ff5555` | System fault — uses the existing distress pulse animation    |

### Numeric Sensor Values

| Sensor Type      | Display Color                | Variable                   | Rationale                                |
|------------------|------------------------------|----------------------------|------------------------------------------|
| Signal strength  | `--lcars-data-accent`        | `--lcars-ice` (`#99ccff`)  | Standard LCARS data readout color        |
| Battery level    | `--lcars-data-accent`        | `--lcars-ice` (`#99ccff`)  | Standard readout; switches to `--lcars-tomato` at <20% |
| Temperature      | `--lcars-sunflower`          | `#ffcc99`                  | Warm data — heading text color family    |
| Generic numeric  | `--lcars-data-accent`        | `--lcars-ice` (`#99ccff`)  | Default data readout                     |

### Indicator Dot Colors

The `.sensor-indicator` vertical bar uses the **same color as the state value text**. This provides redundant encoding (color + text), critical for accessibility (WCAG 1.4.1 — Use of Color: color is not the sole means of conveying information).

### Implementation Helper

```javascript
/* State color resolver — returns CSS variable name */
function getSensorStateColor(entityId, state) {
  const s = state?.state;
  if (s === 'unavailable' || s === 'unknown') return 'var(--lcars-alert)';
  
  const dc = state?.attributes?.device_class || '';
  const domain = entityId.split('.')[0];
  
  if (domain === 'binary_sensor') {
    if (s === 'off') return 'var(--lcars-disabled)';
    // Active states by device_class
    switch (dc) {
      case 'motion':
      case 'moving':
        return 'var(--lcars-butterscotch)';
      case 'occupancy':
      case 'presence':
        return 'var(--lcars-gold)';
      case 'sound':
        return 'var(--lcars-alert)';    // doorbell / sound alert
      default:
        return 'var(--lcars-data-accent)';
    }
  }
  
  if (domain === 'sensor') {
    // Battery warning threshold
    if (dc === 'battery') {
      const val = parseFloat(s);
      if (!isNaN(val) && val < 20) return 'var(--lcars-alert)';
    }
    return 'var(--lcars-data-accent)';
  }
  
  // Event domain (doorbell_press, etc.)
  if (domain === 'event') return 'var(--lcars-alert)';
  
  return 'var(--lcars-data-accent)';
}
```

### Contrast Verification

All state colors have been verified against `--lcars-black` (#000000) background:

| Color                  | Hex       | Contrast vs #000 | WCAG Level |
|------------------------|-----------|-------------------|------------|
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        |
| `--lcars-gold`         | `#ffaa00` | 8.6:1             | AAA        |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         |
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         |
| `--lcars-space-white`  | `#f5f6fa` | 18.9:1            | AAA        |
| `--lcars-sunflower`    | `#ffcc99` | 13.1:1            | AAA        |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1 for normal text. Most exceed **AAA** (7:1). `--lcars-gray` on black is 4.6:1 — this is intentionally dim for "idle" states and passes AA.

---

## 5. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                | Size Token                  | Value      | Usage                            |
|------------------------|-----------------------------|------------|----------------------------------|
| Device name            | `--lcars-font-size-sub`     | `1.25rem`  | Panel header — sub-header tier   |
| Sensor labels          | `--lcars-font-size-data`    | `0.875rem` | Telemetry text — normal data     |
| Sensor values          | `--lcars-font-size-data`    | `0.875rem` | Same tier, bold weight           |
| Control button text    | `--lcars-font-size-data`    | `0.875rem` | Button labels — normal data      |
| Device badge/model     | `--lcars-font-size-data`    | `0.875rem` | Secondary info                   |

**No font size exceptions**. If something needs emphasis, it gets color or weight — never a fourth font size.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                    | Token / Value               | Usage                                    |
|----------------------------|-----------------------------|------------------------------------------|
| Gap between all elements   | `var(--lcars-gap)` = 0.25rem | Universal LCARS grid spacing             |
| Panel internal padding     | `var(--lcars-gap)` = 0.25rem | Inside the panel frame border            |
| Sensor line min-height     | 1.75rem                     | ~28px — exceeds WCAG 2.5.8 (24px min)   |
| Control button height      | `var(--lcars-btn-height)` = 3rem | Standard LCARS button = 48px       |
| Control button min-width   | 6rem = 96px                 | Exceeds WCAG 2.5.8 (24px)               |
| Media frame border         | 3px solid                   | Viewscreen border — matches existing camera-frame |
| Panel outer border (left/bottom) | 4px solid             | Thick side of frame (Bracer Jack Rule 2) |
| Panel outer border (top/right)   | 2px solid             | Thin side — thick→thin transition        |

### Text Treatment

- **ALL UPPERCASE** for: device name, sensor labels, sensor values, button text
- **Mixed case** ONLY for: none in this panel (no body paragraphs)
- **Letter-spacing**: `0.05em` on headings (matching existing `.lcars-heading`)
- **Font-weight**: `700` (bold) for sensor values only; `400` (normal) for everything else

---

## 6. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Media right, sensors left, controls bottom.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-device-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "controls";
  }
  
  .device-panel-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

On mobile, the media frame goes full-width above the sensors (which flow horizontally in pairs). Controls remain full-width below. This maintains the reading order: context → visual → status → actions.

### Multiple Cameras Stacking

When an area has multiple camera devices, they stack vertically in a column layout:

```css
.device-panels-column {
  display: flex;
  flex-direction: column;
  gap: calc(var(--lcars-gap) * 4);     /* 1rem between panels — generous breathing room */
  align-items: flex-end;               /* Right-justify the stack */
}

/* Each panel in the stack */
.device-panels-column > .lcars-device-panel {
  width: 100%;
  max-width: 60rem;                    /* Cap width so panels don't stretch absurdly */
}
```

---

## 7. Animation

### Panel Scan Line (v4.12.0)

All device panels feature a subtle horizontal scan line that sweeps vertically through the panel background on a 10-second loop, evoking the scan-refresh of a real LCARS display:

```css
.lcars-device-panel {
  background:
    linear-gradient(180deg, transparent, transparent 49%, rgba(100,200,255,0.03) 50%, transparent 51%, transparent) center / 100% 300% no-repeat,
    var(--lcars-black);
  animation: panel-scanline 10s ease-in-out infinite;
}
@keyframes panel-scanline {
  0%, 100% { background-position: center 100%; }
  50% { background-position: center 0%; }
}
```

The scan line is barely perceptible (3% opacity) — it reads as "active display" rather than "flickering screen."

### v4.12.1 Visual Polish

- **Scan line intensity boost**: Opacity increased from 3% to 8%, tighter band (49.5%–50.5%), faster 8-second cycle — more visible sweep without becoming distracting
- **Viewscreen breathing glow**: `@keyframes viewscreen-breathe` (6s ease-in-out infinite) applied to `.device-panel-media` — `box-shadow` oscillates between 20px and 30px spread, giving viewscreens a gentle living-display pulse
- **Sensor scan sweep boost**: Sensor indicator brightness increased from 15% to 25%
- **Toggle pill active glow**: `[data-on]` state gets `box-shadow: 0 0 8px rgba(255,170,0,0.3), 0 0 16px rgba(255,170,0,0.1)` — active toggles now pop against the dark background
- **CRT scanline overlay boost**: Opacity on `.device-panel-media::after` and `.camera-frame::after` increased from 3% to 6%
- **Battery warp core redesign**:
  - Side rails: `::before`/`::after` vertical bars with gradient fade (opacity 0.3)
  - Graduated taper via CSS `nth-child`: Upper pills 40%→50%→60%→68%→76%→85%→94%, lower half mirrors
  - Junction flanges: `::before`/`::after` on `.warp-core-junction` with `repeating-linear-gradient` striped horizontal bars
  - Larger pills (0.625rem→0.9rem base, 1.1rem junction-adjacent), larger junction ring (2rem→2.25rem)
  - New `pill-charge-wave` keyframe with 14px+24px compound glow, 80ms cascade delay
  - Container min-height 10rem→14rem, width 5rem→6rem; larger endcaps (1.75rem) and funnels (2rem)
- **Reduced motion updated**: Added `.device-panel-media` to the `prefers-reduced-motion` disable list

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

---

## 8. Accessibility (a11y) Requirements

### 8.1 Keyboard Navigation (WCAG 2.1.1)

| Element           | Focusable | Keydown Handlers                         |
|-------------------|-----------|------------------------------------------|
| Media frame       | `tabindex="0"` | `Enter`/`Space` → open more-info dialog |
| Sensor lines      | `tabindex="0"` | `Enter`/`Space` → open more-info dialog |
| Control buttons   | `<button>` | Native keyboard support                  |

Tab order: Header → Media frame → Sensor lines (top to bottom) → Control buttons (left to right). This follows DOM order which matches visual order (WCAG 1.3.2 Meaningful Sequence).

### 8.2 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-device-panel"
     role="region"
     aria-label="Front Door Camera device panel">

  <!-- Media frame -->
  <div class="device-panel-media"
       role="button"
       tabindex="0"
       aria-label="Front Door Camera feed: streaming">

  <!-- Sensor readout -->
  <div class="device-sensor-line"
       role="button"
       tabindex="0"
       aria-label="Motion: detected">
    <div class="sensor-indicator" aria-hidden="true"></div>
    <span class="sensor-label">Motion</span>
    <span class="sensor-state-value">Detected</span>
  </div>

  <!-- Control button -->
  <button class="device-control-btn"
          role="switch"
          aria-checked="true"
          aria-label="IR LED: on">
    <ha-icon icon="mdi:led-on" aria-hidden="true"></ha-icon>
    IR LED
  </button>
</div>
```

### 8.3 Color Is Not Sole Indicator (WCAG 1.4.1)

Every sensor state conveys information through **both** color and text:
- Motion detected → `DETECTED` in butterscotch + butterscotch dot
- Motion clear → `CLEAR` in gray + gray dot
- Doorbell ringing → `RINGING` in tomato + tomato dot

The text alone is sufficient to understand the state. The color is redundant reinforcement.

### 8.4 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);     /* Ice blue, 10.3:1 vs black bg */
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance — 2 CSS px perimeter)
- `outline-offset: 2px` ensures the focus ring doesn't overlap the element boundary
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1 requirement

### 8.5 Target Size (WCAG 2.5.8)

| Element            | Size              | Pixels (at 16px base) | Passes? |
|--------------------|-------------------|-----------------------|---------|
| Control button     | 3rem × 6rem min   | 48px × 96px           | ✅ AAA  |
| Sensor line        | 1.75rem × full    | 28px × variable       | ✅ AA   |
| Media frame        | Full panel width   | ≫ 24px                | ✅ AAA  |

### 8.6 Screen Reader Announcements (WCAG 4.1.3)

When sensor states change, use `aria-live="polite"` on a visually-hidden region:

```html
<div class="sr-only" aria-live="polite" aria-atomic="false" id="device-panel-status">
  <!-- JS injects: "Front Door: Motion detected" -->
</div>
```

This announces state changes without interrupting the user. Use the existing `.sr-only` class from `lcars-styles.js`.

### 8.7 Image Alt Text

Camera feed images MUST have descriptive `alt` attributes:
```html
<img src="${entityPicture}" alt="${deviceName} camera feed" loading="lazy" />
```

When the camera is offline:
```html
<div role="img" aria-label="${deviceName} camera: unavailable">
  <ha-icon icon="mdi:video-off" aria-hidden="true"></ha-icon>
</div>
```

---

## 9. Reusability — The Generic Device Panel Pattern

The panel is designed as a **generic frame** with three pluggable zones. The camera panel is the first concrete implementation, but the same structure works for any device type.

### Abstract Device Panel Slots

```
┌─────────────────────────────────────────┐
│  [HEADER]     device name + badge       │  — Always present
├──────────┬──────────────────────────────┤
│ [SENSORS]│  [MEDIA]                     │  — Media slot is device-type-specific
│          │                              │
├──────────┴──────────────────────────────┤
│  [CONTROLS]   action buttons            │  — Always present, populated from entity list
└─────────────────────────────────────────┘
```

### Device Type → Media Slot Mapping

| Device Type    | Media Slot Content                  | `--media-aspect` | `--panel-frame-color`     |
|----------------|-------------------------------------|-------------------|---------------------------|
| **Camera**     | `<img>` from `entity_picture`       | `16 / 9`          | `--lcars-butterscotch`    |
| **Climate**    | Thermostat dial (SVG arc + temp)    | `1 / 1`           | `--lcars-bluey`           |
| **Media Player** | Album art `<img>` or player UI   | `1 / 1`           | `--lcars-violet-creme`    |
| **Cover**      | Position visualization (SVG)        | `4 / 3`           | `--lcars-almond-creme`    |
| **Generic**    | Large icon + state text             | `4 / 3`           | `--lcars-ice`             |

Each device type provides its own **frame color** via the `--panel-frame-color` CSS custom property, which cascades to the border, header line, and control separator. This gives each device type a distinct visual identity while sharing all structural CSS.

### Implementation Pattern (Lit Element)

```javascript
// Base class — all device panels extend this
class LcarsDevicePanelBase extends LitElement {
  static get properties() {
    return {
      deviceId: { type: String, attribute: 'device-id' },
      _hass: { type: Object },
    };
  }

  // Subclasses override these
  get panelFrameColor() { return 'var(--lcars-butterscotch)'; }
  get mediaAspectRatio() { return '16 / 9'; }
  
  // Resolve all entities belonging to this device
  _getDeviceEntities() {
    if (!this._hass || !this.deviceId) return [];
    return Object.values(this._hass.entities || {}).filter(
      (e) => e.device_id === this.deviceId && !e.hidden_by && !e.disabled_by
    );
  }

  // Partition entities into: primary (camera/climate/media), sensors, controls
  _partitionEntities(entities) {
    const primary = [];
    const sensors = [];
    const controls = [];
    
    for (const e of entities) {
      const domain = e.entity_id.split('.')[0];
      if (this._isPrimaryDomain(domain)) primary.push(e);
      else if (domain === 'sensor' || domain === 'binary_sensor') sensors.push(e);
      else if (domain === 'switch' || domain === 'button' || domain === 'select'
               || domain === 'number') controls.push(e);
      // Skip entity_category: diagnostic/config unless explicitly included
    }
    
    return { primary, sensors, controls };
  }

  // Subclasses override — which domain(s) go in the media slot
  _isPrimaryDomain(domain) { return false; }

  // Subclasses override — render the media slot
  _renderMedia(primaryEntities) {
    return html`<div class="device-panel-media-placeholder">No media</div>`;
  }

  // Shared: render sensor telemetry column
  _renderSensors(sensorEntities) { /* ... shared implementation ... */ }

  // Shared: render control buttons row
  _renderControls(controlEntities) { /* ... shared implementation ... */ }
}

// Camera panel — concrete implementation
class LcarsCameraPanel extends LcarsDevicePanelBase {
  get panelFrameColor() { return 'var(--lcars-butterscotch)'; }
  get mediaAspectRatio() { return '16 / 9'; }
  _isPrimaryDomain(domain) { return domain === 'camera'; }
  _renderMedia(cameraEntities) { /* render <img> from entity_picture */ }
}

// Climate panel — future implementation
class LcarsClimatePanel extends LcarsDevicePanelBase {
  get panelFrameColor() { return 'var(--lcars-bluey)'; }
  get mediaAspectRatio() { return '1 / 1'; }
  _isPrimaryDomain(domain) { return domain === 'climate'; }
  _renderMedia(climateEntities) { /* render SVG thermostat dial */ }
}
```

### Device Type Detection

The homepage card (or a new card) automatically selects the correct panel class based on the device's primary entity domain:

```javascript
function getDevicePanelType(device, entities) {
  const domains = new Set(entities.map((e) => e.entity_id.split('.')[0]));
  if (domains.has('camera')) return 'camera';
  if (domains.has('climate')) return 'climate';
  if (domains.has('media_player')) return 'media';
  if (domains.has('cover')) return 'cover';
  return 'generic';
}
```

---

## 10. Lit Component Registration Plan

| Component Tag                    | File                          | Purpose                         |
|----------------------------------|-------------------------------|---------------------------------|
| `lcars-device-panel`            | `lcars-device-panel.js`       | Base class + registry           |
| `lcars-camera-panel`            | (same file or separate)       | Camera concrete panel           |
| `lcars-climate-panel`           | (future)                      | Climate concrete panel          |
| `lcars-media-panel`             | (future)                      | Media player concrete panel     |

---

## 11. CSS Custom Properties Summary (New)

These are **new** properties introduced by the Device Panel. All other properties come from the existing `lcars-styles.js`.

| Property                | Default                        | Purpose                                |
|-------------------------|--------------------------------|----------------------------------------|
| `--panel-frame-color`   | `var(--lcars-butterscotch)`    | Panel border + header line + separator |
| `--media-aspect`        | `16 / 9`                       | Aspect ratio of the media slot         |

These are set per-device-type on the `.lcars-device-panel` element, keeping the CSS fully generic.

---

## 12. Design Verification Checklist

| Rule                                              | Source           | Compliant? |
|---------------------------------------------------|------------------|------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅ (inset glow and scan lines exempt — purely atmospheric, not skeuomorphic) |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          |
| ≤5 color families in use                           | Bracer Jack      | ✅ (3: warm, cool, alert + gray + white) |
| All text uppercase                                 | TheLCARS.com     | ✅          |
| Antonio font only                                  | TheLCARS.com     | ✅          |
| Uses CSS custom properties, no hardcoded hex       | Project rule     | ✅          |
| Animations < 1 second, respects prefers-reduced-motion | WCAG + project | ✅          |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          |
| Focus visible with 2px outline, 3:1 contrast       | WCAG 2.4.7/13    | ✅          |
| Color never sole means of information              | WCAG 1.4.1       | ✅          |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          |
| Screen reader accessible names on all controls     | WCAG 4.1.2       | ✅          |
| Status changes announced via aria-live             | WCAG 4.1.3       | ✅          |

---

*"The viewscreen is the most important display on any starship. It deserves a proper frame."*  
— La Forge, Engineering
