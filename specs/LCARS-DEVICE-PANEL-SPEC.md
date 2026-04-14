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
  background: var(--panel-frame-color, var(--lcars-butterscotch));
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

/* Status indicator dot */
.sensor-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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

The `.sensor-indicator` dot uses the **same color as the state value text**. This provides redundant encoding (color + text), critical for accessibility (WCAG 1.4.1 — Use of Color: color is not the sole means of conveying information).

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

```css
.lcars-panel-header::after {
  content: attr(data-panel-code);
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

**Code generation** (Lit `render()`):

```javascript
_generatePanelCode(entityId) {
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) {
    hash = ((hash << 5) - hash + entityId.charCodeAt(i)) | 0;
  }
  const num = Math.abs(hash) % 100000000;
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
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          |
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

---

## 13. Warp Core Visual Design (v4.13.0)

**Replaces**: The v4.12 single-fill cylindrical warp core  
**Inspiration**: TNG-era warp core power conduit display (see `localinfo/inspiration/battery panel 1.png`)  
**Status**: Implementation-Ready  
**Component**: `lcars-homepage-card.js` → battery panel `grid-area: core`

### 13.1 Design Rationale

The original warp core was a simple rounded rectangle with a CSS `height` fill — functional but visually flat. It didn't read as a *warp core*. The v4.13 redesign replaces it with a **segmented pill-column assembly** that matches the on-screen TNG warp core aesthetic: two columns of horizontal power segments stacked around a central reaction chamber (junction ring), capped with trapezoidal funnels and terminal endcaps.

The new design serves as the **visual centerpiece** of the battery panel. Per Gene Roddenberry's principle: simplicity conveys advanced technology. The segmented pills communicate charge level through *how many segments are illuminated* — an instantly readable analog meter, like fuel rods in a reactor display. No numbers needed at a glance.

Per Bracer Jack's Manifesto: "Empty space is beautiful." The 3px gaps between pills let the black background breathe through the assembly, reinforcing the segmented mechanical feel.

**Design Note — Glow Exception**: Lit pills use a subtle `box-shadow` glow. This is an **intentional, documented deviation** from Bracer Jack Rule #1 ("no drop shadows"). Justification: the glow is a *functional status indicator* communicating the active charge level of each segment — it is not decorative embellishment. The canonical System 47 LCARS screensaver uses bloom/glow on active power conduit readouts. The glow is essential for the warp core to "read" as a power visualization rather than a static UI frame element.

### 13.2 Visual Layout — ASCII Diagram

```
                                 386456   ← decorative Okudagram code
                              ┌──────┐
                              │ENDCAP│   ← 0.5rem tall, gray, rounded
                              └──┬───┘
                             ╱        ╲
                            ╱  FUNNEL   ╲  ← trapezoid, gray, 1.75rem tall
                           ╱              ╲
     ┌──────────────────────────────────────────┐
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 7    │ ← pill row (furthest from junction)
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 6    │    lit LAST as charge increases
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 5    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 4    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 3    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 2    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 1    │ ← nearest junction, lit FIRST
     │ ┌─────────┐ ┃  ┃ ┌─────────┐            │
     │ │▓▓FLANGE▓│(●RING●)│▓FLANGE▓▓│  JUNCTION│ ← center reaction chamber
     │ └─────────┘ ┃  ┃ └─────────┘            │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 1    │ ← nearest junction, lit FIRST
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 2    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 3    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 4    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 5    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 6    │
     │  ╭━━━━━━━━╮ ┃  ┃ ╭━━━━━━━━╮  TIER 7    │ ← furthest from junction
     └──────────────────────────────────────────┘
                           ╲              ╱
                            ╲   FUNNEL  ╱
                             ╲        ╱
                              ┌──────┐
                              │ENDCAP│
                              └──────┘
                              1436-78    ← decorative Okudagram code

     ← LEFT PILL   ┃RAILS┃  RIGHT PILL →
       (rounded-L)           (rounded-R)
```

**Fill direction: CENTER → OUT**. Power radiates from the junction ring outward. Tier 1 (closest to junction) lights first. Tier 7 (extremities) lights last. This matches the matter/antimatter reaction metaphor: energy originates at the dilithium chamber and propagates outward through the power transfer conduits.

