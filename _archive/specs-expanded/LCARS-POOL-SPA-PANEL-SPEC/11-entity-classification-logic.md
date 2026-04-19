## 10. Entity Classification Logic

```javascript
/**
 * Classify entities for the pool/spa panel.
 * Returns { pool, spa, chemistry, pumps, circuits, lights, environmental, diagnostics }.
 */
function classifyPoolEntities(entities, hassStates) {
  const result = {
    pool: null,            // climate entity for pool heat
    spa: null,             // climate entity for spa heat
    chemistry: [],         // pH, ORP, salt, saturation sensors
    pumps: [],             // pump sensors (watts, rpm, gpm)
    circuits: [],          // switch entities for circuits
    lights: [],            // light entities
    environmental: [],     // air temp, freeze, delay binary sensors
    diagnostics: [],       // entity_category: diagnostic
    intellichem: false,    // whether IntelliChem entities exist
    configEntryId: null,   // for color_mode service calls
  };

  const CHEM_KEYS = ['orp', 'ph', 'salt_tds', 'saturation',
    'orp_now', 'ph_now', 'orp_supply', 'ph_supply',
    'super_chlor', 'calcium', 'cya', 'alkalinity'];

  for (const e of entities) {
    const eid = e.entity_id;
    const domain = eid.split('.')[0];
    const cat = e.entity_category || '';

    // Climate entities — pool vs spa
    if (domain === 'climate') {
      if (eid.includes('pool')) result.pool = e;
      else if (eid.includes('spa')) result.spa = e;
      continue;
    }

    // Diagnostic entities
    if (cat === 'diagnostic' || cat === 'config') {
      // Pump sensors are diagnostic but we want them visible
      if (eid.includes('pump') && domain === 'sensor') {
        result.pumps.push(e);
      } else {
        result.diagnostics.push(e);
      }
      continue;
    }

    // Chemistry sensors
    if (domain === 'sensor' && CHEM_KEYS.some(k => eid.includes(k))) {
      result.chemistry.push(e);
      if (eid.includes('orp_now') || eid.includes('ph_now')) {
        result.intellichem = true;
      }
      continue;
    }

    // Environmental sensors and binary sensors
    if (domain === 'sensor' && eid.includes('air_temperature')) {
      result.environmental.push(e);
      continue;
    }

    if (domain === 'binary_sensor') {
      result.environmental.push(e);
      continue;
    }

    // Switch entities — circuits
    if (domain === 'switch') {
      result.circuits.push(e);
      continue;
    }

    // Light entities
    if (domain === 'light') {
      result.lights.push(e);
      continue;
    }

    // Remaining sensors
    if (domain === 'sensor') {
      result.environmental.push(e);
    }
  }

  // Sort circuits: pool pump first, spa pump second, then alphabetical
  result.circuits.sort((a, b) => {
    const aPool = a.entity_id.includes('pool') ? 0 : 1;
    const bPool = b.entity_id.includes('pool') ? 0 : 1;
    if (aPool !== bPool) return aPool - bPool;
    const aSpa = a.entity_id.includes('spa') ? 0 : 1;
    const bSpa = b.entity_id.includes('spa') ? 0 : 1;
    if (aSpa !== bSpa) return aSpa - bSpa;
    return a.entity_id.localeCompare(b.entity_id);
  });

  // Sort chemistry by display priority
  const chemPriority = ['ph_now', 'ph', 'orp_now', 'orp',
    'salt_tds', 'saturation', 'super_chlor',
    'ph_supply', 'orp_supply'];
  result.chemistry.sort((a, b) => {
    const aIdx = chemPriority.findIndex(k => a.entity_id.includes(k));
    const bIdx = chemPriority.findIndex(k => b.entity_id.includes(k));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}

/**
 * Detect whether IntelliChem chemistry data is available.
 * Determines if the chemistry column should render.
 */
function hasIntelliChem(entities) {
  return entities.some(e =>
    e.entity_id.includes('orp_now') ||
    e.entity_id.includes('ph_now') ||
    e.entity_id.includes('saturation') ||
    e.entity_id.includes('orp_supply')
  );
}

/**
 * Detect whether IntelliChlor (SCG) is available.
 * If only basic pH/ORP sensors exist without IntelliChem, show simplified view.
 */
function hasSCG(entities) {
  return entities.some(e =>
    e.entity_id.includes('salt_tds') ||
    e.entity_id.includes('super_chlor')
  );
}
```

---
