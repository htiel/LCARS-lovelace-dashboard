## v4.18.0 Visual Refresh — Implementation Addendum (4X-9)

**Backlog Items**: 4X-9 (Pool/Spa Visual Refresh), 4X-14 (linkedEntities), 4X-16 (Segmented Bar)
**Status**: IMPLEMENTED — v4.18.0
**Date**: 2026-04-16
**Files**: `lcars-pool-spa-panel.js`, `lcars-pool-spa-panel-styles.js`, `lcars-segmented-bar.js`

---

### C1. LCARS Compliance Fixes — All 7 Resolved

| # | Issue | Fix Applied | Status |
|---|-------|-------------|--------|
| 1 | Setpoint `±` are `border-radius: 50%` circles | LCARS endcap pills: `.pool-sp-btn.sp-decrement` rounded-left, `.sp-increment` rounded-right, `3rem × 2.5rem` | ✅ |
| 2 | Viewscreen brackets uniform 2px right-angles | Asymmetric mini-elbow brackets: `::before` 3px thick + 0.5rem radius, `::after` 1px thin + 0.25rem radius | ✅ |
| 3 | `.sensor-label` at `0.75rem` (4th font tier) | Changed to `var(--lcars-font-size-data)` | ✅ |
| 4 | `.pool-body-temp` at `2.5rem` (unmapped) | Changed to `var(--lcars-font-size-title)` | ✅ |
| 5 | Water caustic effects never implemented | Deferred to v2 — thermal tint implemented as v1 step (see C3) | ⏳ |
| 6 | Inner frame uses uniform border | Asymmetric: 3px left/top (thick), 1px right/bottom (thin) | ✅ |
| 7 | IntelliBrite basic toggles | Deferred to v2 — requires `screenlogic.set_color_mode` investigation | ⏳ |

---

### C2. Chemistry Visualization — `<lcars-segmented-bar>` (4X-16)

**Replaces**: §4 dot+text sensor rows for chemistry readings.

New shared component `<lcars-segmented-bar>` renders horizontal threshold-colored bars:
- **Props**: `value`, `min`, `max`, `segments` (default 7), `thresholds` (Array of `{value, color}`), `label`
- **Rendering**: N `<div>` segments; filled = solid color from threshold, unfilled = `--lcars-gray` at 30% opacity
- **Geordi rules**: `role="meter"` + aria attributes, text readout alongside bar, endcap on last segment only, NO gradients, min 24px height
- **Threshold lookup**: ascending array, picks last threshold where `val >= threshold.value`

**Chemistry threshold tables** (hardcoded in `_getChemThresholds()`):

| Metric | Optimal (ice) | Acceptable (sunflower) | Alert (tomato) |
|--------|---------------|----------------------|----------------|
| pH | 7.2–7.6 | 7.0–7.2, 7.6–7.8 | < 7.0, > 7.8 |
| Free Chlorine | 1.0–3.0 ppm | 0.5–1.0, 3.0–5.0 | < 0.5, > 5.0 |
| ORP | 650–750 mV | 550–650, 750–800 | < 550, > 800 |
| Total Alkalinity | 80–120 ppm | 60–80, 120–150 | < 60, > 150 |
| Calcium Hardness | 200–400 ppm | 150–200, 400–500 | < 150, > 500 |
| Salt | 2700–3400 ppm | 2500–2700, 3400–3600 | < 2500, > 3600 |

**Range tables** (hardcoded in `_getChemRange()`):

| Metric | Min | Max |
|--------|-----|-----|
| pH | 6.5 | 8.5 |
| Chlorine | 0 | 6 |
| ORP | 400 | 900 |
| Alkalinity | 0 | 200 |
| Hardness | 0 | 600 |
| Salt | 2000 | 4000 |

---

### C3. Water Body Viewscreens — Thermal Tint (v1)

**Partial implementation** of §5.3 water visualization. Full 3-layer (caustic shimmer + ripple + thermal gradient) deferred to v2 per Geordi priority ranking.

