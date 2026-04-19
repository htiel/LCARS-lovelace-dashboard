## 10. Data Flow

### 10.1 Entity Subscription

The panel subscribes to state changes for:
- All `sensor.*` entities in the area with `device_class` in `POWER_DEVICE_CLASSES`
- All `switch.*` entities in the area that share a `device_id` with a power sensor

Uses the existing `_getAreaEntities(areaId)` pattern from the homepage card, filtered by `classifyPowerDevice()`.

### 10.2 Sparkline Data

- Fetched via `fetchSparklineData()` from `lcars-sparkline.js`
- Entities: `*_power_minute_average` (Vue), `*_current_consumption` (Kasa)
- Period: 24 hours
- Max entities per batch: 20 (reconciled per Data C-4)
- Cache key: `'power-panel'`
- Refresh: On `firstUpdated()` and when `_sensorGroups` changes

### 10.3 Value Formatting

| Metric | Format | Examples |
|--------|--------|---------|
| Watts | `Intl.NumberFormat` with grouping | `342 W`, `4,872 W` |
| kWh | 1 decimal place | `47.3 kWh` |
| Voltage | 0 decimal places | `122 V` |
| Current | 1 decimal place | `3.2 A` |

---
