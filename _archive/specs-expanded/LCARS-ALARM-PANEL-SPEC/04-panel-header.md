## 3. Panel Header

### Structure

```html
<div class="alarm-header" role="heading" aria-level="3">
  <span class="device-panel-name">${deviceName}</span>
  <span class="device-panel-header-line" aria-hidden="true"></span>
  <span class="alarm-state-icon" aria-hidden="true">${stateIcon}</span>
  <span class="alarm-state-badge" style="color: ${stateColor}">
    ${stateLabel}
  </span>
  <span class="alarm-countdown-badge"
        style="display: ${isCountdown ? 'inline' : 'none'}; color: ${stateColor}">
    ${countdownFormatted}
  </span>
</div>
```

### CSS

```css
.alarm-header {
  grid-area: header;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  min-height: var(--lcars-bar-h);
  border-bottom: 2px solid var(--panel-frame-color);
  transition: border-color var(--lcars-transition-slow);
}

.alarm-state-icon {
  font-size: 1rem;
  transition: color var(--lcars-transition-slow);
}

.alarm-state-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition-slow);
}

.alarm-countdown-badge {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.1em;
}
```

Reuses `.device-panel-name` and `.device-panel-header-line` from the Device Panel Spec §3.1. The state badge colored dynamically gives instant peripheral awareness of the security posture. During countdown states, the time remaining appears next to the badge with tabular numerals to prevent layout jitter.

---
