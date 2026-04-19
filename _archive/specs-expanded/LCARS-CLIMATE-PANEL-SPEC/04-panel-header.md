## 3. Panel Header

### Structure

```html
<div class="climate-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="climate-action-badge" style="color: ${actionColor}">
    ${actionLabel}
  </span>
  <span class="climate-header-temp" style="color: ${actionColor}">
    ${currentTemp}°${unit}
  </span>
</div>
```

### CSS

```css
.climate-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.climate-action-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.climate-header-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The action badge and ambient temperature readout in the header give at-a-glance status without scrolling — the bridge officer's peripheral view.

---
