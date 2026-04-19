## 17. File Registration Plan

| Component Tag                | File                          | Purpose                            |
|------------------------------|-------------------------------|------------------------------------|
| `lcars-pool-spa-panel`       | `lcars-pool-spa-panel.js`     | Full panel component               |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-bluey)`
- `mediaAspectRatio` → N/A (dual viewscreens have explicit dimensions)
- `_isPrimaryDomain(domain)` → `domain === 'climate'`
- `_renderMedia()` → renders the dual aquatic viewscreens
- `_renderControls()` → renders circuit toggles + lighting strip

### Lovelace YAML Configuration

```yaml
type: custom:lcars-pool-spa-panel
entities:
  pool_climate: climate.pool_heat
  spa_climate: climate.spa_heat
  # All other entities auto-discovered from ScreenLogic device
  # Can be overridden explicitly:
  # ph_sensor: sensor.screenlogic_ph_now
  # orp_sensor: sensor.screenlogic_orp_now
  # etc.
config_entry: <screenlogic_config_entry_id>  # For color_mode service
title: "POOL & SPA — BACKYARD"
```

### Card Configuration Schema

```javascript
/**
 * Pool/Spa panel card configuration schema.
 */
const POOL_SPA_SCHEMA = {
  type: { type: 'string', required: true },
  entities: {
    type: 'object',
    required: true,
    properties: {
      pool_climate: { type: 'string', required: true, domain: 'climate' },
      spa_climate:  { type: 'string', required: false, domain: 'climate' },
    },
  },
  config_entry: { type: 'string', required: false },
  title: { type: 'string', required: false },
};
```

---
