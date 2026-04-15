## Appendix: Phase 3 Reconciliation — `_partitionPowerEntities()` (Data C-6)

Data's review noted that `_partitionPowerEntities()` is called in Wesley's `_renderPowerStrip()` code (§3.3) but never defined in either spec. Definition added here:

```js
/**
 * Partition a power device's entities into functional groups.
 * @param {Object[]} entries - Device entity entries (entity + state)
 * @returns {{ switches: Object[], powerSensors: Object[], energySensors: Object[],
 *             voltageSensors: Object[], currentSensors: Object[], diagnostics: Object[] }}
 */
_partitionPowerEntities(entries) {
  const switches = [];
  const powerSensors = [];
  const energySensors = [];
  const voltageSensors = [];
  const currentSensors = [];
  const diagnostics = [];

  for (const entry of entries) {
    if (entry.disabled_by || entry.hidden_by) continue;
    const domain = entry.entity?.entity_id?.split('.')[0];
    const dc = entry.state?.attributes?.device_class || '';
    const unit = entry.state?.attributes?.unit_of_measurement || '';

    if (domain === 'switch') {
      switches.push(entry);
    } else if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
      powerSensors.push(entry);
    } else if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
      energySensors.push(entry);
    } else if (dc === 'voltage' && unit === 'V') {
      voltageSensors.push(entry);
    } else if (dc === 'current' && unit === 'A') {
      currentSensors.push(entry);
    } else {
      diagnostics.push(entry);
    }
  }

  return { switches, powerSensors, energySensors, voltageSensors, currentSensors, diagnostics };
}
```

This follows the same pattern as `_partitionBatteryEntities()` and `_partitionEnvironmentEntities()` in the homepage card.
