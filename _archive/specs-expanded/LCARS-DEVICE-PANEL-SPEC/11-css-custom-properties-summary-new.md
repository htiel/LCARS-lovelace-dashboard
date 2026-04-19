## 11. CSS Custom Properties Summary (New)

These are **new** properties introduced by the Device Panel. All other properties come from the existing `lcars-styles.js`.

| Property                | Default                        | Purpose                                |
|-------------------------|--------------------------------|----------------------------------------|
| `--panel-frame-color`   | `var(--lcars-butterscotch)`    | Panel border + header line + separator |
| `--media-aspect`        | `16 / 9`                       | Aspect ratio of the media slot         |

These are set per-device-type on the `.lcars-device-panel` element, keeping the CSS fully generic.

---
