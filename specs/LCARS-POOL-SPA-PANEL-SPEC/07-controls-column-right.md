## 6. Controls Column (Right)

The right column contains circuit switches for pumps and auxiliary equipment, plus environmental status indicators.

### Structure

```
┌─────────────────┐
│  CIRCUITS        │  ← heading
│                  │
│  POOL PUMP  [■]  │  ← toggle (switch entity)
│  SPA PUMP   [□]  │  ← toggle
│  SPILLOVER  [□]  │  ← toggle
│  CLEANER    [□]  │  ← toggle
│  AUX 1      [□]  │  ← toggle
│  AUX 2      [□]  │  ← toggle
│                  │
│  ──────────────  │
│  STATUS          │  ← heading
│                  │
│  FREEZE     OFF  │  ← binary sensor readout
│  POOL DELAY OFF  │  ← binary sensor readout
│  SPA DELAY  OFF  │  ← binary sensor readout
│                  │
│  PUMP 1          │  ← pump diagnostics (if present)
│  2450 RPM        │
│  1850 W          │
│  22 GPM          │
└─────────────────┘
```

### CSS

```css
.pool-controls {
  grid-area: controls;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.pool-control-heading {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0;
}

.pool-controls-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

/* Circuit toggle row */
.pool-circuit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
  min-height: 2.25rem;                    /* WCAG 2.5.8 */
}

.pool-circuit-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-text);
  text-transform: uppercase;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* LCARS toggle — flat pill, no iOS-style slider */
.pool-circuit-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 1.75rem;
  border-radius: var(--lcars-btn-radius);
  border: none;
  cursor: pointer;
  transition: background var(--lcars-transition);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-black);
  user-select: none;
}

.pool-circuit-toggle[aria-checked="true"] {
  background: var(--lcars-gold);
}

.pool-circuit-toggle[aria-checked="false"] {
  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
}

.pool-circuit-toggle:hover {
  filter: brightness(1.2);
}

.pool-circuit-toggle:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Pump diagnostic readouts (sub-data, dimmer) */
.pool-pump-stats {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-left: 0.5rem;
}

.pool-pump-stat {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-data-accent);
  text-transform: uppercase;
}
```

### Circuit Toggle Logic

```javascript
/**
 * Toggle a ScreenLogic switch entity (pump, aux circuit, etc.).
 */
function toggleCircuit(hass, entityId) {
  const stateObj = hass.states[entityId];
  if (!stateObj) return;

  const domain = entityId.split('.')[0];
  const service = stateObj.state === 'on' ? 'turn_off' : 'turn_on';

  hass.callService(domain, service, {
    entity_id: entityId,
  });
}
```

### Status Indicator Readouts

Binary sensor status lines use the standard `.device-sensor-line` pattern from Device Panel Spec §3.3.

```javascript
/**
 * Get color for an environmental binary sensor.
 */
function getEnvBinaryColor(entityId, state) {
  if (state === 'unavailable') return 'var(--lcars-alert)';
  if (entityId.includes('freeze')) {
    return state === 'on' ? 'var(--lcars-ice)' : 'var(--lcars-disabled)';
  }
  if (entityId.includes('alarm') || entityId.includes('fault')) {
    return state === 'on' ? 'var(--lcars-alert)' : 'var(--lcars-disabled)';
  }
  return state === 'on' ? 'var(--lcars-sunflower)' : 'var(--lcars-disabled)';
}
```

---
