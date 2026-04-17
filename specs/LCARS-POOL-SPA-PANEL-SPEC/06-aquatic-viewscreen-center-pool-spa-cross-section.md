## 5. Aquatic Viewscreen (Center) — Pool & Spa Cross-Section

The centerpiece: two side-by-side water body visualizations showing temperature, heating state, and setpoint controls. These are the "viewscreens" — the dominant visual element.

### 5.1 Body Viewscreen Structure

Each body (pool/spa) is rendered as a framed rectangle with:
- A large current temperature readout at the top
- Setpoint controls (–/+) below the temperature
- A water visualization area with animated particles
- A heat mode indicator below the frame

```html
<div class="pool-aquatics" role="group" aria-label="Pool and spa water bodies">
  <!-- Pool Body -->
  <div class="pool-body-viewscreen"
       data-body="pool"
       role="region"
       aria-label="Pool: ${poolTemp} degrees, target ${poolTarget} degrees">
    <div class="pool-body-frame" style="border-color: ${poolColor}">
      <!-- Corner brackets -->
      <div class="pool-body-temp" style="color: ${poolColor}">
        <span class="pool-body-label">POOL</span>
        <span class="pool-body-value">${poolTemp}°${unit}</span>
      </div>
      <div class="pool-body-setpoint" role="group" aria-label="Pool target temperature">
        <button class="pool-setpoint-btn decrement"
                aria-label="Decrease pool target temperature">–</button>
        <div class="pool-setpoint-display">
          <span class="pool-setpoint-label">TGT</span>
          <span class="pool-setpoint-value">${poolTarget}°</span>
        </div>
        <button class="pool-setpoint-btn increment"
                aria-label="Increase pool target temperature">+</button>
      </div>
      <!-- Water visualization -->
      <div class="pool-water-viz" aria-hidden="true">
        <div class="pool-water-particles"></div>
        <div class="pool-water-surface"></div>
      </div>
    </div>
    <div class="pool-body-heat-badge" style="color: ${heatModeColor}">
      HEAT: ${heatModeLabel}
    </div>
  </div>

  <!-- Spa Body (same structure) -->
  <div class="pool-body-viewscreen"
       data-body="spa"
       role="region"
       aria-label="Spa: ${spaTemp} degrees, target ${spaTarget} degrees">
    <!-- ... identical structure, different entity bindings ... -->
  </div>
</div>
```

### 5.2 Viewscreen CSS

```css
.pool-aquatics {
  grid-area: aquatics;
  display: flex;
  gap: calc(var(--lcars-gap) * 4);
  justify-content: center;
  align-items: start;
  padding: 0.5rem 0;
}

.pool-body-viewscreen {
  flex: 1;
  max-width: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lcars-gap);
}

.pool-body-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 3px solid var(--lcars-ice);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 0.5rem 0;
  gap: 0.5rem;

  transition: border-color var(--lcars-transition-slow);
}

/* Spa frame uses warm border */
.pool-body-viewscreen[data-body="spa"] .pool-body-frame {
  border-color: var(--spa-color, var(--lcars-butterscotch));
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.pool-body-frame::before,
.pool-body-frame::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-style: solid;
  pointer-events: none;
  z-index: 1;
}

.pool-body-frame::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-color: inherit;
  border-radius: 0.25rem 0 0 0;
}

.pool-body-frame::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-color: inherit;
  border-radius: 0 0 0.25rem 0;
}

/* Temperature display */
.pool-body-temp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  z-index: 1;
}

.pool-body-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--lcars-space-white);
}

.pool-body-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  text-transform: uppercase;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

/* Setpoint controls */
.pool-body-setpoint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  z-index: 1;
}

.pool-setpoint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;                              /* 36px — exceeds WCAG 2.5.8 24px */
  min-width: 2.25rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.pool-setpoint-btn.decrement {
  border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius);
}

.pool-setpoint-btn.increment {
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;
}

.pool-setpoint-btn:hover {
  filter: brightness(1.2);
}

.pool-setpoint-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.pool-setpoint-btn:active {
  background: var(--lcars-gold);
}

.pool-setpoint-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-width: 2.5rem;
}

.pool-setpoint-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);  /* 0.875rem — corrected per Geordi: 0.6rem violated Rule 6 */
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.pool-setpoint-value {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-gold);
  text-transform: uppercase;
  font-weight: 700;
}

/* Heat mode badge below viewscreen */
.pool-body-heat-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.05em;
  padding-top: 0.25rem;
  border-top: 1px solid var(--panel-frame-color);
  width: 100%;
  text-align: center;
  transition: color var(--lcars-transition-slow);
}
```

### 5.3 Water Visualization

