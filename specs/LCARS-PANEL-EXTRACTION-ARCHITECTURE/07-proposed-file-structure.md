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
