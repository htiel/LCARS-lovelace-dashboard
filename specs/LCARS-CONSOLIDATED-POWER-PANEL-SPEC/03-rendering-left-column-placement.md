## 2. Rendering — Left-Column Placement

### 2.1 Inject into `normalContent` (Bottom of Stack)

Currently, `normalContent` renders `normalDevices` + `noDevice`. The consolidated power panel appends at the bottom:

```js
const normalContent = html`
  ${normalDevices.map((group) => html`
    <div class="device-group">
      <!-- ... existing normal device rendering unchanged ... -->
    </div>
  `)}
  ${noDevice.length > 0 ? html`
    <div class="device-group">
      <!-- ... existing "Other Entities" unchanged ... -->
    </div>
  ` : ''}
  ${powerCollection ? this._renderConsolidatedPowerPanel(powerCollection) : ''}
`;
```

This places the consolidated power panel **below all normal device groups** in the left content column. It participates in the normal document flow — no absolute positioning, no float.

### 2.2 Two-Column Layout Unchanged

The `area-split-layout` template is unmodified. If the area has other panel devices (camera, climate, media, battery, etc.), the two-column split still applies — the consolidated power panel sits at the bottom of `area-split-main`, while cameras/climate/etc. remain in `area-split-panels`.

If the area has ONLY power devices and no other panel types, `panelDevices` will be empty, and the layout falls back to single-column — the consolidated power panel fills the full width.

---
