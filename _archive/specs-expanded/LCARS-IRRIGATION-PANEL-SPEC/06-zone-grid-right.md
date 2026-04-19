## 5. Zone Grid (Right)

The zone grid is the primary content area — a vertical list of all irrigation zones, each rendered as a row with a control button and status.

### 5.1 Zone Row — Idle State

```html
<div class="irrigation-zone-row"
     role="listitem"
     tabindex="0"
     aria-label="${zoneName}: idle"
     @click="${() => toggleExpand(zoneId)}">
  <button class="irrigation-zone-btn start"
          aria-label="Start watering ${zoneName}"
          ?disabled="${isStandby}"
          @click="${(e) => { e.stopPropagation(); startZone(hass, zoneId, validZoneIds, isStandby); }}">
    <span aria-hidden="true">●</span> START
  </button>
  <span class="irrigation-zone-name">${zoneName}</span>
  <span class="irrigation-zone-status" style="color: var(--lcars-sunflower)">
    IDLE
  </span>
</div>
```

### 5.2 Zone Row — Watering State

When a zone is actively running, the row changes: the button becomes STOP, and a fill bar shows time remaining.

```html
<div class="irrigation-zone-row watering"
     role="listitem"
     tabindex="0"
     aria-label="${zoneName}: watering, ${timeRemaining} remaining">
  <button class="irrigation-zone-btn stop"
          aria-label="Stop watering ${zoneName}"
          @click="${(e) => { e.stopPropagation(); stopZone(hass, zoneId, validZoneIds); }}">
    <span aria-hidden="true">■</span> STOP
  </button>
  <span class="irrigation-zone-name">${zoneName}</span>
  <div class="irrigation-zone-progress"
       role="progressbar"
       aria-label="Watering progress"
       aria-valuemin="0"
       aria-valuemax="${totalDuration}"
       aria-valuenow="${elapsed}">
    <div class="irrigation-zone-fill" style="width: ${pct}%"></div>
  </div>
  <span class="irrigation-zone-countdown" style="color: var(--lcars-ice)">
    ${timeRemaining}
  </span>
</div>
```

### 5.3 Zone Row — Expanded (Attributes)

Tapping a zone row reveals secondary attributes (soil, nozzle, shade, slope) as a sub-row. These are read-only informational fields from Rachio's zone configuration.

```html
<div class="irrigation-zone-attrs" aria-label="${zoneName} zone details">
  <span class="irrigation-zone-attr">SOIL: ${soilType}</span>
  <span class="irrigation-zone-attr">NOZZLE: ${nozzleType}</span>
  <span class="irrigation-zone-attr">SHADE: ${shadeLevel}</span>
  <span class="irrigation-zone-attr">SLOPE: ${slopeType}</span>
</div>
```

### Zone Grid CSS

```css
.irrigation-zones {
  grid-area: zones;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  overflow-y: auto;
}

.irrigation-zone-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;   /* 36px — exceeds WCAG 2.5.8 */
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background var(--lcars-transition);
}

.irrigation-zone-row:hover {
  background: rgba(153, 204, 255, 0.05);
}

/* Zone control button — LCARS pill: flat left, rounded right */
.irrigation-zone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 5rem;
  height: var(--lcars-bar-h);   /* 3rem = 48px */
  padding: 0 0.75rem;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;

  border: none;
  cursor: pointer;
  user-select: none;
  transition: filter var(--lcars-transition), background var(--lcars-transition);

  /* Pill shape: flat left, rounded right */
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
}

.irrigation-zone-btn.start {
  background: var(--lcars-sunflower);
  color: var(--lcars-black);
}

.irrigation-zone-btn.stop {
  background: var(--lcars-ice);
  color: var(--lcars-black);
}

.irrigation-zone-btn:hover {
  filter: brightness(1.15);
}

.irrigation-zone-btn:active {
  filter: brightness(0.85);
}

/* Disabled state — controller in standby */
.irrigation-zone-btn:disabled {
  background: var(--lcars-gray);
  color: var(--lcars-disabled);
  cursor: not-allowed;
  filter: none;
  opacity: 0.5;
}

/* Zone name */
.irrigation-zone-name {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Zone status label */
.irrigation-zone-status {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}

/* Active watering fill bar */
.irrigation-zone-progress {
  flex: 1;
  height: 0.5rem;
  background: var(--lcars-disabled);
  border-radius: 0.25rem;
  overflow: hidden;
  opacity: 0.6;
}

.irrigation-zone-fill {
  height: 100%;
  background: var(--lcars-ice);
  border-radius: 0.25rem;
  transition: width 1s linear;
}

/* Countdown timer */
.irrigation-zone-countdown {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
}

/* Expanded zone attributes */
.irrigation-zone-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding: 0.125rem 0.5rem 0.25rem calc(5rem + 0.75rem);  /* indent past button */
  overflow: hidden;
  max-height: 0;
  transition: max-height 300ms ease-out, padding 300ms ease-out;
}

.irrigation-zone-row.expanded + .irrigation-zone-attrs {
  max-height: 3rem;
  padding-top: 0.125rem;
  padding-bottom: 0.25rem;
}

.irrigation-zone-attr {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  white-space: nowrap;
}
```

### 5.4 Duration Countdown Logic

```javascript
/**
 * Format remaining seconds as MM:SS countdown.
 * @param {number} remainingSec - seconds remaining
 * @returns {string} formatted time (e.g., "12:34")
 */
function formatCountdown(remainingSec) {
  if (remainingSec == null || remainingSec <= 0) return '00:00';
  const min = Math.floor(remainingSec / 60);
  const sec = remainingSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Calculate fill bar percentage for active zone.
 * @param {number} elapsed - seconds elapsed
 * @param {number} total - total zone duration in seconds
 * @returns {number} 0–100 percentage
 */
function getZoneFillPct(elapsed, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Get the currently watering zone (if any) from a list of zone entities.
 * @param {Array} zoneEntities - array of switch entity state objects
 * @returns {object|null} the active zone entity, or null
 */
function getActiveZone(zoneEntities) {
  return zoneEntities.find(e => e.state === 'on') || null;
}
```

---
