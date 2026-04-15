## 3. Panel Header

### Structure

```html
<div class="irrigation-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="irrigation-status-badge" style="color: ${statusColor}">
    ${statusLabel}
  </span>
  <span class="irrigation-next-run" style="color: var(--lcars-sunflower)">
    NEXT: ${nextRunTime}
  </span>
</div>
```

The header shows system-level status at a glance: the controller name, whether anything is currently watering (badge shows `WATERING ZONE 3` or `IDLE`), and the next scheduled run time. A bridge officer reads left-to-right: identity → status → schedule.

### CSS

```css
.irrigation-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.irrigation-status-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.irrigation-next-run {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  margin-left: auto;
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. Header badge dynamically colors based on whether any zone is actively watering.

---