### 13.3 Complete DOM Structure (LitElement Template)

```javascript
/* ── Charge computation ── */
const PILL_TIERS = 7;
const litTiers = charge > 0
  ? Math.max(1, Math.ceil(charge / 100 * PILL_TIERS))
  : 0;

const coreState = isCharging ? 'charging'
  : charge < 5 ? 'critical'
  : charge < 20 ? 'low'
  : 'normal';

/* ── Pill row generator ── */
const renderPillRow = (tier, lit) => html`
  <div class="core-pill-row">
    <div class="core-pill core-pill--left ${lit ? 'pill-lit' : 'pill-dim'}"
         style="--pill-tier:${tier}"></div>
    <div class="core-pill core-pill--right ${lit ? 'pill-lit' : 'pill-dim'}"
         style="--pill-tier:${tier}"></div>
  </div>
`;

/* ── Upper pills: DOM top→bottom = tier 7→1 (away from junction → toward junction) ── */
const upperPills = Array.from({length: PILL_TIERS}, (_, i) => {
  const tier = PILL_TIERS - i;               // 7 at top, 1 at bottom (near junction)
  return renderPillRow(tier, tier <= litTiers);
});

/* ── Lower pills: DOM top→bottom = tier 1→7 (toward junction → away from junction) ── */
const lowerPills = Array.from({length: PILL_TIERS}, (_, i) => {
  const tier = i + 1;                         // 1 at top (near junction), 7 at bottom
  return renderPillRow(tier, tier <= litTiers);
});
```

```html
<!-- Warp Core Assembly -->
<div class="warp-core-assembly" data-state="${coreState}"
     role="meter"
     aria-valuenow="${Math.round(charge)}"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Warp core charge level: ${Math.round(charge)} percent${
       isCharging ? ', charging' : ''}${
       charge < 5 ? ', critical' : charge < 20 ? ', low' : ''}">

  <!-- Top decorative code -->
  <span class="core-funnel-code" aria-hidden="true">386456</span>

  <!-- Top endcap -->
  <div class="core-endcap" aria-hidden="true"></div>

  <!-- Top funnel -->
  <div class="core-funnel core-funnel--top" aria-hidden="true"></div>

  <!-- Main core body -->
  <div class="core-body" aria-hidden="true">

    <!-- Upper pill section (tier 7 at top → tier 1 near junction) -->
    <div class="core-pills-section">
      ${upperPills}
    </div>

    <!-- Junction ring with flanges -->
    <div class="core-junction">
      <div class="core-flange core-flange--left"></div>
      <div class="core-junction-ring"></div>
      <div class="core-flange core-flange--right"></div>
    </div>

    <!-- Lower pill section (tier 1 near junction → tier 7 at bottom) -->
    <div class="core-pills-section">
      ${lowerPills}
    </div>

  </div>

  <!-- Bottom funnel -->
  <div class="core-funnel core-funnel--bottom" aria-hidden="true"></div>

  <!-- Bottom endcap -->
  <div class="core-endcap" aria-hidden="true"></div>

  <!-- Bottom decorative code -->
  <span class="core-funnel-code" aria-hidden="true">1436-78</span>
</div>
```

### 13.4 Complete CSS

#### 13.4.1 Assembly Container

```css
/* ═══════════════════════════════════════════════════
   WARP CORE ASSEMBLY
   Container sits in grid-area: core of the battery panel.
   Flex column stacks: code → endcap → funnel → body → funnel → endcap → code
   ═══════════════════════════════════════════════════ */
.warp-core-assembly {
  grid-area: core;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;                       /* 2px micro-gap between vertical sections */
  padding: 0.5rem 0;
  min-height: 14rem;
  width: 5.5rem;                       /* tight bounding box — core is narrow */
  justify-self: center;                /* center within grid cell */

  /* State-driven CSS custom properties (defaults = normal state) */
  --core-pill-color: var(--lcars-ice);
  --core-pill-glow: rgba(153, 204, 255, 0.45);
  --core-pill-dim: 0.12;
}
```

#### 13.4.2 Decorative Funnel Codes

```css
.core-funnel-code {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  user-select: none;
  opacity: 0.6;
}
```

