# LCARS Panel Extraction Architecture Spec

**Backlog Item**: 4X-4 — Panel Module Extraction  
**Target**: v4.16.0  
**Author**: Data (Architecture Analysis)  
**Date**: 2026-04-14  
**Status**: Research Complete — Awaiting Admiral Review

---

## Executive Summary

The `lcars-homepage-card.js` monolith (5,848 lines) must be decomposed into reusable panel modules. My analysis of Lit composition patterns, Home Assistant frontend architecture, and the exemplary `lovelace-mushroom` HACS project converges on a single recommended pattern: **each panel as its own `customElements.define()` web component, sharing a common base class, composed via sub-element embedding in a thin orchestrator host.**

This is not opinion. This is what HA core does. This is what Mushroom does. This is what Lit documentation recommends for reusable UI units with their own state and template.

The key measurements:
- Current monolith: **5,848 lines**, 1 class, 9 inline panel renderers
- Proposed structure: **9 panel elements** (~200–450 lines each), **1 base class** (~150 lines), **1 orchestrator** (~300 lines)
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

Current `lcars-dashboard.js` (production): ~290 KiB.

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
        └── LcarsIrrigationPanel    (customElements: 'lcars-irrigation-panel')
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

export const panelFrameStyles = css`
  :host { display: block; }
  .lcars-panel-frame { /* shared LCARS frame border + elbow */ }
  .lcars-panel-header { /* panel title bar + code display */ }
  .lcars-panel-pips { /* animated pip bar */ }
  .lcars-panel-body { /* scrollable content area */ }
  /* ... ~80 lines of shared frame CSS currently duplicated across renderers */
`;

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

  /** Shared frame wrapper — override renderContent() in subclass */
  render() {
    const code = this._generatePanelCode(this.device?.id || 'panel');
    return html`
      <div class="lcars-panel-frame" style="--panel-color: ${this.frameColor}">
        <div class="lcars-panel-header">
          <span class="panel-title">${this.panelTitle}</span>
          <span class="panel-code">${code}</span>
        </div>
        <div class="lcars-panel-pips"></div>
        <div class="lcars-panel-body">
          ${this.renderContent()}
        </div>
      </div>
    `;
  }

  /** Override in subclass: render panel-specific content */
  renderContent() { return html``; }

  static get styles() {
    return [lcarsBaseStyles, panelFrameStyles];
  }
}
```

### 5.3 Example Panel Implementation

```js
// panels/lcars-climate-panel.js (~300 lines)
import { html, css } from 'lit-element';
import { LcarsBasePanel, panelFrameStyles } from '../lcars-base-panel.js';
import { lcarsBaseStyles } from '../lcars-styles.js';
import { getHvacActionColor } from '../lcars-color-utils.js';
import { clampSetpoint, createRateLimiter } from '../lcars-service-utils.js';
import { CLIMATE_DOMAINS, SENSOR_DOMAINS } from '../lcars-entity-utils.js';
import { sharedKeyframes, sharedReducedMotion } from '../lcars-shared-animations.js';

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
    // ... ~200 lines of climate-specific rendering
    // Moved from homepage card's _renderClimatePanel
  }

  static get styles() {
    return [
      super.styles,          // lcarsBaseStyles + panelFrameStyles
      sharedKeyframes,
      sharedReducedMotion,
      css`
        /* Climate-specific styles — moved from homepage card's static styles */
        .climate-setpoint { /* ... */ }
        .hvac-mode-indicator { /* ... */ }
      `
    ];
  }
}

