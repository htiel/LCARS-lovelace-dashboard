## Appendix C: Phase 3 Reconciliation Notes (Picard, SD 2026.04.14)

The following changes were applied during Phase 3 spec reconciliation to resolve Phase 2 conditions:

| Condition | Resolution | Section Updated |
|-----------|-----------|----------------|
| **F-1** | Renamed `getPowerDrawColor()` → `getPowerColor(watts, thresholds = {})` — matches project convention (`getTempColor`, `getHumidityColor`). Threshold-aware signature per Wesley. | §2.5 |
| **F-2** | Renamed `getPowerDrawLabel()` → `getPowerLabel(watts, thresholds = {})` — same rationale. | §2.5 |
| **C-4** | Sparkline batch size set to **20** (was 50). Reconciles with Wesley's 10. 43 circuits = 3 batches with stagger. | §4.5, §10.2 |
| **C-5** | Singleton popover pattern required. Spec defers to Wesley's addendum §2.1 for revised implementation. | See addendum |
| **C-6** | `_partitionPowerEntities()` defined in implementation plan Story 3. | See plan |
| **W-P1** | Rate limiter `createRateLimiter(10, 10000)` for power toggle calls. | See plan Story 6 |
| **C-1** | UPS edge case (battery + 1 power sensor) documented — falls through both detectors. Not fixed in 4X-3. | §5.2 (Wesley addendum) |
| **C-2** | Bundle analyzer to be run post-implementation. Delta estimated ~35 KB uncompressed. | Plan Story 10 |