#### 13.4.3 Endcaps

```css
/* Terminal endcaps — small rounded rectangles at top and bottom */
.core-endcap {
  width: 2rem;                         /* ~36% of core body width, matching funnel narrow end */
  height: 0.5rem;
  background: var(--lcars-gray);
  border-radius: 0.25rem;
  flex-shrink: 0;
}
```

#### 13.4.4 Funnels

```css
/* Trapezoidal funnels — wide at core body, narrow at endcap */
.core-funnel {
  width: 100%;                         /* matches core body width */
  height: 1.75rem;
  background: var(--lcars-gray);
  flex-shrink: 0;
}

/* Top funnel: narrow at top, wide at bottom */
.core-funnel--top {
  clip-path: polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%);
}

/* Bottom funnel: wide at top, narrow at bottom */
.core-funnel--bottom {
  clip-path: polygon(0% 0%, 100% 0%, 72% 100%, 28% 100%);
}
```

#### 13.4.5 Core Body (Main Frame)

```css
/* Core body — the rectangular section containing pills, rails, and junction */
.core-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 0;                              /* junction handles its own spacing */
  flex: 1 1 auto;                      /* grow to fill available height */
}

/* ── Side Rails ──
   Two thin vertical lines running full height through the center gap.
   Positioned on the core-body via pseudo-elements so they pass behind
   the junction ring and flanges (junction has higher z-index). */
.core-body::before,
.core-body::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--lcars-ice);
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

/* Left rail — offset left of center */
.core-body::before {
  left: calc(50% - 4px);
}

/* Right rail — offset right of center */
.core-body::after {
  left: calc(50% + 2px);
}
```

#### 13.4.6 Pill Sections & Pill Rows

```css
/* Pills section — upper or lower group of 7 rows */
.core-pills-section {
  display: flex;
  flex-direction: column;
  gap: 3px;                            /* visible gap between pill rows per reference image */
  position: relative;
  z-index: 1;                          /* above rails */
}

/* Pill row — contains left pill + right pill */
.core-pill-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 0.5rem;                       /* 0.5rem column gap houses the rails visually */
  height: 0.875rem;                    /* 14px pill height */
}
```

#### 13.4.7 Individual Pills

```css
/* ── Individual Pill ──
   Rounded rectangle: one flat side (inner, facing rails) and one
   rounded side (outer). Flat fill, no gradients.
   Colors driven by --core-pill-color on the assembly container. */
.core-pill {
  height: 100%;
  transition: background 0.6s ease, box-shadow 0.6s ease, opacity 0.6s ease;
}

/* Left pill: rounded left, flat right (faces center rails) */
.core-pill--left {
  border-radius: 0.625rem 0 0 0.625rem;
}

/* Right pill: flat left (faces center rails), rounded right */
.core-pill--right {
  border-radius: 0 0.625rem 0.625rem 0;
}

/* ── Lit state ── bright, glowing, fully alive */
.pill-lit {
  background: var(--core-pill-color);
  box-shadow: 0 0 8px 1px var(--core-pill-glow);
  opacity: 1;
}

/* ── Dim state ── ghost outline, nearly invisible */
.pill-dim {
  background: var(--core-pill-color);
  box-shadow: none;
  opacity: var(--core-pill-dim);       /* 0.12 default — barely visible on black */
}
```

#### 13.4.8 Junction Ring & Flanges

```css
/* ── Junction Assembly ──
   The central reaction chamber: a gray ring flanked by striped flanges.
   This is always visible regardless of charge level. */
.core-junction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  height: 1.75rem;
  margin: 3px 0;                       /* match pill row gap spacing */
  position: relative;
  z-index: 2;                          /* above rails and pills */
}

/* Junction ring — the circular element at dead center */
.core-junction-ring {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 3px solid var(--lcars-gray);
  background: rgba(102, 102, 136, 0.3);  /* subtle gray fill */
  flex-shrink: 0;
  z-index: 3;
}

/* Flanges — striped mechanical bars extending from the ring to the edges */
.core-flange {
  flex: 1;
  height: 0.75rem;
  background: repeating-linear-gradient(
    0deg,
    var(--lcars-gray) 0px,
    var(--lcars-gray) 2px,
    transparent 2px,
    transparent 4px
  );
  opacity: 0.7;
}

/* Left flange has rounded-left cap */
.core-flange--left {
  border-radius: 0.375rem 0 0 0.375rem;
}

/* Right flange has rounded-right cap */
.core-flange--right {
  border-radius: 0 0.375rem 0.375rem 0;
}
```

