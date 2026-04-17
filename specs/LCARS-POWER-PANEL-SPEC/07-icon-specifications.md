## 6. Icon Specifications

All icons use Material Design Icons (MDI) available in Home Assistant.

| Usage | Icon | Fallback | Notes |
|-------|------|----------|-------|
| **Panel type** (header) | `mdi:flash` | — | Standard power/electricity icon |
| **Circuit monitor** (Emporia) | `mdi:lightning-bolt-circle` | `mdi:flash` | Individual circuit |
| **240V paired circuit** | `mdi:flash-alert` | — | Double circuit indicator |
| **Switch + monitor** (Kasa plug) | `mdi:power-plug` | `mdi:flash` | Device with toggle |
| **Power strip** (parent) | `mdi:power-strip` | `mdi:power-plug` | Multi-outlet strip |
| **Power strip outlet** (child) | `mdi:power-socket-us` | `mdi:power-plug` | Individual outlet |
| **Import from grid** | `mdi:transmission-tower-import` | `mdi:download` | Grid consumption |
| **Export to grid** | `mdi:transmission-tower-export` | `mdi:upload` | Solar/battery export |
| **Grid balanced** | `mdi:transmission-tower` | — | Net zero |
| **Total usage** | `mdi:sigma` | `mdi:counter` | Aggregate metric |
| **Off/standby** | (same as device icon) | — | Dimmed via `opacity: 0.4` |
| **Unavailable** | `mdi:alert-circle-outline` | — | Replaces device icon |

Icon sizing: `--mdc-icon-size: 16px` for inline icons, `20px` for panel header.

---
