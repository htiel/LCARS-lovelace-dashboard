## 5. Primary Media Frame — Temperature Viewscreen

The center-right viewscreen contains the large current temperature readout and setpoint controls. This is a **clean, minimal display** — not a skeuomorphic thermostat dial. Think the central readout on the Ops console: a number you can read from across the room.

### 5.1 Temperature Arc (SVG)

A semicircular arc behind the temperature number indicates where the current temperature falls within the `min_temp` → `max_temp` range. The arc uses the dynamic `--climate-action-color`.

```
          ╭─────────────╮
        ╱   ╱╱╱╱╱╱╱╱╱     ╲       ← colored arc (progress)
      ╱   ╱╱╱╱╱╱╱╱╱         ╲     ← gray arc (remaining)
     │                        │
     │         72°            │     ← large current temp
     │        CURRENT         │     ← label
     │                        │
      ╲                      ╱
        ╲                  ╱
          ╰──────────────╯
```

### SVG Structure

```html
<svg class="climate-temp-arc"
     viewBox="0 0 200 130"
     role="meter"
     aria-label="Current temperature: ${currentTemp} degrees"
     aria-valuemin="${minTemp}"
     aria-valuemax="${maxTemp}"
     aria-valuenow="${currentTemp}">

  <!-- Background arc (full range) -->
  <path class="climate-arc-bg"
        d="${arcPath(200, 130, 80, 180, 0)}"
        fill="none"
        stroke="var(--lcars-disabled)"
        stroke-width="6"
        stroke-linecap="round" />

  <!-- Progress arc (current position within range) -->
  <path class="climate-arc-progress"
        d="${arcPath(200, 130, 80, 180, progressAngle)}"
        fill="none"
        stroke="var(--climate-action-color)"
        stroke-width="6"
        stroke-linecap="round" />

  <!-- Target tick mark(s) on the arc -->
  <circle class="climate-arc-target-tick"
          cx="${targetTickX}" cy="${targetTickY}" r="4"
          fill="var(--lcars-gold)" />

  <!-- Dual setpoint: low tick (butterscotch) and high tick (ice) -->
  <!-- Only rendered in heat_cool mode -->
  <circle class="climate-arc-target-low"
          cx="${lowTickX}" cy="${lowTickY}" r="4"
          fill="var(--lcars-butterscotch)"
          style="display: ${isDual ? 'block' : 'none'}" />
  <circle class="climate-arc-target-high"
          cx="${highTickX}" cy="${highTickY}" r="4"
          fill="var(--lcars-ice)"
          style="display: ${isDual ? 'block' : 'none'}" />

  <!-- Current temperature — large text -->
  <text class="climate-temp-value"
        x="100" y="80"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--climate-action-color)"
        font-family="var(--lcars-font)"
        font-size="42"
        text-transform="uppercase">
    ${currentTemp}°
  </text>

  <!-- Label below temp -->
  <text class="climate-temp-label"
        x="100" y="105"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--lcars-space-white)"
        font-family="var(--lcars-font)"
        font-size="12"
        text-transform="uppercase">
    CURRENT
  </text>
</svg>
```

### CSS

```css
.climate-media {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);
  aspect-ratio: var(--media-aspect, 1 / 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.climate-temp-arc {
  width: 100%;
  max-width: 14rem;
  height: auto;
  display: block;
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.climate-media::before,
.climate-media::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-butterscotch));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.climate-media::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.climate-media::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}

/* Arc transition for color changes */
.climate-arc-progress {
  transition: stroke var(--lcars-transition-slow), stroke-dashoffset 0.6s ease-out;
}

.climate-arc-bg {
  opacity: 0.3;
}

/* Temperature text — large, dynamic color */
.climate-temp-value {
  transition: fill var(--lcars-transition-slow);
}
```

### Arc Path Generation (JS)

```javascript
/**
 * Generate an SVG arc path for the temperature gauge.
 * @param {number} w - viewBox width
 * @param {number} h - viewBox height
 * @param {number} r - arc radius
 * @param {number} startAngle - arc start in degrees (180 = left)
 * @param {number} endAngle - arc end in degrees (0 = right)
 * @returns {string} SVG path d-attribute
 */
function arcPath(w, h, r, startAngle, endAngle) {
  const cx = w / 2;
  const cy = h - 10;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/**
 * Calculate the progress angle based on current temp within min/max range.
 * Arc spans from 180° (left) to 0° (right).
 * @param {number} current - current temperature
 * @param {number} min - thermostat min_temp
 * @param {number} max - thermostat max_temp
 * @returns {number} angle in degrees
 */
function getProgressAngle(current, min, max) {
  if (current == null || min == null || max == null) return 180;
  const range = max - min;
  if (range <= 0) return 180;
  const pct = Math.max(0, Math.min(1, (current - min) / range));
  // 180° = 0%, 0° = 100% (arc goes from left to right)
  return 180 - (pct * 180);
}

/**
 * Calculate the (x, y) position of a tick mark on the arc
 * for a given temperature value.
 */
function getArcTickPosition(temp, min, max, cx, cy, r) {
  const range = max - min;
  if (range <= 0) return { x: cx, y: cy };
  const pct = Math.max(0, Math.min(1, (temp - min) / range));
  const angle = 180 - (pct * 180);
  const rad = (angle * Math.PI) / 180;
  return {
    x: (cx + r * Math.cos(rad)).toFixed(1),
    y: (cy + r * Math.sin(rad)).toFixed(1),
  };
}
```

