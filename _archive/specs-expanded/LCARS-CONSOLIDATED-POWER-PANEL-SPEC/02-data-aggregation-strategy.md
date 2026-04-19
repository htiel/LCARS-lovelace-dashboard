## 1. Data Aggregation Strategy

### 1.1 Intercept in `_renderAreaContent()`

Currently (line ~6759 of `lcars-homepage-card.js`):

```js
for (const group of byDevice.values()) {
  const panelType = this._getDevicePanelType(group.entities);
  if (panelType) {
    panelDevices.push({ ...group, panelType });
  } else {
    normalDevices.push(group);
  }
}
```

**Change**: Collect power groups separately instead of pushing them into `panelDevices`:

```js
const panelDevices = [];
const normalDevices = [];
const powerGroups = [];  // ← NEW: collect all power devices for this area

for (const group of byDevice.values()) {
  const panelType = this._getDevicePanelType(group.entities);
  if (panelType === PANEL_TYPE_POWER) {
    powerGroups.push({ ...group, panelType, subType: this._classifyPowerDevice(group.entities, group.device) });
  } else if (panelType) {
    panelDevices.push({ ...group, panelType });
  } else {
    normalDevices.push(group);
  }
}
```

### 1.2 Build Consolidated Power Collection

After the loop, aggregate power groups into a structured collection:

```js
// Aggregate all power device groups for this area
const powerCollection = powerGroups.length > 0
  ? this._buildPowerCollection(powerGroups)
  : null;
```

### 1.3 `_buildPowerCollection(powerGroups)` — New Method

This method takes all power device groups for an area and organizes them by type:

```js
_buildPowerCollection(powerGroups) {
  const vueCircuits = [];
  const plugs = [];
  const stripParents = [];
  const stripChildren = new Map(); // keyed by parent device ID

  // First pass: classify each device group
  for (const group of powerGroups) {
    switch (group.subType) {
      case 'vue':
        vueCircuits.push(group);
        break;
      case 'strip':
        stripParents.push(group);
        stripChildren.set(group.device.id, []);
        break;
      case 'plug':
        plugs.push(group);
        break;
      default:
        // Sensor-only devices without switches — treat as circuits
        vueCircuits.push(group);
        break;
    }
  }

  // Second pass: assign plug children to strip parents via via_device_id
  const orphanPlugs = [];
  for (const plug of plugs) {
    const parentId = plug.device?.via_device_id;
    if (parentId && stripChildren.has(parentId)) {
      stripChildren.get(parentId).push(plug);
    } else {
      orphanPlugs.push(plug);
    }
  }

  // Process circuits: detect 240V pairs, sort by power descending
  const processedCircuits = this._sortCircuits(this._detect240VPairs(vueCircuits));

  // Compute area-wide totals
  const allGroups = [...vueCircuits, ...orphanPlugs, ...stripParents];
  const totalWatts = allGroups.reduce((sum, g) => sum + (this._getPrimaryPower(g) || 0), 0);
  const totalEnergy = allGroups.reduce((sum, g) => sum + (this._getPrimaryEnergy(g) || 0), 0);

  // Build strip objects with children attached
  const strips = stripParents.map(parent => ({
    parent,
    children: stripChildren.get(parent.device.id) || [],
  }));

  return {
    circuits: processedCircuits,
    plugs: orphanPlugs,
    strips,
    totalWatts,
    totalEnergy,
    deviceCount: powerGroups.length,
  };
}
```

**Key design decisions**:
- Strip child assignment uses HA's `via_device_id` — this is how TP-Link HS300 outlets relate to their parent strip. No heuristic name matching.
- Plugs that don't belong to any strip parent are "orphan plugs" — rendered in the MONITORED DEVICES section.
- Vue circuits and sensor-only devices are combined — they render identically as circuit tiles.
- 240V pair detection reuses the existing `_detect240VPairs()` method unchanged.

---
