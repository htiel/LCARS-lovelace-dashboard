## 16. CSS Custom Properties Summary (New)

Properties introduced by the Climate panel. All other properties from `lcars-styles.js`.

| Property                 | Default                      | Set By | Purpose                                      |
|--------------------------|------------------------------|--------|----------------------------------------------|
| `--panel-frame-color`    | `var(--lcars-butterscotch)`  | JS     | Dynamic frame border, header rule, mode strip separator — driven by `hvac_action` |
| `--climate-action-color` | `var(--lcars-butterscotch)`  | JS     | Temperature arc stroke, current temp text, action badge — driven by `hvac_action` |
| `--media-aspect`         | `1 / 1`                     | CSS    | Temperature viewscreen aspect ratio          |
| `--mode-color`           | `var(--lcars-gold)`          | JS     | Per-button active color for mode selector — varies by mode |

---
