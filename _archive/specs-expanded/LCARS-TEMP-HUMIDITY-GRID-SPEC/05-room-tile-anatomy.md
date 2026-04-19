## 4. Room Tile Anatomy

Each tile is a compact, self-contained readout cell — the equivalent of one deck section on the Enterprise internal sensor grid.

### HTML Template

```html
<div class="sensor-tile ${comfortClass}"
     role="listitem"
     tabindex="0"
     aria-label="${areaName}: ${temperature} degrees, ${humidity} percent humidity"
     @click="${(e) => handleTileTap(e, temperatureEntityId)}"
     @keydown="${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTileTap(e, temperatureEntityId); } }}">
  <!-- G-F3: tabindex + keydown added for WCAG 2.1.1 keyboard accessibility -->

  <!-- Room Name -->
  <div class="tile-name">${areaName}</div>

  <!-- Primary Readouts -->
  <div class="tile-readings">
    <span class="tile-temp" style="color: ${tempColor}">
      ${temperature}°
    </span>
    <span class="tile-humidity" style="color: ${humidityColor}">
      ${humidity}%
    </span>
  </div>

  <!-- Battery Badge (only when low) -->
  ${batteryLevel < batteryAlert ? html`
    <div class="tile-battery-badge"
         aria-label="Low battery: ${batteryLevel} percent"
         title="BATTERY: ${batteryLevel}%">
      ●
    </div>
  ` : ''}

  <!-- Optional Sparkline -->
  ${showSparklines ? html`
    <svg class="tile-sparkline"
         viewBox="0 0 100 16"
         preserveAspectRatio="none"
         role="img"
         aria-label="Temperature trend: last 24 hours">
      <path class="tile-sparkline-area"
            d="${sparklineAreaPath(tempHistory)}"
            fill="${tempColor}" />
      <path class="tile-sparkline-path"
            d="${sparklinePath(tempHistory)}"
            stroke="${tempColor}" />
    </svg>
  ` : ''}

  <!-- Unavailable Overlay -->
  ${isUnavailable ? html`
    <div class="tile-unavailable" aria-label="Sensor unavailable">
      <span>OFFLINE</span>
    </div>
  ` : ''}
</div>
```

### Tile CSS

```css
.sensor-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  min-height: calc(var(--lcars-vunit) * 1.5);  /* 4.5rem = 72px */
  min-width: 7.5rem;                            /* 1 LCARS unit */
  background: var(--lcars-bg);
  border: 2px solid var(--lcars-gray);
  border-radius: 0 0.75rem 0.75rem 0;           /* Flat left, rounded right — LCARS pill */
  overflow: hidden;
  transition: border-color var(--lcars-transition-speed) var(--lcars-transition-function);
  cursor: default;
}

/* Comfort state drives border color */
.sensor-tile.comfort-nominal {
  border-color: var(--lcars-ice);
}

.sensor-tile.comfort-warm {
  border-color: var(--lcars-butterscotch);
}

.sensor-tile.comfort-hot {
  border-color: var(--lcars-peach);
}

.sensor-tile.comfort-cool {
  border-color: var(--lcars-bluey);
}

.sensor-tile.comfort-cold {
  border-color: var(--lcars-blue);
}

/* G-F2: .humidity-warn removed — border is temperature-only.
   Humidity state is encoded via text color only (WCAG 1.4.1 — avoid
   conflicting dual-encoding on border). See §5 design notes. */

.sensor-tile.unavailable {
  border-color: var(--lcars-gray);
  opacity: 0.5;
}

/* G-F3: Focus styles for keyboard navigation (WCAG 2.1.1, 2.4.7) */
.sensor-tile:focus-visible {
  outline: 2px solid var(--lcars-sunflower);
  outline-offset: 2px;
}
```

### Tile Name

```css
.tile-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);       /* 0.875rem — standardized */
  color: var(--lcars-sunflower);               /* Heading color for room labels */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
```

### Tile Readings

```css
.tile-readings {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.tile-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);        /* 1.25rem — standardized across all specs */
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
  transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
}

.tile-humidity {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);        /* 0.875rem — standardized across all specs */
  color: var(--lcars-space-white);
  text-transform: uppercase;
  line-height: 1;
  opacity: 0.85;
  transition: color var(--lcars-transition-speed) var(--lcars-transition-function);
}
```

### Battery Badge

```css
.tile-battery-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  color: var(--lcars-tomato);
  font-size: 0.5rem;
  line-height: 1;
  animation: battery-pulse 2s ease-in-out infinite;
}

@keyframes battery-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .tile-battery-badge {
    animation: none;
    opacity: 1;
  }
}
```

### Tile Sparkline

```css
.tile-sparkline {
  width: 100%;
  height: 1rem;
  display: block;
  margin-top: auto;                           /* Push to bottom of tile */
}

.tile-sparkline-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.tile-sparkline-area {
  opacity: 0.06;
}
```

### Unavailable Overlay

```css
.tile-unavailable {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1;
}

.tile-unavailable span {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---
