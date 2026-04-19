## 3. Panel Header

### Structure

```html
<div class="weather-header" role="heading" aria-level="3">
  <span class="device-panel-name">${locationName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="weather-condition-badge" style="color: ${conditionColor}">
    <span class="weather-glyph" aria-hidden="true">${glyph}</span>
    ${conditionLabel}
  </span>
  <span class="weather-header-temp" style="color: ${conditionColor}">
    ${currentTemp}°${unit}
  </span>
</div>
```

### CSS

```css
.weather-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.weather-condition-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.weather-glyph {
  font-size: 1em;
  margin-right: 0.25rem;
}

.weather-header-temp {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--lcars-transition-slow);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The condition badge, glyph, and ambient temperature in the header give at-a-glance status — the bridge officer's peripheral view of planetary atmospheric conditions.

---
