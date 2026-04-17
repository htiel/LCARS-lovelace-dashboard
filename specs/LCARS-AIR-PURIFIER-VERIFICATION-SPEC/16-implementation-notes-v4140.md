## Implementation Notes (v4.14.0)

**Implemented**: 2026-04-14 | **Branch**: `4.0` | **Commit**: `4284bac`

### Changes Made

1. **CO₂ 3-tier coloring (Story 1.1)** — `_getSensorIndicatorColor()` in `lcars-homepage-card.js` (line 3466) now checks `device_class === 'carbon_dioxide'` and routes to `getCo2Color()`. The 4-tier model in §4.2 was reconciled to 3-tier (ice/sunflower/tomato) per Geordi's recommendation during Phase 2 review.

2. **Light domain routing (Story 1.2)** — `_partitionEnvironmentEntities()` in `lcars-homepage-card.js` (line ~3651) now includes `'light'` in the controls domain array, enabling BlueAir LED entities to appear as toggle controls.

### Deviations from Spec

- **§4.2 CO₂ model**: Spec originally proposed 4-tier CO₂ coloring (`getCo2Level()` with 4 bands). Reconciled to 3-tier during Phase 2 spec review per Geordi/Wesley recommendation. `getCo2Color()` in `lcars-color-utils.js` is the single source of truth. `getCo2Level()` was never implemented (DRY compliance).
- **No new code for core rendering**: Confirmed per spec's TL;DR — BlueAir devices work with zero new rendering code. Only the CO₂ color wiring and light domain routing were added.

### Review Results
- Worf: APPROVED (0 findings)
- Data: APPROVED (D-C2 verified — `getCo2Color()` no longer dead code)
- Geordi: APPROVED (3-tier colors correct)
- Wesley: APPROVED