**v1 implemented**:
- `.thermal-cool` class on pool body: `background: rgba(153, 204, 255, 0.04)` (cool blue tint)
- `.thermal-warm` class on spa body: `background: rgba(255, 180, 100, 0.04)` (warm amber tint)
- Body frames use explicit `background: var(--lcars-black, #000)` preventing theme bleed

---

### C4. Circuit Control Grouping

**Replaces**: flat `[...pumps, ...circuits]` list in §6.

Circuits now classified by regex pattern and rendered in named groups:

| Group | Regex Pattern | Label |
|-------|--------------|-------|
| Pumps | `/pump/i` | PUMPS |
| Water Features | `/waterfall\|spillway\|bubbler\|fountain/i` | WATER FEATURES |
| Spa | `/blower\|spa.*jet\|jet.*spa/i` | SPA |
| Utility | *(default)* | UTILITY |

Each group shows active count badge: `WATER FEATURES (1/3)`.

New method `_renderCircuitGroup(entries, groupLabel)` handles rendering with optional chain on `state?.state`.

---

### C5. Freeze Protection Banner

**Implements**: §15 freeze mode handling (previously not surfaced in UI).

- `binary_sensor.*_freeze_mode` detected in `_partitionPoolEntities()`
- When `state === 'on'`: Full-width tomato alert banner with ❄ icon, `role="alert"`, pulse animation
- When sensor exists but off: Dim `FREEZE: NOMINAL` status line (confirms sensor connected)
- Badge also shows ❄ FREEZE indicator in tomato
- `.freeze-active` class adds ice-blue border to pool content grid

---

### C6. Heating Indicator Bar

3px bar below each body viewscreen when `hvac_action === 'heating'`:
- Solid `var(--body-color)` background (no gradient — Bracer Jack Rule 1)
- `pool-heat-pulse` animation: opacity 1→0.4→1, 2s cycle
- Gated by `prefers-reduced-motion`

---

### C7. `linkedEntities` Integration (4X-14)

`renderContent()` and `renderBadge()` now call `this._getAllEntities()` instead of `this.group.entities` directly. This merges WaterGuru entities (configured via `linkedEntities` property) with native Pentair entities.

Linked chemistry entities display a `[W]` source pill next to their label. The `_linked` flag is destructured from the entry wrapper (not `entity`) per Data code review.

**CHEM_KEYS regex** expanded: `/orp|ph_|salt|tds|saturation|calcium|alkalinity|cyanuric|chlorine|hardness/i`

---

### C8. Bug Fixes Applied During Team Review

| Bug | Found By | Fix |
|-----|----------|-----|
| `_linked` flag read from `entity` instead of entry wrapper | Data | Destructure `_linked` directly: `({ entity, state, _linked })` |
| `state.state` unguarded in `_renderCircuitGroup` | Data | Added optional chain: `state?.state === 'on'` |

---

### C9. Animation Budget (Updated)

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Freeze banner pulse | CSS keyframe (`freeze-pulse`) | 3s ease-in-out infinite | Freeze active |
| Heating indicator pulse | CSS keyframe (`pool-heat-pulse`) | 2s ease-in-out infinite | Body heating |
| Pump spinner | CSS keyframe (`lcars-pump-spin`) | 1.2s linear infinite | Pump running |
| Button flash | CSS keyframe (`lcars-button-flash`) | 300ms | `:active` |

All gated by `@media (prefers-reduced-motion: reduce)`. Max concurrent: 3 (freeze + heat + pump).

---

### C10. Deferred to v2

| Feature | Reason | Spec Section |
|---------|--------|-------------|
| Caustic shimmer + surface ripple | Requires SVG filters, animation layer conflicts | §5.3 |
| IntelliBrite color mode selector | Requires `screenlogic.set_color_mode` service investigation | §7 |
| Enhanced 6-segment pump spinner | RPM-proportional speed requires binding strategy | §6.4 |
| Temperature trend delta arrow | Low priority, may implement in GROUP 4 timeframe | §5.6 |
