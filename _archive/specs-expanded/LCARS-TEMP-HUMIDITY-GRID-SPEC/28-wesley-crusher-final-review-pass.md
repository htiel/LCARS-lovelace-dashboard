## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§8 `.sensors-header-title`**: Changed `--lcars-font-subtitle` (1.5rem) → `--lcars-font-size-sub` (1.25rem) to match standardized 3-tier font system used by all other specs. Per Geordi's NEEDS CLARIFICATION #4.
- **§8 `.sensors-header-stardate`**: Changed `--lcars-font-body` (1rem) → `--lcars-font-size-data` (0.875rem).
- **§3 `.sensors-floor-label`**: Changed `--lcars-font-body` → `--lcars-font-size-data`.
- **§4 `.tile-name`**: Changed `--lcars-font-body` (1rem) → `--lcars-font-size-data` (0.875rem).
- **§9 `.summary-label`, `.summary-online`, `.summary-low`**: Changed `--lcars-font-body` → `--lcars-font-size-data`.
- **§9 `.summary-temp`, `.summary-humidity`**: Changed `--lcars-font-subtitle` (1.5rem) → `--lcars-font-size-sub` (1.25rem).
- **§15 `.sensors-empty-title`**: Changed `--lcars-font-subtitle` → `--lcars-font-size-sub`.
- **§15 `.sensors-empty-detail`**, **§4 `.tile-unavailable span`**: Changed `--lcars-font-body` → `--lcars-font-size-data`.
- **§5 Contrast Table**: Corrected `--lcars-bluey` (#8899ff) contrast from 7.1:1 (AAA) → 6.4:1 (AA). Actual WCAG-computed value is ~6.44:1 — passes AA comfortably, not AAA. Standardized across all specs per Geordi's NOTE.
- **§16 `setConfig()`**: Added `clampTemp()` and `clampPct()` validation — thresholds clamped to [-50, 200] for temperature and [0, 100] for humidity/battery. Per Worf's MUST FIX #1.
- **Appendix A**: Updated token reference to list standardized `--lcars-font-size-sub` (1.25rem) and `--lcars-font-size-data` (0.875rem) instead of legacy `--lcars-font-title`/`--lcars-font-subtitle`/`--lcars-font-body`.

### Accepted Recommendations
- **Geordi NEEDS CLARIFICATION #4** (font token consistency): Accepted and resolved. All font-size references now use the standardized `--lcars-font-size-sub` / `--lcars-font-size-data` naming convention. The legacy `--lcars-font-subtitle` (1.5rem) / `--lcars-font-body` (1rem) tokens are retired from this spec. Cross-panel font sizes are now consistent.
- **Geordi NOTE #5** (`--lcars-blue` at 4.6:1): Noted. Keeping 5 temperature tiers — the cold/cool distinction is meaningful for pipe-freeze risk (< 55°F) vs uncomfortable-but-safe (55–67°F). The dual encoding (color + numeric value) satisfies WCAG 1.4.1.
- **Worf MUST FIX #1** (threshold clamping): Accepted and implemented in `setConfig()`.
- **Worf SHOULD FIX #2** (URL-encoded entity_id): Already present in `fetchSensorHistory()` — verified.
- **Worf SHOULD FIX #3** (discard registry data after discovery): Accepted. Implementation will let registry arrays fall out of scope after `discoverSensorGroups()` completes.
- **Data P0** (replace REST history API with `recorder/statistics_during_period`): Accepted. Critical performance win — 14 HTTP round-trips → 1 WebSocket message. Implementation will use `hass.callWS({ type: 'recorder/statistics_during_period', statistic_ids: [...], period: '5minute', start_time: ... })`. `fetchSensorHistory()` in §7 to be replaced at implementation time.
- **Data P1** (build `deviceEntityMap` index): Accepted. O(n × m) → O(n + m) improvement in `discoverSensorGroups()`.
- **Data P1** (`_disposed` flag for cancelled promises): Accepted. `disconnectedCallback()` will set `this._disposed = true` and `_refreshHistory()` will check before updating `_historyData`.
- **Data P2** (extract sparkline utilities): Accepted. `sparklinePath()` and `sparklineAreaPath()` will move to shared `lcars-sparkline.js` module. Identical to atmoscrubber implementation.
- **Data P3** (`platform` config option): Accepted. Default `'switchbot'`, single-line filter change.

### Deferred Items
- **Data P0 history API migration**: The `fetchSensorHistory()` function body will be replaced during implementation with the `recorder/statistics_during_period` WebSocket call. Spec documents the current REST approach for clarity, but implementation MUST use the WS approach.
- **Data P2 shared sparkline module**: Extraction happens at implementation time, not spec-level.
- **Data P3 `platform` config option**: Implementation-phase addition. Default behavior unchanged.
- **Worf Advisory #4** (WebSocket API authorization documentation): Will add a note to the card's README/docs during implementation.
- **Worf Advisory #5** (history data volume): Resolved by Data P0 — single WS call replaces 14 HTTP calls.

### Disagreements
- None. All reviewer feedback is either accepted or reasonably deferred.

---
