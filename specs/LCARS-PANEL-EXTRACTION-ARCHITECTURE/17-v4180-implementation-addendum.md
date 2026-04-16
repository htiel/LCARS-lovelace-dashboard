## v4.18.0 Implementation Addendum — Panel Extraction Architecture

**Backlog Items**: 4X-22 (load_dashboard.py Parametric), 4X-23 (Config Flow Schema Prep), 4X-14 (linkedEntities), 4X-19 (Frame-Mode — stub only)
**Status**: IMPLEMENTED — v4.18.0
**Date**: 2026-04-16

---

### A1. `load_dashboard.py` — Parametric Registration (4X-22)

Refactored `load_dashboard()` to extract `_register_single_dashboard(hass, url, yaml_path, title, icon)`.

**Before**: Hardcoded single dashboard registration with inline values.
**After**: `load_dashboard()` calls `_register_single_dashboard()` once with current defaults. The function validates YAML path existence before registration (early return on missing file). Selective logging added per Worf review.

**File**: `custom_components/lcars_dashboard/load_dashboard.py`

**5.x Enablement**: A loop calling `_register_single_dashboard()` N times registers multiple dashboards. The 5.x work becomes config + YAML, not plumbing.

---

### A2. Config Flow Schema Prep (4X-23)

Added `CONF_DASHBOARDS` and `DEFAULT_DASHBOARDS` constants to `const.py`. Updated `config_flow.py` imports.

**Files**: `custom_components/lcars_dashboard/const.py`, `config_flow.py`

**Schema**: `dashboards` key defaults to `["habitat"]`. Not exposed in options UI during 4.x.

**5.x Enablement**: Adding dashboard checkboxes in 5.x is a UI change, not a data model change.

---

### A3. `LcarsBasePanel.linkedEntities` Property (4X-14)

Added `linkedEntities` property (Array) to `LcarsBasePanel` with constructor default `[]`.

**New method**: `_getAllEntities()` — merges `this.group?.entities` with `this.linkedEntities`. Linked entries carry `_linked: true` provenance flag for optional source indicators (e.g., `[W]` pill for WaterGuru entities in pool panel).

**Usage pattern**:
```js
renderContent() {
  const allEntities = this._getAllEntities();  // own + linked, linked have _linked: true
  const { sensors, controls } = this._partitionEntities(allEntities);
}
```

**File**: `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`

**5.x Enablement**: Panels can aggregate entities from multiple devices/areas without architecture changes.

---

### A4. Architecture Diagram Update

```
LitElement
  └── LcarsBasePanel                 (shared frame, linkedEntities, _getAllEntities)
        ├── LcarsCameraPanel
        ├── LcarsEnvironmentPanel
        ├── LcarsBatteryPanel
        ├── LcarsClimatePanel        ← v4.18.0 Visual Refresh (4X-8)
        ├── LcarsAlarmPanel
        ├── LcarsMediaPanel
        ├── LcarsPoolSpaPanel        ← v4.18.0 Visual Refresh (4X-9), uses linkedEntities
        ├── LcarsWeatherPanel
        ├── LcarsIrrigationPanel
        └── LcarsPowerPanel
```

### A5. Shared Component Registry Update

| Component | File | Added In |
|-----------|------|----------|
| `<lcars-panel-frame>` | `components/lcars-panel-frame/` | 4X-4 (v4.17.0) |
| `<lcars-sensor-row>` | `components/lcars-sensor-row/` | 4X-4 (v4.17.0) |
| `<lcars-section-divider>` | `components/lcars-section-divider/` | 4X-4 (v4.17.0) |
| `<lcars-option-strip>` | `components/lcars-option-strip/` | 4X-4 (v4.17.0) |
| `<lcars-setpoint>` | `components/lcars-setpoint/` | 4X-4 (v4.17.0) |
| **`<lcars-segmented-bar>`** | **`components/lcars-segmented-bar/`** | **4X-16 (v4.18.0)** |

### A6. Shared Utility Registry Update

| Module | File | Added In |
|--------|------|----------|
| `lcars-hierarchy-utils.js` | `js/src/shared/lcars-hierarchy-utils.js` | 4X-12 (v4.18.0) |

Exports: `getFloors(hass)`, `getFloorAreas(hass, floorId)`, `getAreasByFloor(hass)`, `getSiblingAreas(hass, areaId)`.
