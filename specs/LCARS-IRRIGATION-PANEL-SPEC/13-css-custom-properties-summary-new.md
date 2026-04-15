## 12. CSS Custom Properties Summary (New)

Properties introduced by the Irrigation panel. All other properties from `lcars-styles.js`.

| Property                 | Default                | Set By | Purpose                                                 |
|--------------------------|------------------------|--------|---------------------------------------------------------|
| `--panel-frame-color`    | `var(--lcars-ice)`     | CSS    | Static frame border — ice for water systems             |
| `--zone-active-color`    | `var(--lcars-ice)`     | CSS    | Fill bar and countdown text for active zone             |
| `--zone-idle-color`      | `var(--lcars-sunflower)` | CSS  | Idle zone status label                                  |

Note: Unlike the climate panel which dynamically shifts `--panel-frame-color` based on `hvac_action`, the irrigation panel keeps a **static ice-blue frame**. Irrigation doesn't have a mode spectrum (heating vs cooling vs idle) — it's either running or not. The zone rows communicate per-zone state individually instead.

---
