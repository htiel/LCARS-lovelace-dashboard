# LCARS Power Panel — Wesley's Creative Technology Addendum

**Author**: Wesley Crusher (Creative Technology & Web API Integration)  
**Reference**: `specs/LCARS-POWER-PANEL-SPEC.md` (Geordi's design authority spec)  
**Date**: Stardate 2026.04.14  
**Status**: **SHIPPED** — v4.15.0  
**Backlog Item**: 4X-3  

---

## Purpose

This document is Wesley's companion to Geordi's Power Panel spec. It covers:

1. **Answers to Geordi's §13 Open Questions** — design decisions requiring creative/tech input
2. **Web API Integrations** — Popover API, Scroll-Driven Animations, `text-wrap: balance`
3. **EPS Power Distribution Summary Visualization** — the "wow factor" aggregate chart
4. **Power Strip Hierarchy Rendering** — parent/child visual relationships
5. **Performance Engineering** — sparkline batching for 60+ entity areas
6. **Detector Logic Refinements** — non-overlap with battery panel

---

## 1. Answers to Geordi's Open Questions (§13)

### Q1: Doughnut/Bar Chart in Summary Section?

**Yes — an inline SVG segmented arc.** Not a full doughnut (too consumer-dashboard, not LCARS), but a **half-arc power distribution meter** in the summary section header. Think of it as the curved power allocation bar from TNG's Main Engineering master display.

The arc shows the **top 5 circuits by consumption** as colored segments, with remaining circuits grouped as a "OTHER" segment. It sits alongside the total wattage number in the header.

```
                    ╭━━━━━━━╮
                ╭━━━╯ HVAC  ╰━━━╮
            ╭━━━╯   2400W       ╰━━━╮
        ╭━━━╯                        ╰━━╮
    ╭━━━╯  OTHER                  DRYER ╰━╮
   ╭╯  847W                      4800W    ╰╮
   ╰─FRIDGE──WASHER──KITCHEN─────────────────╯
      85W     487W    120W

                   8739 W
              TODAY: 47.2 kWh
```

**Implementation** — Pure inline SVG, no library:

```js
_renderPowerArc(circuits, totalWatts) {
  if (!circuits.length || totalWatts === 0) return '';

  // Sort by power, take top 5
  const sorted = [...circuits]
    .map(c => ({ name: this._shortDeviceName(c.device), watts: this._getPrimaryPower(c) || 0 }))
    .filter(c => c.watts > 0)
    .sort((a, b) => b.watts - a.watts);

  const top5 = sorted.slice(0, 5);
  const otherWatts = sorted.slice(5).reduce((sum, c) => sum + c.watts, 0);
  if (otherWatts > 0) top5.push({ name: 'OTHER', watts: otherWatts });

  // Arc geometry: 180° half-circle, left to right
  const cx = 120, cy = 100, r = 80;
  const startAngle = Math.PI; // left
  const totalAngle = Math.PI; // sweep right

  let currentAngle = startAngle;
  const segments = top5.map(seg => {
    const fraction = seg.watts / totalWatts;
    const sweep = fraction * totalAngle;
    const endAngle = currentAngle - sweep;

    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy - r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy - r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const color = getPowerColor(seg.watts);

    const path = `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
    currentAngle = endAngle;

    return { path, color, name: seg.name, watts: seg.watts, fraction };
  });

  return html`
    <svg class="power-distribution-arc" viewBox="0 0 240 120"
      role="img" aria-label="Power distribution: ${totalWatts}W total">
      <!-- Segments -->
      ${segments.map(seg => svg`
        <path d="${seg.path}" fill="none" stroke="${seg.color}"
          stroke-width="10" stroke-linecap="butt">
          <title>${seg.name}: ${Math.round(seg.watts)}W (${Math.round(seg.fraction * 100)}%)</title>
        </path>
      `)}
      <!-- Background arc (unallocated) -->
      <path d="M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy}"
        fill="none" stroke="var(--lcars-gray)" stroke-width="10"
        stroke-linecap="butt" opacity="0.15" />
      <!-- Total text -->
      <text x="${cx}" y="${cy - 15}" text-anchor="middle"
        fill="var(--lcars-text-heading)" font-family="var(--lcars-font)"
        font-size="28" font-weight="bold">
        ${this._formatWatts(totalWatts)}
      </text>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle"
        fill="var(--lcars-space-white)" font-family="var(--lcars-font)"
        font-size="10" opacity="0.7">
        TOTAL
      </text>
    </svg>
  `;
}
```

**CSS**:
```css
.power-distribution-arc {
  width: 100%;
  max-width: 15rem;
  height: auto;
  margin: 0 auto;
}
```

**Design review for Geordi**: The arc uses the same power-level color palette from §2.1. Each segment gets the color corresponding to its own wattage tier. The `stroke-linecap: butt` keeps segments flush (no rounded cap overlap). A 1px gap between segments can be achieved with `stroke-dashoffset` if Geordi wants visual separation.

### Q2: Power Flow Animation / EPS Conduit View?

**Deferred to v4.16.0+.** Concur with Geordi's assessment — a full EPS conduit topology view (à la `power-flow-card-plus`) is scope creep for v4.15.0. Here's what I'd propose for the future:

**v4.15.0**: The mains summary section already has animated flow conduits (reusing battery panel's `io-conduit` CSS). That's sufficient animated flow for launch.

**v4.16.0 candidate** (post-extraction): A dedicated "EPS Grid" view within the power panel that shows Sankey-style flow from mains → circuits using pure CSS/SVG. When panels are extracted to individual custom elements, each power panel could toggle between "tile grid" and "flow diagram" views using the **View Transition API** for a smooth crossfade. The conduit paths would be rendered as SVG `<path>` elements with animated `stroke-dashoffset` — same flat LCARS aesthetic, no 3D.

### Q3: Configurable Thresholds?

**Yes, expose via `_config` but with sensible defaults.** The tier boundaries (0/500/1500/3000) work for US 120V residential. For EU 230V or commercial, higher thresholds make sense. Add optional config in the card YAML:

```yaml
# Example: EU residential with higher base loads
type: custom:lcars-homepage-card
power_thresholds:
  low_max: 800      # Default: 500
  moderate_max: 2500 # Default: 1500
  high_max: 5000    # Default: 3000
