# LCARS Consolidated Power Panel — Technical Design Addendum

**Backlog Item**: 4X-6 · Consolidated Power Panel (Area Grouping)  
**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (UI layout), Worf (toggle rate-limiting unchanged)  
**Date**: Stardate 2026.04.14  
**Status**: **SHIPPED** — v4.16.0, hotfixes v4.16.1–v4.16.6  
**Extends**: `specs/LCARS-POWER-PANEL-SPEC.md`, `specs/LCARS-POWER-PANEL-WESLEY-ADDENDUM.md`

### Post-Ship Amendments (v4.16.1–v4.16.6)
- **v4.16.1**: Added missing `import { svg }` for arc template literals
- **v4.16.4**: Strip `subType` tagging, aggregate circuit exclusion from totals, UPS parent dedup, strip child dedup
- **v4.16.5**: Strip parent/child classification via `via_device_id` check (Kasa HS300 inherited model fix)
- **v4.16.6**: Parent-owned switch matching for child outlets (normalized name comparison), LCARS sliding track toggles replacing all pill-style toggles

---

## 0. Problem Statement

The current implementation creates **one `_renderPowerPanel(group)` call per power device** in an area. Each device becomes a separate right-column panel with its own header, frame, sections, and vertical footprint.

**Evidence** (from Admiral's mockups):

- **Office area**: A single "Dog Heating Pad" smart plug gets an entire "POWER SYSTEMS" panel in the right column — just for one toggle + 6W readout.
- **Server Room area**: 2 power strips + 6 Emporia Vue circuits = **8 separate "POWER SYSTEMS" panels**, each with full frame chrome, stacked in a 2-column grid. This consumes ~4 screens of vertical scroll.

**Root cause** in code: `_renderAreaContent()` iterates `byDevice` groups, classifies each as `PANEL_TYPE_POWER`, and pushes each into `panelDevices[]`. The template then maps over `panelDevices` calling `_renderDevicePanel()` → `_renderPowerPanel(group)` once per device.

**Required outcome**: All power devices in an area are aggregated into **one consolidated power panel**, rendered in the **left content flow** (bottom of the normal device stack), not in the right panel column.

---

## 1. Data Aggregation Strategy

### 1.1 Intercept in `_renderAreaContent()`

Currently (line ~6759 of `lcars-homepage-card.js`):

```js
for (const group of byDevice.values()) {
  const panelType = this._getDevicePanelType(group.entities);
  if (panelType) {
    panelDevices.push({ ...group, panelType });
  } else {
    normalDevices.push(group);
  }
}
```

**Change**: Collect power groups separately instead of pushing them into `panelDevices`:

```js
const panelDevices = [];
const normalDevices = [];
const powerGroups = [];  // ← NEW: collect all power devices for this area

for (const group of byDevice.values()) {
  const panelType = this._getDevicePanelType(group.entities);
  if (panelType === PANEL_TYPE_POWER) {
    powerGroups.push({ ...group, panelType, subType: this._classifyPowerDevice(group.entities, group.device) });
  } else if (panelType) {
    panelDevices.push({ ...group, panelType });
  } else {
    normalDevices.push(group);
  }
}
```

### 1.2 Build Consolidated Power Collection

After the loop, aggregate power groups into a structured collection:

```js
// Aggregate all power device groups for this area
const powerCollection = powerGroups.length > 0
  ? this._buildPowerCollection(powerGroups)
  : null;
```

### 1.3 `_buildPowerCollection(powerGroups)` — New Method

This method takes all power device groups for an area and organizes them by type:

```js
_buildPowerCollection(powerGroups) {
  const vueCircuits = [];
  const plugs = [];
  const stripParents = [];
  const stripChildren = new Map(); // keyed by parent device ID

  // First pass: classify each device group
  for (const group of powerGroups) {
    switch (group.subType) {
      case 'vue':
        vueCircuits.push(group);
        break;
      case 'strip':
        stripParents.push(group);
        stripChildren.set(group.device.id, []);
        break;
      case 'plug':
        plugs.push(group);
        break;
      default:
        // Sensor-only devices without switches — treat as circuits
        vueCircuits.push(group);
        break;
    }
  }

  // Second pass: assign plug children to strip parents via via_device_id
  const orphanPlugs = [];
  for (const plug of plugs) {
    const parentId = plug.device?.via_device_id;
    if (parentId && stripChildren.has(parentId)) {
      stripChildren.get(parentId).push(plug);
    } else {
      orphanPlugs.push(plug);
    }
  }

  // Process circuits: detect 240V pairs, sort by power descending
  const processedCircuits = this._sortCircuits(this._detect240VPairs(vueCircuits));

  // Compute area-wide totals
  const allGroups = [...vueCircuits, ...orphanPlugs, ...stripParents];
  const totalWatts = allGroups.reduce((sum, g) => sum + (this._getPrimaryPower(g) || 0), 0);
  const totalEnergy = allGroups.reduce((sum, g) => sum + (this._getPrimaryEnergy(g) || 0), 0);

  // Build strip objects with children attached
  const strips = stripParents.map(parent => ({
    parent,
    children: stripChildren.get(parent.device.id) || [],
  }));

  return {
    circuits: processedCircuits,
    plugs: orphanPlugs,
    strips,
    totalWatts,
    totalEnergy,
    deviceCount: powerGroups.length,
  };
}
```

**Key design decisions**:
- Strip child assignment uses HA's `via_device_id` — this is how TP-Link HS300 outlets relate to their parent strip. No heuristic name matching.
- Plugs that don't belong to any strip parent are "orphan plugs" — rendered in the MONITORED DEVICES section.
- Vue circuits and sensor-only devices are combined — they render identically as circuit tiles.
- 240V pair detection reuses the existing `_detect240VPairs()` method unchanged.

---

## 2. Rendering — Left-Column Placement

### 2.1 Inject into `normalContent` (Bottom of Stack)

Currently, `normalContent` renders `normalDevices` + `noDevice`. The consolidated power panel appends at the bottom:

```js
const normalContent = html`
  ${normalDevices.map((group) => html`
    <div class="device-group">
      <!-- ... existing normal device rendering unchanged ... -->
    </div>
  `)}
  ${noDevice.length > 0 ? html`
    <div class="device-group">
      <!-- ... existing "Other Entities" unchanged ... -->
    </div>
  ` : ''}
  ${powerCollection ? this._renderConsolidatedPowerPanel(powerCollection) : ''}
`;
```

This places the consolidated power panel **below all normal device groups** in the left content column. It participates in the normal document flow — no absolute positioning, no float.

### 2.2 Two-Column Layout Unchanged

The `area-split-layout` template is unmodified. If the area has other panel devices (camera, climate, media, battery, etc.), the two-column split still applies — the consolidated power panel sits at the bottom of `area-split-main`, while cameras/climate/etc. remain in `area-split-panels`.

If the area has ONLY power devices and no other panel types, `panelDevices` will be empty, and the layout falls back to single-column — the consolidated power panel fills the full width.

---

## 3. Consolidated Panel Renderer

### 3.1 `_renderConsolidatedPowerPanel(collection)` — New Method

This replaces per-device `_renderPowerPanel(group)` calls with a single area-wide panel:

```js
_renderConsolidatedPowerPanel(collection) {
  const { circuits, plugs, strips, totalWatts, totalEnergy, deviceCount } = collection;
  const thresholds = this._config?.power_thresholds || {};
  const panelColor = getPowerColor(totalWatts, thresholds);
  const hasCritical = totalWatts > (thresholds.highMax || 3000);

  // Section counts for the header badge
  const sectionCounts = [];
  if (circuits.length) sectionCounts.push(`${circuits.length} CIRCUIT${circuits.length !== 1 ? 'S' : ''}`);
  if (plugs.length) sectionCounts.push(`${plugs.length} DEVICE${plugs.length !== 1 ? 'S' : ''}`);
  if (strips.length) sectionCounts.push(`${strips.length} STRIP${strips.length !== 1 ? 'S' : ''}`);

  return html`
    <div class="lcars-consolidated-power-panel"
      data-alert="${hasCritical ? 'critical' : ''}"
      role="region" aria-label="Power Systems">

      <!-- ═══ HEADER ═══ -->
      <div class="power-panel-header" role="heading" aria-level="3">
        <ha-icon icon="mdi:flash"></ha-icon>
        <span class="power-panel-name">POWER SYSTEMS</span>
        <div class="power-panel-header-line" aria-hidden="true"></div>
        <span class="power-panel-badge">${sectionCounts.join(' · ')}</span>
      </div>

      <!-- ═══ SUMMARY ROW ═══ -->
      <div class="power-summary" role="group" aria-label="Power Summary">
        ${this._renderPowerSummaryCard(
          'TOTAL USAGE', totalWatts, totalEnergy > 0 ? totalEnergy : null,
          panelColor, 'mdi:sigma'
        )}
      </div>

      <!-- ═══ ARC (when ≥3 total items) ═══ -->
      ${(circuits.length + plugs.length + strips.length) >= 3
        ? this._renderConsolidatedPowerArc(collection)
        : ''}

      <!-- ═══ CIRCUITS SECTION (Vue-type) ═══ -->
      ${circuits.length > 0 ? html`
        <div class="power-circuits-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">CIRCUITS</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${circuits.length}/${circuits.length}</span>
          </div>
          <div class="power-circuits" role="list" aria-label="Circuit Monitors">
            ${circuits.map(c => this._renderCircuitTile(c))}
          </div>
        </div>
      ` : ''}

      <!-- ═══ MONITORED DEVICES SECTION (orphan plugs) ═══ -->
      ${plugs.length > 0 ? html`
        <div class="power-devices-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">MONITORED DEVICES</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${plugs.length}/${plugs.length}</span>
          </div>
          <div class="power-devices" role="list" aria-label="Monitored Devices">
            ${plugs.map(p => this._renderPowerDeviceRow(p))}
          </div>
        </div>
      ` : ''}

      <!-- ═══ POWER STRIPS SECTION ═══ -->
      ${strips.length > 0 ? html`
        <div class="power-strips-section">
          <div class="power-section-label" role="heading" aria-level="4">
            <span class="power-section-label-text">POWER STRIPS</span>
            <div class="power-section-label-rule" aria-hidden="true"></div>
            <span class="power-section-label-count">${strips.length}/${strips.length}</span>
          </div>
          <div class="power-strips" role="list" aria-label="Power Strips">
            ${strips.map(({ parent, children }) => this._renderPowerStrip(parent, children))}
          </div>
        </div>
      ` : ''}

      <!-- Singleton popover element (Data C-5) -->
      <div popover id="power-detail-popover" class="power-detail-popover"
        role="dialog" aria-label="Circuit detail">
        <div class="popover-content"></div>
      </div>

      <div class="panel-pip-strip" aria-hidden="true"></div>
    </div>
  `;
}
```

### 3.2 `_renderConsolidatedPowerArc()` — Arc Across All Device Types

The existing `_renderPowerArc()` only accepts circuit groups. The consolidated version feeds it ALL power sources:

```js
_renderConsolidatedPowerArc(collection) {
  const { circuits, plugs, strips, totalWatts } = collection;

  // Build a unified list of power sources for the arc
  const allSources = [
    ...circuits.map(c => ({
      name: this._shortDeviceName(c.device) || 'Unknown',
      watts: c.combinedWatts != null ? c.combinedWatts : (this._getPrimaryPower(c) || 0),
    })),
    ...plugs.map(p => ({
      name: this._shortDeviceName(p.device) || 'Unknown',
      watts: this._getPrimaryPower(p) || 0,
    })),
    ...strips.map(({ parent }) => ({
      name: this._shortDeviceName(parent.device) || 'Strip',
      watts: this._getPrimaryPower(parent) || 0,
    })),
  ].filter(s => s.watts > 0);

  // Reuse existing arc renderer
  return this._renderPowerArc(
    allSources.map(s => ({ device: { name: s.name }, entities: [], combinedWatts: s.watts })),
    totalWatts
  );
}
```

---

## 4. Layout Structure — CSS

### 4.1 Consolidated Panel Frame

The consolidated panel uses the same frame style as the existing power panel, but it lives in the left content flow instead of the right panel column:

```css
/* ═══ Consolidated Power Panel (left-column, full-width) ═══ */
.lcars-consolidated-power-panel {
  --panel-frame-color: var(--lcars-butterscotch);

  display: grid;
  grid-template-areas:
    "header"
    "summary"
    "arc"
    "circuits"
    "devices"
    "strips"
    "pip";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto auto auto;
  gap: var(--lcars-gap);

  border-left: 4px solid var(--panel-frame-color);
  border-top: 2px solid var(--panel-frame-color);
  border-right: 2px solid var(--panel-frame-color);
  border-bottom: 4px solid var(--panel-frame-color);
  border-radius: 0.75rem;
  padding: var(--lcars-gap);
  background: var(--lcars-black);
  min-height: calc(var(--lcars-vunit) * 4);
  margin-top: var(--lcars-gap);

  /* Transition to critical state */
  transition: border-color 0.3s ease;
}

.lcars-consolidated-power-panel[data-alert="critical"] {
  --panel-frame-color: var(--lcars-tomato);
}
```

### 4.2 Section Grid Areas

```css
/* Assign grid areas to sections */
.lcars-consolidated-power-panel > .power-panel-header   { grid-area: header; }
.lcars-consolidated-power-panel > .power-summary         { grid-area: summary; }
.lcars-consolidated-power-panel > .power-arc-area        { grid-area: arc; }
.lcars-consolidated-power-panel > .power-circuits-section { grid-area: circuits; }
.lcars-consolidated-power-panel > .power-devices-section  { grid-area: devices; }
.lcars-consolidated-power-panel > .power-strips-section   { grid-area: strips; }
.lcars-consolidated-power-panel > .panel-pip-strip        { grid-area: pip; }
```

### 4.3 Circuit Tile Grid — Wider in Left Column

In the right panel column, circuit tiles were constrained to ~380px width. In the left column, they have more room. Adjust `minmax` for wider tiles:

```css
/* Circuits fill available width in left column */
.lcars-consolidated-power-panel .power-circuits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: var(--lcars-gap);
  max-height: 24rem;
  overflow-y: auto;
  mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2rem), transparent 100%);
}
```

### 4.4 Power Device Rows — Full Width

Plug rows stretch to fill the left column:

```css
.lcars-consolidated-power-panel .power-devices {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.lcars-consolidated-power-panel .power-device-row {
  display: flex;
  align-items: center;
  gap: var(--lcars-gap);
  padding: 0.35rem 0.5rem;
  border-left: 3px solid var(--circuit-color, var(--lcars-gray));
  cursor: pointer;
  transition: background 0.15s ease;
}

.lcars-consolidated-power-panel .power-device-row:hover,
.lcars-consolidated-power-panel .power-device-row:focus-visible {
  background: rgba(255, 255, 255, 0.04);
  outline: 2px solid var(--lcars-sunflower);
  outline-offset: -2px;
}
```

### 4.5 Power Strip Block — Nested Hierarchy

Strips render as a bordered block containing their child outlets:

```css
.lcars-consolidated-power-panel .power-strip-block {
  border: 1px solid var(--lcars-gray);
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  background: rgba(102, 102, 136, 0.05);
}

.lcars-consolidated-power-panel .power-strip-header {
  display: flex;
  align-items: center;
  gap: var(--lcars-gap);
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--lcars-gray);
  margin-bottom: var(--lcars-gap);
}

.lcars-consolidated-power-panel .power-strip-children {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.75rem;       /* Indent children under parent */
  border-left: 2px solid var(--lcars-gray);
  margin-left: 0.5rem;
}
```

---

## 5. Interaction Model — Clickable Metrics

### 5.1 Click Targets

Every power reading must open the HA more-info dialog for its backing entity. This is the Admiral's #6 requirement.

| Element | Click Action | Entity Source |
|---------|-------------|---------------|
| Circuit tile | Popover (if supported) → `showMoreInfo()` via "VIEW FULL HISTORY" button | First `device_class: power` sensor in the circuit's entity list |
| Circuit tile watts value | Direct `showMoreInfo()` on the power sensor entity | `sensor.*_power` |
| Circuit tile energy value | Direct `showMoreInfo()` on the energy sensor entity | `sensor.*_energy` |
| Plug row watts value | `showMoreInfo()` on the power sensor entity | `sensor.*_power` |
| Plug row energy value | `showMoreInfo()` on the energy sensor entity | `sensor.*_energy` |
| Plug row toggle | `switch.toggle` service call (existing behavior) | `switch.*` |
| Strip total watts | `showMoreInfo()` on the strip's primary power sensor | Parent device power sensor |
| Strip child outlet watts | `showMoreInfo()` on the child's power sensor | Child device power sensor |
| Strip child toggle | `switch.toggle` service call | Child device switch |
| Summary total watts | `showMoreInfo()` on the highest-wattage device's power sensor | Best-effort: first power sensor |
| Summary total energy | No action (aggregate, no single entity) | — |

### 5.2 Implementation Pattern for Clickable Values

Add a click handler wrapper for individual sensor values. Reuse the existing `_handleEntityClick()`:

```js
// Clickable power value — wraps the numeric display
_renderClickableValue(entityId, displayHtml) {
  if (!entityId) return displayHtml;
  return html`
    <span class="power-clickable-value"
      role="button" tabindex="0"
      aria-label="View details"
      @click=${(e) => { e.stopPropagation(); this._handleEntityClick(entityId); }}
      @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleEntityClick(entityId); } }}>
      ${displayHtml}
    </span>
  `;
}
```

