## 18. File Registration Plan

| Component Tag               | File                         | Purpose                            |
|-----------------------------|------------------------------|------------------------------------|
| `lcars-climate-panel`       | `lcars-climate-panel.js`     | Full climate panel component       |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Dynamic via `getClimateActionColor(hvacAction)`
- `mediaAspectRatio` → `'1 / 1'`
- `_isPrimaryDomain(domain)` → `domain === 'climate'`
- `_renderMedia()` → renders the SVG temperature arc + setpoint controls

---
