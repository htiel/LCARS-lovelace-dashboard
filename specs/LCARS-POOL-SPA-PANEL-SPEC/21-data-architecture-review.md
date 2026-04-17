## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- This is the most complex panel in the spec suite. The 3-column full-width layout (`chemistry | aquatics | controls`) is a justified departure from the standard 2-column device panel. The pool/spa domain genuinely requires three data zones: input sensors (chemistry), visual feedback (dual viewscreens), and output controls (circuits + lights). I concur with this architectural decision.
- **Dual climate entities**: The `classifyPoolEntities()` function (§10) correctly identifies pool and spa climate entities by checking `eid.includes('pool')` and `eid.includes('spa')`. This is a name-based heuristic, not device-class-based. **Advisory**: This will break if the entity naming convention differs (e.g., `climate.pentair_body_1` instead of `climate.pentair_pool_heat`). Consider adding a fallback that examines `preset_modes` — pool entities typically have `['heater', 'solar', 'solar_preferred']` which is distinctive.
- The `no-chem` variant that collapses to 2 columns when IntelliChem is absent is well-designed — it avoids an empty column. The CSS `grid-template-areas` override is the correct approach.
- The chemistry threshold functions (`getPhColor()`, `getOrpColor()`, `getSaltColor()`, `getSaturationColor()`) are clean, bounded-range evaluators. The threshold values match EPA and pool industry standards. No concerns.
- The IntelliBrite color mode system (§7) handles 22 modes via a static array (`INTELLIBRITE_MODES`) rendered as a horizontally scrollable strip. The `scroll-snap-type: x proximity` is good UX for swatch navigation.

### Performance Considerations
- **Water particle animation** (§5.3): Each viewscreen renders 6 CSS-animated particles. Total: 12 animated elements. These use CSS `animation` with `transform` and `opacity` — both GPU-compositable properties. The performance cost is minimal. The `@media (prefers-reduced-motion: reduce)` handler correctly disables these.
- **Full-width panel DOM footprint**: This panel renders significantly more DOM than a standard panel. Estimated node count: ~80-100 nodes for the full panel (2 viewscreens × 6 particles each, ~9 chemistry lines, ~6 circuit toggles, 22 light swatches, headers, dividers). This is acceptable for a single instance. However, if a user has multiple pool/spa systems (unusual but possible), rendering 2+ instances simultaneously would create 200+ animated nodes. **Advisory**: Add a guard that caps pool/spa panels at 1 per dashboard view, or disable particle animations on the second instance.
- **IntelliBrite service call**: `setColorMode()` uses `hass.callService('screenlogic', 'set_color_mode', ...)`, which is a ScreenLogic integration-specific action. This requires `config_entry` as a parameter. The spec correctly passes this. However, the `configEntryId` must be discovered at panel initialization. The spec's `classifyPoolEntities()` sets `result.configEntryId = null` but never populates it. **Advisory**: Add config entry discovery via the entity's `config_entry_id` attribute from the entity registry.
- **Bundle impact estimate**: ~8-10 KiB minified/gzipped. This is the heaviest individual panel — the INTELLIBRITE_MODES array (~1 KiB), dual viewscreen templates, water particle generation, chemistry threshold functions, and circuit toggle logic all add up. Roughly 4.5% of the 203 KiB bundle. This is the largest single-component addition.

### HA Integration Patterns
- Climate service calls (`climate.set_temperature`, `climate.set_preset_mode`, `climate.set_hvac_mode`) are correctly specified for both pool and spa entities (§5.5). The `adjustPoolSetpoint()` function mirrors the climate panel's `adjustSetpoint()` — consider sharing this function.
- `screenlogic.set_color_mode` and super chlorination actions (§7.4-7.5) are integration-specific services that bypass the standard HA entity service API. These require the `config_entry` parameter. This is the correct pattern for ScreenLogic — confirmed against the integration's source code.
- Circuit toggles use standard `switch.turn_on` / `switch.turn_off` via `toggleCircuit()` (§6). Correct and straightforward.
- The IntelliChem detection (`result.intellichem = true` when `orp_now` or `ph_now` entities exist) is a reasonable heuristic for distinguishing between basic SCG chemistry (which has `orp` and `ph`) and full IntelliChem (which adds `_now` variants).

### Code Quality & Reusability
- **DRY concern**: `adjustPoolSetpoint()` (§5.5) is nearly identical to the climate panel's `adjustSetpoint()` (§5.2 of climate spec). The only differences are default `step` (1 vs 0.5) and the absence of dual-setpoint logic (pool entities use single setpoint only). These should share a common implementation with config parameters.
- **Chemistry threshold functions**: `getPhColor()`, `getOrpColor()`, `getSaltColor()`, `getSaturationColor()` are pool-specific and not reusable. They should remain in the pool panel file. However, they follow an identical 3-tier threshold pattern (optimal/acceptable/alert). A generic `thresholdColor(value, ranges)` helper could replace all four:
  ```javascript
  function thresholdColor(v, optimal, acceptable) {
    if (v >= optimal[0] && v <= optimal[1]) return 'var(--lcars-ice)';
    if (v >= acceptable[0] && v <= acceptable[1]) return 'var(--lcars-sunflower)';
    return 'var(--lcars-alert)';
  }
  ```
  This would reduce 4 functions (~28 lines) to 1 function + 4 config objects (~12 lines). Net savings: ~16 lines.
- **YAGNI**: The super chlorination controls (§7.5) are correctly included — users with IntelliChem frequently use this feature. Not over-engineering.
- **Configuration schema**: No custom YAML config beyond auto-discovery. The panel is triggered by the presence of ScreenLogic climate entities. Correct approach — pool systems are device-specific enough that manual config would be burdensome.

### Recommendations
1. **P1**: Populate `configEntryId` in `classifyPoolEntities()`. Fetch from the entity registry entry's `config_entry_id` field. Without this, `setColorMode()` and super chlorination actions will fail.
2. **P1**: Share `adjustSetpoint()` between climate and pool panels. Extract to a common utility that accepts `step`, `min_temp`, `max_temp`, and target key as parameters.
3. **P2**: Replace the 4 chemistry threshold functions with a generic `thresholdColor(value, optimalRange, acceptableRange)` utility. Reduces code and makes ranges configurable.
4. **P2**: Strengthen pool/spa entity identification in `classifyPoolEntities()`. In addition to `eid.includes('pool')`, check `preset_modes` for `['heater', 'solar', 'solar_preferred']` as a disambiguation signal.
5. **P3**: Add a MAX_POOL_PANELS constant (suggest: 1) and log a console warning if multiple instances are detected on the same dashboard view. Multiple full-width pool panels with 12+ animated particles each will impact frame rates on lower-end devices (e.g., wall-mounted tablets).
6. **P3**: The 0.55rem swatch label font size (§7.2) is below the standard `--lcars-font-size-data`. This is flagged for Geordi but architecturally acceptable — 22 swatches at standard font size would not fit without excessive horizontal scrolling.

---