CSS for clickable values:

```css
.power-clickable-value {
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.15s ease;
}

.power-clickable-value:hover,
.power-clickable-value:focus-visible {
  border-bottom-color: var(--lcars-sunflower);
}
```

### 5.3 Updated Circuit Tile with Per-Metric Clicks

```js
_renderCircuitTile(circuit) {
  const watts = circuit.combinedWatts != null ? circuit.combinedWatts : this._getPrimaryPower(circuit);
  const energy = circuit.combinedEnergy != null ? circuit.combinedEnergy : this._getPrimaryEnergy(circuit);
  const thresholds = this._config?.power_thresholds || {};
  const color = getPowerColor(watts, thresholds);
  const tier = getPowerLabel(watts, thresholds);
  const indicator = this._getPowerIndicator(watts);
  const name = this._shortDeviceName(circuit.device) || 'Unknown';
  const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';

  // Find individual entity IDs for per-metric clicks
  const powerEntityId = circuit.entities?.find(e =>
    e.state?.attributes?.device_class === 'power')?.entity?.entity_id;
  const energyEntityId = circuit.entities?.find(e =>
    e.state?.attributes?.device_class === 'energy')?.entity?.entity_id;

  return html`
    <div class="power-circuit-tile"
      style="--circuit-color:${color}"
      role="listitem"
      tabindex="0"
      aria-label="${name}: ${watts != null ? Math.round(watts) + ' watts, ' + tier.toLowerCase() : 'unavailable'}"
      @click=${() => supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(powerEntityId)}
      @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); supportsPopover ? this._showCircuitPopover(circuit) : showMoreInfo(powerEntityId); }}}>
      <div class="power-circuit-name">
        <span class="power-circuit-indicator" aria-hidden="true">${circuit.is240V ? '●●' : indicator}</span>
        <span>${name}</span>
      </div>
      <div class="power-circuit-value-row">
        ${this._renderClickableValue(powerEntityId, html`
          <span class="power-circuit-watts">${this._formatWatts(watts)}</span>
        `)}
      </div>
      ${energy != null ? this._renderClickableValue(energyEntityId, html`
        <span class="power-circuit-energy">${this._formatEnergy(energy)} TODAY</span>
      `) : ''}
    </div>
  `;
}
```