The lower portion of each viewscreen shows an animated water effect — slow-drifting particles that suggest water movement. Pool particles are cool-blue, spa particles are warm-amber.

```css
.pool-water-viz {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  overflow: hidden;
  pointer-events: none;
}

/* Water surface line — subtle horizontal gradient */
.pool-water-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--pool-color, var(--lcars-ice));
  opacity: 0.4;
}

.pool-body-viewscreen[data-body="spa"] .pool-water-surface {
  background: var(--spa-color, var(--lcars-butterscotch));
}

/* Water particles — drift horizontally */
.pool-water-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--pool-color, var(--lcars-ice));
  opacity: 0;
  animation: pool-particle-drift var(--pool-particle-speed, 8s) ease-in-out infinite;
}

.pool-body-viewscreen[data-body="spa"] .pool-water-particle {
  background: var(--spa-color, var(--lcars-butterscotch));
}

.pool-water-particle.lg {
  width: 5px;
  height: 5px;
}

@keyframes pool-particle-drift {
  0% {
    transform: translateX(-20%) translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.25;
    transform: translateX(50%) translateY(var(--pool-particle-sway, -0.5rem));
  }
  85% {
    opacity: 0.15;
  }
  100% {
    transform: translateX(120%) translateY(0);
    opacity: 0;
  }
}

/* Heating active — particles drift upward (convection) */
.pool-body-viewscreen[data-heating] .pool-water-particle {
  animation-name: pool-particle-convection;
}

@keyframes pool-particle-convection {
  0% {
    transform: translateX(0) translateY(100%);
    opacity: 0;
  }
  15% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.35;
    transform: translateX(var(--pool-particle-sway, 0.5rem)) translateY(30%);
  }
  85% {
    opacity: 0.15;
  }
  100% {
    transform: translateX(0) translateY(-20%);
    opacity: 0;
  }
}

/* Reduced motion — static particles */
@media (prefers-reduced-motion: reduce) {
  .pool-water-particle {
    animation: none !important;
    opacity: 0.2;
  }
}
```

### 5.4 Water Particle Configuration

```javascript
/**
 * Generate particle elements for a water body visualization.
 * @param {string} bodyType - 'pool' or 'spa'
 * @returns {Array<{top, left, delay, speed, sway, size}>} particle configs
 */
function generateWaterParticles(bodyType) {
  const count = 6;
  return Array.from({ length: count }, (_, i) => ({
    top: `${20 + Math.random() * 70}%`,
    left: `${Math.random() * 80}%`,
    delay: `${(i * 1.2) + Math.random()}s`,
    speed: `${6 + Math.random() * 4}s`,
    sway: `${-0.5 + Math.random()}rem`,
    size: i < 2 ? 'lg' : '',
  }));
}
```

### 5.5 Setpoint Adjustment Logic

```javascript
/**
 * Adjust pool or spa target temperature.
 * ScreenLogic climate entities support standard climate.set_temperature.
 * Applies absolute sane bounds for aquatic bodies.
 * (⚠ Worf Security Requirement: absolute bounds for aquatic setpoints)
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - climate.pool_heat or climate.spa_heat
 * @param {number} delta - increment (+step) or decrement (-step)
 */
function adjustPoolSetpoint(hass, entityId, delta) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const attrs = stateObj.attributes;
  const step = attrs.target_temp_step || 1;

  // Absolute sane bounds for aquatic bodies
  const ABSOLUTE_MIN = 32;   // °F (0°C) — never below freezing
  const ABSOLUTE_MAX = 120;  // °F (49°C) — never above scald risk
  const min = Math.max(attrs.min_temp || 40, ABSOLUTE_MIN);
  const max = Math.min(attrs.max_temp || 104, ABSOLUTE_MAX);

  const current = attrs.temperature;
  if (current == null) return;

  const newTemp = Math.round((current + delta) / step) * step;
  const clamped = Math.max(min, Math.min(max, newTemp));

  hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    temperature: clamped,
  });
}

/**
 * Set the heat mode (preset) for a pool/spa body.
 * ScreenLogic uses preset_mode: heater, solar, solar_preferred, off.
 */
function setHeatMode(hass, entityId, presetMode) {
  hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: presetMode,
  });
}

/**
 * Toggle heater on/off for a pool/spa body.
 */
function toggleHeater(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const currentMode = stateObj.state;
  if (currentMode === 'off') {
    hass.callService('climate', 'set_hvac_mode', {
      entity_id: entityId,
      hvac_mode: 'heat',
    });
  } else {
    hass.callService('climate', 'set_hvac_mode', {
      entity_id: entityId,
      hvac_mode: 'off',
    });
  }
}
```

---
