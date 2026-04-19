## 10. Migration & Backward Compatibility

### 10.1 What Changes

| Component | Before | After |
|-----------|--------|-------|
| `_renderAreaContent()` | Power devices → `panelDevices[]` → right column | Power devices → `powerGroups[]` → consolidated left column |
| `_renderPowerPanel(group)` | Called once per power device | **Deprecated** — replaced by `_renderConsolidatedPowerPanel(collection)` |
| `_renderDevicePanel()` switch | `case PANEL_TYPE_POWER:` dispatches to `_renderPowerPanel` | Remove the `PANEL_TYPE_POWER` case (power never reaches this function) |
| `_renderCircuitTile()` | Unchanged logic | Enhanced with per-metric `_renderClickableValue()` wrappers |
| `_renderPowerStrip()` | Called inside `_renderPowerPanel()` with empty children array | Called inside consolidated panel with actual children from `_buildPowerCollection()` |
| `_renderStripChild()` | Unchanged logic | Enhanced with per-metric click targets |

### 10.2 What Stays the Same

- `_classifyPowerDevice()` — unchanged
- `_partitionPowerEntities()` — unchanged
- `_getPrimaryPower()` / `_getPrimaryEnergy()` — unchanged
- `_detect240VPairs()` / `_sortCircuits()` — unchanged
- `_renderPowerSummaryCard()` — unchanged
- `_renderPowerArc()` — unchanged (called differently but same renderer)
- `getPowerColor()` / `getPowerLabel()` in `lcars-color-utils.js` — unchanged
- `_showCircuitPopover()` — unchanged
- `_powerToggleLimiter` — unchanged (Worf-approved rate limiting still in effect)
- All CSS variables and color tokens — unchanged

### 10.3 Old `_renderPowerPanel()` Disposition

Keep the method body but mark as `@deprecated`. If we ever need per-device power rendering (e.g., a future "detail view" drill-down), it's available. For v4.15.2, it simply won't be called from the normal rendering path.

---