### 5.2 Setpoint Controls

Below the arc, inline setpoint controls with LCARS pill buttons for increment/decrement.

```html
<!-- Single setpoint (heat, cool modes) -->
<div class="climate-setpoint" role="group" aria-label="Target temperature control">
  <button class="climate-setpoint-btn decrement"
          aria-label="Decrease target temperature"
          @click="${() => adjustTemp(-step)}">
    <span aria-hidden="true">–</span>
  </button>
  <div class="climate-setpoint-display">
    <span class="climate-setpoint-label">TARGET</span>
    <span class="climate-setpoint-value">${targetTemp}°${unit}</span>
  </div>
  <button class="climate-setpoint-btn increment"
          aria-label="Increase target temperature"
          @click="${() => adjustTemp(+step)}">
    <span aria-hidden="true">+</span>
  </button>
</div>

<!-- Dual setpoint (heat_cool mode) -->
<div class="climate-setpoint-dual" role="group" aria-label="Temperature range controls">
  <div class="climate-setpoint-row" role="group" aria-label="Low temperature target">
    <button class="climate-setpoint-btn decrement"
            aria-label="Decrease low target temperature">–</button>
    <div class="climate-setpoint-display">
      <span class="climate-setpoint-label" style="color: var(--lcars-butterscotch)">LOW</span>
      <span class="climate-setpoint-value" style="color: var(--lcars-butterscotch)">
        ${targetTempLow}°${unit}
      </span>
    </div>
    <button class="climate-setpoint-btn increment"
            aria-label="Increase low target temperature">+</button>
  </div>
  <div class="climate-setpoint-row" role="group" aria-label="High temperature target">
    <button class="climate-setpoint-btn decrement"
            aria-label="Decrease high target temperature">–</button>
    <div class="climate-setpoint-display">
      <span class="climate-setpoint-label" style="color: var(--lcars-ice)">HIGH</span>
      <span class="climate-setpoint-value" style="color: var(--lcars-ice)">
        ${targetTempHigh}°${unit}
      </span>
    </div>
    <button class="climate-setpoint-btn increment"
            aria-label="Increase high target temperature">+</button>
  </div>
</div>
```

### Setpoint CSS

```css
.climate-setpoint,
.climate-setpoint-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.climate-setpoint-dual {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  width: 100%;
}

.climate-setpoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;                               /* 40px — exceeds WCAG 2.5.8 24px */
  min-width: 2.5rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.climate-setpoint-btn.decrement {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
}

.climate-setpoint-btn:hover {
  filter: brightness(1.2);
}

.climate-setpoint-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.climate-setpoint-btn:active {
  background: var(--lcars-gold);
}

.climate-setpoint-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 4rem;
}

.climate-setpoint-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.climate-setpoint-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-gold);
  text-transform: uppercase;
  font-weight: 700;
  transition: color var(--lcars-transition);
}
```

### Setpoint Adjustment Logic (JS)

```javascript
/**
 * Adjust the thermostat target temperature.
 * Respects min_temp, max_temp, and target_temp_step from the entity.
 * Applies absolute sane bounds regardless of entity-reported values.
 * (⚠ Worf Security Requirement: absolute bounds prevent malicious/buggy integrations)
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - climate entity ID
 * @param {number} delta - increment (+step) or decrement (-step)
 * @param {'temperature'|'target_temp_low'|'target_temp_high'} target - which setpoint
 */
function adjustSetpoint(hass, entityId, delta, target = 'temperature') {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const step = attrs.target_temp_step || 0.5;

  // Absolute sane bounds — never trust entity min/max alone
  const ABSOLUTE_MIN = -50;  // °F (-45°C) — no HVAC goes below this
  const ABSOLUTE_MAX = 200;  // °F (93°C) — no HVAC should go above this
  const min = Math.max(attrs.min_temp || 45, ABSOLUTE_MIN);
  const max = Math.min(attrs.max_temp || 95, ABSOLUTE_MAX);

  const current = attrs[target];
  if (current == null) return;

  const newTemp = Math.round((current + delta) / step) * step;
  const clamped = Math.max(min, Math.min(max, newTemp));

  // Enforce low < high constraint for dual setpoint
  if (target === 'target_temp_low' && attrs.target_temp_high != null) {
    if (clamped >= attrs.target_temp_high) return;
  }
  if (target === 'target_temp_high' && attrs.target_temp_low != null) {
    if (clamped <= attrs.target_temp_low) return;
  }

  hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    [target]: clamped,
  });
}
```

---