```

Implementation — `getPowerColor()` accepts optional threshold overrides (same pattern as `getTempColor()` in lcars-color-utils.js):

```js
export function getPowerColor(watts, thresholds = {}) {
  const {
    lowMax = 500,
    moderateMax = 1500,
    highMax = 3000,
  } = thresholds;

  if (watts == null || isNaN(watts)) return 'var(--lcars-disabled)';
  const w = Math.abs(Number(watts));
  if (w === 0)          return 'var(--lcars-gray)';
  if (w <= lowMax)      return 'var(--lcars-ice)';
  if (w <= moderateMax) return 'var(--lcars-sunflower)';
  if (w <= highMax)     return 'var(--lcars-butterscotch)';
  return 'var(--lcars-tomato)';
}
```

The Geordi spec's 5-tier map (§2.1) has 5 tiers; I'm proposing 4 config boundaries with the 5th (critical/tomato) being anything above `highMax`. Geordi's gray/off tier at 0W is not configurable — it's always zero.

**Worf note**: Thresholds come from the YAML config object (validated by `setConfig()`), not from entity attributes. No injection vector.

### Q4: ESPHome-Flashed Vue Detection?

**Not in v4.15.0 scope.** The panel should work identically with cloud-API Vue and ESPHome-reflashed Vue — both expose the same `sensor.*_power_minute_average` entity pattern. The entity IDs might differ, but `device_class: power` is the same.

**Future enhancement (v4.16.0+)**: If we want a "local" badge, we could check the device's `config_entries` for an entry matching the `esphome` integration. A small `LOCAL` badge in the circuit tile would be a nice touch.

```js
// Future: detect ESPHome vs cloud
const isLocal = device.config_entries?.some(entry => {
  const configEntry = hass.config.config_entries?.[entry];
  return configEntry?.domain === 'esphome';
});
```

---

## 2. Web API Integrations

### 2.1 Popover API — Circuit Detail Popovers

**Baseline Status**: Newly Available (January 2025)  
**Browser Support**: Chrome 116+, Edge 116+, Firefox 125+, Safari 17+, Safari iOS 18.3+

This is the **highest-impact Web API addition** for the power panel. The problem: with 43+ circuits, tapping one currently fires `showMoreInfo()` which opens HA's generic more-info dialog — useful but generic, and it navigates away from the panel context. With the Popover API, we can show a **LCARS-styled detail overlay** that stays in context.

**What it replaces**: The existing `lcars-popup.js` creates a custom popup element and manually manages:
- z-index stacking (fragile in Shadow DOM)
- Click-outside dismissal (custom event listener)
- Focus trapping (manual)
- Escape key handling (manual)
- Backdrop overlay (manual)

The Popover API gives us **all of that for free** with a single HTML attribute.

**Implementation approach**:

Circuit tiles become `<button>` elements with `popovertarget`:

```js
_renderCircuitTile(circuit, sparklineData) {
  const watts = this._getPrimaryPower(circuit);
  const energy = this._getPrimaryEnergy(circuit);
  const color = getPowerColor(watts);
  const popoverId = `pwr-${circuit.device.id.slice(0, 8)}`;

  return html`
    <button class="power-circuit-tile"
      style="--tile-power-color:${color}"
      popovertarget="${popoverId}"
      aria-haspopup="dialog"
      aria-label="${this._shortDeviceName(circuit.device)}: ${watts != null ? Math.round(watts) + ' watts' : 'unavailable'}">
      <span class="circuit-name">${this._shortDeviceName(circuit.device)}</span>
      <div class="circuit-power-row">
        <span class="power-dot" ?data-zero=${watts === 0}></span>
        <span class="circuit-watts">${watts != null ? `${Math.round(watts)}W` : '—'}</span>
      </div>
      ${sparklineData ? renderSparkline(sparklineData, { color, width: 48, height: 16, className: 'power-mini-sparkline' }) : ''}
      ${energy != null ? html`<span class="circuit-energy">${energy.toFixed(1)} kWh</span>` : ''}
    </button>

    <div popover id="${popoverId}" class="power-detail-popover"
      role="dialog" aria-label="${this._shortDeviceName(circuit.device)} detail">
      <div class="popover-content">
        ${this._renderCircuitDetail(circuit, sparklineData)}
      </div>
    </div>
  `;
}
```

**Popover detail content**:

```js
_renderCircuitDetail(circuit, sparklineData) {
  const watts = this._getPrimaryPower(circuit);
  const energy = this._getPrimaryEnergy(circuit);
  const color = getPowerColor(watts);
  const label = getPowerLabel(watts);
  const name = this._shortDeviceName(circuit.device);

  return html`
    <div class="popover-header">
      <span class="popover-title">${name}</span>
      <span class="popover-status" style="color:${color}">${label}</span>
    </div>

    <div class="popover-hero-value" style="color:${color}">
      ${watts != null ? `${Math.round(watts)} W` : 'UNAVAILABLE'}
    </div>

    ${sparklineData ? html`
      <div class="popover-sparkline">
        ${renderSparkline(sparklineData, { color, width: 200, height: 40, className: 'power-detail-sparkline' })}
        <span class="popover-sparkline-label">24H POWER DRAW</span>
      </div>
    ` : ''}

    <div class="popover-stats">
      ${energy != null ? html`
        <div class="popover-stat-row">
          <span class="popover-stat-label">TODAY</span>
          <span class="popover-stat-value">${energy.toFixed(1)} kWh</span>
        </div>
      ` : ''}
      ${circuit.paired ? html`
        <div class="popover-stat-row">
          <span class="popover-stat-label">CIRCUIT TYPE</span>
          <span class="popover-stat-value" style="color:var(--lcars-butterscotch)">240V PAIRED</span>
        </div>
      ` : ''}
    </div>

    <button class="lcars-btn popover-history-btn"
      @click=${() => showMoreInfo(circuit.entries[0]?.entity?.entity_id)}>
      VIEW FULL HISTORY
    </button>
  `;
}
```

**Popover CSS — LCARS-styled top-layer overlay**:

```css
/* ─── Circuit Detail Popover ─── */
.power-detail-popover {
  /* Browser default reset */
  margin: auto;
  padding: 0;
  border: none;
  background: transparent;
  overflow: visible;
  max-width: min(26rem, 90vw);
  min-width: 18rem;

  /* Entry/exit animation with @starting-style */
  opacity: 0;
  transform: translateY(0.5rem) scale(0.98);
  transition:
    opacity var(--lcars-transition-slow) ease-out,
    transform var(--lcars-transition-slow) ease-out,
    overlay var(--lcars-transition-slow) allow-discrete,
    display var(--lcars-transition-slow) allow-discrete;
}

