## 6. Arm Mode Selector Strip

Horizontal row of pill buttons for selecting the arm mode. Sits below the shield viewscreen within the media area. Only modes supported by the device are rendered.

### Structure

```html
<div class="alarm-mode-strip" role="radiogroup" aria-label="Alarm arm mode">
  ${supportedModes.map(mode => html`
    <button class="alarm-mode-btn ${mode === currentMode ? 'active' : ''}"
            role="radio"
            aria-checked="${mode === currentMode}"
            aria-label="${getModeLabel(mode)}"
            style="--mode-color: ${getAlarmModeColor(mode)}"
            @click="${() => armAlarm(mode)}">
      ${getModeLabel(mode)}
    </button>
  `)}
  <button class="alarm-mode-btn disarm-btn ${state === 'disarmed' ? 'active' : ''}"
          role="radio"
          aria-checked="${state === 'disarmed'}"
          aria-label="Disarm"
          @click="${() => disarmAlarm()}">
    DISARM
  </button>
</div>
```

### CSS

```css
.alarm-mode-strip {
  display: flex;
  flex-wrap: wrap;
  gap: var(--lcars-gap);
  justify-content: center;
  padding-top: 0.5rem;
  width: 100%;
}

.alarm-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: var(--lcars-btn-height);             /* 3.5rem = 56px */
  padding: 0 0.75rem;
  min-width: 5rem;                             /* WCAG 2.5.8 */

  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  white-space: nowrap;
  user-select: none;
}

.alarm-mode-btn:hover {
  filter: brightness(1.2);
}

.alarm-mode-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

/* Active mode — uses dynamic mode color */
.alarm-mode-btn.active,
.alarm-mode-btn[aria-checked="true"] {
  background: var(--mode-color, var(--lcars-gold));
  color: var(--lcars-black);
}

/* Disarm button — special: active state is ice (disarmed = secure) */
.alarm-mode-btn.disarm-btn.active {
  background: var(--lcars-ice);
  color: var(--lcars-black);
}
```

### Mode Labels, Colors, and Icons

```javascript
/**
 * Get the LCARS-style label for an alarm arm mode.
 */
function getAlarmModeLabel(mode) {
  switch (mode) {
    case 'armed_home':          return 'HOME';
    case 'armed_away':          return 'AWAY';
    case 'armed_night':         return 'NIGHT';
    case 'armed_vacation':      return 'VACATION';
    case 'armed_custom_bypass': return 'CUSTOM';
    default:                    return mode.toUpperCase().replace(/^ARMED_/i, '').replace(/_/g, ' ');
  }
}

/**
 * Get the active button color for an arm mode.
 */
function getAlarmModeColor(mode) {
  switch (mode) {
    case 'armed_home':
    case 'armed_night':         return 'var(--lcars-sunflower)';
    case 'armed_away':
    case 'armed_vacation':      return 'var(--lcars-butterscotch)';
    case 'armed_custom_bypass': return 'var(--lcars-african-violet)';
    default:                    return 'var(--lcars-gold)';
  }
}
```

### SimpliSafe Supported Modes

SimpliSafe exposes `armed_home` and `armed_away` only. The mode strip renders exactly those two buttons plus `DISARM`:

```
┌──────╮ ┌──────╮ ┌──────────╮
│ HOME │ │ AWAY │ │  DISARM  │
└──────╯ └──────╯ └──────────╯
```

Other alarm systems (Honeywell, Ring, etc.) may expose `armed_night` and `armed_vacation` — the strip adapts dynamically from the entity's supported features.

---
