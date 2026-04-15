# LCARS Panel Extraction Architecture Spec

**Backlog Item**: 4X-4 — Panel Module Extraction  
**Target**: v4.17.0  
**Author**: Data (Architecture Analysis)  
**Date**: 2026-04-14  
**Status**: IMPLEMENTED — Shipped in v4.17.0 (2026-04-15)

---

## Executive Summary

The `lcars-homepage-card.js` monolith (7,545 lines) must be decomposed into reusable panel modules. My analysis of Lit composition patterns, Home Assistant frontend architecture, and the exemplary `lovelace-mushroom` HACS project converges on a single recommended pattern: **each panel as its own `customElements.define()` web component, sharing a common base class, composed via sub-element embedding in a thin orchestrator host.**

This is not opinion. This is what HA core does. This is what Mushroom does. This is what Lit documentation recommends for reusable UI units with their own state and template.

The key measurements:
- Current monolith: **7,545 lines**, 1 class, 10 inline panel renderers
- Proposed structure: **10 panel elements** (~200–920 lines each), **5 shared components**, **1 base class** (~150 lines), **1 orchestrator** (~2,200 lines)
- Bundle size impact: **~0 bytes** net change (same code, different files — webpack inlines everything)
- Migration risk: **Low** — incremental, one panel at a time, backwards-compatible at each step

---

## 1. Lit Composition Patterns — Research Findings