.power-detail-popover:popover-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  .power-detail-popover:popover-open {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.98);
  }
}

/* Popover backdrop (subtle, not opaque) */
.power-detail-popover::backdrop {
  background: rgba(0, 0, 0, 0.5);
  transition: background-color var(--lcars-transition-slow);
}

@starting-style {
  .power-detail-popover::backdrop {
    background: rgba(0, 0, 0, 0);
  }
}

/* Content frame — LCARS card styling */
.popover-content {
  background: var(--lcars-black);
  border: 2px solid var(--lcars-butterscotch);
  border-left-width: 4px;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-family: var(--lcars-font);
  color: var(--lcars-text);
  text-transform: uppercase;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--lcars-gray);
  margin-bottom: 0.5rem;
}

.popover-title {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
}

.popover-status {
  font-size: var(--lcars-font-size-data);
  font-weight: 700;
}

.popover-hero-value {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  padding: 0.5rem 0;
}

.popover-sparkline {
  padding: 0.5rem 0;
}

.popover-sparkline-label {
  display: block;
  font-size: 0.6rem;
  color: var(--lcars-gray);
  text-align: center;
  margin-top: 0.25rem;
}

.popover-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.popover-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--lcars-font-size-data);
}

.popover-stat-label {
  color: var(--lcars-space-white);
  opacity: 0.7;
}

