## 9. Migration Strategy — Incremental, One Panel at a Time

### Phase 0: Foundation (1 PR)

1. Create `lcars-base-panel.js` with `LcarsBasePanel` class (uses `<lcars-panel-frame>` in render())
2. Create `components/lcars-panel-frame/` — frame component with shadow DOM + styles
3. Create `components/lcars-sensor-row/` — sensor display component with shadow DOM + styles
4. Create `panels/` directory structure
5. Create `components/index.html` — gallery page for visual testing of components in isolation (W-5)
6. Document `data` property shape contract for base class (W-6)
7. Compile **Animation Distribution Matrix** deliverable (Geordi X-2)
8. Run `npm audit` as pre-build check (Worf ADV-3)
9. **No behavioral change.** Homepage card continues to use inline renderers.

### Phase 1: First Panel Extraction — Irrigation (1 PR)

**Why irrigation first**: It's the smallest panel (~200 lines). Lowest risk for proving the pattern.

1. Create `panels/irrigation/lcars-irrigation-panel.js` extending `LcarsBasePanel`
2. Move `_renderIrrigationPanel()` logic → `renderContent()`
3. Move `_partitionIrrigationEntities()` → `_partitionEntities()`
4. Move irrigation CSS from monolith → panel's `static styles`
5. Import panel from `lcars-homepage-card.js` (side-effect import)
6. Update `_renderDevicePanel()` switch case: `case PANEL_TYPE_IRRIGATION: return html`<lcars-irrigation-panel ...>`
7. Add animation migration checklist item (X-1)
8. Delete old methods from monolith
9. Build, test, verify identical rendering

### Phase 2: Second Panel — Weather (1 PR)

**Why weather second**: Small (~250 lines), uses `lcars-weather-utils.js` (already extracted), proves import pattern for utility modules.

### Phase 3: Remaining Panels (1 PR each, 8 PRs)

Extract in ascending complexity order:
1. Camera (~290 lines)
2. Environment (~340 lines) — **also creates `<lcars-option-strip>` + `<lcars-section-divider>`**
3. Media (~230 lines)
4. Pool/Spa (~260 lines) — **also creates `<lcars-setpoint>` if not yet created**
5. Alarm (~315 lines)
6. Climate (~350 lines)
7. Battery (~450 lines)
8. Power (~920 lines) — largest; `_renderTrackToggle` + `_renderClickableValue` stay here

### Phase 4: Cleanup (1 PR)

1. Remove dead CSS from monolith's `static styles`
2. Remove dead helper methods no longer called by any renderer
3. Sync all `panel.html` preview files with final templates (N-6)
4. Final bundle size comparison: before vs. after
5. Update source map comments if present

**Total**: 12
### Phase 4: Cleanup (1 PR)

1. Remove dead CSS from monolith's `static styles`
2. Remove dead helper methods no longer called by any renderer
3. Sync all `panel.html` preview files with final templates (N-6)
4. Final bundle size comparison: before vs. after
5. Update source map comments if present

**Total**: 12