**Source**: [lit.dev/docs/composition/overview](https://lit.dev/docs/composition/overview/), [mixins](https://lit.dev/docs/composition/mixins/), [controllers](https://lit.dev/docs/composition/controllers/), [component-composition](https://lit.dev/docs/composition/component-composition/)

### 1.1 Three Approaches Evaluated

| Pattern | Relationship | Use Case | Applicable Here? |
|---|---|---|---|
| **Component Composition** | Parent embeds child elements | Reusable UI with own template + styles + state | **Yes — primary pattern** |
| **Class Mixins** | "is-a" — extends prototype | Share lifecycle overrides, add API to host | **Yes — for shared frame behavior** |
| **Reactive Controllers** | "has-a" — owned by host | Stateful behavior without own template | **No — panels have templates** |

### 1.2 Why Component Composition Is Primary

Lit documentation states the criteria for when to create a component:

> *"A piece of UI may be a good candidate for a component if: It has its own state. It has its own template. It's used in more than one place. It focuses on doing one thing well. It has a well-defined API."*

Each LCARS panel satisfies **all five criteria**:
- **Own state**: Entity partitioning, expanded/collapsed sections, rate-limited service calls
- **Own template**: 87–404 lines of `html` template per panel
- **Used in more than one place**: v5.0 multi-dashboard reuse (Climate Panel on both Habitat and Environmental dashboards)
- **Focused**: One panel type per component
- **Well-defined API**: `hass`, `entities`, `area`, `editMode` properties in; events out

### 1.3 Why NOT Reactive Controllers

Lit's guidance:

> *"Choose a controller unless the feature requires: Adding public API to the component. Very granular access to the component lifecycle."*

Controllers are for *behavior without templates* — fetch logic, event handling, timers. Panels are primarily *template + CSS* with associated state. A controller cannot own a shadow DOM or isolated styles. Attempting to return `html` from a controller and render it in the host negates the isolation benefits and creates the same coupling we're trying to eliminate.

### 1.4 Where Mixins Fit

> **Note**: The mixin pattern below was explored during design. The final implementation uses a `<lcars-panel-frame>` **component** instead — see §5 for the resolved architecture. Frame CSS lives in the component's shadow DOM, not as a shared `panelFrameStyles` export.

The shared LCARS frame (border, pip bar, elbow, color-by-status) is behavior that augments the panel's class — it adds public API (`frameColor`, `panelTitle`, `showPips`) and overrides rendering lifecycle. This is a textbook mixin case:

```js
const LcarsPanelFrameMixin = (superClass) => class extends superClass {
  // Adds frame rendering, pip bar, panel code, elbow...
  renderFrame(content) { /* shared frame wrapper */ }
  static get styles() { return [super.styles, panelFrameStyles]; }
};
```

### 1.5 CSS Composition in Lit

Lit's `static styles` supports **array composition** — the foundation of the CSS strategy:

```js
static get styles() {
  return [
    lcarsBaseStyles,     // colors, tokens, typography (from lcars-styles.js)
    panelFrameStyles,    // shared frame/border/pip CSS (new)
    css`/* panel-specific overrides */`
  ];
}
```

This is exactly how Mushroom structures it: `[super.styles, cardStyle, css`...`]`. Inherited styles from base class merge with panel-specific additions. No duplication.

---

## 2. Home Assistant Frontend Patterns — Research Findings

**Source**: [home-assistant/frontend](https://github.com/home-assistant/frontend), [HA custom card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/lovelace-custom-card)

### 2.1 HA Core Card Architecture

Every HA Lovelace card follows the same pattern:

```
@customElement("hui-{type}-card")
class Hui{Type}Card extends LitElement implements LovelaceCard {
  hass: HomeAssistant;
  setConfig(config): void;
  getCardSize(): number;
  getGridOptions(): GridOptions;
  render(): TemplateResult;
  static get styles(): CSSResultGroup;
}
```

Key observations from the codebase:
- **One custom element per card type** — no shared base class for cards (they're all independent)
- **Mixins used selectively**: `SubscribeMixin(LitElement)` for cards needing websocket subscriptions, `MobileAwareMixin(LitElement)` for responsive cards, `ConditionalListenerMixin` for visibility
- **Shared styles imported as modules**: `tileCardStyle`, `iconColorCSS` imported and spread into style arrays
- **No card-level lazy loading** — all card types bundled together, registered at module load time

### 2.2 Custom Element Registration Constraints

HA custom cards are registered via:

```js
customElements.define("lcars-climate-panel", LcarsClimatePanel);
```

**Critical constraint**: `customElements.define()` can only be called ONCE per tag name per page. If two bundles try to register the same tag, the second throws. This is fine for us — all panels are in one bundle.

**Multiple elements from one bundle**: Yes, absolutely supported. HA loads one JS file via `add_extra_js_url()`, and that file can call `customElements.define()` as many times as needed. Mushroom registers 20+ card types from a single bundle.

**`window.customCards` registration**: Only needed if the element should appear in HA's card picker dialog. LCARS panels are NOT standalone Lovelace cards — they're sub-components used by `lcars-homepage-card`. They do NOT need `window.customCards` registration.

### 2.3 Mushroom Architecture (Exemplary Multi-Card HACS Project)

**Source**: [piitaya/lovelace-mushroom](https://github.com/piitaya/lovelace-mushroom)

Mushroom is the gold standard for multi-card HACS architecture. Here is its class hierarchy:

```
LitElement
  └── MushroomBaseElement         (hass property, dark-mode, base CSS variables)
        ├── MushroomBaseCard<T,E> (config, setConfig, getCardSize, getGridOptions,
        │                          renderIcon, renderBadge, renderStateInfo, renderPicture)
        │     ├── LightCard       (extends MushroomBaseCard<LightCardConfig, LightEntity>)
        │     ├── FanCard         (extends MushroomBaseCard<FanCardConfig>)
        │     ├── LockCard        (extends MushroomBaseCard<LockCardConfig, LockEntity>)
        │     ├── ClimateCard     ...
        │     └── ... (15 more)
        └── [standalone cards]    (TemplateCard, TitleCard — extend MushroomBaseElement directly)
```

**File structure per card**:
```
cards/
  light-card/
    light-card.ts         (~350 lines: class + render + styles)
    light-card-config.ts  (config type + validation struct)
    light-card-editor.ts  (visual editor)
    const.ts              (card name, domains)
    controls/             (card-specific sub-components)
      light-brightness-control.ts
      light-color-temp-control.ts
```

**CSS pattern** (identical across all cards):
```ts
static get styles(): CSSResultGroup {
  return [
    super.styles,      // from MushroomBaseElement: CSS variables, animations
    cardStyle,         // from utils/card-styles.ts: shared layout CSS
    css`/* card-specific */`
  ];
}
```

**Shared UI sub-components** (each a registered custom element):
- `mushroom-card` — card wrapper with layout handling
- `mushroom-state-item` — icon + info layout
- `mushroom-shape-icon` — icon badge with shape background
- `mushroom-badge-icon` — status badge overlay
- `mushroom-state-info` — primary/secondary text display
- `mushroom-slider` — generic slider control
- `mushroom-button` — action button

**Key insight**: Mushroom's shared components are NOT panel renderers — they're small, focused UI primitives. The card-specific rendering logic lives entirely in the card file. This is the correct granularity.

---

## 3. Webpack & Bundle Considerations

### 3.1 Single Bundle Constraint

HA loads frontend resources via `add_extra_js_url()`, which injects a `<script type="module">` tag. The current webpack config compiles all entry points into a single `lcars-dashboard.js`.

**Can we use code splitting?** Technically possible — dynamic `import()` works in modules, and chunks could be served from the same `/lcars_dashboard/js/` static path. However:

- **Complexity cost**: Webpack chunk naming, cache-busting per chunk, serving multiple files
- **Benefit**: Near zero. ALL panels load on the dashboard. There's no lazy-loading scenario where a panel ISN'T needed.
- **Risk**: HA's static path caching may not correctly handle split chunks

**Recommendation**: **Stay with single bundle.** The module structure refactor is a source-level concern. Webpack compiles it all into one file regardless. Zero bundle size impact.

### 3.2 Tree Shaking

Webpack 5's tree-shaking works at the ES module `export` level. The current code uses `import`/`export` correctly in utility files. The proposed panel modules will use `export class` and be imported by the orchestrator — webpack will include exactly what's referenced.

**One consideration**: Side-effect imports for `customElements.define()`. Each panel file must call `customElements.define()` as a side effect at module scope. Webpack preserves side-effect imports by default (`sideEffects: true` in package.json or by not marking it false). The current webpack config does not set `sideEffects`, so this works correctly today and will continue to.

### 3.3 Bundle Size Projection

Current `lcars-dashboard.js` (production): ~386.5 KiB.

Extracting panels into separate modules changes the source structure but NOT the compiled output size. The same code exists — it's just in different files. Webpack module boundaries add ~50 bytes per import (the `__webpack_require__` call). With ~15 new imports, that's < 1 KiB overhead.

**Projected bundle size change: +0.3% (~0.8 KiB)**. Acceptable.

---

## 4. Python Backend for Multi-Dashboard

### 4.1 Current Architecture

`load_dashboard.py` registers ONE dashboard:

```python
hass.data["lovelace"].dashboards[dashboard_url] = LovelaceYAML(hass, dashboard_url, dashboard_config)
_register_panel(hass, dashboard_url, "yaml", dashboard_config, False)
```

`load_plugins.py` registers the JS bundle ONCE globally:

```python
add_extra_js_url(hass, js_url)  # Available to ALL dashboards
```

### 4.2 Multi-Dashboard Extension (v5.0)

Registration is trivially extensible — call `LovelaceYAML` + `_register_panel()` in a loop:

```python
DASHBOARDS = {
    "lcars-habitat":       {"title": "Habitat",       "icon": "mdi:home",          "filename": "lovelace/habitat.yaml"},
    "lcars-environmental": {"title": "Environmental", "icon": "mdi:leaf",           "filename": "lovelace/environmental.yaml"},
    "lcars-security":      {"title": "Security",      "icon": "mdi:shield",         "filename": "lovelace/security.yaml"},
    "lcars-power":         {"title": "Power Systems", "icon": "mdi:lightning-bolt",  "filename": "lovelace/power.yaml"},
    # ...
}

for url, cfg in DASHBOARDS.items():
    hass.data["lovelace"].dashboards[url] = LovelaceYAML(hass, url, {
        "mode": "yaml", "icon": cfg["icon"], "title": cfg["title"],
        "filename": f"custom_components/lcars_dashboard/{cfg['filename']}",
        "show_in_sidebar": True, "require_admin": False,
    })
    _register_panel(hass, url, "yaml", cfg, False)
```

The JS bundle is registered once — `add_extra_js_url()` adds it to the global frontend, so all dashboards get it automatically.

**Each dashboard's YAML template** references the same custom elements but with different entity filtering. The panel components receive entities as properties — they don't care which dashboard instantiated them.

### 4.3 Architectural Implication for Panel Extraction

This confirms the panel extraction is the **prerequisite** for multi-dashboard. Without reusable panel components, each dashboard YAML would need to inline its own rendering logic — defeating the purpose.

The extraction enables: Dashboard YAML → custom layout element → panel sub-components. Change a panel once → all dashboards update.

---

## 5. Recommended Architecture

### 5.1 Pattern: Base Class + Custom Element Panels + Orchestrator

```
LitElement
  └── LcarsBasePanel                (shared frame, pips, panel code, CSS tokens)
        ├── LcarsCameraPanel        (customElements: 'lcars-camera-panel')
        ├── LcarsEnvironmentPanel   (customElements: 'lcars-environment-panel')
        ├── LcarsBatteryPanel       (customElements: 'lcars-battery-panel')
        ├── LcarsClimatePanel       (customElements: 'lcars-climate-panel')
        ├── LcarsAlarmPanel         (customElements: 'lcars-alarm-panel')
        ├── LcarsMediaPanel         (customElements: 'lcars-media-panel')
        ├── LcarsPoolSpaPanel       (customElements: 'lcars-pool-spa-panel')
        ├── LcarsWeatherPanel       (customElements: 'lcars-weather-panel')
        ├── LcarsIrrigationPanel    (customElements: 'lcars-irrigation-panel')
        └── LcarsPowerPanel         (customElements: 'lcars-power-panel')
```

**Orchestrator** (`lcars-homepage-card.js`) becomes thin:

```js
_renderDevicePanel(panelType, group) {
  const tag = PANEL_TAG_MAP[panelType]; // 'lcars-climate-panel', etc.
  return html`
    <${tag}
      .hass=${this._hass}
      .entities=${group.entities}
      .device=${group.device}
      .area=${this.selectedArea}
      .editMode=${this._editMode}
      .data=${this.data}
    ></${tag}>
  `;
}
```

### 5.2 Base Class Design

```js
// lcars-base-panel.js (~150 lines)
import { LitElement, html, css } from 'lit-element';
import { lcarsBaseStyles } from './lcars-styles.js';
import { getHass, lcarsLog, fireEvent } from './lcars-helpers.js';
import { getStateColor } from './lcars-color-utils.js';
import './components/lcars-panel-frame/lcars-panel-frame.js';

export class LcarsBasePanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      entities: { type: Array },
      device: { type: Object },
      area: { type: String },
      editMode: { type: Boolean },
      data: { type: Object },
    };
  }

  /** Override in subclass: panel type identifier */
  get panelType() { return 'unknown'; }

  /** Override in subclass: panel display title */
  get panelTitle() { return 'PANEL'; }

  /** Override in subclass: frame color (CSS variable name or hex) */
  get frameColor() { return 'var(--lcars-sunflower)'; }

  /** Generate deterministic 6-digit panel code from device ID */
  _generatePanelCode(id) {
    let h = 5381;
    for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
    const code = String(Math.abs(h) % 1000000).padStart(6, '0');
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }

  /** Resolve friendly name from state object */
  _friendlyName(state, entry) {
    return state?.attributes?.friendly_name || entry?.entity_id || 'Unknown';
  }

  /** Check if entity is off/unavailable */
  _isOff(state) {
    return !state || state.state === 'off' || state.state === 'unavailable' || state.state === 'unknown';
  }

  /**
   * Base class render() wraps subclass content in <lcars-panel-frame>.
   * Subclasses override renderContent() only — never render().
   * This resolves the double-framing concern (Data N8): ONE framing path.
   */
  render() {
    const code = this._generatePanelCode(this.device?.id || 'panel');
    return html`
      <lcars-panel-frame
        .name=${this.panelTitle}
        .frameColor=${this.frameColor}
        .panelCode=${code}
        .panelType=${this.panelType}
      >
        ${this.renderContent()}
      </lcars-panel-frame>
    `;
  }

  /** Override in subclass: render panel-specific content */
  renderContent() { return html``; }

  static get styles() {
    // Base styles only — tokens + typography. NO frame CSS (owned by <lcars-panel-frame>).
    // Panels that need animations add sharedKeyframes explicitly (Data N11).
    return [lcarsBaseStyles];
  }
}

// Guard against double-registration during HMR (Data C5)
if (!customElements.get('lcars-base-panel')) {
  customElements.define('lcars-base-panel', LcarsBasePanel);
}
```

**Key decisions documented here:**
- **N8 resolved**: Base class `render()` uses `<lcars-panel-frame>` component. Subclasses implement `renderContent()` only. No double-framing possible.
- **C4 resolved**: `panelFrameStyles` export removed — frame CSS lives inside `<lcars-panel-frame>` component's shadow DOM.
- **C7 resolved**: `_renderSensorBar` removed — replaced by `<lcars-sensor-row>` component.
- **C8 resolved**: `_renderTrackToggle` and `_renderClickableValue` stay on Power panel only (YAGNI). NOT on base class.
- **U-3 resolved**: `.lcars-panel-pips` removed from base class — pips belong on dashboard frame only, not device panels.
- **C5 resolved**: `customElements.get()` guard on all `define()` calls.
- **N11 resolved**: `sharedKeyframes`/`sharedReducedMotion` NOT in base class default styles — only panels that animate include them.

### 5.3 Example Panel Implementation

```js
// panels/climate/lcars-climate-panel.js (~200 lines — logic + render only)
import { html } from 'lit-element';
import { LcarsBasePanel } from '../../lcars-base-panel.js';
import { getHvacActionColor } from '../../lcars-color-utils.js';
import { clampSetpoint, createRateLimiter } from '../../lcars-service-utils.js';
import { CLIMATE_DOMAINS, SENSOR_DOMAINS } from '../../lcars-entity-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../../lcars-shared-animations.js';
import { climatePanelStyles } from './lcars-climate-panel-styles.js';

class LcarsClimatePanel extends LcarsBasePanel {
  static get properties() {
    return {
      ...super.properties,
      _expanded: { type: Boolean },
    };
  }

  get panelType() { return 'climate'; }
  get panelTitle() { return 'ENVIRONMENTAL CONTROL'; }
  get frameColor() { return 'var(--lcars-ice)'; }

  constructor() {
    super();
    this._expanded = false;
    this._setpointLimiter = createRateLimiter(500);
  }

  _partitionEntities() {
    // Moved from homepage card's _partitionClimateEntities
    const climate = [], sensors = [], faults = [], diagnostics = [];
    // ... partitioning logic
    return { climate, sensors, faults, diagnostics };
  }

  renderContent() {
    const { climate, sensors, faults, diagnostics } = this._partitionEntities();
    // ... ~150 lines of climate-specific rendering
    // Moved from homepage card's _renderClimatePanel
  }

  static get styles() {
    return [
      ...super.styles,        // Tier 1 (lcarsBaseStyles)
      sharedKeyframes,        // Only included by panels that animate (N11)
      sharedReducedMotion,
      climatePanelStyles,     // Tier 3 — from ./lcars-climate-panel-styles.js
    ];
  }
}

// Guard against double-registration (Data C5)
if (!customElements.get('lcars-climate-panel')) {
  customElements.define('lcars-climate-panel', LcarsClimatePanel);
}
```

```js
// panels/climate/lcars-climate-panel-styles.js (~102 lines)
import { css } from 'lit-element';

export const climatePanelStyles = css`
  .climate-setpoint { /* ... */ }
  .hvac-mode-indicator { /* ... */ }
  .climate-zone-row { /* ... */ }
  /* ... ~100 lines of climate-specific CSS */
`;
```

---

## 6. Proposed File Structure

```
js/src/
  ├── lcars-homepage-card.js          ← REFACTORED: thin orchestrator (~2,200 lines)
  │                                      - _renderAreaContent()
  │                                      - _renderDevicePanel() → dispatches to sub-elements
  │                                      - _renderDomainGroups() + domain renderers (toggles, sensors, etc.)
  │                                      - Area/floor selection, edit mode, camera refresh
  │                                      - ~300 lines of orchestration CSS (area layout, domain groups)
  │
  ├── lcars-base-panel.js             ← NEW: shared base class (~150 lines)
  │                                      - LcarsBasePanel class
  │                                      - render() wraps content in <lcars-panel-frame>
  │                                      - Shared entity helpers, panel code generator
  │
  ├── components/                     ← NEW: shared UI primitives (custom elements)
  │   ├── lcars-panel-frame/
  │   │   ├── lcars-panel-frame.js       ← ~80 lines (frame border, corner brackets, header, panel code)
  │   │   └── lcars-panel-frame-styles.js ← ~115 lines (frame CSS from monolith L969-L1040, L3096-L3130)
  │   │       INVARIANT: thick→thin border (Bracer Jack Rule 2)
  │   │       Left+Bottom = 4px, Top+Right = 2px. Corner brackets match.
  │   ├── lcars-sensor-row/
  │   │   ├── lcars-sensor-row.js        ← ~50 lines (indicator dot + label + value + click handler)
  │   │   └── lcars-sensor-row-styles.js ← ~40 lines (from monolith L1049-L1088)
  │   ├── lcars-option-strip/
  │   │   ├── lcars-option-strip.js      ← ~60 lines (radiogroup selector — unifies 3 CSS variants)
  │   │   └── lcars-option-strip-styles.js ← ~50 lines (consolidated from L1332-L1378, L2029-L2045, L2115-L2129)
  │   ├── lcars-section-divider/
  │   │   ├── lcars-section-divider.js   ← ~20 lines (horizontal rule + optional label)
  │   │   └── lcars-section-divider-styles.js ← ~16 lines (from monolith L1315-L1330)
  │   └── lcars-setpoint/
  │       ├── lcars-setpoint.js          ← ~50 lines (−/+ buttons with label, debounced events)
  │       └── lcars-setpoint-styles.js   ← ~16 lines (from monolith L2001-L2016)
  │
  ├── panels/                         ← NEW: one directory per panel type
  │   ├── camera/
  │   │   ├── lcars-camera-panel.js       ← Component logic + render (~290 lines)
  │   │   ├── lcars-camera-panel-styles.js ← Tier 3 CSS module (~20 lines — minimal, uses shared frame)
  │   │   └── panel.html                  ← Static preview — sample data, open in browser
  │   ├── environment/
  │   │   ├── lcars-environment-panel.js   ← Component logic + render (~340 lines)
  │   │   ├── lcars-environment-panel-styles.js ← Tier 3 CSS (~254 lines)
  │   │   └── panel.html
  │   ├── battery/
  │   │   ├── lcars-battery-panel.js       ← Component logic + render (~450 lines)
  │   │   ├── lcars-battery-panel-styles.js ← Tier 3 CSS (~238 lines)
  │   │   └── panel.html
  │   ├── climate/
  │   │   ├── lcars-climate-panel.js       ← Component logic + render (~350 lines)
  │   │   ├── lcars-climate-panel-styles.js ← Tier 3 CSS (~102 lines)
  │   │   └── panel.html
  │   ├── alarm/
  │   │   ├── lcars-alarm-panel.js         ← Component logic + render (~315 lines)
  │   │   ├── lcars-alarm-panel-styles.js  ← Tier 3 CSS (~123 lines)
  │   │   └── panel.html
  │   ├── media/
  │   │   ├── lcars-media-panel.js         ← Component logic + render (~230 lines)
  │   │   ├── lcars-media-panel-styles.js  ← Tier 3 CSS (~145 lines)
  │   │   └── panel.html
  │   ├── pool-spa/
  │   │   ├── lcars-pool-spa-panel.js      ← Component logic + render (~260 lines)
  │   │   ├── lcars-pool-spa-panel-styles.js ← Tier 3 CSS (~83 lines)
  │   │   └── panel.html
  │   ├── weather/
  │   │   ├── lcars-weather-panel.js       ← Component logic + render (~250 lines)
  │   │   ├── lcars-weather-panel-styles.js ← Tier 3 CSS (~94 lines)
  │   │   └── panel.html
  │   ├── irrigation/
  │   │   ├── lcars-irrigation-panel.js    ← Component logic + render (~200 lines)
  │   │   ├── lcars-irrigation-panel-styles.js ← Tier 3 CSS (~80 lines)
  │   │   └── panel.html
  │   └── power/
  │       ├── lcars-power-panel.js         ← Component logic + render (~920 lines)
  │       ├── lcars-power-panel-styles.js  ← Tier 3 CSS (~990 lines)
  │       └── panel.html
  │
  ├── panels/index.html               ← Gallery page linking all panel previews
  ├── components/index.html            ← Gallery page for component visual testing (W-5)
  │
  ├── lcars-styles.js                 ← UNCHANGED: CSS custom properties, color palette, tokens
  ├── lcars-helpers.js                ← UNCHANGED: getHass, fireEvent, lcarsEventBus, lcarsLog
  ├── lcars-entity-utils.js           ← UNCHANGED: classifyDevice, domain sets, panel constants
  ├── lcars-color-utils.js            ← UNCHANGED: 13 color resolver functions
  ├── lcars-service-utils.js          ← UNCHANGED: clampSetpoint, createRateLimiter, createDebouncer
  ├── lcars-sparkline.js              ← UNCHANGED: SVG sparkline renderer
  ├── lcars-weather-utils.js          ← UNCHANGED: forecast fetcher with cache
  ├── lcars-shared-animations.js      ← UNCHANGED: shared CSS keyframes
  ├── lcars-dashboard.js              ← UNCHANGED
  ├── lcars-dashboard-layout.js       ← UNCHANGED
  ├── lcars-navigation-card.js        ← UNCHANGED
  └── ... (other existing files)      ← UNCHANGED
```

### 6.1 Webpack Strategy — Imports, Not Entry Points (Data N7)

Panels and components are **NOT** added to the webpack `entry` array. Instead, they are imported via side-effect imports from `lcars-homepage-card.js`:

```js
// lcars-homepage-card.js — top of file
import './panels/irrigation/lcars-irrigation-panel.js';
import './panels/weather/lcars-weather-panel.js';
import './panels/camera/lcars-camera-panel.js';
// ... etc. — one import per panel

// Components are imported by the panels that use them.
// No entry array changes needed.
```

Side-effect imports ensure `customElements.define()` runs. Webpack follows the import graph and includes everything in the single bundle. The entry array stays clean with only the 4 existing top-level files.

---

## 7. CSS Strategy

### 7.1 Three-Tier CSS Architecture

```
Tier 1: lcars-styles.js (lcarsBaseStyles)
  ├── LCARS color palette (CSS custom properties)
  ├── Sizing tokens (unit, vunit, gap, etc.)
  ├── Typography
  └── Global reset / host styles

Tier 2: components/ (shared UI primitives — own shadow DOM)
  ├── <lcars-panel-frame> (corner brackets, header, panel code)
  ├── <lcars-sensor-row> (indicator dot, label, value, click handler)
  ├── <lcars-option-strip> (radiogroup selector, unified CSS)
  ├── <lcars-section-divider> (horizontal rule + label)
  └── <lcars-setpoint> (+/- buttons, debounced events)
Tier 3: panels/*/lcars-*-panel-styles.js (panel-specific CSS modules)
  └── Exported as `css` tagged template, imported by panel JS
      Scoped to that panel's shadow DOM
      - Climate: setpoint knob, HVAC mode indicator, temperature scale
      - Alarm: PIN keypad grid, zone status indicators, countdown timer
      - Media: playback controls, album art, progress bar
      - Power: arc SVG, consolidated grid, responsive breakpoints (~990 lines)
      - etc.
```

### 7.2 CSS Budget Per Tier

Current CSS in homepage card: **~2,837 lines** in a single `static get styles()`.

Projected distribution:
| Tier | Lines | Notes |
|---|---|---|
| Tier 1 (lcarsBaseStyles) | ~120 | Already exists. Unchanged. |
| Tier 2 (components/) | ~237 | Frame ~115 + sensor row ~40 + option strip ~50 + divider ~16 + setpoint ~16 |
| Tier 3 (per panel avg) | ~150 | Panel-specific only (no frame/sensor CSS). 10 panels × 150 = ~1,500 lines total |
| Orchestrator CSS | ~300 | Area layout, domain groups, split layout, device headers |
| **Total** | **~2,157** | **~680 lines eliminated** — duplicated frame + sensor + option CSS |
96 | Already exists. 196 lines verifi
That is a **24% reduction** in total CSS through deduplication + component encapsulation. Measurable.

### 7.3 Style Isolation

Each panel is a custom element with shadow DOM. Its Tier 3 CSS cannot leak to other panels or to the host. This eliminates the current risk of CSS specificity conflicts between panel renderers sharing one shadow root.

---

## 8. Shared UI Components (`components/`)

### 8.1 Rationale — The Mushroom Pattern

Mushroom's architecture includes shared UI primitives as registered custom elements: `mushroom-slider`, `mushroom-button`, `mushroom-state-info`, etc. These are small, focused components with their own shadow DOM, own styles, and a simple property API. Each card uses them via HTML tags — change the component once, every card updates.

The LCARS monolith has the same pattern, but currently implemented as duplicated inline HTML across panels (31 sensor row blocks, 11 frame blocks, 6 option strips). Extracting these into `components/` achieves:

1. **Single source of truth** — update a control's style once, all panels reflect the change
2. **Consistency enforcement** — impossible for panels to drift apart visually
3. **Reduced panel code** — 8-line inline blocks become single `<lcars-sensor-row>` tags
4. **Accessibility centralized** — ARIA roles, keyboard handlers, focus management in one place

### 8.2 Component Inventory

| Component | Tag | Panels Using | Instances | Lines Saved | Priority |
|---|---|---|---|---|---|
| **Panel Frame** | `<lcars-panel-frame>` | All 10 | 11 | ~480 | P0 |
| **Sensor Row** | `<lcars-sensor-row>` | 10 | 31 | ~248 | P0 |
| **Option Strip** | `<lcars-option-strip>` | 4 (Env, Battery, Climate, Alarm) | 6 | ~90 + unify 79 CSS | P1 |
| **Section Divider** | `<lcars-section-divider>` | 4 (Env, Battery, Climate, Alarm) | 6 | ~16 CSS | P1 |
| **Setpoint Control** | `<lcars-setpoint>` | 2 (Climate, Pool/Spa) | 4 | ~40 | P2 |

**Not extracted as components** (too few callers or power-only):
- `_renderTrackToggle` — 3 callers, all Power panel. Stays as a method on `LcarsBasePanel` or moves to Power panel.
- `_renderClickableValue` — 6 callers, all Power panel. Same — stays as method.
- SVG renderers (arcs, compass) — panel-specific, move with their panel.

### 8.3 Component API Designs

#### `<lcars-panel-frame>`

The frame wraps every panel. The panel only sets its color and provides content via a slot.

```html
<!-- Usage in a panel's render() — called by base class, not subclass -->
<lcars-panel-frame
  .name=${"ECOLOGICS 4500"}
  .frameColor=${"var(--lcars-blue)"}
  .panelCode=${this._generatePanelCode(this.device?.id)}
  .panelType=${"climate"}
>
  <span slot="badge">${badgeHtml}</span>
  <!-- Panel content goes in default slot -->
  ${this.renderContent()}
</lcars-panel-frame>
```

**Properties**: `name` (String), `frameColor` (String), `panelCode` (String), `panelType` (String — used as CSS class for panel-type-specific theming hooks, e.g. `.panel-type-climate`)  
**Slots**: `badge` (optional header badge), default (panel body content)  
**CSS**: ~115 lines — frame border, corner brackets, header bar, panel code display  
**Design invariants** (Geordi U-1, U-2):
- **Thick→Thin** (Bracer Jack Rule 2): Left + bottom borders = 4px, top + right = 2px. This is non-negotiable LCARS canon.
- **Corner brackets** (not elbows): Device panels use squared corner brackets. The sidebar elbows are a separate pattern belonging to the dashboard layout, not panel frames.
- **No pip strip** (U-3): Pips belong on the main dashboard frame, not device panel frames. Removed.

#### `<lcars-sensor-row>`

Replaces 31 inline `device-sensor-line` blocks with a single tag.

```html
<!-- Before: 8 lines of HTML per instance, duplicated 31 times -->
<lcars-sensor-row
  .name=${"Temperature"}
  .value=${"72°F"}
  .icon=${"mdi:thermometer"}
  .color=${"var(--lcars-orange)"}
  .entityId=${"sensor.living_room_temp"}
  ?clickable=${true}
></lcars-sensor-row>
```

**Properties**: `name` (String), `value` (String), `unit` (String), `icon` (String — optional MDI icon, W-1), `color` (String), `entityId` (String), `clickable` (Boolean)  
**Events**: `lcars-sensor-click` (detail: { entityId }) — prefixed per W-4. Component handles its own click dispatch when `clickable` is true (N2 — component-managed pattern).  
**Accessibility** (N-1, N-4):
- When `clickable`: `role="button"`, `tabindex="0"`, `min-height: 1.5rem` touch target
- When read-only: no role, no tabindex — just display  
**CSS**: ~40 lines — indicator dot, label, value display, hover/focus states

#### `<lcars-option-strip>`

Unifies 3 CSS variants (option buttons, climate mode, alarm arm) into one component.

```html
<lcars-option-strip
  .options=${[
    {value: 'heat', label: 'HEAT'},
    {value: 'cool', label: 'COOL'},
    {value: 'off', label: 'OFF', disabled: true},
  ]}
  .value=${"heat"}
  .label=${"HVAC MODE"}
  .accentColor=${"var(--lcars-orange)"}
  @lcars-option-changed=${(e) => this._handleClimateMode(entityId, e.detail.value)}
></lcars-option-strip>
```

**Properties**: `options` (Array<{value, label, disabled?}>), `value` (String), `label` (String — container aria-label, N-3), `accentColor` (String)  
**Events**: `lcars-option-changed` (detail: { value }) — prefixed per W-4  
**Accessibility** (N-3, N3, N-8):
- Container: `role="radiogroup"`, `aria-label` set from `label` property
- Buttons: `role="radio"`, `aria-checked`, `aria-disabled` for disabled options (W-2)
- Keyboard: Roving tabindex — Arrow keys move focus + selection, only active option is in tab order (N3)
- Visual: LCARS pill shape with border-radius matching TheLCARS.com spec (Geordi N-8)

#### `<lcars-section-divider>`

Simple horizontal separator with optional label.

```html
<lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
```

**Properties**: `label` (String, optional)

#### `<lcars-setpoint>`

Temperature/value adjustment control with −/+ buttons.

```html
<lcars-setpoint
  .value=${72}
  .step=${0.5}
  .min=${60}
  .max=${90}
  .unit=${"°F"}
  .label=${"HEAT 72°"}
  .color=${"var(--lcars-orange)"}
  @lcars-setpoint-changed=${(e) => this._handleSetpoint(entityId, e.detail.value)}
></lcars-setpoint>
```

**Properties**: `value` (Number), `step` (Number), `min`/`max` (Number), `unit` (String — W-3: °F, °C, %, etc.), `label` (String), `color` (String)  
**Events**: `lcars-setpoint-changed` (detail: { value }) — prefixed per W-4  
**Accessibility** (N-2): `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` on the control group. −/+ buttons have explicit `aria-label` ("Decrease/Increase target temperature")

### 8.4 CSS Ownership

Components own their CSS in their shadow DOM. This means:

- **Panel frame CSS** moves from Tier 2 (`panelFrameStyles`) into `<lcars-panel-frame>` — the frame is now a component, not base class CSS
- **Sensor row CSS** moves from the monolith into `<lcars-sensor-row>` — no longer duplicated across panels
- **Option strip CSS** — 3 variants unified into 1 component stylesheet
- Panels no longer need to include frame or sensor CSS — they just use the tags

The **3-tier model** becomes:

```
Tier 1: lcars-styles.js (lcarsBaseStyles) — tokens, colors, typography
Tier 2: components/ — shared UI primitives with own shadow DOM + styles
Tier 3: panels/*/styles — panel-specific CSS only (content layout, unique elements)
```

### 8.5 Extraction Timing (YAGNI-Aligned)

Components are extracted **when first needed** — not all upfront:

1. **Phase 0 (Foundation)**: Create `<lcars-panel-frame>` + `<lcars-sensor-row>` — used by ALL panels
2. **Phase 1 (Irrigation)**: First panel to USE them — proving the pattern
3. **Phase 4 (Environment)**: Create `<lcars-option-strip>` + `<lcars-section-divider>` — first panel that needs them
4. **Phase 6 (Pool/Spa) or Phase 8 (Climate)**: Create `<lcars-setpoint>` — first panel with +/− controls

This YAGNI approach (Data N4) reduces Phase 0 scope from 5 components to 2, getting to the first real panel extraction faster.

### 8.6 CSS Custom Property Theming Contract (N-5)

Components expose theming hooks via CSS custom properties. Panels set these on the component tag to control appearance without piercing shadow DOM:

```css
/* Example: panel overrides component color */
lcars-sensor-row {
  --lcars-sensor-dot-color: var(--lcars-orange);
  --lcars-sensor-hover-bg: var(--lcars-card-bg-color);
}
lcars-panel-frame {
  --lcars-frame-border-color: var(--lcars-blue);
}
```

Each component documents its custom property API in its styles file. This is the ONLY way panels may customize component appearance.

### 8.7 Entity ID Validation (Worf ADV-1)

All components that accept `entityId` must validate the format before use:

```js
_validateEntityId(id) {
  return typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id);
}
```

Invalid entity IDs are logged and ignored — never passed to `hass.states[]` or service calls.

### 8.8 Animation Distribution Matrix (Geordi X-2)

When panels are extracted, CSS animations must transfer to the correct owner. This matrix tracks every animation and its post-extraction destination:

| Animation | Current Selector | Post-Extraction Owner | New Selector |
|---|---|---|---|
| `lcars-cascade-in` | `.content-area-panel .lcars-device-panel` | Orchestrator | Element tag selectors or shared attribute |
| `lcars-heartbeat` | `.climate-panel[data-heat/cool]` | Climate panel | `:host([data-heat]), :host([data-cool])` |
| `lcars-heartbeat` | `.toggle-pill[data-on]`, `.media-strip:not([data-off])` | Orchestrator (domain) | Unchanged |
| `lcars-distress` | `.sensor-readout[data-off]`, `.toggle-pill[data-off]` | Orchestrator (domain) | Unchanged |
| `viewscreen-activate` | `.device-panel-media img` | Camera panel | Same, inside shadow DOM |
| `panel-distress` | `.lcars-device-panel:has(.device-panel-media[data-offline])` | Camera panel | `:host(:has(...))` |
| Cascade stagger | `animation-delay: calc(var(--i) * 40ms)` | Orchestrator sets `--i` on panel element | `style="--i: ${index}"` |
| `prefers-reduced-motion` | All above | Split per owner | Each owner adds `:host` overrides |

**Rule**: Every phase PR includes an "Animation Migration" checklist item verifying that all animations for that panel transfer correctly and `prefers-reduced-motion` overrides are present in the new owner.

---

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

## 10. Panel Communication Contract

Every panel component accepts these properties (set by the orchestrator):

```js
/**
 * @property {Object} hass — Home Assistant object (states, services, etc.)
 * @property {Array} entities — Array of {entity, state, domain, device_class, category} entries
 * @property {Object} device — HA device registry entry for this device group
 * @property {String} area — Currently selected area ID (or null)
 * @property {Boolean} editMode — Whether the dashboard is in edit mode
 * @property {Object} data — Full LCARS dashboard configuration object
 */
```

Events fired upward (via `fireEvent` or `CustomEvent`):

```js
// Entity interaction
this.dispatchEvent(new CustomEvent('lcars-show-more-info', {
  detail: { entityId }, bubbles: true, composed: true
}));

// Edit mode actions
this.dispatchEvent(new CustomEvent('lcars-edit-device', {
  detail: { deviceId }, bubbles: true, composed: true
}));
```

This is the standard Lit "properties down, events up" pattern.

---

## 11. Risks and Mitigations

### Risk 1: Shadow DOM Style Isolation Breaks Visual Appearance

**Issue**: Moving a panel renderer into its own custom element creates a new shadow DOM boundary. CSS selectors that currently traverse from the homepage card's shadow root into panel markup will no longer work.

**Mitigation**: 
- All panel CSS is already scoped to class-prefixed selectors (`.lcars-panel-*`, `.camera-*`, `.climate-*`)
- The monolith's single shadow root means these selectors only match within that root anyway
- Migration: Copy the relevant CSS block into the panel's `static styles`. Verify visually.
- CSS custom properties (which cross shadow boundaries) are used for theming and will continue to work.

**Risk Level**: Low. Systematic extraction, panel by panel, with visual verification.

### Risk 2: Service Call Context Loss

**Issue**: Panel renderers currently call `this._hass.callService()` and `this._setpointLimiter()` etc. on the homepage card instance. After extraction, `this` is the panel element.

**Mitigation**:
- `hass` is passed as a property — service calls work identically: `this.hass.callService()`
- Rate limiters and debouncers are created per instance in the constructor — no shared state concern
- `showMoreInfo()` and `fireEvent()` are already imported from `lcars-helpers.js` — they work from any element

**Risk Level**: None. The refactor is purely structural.

### Risk 3: Entity Cache Invalidation

**Issue**: The homepage card maintains `_entityCache` (a `Map`) for caching entity lookups. Panels won't have access to this cache.

**Mitigation**: 
- The cache is cleared on area/floor change — it's a view-level concern, not a panel concern
- Each panel receives pre-filtered `entities` array — no caching needed within panels
- If per-panel caching is needed (e.g., sparkline data), each panel manages its own cache

### Risk 6: Alarm Panel — Arm Mode Injection (Worf RA-1)

**Issue**: The alarm panel accepts arm mode strings from user interaction. If unsanitized, these could be passed to HA service calls.

**Mitigation**: Whitelist arm modes. Only `arm_home`, `arm_away`, `arm_night`, `arm_custom_bypass`, `disarm` are allowed. Any other value is rejected. PIN entry events use `composed: false` to prevent leaking outside the panel's shadow DOM.

### Risk 7: panel.html Static Path Exposure (Worf RA-2)

**Issue**: `panel.html` files contain sample data and could be served by misconfigured web servers.

**Mitigation**: Verify `panel.html` files are excluded from the webpack build output. They are development-only artifacts. Add `panels/**/panel.html` to webpack `exclude` config. The HA frontend only serves files explicitly registered via `add_extra_js_url`.

### Risk 8: innerHTML Usage in Power Panel (Worf RA-3)

**Issue**: The power panel currently uses `innerHTML` for some SVG rendering. Post-extraction, this must be replaced with Lit `html` templates to prevent XSS vectors.

**Mitigation**: During Power panel extraction (Phase 3.8), all `innerHTML` usage is replaced with `svg` tagged template literals from `lit-html`. No raw string HTML injection.

### Scope Boundary: Orchestrator Domain Renderers (Data N10)

The orchestrator's `_renderDomainGroups()` renders toggles, sensors, buttons, etc. that live OUTSIDE device panels. These domain-level renderers do **NOT** adopt `<lcars-sensor-row>` or other shared components. They remain as inline HTML in the orchestrator. Only device panel code uses the shared components.

**Risk Level**: Low. Cache belongs at orchestrator level.

### Risk 4: Bundle Size Regression

**Issue**: Module boundaries add webpack overhead.

**Mitigation**: Measured projection: +0.8 KiB (~0.3%). Well within budget. CSS deduplication saves ~600 lines — net size likely decreases.

**Risk Level**: None. Will measure before/after on first extraction PR.

### Risk 5: LitElement v2 vs. Lit 3 Compatibility

**Issue**: Project uses `lit-element` (v2) not `lit` (v3). Some patterns from Lit 3 docs may not apply.

**Mitigation**: 
- `LitElement`, `html`, `css` from `lit-element` work identically to Lit 3 for these patterns
- `static get styles()` array composition works in both versions
- `customElements.define()` is a web standard, not Lit-specific
- Base class extension via `extends` works in both versions
- **No Lit upgrade required** for this refactor

**Risk Level**: None. All proposed patterns are LitElement v2 compatible.

---

## 12. What This Enables (v5.0 Multi-Dashboard)

With extracted panels, the multi-dashboard architecture becomes trivial:

```
                    ┌──────────────────────────────────────────────┐
                    │            load_plugins.py                   │
                    │   add_extra_js_url(lcars-dashboard.js)       │
                    │   (ONE bundle, registered ONCE, globally)    │
                    └──────────────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼────────────────────────────┐
          │                             │                            │
  ┌───────▼───────┐          ┌──────────▼──────────┐      ┌─────────▼────────┐
  │  /lcars-habitat │          │ /lcars-environmental │      │  /lcars-security   │
  │  habitat.yaml   │          │ environmental.yaml   │      │  security.yaml     │
  │                 │          │                      │      │                    │
  │  Per-area view  │          │  All-area view       │      │  Security view     │
  │  ALL panel types│          │  Climate + Env only  │      │  Alarm + Camera    │
  └─────────────────┘          └──────────────────────┘      └────────────────────┘
          │                             │                            │
          │         Uses the SAME panel custom elements:             │
          │         <lcars-climate-panel>                             │
          │         <lcars-camera-panel>                              │
          │         <lcars-alarm-panel>                               │
          └──────────────────────┬───────────────────────────────────┘
                                 │
                    Each panel is self-contained:
                    own shadow DOM, own CSS, own state
                    Receives entities as properties
                    Dashboard controls WHICH entities to pass
```

---

## 13. Panel Preview Files (`panel.html`)

Each panel directory includes a **`panel.html`** file — a standalone, static HTML page that renders the panel's look and feel with hardcoded sample data. These are development/review aids, not shipped to users.

### 12.1 Purpose

- **Visual verification**: Open in any browser (Edge, Chrome) to see the panel without running Home Assistant
- **Design review**: Allows Geordi (UI review) and the Admiral to inspect look & feel at any time
- **Living documentation**: Updated whenever panel CSS or HTML structure changes
- **Regression catch**: Visual side-by-side comparison before/after refactor

### 12.2 Structure

Each `panel.html` is a self-contained file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LCARS [Panel Name] — Preview</title>
  <style>
    /* LCARS base tokens (copy of lcars-styles.js custom properties) */
    /* Panel frame CSS (from Tier 2 — lcars-base-panel) */
    /* Panel-specific CSS (from Tier 3 — this panel) */
  </style>
</head>
<body style="background: #000; margin: 0; padding: 24px;">
  <!-- Static HTML matching the panel's lit-html template output -->
  <!-- Hardcoded sample entity values (realistic HA data) -->
</body>
</html>
```

### 12.3 Rules

1. **No JavaScript dependencies** — pure HTML + CSS, opens via `file://` in any browser
2. **Sample data must be realistic** — use plausible HA entity states, not lorem ipsum
3. **Must stay in sync** — whenever a panel's render template or CSS changes, update its `panel.html`
4. **Not in webpack build** — excluded from bundle. Add `panels/**/panel.html` to webpack `exclude` if needed
5. **Git-tracked** — these are checked in, not generated

### 12.4 Gallery Index

`panels/index.html` links to all 10 panel previews with thumbnail descriptions. Opening it shows a navigation page to quickly jump to any panel's preview.

---

## 14. Summary of Recommendations

| Decision | Recommendation | Rationale |
|---|---|---|
| **Composition pattern** | Custom elements (component composition) | Panels have own state, template, CSS. Lit docs + HA precedent + Mushroom precedent |
| **Code sharing** | Base class (`LcarsBasePanel`) | Shared frame, pips, panel code. Mixin not needed — single inheritance sufficient |
| **Shared UI components** | 5 custom elements in `components/` | via `<lcars-panel-frame>`, panel code, entity helpers. Mixin not needed — single inheritance sufficient |
| **Shared UI components** | 5 custom elements in `components/` (YAGNI-phased)ic | Eliminates ~680 lines duplication, shadow DOM isolation prevents conflicts |
| **Bundle strategy** | Single bundle, no code splitting | All panels needed on every dashboard. Webpack handles it. +0.3% overhead |
| **Element registration** | `customElements.define()` per panel, NO `window.customCards` | Panels are sub-components, not standalone Lovelace cards |
| **Migration order** | Ascending complexity: Irrigation → Weather → Environment → ... → Battery | Lowest risk first, validates pattern early |
| **File structure** | `panels/` + `components/` subdirectories | Matches Mushroom `cards/` + `utils/` pattern. Clear ownership per spec sheet |
| **Python multi-dashboard** | Loop over `LovelaceYAML` + `_register_panel()` per dashboard URL | Trivially extensible from current single-dashboard code |
| **Lit version** | Stay on LitElement v2 | All proposed patterns work. Upgrade is orthogonal to this refactor |


## 15. Release Strategy

v4.17.0 will be published as a **pre-release tag** to prevent auto-update for stable HACS users.

- **Tag**: `gh release create 4.17.0 --target 4.0 --prerelease --title "v4.17.0 — Panel Extraction Architecture" --notes "..."`
- **Version bump files** (all 3 must match before tagging):
  - `custom_components/lcars_dashboard/const.py` → `VERSION`
  - `custom_components/lcars_dashboard/manifest.json` → `version`
  - `custom_components/lcars_dashboard/js/package.json` → `version`
- **Beta testing**: HACS → find LCARS Dashboard → ⋮ menu → Redownload → toggle "Show beta versions"
- **Promotion to stable**: After Admiral + beta user validation, re-tag as full release (remove `--prerelease`)
- **Scope boundary** (N10): This refactor extracts panels. No new features, no new entities, no API changes.

---

*"I have completed my analysis, Admiral. The data is unambiguous. Ten panels, five shared components, one base class, zero ambiguity. The simplest solution that meets requirements is, as always, the optimal solution."*
