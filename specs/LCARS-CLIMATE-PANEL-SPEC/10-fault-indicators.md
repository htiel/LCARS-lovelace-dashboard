## 9. Fault Indicators

Associated `binary_sensor` entities (with device_class `problem`, `heat`, `cold`, or `connectivity`) display in the fault section. This is critical for Nest and Ecobee devices that expose diagnostic binary sensors.

### Detection Logic

```javascript
/**
 * Find binary_sensor entities associated with this climate device
 * that indicate faults or problems.
 */
function getFaultEntities(deviceEntities) {
  const FAULT_CLASSES = ['problem', 'heat', 'cold', 'connectivity',
                         'battery', 'tamper', 'smoke', 'safety'];
  return deviceEntities.filter(e => {
    const domain = e.entity_id.split('.')[0];
    if (domain !== 'binary_sensor') return false;
    const dc = e.original_device_class || e.device_class || '';
    return FAULT_CLASSES.includes(dc);
  });
}

/**
 * Check if any faults are currently active.
 */
function hasActiveFaults(hass, faultEntities) {
  return faultEntities.some(e => {
    const state = hass.states[e.entity_id];
    return state?.state === 'on';
  });
}
```

### Fault Display

```css
.climate-fault-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  padding: 0 0.5rem;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
}

.climate-fault-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.climate-fault-indicator.active {
  background: var(--lcars-tomato);
  animation: fault-pulse 1s ease-in-out infinite;
}

.climate-fault-indicator.clear {
  background: var(--lcars-disabled);
}

.climate-fault-label {
  color: var(--lcars-space-white);
  flex: 1;
}

.climate-fault-value.active {
  color: var(--lcars-tomato);
  font-weight: 700;
}

.climate-fault-value.clear {
  color: var(--lcars-disabled);
}

@keyframes fault-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .climate-fault-indicator.active {
    animation: none !important;
    /* Static thicker dot as reduced-motion alternative */
    width: 10px;
    height: 10px;
  }
}
```

### No-Fault State

When no faults are active, display a single line: `● NONE` in `--lcars-disabled` gray. This confirms the panel is monitoring, not that it lacks fault support.

---