---

## 6. Strip Hierarchy — Parent/Child Nesting

### 6.1 Visual Structure

```
┌─ POWER STRIPS ────────────────────────────────────────── 2/2 ─┐
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SERVER STACK LOWER STRIP    [ON]    TOTAL: 487 W      │   │ ← Parent header
│  │  ─────────────────────────────────────────────────────  │   │
│  │  ┊  [ON]  OUTLET 1 — NAS              189 W  4.2 kWh  │   │ ← Indented children
│  │  ┊  [ON]  OUTLET 2 — SWITCH            12 W  0.3 kWh  │   │
│  │  ┊  [OFF] OUTLET 3 — UNUSED             0 W  0.0 kWh  │   │
│  │  ┊  [ON]  OUTLET 4 — UPS              186 W  4.1 kWh  │   │
│  │  ┊  [ON]  OUTLET 5 — PI CLUSTER       100 W  2.2 kWh  │   │
│  │  ┊  [OFF] OUTLET 6 — EMPTY              0 W  0.0 kWh  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LS-P2-UPPERSTRIP            [ON]    TOTAL: 119 W      │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  ┊  [ON]  DEVICE A                     85 W  1.8 kWh  │   │
│  │  ┊  [ON]  DEVICE B                     34 W  0.7 kWh  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Parent Strip Header

The existing `_renderPowerStrip()` already renders the parent header with master toggle + total wattage. **No changes needed** to the strip header renderer — it works correctly.

### 6.3 Child Assignment via `via_device_id`

TP-Link HS300 power strips expose a parent device (the strip hub) and 6 child devices (individual outlets). HA links them via `device.via_device_id`. The `_buildPowerCollection()` method (§1.3 above) uses this relationship.

**Edge case**: If a plug's `via_device_id` points to a device that wasn't classified as a strip (e.g., a hub device that also has non-power entities), the plug becomes an "orphan plug" and renders in the MONITORED DEVICES section. This is safe — no data loss, just potentially suboptimal grouping.

### 6.4 Child Outlet Row — Clickable Watts & Energy

The existing `_renderStripChild()` method renders each child. Enhancement: make watts and energy values individually clickable:

```js
_renderStripChild(childGroup) {
  const name = this._shortDeviceName(childGroup.device) || 'Outlet';
  const { switches, powerSensors, energySensors } = this._partitionPowerEntities(childGroup.entities);
  const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
  const energy = energySensors[0] ? parseFloat(energySensors[0].state?.state) || null : null;
  const thresholds = this._config?.power_thresholds || {};
  const color = getPowerColor(watts, thresholds);
  const childSwitch = switches[0];
  const isOn = childSwitch?.state?.state === 'on';

  const powerEntityId = powerSensors[0]?.entity?.entity_id;
  const energyEntityId = energySensors[0]?.entity?.entity_id;

  return html`
    <div class="power-strip-child-tile" style="--tile-power-color:${color}"
      role="listitem" aria-label="${name}: ${isOn ? 'on' : 'off'}, ${Math.round(watts)} watts">
      <span class="circuit-name">${name}</span>
      <div class="strip-child-controls">
        ${childSwitch ? html`
          <button class="strip-child-toggle"
            ?data-on=${isOn}
            role="switch" aria-checked="${isOn}"
            aria-label="Toggle ${name}"
            @click=${(e) => { e.stopPropagation(); if (this._powerToggleLimiter.allow()) this._handleToggle(childSwitch.entity.entity_id); }}>
            ${isOn ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        ${this._renderClickableValue(powerEntityId, html`
          <span class="circuit-watts" style="color:${color}">
            <span class="power-dot" ?data-zero=${watts === 0} aria-hidden="true"></span>
            ${this._formatWatts(watts)}
          </span>
        `)}
        ${energy != null ? this._renderClickableValue(energyEntityId, html`
          <span class="circuit-energy">${this._formatEnergy(energy)}</span>
        `) : ''}
      </div>
    </div>
  `;
}
```

---

## 7. Responsive Behavior

### 7.1 Width Context Change

The consolidated panel now lives in `area-split-main` (left column) instead of `area-split-panels` (right column). In the two-column layout, `area-split-main` is typically wider (~60–65% of content width). In single-column fallback, it's 100%.

This means circuit tiles have **more horizontal room** than before, which is beneficial for areas with many circuits.

### 7.2 Breakpoints

```css
/* ─── Desktop (≥1024px) — Left column, ~60% width ─── */
.lcars-consolidated-power-panel .power-circuits {
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
}

/* ─── Tablet (768–1023px) — Tighter tiles ─── */
@media (max-width: 1023px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }
}

/* ─── Mobile (<768px) — 2-column tile grid ─── */
@media (max-width: 767px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: 1fr 1fr;
    max-height: 16rem;
  }

  .lcars-consolidated-power-panel .power-device-row {
    flex-wrap: wrap;
  }

  .lcars-consolidated-power-panel .power-strip-children {
    padding-left: 0.5rem;
  }
}

/* ─── Narrow mobile (<480px) — Single column tiles ─── */
@media (max-width: 479px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: 1fr;
  }
}
```

### 7.3 Max-Height & Scroll

The circuit grid retains `max-height: 24rem` with the bottom fade mask. For areas like the Admiral's Server Room (6+ Vue circuits + 2 strips), the circuits section scrolls while strips remain visible below.

For extreme cases (40+ circuits on Main Panel), the 24rem cap prevents the panel from dominating the page. The fade mask communicates "scroll for more."

---

## 8. Sparkline Placement Strategy

### 8.1 Problem

The current per-device panels show a sparkline for each circuit. With 8 separate panels × 1 sparkline each, that's already expensive. In a consolidated panel with 40+ circuits, that's 40+ sparkline history fetches and SVG renders — a performance concern.

### 8.2 Recommendation: Sparklines in Popover Only

**Remove sparklines from circuit tiles in the consolidated grid.** Instead:

1. **Circuit tiles**: Show only the numeric watts + energy. Compact, scannable, space-efficient.
2. **Popover detail** (on click): Shows the sparkline for that specific circuit. This is lazy — only fetched when the user taps a circuit.
3. **Power Arc** (in summary): Provides the at-a-glance distribution visualization for the whole panel.

**Rationale**:
- The Admiral's primary complaint is wasted vertical space. Sparklines inside tiles add ~20px height per tile and require a wider `minmax` — directly contradicting the consolidation goal.
- The popover already exists and already shows sparklines (per Wesley Addendum §2.1).
- Performance: Fetching 40+ `history/period` API calls on render is expensive. Lazy fetch on popover open is much cheaper.
- The power arc serves the "at-a-glance trend" role that per-tile sparklines were filling.

### 8.3 Optional: Summary Sparkline

If the Admiral wants one "area-wide" trend line, a single sparkline for the highest-wattage device could appear in the summary section:

```js
// Optional: Show a single sparkline for the area's primary power sensor
${primaryPowerEntityId ? html`
  <div class="power-summary-sparkline">
    ${renderSparkline(this._sparklineCache?.get(primaryPowerEntityId), {
      color: panelColor, width: '100%', height: 32, className: 'power-area-sparkline'
    })}
    <span class="power-sparkline-label">24H TOTAL DRAW</span>
  </div>
` : ''}
```

This is **one** API call, **one** SVG — acceptable cost.

---

## 9. Visual Comparison — Before vs. After

### Before (Server Room — 8 panels)

```
┌─ area-split-panels (right column) ──────────────────────┐
│                                                          │
│  ┌── SERVER STACK LOWER STRIP ── POWER SYSTEMS ──────┐  │
│  │  [full panel frame + strip content]               │  │  ~300px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── LS-P2-UPPERSTRIP ── POWER SYSTEMS ──────────────┐  │
│  │  [full panel frame + strip content]               │  │  ~300px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── DISHWASHER ── POWER SYSTEMS ────────────────────┐  │
│  │  [full panel frame + sparkline + stats]           │  │  ~250px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── LIGHTING ── POWER SYSTEMS ──────────────────────┐  │
│  │  [full panel frame + sparkline + stats]           │  │  ~250px
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌── GARAGE LIGHT BATHROOM ── POWER SYSTEMS ─────────┐  │  ... continues
│  ┌── UPSTAIRS BEDROOM BATHROOM ── POWER SYSTEMS ─────┐  │  ... 4 more
│  ┌── HALLWAY LIGHT ── POWER SYSTEMS ─────────────────┐  │
│  ┌── GARAGE OPENERS ── POWER SYSTEMS ────────────────┐  │
│                                                          │
│  Total vertical: ~2000px+ (4+ screens of scroll)        │
└──────────────────────────────────────────────────────────┘
```

### After (Server Room — 1 consolidated panel)

```
┌─ area-split-main (left column, bottom) ─────────────────────────────────┐
│                                                                          │
│  ┌── ⚡ POWER SYSTEMS ───── 6 CIRCUITS · 2 STRIPS ──────────────────┐   │
│  │                                                                    │  │
│  │  TOTAL USAGE: 806 W  ·  12.4 kWh TODAY                           │  │  ~40px
│  │                                                                    │  │
│  │  ┌─ CIRCUITS ──────────────────────────────────── 6/6 ─┐         │  │
│  │  │ ● DISHWASH │ ● LIGHTING │ ○ GARAGE LT │ ● UPSTAIRS │         │  │  ~100px
│  │  │   0 W      │   0 W      │   0 W       │   0 W      │         │  │  (2 rows)
│  │  │   0.7 kWh  │   0.7 kWh  │   0.7 kWh   │   0.7 kWh  │         │  │
│  │  │ ○ HALLWAY  │ ● GARAGE O │              │             │         │  │
│  │  │   0 W      │   0 W      │              │             │         │  │
│  │  └─────────────────────────────────────────────────────┘         │  │
│  │                                                                    │  │
│  │  ┌─ POWER STRIPS ─────────────────────────────── 2/2 ─┐         │  │
│  │  │  SERVER STACK LOWER STRIP  [ON]  TOTAL: 487 W      │         │  │  ~120px
│  │  │  ┊ [ON] OUTLET 1 — NAS        189W  4.2kWh         │         │  │
│  │  │  ┊ [ON] OUTLET 2 — SWITCH      12W  0.3kWh         │         │  │
│  │  │  ┊ ...                                              │         │  │
│  │  │                                                      │         │  │
│  │  │  LS-P2-UPPERSTRIP             [ON]  TOTAL: 119 W   │         │  │  ~60px
│  │  │  ┊ [ON] DEVICE A               85W  1.8kWh         │         │  │
│  │  │  ┊ [ON] DEVICE B               34W  0.7kWh         │         │  │
│  │  └──────────────────────────────────────────────────────┘         │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Total vertical: ~400px (1 panel, < 1 screen)                           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Space savings**: ~80% vertical reduction for the Server Room. For the Office, the Dog Heating Pad goes from its own full panel to a single row inside the consolidated panel.

---

## 10. Migration & Backward Compatibility

### 10.1 What Changes

| Component | Before | After |
|-----------|--------|-------|
| `_renderAreaContent()` | Power devices → `panelDevices[]` → right column | Power devices → `powerGroups[]` → consolidated left column |
| `_renderPowerPanel(group)` | Called once per power device | **Deprecated** — replaced by `_renderConsolidatedPowerPanel(collection)` |
| `_renderDevicePanel()` switch | `case PANEL_TYPE_POWER:` dispatches to `_renderPowerPanel` | Remove the `PANEL_TYPE_POWER` case (power never reaches this function) |
| `_renderCircuitTile()` | Unchanged logic | Enhanced with per-metric `_renderClickableValue()` wrappers |
| `_renderPowerStrip()` | Called inside `_renderPowerPanel()` with empty children array | Called inside consolidated panel with actual children from `_buildPowerCollection()` |
| `_renderStripChild()` | Unchanged logic | Enhanced with per-metric click targets |

### 10.2 What Stays the Same

- `_classifyPowerDevice()` — unchanged
- `_partitionPowerEntities()` — unchanged
- `_getPrimaryPower()` / `_getPrimaryEnergy()` — unchanged
- `_detect240VPairs()` / `_sortCircuits()` — unchanged
- `_renderPowerSummaryCard()` — unchanged
- `_renderPowerArc()` — unchanged (called differently but same renderer)
- `getPowerColor()` / `getPowerLabel()` in `lcars-color-utils.js` — unchanged
- `_showCircuitPopover()` — unchanged
- `_powerToggleLimiter` — unchanged (Worf-approved rate limiting still in effect)
- All CSS variables and color tokens — unchanged

### 10.3 Old `_renderPowerPanel()` Disposition

Keep the method body but mark as `@deprecated`. If we ever need per-device power rendering (e.g., a future "detail view" drill-down), it's available. For v4.15.2, it simply won't be called from the normal rendering path.

---

## 11. Implementation Checklist

1. **`_buildPowerCollection(powerGroups)`** — New method (§1.3)
2. **`_renderConsolidatedPowerPanel(collection)`** — New method (§3.1)
3. **`_renderConsolidatedPowerArc(collection)`** — New method (§3.2)
4. **`_renderClickableValue(entityId, displayHtml)`** — New utility method (§5.2)
5. **Modify `_renderAreaContent()`** — Separate `powerGroups` from `panelDevices` (§1.1), append consolidated panel to `normalContent` (§2.1)
6. **Modify `_renderCircuitTile()`** — Add per-metric click targets (§5.3)
7. **Modify `_renderStripChild()`** — Add per-metric click targets (§6.4)
8. **Add CSS** — `.lcars-consolidated-power-panel` styles (§4), clickable value styles (§5.2), responsive breakpoints (§7.2)
9. **Remove sparklines from circuit tiles** — Move to popover-only (§8.2)
10. **Remove `PANEL_TYPE_POWER` case from `_renderDevicePanel()`** — Power no longer routes through right-column dispatch (§10.1)

---

## 12. Team Review Flags

- **Geordi**: The consolidated panel's frame style, grid layout, and left-column placement need his sign-off. The panel is using the same border-radius, border-thickness pattern, and typography as existing panels — but the wider layout context may need visual tuning.
- **Worf**: No new security surface. Toggle rate-limiting (`_powerToggleLimiter`) remains. No new external API calls. The `_renderClickableValue()` method only calls `_handleEntityClick()` which delegates to HA's `showMoreInfo()` — same trust boundary. No new DOM injection vectors (all values go through lit-html's template literal escaping).

---

## 13. Future Enhancements (Not in Scope for 4.15.2)

- **Collapsible sections**: Allow user to collapse CIRCUITS / DEVICES / STRIPS sections within the consolidated panel (CSS `details`/`summary` or a toggle button).
- **Drag-to-reorder**: Let users reorder sections or pin circuits to the top.
- **Mini power arc inline**: A tiny 48px-wide arc inside each circuit tile showing that circuit's proportion of total — only if the Admiral requests it.
- **EPS flow view toggle**: The v4.16.0 Sankey-style flow diagram (from Wesley Addendum §Q2) would be a view mode within the consolidated panel rather than a separate panel.
