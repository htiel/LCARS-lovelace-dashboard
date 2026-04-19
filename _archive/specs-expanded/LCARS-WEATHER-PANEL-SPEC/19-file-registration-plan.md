## 18. File Registration Plan

| Component Tag               | File                          | Purpose                         |
|-----------------------------|-------------------------------|---------------------------------|
| `lcars-weather-panel`       | `lcars-weather-panel.js`      | Full weather panel component    |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → `var(--lcars-sky)`
- `mediaAspectRatio` → `4 / 3`
- `_isPrimaryDomain(domain)` → `domain === 'weather'`
- `_renderMedia()` → renders temperature display, wind compass, day arc
- `_renderForecast()` → renders forecast strip (custom section, not in base)

### Webpack Registration

```javascript
// In lcars-dashboard.js
import './lcars-weather-panel.js';
```

---
