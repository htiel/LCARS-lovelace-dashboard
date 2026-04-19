## 7. Auxiliary Controls Row (Fan Mode + Preset Mode)

Below the mode strip, a secondary control row for fan mode and preset selection. These are inline pill-strip selectors, more compact than the mode strip.

### Structure

```html
<div class="climate-aux-controls">
  <!-- Fan Mode (if device supports it) -->
  <div class="climate-aux-group" role="group" aria-label="Fan mode">
    <span class="climate-aux-label">FAN</span>
    <div class="climate-aux-strip" role="radiogroup" aria-label="Fan speed">
      ${fanModes.map(mode => html`
        <button class="climate-aux-btn ${mode === currentFanMode ? 'active' : ''}"
                role="radio"
                aria-checked="${mode === currentFanMode}"
                aria-label="Fan mode: ${mode}"
                @click="${() => setFanMode(mode)}">
          ${mode.toUpperCase()}
        </button>
      `)}
    </div>
  </div>

  <!-- Preset Mode (if device supports it) -->
  <div class="climate-aux-group" role="group" aria-label="Preset mode">
    <span class="climate-aux-label">PRESET</span>
    <div class="climate-aux-strip" role="radiogroup" aria-label="Preset">
      ${presetModes.map(mode => html`
        <button class="climate-aux-btn ${mode === currentPreset ? 'active' : ''}"
                role="radio"
                aria-checked="${mode === currentPreset}"
                aria-label="Preset: ${mode}"
                @click="${() => setPreset(mode)}">
          ${mode.toUpperCase()}
        </button>
      `)}
    </div>
  </div>
</div>
```

### CSS

```css
.climate-aux-controls {
  grid-area: auxctrl;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--lcars-gap) * 4);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
}

.climate-aux-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.climate-aux-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.climate-aux-strip {
  display: flex;
  gap: var(--lcars-gap);
  flex-wrap: wrap;
}

.climate-aux-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;                              /* 36px — exceeds 24px minimum */
  padding: 0 0.75rem;
  min-width: 3.5rem;                            /* WCAG 2.5.8 */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.climate-aux-btn:hover {
  filter: brightness(1.2);
}

.climate-aux-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.climate-aux-btn.active,
.climate-aux-btn[aria-checked="true"] {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}
```

### Service Calls (JS)

```javascript
/**
 * Set the fan mode via HA service call.
 */
function setFanMode(hass, entityId, fanMode) {
  hass.callService('climate', 'set_fan_mode', {
    entity_id: entityId,
    fan_mode: fanMode,
  });
}

/**
 * Set the preset mode via HA service call.
 */
function setPresetMode(hass, entityId, presetMode) {
  hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: presetMode,
  });
}
```

### Conditional Rendering

Fan mode and preset mode strips are only rendered when the device supports them:

```javascript
/**
 * Check if climate entity supports fan modes.
 */
function hasFanModes(stateObj) {
  const modes = stateObj?.attributes?.fan_modes;
  return Array.isArray(modes) && modes.length > 0;
}

/**
 * Check if climate entity supports presets.
 */
function hasPresetModes(stateObj) {
  const modes = stateObj?.attributes?.preset_modes;
  return Array.isArray(modes) && modes.length > 0;
}
```

---
