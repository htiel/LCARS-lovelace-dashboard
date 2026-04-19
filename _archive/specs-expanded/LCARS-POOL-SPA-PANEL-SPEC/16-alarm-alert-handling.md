## 15. Alarm & Alert Handling

ScreenLogic's IntelliChem provides multiple alarm and limit binary sensors. These need prominent visual treatment.

### Alarm Priority Display

When any alarm binary sensor is `on`, the panel shows a consolidated alert in the header:

```javascript
/**
 * Check all IntelliChem alarm/alert binary sensors.
 * Returns array of active alarms for display.
 */
function getActiveAlarms(entities, hassStates) {
  const ALARM_ENTITIES = [
    { pattern: 'flow_alarm',        label: 'FLOW ALARM' },
    { pattern: 'orp_high_alarm',    label: 'ORP HIGH' },
    { pattern: 'orp_low_alarm',     label: 'ORP LOW' },
    { pattern: 'ph_high_alarm',     label: 'PH HIGH' },
    { pattern: 'ph_low_alarm',      label: 'PH LOW' },
    { pattern: 'probe_fault',       label: 'PROBE FAULT' },
    { pattern: 'orp_chem_limit',    label: 'ORP LIMIT' },
    { pattern: 'ph_chem_limit',     label: 'PH LIMIT' },
    { pattern: 'ph_lockout',        label: 'PH LOCKOUT' },
  ];

  const active = [];
  for (const alarm of ALARM_ENTITIES) {
    const entity = entities.find(e => e.entity_id.includes(alarm.pattern));
    if (entity) {
      const state = hassStates[entity.entity_id];
      if (state && state.state === 'on') {
        active.push(alarm.label);
      }
    }
  }
  return active;
}
```

### Alert Header Badge

When alarms are active, a tomato-colored alert badge appears in the header:

```css
.pool-header-alert {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-alert);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  animation: pool-alert-pulse 1s ease-in-out infinite;
}

@keyframes pool-alert-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .pool-header-alert {
    animation: none !important;
    opacity: 1;
    text-decoration: underline;  /* Static alternative to pulse */
  }
}
```

---
