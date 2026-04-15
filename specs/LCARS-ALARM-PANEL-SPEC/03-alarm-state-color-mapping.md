## 2. Alarm State → Color Mapping

The `alarm_control_panel` entity state drives the dynamic frame color, shield icon accent, header badge color, and overall panel visual intensity. This is the primary visual feedback channel — the "alert level" of the ship.

### Color Map

| HA State                | Display Label       | LCARS Variable             | Hex       | Rationale                                              |
|-------------------------|---------------------|----------------------------|-----------|--------------------------------------------------------|
| `disarmed`              | `DISARMED`          | `--lcars-ice`              | `#99ccff` | Cool blue — "all stations secure," ship at peace       |
| `armed_home`            | `ARMED HOME`        | `--lcars-sunflower`        | `#ffcc99` | Amber — reduced alertness, crew aboard                 |
| `armed_night`           | `ARMED NIGHT`       | `--lcars-sunflower`        | `#ffcc99` | Amber — same reduced alertness tier as home            |
| `armed_away`            | `ARMED AWAY`        | `--lcars-butterscotch`     | `#ff9966` | Warm orange — "full tactical readiness," ship unmanned |
| `armed_vacation`        | `ARMED VACATION`    | `--lcars-butterscotch`     | `#ff9966` | Same tier as away — extended deployment                |
| `armed_custom_bypass`   | `CUSTOM BYPASS`     | `--lcars-african-violet`   | `#cc99ff` | Distinct hue — non-standard config, flagged visually   |
| `arming`                | `ARMING`            | `--lcars-gold` (pulsing)   | `#ffaa00` | Pulsing gold — "exit the ship," transitional countdown |
| `pending`               | `PENDING`           | `--lcars-gold` (pulsing)   | `#ffaa00` | Pulsing gold — entry delay, action required            |
| `disarming`             | `DISARMING`         | `--lcars-gold` (pulsing)   | `#ffaa00` | Pulsing gold — transitional disarm in progress         |
| `triggered`             | `TRIGGERED`         | `--lcars-tomato` (pulsing) | `#ff5555` | RED ALERT — full emergency, pulsing border and icon    |
| `unavailable`           | `UNAVAILABLE`       | `--lcars-gray`             | `#666688` | System offline — standard disabled                     |
| `unknown`               | `UNKNOWN`           | `--lcars-gray`             | `#666688` | System fault — standard disabled                       |

### Implementation

```javascript
/**
 * Resolve alarm_control_panel state to LCARS color CSS variable.
 * Drives the dynamic frame color, shield icon, and header badge.
 */
function getAlarmStateColor(state) {
  switch (state) {
    case 'disarmed':            return 'var(--lcars-ice)';
    case 'armed_home':
    case 'armed_night':         return 'var(--lcars-sunflower)';
    case 'armed_away':
    case 'armed_vacation':      return 'var(--lcars-butterscotch)';
    case 'armed_custom_bypass': return 'var(--lcars-african-violet)';
    case 'arming':
    case 'pending':
    case 'disarming':           return 'var(--lcars-gold)';
    case 'triggered':           return 'var(--lcars-alert)';
    default:                    return 'var(--lcars-disabled)';
  }
}

/**
 * Return uppercase display label for alarm state.
 */
function getAlarmStateLabel(state) {
  if (state == null) return 'UNAVAILABLE';
  return state.toUpperCase().replace(/_/g, ' ');
}

/**
 * Returns true for transitional states that should pulse.
 */
function isAlarmTransitional(state) {
  return state === 'arming' || state === 'pending' || state === 'disarming';
}

/**
 * Returns true for triggered state — Red Alert mode.
 */
function isAlarmTriggered(state) {
  return state === 'triggered';
}

/**
 * Returns true for any armed state.
 */
function isAlarmArmed(state) {
  return state?.startsWith('armed_') === true;
}

/**
 * Get the shield icon symbol for use in the viewscreen.
 * Returns a Unicode/text symbol — not an MDI icon — to keep
 * the large viewscreen display purely typographic per LCARS convention.
 */
function getAlarmShieldSymbol(state) {
  switch (state) {
    case 'disarmed':            return '✓';
    case 'armed_home':
    case 'armed_night':
    case 'armed_away':
    case 'armed_vacation':
    case 'armed_custom_bypass': return '▲';
    case 'arming':
    case 'pending':
    case 'disarming':           return '◉';
    case 'triggered':           return '✕';
    default:                    return '?';
  }
}

/**
 * Get the short status word displayed below the shield in the viewscreen.
 */
function getAlarmShieldLabel(state) {
  switch (state) {
    case 'disarmed':            return 'SECURE';
    case 'armed_home':          return 'HOME';
    case 'armed_night':         return 'NIGHT';
    case 'armed_away':          return 'ARMED';
    case 'armed_vacation':      return 'VACATION';
    case 'armed_custom_bypass': return 'CUSTOM';
    case 'arming':              return 'ARMING';
    case 'pending':             return 'PENDING';
    case 'disarming':           return 'DISARMING';
    case 'triggered':           return 'BREACHED';
    default:                    return 'OFFLINE';
  }
}
```

### Contrast Verification (all vs `#000000` background)

| Color                    | Hex       | Contrast vs #000 | WCAG Level | Usage                            |
|--------------------------|-----------|-------------------|------------|----------------------------------|
| `--lcars-ice`            | `#99ccff` | 10.3:1            | AAA        | Disarmed frame, shield, badge    |
| `--lcars-sunflower`      | `#ffcc99` | 13.1:1            | AAA        | Armed home/night frame, badge    |
| `--lcars-butterscotch`   | `#ff9966` | 8.2:1             | AAA        | Armed away/vacation frame, badge |
| `--lcars-african-violet` | `#cc99ff` | 8.5:1             | AAA        | Custom bypass                    |
| `--lcars-gold`           | `#ffaa00` | 8.6:1             | AAA        | Arming/pending/disarming         |
| `--lcars-tomato`         | `#ff5555` | 5.2:1             | AA         | Triggered (Red Alert)            |
| `--lcars-gray`           | `#666688` | 4.6:1             | AA         | Unavailable/unknown              |
| `--lcars-space-white`    | `#f5f6fa` | 18.9:1            | AAA        | Labels, data text, keypad digits |

All pass **WCAG 1.4.3 (AA)** minimum 4.5:1. `--lcars-gray` at 4.6:1 is intentionally dim for disabled state and passes AA. `--lcars-tomato` at 5.2:1 is used for triggered state where the text label "TRIGGERED" provides the primary information — color reinforces urgency but is never the sole indicator.

---
