## 14. CSS Custom Properties Summary (New)

Properties introduced by the Weather panel. All other properties from `lcars-styles.js` and Device Panel base.

| Property                     | Default                | Set By | Purpose                                         |
|------------------------------|------------------------|--------|--------------------------------------------------|
| `--panel-frame-color`        | `var(--lcars-sky)`     | JS     | Dynamic frame border, header rule, forecast separator — driven by weather condition |
| `--weather-condition-color`  | `var(--lcars-sky)`     | JS     | Temperature text, glyph color, wind compass accent — driven by weather condition    |
| `--media-aspect`             | `4 / 3`                | CSS    | Viewscreen aspect ratio (slightly wider than 1:1 for wind compass below temp)       |

---