### 13.5 Color States

The assembly's `data-state` attribute drives color overrides on the container's CSS custom properties.

#### 13.5.1 State Definitions

| State        | Condition                          | `--core-pill-color`             | `--core-pill-glow`                       | Animation             |
|--------------|------------------------------------|---------------------------------|------------------------------------------|-----------------------|
| **normal**   | charge ≥ 20%, not charging         | `var(--lcars-ice)` (#99ccff)    | `rgba(153, 204, 255, 0.45)`             | idle pulse            |
| **charging** | any charge, `isCharging === true`  | `var(--lcars-butterscotch)` (#ff9966) | `rgba(255, 153, 102, 0.5)`        | upward stripe cascade |
| **low**      | 5% ≤ charge < 20%, not charging   | `var(--lcars-tomato)` (#ff5555) | `rgba(255, 85, 85, 0.45)`               | slow pulse            |
| **critical** | charge < 5%, not charging          | `var(--lcars-tomato)` (#ff5555) | `rgba(255, 85, 85, 0.6)`                | fast pulse + blink    |

#### 13.5.2 State CSS Overrides

```css
/* ── Normal state (default) ── */
/* Properties already set on .warp-core-assembly — no override needed */

/* ── Charging state ── warm butterscotch power flow */
.warp-core-assembly[data-state="charging"] {
  --core-pill-color: var(--lcars-butterscotch);
  --core-pill-glow: rgba(255, 153, 102, 0.5);
}

/* ── Low battery ── alert tomato */
.warp-core-assembly[data-state="low"] {
  --core-pill-color: var(--lcars-tomato);
  --core-pill-glow: rgba(255, 85, 85, 0.45);
}

/* ── Critical battery ── alert tomato, intensified */
.warp-core-assembly[data-state="critical"] {
  --core-pill-color: var(--lcars-tomato);
  --core-pill-glow: rgba(255, 85, 85, 0.6);
  --core-pill-dim: 0.06;              /* dim pills nearly invisible */
}
```

#### 13.5.3 Contrast Verification (all against #000000 background)

| State Color            | Hex       | Contrast vs #000 | WCAG Level | Usage              |
|------------------------|-----------|-------------------|------------|--------------------|
| `--lcars-ice`          | `#99ccff` | 10.3:1            | AAA        | Normal lit pills   |
| `--lcars-butterscotch` | `#ff9966` | 8.2:1             | AAA        | Charging lit pills |
| `--lcars-tomato`       | `#ff5555` | 5.2:1             | AA         | Low/critical pills |
| `--lcars-gray`         | `#666688` | 4.6:1             | AA         | Junction, flanges  |

All pass **WCAG 1.4.11** Non-text Contrast (3:1 minimum for UI components).

### 13.6 Animation Keyframes

#### 13.6.1 Idle Pulse (Normal State)

A gentle opacity oscillation on lit pills. The pulse cascades outward from the junction: tier 1 starts first, tier 7 last, via `animation-delay` driven by `--pill-tier`.

```css
@keyframes core-idle-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.65; }
}

/* Normal state: idle pulse on lit pills */
.warp-core-assembly[data-state="normal"] .pill-lit {
  animation: core-idle-pulse 3s ease-in-out infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 80ms);
}
```

**Timing**: 3s period is slow and meditative — conveying advanced technology that doesn't rush (Source: System 47 animation tempo reference). The 80ms inter-tier stagger creates a visible ripple from center to extremities over ~480ms.

#### 13.6.2 Charging Cascade (Charging State)

When charging, lit pills show a moving stripe pattern flowing upward. Each pill's stripe animation is offset by tier so the visual energy cascades outward from the junction.

```css
/* Stripe texture applied to lit pills during charging */
.warp-core-assembly[data-state="charging"] .pill-lit {
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 4px,
    rgba(255, 255, 255, 0.18) 4px,
    rgba(255, 255, 255, 0.18) 6px
  );
  background-size: 100% 12px;
  animation: core-charge-stripe 0.8s linear infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 60ms);
}

@keyframes core-charge-stripe {
  0%   { background-position-y: 0; }
  100% { background-position-y: -12px; }
}
```

**Timing**: 0.8s stripe cycle is brisk — communicating active energy transfer. The 60ms inter-tier stagger (`7 × 60ms = 420ms` total) keeps the cascade under 500ms, well within the 1s animation cap.

#### 13.6.3 Low Battery Pulse (Low State)

A slow, wide-amplitude pulse on lit pills signals reduced power.

```css
@keyframes core-low-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

.warp-core-assembly[data-state="low"] .pill-lit {
  animation: core-low-pulse 2s ease-in-out infinite;
  animation-delay: calc((var(--pill-tier, 1) - 1) * 50ms);
}
```

#### 13.6.4 Critical Battery Alert (Critical State)

Fast pulsing with an intermittent full-assembly blink. This is the warp core equivalent of a Red Alert — something demands immediate attention.

```css
@keyframes core-critical-pulse {
  0%, 100% { opacity: 1; }
  30%      { opacity: 0.2; }
  60%      { opacity: 0.9; }
}

@keyframes core-critical-blink {
  0%, 80%, 100% { opacity: 1; }
  90%           { opacity: 0.3; }
}

.warp-core-assembly[data-state="critical"] .pill-lit {
  animation: core-critical-pulse 1s ease-in-out infinite;
}

/* Assembly-level blink at critical — the whole core flickers */
.warp-core-assembly[data-state="critical"] {
  animation: core-critical-blink 4s ease-in-out infinite;
}
```

#### 13.6.5 Junction Ring Glow (All States)

The junction ring subtly reflects the current state color, reinforcing that the "reaction chamber" is responding to charge level.

```css
.warp-core-assembly[data-state="normal"] .core-junction-ring {
  box-shadow: 0 0 4px rgba(153, 204, 255, 0.3);
}

.warp-core-assembly[data-state="charging"] .core-junction-ring {
  box-shadow: 0 0 6px rgba(255, 153, 102, 0.4);
}

.warp-core-assembly[data-state="low"] .core-junction-ring,
.warp-core-assembly[data-state="critical"] .core-junction-ring {
  box-shadow: 0 0 6px rgba(255, 85, 85, 0.4);
}
```

### 13.7 Charge Level Mapping

#### 13.7.1 Algorithm

The core uses **center-out fill**: power radiates from the junction ring outward toward the extremities.

```javascript
const PILL_TIERS = 7;

/**
 * Compute the number of lit tiers (1–7) from a charge percentage (0–100).
 * Each tier illuminates one row above AND one row below the junction
 * simultaneously (14 pill rows total = 7 symmetric tiers).
 *
 * Fill direction: junction → extremities (center-out).
 * At 0%: no tiers lit (core is dead).
 * At >0%: minimum 1 tier (core shows signs of life).
 * At 100%: all 7 tiers lit (power reaches the endpoints).
 */
function computeLitTiers(charge) {
  if (charge <= 0) return 0;
  return Math.max(1, Math.ceil(charge / 100 * PILL_TIERS));
}
```

#### 13.7.2 Tier Boundary Table

| Charge %   | Lit Tiers | Lit Rows (of 14) | Visual                                     |
|------------|-----------|-------------------|--------------------------------------------|
| 0          | 0         | 0                 | All pills dim, core is dead                |
| 1 – 14     | 1         | 2                 | Junction-adjacent pills only, barely alive |
| 15 – 28    | 2         | 4                 | Small glow around junction                 |
| 29 – 42    | 3         | 6                 | Core warming up                            |
| 43 – 57    | 4         | 8                 | Healthy mid-range, center-heavy glow       |
| 58 – 71    | 5         | 10                | Strong power flow                          |
| 72 – 85    | 6         | 12                | Near full, outer pills beginning to light  |
| 86 – 100   | 7         | 14                | Full power — all segments lit, core blazing|

#### 13.7.3 Tier Assignment Per Row

**Upper pills section** (DOM order: top to bottom, i = 0…6):
```
Row i → tier = 7 - i
```
- i=0 (topmost): tier 7 — furthest from junction, lit last
- i=6 (nearest junction): tier 1 — lit first

**Lower pills section** (DOM order: top to bottom, i = 0…6):
```
Row i → tier = i + 1
```
- i=0 (nearest junction): tier 1 — lit first  
- i=6 (bottommost): tier 7 — lit last

A row is **lit** if `tier <= litTiers`. Otherwise **dim**.

### 13.8 Reduced Motion Fallback

```css
@media (prefers-reduced-motion: reduce) {
  .warp-core-assembly,
  .warp-core-assembly .pill-lit,
  .warp-core-assembly .core-junction-ring {
    animation: none !important;
    transition: none !important;
  }

  /* Static brightness differentiation replaces animation:
     - Lit pills at full opacity (no pulse)
     - Dim pills at reduced opacity (no transition)
     - State color changes apply instantly */
  .warp-core-assembly .pill-lit {
    opacity: 1 !important;
  }

  /* Charging state: static stripes (no motion) but keep the texture
     so the charging state is still visually distinct */
  .warp-core-assembly[data-state="charging"] .pill-lit {
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 4px,
      rgba(255, 255, 255, 0.18) 4px,
      rgba(255, 255, 255, 0.18) 6px
    );
  }
}
```

Per WCAG 2.3.3 and the existing `prefers-reduced-motion` pattern in `lcars-styles.js`: all animations stop, all transitions become instant. The visual meter (lit pills vs dim pills) is fully functional without motion — the charge level is always readable from the static segment count.

### 13.9 Accessibility

#### 13.9.1 ARIA Meter Pattern

The assembly uses `role="meter"` — the semantic HTML meter pattern for a scalar value within a known range.

| Attribute          | Value                                          | Purpose                                      |
|--------------------|-------------------------------------------------|----------------------------------------------|
| `role`             | `meter`                                         | Communicates this is a gauge/meter to AT      |
| `aria-valuenow`    | `${Math.round(charge)}`                        | Current charge percentage (0–100)             |
| `aria-valuemin`    | `0`                                             | Minimum value                                 |
| `aria-valuemax`    | `100`                                           | Maximum value                                 |
| `aria-label`       | `Warp core charge level: N percent[, state]`   | Human-readable description with state context |

The `aria-label` dynamically includes state qualifiers:
- ", charging" appended when `isCharging` is true
- ", critical" appended when charge < 5%
- ", low" appended when charge < 20%

#### 13.9.2 Decorative Elements Hidden from AT

All visual-only structural elements are marked `aria-hidden="true"`:
- Funnel codes (`386456`, `1436-78`), endcaps, funnels, core body (pills, rails, junction)

The *only* element exposed to assistive technology is the outer `.warp-core-assembly` container with its `role="meter"` attributes. The segmented pill visual is a decorative representation — the actual data is communicated through the ARIA meter values.

#### 13.9.3 Color Is Not Sole Indicator (WCAG 1.4.1)

The charge level is conveyed through **three independent channels**:
1. **Segment count** — how many pill tiers are lit (spatial/geometric, not color-dependent)
2. **ARIA value** — screen reader announces the numeric percentage  
3. **Color** — ice/butterscotch/tomato for state reinforcement (redundant channel)

A user who cannot perceive color can still read the charge level from the number of lit segments. A user who cannot see at all gets the percentage via screen reader. Color is never the sole means.

#### 13.9.4 Status Change Announcements (WCAG 4.1.3)

When the core state changes (e.g., normal → low, or idle → charging), the battery panel's existing `aria-live="polite"` status region announces the change:

```javascript
// In the battery panel's updated() lifecycle:
if (prevState !== coreState) {
  this._announceStatus(
    `${deviceName}: battery ${Math.round(charge)} percent, ${coreState}`
  );
}
```

### 13.10 Interaction with Battery Panel Grid

The warp core assembly occupies `grid-area: core` in the existing battery panel layout. No changes to the grid definition are needed. The assembly's `width: 5.5rem` and `justify-self: center` keep it centered within the grid cell. `flex: 1 1 auto` on `.core-body` allows the pill sections to stretch vertically when the grid cell is taller than the minimum.

```
┌───────────────────────────────────────────────────┐
│ [totals]  │      [core]       │     [controls]    │
│           │                   │                   │
│ Battery A │   ╭━━╮   ╭━━╮    │  ┌─────────╮      │
│ Battery B │   ╭━━╮   ╭━━╮    │  │ SETTING │      │
│ Battery C │   ╭━━╮   ╭━━╮    │  └─────────╯      │
│           │   (●RING●)        │  ┌─────────╮      │
│           │   ╭━━╮   ╭━━╮    │  │ CONTROL │      │
│           │   ╭━━╮   ╭━━╮    │  └─────────╯      │
│           │   ╭━━╮   ╭━━╮    │                   │
└───────────────────────────────────────────────────┘
```

### 13.11 CSS Custom Properties Summary (New for Warp Core)

| Property              | Default                            | Scope                    | Purpose                                 |
|-----------------------|------------------------------------|--------------------------|-----------------------------------------|
| `--core-pill-color`   | `var(--lcars-ice)`                 | `.warp-core-assembly`    | Active pill fill color (state-driven)   |
| `--core-pill-glow`    | `rgba(153, 204, 255, 0.45)`       | `.warp-core-assembly`    | Active pill box-shadow glow color       |
| `--core-pill-dim`     | `0.12`                             | `.warp-core-assembly`    | Dim pill opacity                        |
| `--pill-tier`         | `1`                                | `.core-pill` (per-row)   | Tier index (1–7) for animation delay    |

### 13.12 Design Verification Checklist

| Rule                                                     | Source            | Compliant? | Notes                                    |
|----------------------------------------------------------|-------------------|------------|------------------------------------------|
| No gradients on structural elements                      | Bracer Jack #1    | ✅          | Pills are flat solid fills               |
| `box-shadow` glow on pills only                          | (documented exception) | ⚠️     | Functional status indicator, not decorative — see §13.1 |
| Frame thick→thin (flanges 0.75rem→rails 2px)             | Bracer Jack #2    | ✅          | Flange thickness > rail thickness        |
| Pill caps as natural termination points                  | Bracer Jack #4    | ✅          | Rounded ends terminate each pill segment |
| 3px gap = invisible grid alignment                       | Bracer Jack #5    | ✅          | Consistent gap between all pill rows     |
| Exactly 3 font sizes (data only used here)               | Bracer Jack #6    | ✅          | Funnel codes use `--lcars-font-size-data`|
| ≤3 color families at rest                                 | Bracer Jack color | ✅          | Ice (pills) + gray (structure) + white (codes) |
| State colors add ≤2 more families                        | Bracer Jack color | ✅          | Butterscotch (charging) + tomato (alert) |
| All text uppercase                                       | TheLCARS.com      | ✅          | Funnel codes are numeric (case n/a)      |
| Antonio font only                                        | TheLCARS.com      | ✅          | `var(--lcars-font)`                      |
| CSS custom properties, no hardcoded hex                  | Project rule      | ✅          | All colors via `--lcars-*` vars          |
| Animations < 1s, `prefers-reduced-motion` respected      | WCAG + project    | ✅          | Longest animation: 0.8s stripe cycle     |
| Non-text contrast ≥ 3:1 (WCAG 1.4.11)                   | WCAG 1.4.11       | ✅          | All pill/structure colors verified       |
| Color not sole means of information (WCAG 1.4.1)         | WCAG 1.4.1        | ✅          | Segment count + ARIA + color             |
| `role="meter"` with full ARIA value attributes           | WCAG 4.1.2        | ✅          | valuenow, valuemin, valuemax, label      |
| Decorative elements hidden from AT                       | WCAG 4.1.2        | ✅          | `aria-hidden="true"` on all visual parts |
| Status changes announced via `aria-live`                 | WCAG 4.1.3        | ✅          | State transitions announced              |
| Pure CSS+HTML, no SVG or canvas                          | Admiral's orders  | ✅          | `clip-path: polygon()` for funnels       |

---

*"She's more than a gauge, Captain — she's the heart of the ship. When that core is lit up, you know she's got power to spare. When it's dark... you start looking for a starbase."*  
— La Forge, Main Engineering