.popover-stat-value {
  color: var(--lcars-ice);
  font-weight: 700;
}

.popover-history-btn {
  width: 100%;
  margin-top: 0.5rem;
  justify-content: center;
}

@media (prefers-reduced-motion: reduce) {
  .power-detail-popover {
    transition: none;
  }
  .power-detail-popover::backdrop {
    transition: none;
  }
}
```

**Progressive enhancement**: Since Popover is Newly Available (not Widely Available), provide fallback:

```js
_renderCircuitTile(circuit, sparklineData) {
  const supportsPopover = HTMLElement.prototype.hasOwnProperty('popover');

  if (!supportsPopover) {
    // Fallback: direct more-info on tap
    return html`
      <button class="power-circuit-tile" style="--tile-power-color:${color}"
        @click=${() => showMoreInfo(circuit.entries[0]?.entity?.entity_id)}>
        <!-- ... same tile content, no popovertarget ... -->
      </button>
    `;
  }

  // ... popover version ...
}
```

**Worf security review**: 
- `popover` attribute is a declarative HTML feature — no script injection
- `popovertarget` IDs derived from `device.id` (UUID from HA, already sanitized)
- Popover content rendered by our templates, not user input
- No `innerHTML` — all via lit-html tagged templates
- `::backdrop` is a CSS pseudo-element, not a DOM node — no clickjacking vector

> **Phase 3 Reconciliation — Data C-5 (Singleton Popover)**
>
> Data's review identified that 43 per-tile `<div popover>` elements creates ~430 extra DOM nodes.
> **Resolution**: Use **1 shared popover** element at the panel level. On tile click, populate the
> shared popover imperatively with the clicked circuit's data, then call `popoverEl.showPopover()`.
> The `popovertarget` declarative approach is replaced with imperative `showPopover()`.
> Implementation: A single `<div popover id="power-detail">` renders once in the panel template.
> `_showCircuitPopover(circuit, sparklineData)` populates it and calls `.showPopover()`.
> Fallback: `showMoreInfo()` on browsers without Popover API support (unchanged).

### 2.2 Scroll-Driven Animations — Circuit Grid Power-Up

**Baseline Status**: Newly Available  
**Browser Support**: Chrome 115+, Edge 115+, Firefox 110+, Safari 18.4+

When the power panel's circuit grid scrolls into the viewport, tiles "energize" with a staggered entrance — like watching an EPS power grid come online. This replaces the JavaScript-based stagger from Geordi's spec §8.3 with a **pure CSS** scroll-driven approach.

**Why this is better than JS IntersectionObserver**:
- No JavaScript event listeners
- GPU-composited animations (transform + opacity only)
- Automatically triggers on scroll direction (works for up-scroll too)
- Respects `prefers-reduced-motion` via CSS media query

```css
/* Scroll-driven power-up for circuit tiles */
@supports (animation-timeline: view()) {
  .power-circuit-tile {
    animation: circuit-energize linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  @keyframes circuit-energize {
    from {
      opacity: 0;
      border-left-color: var(--lcars-disabled);
      transform: translateX(-0.25rem);
    }
    to {
      opacity: 1;
      border-left-color: var(--tile-power-color);
      transform: translateX(0);
    }
  }
}

/* Fallback for non-supporting browsers: instant render */
@supports not (animation-timeline: view()) {
  .power-circuit-tile {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .power-circuit-tile {
    animation: none !important;
    opacity: 1;
  }
}
```

**Performance note**: Scroll-driven animations are compositor-driven. They don't fire on the main thread. Chrome DevTools shows ~96% CPU reduction compared to equivalent JS scroll handlers (per the Tokopedia case study from Chrome DevRel).

**Important**: This replaces the `animation-delay: calc(var(--tile-index) * 50ms)` stagger from Geordi's §8.3 tile load animation. The scroll-driven approach is viewport-aware (tiles animate as they scroll into view, not all at page load), which is more appropriate for a 40+ tile grid that extends below the fold.

**Compatibility matrix**:

| Browser | Scroll-Driven | Fallback |
|---------|--------------|----------|
| Chrome 115+ | Full animation | — |
| Edge 115+ | Full animation | — |
| Firefox 110+ | Full animation | — |
| Safari 18.4+ | Full animation | — |
| Safari 17–18.3 | — | Instant render (opacity: 1) |
| Older | — | Instant render |

### 2.3 `text-wrap: balance` — Section Headers & Circuit Names

**Baseline Status**: Widely Available  
**Browser Support**: All baseline browsers (Chrome 114+, Edge 114+, Firefox 121+, Safari 17.5+)

Applied to elements where text might wrap to two lines:

```css
.power-section-label,
.power-strip-name,
.circuit-name,
.mains-label,
.popover-title {
  text-wrap: balance;
}
```

This prevents orphan words on short circuit names like "Living Room" wrapping as:
```
LIVING              LIVING
ROOM       →        ROOM
```
Both lines become approximately equal width.

**Zero risk** — Widely Available, no fallback needed, no performance impact. Pure progressive enhancement.

### 2.4 View Transition API — Deferred to v4.16.0

**Status**: Widely Available (same-document)

As discussed in Q2 above — deferred until panel extraction (4X-4) is complete. When the power panel is its own `<lcars-power-panel>` custom element, we can use `document.startViewTransition()` to animate between:
- Tile grid view ↔ Flow diagram view
- Collapsed circuits ↔ Expanded circuits
- Smart plug row ↔ Smart plug detail

Each view-transition-name would be assigned to the panel's container, enabling the browser to morph between states with LCARS-styled cross-fades.

---

## 3. Power Strip Hierarchy Rendering

### 3.1 The Problem

TP-Link HS300 creates 7 devices in HA: 1 parent strip + 6 child sockets. Each child has `via_device_id` pointing to the parent. The panel must show this hierarchy visually.

### 3.2 Grouping Logic

```js
/**
 * Group strip children under their parent.
 * @param {Array} powerDevices - All power-classified device groups in the area
 * @returns {{ strips: Map<parentId, { parent, children[] }>, standalone: Array }}
 */
_groupPowerStrips(powerDevices) {
  const strips = new Map();
  const standalone = [];

  // First pass: identify parents
  for (const group of powerDevices) {
    if (group.subType === 'strip-parent') {
      strips.set(group.device.id, { parent: group, children: [] });
    }
  }

  // Second pass: assign children, collect standalone
  for (const group of powerDevices) {
    if (group.subType === 'strip-parent') continue;
    if (group.subType === 'strip-child' && group.device.via_device_id) {
      const parentStrip = strips.get(group.device.via_device_id);
      if (parentStrip) {
        parentStrip.children.push(group);
        continue;
      }
    }
    standalone.push(group);
  }

  return { strips, standalone };
}
```

### 3.3 Strip Rendering

```js
_renderPowerStrip(parentGroup, children) {
  const parentName = this._shortDeviceName(parentGroup.device);
  const { powerSensors } = this._partitionPowerEntities(parentGroup.entries);
  const totalWatts = powerSensors.reduce((sum, e) => sum + (parseFloat(e.state?.state) || 0), 0);
  const parentSwitch = parentGroup.entries.find(e => e.domain === 'switch');

  return html`
    <div class="power-strip-block">
      <div class="power-strip-header">
        <span class="power-strip-name">${parentName}</span>
        ${parentSwitch ? html`
          <button class="power-strip-master-toggle lcars-btn"
            ?data-on=${parentSwitch.state?.state === 'on'}
            @click=${() => this._handleToggle(parentSwitch.entity.entity_id)}
            title="Master: ${parentSwitch.state?.state}">
            ${parentSwitch.state?.state === 'on' ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        <span class="power-strip-total">${Math.round(totalWatts)}W</span>
      </div>
      <div class="power-strip-children">
        ${children.map(child => this._renderStripChild(child))}
      </div>
    </div>
  `;
}

_renderStripChild(childGroup) {
  const name = this._shortDeviceName(childGroup.device);
  const { switches, powerSensors } = this._partitionPowerEntities(childGroup.entries);
  const watts = powerSensors[0] ? parseFloat(powerSensors[0].state?.state) || 0 : 0;
  const color = getPowerColor(watts);
  const childSwitch = switches[0];

  return html`
    <div class="power-strip-child-tile" style="--tile-power-color:${color}">
      <span class="circuit-name">${name}</span>
      <div class="strip-child-controls">
        ${childSwitch ? html`
          <button class="strip-child-toggle"
            ?data-on=${childSwitch.state?.state === 'on'}
            @click=${(e) => { e.stopPropagation(); this._handleToggle(childSwitch.entity.entity_id); }}
            aria-label="${name}: ${childSwitch.state?.state}">
            ${childSwitch.state?.state === 'on' ? 'ON' : 'OFF'}
          </button>
        ` : ''}
        <span class="circuit-watts" style="color:${color}">
          <span class="power-dot" ?data-zero=${watts === 0}></span>
          ${Math.round(watts)}W
        </span>
      </div>
    </div>
  `;
}
```

### 3.4 Strip-Specific CSS

```css
.power-strip-block {
  border: 1px solid var(--lcars-butterscotch);
  border-left-width: 3px;
  border-radius: 0.5rem;
  padding: var(--lcars-gap);
  margin-bottom: var(--lcars-gap);
}

.power-strip-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: var(--lcars-gap);
}

.power-strip-name {
  font-size: var(--lcars-font-size-sub);
  color: var(--lcars-text-heading);
  text-transform: uppercase;
  text-wrap: balance;
  flex: 1;
}

.power-strip-master-toggle {
  height: 2rem;
  min-width: 3rem;
  font-size: 0.7rem;
  padding: 0 0.5rem;
}

.power-strip-total {
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-butterscotch);
  font-weight: 700;
  white-space: nowrap;
}

.power-strip-children {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: var(--lcars-gap);
}

.power-strip-child-tile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-left: 3px solid var(--tile-power-color, var(--lcars-gray));
  min-height: 3.5rem;
}

.strip-child-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}

.strip-child-toggle {
  font-family: var(--lcars-font);
  font-size: 0.6rem;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border: 1px solid var(--lcars-gray);
  border-radius: var(--lcars-btn-radius);
  background: transparent;
  color: var(--lcars-disabled);
  cursor: pointer;
  transition: all var(--lcars-transition);
}

.strip-child-toggle[data-on] {
  border-color: var(--lcars-ice);
  color: var(--lcars-ice);
  background: rgba(153, 204, 255, 0.1);
}
```

---

## 4. Performance Engineering — Sparkline Batching

### 4.1 The Scale Problem

Admiral's "Main Panel" area has 43 Emporia circuits. Boimler's has 58. Each circuit has a `*_power_minute_average` entity that needs a 24h sparkline. The existing `fetchSparklineData()` caps at 10 entities per call.

### 4.2 Batched Fetch Strategy

```js
_powerSparklineCache = new Map();
_sparklineLoadState = 'idle'; // 'idle' | 'loading' | 'loaded' | 'error'

async _fetchPowerSparklines(entityIds) {
  if (this._sparklineLoadState === 'loading') return null;
  this._sparklineLoadState = 'loading';

  const BATCH_SIZE = 20; // Reconciled: spec said 50, original code said 10, Data recommended 20
  const STAGGER_MS = 100;
  const allData = {};

  try {
    for (let i = 0; i < entityIds.length; i += BATCH_SIZE) {
      const batch = entityIds.slice(i, i + BATCH_SIZE);
      const cacheKey = `power-batch-${i}`;
      const data = await fetchSparklineData(
        this._hass, cacheKey, batch, this._powerSparklineCache,
        { maxEntities: BATCH_SIZE, ttlMs: 300000 }
      );
      if (data) Object.assign(allData, data);

      // Stagger between batches to avoid WS congestion
      if (i + BATCH_SIZE < entityIds.length) {
        await new Promise(resolve => setTimeout(resolve, STAGGER_MS));
      }
    }

    this._sparklineLoadState = 'loaded';
    return allData;
  } catch (err) {
    this._sparklineLoadState = 'error';
    return null;
  }
}
```

### 4.3 Viewport-Aware Loading

For areas with 40+ circuits, we don't fetch sparklines for tiles that are below the fold (collapsed section). Only fetch when:

1. Initial render: fetch sparklines for visible circuits only (first 20 in collapsed view)
2. "SHOW ALL" expand: trigger fetch for remaining circuits
3. Scroll: if we adopt scroll-driven animations, tie sparkline fetch to IntersectionObserver

```js
_visibleCircuitIds = new Set();

_setupSparklineObserver() {
  if (this._sparklineObserver) return;

  this._sparklineObserver = new IntersectionObserver((entries) => {
    let newVisible = false;
    for (const entry of entries) {
      const entityId = entry.target.dataset.sparklineEntity;
      if (!entityId) continue;
      if (entry.isIntersecting && !this._visibleCircuitIds.has(entityId)) {
        this._visibleCircuitIds.add(entityId);
        newVisible = true;
      }
    }
    if (newVisible) this._fetchVisibleSparklines();
  }, { rootMargin: '100px' });
}

async _fetchVisibleSparklines() {
  const unfetched = [...this._visibleCircuitIds].filter(
    id => !this._powerSparklineCache.has(id)
  );
  if (unfetched.length === 0) return;
  const data = await this._fetchPowerSparklines(unfetched);
  if (data) this.requestUpdate();
}
```

### 4.4 Render Optimization — Power State Hash

```js
_powerStateHash = '';

_shouldUpdatePowerPanel(newGroups) {
  let hash = '';
  for (const group of newGroups) {
    for (const entry of group.entries) {
      hash += `${entry.entity.entity_id}:${entry.state?.state}|`;
    }
  }
  if (hash === this._powerStateHash) return false;
  this._powerStateHash = hash;
  return true;
}
```

This prevents re-rendering the entire 43-tile grid when an unrelated entity updates.

---

## 5. Detection Logic — Refined Non-Overlap Guarantee

### 5.1 Updated Detector for `lcars-entity-utils.js`

```js
// Power monitoring: ≥1 power/energy/voltage/current sensor, NO battery
// MUST be last in DETECTORS array
(entries) => {
  let hasBattery = false;
  let powerSignals = 0;

  for (const e of entries) {
    const attrs = e.state?.attributes;
    if (!attrs) continue;
    const dc = attrs.device_class || '';
    const unit = attrs.unit_of_measurement || '';

    if (dc === 'battery' && unit === '%') { hasBattery = true; break; }
    if (dc === 'power' && (unit === 'W' || unit === 'kW')) powerSignals++;
    if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) powerSignals++;
    if (dc === 'current' && unit === 'A') powerSignals++;
    if (dc === 'voltage' && unit === 'V') powerSignals++;
  }

  return (!hasBattery && powerSignals >= 1) ? PANEL_TYPE_POWER : null;
},
```

### 5.2 Non-Overlap Proof

| Device | battery dc + % | power dc + W | Other power signals | Battery result | Power result |
|--------|---------------|-------------|---------------------|---------------|-------------|
| EcoFlow DELTA | ✓ | ✓ (≥2) | energy, temp | `battery` ✓ | Skip (hasBattery) |
| Emporia Vue circuit | ✗ | ✓ (1) | energy (kWh) | null (no battery) | `power` ✓ |
| Kasa KP115 | ✗ | ✓ (1) | voltage, current | null | `power` ✓ |
| SwitchBot meter | ✗ | ✗ | ✗ | null | null (no signals) |
| Ecobee thermostat | ✗ | ✗ | ✗ | null (caught by climate) | Never reaches |

The key: battery detector requires `hasBattery && powerCount >= 2`. Power detector requires `!hasBattery && powerSignals >= 1`. The `hasBattery` boolean is the mutual exclusion gate.

### 5.3 Edge Case: Kasa Plug Controlling a Fan

A Kasa KP115 plug powering a box fan provides both `switch` + `power`/`energy` entities. The fan domain is not present (it's just a `switch`). This correctly routes to the power panel, not environment. If someone has a dedicated `fan` entity, it would be caught by the environment detector earlier in the chain.

---

## 6. Sort Order Recommendation

For the circuit tile grid, I recommend **power draw descending** as the default sort:

```js
_sortCircuits(circuits) {
  return [...circuits].sort((a, b) => {
    const wA = this._getPrimaryPower(a) || 0;
    const wB = this._getPrimaryPower(b) || 0;
    // Descending by power, then alphabetical for ties
    if (wB !== wA) return wB - wA;
    const nA = (a.device.name || '').toLowerCase();
    const nB = (b.device.name || '').toLowerCase();
    return nA.localeCompare(nB);
  });
}
```

**Why descending power**: The most interesting circuits are the active ones drawing the most power. "HVAC 2400W" at position 1 tells the operator more than "Bathroom Exhaust 0W". Idle circuits naturally cluster at the bottom, where the collapsed-section gradient mask hides them anyway.

This is also how the TNG Engineering display works — the highest-draw systems (warp engines, shields, life support) are always at the top of the EPS allocation chart.

---

## 7. Format Utilities

```js
_formatWatts(watts) {
  if (watts == null) return '—';
  const w = Number(watts);
  if (!Number.isFinite(w)) return '—';
  if (Math.abs(w) >= 10000) return `${(w / 1000).toFixed(1)} kW`;
  return `${Math.round(w)} W`;
}

_formatEnergy(kwh) {
  if (kwh == null) return '—';
  const v = Number(kwh);
  if (!Number.isFinite(v)) return '—';
  return `${v.toFixed(1)} kWh`;
}
```

---

## 8. Integration Summary

### What's new in this addendum vs Geordi's spec:

| Item | Geordi's Spec | This Addendum |
|------|--------------|---------------|
| Frame color | `--lcars-butterscotch` | Confirmed ✓ |
| Color tiers | 5-tier with WCAG | Configurable thresholds added |
| Power arc chart | Open question | Full SVG implementation |
| Circuit detail | `showMoreInfo()` | Popover API with LCARS styling |
| Tile load animation | JS stagger | Scroll-driven CSS (fallback to Geordi's) |
| Text wrapping | Not specified | `text-wrap: balance` on headers |
| Strip rendering | Layout described | Full grouping logic + child tiles |
| Sparkline batching | Basic | Viewport-aware with IntersectionObserver |
| Flow visualization | Deferred | Confirmed deferred, v4.16.0 roadmap |
| Sort order | Open question | Power descending recommended |
| ESPHome detection | Open question | Deferred to v4.16.0 |
| Configurable thresholds | Open question | Config YAML + function signature |

### Files to modify:
1. `lcars-entity-utils.js` — `PANEL_TYPE_POWER`, detector, `PANEL_TYPE_ORDER`
2. `lcars-color-utils.js` — `getPowerColor()`, `getPowerLabel()`
3. `lcars-homepage-card.js` — All rendering + CSS
4. `lcars-styles.js` — None (all CSS scoped to homepage card)

### Review flags:
- **Geordi**: Power arc chart design, popover LCARS frame styling, strip block border treatment
- **Worf**: Popover API security (confirmed safe), `popovertarget` ID generation, no new external calls

---

*"What if we tried making the whole electrical panel feel like you're standing at the Engineering power distribution console on Deck 36? Because that's exactly what this is — the EPS grid for your home."*

— Wesley Crusher, SD 2026.04.14

---

## Appendix: Phase 3 Reconciliation — `_partitionPowerEntities()` (Data C-6)

Data's review noted that `_partitionPowerEntities()` is called in Wesley's `_renderPowerStrip()` code (§3.3) but never defined in either spec. Definition added here:

```js
/**
 * Partition a power device's entities into functional groups.
 * @param {Object[]} entries - Device entity entries (entity + state)
 * @returns {{ switches: Object[], powerSensors: Object[], energySensors: Object[],
 *             voltageSensors: Object[], currentSensors: Object[], diagnostics: Object[] }}
 */
_partitionPowerEntities(entries) {
  const switches = [];
  const powerSensors = [];
  const energySensors = [];
  const voltageSensors = [];
  const currentSensors = [];
  const diagnostics = [];

  for (const entry of entries) {
    if (entry.disabled_by || entry.hidden_by) continue;
    const domain = entry.entity?.entity_id?.split('.')[0];
    const dc = entry.state?.attributes?.device_class || '';
    const unit = entry.state?.attributes?.unit_of_measurement || '';

    if (domain === 'switch') {
      switches.push(entry);
    } else if (dc === 'power' && (unit === 'W' || unit === 'kW')) {
      powerSensors.push(entry);
    } else if (dc === 'energy' && (unit === 'kWh' || unit === 'Wh')) {
      energySensors.push(entry);
    } else if (dc === 'voltage' && unit === 'V') {
      voltageSensors.push(entry);
    } else if (dc === 'current' && unit === 'A') {
      currentSensors.push(entry);
    } else {
      diagnostics.push(entry);
    }
  }

  return { switches, powerSensors, energySensors, voltageSensors, currentSensors, diagnostics };
}
```

This follows the same pattern as `_partitionBatteryEntities()` and `_partitionEnvironmentEntities()` in the homepage card.