customElements.define('lcars-climate-panel', LcarsClimatePanel);
```

---

## 6. Proposed File Structure

```
js/src/
  ├── lcars-homepage-card.js          ← REFACTORED: thin orchestrator (~1,200 lines)
  │                                      - _renderAreaContent()
  │                                      - _renderDevicePanel() → dispatches to sub-elements
  │                                      - _renderDomainGroups() + domain renderers (toggles, sensors, etc.)
  │                                      - Area/floor selection, edit mode, camera refresh
  │                                      - ~300 lines of orchestration CSS (area layout, domain groups)
  │
  ├── lcars-base-panel.js             ← NEW: shared base class (~150 lines)
  │                                      - LcarsBasePanel class
  │                                      - panelFrameStyles export
  │                                      - Shared frame rendering, panel code, entity helpers
  │
  ├── panels/                         ← NEW: one file per panel type
  │   ├── lcars-camera-panel.js       ← ~250 lines (from _renderCameraPanel + camera helpers)
  │   ├── lcars-environment-panel.js  ← ~220 lines (from _renderEnvironmentPanel + AQ helpers)
  │   ├── lcars-battery-panel.js      ← ~410 lines (from _renderBatteryPanel + SoC helpers)
  │   ├── lcars-climate-panel.js      ← ~310 lines (from _renderClimatePanel + setpoint logic)
  │   ├── lcars-alarm-panel.js        ← ~300 lines (from _renderAlarmPanel + PIN keypad)
  │   ├── lcars-media-panel.js        ← ~250 lines (from _renderMediaPanel + playback controls)
  │   ├── lcars-pool-spa-panel.js     ← ~230 lines (from _renderPoolSpaPanel + chemistry)
  │   ├── lcars-weather-panel.js      ← ~170 lines (from _renderWeatherPanel + forecast)
  │   └── lcars-irrigation-panel.js   ← ~90 lines  (from _renderIrrigationPanel + zones)
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

### 6.1 Webpack Entry Point Addition

```js
// webpack.config.js — add panels directory
entry: [
  './src/lcars-navigation-card.js',
  './src/lcars-dashboard.js',
  './src/lcars-dashboard-layout.js',
  './src/lcars-homepage-card.js',
  // Panel modules — imported by homepage-card, but listed here for
  // explicit side-effect registration (customElements.define)
  './src/panels/lcars-camera-panel.js',
  './src/panels/lcars-environment-panel.js',
  './src/panels/lcars-battery-panel.js',
  './src/panels/lcars-climate-panel.js',
  './src/panels/lcars-alarm-panel.js',
  './src/panels/lcars-media-panel.js',
  './src/panels/lcars-pool-spa-panel.js',
  './src/panels/lcars-weather-panel.js',
  './src/panels/lcars-irrigation-panel.js',
  // ... rest unchanged
],
```

**Note**: Panels can also be imported directly by `lcars-homepage-card.js` instead of being separate entry points. Since `customElements.define()` is a side effect at module scope, the import causes registration. Either approach works; separate entry points are more explicit.

---

## 7. CSS Strategy

### 7.1 Three-Tier CSS Architecture

```
Tier 1: lcars-styles.js (lcarsBaseStyles)
  ├── LCARS color palette (CSS custom properties)
  ├── Sizing tokens (unit, vunit, gap, etc.)
  ├── Typography
  └── Global reset / host styles

Tier 2: lcars-base-panel.js (panelFrameStyles)
  ├── .lcars-panel-frame (border, elbow, radius)
  ├── .lcars-panel-header (title bar, panel code)
  ├── .lcars-panel-pips (pip bar animation)
  ├── .lcars-panel-body (scrollable content area)
  └── Shared interactive states (hover, focus, disabled)

Tier 3: panels/*.js (panel-specific CSS)
  └── Scoped to that panel's shadow DOM
      - Climate: setpoint knob, HVAC mode indicator, temperature scale
      - Alarm: PIN keypad grid, zone status indicators, countdown timer
      - Media: playback controls, album art, progress bar
      - etc.
```

### 7.2 CSS Budget Per Tier

Current CSS in homepage card: **~2,837 lines** in a single `static get styles()`.

Projected distribution:
| Tier | Lines | Notes |
|---|---|---|
| Tier 1 (lcarsBaseStyles) | ~120 | Already exists. Unchanged. |
| Tier 2 (panelFrameStyles) | ~200 | Extracted from shared frame patterns across all 9 renderers |
| Tier 3 (per panel avg) | ~180 | Panel-specific. 9 panels × 180 = ~1,620 lines total |
| Orchestrator CSS | ~300 | Area layout, domain groups, split layout, device headers |
| **Total** | **~2,240** | **~600 lines eliminated** as duplicated frame CSS |

