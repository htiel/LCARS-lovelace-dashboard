## 9. Reusability — The Generic Device Panel Pattern

The panel is designed as a **generic frame** with three pluggable zones. The camera panel is the first concrete implementation, but the same structure works for any device type.

### Abstract Device Panel Slots

```
┌─────────────────────────────────────────┐
│  [HEADER]     device name + badge       │  — Always present
├──────────┬──────────────────────────────┤
│ [SENSORS]│  [MEDIA]                     │  — Media slot is device-type-specific
│          │                              │
├──────────┴──────────────────────────────┤
│  [CONTROLS]   action buttons            │  — Always present, populated from entity list
└─────────────────────────────────────────┘
```

### Device Type → Media Slot Mapping

| Device Type    | Media Slot Content                  | `--media-aspect` | `--panel-frame-color`     |
|----------------|-------------------------------------|-------------------|---------------------------|
| **Camera**     | `<img>` from `entity_picture`       | `16 / 9`          | `--lcars-butterscotch`    |
| **Climate**    | Thermostat dial (SVG arc + temp)    | `1 / 1`           | `--lcars-bluey`           |
| **Media Player** | Album art `<img>` or player UI   | `1 / 1`           | `--lcars-violet-creme`    |
| **Cover**      | Position visualization (SVG)        | `4 / 3`           | `--lcars-almond-creme`    |
| **Generic**    | Large icon + state text             | `4 / 3`           | `--lcars-ice`             |

Each device type provides its own **frame color** via the `--panel-frame-color` CSS custom property, which cascades to the border, header line, and control separator. This gives each device type a distinct visual identity while sharing all structural CSS.

### Implementation Pattern (Lit Element)

```javascript
// Base class — all device panels extend this
class LcarsDevicePanelBase extends LitElement {
  static get properties() {
    return {
      deviceId: { type: String, attribute: 'device-id' },
      _hass: { type: Object },
    };
  }

  // Subclasses override these
  get panelFrameColor() { return 'var(--lcars-butterscotch)'; }
  get mediaAspectRatio() { return '16 / 9'; }
  
  // Resolve all entities belonging to this device
  _getDeviceEntities() {
    if (!this._hass || !this.deviceId) return [];
    return Object.values(this._hass.entities || {}).filter(
      (e) => e.device_id === this.deviceId && !e.hidden_by && !e.disabled_by
    );
  }

  // Partition entities into: primary (camera/climate/media), sensors, controls
  _partitionEntities(entities) {
    const primary = [];
    const sensors = [];
    const controls = [];
    
    for (const e of entities) {
      const domain = e.entity_id.split('.')[0];
      if (this._isPrimaryDomain(domain)) primary.push(e);
      else if (domain === 'sensor' || domain === 'binary_sensor') sensors.push(e);
      else if (domain === 'switch' || domain === 'button' || domain === 'select'
               || domain === 'number') controls.push(e);
      // Skip entity_category: diagnostic/config unless explicitly included
    }
    
    return { primary, sensors, controls };
  }

  // Subclasses override — which domain(s) go in the media slot
  _isPrimaryDomain(domain) { return false; }

  // Subclasses override — render the media slot
  _renderMedia(primaryEntities) {
    return html`<div class="device-panel-media-placeholder">No media</div>`;
  }

  // Shared: render sensor telemetry column
  _renderSensors(sensorEntities) { /* ... shared implementation ... */ }

  // Shared: render control buttons row
  _renderControls(controlEntities) { /* ... shared implementation ... */ }
}

// Camera panel — concrete implementation
class LcarsCameraPanel extends LcarsDevicePanelBase {
  get panelFrameColor() { return 'var(--lcars-butterscotch)'; }
  get mediaAspectRatio() { return '16 / 9'; }
  _isPrimaryDomain(domain) { return domain === 'camera'; }
  _renderMedia(cameraEntities) { /* render <img> from entity_picture */ }
}

// Climate panel — future implementation
class LcarsClimatePanel extends LcarsDevicePanelBase {
  get panelFrameColor() { return 'var(--lcars-bluey)'; }
  get mediaAspectRatio() { return '1 / 1'; }
  _isPrimaryDomain(domain) { return domain === 'climate'; }
  _renderMedia(climateEntities) { /* render SVG thermostat dial */ }
}
```

### Device Type Detection

The homepage card (or a new card) automatically selects the correct panel class based on the device's primary entity domain:

```javascript
function getDevicePanelType(device, entities) {
  const domains = new Set(entities.map((e) => e.entity_id.split('.')[0]));
  if (domains.has('camera')) return 'camera';
  if (domains.has('climate')) return 'climate';
  if (domains.has('media_player')) return 'media';
  if (domains.has('cover')) return 'cover';
  return 'generic';
}
```

---
