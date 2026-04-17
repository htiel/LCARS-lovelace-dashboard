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