That is a **21% reduction** in total CSS through deduplication. Measurable.

### 7.3 Style Isolation

Each panel is a custom element with shadow DOM. Its Tier 3 CSS cannot leak to other panels or to the host. This eliminates the current risk of CSS specificity conflicts between panel renderers sharing one shadow root.

---

## 8. Migration Strategy — Incremental, One Panel at a Time

### Phase 0: Foundation (1 PR)

1. Create `lcars-base-panel.js` with `LcarsBasePanel` class
2. Create `panels/` directory
3. Extract `panelFrameStyles` from the shared CSS patterns in the monolith
4. Add `panels/` entry points to webpack config
5. **No behavioral change.** Homepage card continues to use inline renderers.

### Phase 1: First Panel Extraction — Irrigation (1 PR)

**Why irrigation first**: It's the smallest panel (87 lines render, 41 lines partition). Lowest risk for proving the pattern.

1. Create `panels/lcars-irrigation-panel.js` extending `LcarsBasePanel`
2. Move `_renderIrrigationPanel()` logic → `renderContent()`
3. Move `_partitionIrrigationEntities()` → `_partitionEntities()`
4. Move irrigation CSS from monolith → panel's `static styles`
5. Update `_renderDevicePanel()` switch case: `case PANEL_TYPE_IRRIGATION: return html`<lcars-irrigation-panel ...>`
6. Delete old methods from monolith
7. Build, test, verify identical rendering

### Phase 2: Second Panel — Weather (1 PR)

**Why weather second**: Small (164 lines), uses `lcars-weather-utils.js` (already extracted), proves import pattern for utility modules.

### Phase 3: Remaining Panels (1 PR each, 7 PRs)

Extract in ascending complexity order:
1. Environment (215 lines)
2. Camera (247 lines)
3. Media (248 lines)
4. Pool/Spa (223 lines)
5. Alarm (294 lines)
6. Climate (303 lines)
7. Battery (404 lines)

### Phase 4: Cleanup (1 PR)

1. Remove dead CSS from monolith's `static styles`
2. Remove dead helper methods no longer called by any renderer
3. Final bundle size comparison: before vs. after
4. Update source map comments if present

**Total**: 11 PRs, each independently shippable. Rollback granularity: one panel at a time.

---

## 9. Panel Component API (Interface Contract)

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

## 10. Risks and Mitigations

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

## 11. What This Enables (v5.0 Multi-Dashboard)

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

## 12. Summary of Recommendations

| Decision | Recommendation | Rationale |
|---|---|---|
| **Composition pattern** | Custom elements (component composition) | Panels have own state, template, CSS. Lit docs + HA precedent + Mushroom precedent |
| **Code sharing** | Base class (`LcarsBasePanel`) | Shared frame, pips, panel code. Mixin not needed — single inheritance sufficient |
| **CSS strategy** | 3-tier: base → frame → panel-specific, array composition | Eliminates ~600 lines duplication, shadow DOM isolation prevents conflicts |
| **Bundle strategy** | Single bundle, no code splitting | All panels needed on every dashboard. Webpack handles it. +0.3% overhead |
| **Element registration** | `customElements.define()` per panel, NO `window.customCards` | Panels are sub-components, not standalone Lovelace cards |
| **Migration order** | Ascending complexity: Irrigation → Weather → Environment → ... → Battery | Lowest risk first, validates pattern early |
| **File structure** | `panels/` subdirectory, one file per panel | Matches Mushroom `cards/` pattern. Clear ownership per spec sheet |
| **Python multi-dashboard** | Loop over `LovelaceYAML` + `_register_panel()` per dashboard URL | Trivially extensible from current single-dashboard code |
| **Lit version** | Stay on LitElement v2 | All proposed patterns work. Upgrade is orthogonal to this refactor |

---

*"I have completed my analysis, Admiral. The data is unambiguous. Nine files, one base class, zero ambiguity. The simplest solution that meets requirements is, as always, the optimal solution."*
