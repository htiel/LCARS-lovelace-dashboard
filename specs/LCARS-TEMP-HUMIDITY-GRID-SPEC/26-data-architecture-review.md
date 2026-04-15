## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- This is a **standalone card** (`custom:lcars-internal-sensors-grid`), NOT a device panel extension. It does not extend `LcarsDevicePanelBase`. This is architecturally correct — the sensors grid aggregates data across multiple devices and areas, which is a fundamentally different pattern from a single-device panel. It registers via `customElements.define()` and `window.customCards.push()`, following the standard Lovelace custom card pattern.
- The auto-discovery algorithm (§7, `discoverSensorGroups()`) issues 4 parallel WebSocket calls (`entity_registry/list`, `device_registry/list`, `area_registry/list`, `floor_registry/list`) on initialization. These are fetched via `Promise.all()`, which is correct. However, the HA entity and device registries can be large (500+ entities, 100+ devices). The `entities.filter()` loop iterates the full entity list once to find SwitchBot temperature entities, then iterates again per device to find siblings. **Advisory**: Build a `Map<deviceId, entity[]>` index first, then look up siblings in O(1) instead of O(n) per device.
- The floor grouping (`groupByFloor()`) is clean and efficient. The `Map` preserves insertion order (floor-level-sorted). Good use of ES6 data structures.
- The `LitElement` class skeleton (§16) correctly defines `hass`, `config`, `_sensorGroups`, and `_historyData` as reactive properties. The `getCardSize()` calculation is a reasonable heuristic for Lovelace layout.

### Performance Considerations
- **History API calls**: With `show_sparklines: true`, the card fetches 24-hour history for each of 14 temperature entities every 15 minutes. This is 14 HTTP API calls per refresh. The HA history API returns the full state history for the period, which is then downsampled to ~96 points. **Critical advisory**: Use `hass.callWS({ type: 'recorder/statistics_during_period' })` instead of the REST API `history/period/`. The WebSocket statistics endpoint returns pre-aggregated data (5-minute intervals) which is:
  - ~20x smaller response payload (96 pre-computed statistics vs ~2000 raw state changes)
  - Served from HA's statistics database (indexed) vs the raw event log
  - Already downsampled — no client-side `filter((_, i) => i % interval === 0)` needed
  This is the same approach used by the atmoscrubber sparklines. The REST API approach works but is significantly less efficient for 14 concurrent fetches.
- **Concurrent history fetches**: `Promise.all(this._sensorGroups.map(async (group) => fetchSensorHistory(...)))` fires 14 parallel HTTP calls. This could overwhelm the HA HTTP server on resource-constrained installations (RPi 3/4). **Advisory**: Use a concurrency limiter — fetch in batches of 4-5. Or, better yet, use the statistics endpoint which supports multiple entity IDs in a single call.
- **Tile stagger animation** (§12): 14 tiles with 50ms stagger = 700ms total cascade. Each tile's `tile-appear` animation is 300ms. CSS-only, GPU-compositable (`opacity` + `transform`). Acceptable.
- **SVG sparklines**: 14 sparklines at 100×16 viewBox, ~96 path segments each. Total SVG complexity: ~1,344 path segments. Modern browsers handle this trivially. No concern.
- **Bundle impact estimate**: ~5.5 KiB minified/gzipped. The discovery algorithm, sparkline generation, and tile rendering logic are the main contributors. No external dependencies. Roughly 2.7% of the 203 KiB bundle.

### HA Integration Patterns
- The 4 registry WebSocket calls (`config/entity_registry/list`, etc.) are the correct API for entity and device discovery. These are standard HA frontend WebSocket commands used by the HA core frontend itself.
- The `hass.callApi('GET', 'history/period/...')` REST call in `fetchSensorHistory()` (§7) is functional but suboptimal. Replace with `hass.callWS({ type: 'recorder/statistics_during_period', ... })` as noted above.
- The `hass-more-info` custom event dispatch in `handleTileTap()` (§13) is the correct pattern for opening entity dialogs. The event is `composed: true` and `bubbles: true`, which correctly crosses shadow DOM boundaries.
- Entity filtering by `e.platform === 'switchbot'` is correct for auto-discovery of SwitchBot meters. This is a platform-specific filter — it will NOT discover non-SwitchBot temperature sensors. This is intentional per the spec. However, the spec should document this limitation explicitly, or offer a `platform` config option to support other Bluetooth sensor brands (e.g., Xiaomi/Aqara meters).

### Code Quality & Reusability
- **DRY**: `sparklinePath()` and `sparklineAreaPath()` are explicitly noted as reused from the Atmoscrubber Spec §7. Good. These should be extracted to a shared `lcars-sparkline.js` utility module during implementation.
- **DRY**: `getTempColor()`, `getHumidityColor()`, and `computeAverage()` are grid-specific but follow the same threshold pattern used in pool chemistry. The generic `thresholdColor()` helper recommended in the pool review could serve here too.
- **KISS**: The card does one thing well — display temperature and humidity across rooms. No over-engineering. The optional features (`show_sparklines`, `show_averages`, `group_by_floor`) are all disabled by checking booleans in `render()`. Clean.
- **Discovery reusability**: The `discoverSensorGroups()` function is tightly coupled to SwitchBot meters (`e.platform === 'switchbot'`). If future specs need similar discovery for other device types, extract the registry fetch + device grouping logic to a shared utility, parameterized by platform and device class.
- **Config schema**: The YAML schema is clean with sensible defaults. `temp_comfort_min`/`max` as configurable thresholds is the correct approach for a multi-household product.

### Recommendations
1. **P0 (Critical)**: Replace `hass.callApi('GET', 'history/period/...')` with `hass.callWS({ type: 'recorder/statistics_during_period', statistic_ids: [...], period: '5minute', start_time: ... })`. This single WebSocket call can fetch statistics for ALL 14 entities at once, replacing 14 HTTP calls with 1 WebSocket message. Estimated improvement: 14 HTTP round-trips (~700ms) → 1 WebSocket message (~50ms). 93% reduction in fetch latency.
2. **P1**: In `discoverSensorGroups()`, build a `deviceEntityMap = new Map()` from the full entity list before the per-device loop. Replace `entities.filter(e => e.device_id === deviceId)` with `deviceEntityMap.get(deviceId)`. This reduces entity discovery from O(n × m) to O(n + m) where n = total entities and m = temperature entities.
3. **P1**: Clean up `_historyInterval` in `disconnectedCallback()` — already correctly specified in §17. Verify this also cancels any in-flight `Promise.all()` from `_refreshHistory()` by setting a `this._disposed = true` flag checked before updating `this._historyData`.
4. **P2**: Extract `sparklinePath()` and `sparklineAreaPath()` to a shared `lcars-sparkline.js` module. They are already identical to the atmoscrubber's implementation.
5. **P3**: Add a `platform` config option (default: `'switchbot'`) to allow non-SwitchBot Bluetooth temperature sensors. This is a 1-line filter change but broadens the card's utility significantly.

---
