# P4 Design Spec — Power Naming, Circuit Correctness, and Progressive Disclosure

**Date**: 2026-04-19
**Designer**: Wesley Crusher
**Pass**: P4
**Items**: DATA-009, DATA-010, GEORDI-007, GEORDI-008, GEORDI-009, GEORDI-028, WESLEY-UX-006, WESLEY-UX-008, WESLEY-IDEA-005, WESLEY-IDEA-012

---

## Table of Contents

1. [Shared Infrastructure: Name Humanization Pipeline](#1-shared-infrastructure-name-humanization-pipeline)
2. [DATA-009 — Humanize Emporia + Duplicate Circuit Names](#2-data-009--humanize-emporia--duplicate-circuit-names)
3. [DATA-010 — Remove `-- Dryer` Artifacts](#3-data-010--remove----dryer-artifacts)
4. [GEORDI-007 — Disambiguate Identical Pool Circuit Names](#4-geordi-007--disambiguate-identical-pool-circuit-names)
5. [GEORDI-008 — Remove Duplicate Laundry Circuits](#5-geordi-008--remove-duplicate-laundry-circuits)
6. [GEORDI-009 — Replace Raw Identifiers with Human Names](#6-geordi-009--replace-raw-identifiers-with-human-names)
7. [GEORDI-028 — Humanize Pentair Hex/Model Names](#7-geordi-028--humanize-pentair-hexmodel-names)
8. [WESLEY-UX-006 — Show Hidden Circuit Count + Hidden Wattage](#8-wesley-ux-006--show-hidden-circuit-count--hidden-wattage)
9. [WESLEY-UX-008 — Collapse 0W Power Panels to Standby Summary](#9-wesley-ux-008--collapse-0w-power-panels-to-standby-summary)
10. [WESLEY-IDEA-005 — Progressive Power Panel by Load Threshold](#10-wesley-idea-005--progressive-power-panel-by-load-threshold)
11. [WESLEY-IDEA-012 — Pool Circuit Disambiguation + Wattage Color Tiers](#11-wesley-idea-012--pool-circuit-disambiguation--wattage-color-tiers)
12. [Implementation Order](#12-implementation-order)

---

## 1. Shared Infrastructure: Name Humanization Pipeline

All six naming bugs (DATA-009, DATA-010, GEORDI-007, GEORDI-008, GEORDI-009, GEORDI-028) share a root cause: `_shortDeviceName()` in `lcars-base-panel.js` only strips the area prefix. It needs a multi-stage humanization pipeline that runs after area-stripping.

### Design: `_humanizePowerName(rawName, device, entityId)`

New method on `LcarsPowerPanel` (not base panel — this logic is power-domain-specific). Called after `_shortDeviceName()` in every place a circuit/device name is resolved.

**Pipeline stages** (applied in order):

```
Stage 1: Area prefix strip       (existing _shortDeviceName)
Stage 2: Manufacturer prefix strip (Emporia VUE patterns)
Stage 3: Hex/serial strip         (Pentair MAC addresses, serial numbers)
Stage 4: Separator cleanup        (orphan --, leading/trailing punctuation)
Stage 5: Underscore-to-space      (snake_case → Title Case)
Stage 6: Fallback                 (if result is empty → derive from entity_id)
```

**Stage 2 — Manufacturer prefix patterns** (regex table):

| Pattern | Example Input | Output |
|---------|---------------|--------|
| `/^vue\s*g?\d*[_\s]*/i` | `VUEG3_MAINLOAD1` | `MAINLOAD1` |
| `/^emporia[_\s]*(vue)?[_\s]*/i` | `Emporia Vue Kitchen` | `Kitchen` |
| `/^pentair[_:\s]*/i` | `Pentair: Pool Pump` | `Pool Pump` |
| `/^screenlogic[_:\s]*/i` | `ScreenLogic Pool Heater` | `Pool Heater` |

These are stored as a `const MANUFACTURER_PREFIXES` array of `{ pattern: RegExp, replacement: '' }` objects at module scope. New manufacturers can be added without touching pipeline logic.

**Stage 3 — Hex/serial patterns**:

| Pattern | Example Input | Output |
|---------|---------------|--------|
| `/\b[0-9a-f]{2}(-[0-9a-f]{2}){2,}\b/i` | `1F-3C-25` | `` (stripped) |
| `/\b[0-9a-f]{6,}\b/i` | `Pentair 1F3C25` | `Pentair` (then Stage 2 strips `Pentair`) |
| `/\b(sn|serial)[:\s]*[a-z0-9-]+\b/i` | `SN:ABC123` | `` (stripped) |
| `/\b(mac|addr)[:\s]*[a-z0-9:.-]+\b/i` | `MAC:AA:BB:CC` | `` (stripped) |

**Stage 4 — Separator cleanup**:

```js
// Strip leading dashes/underscores (solves DATA-010's -- prefix)
result = result.replace(/^[\s\-–_:]+/, '');
// Strip trailing dashes/underscores
result = result.replace(/[\s\-–_:]+$/, '');
// Collapse multiple spaces
result = result.replace(/\s{2,}/g, ' ');
```

**Stage 5 — Underscore-to-space + title case**:

```js
result = result.replace(/_/g, ' ');
// Split camelCase: "MAINLOAD1" → "MAIN LOAD 1"
result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
// Split letter-number boundaries: "LOAD1" → "LOAD 1"
result = result.replace(/([A-Za-z])(\d)/g, '$1 $2');
```

**Stage 6 — Fallback from entity_id**:

```js
if (!result.trim() && entityId) {
  // sensor.power_vueg3_kitchen → "kitchen"
  const suffix = entityId.split('.').pop().split('_').pop();
  result = suffix.replace(/_/g, ' ');
}
```

All output is uppercased for LCARS typography compliance.

### Where the pipeline is called

Replace every bare `this._shortDeviceName(circuit.device)` in the power panel with:

```js
this._humanizePowerName(
  this._shortDeviceName(circuit.device),
  circuit.device,
  circuit.entities?.[0]?.entity?.entity_id
)
```

Affected call sites in `lcars-power-panel.js`:
- `_renderCircuitTile()` — circuit name
- `_renderPowerDeviceRow()` — device name
- `_renderPowerStrip()` — strip parent name
- `_renderStripChild()` — strip child name
- `_renderPowerArc()` — arc segment names
- `_showCircuitPopover()` — popover title

### Edge cases

- **User-assigned name_by_user**: `_shortDeviceName()` prefers `name_by_user` over `name`. If the user has manually renamed a device, the humanization pipeline should **skip Stages 2-3** (manufacturer stripping) since the user has already provided a human-readable name. Detect via `device?.name_by_user` being truthy.
- **Empty after all stages**: Fall back to `'CIRCUIT'` (not `'Unknown'` — that's too generic for LCARS).
- **Name is only a number** (e.g., channel `"3"`): Prefix with `CIRCUIT ` → `CIRCUIT 3`.

---

## 2. DATA-009 — Humanize Emporia + Duplicate Circuit Names

### Approach
Solved by the shared pipeline (Stages 2, 4, 5, 6). Emporia Vue names like `VUEG3_MAINLOAD1` become `MAIN LOAD 1` after prefix strip → underscore split → letter-number split.

### Code changes
- **`lcars-power-panel.js`**: Add `_humanizePowerName()` method, wire into all name sites.
- No changes to `lcars-base-panel.js::_shortDeviceName()` — keep that generic. The power-specific humanization stays in the power panel.

### CSS/Visual
None — this is a data transformation, not a visual change.

### Edge cases
- Emporia Vue channel names vary by firmware version. Some use `Channel_1`, others use `vue_g3_channel_1`, others use the user-configured circuit name from the Emporia app. The pipeline handles all three because Stage 2 strips the `vue*` prefix and Stage 5 handles underscores.
- If the user has renamed channels in the Emporia app, the names flow through HA `friendly_name` → device `name`. These are already human-readable and Stage 2 won't strip them (e.g., "Kitchen Lights" doesn't match `/^vue/i`).

---

## 3. DATA-010 — Remove `-- Dryer` Artifacts

### Approach
Two-pronged fix:

**Prong 1** — Pipeline Stage 4 catches orphan `--` prefixes after all other stripping. This handles the cosmetic symptom.

**Prong 2** — Fix the root cause in `_detect240VPairs()`. Currently, when only one leg of a pair matches the L1/L2 regex, the matched leg gets its base name extracted (stripping the L1/L2 suffix) while the unmatched leg keeps its original name. The base name extraction leaves leading `--` when the original name had a separator before "L1".

### Code changes
- **`_detect240VPairs()`**: After the pairing loop, when `pair.length === 1` (unmatched singleton), push the circuit back to `unpaired` **with its original device name** — do NOT use the regex-extracted `baseName`. The baseName was only meant for the combined 240V entry.

Current code (lines ~178-183):
```js
for (const [name, pair] of pairs) {
  if (pair.length === 2) {
    // ... create combined entry with baseName ...
  } else {
    result.push(...pair);  // ← pushes with original device, but name was mutated
  }
}
```

The issue is that `pair` entries still have their original `device` objects — the baseName was only used for the regex match key. But the `name` variable in the `for...of` is the stripped baseName. The actual device.name is untouched. So... let me re-examine.

Looking at the code again: the circuit objects in `pair` are the original circuit objects from the input. Their `device.name` is NOT mutated. The `baseName` is only the Map key. When `pair.length !== 2`, we push the original circuits back — their names are intact.

**Revised root cause**: The `-- Dryer` artifact comes from `_shortDeviceName()`, not from `_detect240VPairs()`. Here's the sequence:
1. Device name is `"Laundry -- Dryer L1"` (area prefix "Laundry")
2. `_shortDeviceName()` strips area prefix "Laundry" → `"-- Dryer L1"`
3. The L1L2 regex matches: baseName = `"-- Dryer"`, suffix = `"L1"`
4. If only one leg found, the circuit keeps device name `"Laundry -- Dryer L1"`
5. `_shortDeviceName()` strips "Laundry" again at render time → `"-- Dryer L1"`
6. The L1/L2 suffix is still there in the display name

Wait — the display name calls `_shortDeviceName()` at render time, which only strips area prefix. The `"-- "` survives.

**Actual fix needed**: Pipeline Stage 4 (separator cleanup) handles the cosmetic `--` at display time. But we should also ensure that the 240V pair detector's `baseName` cleaning is more robust:

```js
// In _detect240VPairs, after regex match:
const baseName = match[1].trim().replace(/^[\s\-–_:]+/, '').replace(/[\s\-–_:]+$/, '');
```

This ensures that if the raw name before the L1/L2 suffix had trailing punctuation, the combined 240V entry gets a clean name.

### CSS/Visual
None.

### Edge cases
- **Name is entirely separators** after stripping (e.g., device named `"-- L1"`): baseName cleanup produces empty string → fallback to `CIRCUIT` via Stage 6.
- **Legitimate dashes in names** (e.g., "Washer-Dryer Combo L1"): The leading-dash strip only removes leading characters. Internal dashes are preserved.

---

## 4. GEORDI-007 — Disambiguate Identical Pool Circuit Names

### Approach
After the humanization pipeline runs, perform a **deduplication pass** on the visible circuit list. If two or more circuits have the same display name, append a numeric suffix.

### Code changes
New method `_deduplicateCircuitNames(circuits)` on `LcarsPowerPanel`:

```js
_deduplicateCircuitNames(circuits) {
  // Count occurrences of each display name
  const nameCounts = new Map();
  const displayNames = circuits.map(c => {
    const name = this._humanizePowerName(
      this._shortDeviceName(c.device),
      c.device,
      c.entities?.[0]?.entity?.entity_id
    );
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    return name;
  });

  // For duplicates, append index
  const nameIndexes = new Map();
  return circuits.map((c, i) => {
    const name = displayNames[i];
    if (nameCounts.get(name) > 1) {
      const idx = (nameIndexes.get(name) || 0) + 1;
      nameIndexes.set(name, idx);
      c._displayName = `${name} ${idx}`;
    } else {
      c._displayName = name;
    }
    return c;
  });
}
```

Called in `_buildPowerCollection()` after `_sortCircuits()` and in the legacy render path.

The `_displayName` property is a transient annotation on the circuit object — not persisted. The render methods check `circuit._displayName` before falling back to the humanization pipeline.

**Smart suffix extraction** (WESLEY-IDEA-012 Step 2): Before falling back to numeric indexes, try to extract a meaningful suffix from the entity_id:

```js
const POOL_KEYWORDS = /pool[_\s]?(pump|heater|cleaner|blower|light|spa|waterfall|spillover|circuit[_\s]?\d+)/i;
// If entity_id matches, use the keyword as the name
const eidMatch = (c.entities?.[0]?.entity?.entity_id || '').match(POOL_KEYWORDS);
if (eidMatch) {
  c._displayName = eidMatch[1].replace(/_/g, ' ').toUpperCase();
}
```

### CSS/Visual
None — names are just text content.

### Edge cases
- **All 8 pool circuits truly have no distinguishing info** in entity_id: Fall back to `POOL EQUIPMENT 1` through `POOL EQUIPMENT 8`. This is better than 8 identical names.
- **Mixed: some have keywords, some don't**: Only the indistinguishable ones get numeric suffixes. Example: "PUMP", "HEATER", "POOL EQUIPMENT 1", "POOL EQUIPMENT 2", etc.
- **Dedup runs on the sorted list**: Indexes are assigned in wattage-descending order, so `POOL EQUIPMENT 1` is the highest-draw circuit. This gives the numbers natural meaning.

---

## 5. GEORDI-008 — Remove Duplicate Laundry Circuits

### Approach
This is a direct consequence of the 240V pair partial-match issue. When `_detect240VPairs()` finds one leg of a pair but not the other, the matched leg appears both as:
1. The original unpaired circuit (pushed to `result` because pair.length === 1)
2. Potentially a display duplicate if another circuit has the same base name

**Root cause fix**: After `_detect240VPairs()` runs, deduplicate circuits by entity_id. If two result entries share any entity, keep the one that is `is240V: true` (the combined entry) and drop the other.

### Code changes
Add a dedup step at the end of `_detect240VPairs()`:

```js
// Deduplicate: if an entity appears in both a 240V combined entry and a standalone entry,
// keep only the 240V entry
const seenEntityIds = new Set();
const deduped = [];
// First pass: collect entity IDs from 240V pairs (they take priority)
for (const c of result) {
  if (c.is240V) {
    for (const e of c.entities) {
      if (e.entity?.entity_id) seenEntityIds.add(e.entity.entity_id);
    }
    deduped.push(c);
  }
}
// Second pass: add non-240V entries only if their entities aren't already claimed
for (const c of result) {
  if (c.is240V) continue;
  const dominated = (c.entities || []).some(
    e => e.entity?.entity_id && seenEntityIds.has(e.entity.entity_id)
  );
  if (!dominated) deduped.push(c);
}
return deduped;
```

Additionally, the partial-match case (`pair.length === 1`) should NOT create a combined entry — it should fall through to `unpaired`. This is already the current behavior, but the name stripping in the pipeline (DATA-010 fix) ensures the lone leg doesn't get an artifact name.

### CSS/Visual
None.

### Edge cases
- **Dryer with only one CT clamp installed** (legitimate single-leg 240V): Appears as one circuit at half the actual wattage. This is a hardware limitation, not a software bug. The display name is clean.
- **Two different devices with overlapping entity names**: The dedup uses exact entity_id match, not name match — no false positives.

---

## 6. GEORDI-009 — Replace Raw Identifiers with Human Names

### Approach
Solved entirely by the shared pipeline (Section 1). Examples:

| Raw Input | After Pipeline | Stage(s) |
|-----------|---------------|----------|
| `VUEG3_MAINLOAD1` | `MAIN LOAD 1` | 2→5 |
| `VUEG3_MAINLOAD2` | `MAIN LOAD 2` | 2→5 |
| `BALANCE` | `BALANCE` | (no change — already clean) |
| `sensor.power_vueg3_kitchen` (entity fallback) | `KITCHEN` | 6 |

### Code changes
Same as DATA-009 — the `_humanizePowerName()` pipeline handles it.

### CSS/Visual
None.

### Edge cases
- **`BALANCE`** is a legitimate aggregate circuit name for Emporia Vue. The `AGGREGATE_PATTERN` in `_buildPowerCollection()` already identifies and excludes it from per-circuit totals. The humanization pipeline leaves it as-is (no manufacturer prefix match, no hex pattern). Display remains `BALANCE` which is human-readable.
- **`TOTAL`**, **`MAINS`**: Same — recognized by `AGGREGATE_PATTERN`, humanization leaves them clean.

---

## 7. GEORDI-028 — Humanize Pentair Hex/Model Names

### Approach
Solved by pipeline Stage 2 (manufacturer prefix strip) + Stage 3 (hex pattern strip). Example:

| Raw Input | After Pipeline |
|-----------|---------------|
| `Pentair: 1F-3C-25` | `POOL CONTROLLER` (empty after strip → fallback) |
| `Pentair: 1F-3C-25 Pool Pump` | `POOL PUMP` |
| `ScreenLogic 2:1F-3C-25` | `POOL CONTROLLER` (empty after strip → fallback) |

### Code changes
Pipeline Stages 2 and 3 (already defined in Section 1). Special fallback: when a Pentair/ScreenLogic device name becomes empty after stripping, use `POOL CONTROLLER` rather than the generic `CIRCUIT`:

```js
// In Stage 6 fallback, check manufacturer
if (!result.trim()) {
  const mfr = (device?.manufacturer || '').toLowerCase();
  if (mfr.includes('pentair') || mfr.includes('screenlogic')) {
    result = 'POOL CONTROLLER';
  } else {
    result = 'CIRCUIT';
  }
}
```

### CSS/Visual
None.

### Edge cases
- **Multiple Pentair controllers**: If a home has two Pentair devices and both resolve to `POOL CONTROLLER`, the deduplication pass (GEORDI-007) handles it → `POOL CONTROLLER 1`, `POOL CONTROLLER 2`.
- **Pentair device with meaningful name**: e.g., `Pentair Pool Heater 1F-3C-25` → Stage 2 strips `Pentair` → Stage 3 strips `1F-3C-25` → result: `Pool Heater` → uppercased: `POOL HEATER`. Clean.

---

## 8. WESLEY-UX-006 — Show Hidden Circuit Count + Hidden Wattage

### Approach
When circuits are truncated by MAX_VISIBLE, the "SHOW ALL" pill currently reads `SHOW ALL (${circuits.length})`. Replace with a richer label showing:
- Count of hidden circuits
- Aggregate wattage of hidden circuits
- An alert indicator if any hidden circuit exceeds a threshold

### Code changes
In `_renderConsolidatedPowerContent()`, after calculating `visibleCircuits`:

```js
const hiddenCircuits = circuits.slice(MAX_VISIBLE);
const hiddenCount = hiddenCircuits.length;
const hiddenWatts = hiddenCircuits.reduce((sum, c) => {
  const w = c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0);
  return sum + w;
}, 0);
const hiddenHasHigh = hiddenCircuits.some(c => {
  const w = c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0);
  return w > (thresholds.lowMax || 500);
});
```

Replace the pill template:

```js
${circuitsHasMore && !circuitsExpanded ? html`
  <button class="power-show-all-pill" aria-label="Show ${hiddenCount} more circuits drawing ${Math.round(hiddenWatts)} watts total"
    @click=${() => { this._expandedPowerSections.add('circuits'); this.requestUpdate(); }}>
    <span class="pill-text">EXPAND GRID — ${hiddenCount} MORE (${this._formatWatts(hiddenWatts)})</span>
    ${hiddenHasHigh ? html`<span class="pill-alert-dot" aria-hidden="true"></span>` : ''}
  </button>
` : ''}
```

Same treatment for the plugs "SHOW ALL" pill.

### CSS/Visual

```css
.power-show-all-pill {
  /* existing styles unchanged */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.pill-alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lcars-butterscotch);
  flex-shrink: 0;
}
```

The alert dot is `--lcars-butterscotch` (not red — hidden circuits aren't an emergency, just worth checking). It appears only when at least one hidden circuit draws > 500W (the `lowMax` threshold).

### Edge cases
- **All hidden circuits are 0W**: Pill reads `EXPAND GRID — 4 MORE (0 W)`. No alert dot. User knows there's nothing interesting hidden.
- **One hidden circuit is 2000W**: Pill reads `EXPAND GRID — 4 MORE (2,340 W)` with butterscotch dot. User is motivated to expand.
- **`_formatWatts` handles kW**: If hidden total ≥ 10000W, displays as `10.3 kW`.

---

## 9. WESLEY-UX-008 — Collapse 0W Power Panels to Standby Summary

### Approach
When `totalWatts === 0` (or `totalWatts == null`), replace the entire consolidated power content with a single-line standby summary. No donut, no circuit grid, no section headers. Just one compact row.

### Code changes
At the top of `_renderConsolidatedPowerContent()`:

```js
if (totalWatts == null || totalWatts === 0) {
  return this._renderStandbyPowerContent(collection);
}
```

New method:

```js
_renderStandbyPowerContent(collection) {
  const circuitCount = collection.circuits.length + collection.plugs.length;
  const stripCount = collection.strips.length;
  const deviceLabel = circuitCount + stripCount;

  return html`
    <div class="power-standby-summary" role="status" aria-label="Power systems standby, all circuits idle">
      <span class="standby-indicator" aria-hidden="true">○</span>
      <span class="standby-label">ALL CIRCUITS STANDBY</span>
      <span class="standby-detail">${deviceLabel} MONITORED</span>
    </div>
  `;
}
```

For the **legacy single-device mode** (`_renderLegacyPowerContent`), same treatment when `watts === 0`:

```js
if (watts == null || watts === 0) {
  return html`
    <div class="power-standby-summary" role="status" aria-label="Power standby">
      <span class="standby-indicator" aria-hidden="true">○</span>
      <span class="standby-label">STANDBY</span>
      <span class="standby-detail">0 W</span>
    </div>
  `;
}
```

### CSS/Visual

```css
.power-standby-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  opacity: 0.6;
}
.standby-indicator {
  color: var(--lcars-gray);
  font-size: var(--lcars-font-size-data, 1.25rem);
}
.standby-label {
  color: var(--lcars-gray);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-label, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.standby-detail {
  color: var(--lcars-gray);
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-label, 0.75rem);
  opacity: 0.7;
  margin-left: auto;
}
```

Design rationale: The `opacity: 0.6` on the container dims the entire row, following the Trek principle that quiet/nominal systems recede visually. The `--lcars-gray` color is consistent with `getPowerColor(0)` which already returns gray for 0W.

### Edge cases
- **Rounding to 0W**: If total is 0.4W (rounds to 0W in display), the panel should NOT collapse to standby. Use the raw numeric check: `totalWatts <= 0` not `Math.round(totalWatts) === 0`. A 0.4W draw still means something is on.
- **Negative wattage** (solar export): Should NOT trigger standby. Check `totalWatts <= 0 && totalWatts >= 0` or just `totalWatts === 0`. Actually, let's be explicit: `totalWatts != null && totalWatts === 0`.
- **Transition from standby → active**: When a circuit starts drawing power, `totalWatts` changes on next HA state update, lit-element re-renders, and the full panel content appears. No special transition animation needed — the existing reactive render handles it.

---

## 10. WESLEY-IDEA-005 — Progressive Power Panel by Load Threshold

### Approach
Three rendering tiers based on total wattage:

| Tier | Condition | Rendering |
|------|-----------|-----------|
| **Standby** | `totalWatts === 0` | Single-line summary (WESLEY-UX-008 above) |
| **Low Activity** | `0 < totalWatts ≤ 100` | Summary card + up to 3 active circuits inline (no section headers, no arc) |
| **Normal/High** | `totalWatts > 100` | Current full layout (arc, sections, show-all pills) |

The `100W` threshold is sensible because: below 100W the room has only standby draws (LED pilots, smart plugs idle, etc.) — not worth a full grid. Above 100W, at least one device is actually running.

### Code changes
In `_renderConsolidatedPowerContent()`, expand the early return:

```js
// Standby mode: 0W
if (totalWatts == null || totalWatts === 0) {
  return this._renderStandbyPowerContent(collection);
}

// Low activity mode: ≤100W
const LOW_ACTIVITY_THRESHOLD = 100;
if (totalWatts <= LOW_ACTIVITY_THRESHOLD) {
  return this._renderLowActivityPowerContent(collection);
}

// Normal + High: existing full render
```

New method:

```js
_renderLowActivityPowerContent(collection) {
  const { circuits, plugs, strips, totalWatts, totalEnergy } = collection;
  const thresholds = this.config?.power_thresholds || {};
  const panelColor = getPowerColor(totalWatts, thresholds);

  // Show top 3 active circuits (non-zero wattage)
  const activeCircuits = circuits
    .filter(c => {
      const w = c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0);
      return w > 0;
    })
    .slice(0, 3);

  const activePlugs = plugs
    .filter(p => (this._getPrimaryPower(p) || 0) > 0)
    .slice(0, 3 - activeCircuits.length);

  return html`
    <div class="power-low-activity-content">
      <div class="power-summary" role="group" aria-label="Power Summary">
        ${this._renderPowerSummaryCard('TOTAL USAGE', totalWatts, totalEnergy, panelColor, 'mdi:sigma')}
      </div>
      ${activeCircuits.length > 0 || activePlugs.length > 0 ? html`
        <div class="power-circuits power-circuits-compact" role="list">
          ${activeCircuits.map(c => this._renderCircuitTile(c))}
          ${activePlugs.map(p => this._renderPowerDeviceRow(p))}
        </div>
      ` : ''}
    </div>
  `;
}
```

**High activity enhancement**: When `totalWatts > highMax` (default 3000W), the highest-draw circuit tile gets a visual highlight:

```js
// In _renderCircuitTile, add:
const isTopDraw = circuit._isTopDraw;  // annotated by _buildPowerCollection
```

In `_buildPowerCollection`, after sorting:

```js
if (processedCircuits.length > 0) {
  const topWatts = processedCircuits[0].combinedWatts != null
    ? processedCircuits[0].combinedWatts
    : this._getPrimaryPower(processedCircuits[0]);
  if (topWatts > (thresholds.highMax || 3000)) {
    processedCircuits[0]._isTopDraw = true;
  }
}
```

### CSS/Visual

```css
/* Low activity mode: compact circuit grid */
.power-circuits-compact {
  grid-template-columns: 1fr !important;  /* single column for 1-3 items */
  gap: var(--lcars-gap, 0.25rem);
}

/* High-draw top circuit highlight */
.power-circuit-tile[data-top-draw] {
  border-left: 3px solid var(--lcars-butterscotch);
}
```

Wait — we can't use attribute binding on `.power-circuit-tile` with lit-html 1.x element expressions. Instead, apply the style via a CSS class:

```js
// In _renderCircuitTile:
const tileClass = circuit._isTopDraw ? 'power-circuit-tile power-top-draw' : 'power-circuit-tile';
return html`
  <div class="${tileClass}" ...>
```

```css
.power-top-draw {
  border-left: 3px solid var(--lcars-butterscotch);
  padding-left: calc(var(--lcars-gap, 0.25rem) * 2);
}
```

### Edge cases
- **Room with 50 circuits, 2 active at 30W each = 60W total**: Enters low-activity mode. Shows summary card + 2 circuit tiles. The other 48 idle circuits are completely hidden — they're 0W, not worth showing. User can still expand via the panel itself to see them (the standby summary doesn't remove the panel, just compresses it).
- **Threshold is configurable**: Use `this.config?.power_thresholds?.lowActivity || 100`. The user can tune it in their YAML.
- **Strips in low-activity mode**: Not shown. Power strips are a high-detail view. At <100W, the summary card + active circuits are sufficient.

---

## 11. WESLEY-IDEA-012 — Pool Circuit Disambiguation + Wattage Color Tiers

### Approach
Two parts:

**Part A — Disambiguation**: Already solved by GEORDI-007 (Section 4). Pool circuits get smart suffixes from entity_id keywords, then numeric fallbacks.

**Part B — Wattage color tiers on circuit tiles**: Currently, `_renderCircuitTile` applies `--circuit-color` based on `getPowerColor()` which maps to `--lcars-gray/ice/sunflower/butterscotch/tomato`. The tile's name text and value already use this color. The improvement is to make the color tier **more prominent** on the tile itself, providing instant visual differentiation between active and idle circuits.

### Code changes

Currently in `_renderCircuitTile()`:
```js
<div class="power-circuit-tile" style="--circuit-color:${color}" ...>
```

The `--circuit-color` is already set. The CSS currently uses it for the indicator dot and the watts value. Extend it to the tile's left border:

Add to the tile template:
```js
const tierClass = watts != null && watts > 0
  ? (watts > (thresholds.highMax || 3000) ? 'tier-critical' : watts > (thresholds.moderateMax || 1500) ? 'tier-high' : watts > (thresholds.lowMax || 500) ? 'tier-moderate' : 'tier-low')
  : 'tier-standby';
```

```js
<div class="power-circuit-tile ${tierClass}" style="--circuit-color:${color}" ...>
```

### CSS/Visual

```css
/* Wattage tier left accent (3px colored bar) */
.power-circuit-tile {
  border-left: 3px solid transparent;
  transition: border-color 0.3s ease;
}
.power-circuit-tile.tier-standby {
  border-left-color: var(--lcars-gray);
  opacity: 0.65;
}
.power-circuit-tile.tier-low {
  border-left-color: var(--lcars-ice);
}
.power-circuit-tile.tier-moderate {
  border-left-color: var(--lcars-sunflower);
}
.power-circuit-tile.tier-high {
  border-left-color: var(--lcars-butterscotch);
}
.power-circuit-tile.tier-critical {
  border-left-color: var(--lcars-tomato);
}
```

This gives each tile a colored left accent matching its power tier. For the pool panel specifically, this means 8 previously-identical tiles now have both unique names AND visually distinct color coding:

| Circuit | Wattage | Left Accent | Visual Effect |
|---------|---------|-------------|---------------|
| PUMP | 1200W | sunflower | Active, moderate |
| HEATER | 3500W | tomato | Critical draw |
| CLEANER | 450W | ice | Low draw |
| SPA BLOWER | 0W | gray, dimmed | Standby |
| POOL EQUIPMENT 1 | 0W | gray, dimmed | Standby |
| ... | | | |

### Edge cases
- **Reduced motion**: The `transition: border-color 0.3s ease` should be wrapped in a non-reduced-motion media query. But since it's a color transition (not movement), it's acceptable per WCAG. Keep as-is.
- **Dark themes**: The accent bar colors are from LCARS CSS variables, which are already theme-aware. No special handling needed.
- **Geordi review flag**: The left accent bar is a new visual element on circuit tiles. Should be reviewed for LCARS compliance — Bracer Jack says "buttons within a frame must be uniform." The accent bar varies per tile, but it's encoding data (wattage tier), not decoration. Similar to how the indicator dot already varies. Recommend Geordi sign-off.

---

## 12. Implementation Order

Based on dependency chains:

```
Step 1: _humanizePowerName() pipeline             [Section 1]
         └─ Solves: DATA-009, GEORDI-009, GEORDI-028

Step 2: _detect240VPairs() cleanup + dedup        [Sections 3, 5]
         └─ Solves: DATA-010, GEORDI-008

Step 3: _deduplicateCircuitNames()                [Section 4]
         └─ Solves: GEORDI-007
         └─ Depends on: Step 1 (names must be humanized before dedup)

Step 4: Wattage tier classes on tiles             [Section 11]
         └─ Solves: WESLEY-IDEA-012
         └─ Independent of Steps 1-3

Step 5: Hidden circuit wattage pill               [Section 8]
         └─ Solves: WESLEY-UX-006
         └─ Independent

Step 6: 0W standby collapse                      [Section 9]
         └─ Solves: WESLEY-UX-008
         └─ Should be implemented before IDEA-005

Step 7: Progressive rendering tiers               [Section 10]
         └─ Solves: WESLEY-IDEA-005
         └─ Depends on: Step 6 (standby mode is the bottom tier)
```

### Files modified (summary)

| File | Changes |
|------|---------|
| `lcars-power-panel.js` | `_humanizePowerName()`, `_deduplicateCircuitNames()`, `_renderStandbyPowerContent()`, `_renderLowActivityPowerContent()`, `_detect240VPairs()` cleanup, hidden wattage pill, tier class bindings, `_isTopDraw` annotation |
| `lcars-power-panel-styles.js` | `.power-standby-summary`, `.power-circuits-compact`, `.pill-alert-dot`, `.tier-*` border classes, `.power-top-draw` |
| `lcars-base-panel.js` | No changes — power-specific humanization stays in the power panel |
| `lcars-pool-spa-panel.js` | Check if pool equipment names surface here too; if so, call `_humanizePowerName()` |

### Test matrix

| Scenario | What to verify |
|----------|---------------|
| Eric Garage power | `VUEG3_MAINLOAD1` → `MAIN LOAD 1`, `BALANCE` stays clean |
| Eric Pool power | 8× `POOL EQUIPMENT` → disambiguated names + color tiers |
| Eric Laundry | No `-- Dryer` artifact, no duplicate entries |
| Eric Pool panel (device names) | `Pentair: 1F-3C-25` → `POOL CONTROLLER` |
| Any room with >12 circuits | Pill shows `EXPAND GRID — N MORE (X W)` + alert dot if applicable |
| Office 0W power | Collapsed to `ALL CIRCUITS STANDBY — N MONITORED` |
| Low-activity room (<100W) | Summary + top 3 active circuits only |
| High-activity room (>3kW) | Top circuit has butterscotch left border accent |

### Geordi review flags

1. **Wattage tier left accent bar** on circuit tiles — new visual element, needs LCARS compliance check
2. **Standby collapse visual** — verify the dimmed gray row fits within LCARS frame aesthetics
3. **Low-activity compact mode** — verify single-column layout is intentional-looking, not broken-looking
4. **"EXPAND GRID" pill text** — verify typography fits within the LCARS three-size type system

### Worf review flags

None — this pass is purely display-layer. No new service calls, no new external data fetches, no CSP changes.
