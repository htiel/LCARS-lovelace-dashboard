## Implementation Notes (v4.14.0)

**Implemented**: 2026-04-14 | **Branch**: `4.0` | **Commit**: `4284bac`  
**File**: `custom_components/lcars_dashboard/js/src/lcars-internal-sensors-grid.js` (608 lines)  
**Bundle delta**: +17,611 bytes (17.2 KB) — 341,412 bytes total

### Deviations from Spec

1. **Discovery (D-C1)**: Spec's `discoverSensorGroups()` used 4 `hass.callWS()` registry calls. Implementation uses `hass.entities/.devices/.areas/.floors` object properties instead — zero WebSocket calls for discovery, per Data's D-C1 condition.

2. **Entity scope generalized**: Spec targeted SwitchBot meters specifically. Implementation discovers ANY device with `temperature` + `humidity` sensor entities (regardless of platform/manufacturer), excluding devices with `fan`/`climate`/`air_quality` domain siblings. Works with SwitchBot, Aqara, Zigbee sensors, etc.

3. **Appliance exclusion expanded**: Spec had `fridge|freezer|wine cooler|kegerator|deep freeze`. Implementation added `refrigerator` per Wesley's Phase 6 review.

4. **Sparkline integration (W-R2)**: Spec's `fetchSensorHistory()` REST approach was replaced with shared `fetchSparklineData()` WebSocket fetcher from `lcars-sparkline.js`, per Worf's W-R2 condition.

5. **Singular/plural**: Summary row displays "1 SENSOR ONLINE" vs "N SENSORS ONLINE" — added during Phase 6 per Wesley's suggestion.

6. **Stagger cap**: Tile entrance animation delay capped at 20 tiles (`min(index, 20) * 50ms`) to prevent excessive delays on 50+ sensor grids — added during Phase 6 per Wesley's suggestion.

7. **UNASSIGNED floor sort**: Sentinel changed from `999` to `-999` so unassigned devices sort last in descending floor-level order — bug fix during Phase 6.

8. **Bundle size**: Original estimate was 3-5 KB. Actual delta was 17.2 KB for 608 lines with full responsive CSS, animations, accessibility, and discovery logic. Data approved: ~29 bytes/source-line is proportional. Planning methodology updated.

### Bugs Fixed During Review (Phase 6)

- **Sparkline data format**: `_getSparklinePoints()` was pre-extracting `.mean` to flat numbers, but `renderSparkline()` expects `{mean}` objects. Fixed by returning raw stats array.
- **Floor sort order**: `floorLevel: 999` for UNASSIGNED sorted first (top) in descending sort. Fixed by using `-999`.

### Review Results
- Worf: APPROVED (W-R1/W-R2 verified, 0 security findings)
- Data: APPROVED (D-C1/D-C2/D-C3/D-C4 verified, bundle acceptable)
- Geordi: APPROVED (all 10 design/accessibility checkpoints pass)
- Wesley: APPROVED WITH CONDITIONS → all 2 bugs fixed, 3 suggestions applied
