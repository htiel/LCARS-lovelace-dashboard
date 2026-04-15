## 4. Panel Header

### Structure

```html
<div class="atmos-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="device-panel-badge" style="color: ${aqiColor}">
    AQI: ${aqiValue}
  </span>
  <span class="atmos-quality-label" style="color: ${aqiColor}">
    ${aqiLabel}
  </span>
</div>
```

### CSS

```css
.atmos-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  /* Thin rule separator below header */
  border-bottom: 2px solid var(--panel-frame-color);
}

.atmos-quality-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name`, `.device-panel-header-line`, `.device-panel-badge` from the Device Panel Spec §3.1. The quality label is a new element — bold, colored to match AQI state, gives instant visual status.

---
