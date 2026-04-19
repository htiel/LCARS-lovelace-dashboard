## 16. Component Registration

### Lit Element Class Skeleton

```javascript
import { LitElement, html, css } from 'lit-element';

class LcarsInternalSensorsGrid extends LitElement {

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _sensorGroups: { type: Array },
      _historyData: { type: Object },
    };
  }

  setConfig(config) {
    // Clamp thresholds to sane ranges per security review
    const clampTemp = (v, d) => Math.max(-50, Math.min(200, v ?? d));
    const clampPct = (v, d) => Math.max(0, Math.min(100, v ?? d));

    this.config = {
      unit_system: 'imperial',
      temp_comfort_min: clampTemp(config.temp_comfort_min, 68),
      temp_comfort_max: clampTemp(config.temp_comfort_max, 76),
      humidity_comfort_min: clampPct(config.humidity_comfort_min, 30),
      humidity_comfort_max: clampPct(config.humidity_comfort_max, 60),
      battery_alert: clampPct(config.battery_alert, 20),
      show_sparklines: true,
      show_averages: true,
      show_appliance_meters: false,
      group_by_floor: true,
      ...config,
      // Re-clamp after spread to ensure user values are within bounds
      temp_comfort_min: clampTemp(config.temp_comfort_min, 68),
      temp_comfort_max: clampTemp(config.temp_comfort_max, 76),
      humidity_comfort_min: clampPct(config.humidity_comfort_min, 30),
      humidity_comfort_max: clampPct(config.humidity_comfort_max, 60),
      battery_alert: clampPct(config.battery_alert, 20),
    };
  }

  static getConfigElement() {
    return document.createElement('lcars-internal-sensors-grid-editor');
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    // Estimate: 1 per floor header + 1 per 4 tiles row + 1 for header + 1 for summary
    const groups = this._sensorGroups || [];
    const floorCount = new Set(groups.map(g => g.floorId)).size;
    const tileRows = Math.ceil(groups.length / 4);
    return 2 + floorCount + tileRows;
  }

  // ... render(), updated(), etc.
}

customElements.define('lcars-internal-sensors-grid', LcarsInternalSensorsGrid);
```

### Card Registration for HA

```javascript
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lcars-internal-sensors-grid',
  name: 'LCARS Internal Sensors Grid',
  description: 'Ship-wide environmental monitoring grid — temperature and humidity across all rooms',
  preview: true,
});
```

---
