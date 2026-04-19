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
