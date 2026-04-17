## 11. Panel Type Registration

Add to `lcars-entity-utils.js`:

```js
export const PANEL_TYPE_POWER = 'power';

// Add to PANEL_TYPE_ORDER (after battery, before generic)
export const PANEL_TYPE_ORDER = {
  [PANEL_TYPE_CAMERA]:      0,
  [PANEL_TYPE_ALARM]:       1,
  [PANEL_TYPE_AQUATICS]:    2,
  [PANEL_TYPE_CLIMATE]:     3,
  [PANEL_TYPE_MEDIA]:       4,
  [PANEL_TYPE_ENVIRONMENT]: 5,
  [PANEL_TYPE_IRRIGATION]:  6,
  [PANEL_TYPE_WEATHER]:     7,
  [PANEL_TYPE_BATTERY]:     8,
  [PANEL_TYPE_POWER]:       9,   // ← NEW
};
```

---
