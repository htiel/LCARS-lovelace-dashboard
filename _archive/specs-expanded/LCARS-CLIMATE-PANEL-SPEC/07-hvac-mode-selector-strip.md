## 6. HVAC Mode Selector Strip

A horizontal row of pill buttons for selecting the HVAC mode. Only modes supported by the device are rendered (from the `hvac_modes` attribute).

### Structure

```html
<div class="climate-mode-strip" role="radiogroup" aria-label="HVAC mode selector">
  ${supportedModes.map(mode => html`
    <button class="climate-mode-btn ${mode === currentMode ? 'active' : ''}"
            role="radio"
            aria-checked="${mode === currentMode}"
            aria-label="${getModeLabel(mode)} mode"
            style="--mode-color: ${getClimateModeColor(mode)}"
            @click="${() => setHvacMode(mode)}">
      <ha-icon icon="${getModeIcon(mode)}" aria-hidden="true"></ha-icon>
      ${getModeLabel(mode)}
    </button>
  `)}
</div>
```

### CSS

```css
.climate-mode-strip {
  grid-area: modes;
  display: flex;
  flex-wrap: wrap;
  gap: var(--lcars-gap);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.climate-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: var(--lcars-btn-height);             /* 3rem = 48px */
  padding: 0 0.75rem 0 0.5rem;
  min-width: 5rem;                             /* WCAG 2.5.8 */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  white-space: nowrap;
  user-select: none;
}

.climate-mode-btn:hover {
  filter: brightness(1.2);
}

.climate-mode-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active mode — uses dynamic mode color */
.climate-mode-btn.active,
.climate-mode-btn[aria-checked="true"] {
  background: var(--mode-color, var(--lcars-gold));
  color: var(--lcars-black);
}

.climate-mode-btn ha-icon {
  --mdc-icon-size: 16px;
  flex-shrink: 0;
}
```

### Mode Icons & Labels

```javascript
/**
 * Get the MDI icon for an HVAC mode.
 */
function getModeIcon(mode) {
  switch (mode) {
    case 'heat':      return 'mdi:fire';
    case 'cool':      return 'mdi:snowflake';
    case 'heat_cool': return 'mdi:sun-snowflake-variant';
    case 'auto':      return 'mdi:thermostat-auto';
    case 'dry':       return 'mdi:water-percent';
    case 'fan_only':  return 'mdi:fan';
    case 'off':       return 'mdi:power';
    default:          return 'mdi:thermostat';
  }
}

/**
 * Get the LCARS-style uppercase label for an HVAC mode.
 */
function getModeLabel(mode) {
  switch (mode) {
    case 'heat':      return 'HEAT';
    case 'cool':      return 'COOL';
    case 'heat_cool': return 'HEAT/COOL';
    case 'auto':      return 'AUTO';
    case 'dry':       return 'DRY';
    case 'fan_only':  return 'FAN';
    case 'off':       return 'OFF';
    default:          return mode.toUpperCase().replace(/_/g, ' ');
  }
}

/**
 * Set the HVAC mode via HA service call.
 */
function setHvacMode(hass, entityId, mode) {
  hass.callService('climate', 'set_hvac_mode', {
    entity_id: entityId,
    hvac_mode: mode,
  });
}
```

---
