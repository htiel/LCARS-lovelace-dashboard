## 3. Panel Header

### Structure

```html
<div class="pool-header" role="heading" aria-level="3">
  <span class="device-panel-name">${panelName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="pool-header-badge pool" style="color: ${poolColor}">
    POOL ${poolTemp}°${unit}
  </span>
  <span class="pool-header-badge spa" style="color: ${spaColor}">
    SPA ${spaTemp}°${unit}
  </span>
  <span class="pool-header-badge air" style="color: var(--lcars-space-white)">
    AIR ${airTemp}°${unit}
  </span>
</div>
```

### CSS

```css
.pool-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
}

.pool-header-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.pool-header-badge.pool {
  color: var(--pool-color, var(--lcars-ice));
}

.pool-header-badge.spa {
  color: var(--spa-color, var(--lcars-butterscotch));
}

.pool-header-badge.air {
  color: var(--lcars-space-white);
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The three temperature badges in the header give at-a-glance thermal status — the bridge officer's peripheral view. Pool is always cool-colored, spa is warm-colored, air is neutral white.

---
