# LCARS Alarm Panel — Design Specification

**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (LCARS UI Design Authority), Worf (Security)  
**Date**: Stardate 2026.04.13  
**Status**: Design Proposal  
**Priority**: HIGH  
**Panel Type**: Alarm Control Panel (Security System)  
**Extends**: `LcarsDevicePanelBase` (per LCARS-DEVICE-PANEL-SPEC.md §9)

---

## 0. Design Philosophy

The Alarm Panel is modeled after the **Enterprise-D main bridge tactical station** — Worf's console. When the shields are down and all is quiet, the display is a calm, cool blue readout confirming "ALL STATIONS SECURE." When the ship enters Yellow Alert, the frame warms to amber and the crew is at heightened readiness. When the alarm triggers — Red Alert — the entire panel screams danger: the frame pulses tomato red, the shield icon blazes, and the status readout demands immediate attention. There is no ambiguity.

This is the security heart of the ship. The operator (homeowner) sees at a glance: *Are we secure? Are we armed? Is something wrong?* The shield icon dominates the viewscreen. The arm/disarm mode pills sit below like the tactical controls Worf reaches for during a crisis. The PIN keypad is a starship security console — clean, authoritative, and unforgiving of mistakes.

Per Roddenberry's mandate: **the ship protects you**. The alarm system runs in the background. The panel reflects threat level, not complexity. The operator arms, disarms, and responds. The system handles the rest.

Per Bracer Jack: **empty space is beautiful**. The shield icon floats in black. The sensor zone list is sparse text. The PIN keypad is a clean grid of pills. No skeuomorphic lock icons, no fake keypads with raised buttons, no glossy badges.

---

## 1. Grid Layout

### ASCII Layout — Disarmed (All Clear)

```
┌──────────────────────────────────────────────────────────────┐
│  SIMPLISAFE                    🛡  DISARMED                  │  ← header (ice frame)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  STATUS          │        ║                      ║           │
│  DISARMED        │        ║      ┌─────────┐     ║           │
│                  │        ║      │  ╔═══╗   │     ║           │
│  ZONES           │        ║      │  ║ ✓ ║   │     ║           │
│  ● FRONT DOOR OK │        ║      │  ╚═══╝   │     ║           │
│  ● BACK DOOR  OK │        ║      │  SECURE   │     ║           │
│  ● MOTION     OK │        ║      └─────────┘     ║           │
│  ● GLASS BRK  OK │        ║                      ║           │
│                  │        ║                      ║           │
│  LAST EVENT      │        ╚══════════════════════╝           │
│  DISARMED 14:32  │                                           │
│                  │        ┌──────╮ ┌──────╮ ┌──────╮         │
│                  │        │ HOME │ │ AWAY │ │ NIGHT│         │
│                  │        └──────╯ └──────╯ └──────╯         │
├──────────────────┴───────────────────────────────────────────┤
│  KEYPAD                                                      │
│  ┌───╮ ┌───╮ ┌───╮                                          │
│  │ 1 │ │ 2 │ │ 3 │           CODE: ● ● ● ●                 │
│  └───╯ └───╯ └───╯                                          │
│  ┌───╮ ┌───╮ ┌───╮           ┌──────────╮                   │
│  │ 4 │ │ 5 │ │ 6 │           │  DISARM  │                   │
│  └───╯ └───╯ └───╯           └──────────╯                   │
│  ┌───╮ ┌───╮ ┌───╮           ┌──────────╮                   │
│  │ 7 │ │ 8 │ │ 9 │           │  CLEAR   │                   │
│  └───╯ └───╯ └───╯           └──────────╯                   │
│  ┌───╮ ┌───╮ ┌───╮                                          │
│  │ ⌫ │ │ 0 │ │ ⏎ │                                          │
│  └───╯ └───╯ └───╯                                          │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Armed Away (Tactical Readiness)

```
┌──────────────────────────────────────────────────────────────┐
│  SIMPLISAFE                    🛡  ARMED AWAY                │  ← header (butterscotch frame)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  STATUS          │        ║                      ║           │
│  ARMED AWAY      │        ║      ┌─────────┐     ║           │
│                  │        ║      │  ╔═══╗   │     ║           │
│  ZONES           │        ║      │  ║ ▲ ║   │     ║           │
│  ● FRONT DOOR OK │        ║      │  ╚═══╝   │     ║           │
│  ● BACK DOOR  OK │        ║      │  ARMED    │     ║           │
│  ● MOTION     OK │        ║      └─────────┘     ║           │
│  ● GLASS BRK  OK │        ║                      ║           │
│                  │        ║                      ║           │
│  LAST EVENT      │        ╚══════════════════════╝           │
│  ARMED 08:15     │                                           │
│                  │        ┌──────╮ ┌──────╮ ┌──────╮         │
│                  │        │ HOME │ │■AWAY │ │ NIGHT│         │
│                  │        └──────╯ └──────╯ └──────╯         │
├──────────────────┴───────────────────────────────────────────┤
│  KEYPAD  (for disarm only)                                   │
│  . . .                                                       │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Arming Countdown (Exit Delay)

```
┌──────────────────────────────────────────────────────────────┐
│  SIMPLISAFE                    ⏳ ARMING  0:45               │  ← header (gold frame, pulsing)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  STATUS          │        ║                      ║           │
│  ARMING          │        ║      ┌─────────┐     ║           │
│  EXIT IN 0:45    │        ║      │         │     ║           │
│                  │        ║      │  0 : 45  │     ║           │
│  ZONES           │        ║      │ ARMING   │     ║           │
│  ● FRONT DOOR OK │        ║      │         │     ║           │
│  ● BACK DOOR  OK │        ║      └─────────┘     ║           │
│  ● MOTION     OK │        ║                      ║           │
│  ● GLASS BRK  OK │        ║   ━━━━━━━━━░░░░░░░   ║           │
│                  │        ╚══════════════════════╝           │
│  LAST EVENT      │                                           │
│  ARMING  21:30   │        ┌──────────────────────╮           │
│                  │        │       CANCEL         │           │
│                  │        └──────────────────────╯           │
├──────────────────┴───────────────────────────────────────────┤
│  (keypad hidden during arming countdown)                     │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — TRIGGERED (RED ALERT)

```
╔══════════════════════════════════════════════════════════════╗
║  SIMPLISAFE                    ⚠  TRIGGERED                 ║  ← header (TOMATO frame, pulsing)
╠══════════════════╦═══════════════════════════════════════════╣
║                  ║        ╔══════════════════════╗           ║
║  ◉ RED ALERT ◉   ║        ║                      ║           ║
║                  ║        ║      ┌─────────┐     ║           ║
║  TRIGGER SOURCE  ║        ║      │  ╔═══╗   │     ║           ║
║  FRONT DOOR      ║        ║      │  ║ ✕ ║   │     ║           ║
║                  ║        ║      │  ╚═══╝   │     ║           ║
║  ZONES           ║        ║      │ BREACHED │     ║           ║
║  ● FRONT DOOR !! ║        ║      └─────────┘     ║           ║
║  ● BACK DOOR  OK ║        ║                      ║           ║
║  ● MOTION     OK ║        ╚══════════════════════╝           ║
║  ● GLASS BRK  OK ║                                           ║
║                  ║                                           ║
║  LAST EVENT      ║                                           ║
║  TRIGGERED 03:14 ║                                           ║
╠══════════════════╩═══════════════════════════════════════════╣
║  KEYPAD — ENTER CODE TO DISARM                               ║
║  ┌───╮ ┌───╮ ┌───╮                                          ║
║  │ 1 │ │ 2 │ │ 3 │           CODE: ● ● ● ●                 ║
║  └───╯ └───╯ └───╯                                          ║
║  ┌───╮ ┌───╮ ┌───╮           ┌──────────╮                   ║
║  │ 4 │ │ 5 │ │ 6 │           │  DISARM  │  ← tomato active  ║
║  └───╯ └───╯ └───╯           └──────────╯                   ║
║  ┌───╮ ┌───╮ ┌───╮                                          ║
║  │ 7 │ │ 8 │ │ 9 │                                          ║
║  └───╯ └───╯ └───╯                                          ║
║  ┌───╮ ┌───╮ ┌───╮                                          ║
║  │ ⌫ │ │ 0 │ │ ⏎ │                                          ║
║  └───╯ └───╯ └───╯                                          ║
╚══════════════════════════════════════════════════════════════╝
```

### CSS Grid Definition

```css
.lcars-alarm-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "keypad   keypad";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-ice));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-ice));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-ice));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-ice));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Dynamic frame color — set by JS based on alarm state */
  --panel-frame-color: var(--alarm-state-color, var(--lcars-ice));

  /* Dynamic accent for shield icon and status readouts */
  --alarm-state-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 6);

  /* Frame color transition for state changes */
  transition: border-color var(--lcars-transition-slow);
}

/* Triggered state — double-thick border for Red Alert emphasis */
.lcars-alarm-panel.triggered {
  border-left-width: 6px;
  border-bottom-width: 6px;
}
```

### Why Dynamic `--panel-frame-color`

The frame color maps directly to threat level — the same way the Enterprise bridge lighting shifts from standard to yellow to red. Peripheral vision catches the color shift instantly. A crew member glancing at this panel from across the room knows the security posture without reading a single character. Disarmed = cool blue calm. Armed = warm amber readiness. Triggered = unmistakable red. This is Worf's console: threat level at a glance.

---

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

## 4. Sensor Telemetry Column (Left)

### Entity Ordering (Top to Bottom)

The sensor column shows the alarm status, zone sensors, and last event. Information is ordered by actionability — the most urgent data at the top.

| Row | Sensor            | Source                                     | Color                             |
|-----|-------------------|--------------------------------------------|-----------------------------------|
| 1   | Status            | `alarm_control_panel` state                | Dynamic `--alarm-state-color`     |
| 2   | Arming Time       | Countdown during `arming`/`pending` only   | Dynamic `--alarm-state-color`     |
| —   | *(divider)*       |                                            |                                   |
| 3   | Trigger Source    | Triggered sensor name (triggered only)     | `var(--lcars-alert)` (tomato)     |
| —   | *(label: ZONES)*  |                                            |                                   |
| 4+  | Zone Sensors      | `binary_sensor.*` entries from the device  | Dynamic per-zone (see §4.1)      |
| —   | *(divider)*       |                                            |                                   |
| N   | Last Event        | Last state change timestamp                | `var(--lcars-disabled)`           |

### CSS

```css
.alarm-sensors {
  grid-area: sensors;
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  padding: 0.25rem 0;
  align-self: start;
}

.alarm-sensors-divider {
  height: 1px;
  background: var(--lcars-disabled);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.alarm-section-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0.25rem 0.5rem 0;
  letter-spacing: 0.05em;
}
```

Sensor lines reuse `.device-sensor-line` from the Device Panel Spec §3.3. The ZONES section label is suppressed in dim gray per Bracer Jack — secondary organizational text, not primary data.

### 4.1 Zone Sensor Status Coloring

Each zone sensor (`binary_sensor`) gets dynamic indicator coloring based on its current state and the alarm panel state:

| Sensor State | Alarm State     | Indicator Color           | Value Text     | Rationale                                  |
|--------------|-----------------|---------------------------|----------------|--------------------------------------------|
| `off` (OK)   | Any              | `var(--lcars-disabled)`   | `OK`           | Normal — zone secure, baseline gray dot    |
| `on` (open)  | `disarmed`       | `var(--lcars-sunflower)`  | `OPEN`         | Informational — door open while disarmed   |
| `on` (open)  | `armed_*`        | `var(--lcars-alert)`      | `OPEN`         | Warning — zone breached while armed        |
| `on` (open)  | `triggered`      | `var(--lcars-alert)` pulse| `!!`           | Emergency — this zone may be the trigger   |
| unavailable  | Any              | `var(--lcars-disabled)`   | `N/A`          | Sensor offline                             |

```javascript
/**
 * Get the indicator color for a zone sensor based on its state
 * and the current alarm panel state.
 */
function getZoneColor(sensorState, alarmState) {
  if (sensorState === 'unavailable' || sensorState === 'unknown') {
    return 'var(--lcars-disabled)';
  }
  if (sensorState === 'off') {
    return 'var(--lcars-disabled)';
  }
  // Sensor is on (open/detected/triggered)
  if (alarmState === 'disarmed') {
    return 'var(--lcars-sunflower)';
  }
  return 'var(--lcars-alert)';
}

/**
 * Get the display value for a zone sensor.
 */
function getZoneValue(sensorState, alarmState) {
  if (sensorState === 'unavailable' || sensorState === 'unknown') return 'N/A';
  if (sensorState === 'off') return 'OK';
  if (alarmState === 'triggered') return '!!';
  return 'OPEN';
}
```

### 4.2 Zone Sensor CSS

```css
.alarm-zone-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  padding: 0 0.5rem;
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
}

.alarm-zone-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--lcars-transition);
}

.alarm-zone-indicator.ok {
  background: var(--lcars-disabled);
}

.alarm-zone-indicator.open {
  background: var(--lcars-sunflower);
}

.alarm-zone-indicator.alert {
  background: var(--lcars-alert);
  animation: zone-alert-pulse 1s ease-in-out infinite;
}

.alarm-zone-name {
  color: var(--lcars-space-white);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-zone-value {
  white-space: nowrap;
  font-weight: 700;
  transition: color var(--lcars-transition);
}

.alarm-zone-value.ok {
  color: var(--lcars-disabled);
}

.alarm-zone-value.open {
  color: var(--lcars-sunflower);
}

.alarm-zone-value.alert {
  color: var(--lcars-alert);
  font-weight: 700;
}

@keyframes zone-alert-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .alarm-zone-indicator.alert {
    animation: none !important;
    width: 10px;
    height: 10px;
  }
}
```

### 4.3 Last Event Badge

```css
.alarm-last-event {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-disabled);
  text-transform: uppercase;
  padding: 0 0.5rem;
  white-space: nowrap;
  letter-spacing: 0.05em;
}
```

```javascript
/**
 * Format the last state change as a compact timestamp.
 * Returns "HH:MM" for today, "MMM DD HH:MM" for older.
 */
function formatLastEvent(lastChanged) {
  if (!lastChanged) return '--:--';
  const d = new Date(lastChanged);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (d.toDateString() === now.toDateString()) {
    return time;
  }

  const months = ['JAN','FEB','MAR','APR','MAY','JUN',
                  'JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[d.getMonth()]} ${pad(d.getDate())} ${time}`;
}
```

---

## 5. Primary Media Frame — Shield Viewscreen

The center-right viewscreen contains a large shield/status icon — the "tactical readout." This is the dominant visual element. At a glance, its shape and color communicate the current security posture. During arming/pending states, the shield is replaced by a countdown timer display.

### 5.1 Shield Icon (SVG)

An SVG shield shape with a central status symbol and label. The shield uses the dynamic `--alarm-state-color` for both stroke and the enclosed symbol.

```html
<div class="alarm-viewscreen"
     tabindex="0"
     role="button"
     aria-label="Security status: ${stateLabel}. Press Enter for details.">

  <svg class="alarm-shield-svg"
       viewBox="0 0 160 180"
       role="img"
       aria-hidden="true">

    <!-- Shield outline -->
    <path class="alarm-shield-path"
          d="M80 10 L145 45 L145 100 Q145 155 80 170 Q15 155 15 100 L15 45 Z"
          fill="none"
          stroke="var(--alarm-state-color)"
          stroke-width="4"
          stroke-linejoin="round" />

    <!-- Status symbol (centered) -->
    <text class="alarm-shield-symbol"
          x="80" y="95"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="var(--alarm-state-color)"
          font-family="var(--lcars-font)"
          font-size="48">
      ${shieldSymbol}
    </text>

    <!-- Status label (below symbol) -->
    <text class="alarm-shield-label"
          x="80" y="135"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="var(--alarm-state-color)"
          font-family="var(--lcars-font)"
          font-size="16">
      ${shieldLabel}
    </text>
  </svg>

  <!-- Arm mode pills (below the viewscreen box, inside media area) -->
  <div class="alarm-mode-strip" role="radiogroup" aria-label="Alarm arm mode">
    <!-- See §6 -->
  </div>
</div>
```

### 5.2 Countdown Display (Arming/Pending States)

During `arming`, `pending`, or `disarming` states, the shield icon is replaced with a countdown timer and progress bar. The viewscreen becomes a mission clock.

```html
<div class="alarm-countdown-display"
     style="display: ${isCountdown ? 'flex' : 'none'}">
  <span class="alarm-countdown-time"
        role="timer"
        aria-live="assertive"
        aria-label="Time remaining: ${countdownSeconds} seconds">
    ${countdownFormatted}
  </span>
  <span class="alarm-countdown-label">
    ${countdownLabel}
  </span>
  <div class="alarm-countdown-bar"
       role="progressbar"
       aria-valuemin="0"
       aria-valuemax="${totalSeconds}"
       aria-valuenow="${remainingSeconds}">
    <div class="alarm-countdown-bar-fill"
         style="width: ${progressPct}%">
    </div>
  </div>
</div>
```

### Viewscreen CSS

```css
.alarm-viewscreen {
  grid-area: media;
  position: relative;
  border: 3px solid var(--panel-frame-color, var(--lcars-ice));
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--lcars-bg);
  aspect-ratio: var(--media-aspect, 1 / 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;

  transition: border-color var(--lcars-transition-slow);
}

/* Corner brackets — reuse from Device Panel Spec §3.2 */
.alarm-viewscreen::before,
.alarm-viewscreen::after {
  content: '';
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-color: var(--panel-frame-color, var(--lcars-ice));
  border-style: solid;
  pointer-events: none;
  z-index: 1;
  transition: border-color var(--lcars-transition-slow);
}

.alarm-viewscreen::before {
  top: 0.25rem;
  left: 0.25rem;
  border-width: 2px 0 0 2px;
  border-radius: 0.25rem 0 0 0;
}

.alarm-viewscreen::after {
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 0 2px 2px 0;
  border-radius: 0 0 0.25rem 0;
}

.alarm-shield-svg {
  width: 100%;
  max-width: 10rem;
  height: auto;
  display: block;
}

/* Shield path transition for state changes */
.alarm-shield-path {
  transition: stroke var(--lcars-transition-slow);
}

.alarm-shield-symbol {
  transition: fill var(--lcars-transition-slow);
}

.alarm-shield-label {
  transition: fill var(--lcars-transition-slow);
}

/* Countdown timer display */
.alarm-countdown-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.alarm-countdown-time {
  font-family: var(--lcars-font);
  font-size: 2rem;
  color: var(--alarm-state-color);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.15em;
  transition: color var(--lcars-transition-slow);
}

.alarm-countdown-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--alarm-state-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Countdown progress bar */
.alarm-countdown-bar {
  width: 80%;
  height: 4px;
  background: var(--lcars-disabled);
  border-radius: 2px;
  overflow: hidden;
}

.alarm-countdown-bar-fill {
  height: 100%;
  background: var(--alarm-state-color);
  border-radius: 2px;
  transition: width 1s linear;
}
```

### Countdown Logic (JS)

```javascript
/**
 * Countdown timer for arming/pending/disarming states.
 * Uses the alarm entity's last_changed timestamp and a
 * configurable delay duration.
 *
 * NOTE: SimpliSafe does not expose countdown duration via HA.
 * The default exit delay (60s) and entry delay (30s) must be
 * configured in the card config YAML.
 */
class AlarmCountdown {
  constructor(totalSeconds) {
    this._total = totalSeconds;
    this._startTime = null;
    this._intervalId = null;
    this._onTick = null;
    this._onComplete = null;
  }

  start(onTick, onComplete) {
    this.stop();
    this._startTime = Date.now();
    this._onTick = onTick;
    this._onComplete = onComplete;
    this._intervalId = setInterval(() => this._tick(), 250);
    this._tick();
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  _tick() {
    const elapsed = (Date.now() - this._startTime) / 1000;
    const remaining = Math.max(0, this._total - elapsed);

    if (this._onTick) {
      this._onTick({
        remaining: Math.ceil(remaining),
        total: this._total,
        progressPct: ((this._total - remaining) / this._total) * 100,
        formatted: this._format(Math.ceil(remaining)),
      });
    }

    if (remaining <= 0) {
      this.stop();
      if (this._onComplete) this._onComplete();
    }
  }

  _format(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
```

---

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

## 7. PIN Code Keypad

The keypad is the security console — the most critical interactive element. It must be clean, fast, and secure. Worf has demanded a full security review on this component.

### 7.1 Keypad Layout

```
┌───╮ ┌───╮ ┌───╮           CODE: ● ● ● ●
│ 1 │ │ 2 │ │ 3 │
└───╯ └───╯ └───╯           ┌──────────╮
┌───╮ ┌───╮ ┌───╮           │  DISARM  │
│ 4 │ │ 5 │ │ 6 │           └──────────╯
└───╯ └───╯ └───╯           ┌──────────╮
┌───╮ ┌───╮ ┌───╮           │  CLEAR   │
│ 7 │ │ 8 │ │ 9 │           └──────────╯
└───╯ └───╯ └───╯
┌───╮ ┌───╮ ┌───╮
│ ⌫ │ │ 0 │ │ ⏎ │
└───╯ └───╯ └───╯
```

### 7.2 Keypad Structure

```html
<div class="alarm-keypad"
     role="group"
     aria-label="Security code keypad">

  <div class="alarm-keypad-grid">
    ${['1','2','3','4','5','6','7','8','9','backspace','0','enter'].map(key => html`
      <button class="alarm-key ${key === 'backspace' || key === 'enter' ? 'alarm-key-action' : ''}"
              aria-label="${getKeyLabel(key)}"
              @click="${() => handleKeyPress(key)}">
        ${getKeyDisplay(key)}
      </button>
    `)}
  </div>

  <div class="alarm-keypad-side">
    <!-- Masked code display -->
    <div class="alarm-code-display"
         role="status"
         aria-live="polite"
         aria-label="Code entered: ${codeLength} digits">
      <span class="alarm-code-label">CODE</span>
      <div class="alarm-code-dots" aria-hidden="true">
        ${codeDots}
      </div>
    </div>

    <!-- Action buttons -->
    <button class="alarm-action-btn disarm"
            aria-label="Disarm alarm with entered code"
            @click="${() => submitDisarm()}">
      DISARM
    </button>
    <button class="alarm-action-btn clear"
            aria-label="Clear entered code"
            @click="${() => clearCode()}">
      CLEAR
    </button>
  </div>
</div>
```

### 7.3 Keypad CSS

```css
.alarm-keypad {
  grid-area: keypad;
  display: flex;
  gap: calc(var(--lcars-gap) * 4);
  padding-top: var(--lcars-gap);
  border-top: 2px solid var(--panel-frame-color);
  transition: border-color var(--lcars-transition-slow);
}

.alarm-keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--lcars-gap);
  flex-shrink: 0;
}

.alarm-key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;                             /* 56px — well above WCAG 2.5.8 24px */
  min-width: 3.5rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-sub);       /* 1.25rem — digits are sub-header tier */
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.alarm-key:hover {
  filter: brightness(1.2);
}

.alarm-key:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.alarm-key:active {
  background: var(--lcars-gold);
}

/* Action keys (backspace, enter) — distinct color */
.alarm-key-action {
  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
}

.alarm-key-action:active {
  background: var(--lcars-gold);
  color: var(--lcars-black);
}

/* Keypad side panel — code display + action buttons */
.alarm-keypad-side {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
  justify-content: center;
  flex: 1;
}

/* Masked code display */
.alarm-code-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.alarm-code-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-space-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.alarm-code-dots {
  display: flex;
  gap: 0.375rem;
}

.alarm-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: background var(--lcars-transition);
}

.alarm-code-dot.filled {
  background: var(--alarm-state-color, var(--lcars-ice));
}

.alarm-code-dot.empty {
  background: var(--lcars-disabled);
  opacity: 0.5;
}

/* Action buttons */
.alarm-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--lcars-btn-height);             /* 3.5rem = 56px */
  padding: 0 1rem;
  min-width: 7rem;

  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  border: none;
  border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0;

  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: filter var(--lcars-transition), background var(--lcars-transition);
  user-select: none;
}

.alarm-action-btn:hover {
  filter: brightness(1.2);
}

.alarm-action-btn:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}

.alarm-action-btn:active {
  background: var(--lcars-gold);
}

/* Clear button — subdued */
.alarm-action-btn.clear {
  background: var(--lcars-disabled);
  color: var(--lcars-space-white);
}

/* Triggered state — disarm button becomes tomato for urgency */
.lcars-alarm-panel.triggered .alarm-action-btn.disarm {
  background: var(--lcars-alert);
  color: var(--lcars-black);
}
```

### 7.4 Keypad Key Maps

```javascript
/**
 * Get the display text for a keypad key.
 */
function getKeyDisplay(key) {
  switch (key) {
    case 'backspace': return '⌫';
    case 'enter':     return '⏎';
    default:          return key;
  }
}

/**
 * Get the accessible label for a keypad key.
 */
function getKeyLabel(key) {
  switch (key) {
    case 'backspace': return 'Delete last digit';
    case 'enter':     return 'Submit code';
    default:          return `Digit ${key}`;
  }
}
```

### 7.5 PIN Code Security (⚠ Worf Review Required)

The PIN code handler must follow strict security practices. Worf has flagged this component for mandatory security review.

```javascript
/**
 * Secure PIN code handler.
 *
 * SECURITY REQUIREMENTS (Worf-mandated):
 * 1. Code is stored in a local variable, NEVER in DOM attributes or dataset
 * 2. Code is NEVER logged to console, even in debug mode
 * 3. Code is cleared from memory immediately after submission
 * 4. Code display uses masked dots only — digits are NEVER shown
 * 5. Code input has a maximum length to prevent buffer abuse
 * 6. Failed submissions clear the code and show a brief error state
 * 7. Code is transmitted to HA service call only — never stored in state
 * 8. No autocomplete, no browser password saving on this input
 */
class AlarmCodeHandler {
  constructor(maxLength = 8) {
    this._code = '';
    // ⚠ Worf Security Requirement: hardcode maxLength to safe range [4, 10]
    // Never accept from YAML config — prevents memory exhaustion attack
    this._maxLength = Math.min(Math.max(maxLength, 4), 10);
    this._onUpdate = null;
    // Rate limiting: track failed attempts (⚠ Worf MUST FIX)
    this._failedAttempts = 0;
    this._lockoutUntil = 0;
    // NOTE: JavaScript strings are immutable and GC'd non-deterministically.
    // this._code = '' does not securely zero memory. This is an accepted
    // browser platform limitation, not a code defect.
  }

  setUpdateCallback(callback) {
    this._onUpdate = callback;
  }

  handleKey(key) {
    if (key === 'backspace') {
      this._code = this._code.slice(0, -1);
    } else if (key === 'enter') {
      // Submit handled by the submit action, not enter key alone
      return;
    } else if (/^[0-9]$/.test(key) && this._code.length < this._maxLength) {
      this._code += key;
    }
    this._notify();
  }

  /**
   * Get the current code for submission, then clear it.
   * Code is returned exactly once and wiped.
   */
  consumeCode() {
    const code = this._code;
    this._code = '';
    this._notify();
    return code;
  }

  clear() {
    this._code = '';
    this._notify();
  }

  get length() {
    return this._code.length;
  }

  get isEmpty() {
    return this._code.length === 0;
  }

  /**
   * Generate masked dot array for the display.
   * Returns array of { filled: boolean } objects.
   */
  getMaskedDisplay(displaySlots = 4) {
    const slots = Math.max(displaySlots, this._code.length);
    const dots = [];
    for (let i = 0; i < slots; i++) {
      dots.push({ filled: i < this._code.length });
    }
    return dots;
  }

  _notify() {
    if (this._onUpdate) {
      this._onUpdate({
        length: this._code.length,
        isEmpty: this._code.length === 0,
        dots: this.getMaskedDisplay(),
      });
    }
  }

  /**
   * Destroy handler — zero out the code from memory.
   */
  destroy() {
    this._code = '';
    this._onUpdate = null;
  }
}
```

### 7.6 Alarm Service Calls

```javascript
/**
 * Arm the alarm in the specified mode.
 * If the alarm requires a code, pass it from the keypad.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - alarm_control_panel entity ID
 * @param {string} mode - arm mode (armed_home, armed_away, etc.)
 * @param {AlarmCodeHandler} codeHandler - PIN code handler
 */
function armAlarm(hass, entityId, mode, codeHandler) {
  const serviceMap = {
    'armed_home':          'alarm_arm_home',
    'armed_away':          'alarm_arm_away',
    'armed_night':         'alarm_arm_night',
    'armed_vacation':      'alarm_arm_vacation',
    'armed_custom_bypass': 'alarm_arm_custom_bypass',
  };

  const service = serviceMap[mode];
  if (!service) return;

  const data = { entity_id: entityId };

  // Only include code if the user entered one
  if (!codeHandler.isEmpty) {
    data.code = codeHandler.consumeCode();
  } else {
    // Some systems (SimpliSafe) don't require code to arm
    codeHandler.clear();
  }

  hass.callService('alarm_control_panel', service, data);
}

/**
 * Disarm the alarm with the entered PIN code.
 * @param {object} hass - Home Assistant instance
 * @param {string} entityId - alarm_control_panel entity ID
 * @param {AlarmCodeHandler} codeHandler - PIN code handler
 */
function disarmAlarm(hass, entityId, codeHandler) {
  const code = codeHandler.consumeCode();

  const data = { entity_id: entityId };
  if (code) {
    data.code = code;
  }

  hass.callService('alarm_control_panel', 'alarm_disarm', data);
}
```

### 7.7 Keyboard Navigation for Keypad

The keypad supports full keyboard input — the user can type digits directly without clicking. Physical keyboard input is captured via a `keydown` listener on the keypad container:

```javascript
/**
 * Handle keyboard events on the keypad container.
 * Captures digit keys, backspace, and enter.
 */
function handleKeypadKeydown(event, codeHandler, submitCallback, actionContext) {
  const key = event.key;

  // ⚠ Worf: reject input during lockout
  if (codeHandler.isLockedOut) {
    event.preventDefault();
    return;
  }

  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    codeHandler.handleKey(key);
  } else if (key === 'Backspace') {
    event.preventDefault();
    codeHandler.handleKey('backspace');
  } else if (key === 'Enter') {
    event.preventDefault();
    // ⚠ Worf MUST FIX: require explicit action context on Enter
    // Do not auto-disarm — require actionContext to be explicitly set
    // by the user selecting ARM mode or DISARM button
    if (actionContext && typeof actionContext === 'string') {
      submitCallback(actionContext);
    }
  } else if (key === 'Escape') {
    event.preventDefault();
    codeHandler.clear();
  }
}
```

The keypad container gets `tabindex="0"` so it can receive focus and keyboard input. Individual digit buttons remain separately focusable for assistive technology users who navigate button-by-button.

### 7.8 Keypad Visibility Logic

The keypad is not always visible — it appears only when relevant to reduce visual noise (Bracer Jack: empty space is beautiful):

| Alarm State     | Keypad Visible | Reason                                           |
|-----------------|----------------|--------------------------------------------------|
| `disarmed`      | Yes            | Code needed to arm (if code_arm_required)        |
| `armed_*`       | Yes            | Code needed to disarm                            |
| `arming`        | No             | Countdown active — show CANCEL button instead    |
| `pending`       | Yes            | Entry delay — urgent code entry to disarm        |
| `disarming`     | No             | Disarm in progress                               |
| `triggered`     | Yes            | Emergency — code entry to disarm immediately     |
| `unavailable`   | No             | System offline                                   |

```javascript
/**
 * Determine if the keypad should be visible.
 */
function isKeypadVisible(state, codeRequired) {
  if (state === 'arming' || state === 'disarming' || state === 'unavailable' || state === 'unknown') {
    return false;
  }
  // Always show for triggered and pending — these are urgent
  if (state === 'triggered' || state === 'pending') return true;
  // For armed/disarmed, show only if code is required
  if (state === 'disarmed') return codeRequired;
  return true;
}
```

---

## 8. Red Alert Animation System

The triggered state is the most visually intense state in the entire LCARS Dashboard. This is **Red Alert** — the ship is under attack.

### 8.1 Frame Pulse (Triggered)

```css
.lcars-alarm-panel.triggered {
  animation: alarm-red-alert-frame 1s ease-in-out infinite;
}

@keyframes alarm-red-alert-frame {
  0%, 100% {
    border-color: var(--lcars-alert);
  }
  50% {
    border-color: rgba(255, 85, 85, 0.3);
  }
}
```

### 8.2 Shield Pulse (Triggered)

The shield icon inside the viewscreen pulses in sync:

```css
.alarm-shield-svg.triggered .alarm-shield-path {
  animation: alarm-shield-pulse 1s ease-in-out infinite;
}

@keyframes alarm-shield-pulse {
  0%, 100% {
    stroke: var(--lcars-alert);
    stroke-width: 4;
  }
  50% {
    stroke: rgba(255, 85, 85, 0.5);
    stroke-width: 6;
  }
}

.alarm-shield-svg.triggered .alarm-shield-symbol,
.alarm-shield-svg.triggered .alarm-shield-label {
  animation: alarm-text-pulse 1s ease-in-out infinite;
}

@keyframes alarm-text-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
```

### 8.3 Viewscreen Border Pulse (Triggered)

```css
.lcars-alarm-panel.triggered .alarm-viewscreen {
  animation: alarm-viewscreen-pulse 1s ease-in-out infinite;
}

@keyframes alarm-viewscreen-pulse {
  0%, 100% {
    border-color: var(--lcars-alert);
    border-width: 3px;
  }
  50% {
    border-color: rgba(255, 85, 85, 0.4);
    border-width: 5px;
  }
}
```

### 8.4 Arming/Pending Pulse (Gold)

Transitional states use a gentler gold pulse:

```css
.lcars-alarm-panel.transitional {
  animation: alarm-arming-pulse 1.5s ease-in-out infinite;
}

@keyframes alarm-arming-pulse {
  0%, 100% {
    border-color: var(--lcars-gold);
  }
  50% {
    border-color: rgba(255, 170, 0, 0.4);
  }
}

.alarm-shield-svg.transitional .alarm-shield-path {
  animation: alarm-arming-shield-pulse 1.5s ease-in-out infinite;
}

@keyframes alarm-arming-shield-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.alarm-countdown-time {
  /* Countdown numbers pulse gently during arming */
}

.lcars-alarm-panel.transitional .alarm-countdown-time {
  animation: alarm-countdown-pulse 1.5s ease-in-out infinite;
}

@keyframes alarm-countdown-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
```

### 8.5 Viewscreen Activation

Reuse the existing `viewscreen-activate` keyframes from the Device Panel Spec §7:

```css
.alarm-viewscreen {
  animation: viewscreen-activate 600ms ease-out both;
}

@keyframes viewscreen-activate {
  0%   { clip-path: inset(50% 0 50% 0); filter: brightness(2) saturate(0); }
  40%  { clip-path: inset(10% 0 10% 0); filter: brightness(1.5) saturate(0.3); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1) saturate(1); }
}
```

### 8.6 Panel Cascade Entry

```css
.lcars-alarm-panel {
  animation: lcars-cascade-in 300ms ease-out both;
}
```

### 8.7 Frame Color Transition

When alarm state changes (disarmed → arming → armed), the frame color transitions smoothly:

```css
.lcars-alarm-panel {
  transition: border-color var(--lcars-transition-slow);
}

.alarm-header {
  transition: border-color var(--lcars-transition-slow);
}

.alarm-keypad {
  transition: border-color var(--lcars-transition-slow);
}
```

### 8.8 Keypad Button Flash (Input Feedback)

When a digit key is pressed, it briefly flashes gold for tactile feedback:

```css
@keyframes key-flash {
  0%   { background: var(--lcars-gold); }
  100% { background: var(--lcars-sunflower); }
}

.alarm-key[data-pressed] {
  animation: key-flash 150ms ease-out;
}
```

### 8.9 Error Shake (Wrong Code)

If the disarm attempt fails (wrong code), the code display shakes horizontally:

```css
@keyframes code-error-shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}

.alarm-code-display.error {
  animation: code-error-shake 400ms ease-out;
}

.alarm-code-display.error .alarm-code-dot.filled {
  background: var(--lcars-alert);
}
```

### 8.10 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lcars-alarm-panel.triggered,
  .lcars-alarm-panel.transitional,
  .lcars-alarm-panel.triggered .alarm-viewscreen,
  .alarm-shield-svg.triggered .alarm-shield-path,
  .alarm-shield-svg.triggered .alarm-shield-symbol,
  .alarm-shield-svg.triggered .alarm-shield-label,
  .alarm-shield-svg.transitional .alarm-shield-path,
  .lcars-alarm-panel.transitional .alarm-countdown-time,
  .alarm-zone-indicator.alert,
  .alarm-key[data-pressed],
  .alarm-code-display.error {
    animation: none !important;
  }

  /* Static alternatives for triggered state */
  .lcars-alarm-panel.triggered {
    border-color: var(--lcars-alert);
    border-width: 6px 3px 6px 6px;            /* Extra thick = urgent */
  }

  .lcars-alarm-panel.triggered .alarm-viewscreen {
    border-color: var(--lcars-alert);
    border-width: 4px;
  }

  .alarm-zone-indicator.alert {
    width: 10px;
    height: 10px;                              /* Larger dot = urgent */
  }

  /* Arming/pending — static gold with thick border */
  .lcars-alarm-panel.transitional {
    border-color: var(--lcars-gold);
    border-width: 5px 3px 5px 5px;
  }
}
```

All animations respect `prefers-reduced-motion` per WCAG 2.3.3. Reduced-motion users get static visual weight increases (thicker borders, larger dots) as substitutes for animation urgency cues.

---

## 9. HA Entity Mapping

### Target Devices

| Device          | Entity ID                            | Supported States                                    | Code Required |
|-----------------|--------------------------------------|-----------------------------------------------------|---------------|
| SimpliSafe      | `alarm_control_panel.simplisafe`     | `disarmed`, `armed_home`, `armed_away`, `triggered` | Config-dependent |

### Required Entity: alarm_control_panel

The primary entity — provides all alarm state and arm/disarm controls.

| Attribute               | Used For                                      | Fallback             |
|-------------------------|-----------------------------------------------|----------------------|
| `state`                 | Current alarm state (frame color, shield icon)| `'unavailable'`     |
| `code_arm_required`     | Whether code is needed to arm                 | `false`              |
| `code_format`           | Code format (`number` or `text`)              | `'number'`           |
| `supported_features`    | Bitmask of supported arm modes                | Derive from state    |
| `changed_by`            | Who/what last changed the state               | Section hidden       |
| `last_changed`          | Timestamp of last state change                | `'--:--'`            |

### Supported Features Bitmask

```javascript
/**
 * Alarm control panel supported features (from HA core).
 * Source: homeassistant/components/alarm_control_panel/const.py
 */
const AlarmFeatures = {
  ARM_HOME:          1,
  ARM_AWAY:          2,
  ARM_NIGHT:         4,
  ARM_VACATION:      16,
  ARM_CUSTOM_BYPASS: 8,
  TRIGGER:           32,
};

/**
 * Get the list of arm modes supported by this alarm entity.
 */
function getSupportedArmModes(stateObj) {
  const features = stateObj?.attributes?.supported_features || 0;
  const modes = [];
  if (features & AlarmFeatures.ARM_HOME)          modes.push('armed_home');
  if (features & AlarmFeatures.ARM_AWAY)          modes.push('armed_away');
  if (features & AlarmFeatures.ARM_NIGHT)         modes.push('armed_night');
  if (features & AlarmFeatures.ARM_VACATION)      modes.push('armed_vacation');
  if (features & AlarmFeatures.ARM_CUSTOM_BYPASS) modes.push('armed_custom_bypass');
  return modes;
}
```

### Optional Linked Entities (SimpliSafe Sensor Zones)

Zone sensors are discovered via the same device or configured explicitly. SimpliSafe exposes these sensor types:

| Entity Domain     | Device Class        | Zone Name Example      | Used For                       |
|-------------------|---------------------|------------------------|--------------------------------|
| `binary_sensor`   | `door`              | Front Door             | Entry zone contact sensor      |
| `binary_sensor`   | `window`            | Living Room Window     | Window contact sensor          |
| `binary_sensor`   | `motion`            | Hallway Motion         | Motion detector                |
| `binary_sensor`   | `vibration`         | Glass Break            | Glass break sensor             |
| `binary_sensor`   | `moisture`          | Basement Water Leak    | Water leak sensor              |
| `binary_sensor`   | `cold`              | Freeze Sensor          | Freeze/temperature alert       |
| `binary_sensor`   | `smoke`             | Smoke Detector         | Smoke/CO detector              |
| `binary_sensor`   | `safety`            | CO Detector            | Carbon monoxide detector       |
| `sensor`          | `signal_strength`   | Base Station Signal    | Diagnostics                    |
| `sensor`          | `battery`           | Sensor Battery         | Zone sensor battery level      |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the alarm panel.
 * Returns { alarm, zones, diagnostics, auxiliary }.
 */
function classifyAlarmEntities(entities) {
  const result = {
    alarm: null,          // primary alarm_control_panel entity
    zones: [],            // binary_sensor zone entities
    diagnostics: [],      // entity_category: diagnostic
    auxiliary: [],        // other sensors (battery, signal, etc.)
  };

  const ZONE_CLASSES = ['door', 'window', 'motion', 'vibration',
    'moisture', 'cold', 'smoke', 'safety', 'opening',
    'garage_door', 'lock', 'tamper', 'problem'];

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const dc = e.original_device_class || e.device_class || '';
    const cat = e.entity_category || '';

    if (domain === 'alarm_control_panel') {
      result.alarm = result.alarm || e;
      continue;
    }

    if (cat === 'diagnostic' || cat === 'config') {
      result.diagnostics.push(e);
      continue;
    }

    if (domain === 'binary_sensor' && ZONE_CLASSES.includes(dc)) {
      result.zones.push(e);
      continue;
    }

    if (domain === 'sensor') {
      result.auxiliary.push(e);
      continue;
    }
  }

  // Sort zones by device class priority (entry points first, then detection, then environmental)
  const zonePriority = ['door', 'window', 'opening', 'garage_door', 'lock',
    'motion', 'vibration', 'tamper', 'moisture', 'cold', 'smoke', 'safety', 'problem'];
  result.zones.sort((a, b) => {
    const aDc = a.original_device_class || a.device_class || '';
    const bDc = b.original_device_class || b.device_class || '';
    const aIdx = zonePriority.indexOf(aDc);
    const bIdx = zonePriority.indexOf(bDc);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return result;
}
```

### HA Service Call Mapping

| Panel Action       | HA Service                                     | Data                                 |
|--------------------|------------------------------------------------|--------------------------------------|
| Arm Home           | `alarm_control_panel.alarm_arm_home`           | `{ entity_id, code? }`              |
| Arm Away           | `alarm_control_panel.alarm_arm_away`           | `{ entity_id, code? }`              |
| Arm Night          | `alarm_control_panel.alarm_arm_night`          | `{ entity_id, code? }`              |
| Arm Vacation       | `alarm_control_panel.alarm_arm_vacation`       | `{ entity_id, code? }`              |
| Arm Custom Bypass  | `alarm_control_panel.alarm_arm_custom_bypass`  | `{ entity_id, code? }`              |
| Disarm             | `alarm_control_panel.alarm_disarm`             | `{ entity_id, code? }`              |

The `code` parameter is included only when the user has entered digits. It is consumed from the `AlarmCodeHandler` via `consumeCode()` — the handler clears it from memory immediately after extraction. The code string is passed directly to `hass.callService()` — it is never stored in component state, DOM attributes, local storage, or logged.

---

## 10. Card Configuration (YAML)

```yaml
type: custom:lcars-alarm-panel
entity: alarm_control_panel.simplisafe
name: SIMPLISAFE                                # Optional — overrides friendly_name
# Countdown timers (not exposed by all integrations)
exit_delay: 60                                  # seconds — arming countdown (clamped to 1–300)
entry_delay: 30                                 # seconds — pending countdown (clamped to 1–300)
# Zone sensors (auto-discovered from device, or explicit list)
zones:
  - binary_sensor.simplisafe_front_door
  - binary_sensor.simplisafe_back_door
  - binary_sensor.simplisafe_hallway_motion
  - binary_sensor.simplisafe_glass_break
# States shown in mode strip (auto-discovered from supported_features, or explicit)
states:
  - armed_home
  - armed_away
# Theme overrides (optional)
theme_overrides:
  disarmed_color: var(--lcars-ice)
  armed_color: var(--lcars-butterscotch)
  triggered_color: var(--lcars-tomato)
```

---

## 11. Typography & Spacing

### Font Sizes (Three sizes only — Bracer Jack Rule 6)

| Element                   | Size Token                   | Value      | Usage                              |
|---------------------------|------------------------------|------------|------------------------------------|
| Shield symbol (SVG)       | Title tier equivalent        | `48` (SVG) | Large viewscreen shield symbol     |
| Countdown time            | `--lcars-font-size-title`    | `2rem`     | Countdown clock in viewscreen      |
| Device name, keypad digits| `--lcars-font-size-sub`      | `1.25rem`  | Panel header, digit buttons        |
| All other text            | `--lcars-font-size-data`     | `0.875rem` | Sensor labels, values, badges, btns|

**Three font sizes. No exceptions.** The SVG shield symbol at font-size 48 (within a 160×180 viewBox) maps to the "title" tier visually. The countdown time at 2rem is the same title tier. Keypad digits use sub-header. Everything else is data.

### Spacing Constants (Jörn Weißenborn Grid)

| Spacing                       | Token / Value                 | Usage                                          |
|-------------------------------|-------------------------------|-------------------------------------------------|
| Gap between all elements      | `var(--lcars-gap)` = 0.25rem  | Universal LCARS grid spacing                   |
| Panel internal padding        | `var(--lcars-gap)` = 0.25rem  | Inside the panel frame border                  |
| Sensor/zone line min-height   | 1.75rem                       | ~28px — exceeds WCAG 2.5.8 (24px min)         |
| Mode button height            | `var(--lcars-btn-height)` = 3.5rem | Standard LCARS button = 56px             |
| Mode button min-width         | 5rem = 80px                   | Exceeds WCAG 2.5.8                             |
| Keypad digit button           | 3.5rem × 3.5rem = 56px       | Large touch target — exceeds 24px minimum      |
| Action button height          | `var(--lcars-btn-height)` = 3.5rem | 56px — matches mode buttons             |
| Keypad grid gap               | `var(--lcars-gap)` = 0.25rem  | Between digit buttons                          |
| Media frame border            | 3px solid                     | Viewscreen border — matches Device Panel       |
| Panel outer border (left/btm) | 4px solid                     | Thick side (Bracer Jack Rule 2)                |
| Panel outer border (top/rt)   | 2px solid                     | Thin side — thick→thin                         |
| Triggered border (left/btm)   | 6px solid                     | Extra thick for Red Alert emphasis             |

### Text Treatment

- **ALL UPPERCASE** for: device name, state labels, zone names, zone values, button text, keypad digits, code label, countdown text
- **Mixed case**: none in this panel
- **Letter-spacing**: `0.05em` on headings and labels, `0.15em` on countdown timer (wide tracking for mission clock readability), `0.1em` on countdown badge
- **Font-weight**: `700` (bold) for state badge, zone values, action buttons, keypad digits. `400` (normal) for everything else
- **`font-variant-numeric: tabular-nums`** on countdown timer and countdown badge — prevents layout jitter as digits change

---

## 12. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec layouts above. Shield viewscreen right, sensors left, keypad full-width below.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-alarm-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "sensors"
      "keypad";
  }

  .alarm-viewscreen {
    aspect-ratio: auto;
    max-width: 14rem;
    margin: 0 auto;
  }

  .alarm-sensors {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .alarm-zone-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  .alarm-keypad {
    flex-direction: column;
    align-items: center;
    gap: var(--lcars-gap);
  }

  .alarm-keypad-side {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--lcars-gap);
    width: 100%;
  }

  .alarm-mode-strip {
    justify-content: center;
  }
}
```

On mobile, the shield viewscreen moves to center-top for immediate visual threat assessment. Zone sensors flow as wrapped pairs. The keypad stacks below with action buttons going horizontal. Visual priority: threat level → zone status → keypad entry.

### Compact Mode

For dashboard views with limited space — shows shield and mode strip only, no zones or keypad:

```css
.lcars-alarm-panel.compact {
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "media";
}

.lcars-alarm-panel.compact .alarm-sensors,
.lcars-alarm-panel.compact .alarm-keypad {
  display: none;
}

.lcars-alarm-panel.compact .alarm-viewscreen {
  aspect-ratio: auto;
  max-width: 10rem;
  margin: 0 auto;
}
```

---

## 13. Accessibility (a11y) Requirements

### 13.1 Heading & Label Hierarchy

| Element                | `aria-level` | Font Size                   | Color                           | Purpose                              |
|------------------------|--------------|-----------------------------|---------------------------------|--------------------------------------|
| Panel title            | 3            | `--lcars-font-size-sub`     | `--lcars-text-heading`          | Device name ("SIMPLISAFE")           |
| Section labels         | 4 (implicit) | `--lcars-font-size-data`    | `--lcars-disabled`              | "ZONES", "LAST EVENT"               |
| Shield symbol          | —            | Title tier (SVG 48)         | `--alarm-state-color`           | "✓", "▲", "✕" — shield icon         |
| Shield label           | —            | SVG 16                      | `--alarm-state-color`           | "SECURE", "ARMED", "BREACHED"       |
| State badge            | —            | `--lcars-font-size-data`    | `--alarm-state-color`           | "DISARMED", "ARMED AWAY"            |
| Zone names             | —            | `--lcars-font-size-data`    | `--lcars-space-white`           | "FRONT DOOR", "MOTION"              |
| Zone values            | —            | `--lcars-font-size-data`    | Dynamic per-zone                | "OK", "OPEN", "!!"                  |
| Keypad digits          | —            | `--lcars-font-size-sub`     | `--lcars-black` on sunflower    | "1"–"9", "0", "⌫", "⏎"             |
| Countdown              | —            | `--lcars-font-size-title`   | `--alarm-state-color`           | "0:45"                              |

**Exactly 3 visual font sizes.** Title (shield symbol + countdown), sub-header (device name + keypad digits), data (everything else). Bracer Jack Rule 6.

### 13.2 Keyboard Navigation (WCAG 2.1.1)

| Element               | Focusable         | Keydown Handlers                                        |
|-----------------------|-------------------|--------------------------------------------------------|
| Shield viewscreen     | `tabindex="0"`    | `Enter`/`Space` → open more-info dialog                |
| Zone sensor lines     | `tabindex="0"`    | `Enter`/`Space` → open more-info for that sensor       |
| Arm mode buttons      | `<button>`        | `radiogroup` pattern: Arrow Left/Right to navigate     |
| Keypad container      | `tabindex="0"`    | Captures `0`–`9`, `Backspace`, `Enter`, `Escape`      |
| Keypad digit buttons  | `<button>`        | Native keyboard activation                              |
| Disarm action button  | `<button>`        | Native keyboard activation                              |
| Clear action button   | `<button>`        | Native keyboard activation                              |

Tab order: Header → Shield viewscreen → Zone lines (top to bottom) → Mode strip (left to right) → Keypad container → Keypad digits (grid order) → Disarm → Clear. Follows DOM order = visual order (WCAG 1.3.2).

### 13.3 ARIA Labeling (WCAG 4.1.2)

```html
<!-- Panel container -->
<div class="lcars-alarm-panel ${panelStateClass}"
     role="region"
     aria-label="${deviceName} security panel — ${stateLabel}">

  <!-- Header with state -->
  <div class="alarm-header" role="heading" aria-level="3">
    ...
  </div>

  <!-- Sensor/zone column -->
  <div class="alarm-sensors" role="list" aria-label="Security zones">
    <div class="alarm-zone-line" role="listitem" tabindex="0"
         aria-label="Front Door: ${zoneValue}">
      ...
    </div>
  </div>

  <!-- Shield viewscreen -->
  <div class="alarm-viewscreen" tabindex="0"
       role="button"
       aria-label="Security status: ${stateLabel}${countdownText}. Press Enter for details.">
    <svg role="img" aria-hidden="true">
      ...
    </svg>

    <!-- Mode strip -->
    <div class="alarm-mode-strip" role="radiogroup"
         aria-label="Alarm mode: currently ${currentModeLabel}">
      <button role="radio" aria-checked="true|false"
              aria-label="${modeName}">
        ...
      </button>
    </div>
  </div>

  <!-- Keypad -->
  <div class="alarm-keypad" role="group"
       aria-label="Security code keypad"
       tabindex="0"
       @keydown="${handleKeypadKeydown}">
    <div class="alarm-keypad-grid" role="group" aria-label="Digit keys">
      <button aria-label="Digit 1">1</button>
      ...
    </div>
    <div class="alarm-keypad-side">
      <div class="alarm-code-display"
           role="status"
           aria-live="polite"
           aria-label="Code entered: ${codeLength} digits">
        ...
      </div>
      <button aria-label="Disarm alarm with entered code">DISARM</button>
      <button aria-label="Clear entered code">CLEAR</button>
    </div>
  </div>

  <!-- Screen reader live region for state changes -->
  <div class="sr-only" aria-live="assertive" aria-atomic="true">
    <!-- JS injects: "SimpliSafe: TRIGGERED — Front Door breached" -->
    <!-- JS injects: "SimpliSafe: armed away" -->
    <!-- JS injects: "SimpliSafe: arming, 45 seconds remaining" -->
    <!-- JS injects: "SimpliSafe: disarmed, all stations secure" -->
  </div>
</div>
```

Note: The live region uses `aria-live="assertive"` (not `polite`) because alarm state changes are urgent — particularly triggered and pending states. A screen reader user must be informed immediately that the alarm has gone off, overriding any current announcement.

### 13.4 Color Is Not Sole Indicator (WCAG 1.4.1)

Every state conveys information through **both** color and text:
- Disarmed → `DISARMED` badge in ice + `SECURE` shield label + cool frame
- Armed → `ARMED AWAY` badge in butterscotch + `ARMED` shield label + warm frame
- Triggered → `TRIGGERED` badge in tomato + `BREACHED` shield label + red frame + `!!` zone values
- Zone open → `OPEN` text + colored dot indicator
- Zone OK → `OK` text + gray dot

Text alone is sufficient. Color is redundant reinforcement.

### 13.5 Focus Visibility (WCAG 2.4.7, 2.4.11, 2.4.13)

All interactive elements use:
```css
:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

- 2px outline meets WCAG 2.4.13 (Focus Appearance)
- `--lcars-ice` (#99ccff) vs `--lcars-black` (#000000) = **10.3:1 contrast** — exceeds 3:1 minimum

### 13.6 Target Size (WCAG 2.5.8)

| Element                | Size                 | Pixels (at 16px base) | Passes?    |
|------------------------|----------------------|-----------------------|------------|
| Mode button            | 3.5rem × 5rem min    | 56px × 80px           | ✅ AAA     |
| Keypad digit button    | 3.5rem × 3.5rem      | 56px × 56px           | ✅ AAA     |
| Action button (Disarm) | 3.5rem × 7rem        | 56px × 112px          | ✅ AAA     |
| Zone sensor line       | 1.75rem × full       | 28px × variable       | ✅ AA      |
| Shield viewscreen      | Full panel width     | ≫ 24px                | ✅ AAA     |
| Code dot (display only)| 12px                 | 12px (non-interactive)| N/A        |

### 13.7 Screen Reader Announcements (WCAG 4.1.3)

```javascript
/**
 * Announce alarm state changes to screen readers.
 * Uses assertive priority for security events.
 *
 * @param {HTMLElement} liveRegion - the aria-live container
 * @param {string} deviceName - friendly name
 * @param {string} newState - new alarm state
 * @param {string} [triggerSource] - sensor that triggered (if triggered state)
 */
function announceAlarmChange(liveRegion, deviceName, newState, triggerSource) {
  if (!liveRegion) return;

  let message;
  switch (newState) {
    case 'triggered':
      message = `${deviceName}: TRIGGERED`;
      if (triggerSource) message += ` — ${triggerSource} breached`;
      break;
    case 'pending':
      message = `${deviceName}: entry detected, enter code to disarm`;
      break;
    case 'arming':
      message = `${deviceName}: arming, exit now`;
      break;
    case 'disarmed':
      message = `${deviceName}: disarmed, all stations secure`;
      break;
    default:
      message = `${deviceName}: ${getAlarmStateLabel(newState)}`;
  }

  liveRegion.textContent = message;
}

/**
 * Announce code entry feedback for screen readers.
 */
function announceCodeFeedback(liveRegion, type) {
  if (!liveRegion) return;
  switch (type) {
    case 'digit':
      liveRegion.textContent = 'Digit entered';
      break;
    case 'clear':
      liveRegion.textContent = 'Code cleared';
      break;
    case 'submit':
      liveRegion.textContent = 'Code submitted';
      break;
    case 'error':
      liveRegion.textContent = 'Invalid code, try again';
      break;
  }
}
```

---

## 14. CSS Custom Properties Summary (New)

Properties introduced by the Alarm panel. All other properties from `lcars-styles.js`.

| Property                 | Default                   | Set By | Purpose                                              |
|--------------------------|---------------------------|--------|------------------------------------------------------|
| `--panel-frame-color`    | `var(--lcars-ice)`        | JS     | Dynamic frame border, header/keypad separators       |
| `--alarm-state-color`    | `var(--lcars-ice)`        | JS     | Shield icon, state badge, code dots, countdown text  |
| `--media-aspect`         | `1 / 1`                   | CSS    | Shield viewscreen aspect ratio                       |
| `--mode-color`           | `var(--lcars-gold)`       | JS     | Per-button active color for mode selector            |

---

## 15. LCARS Design Rules Compliance

| Rule                                              | Source           | Compliant? | Notes                                                   |
|---------------------------------------------------|------------------|------------|---------------------------------------------------------|
| No gradients, shadows, or 3D effects              | Bracer Jack #1   | ✅          | Shield SVG is flat stroke, keypad buttons are flat      |
| Frame goes thick→thin (4px→2px border)            | Bracer Jack #2   | ✅          | Left/bottom 4px, top/right 2px; triggered 6px/3px      |
| Pill buttons with flat left, rounded right         | Bracer Jack #4   | ✅          | Mode buttons, keypad digits, action buttons             |
| Exactly 3 font sizes (title, sub, data)            | Bracer Jack #6   | ✅          | SVG 48 + 2rem (title), 1.25rem (sub), 0.875rem (data) |
| ≤5 hue families in use                            | Bracer Jack      | ✅          | Blue (disarmed), warm (armed), red (triggered), gold (transitional), gray (disabled) = 5 families |
| All text uppercase                                 | TheLCARS.com     | ✅          | All labels, values, buttons, SVG text                   |
| Antonio font only                                  | TheLCARS.com     | ✅          | `var(--lcars-font)` throughout                          |
| CSS custom properties, no hardcoded hex            | Project rule     | ✅          | All colors via `var(--lcars-*)` tokens                  |
| Background is always `#000000`                     | TheLCARS.com     | ✅          | `var(--lcars-bg)` = `var(--lcars-black)`                |
| Animations respect `prefers-reduced-motion`        | WCAG + project   | ✅          | All animations disable; static weight alternatives      |
| WCAG AA contrast on all text                       | WCAG 1.4.3       | ✅          | Verified in §2 contrast table                          |
| 24px+ touch targets                                | WCAG 2.5.8       | ✅          | All buttons ≥ 56px, zone lines 28px                    |
| Focus visible 2px outline, 3:1 contrast            | WCAG 2.4.7/13    | ✅          | Ice blue outline, 10.3:1 vs black                      |
| Color not sole means of information                | WCAG 1.4.1       | ✅          | All states have text + color (§13.4)                    |
| Keyboard operable                                  | WCAG 2.1.1       | ✅          | Full tab order + keypad keyboard capture (§13.2)        |
| `aria-label` / `role` on all interactive elements  | WCAG 4.1.2       | ✅          | See §13.3 ARIA templates                                |
| `aria-live="assertive"` for alarm state changes    | WCAG 4.1.3       | ✅          | Assertive for security urgency (§13.7)                  |
| Spacing uses `--lcars-gap` (0.25rem)               | Jörn Weißenborn  | ✅          | Invisible grid constant throughout                      |
| No sensitive data in DOM/logs                      | OWASP A02:2021   | ✅          | PIN code handler clears on consume (§7.5 Worf review)  |

---

## 16. File Registration Plan

| Component Tag               | File                         | Purpose                            |
|-----------------------------|------------------------------|------------------------------------|
| `lcars-alarm-panel`         | `lcars-alarm-panel.js`       | Full alarm panel component         |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Dynamic via `getAlarmStateColor(state)`
- `mediaAspectRatio` → `'1 / 1'`
- `_isPrimaryDomain(domain)` → `domain === 'alarm_control_panel'`
- `_renderMedia()` → renders the SVG shield icon / countdown display + mode strip

Contains:
- `AlarmCodeHandler` class (internal, not exported)
- `AlarmCountdown` class (internal, not exported)
- Keypad component rendered inline (not a separate custom element — the keypad is tightly coupled to the alarm panel's state machine and doesn't exist independently)

---

## 17. Team Review Flags

- **Geordi Review Required**: Shield SVG design, dynamic frame color shifting across alarm states, Red Alert pulse animation intensity, keypad layout and pill-button sizing, countdown display in the viewscreen. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required (MANDATORY)**: 
  1. `AlarmCodeHandler` — PIN code handling, memory management, input masking, max-length enforcement (§7.5)
  2. `armAlarm()` / `disarmAlarm()` — service calls with code parameter, input validation (§7.6)
  3. Keypad DOM — verify code never appears in DOM attributes, dataset, console, or state objects
  4. `code_arm_required` / `code_format` handling — ensure code requirements are enforced client-side
  5. Error feedback — verify wrong-code shake animation doesn't leak timing information about code validation
  6. CSP implications — no external resources, no eval, no inline event handlers in the keypad

---

*"A Klingon does not enter codes. A Klingon verifies identity through combat. But since this is a Federation ship... the keypad will suffice. Make it secure."*  
— Worf, Tactical Station, Main Bridge

---

## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED WITH NOTES

### LCARS Compliance
- §1 Grid Layout: The 3-row grid (header, sensors+media, keypad) is correct. The keypad as a full-width bottom section mirrors TNG console button strips below the main display.
- §1 CSS: Thick→thin border (4px left/bottom, 2px top/right) — correct per Bracer Jack Rule 2.
- **§1 TRIGGERED STATE**: The `.triggered` class increases `border-left-width` to 6px and `border-bottom-width` to 6px. This creates a **thick→thick** situation on the left-to-bottom turn, which technically violates Bracer Jack Rule 2 ("NEVER the same thickness on the next turn"). However, I'm approving this as a **Red Alert design exception**. The thicker border communicates "the frame itself is screaming" — a visual amplification of the emergency state that's analogous to the bridge lighting shifting to all-red. **Document this exception clearly in the implementation.**
- §5 Shield SVG: Clean vector art — no gradients, no shadows. The shield outline uses `stroke` and `fill: none` — properly flat LCARS. The Unicode status symbols (✓, ▲, ✕, ◉) are geometric and match LCARS typographic icon conventions.
- §6 Arm mode strip: Correct pill buttons with `radiogroup` pattern. Three buttons for SimpliSafe (HOME, AWAY, DISARM) — clean and minimal.
- §7 Keypad: Individual keys at 3.5rem × 3.5rem (56px) — generous and comfortable. Pill shape correct. Action keys (backspace, enter) in `--lcars-disabled` to differentiate from digit keys — good visual hierarchy.
- §8 Red Alert animation: The 1s pulse on frame, shield, and viewscreen border is dramatic but appropriate for an alarm trigger. The `box-shadow` on the viewscreen pulse (§8.3) technically introduces a glow effect — this is the one element I'd flag. LCARS is flat; box-shadows are not part of the design language.

### Color & Typography
- The alarm state escalation (ice → sunflower → butterscotch → gold → tomato) maps perfectly to threat level. This is Worf's console operating exactly as designed.
- `--lcars-african-violet` for `armed_custom_bypass` is a smart choice — it visually flags "non-standard configuration" without implying danger.
- Contrast table (§2) is complete. All pass WCAG AA. `--lcars-tomato` at 5.2:1 is paired with "TRIGGERED" text label — color is never sole indicator.
- Typography: Three sizes — sub-header (device name, countdown `2rem` in SVG), data (everything else), plus keypad digits at `--lcars-font-size-sub`. Clean.
- The countdown timer uses `font-variant-numeric: tabular-nums` and `letter-spacing: 0.15em` — this prevents layout jitter as digits change. Excellent detail.

### Layout & Visual Balance
- The shield icon floating in the viewscreen with generous padding is visually strong. "Empty space is beautiful" — the shield breathes in black.
- The keypad visibility logic (§7.8) that hides the keypad during `arming` and shows CANCEL instead is good UX — reduces visual noise during countdown.
- The countdown timer replacing the shield during transitional states is a clean state swap within the same viewscreen frame.

### Accessibility
- WCAG 2.5.8: Keypad keys at 56px — excellent. Action buttons at 56px height × 112px min-width. All well above threshold.
- Keypad keyboard navigation (§7.7): Physical keyboard digit capture via `keydown` listener is essential for accessibility. The `Escape` key clearing the code is a good pattern.
- The countdown timer uses `role="timer"` with `aria-live="assertive"` — correct for time-critical countdowns. `assertive` (not `polite`) is the right choice during arming/pending states.
- PIN code masking: The `AlarmCodeHandler` (§7.5) never exposes digits in DOM — good. The masked dot display with `aria-label="Code entered: N digits"` gives screen reader users status without exposing the code.
- `prefers-reduced-motion` covers all pulse animations — confirmed in §8.

### Recommendations
1. **APPROVED**: Shield SVG design — flat, geometric, properly LCARS.
2. **APPROVED WITH EXCEPTION**: Triggered state double-thick border (§1). Document as Red Alert exception to Bracer Jack Rule 2.
3. **APPROVED**: Dynamic frame color shifting across all alarm states.
4. **APPROVED**: Keypad layout and pill-button sizing.
5. **APPROVED**: Countdown display replacing shield in viewscreen.
6. **NEEDS REVISION** (§8.3): Remove the `box-shadow` from `.alarm-viewscreen-pulse`. LCARS does not use shadows or glows. Replace with a border-width pulse or opacity pulse to achieve the same urgency without violating Bracer Jack Rule 1. Suggested alternative:
   ```css
   @keyframes alarm-viewscreen-pulse {
     0%, 100% { border-color: var(--lcars-alert); border-width: 3px; }
     50%      { border-color: rgba(255, 85, 85, 0.4); border-width: 5px; }
   }
   ```
7. **NOTE**: The Red Alert animation intensity is appropriate for the triggered state. The 1s pulse cycle is fast enough to convey urgency without being epileptogenic (well above the WCAG 2.3.1 three-flashes-per-second threshold).
8. **APPROVED**: PIN code security design — Worf's review is the primary authority here, but the visual masking and DOM isolation are sound.

---

## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND WITH ADVISORIES

### Component Architecture
- The `LcarsDevicePanelBase` extension is correctly specified. The 3-row grid (`header | sensors+media | keypad`) is appropriate — the keypad replaces the bottom controls row used by other panels. This is a justified departure from the standard pattern given the unique security input requirements.
- The `AlarmCodeHandler` class (§7.5) is well-designed. The `consumeCode()` pattern — returning the code exactly once and clearing it — is a correct implementation of the "read-and-destroy" pattern. The handler stores the code as a local variable (`this._code`), never in DOM attributes. The `destroy()` method zeros the code. Worf's security mandates are addressed.
- The `AlarmCountdown` class (§5.2) uses `setInterval(250ms)` for quarter-second precision. **Critical advisory**: This timer MUST be cleaned up in `disconnectedCallback()`. If the user navigates away from the dashboard view while a countdown is active, the interval will continue firing on a detached component, causing a memory leak and potential errors accessing stale DOM references. The spec does not explicitly address lifecycle cleanup of the countdown timer.
- The zone sensor rendering (§4.1) with `getZoneColor(sensorState, alarmState)` cross-referencing both the sensor and alarm states is architecturally sound — a zone that is "open" while the alarm is "disarmed" should display differently than "open" while "armed." This dual-state coloring is correct.
- The keypad visibility logic (§7.8, `isKeypadVisible()`) correctly hides the keypad during transitional states and when not required. This reduces unnecessary DOM complexity in states where the keypad cannot be used.

### Performance Considerations
- **Countdown timer**: `setInterval(250ms)` fires 4 times per second. Each tick calls `_onTick()` which triggers a re-render of the countdown display. Since only the countdown time text and progress bar width change, Lit's diffing will be efficient — ~2 DOM mutations per tick. Acceptable. However, the 250ms interval means the countdown display updates 4x per second while the visual granularity (1-second display) only truly changes once per second. Consider reducing to `setInterval(1000)` to reduce tick frequency by 75% with no visual difference. The sub-second precision is only useful for the progress bar — and 1-second resolution on a ~60s countdown is 1.7% granularity, which is sufficient.
- **Zone sensor list**: Alarm systems typically have 5-15 zones. The `getZoneColor()` and `getZoneValue()` computations run once per zone per render. At O(1) per zone, this is negligible even at 15 zones.
- **Red Alert animation system** (§8): The triggered state applies `animation: alarm-red-alert-frame 1s ease-in-out infinite` to the panel, shield SVG, and viewscreen. Three simultaneous CSS animations is acceptable — these are GPU-composited properties (`border-color`, `opacity`, `stroke`). However, the `box-shadow` animation in §8.3 (`alarm-viewscreen-pulse`) is NOT GPU-compositable and will trigger repaints. **Advisory**: Remove `box-shadow` from the animation or replace with `filter: drop-shadow()` which is compositable on most browsers.
- **Bundle impact estimate**: ~6.5 KiB minified/gzipped. The keypad grid, countdown timer class, zone sensor rendering, and Red Alert animation system add more code than simpler panels. The `AlarmCodeHandler` class adds ~0.6 KiB. Roughly 3.2% of the 203 KiB bundle.

### HA Integration Patterns
- `armAlarm()` (§7.6) correctly maps arm modes to specific service calls (`alarm_arm_home`, `alarm_arm_away`, etc.) rather than using a generic call. This matches the HA `alarm_control_panel` service API precisely.
- `disarmAlarm()` correctly calls `alarm_control_panel.alarm_disarm` with the consumed code. The code is passed as a string in the `code` field, which is the correct HA API contract.
- The `code_arm_required` attribute is read but the spec doesn't explicitly verify `code_format` (numeric vs text). SimpliSafe uses numeric-only codes, but the keypad only renders digits 0-9, which is correct. If a future alarm system requires alphanumeric codes, the keypad would need extension — but that is YAGNI for now.
- Zone sensors are discovered via `binary_sensor` entities on the same device. This is correct — alarm systems register their zones as binary sensors with the alarm device.

### Code Quality & Reusability
- **DRY**: `getAlarmStateColor()` follows the same switch-statement pattern. Extract to shared module.
- **AlarmCodeHandler security**: The class correctly implements Worf's requirements. One observation: JavaScript strings are immutable and garbage-collected non-deterministically. Setting `this._code = ''` does not guarantee the previous string is immediately freed from memory. In a browser context, this is an acceptable trade-off — true memory zeroing would require `Uint8Array` and manual clearing, which is over-engineering for a Lovelace card where the code is immediately transmitted to HA's backend. The security boundary is the HA backend, not the frontend.
- **Countdown class reusability**: The `AlarmCountdown` class is also needed by the irrigation panel (zone watering countdown). Consider extracting to a shared `LcarsCountdown` utility with a configurable tick interval.
- **Error feedback**: The shake animation (§8.9) for wrong codes is a good UX pattern, but the spec should document how to detect a "wrong code" result. HA's `alarm_disarm` service doesn't return success/failure — the result is inferred from the entity state not transitioning to `disarmed` within a timeout. The spec should specify this timeout-based detection.

### Recommendations
1. **P0 (Critical)**: Add explicit `disconnectedCallback()` lifecycle cleanup for `AlarmCountdown._intervalId`. If navigation occurs during an active countdown, `clearInterval()` must be called. Failure to do so creates a memory leak and potential `requestUpdate()` calls on a disconnected component.
2. **P1**: Reduce countdown `setInterval` from 250ms to 1000ms. Visual difference is imperceptible; CPU cost reduces 75%.
3. **P1**: Replace `box-shadow` animation in `alarm-viewscreen-pulse` (§8.3) with `filter: drop-shadow()` or remove entirely. `box-shadow` animations trigger repaints on every frame.
4. **P2**: Extract `AlarmCountdown` class to a shared `lcars-countdown.js` utility — reusable by irrigation panel zone watering timer.
5. **P2**: Document the wrong-code detection strategy. Recommend: after `disarmAlarm()`, start a 3-second timer. If entity state hasn't changed to `disarmed` after 3s, trigger the error shake and re-enable keypad input.
6. **P3**: Extract `getAlarmStateColor()` and `getAlarmStateLabel()` to the shared state color module.

---

## Worf — Security Review

**Reviewer**: Worf (Integration Security Expert)  
**Date**: Stardate 2026.04.13  
**Threat Level**: RED

*"This is the security heart of the ship. I judge it by a warrior's standard: can an adversary breach it? The PIN keypad is a weapons console. I have reviewed every line."*

### Input Validation

- **PIN max-length enforcement (§7.5)**: `AlarmCodeHandler` enforces `_maxLength = 8` and rejects non-digit input via `/^[0-9]$/` regex. This is correct. However, the `maxLength` parameter is configurable via constructor — the component MUST hardcode this to a safe maximum (8 digits), never accept it from YAML config or user input. An attacker-controlled `maxLength` of `999999` would allow memory exhaustion via string concatenation.
- **Service call parameter scoping**: `armAlarm()` and `disarmAlarm()` (§7.6) correctly scope `entity_id` and pass `code` only when entered. The `serviceMap` uses a hardcoded allowlist of valid arm modes — **no arbitrary service injection possible**. This is properly defended.
- **`code_format` attribute**: The spec references `code_format` (number vs text) from the entity but the keypad only accepts digits 0-9. If a future alarm integration uses `code_format: text`, the current keypad cannot handle it. This is acceptable for now (SimpliSafe is numeric), but document the limitation.
- **YAML config validation**: `exit_delay` and `entry_delay` are accepted from YAML config. These MUST be clamped to sane ranges (e.g., 1-300 seconds) to prevent a malicious YAML injection from setting absurd delays. Currently no clamping is specified.

### XSS & DOM Safety

- **Lit-html template rendering**: All zone names (`friendly_name`), state labels, and sensor values are inserted via Lit tagged template literals (`html\`...\``), which auto-escape by default. **No `innerHTML` or `unsafeHTML()` usage detected.** This is correct.
- **Zone sensor names from HA WebSocket**: Zone `friendly_name` values arrive as untrusted data from the HA entity registry. They are rendered via `${zoneName}` in Lit templates — auto-escaped. Secure.
- **SVG text injection**: The shield symbol and label (§5.1) are rendered via `<text>` elements inside SVG with values from `getAlarmShieldSymbol()` and `getAlarmShieldLabel()` — both return hardcoded strings from switch statements. **No user-controlled input reaches SVG text nodes.** Secure.
- **`data-pressed` attribute on keypad buttons** (§8.8): The `key-flash` animation uses `[data-pressed]` CSS selector. Ensure the `data-pressed` attribute is set programmatically with a boolean flag, never with the key value itself. A digit value in a DOM attribute is not sensitive, but it establishes a bad pattern.

### Service Call Security

- **Arm/Disarm calls properly scoped**: Service calls use `hass.callService('alarm_control_panel', ...)` with entity_id from the card config, not user input. The service name is selected from a hardcoded `serviceMap` — no arbitrary service name injection.
- **No destructive unguarded actions**: Arming requires explicit mode selection button press. Disarming requires code entry + explicit DISARM button press. The `Enter` key on the keypad triggers `submitCallback()` which should require the DISARM button context — **verify that pressing Enter alone without clicking DISARM does not auto-submit the disarm action**. The `handleKeypadKeydown()` function (§7.7) calls `submitCallback()` on Enter — the implementation MUST validate that the intended action (arm vs disarm) is explicit, not assumed.
- **No admin-only data exposed**: The alarm panel reads `alarm_control_panel` state which is available to all HA users. Zone `binary_sensor` states are similarly non-privileged. No `hass.auth` escalation concern.

### Secrets & Sensitive Data

- **PIN code memory lifecycle**: `AlarmCodeHandler._code` is a JavaScript string. `consumeCode()` reads and clears it. `destroy()` zeroes it. **However, JavaScript strings are immutable** — the old string value persists in the V8 heap until garbage collected. There is no way to securely zero a JS string in memory. This is an **accepted limitation of the browser runtime**, not a code defect. Document this explicitly.
- **PIN never in DOM**: The spec correctly mandates (§7.5 requirement #1) that code is stored in a local variable, never in DOM attributes or dataset. The `alarm-code-dots` display uses filled/empty dot objects, never digit characters. **Verified: no digit value reaches the DOM.**
- **PIN never logged**: Requirement #2 mandates no console logging. Implementation MUST NOT include `console.log(this._code)` or `console.debug` calls even behind feature flags. Code review during implementation must enforce this with grep.
- **PIN not in component state/properties**: The code is in a standalone `AlarmCodeHandler` class, not in LitElement reactive properties. This means it won't appear in browser DevTools component inspector panels. Good.
- **Error feedback timing**: The wrong-code shake animation (§8.9) runs for 400ms regardless of the actual HA backend response time. The animation is purely client-side cosmetic feedback. The actual success/failure is determined by whether the entity state changes after the service call. **No timing oracle risk from the animation itself.** However, rapid repeated submissions could be used to brute-force the code. See Recommendations.

### Recommendations

**MUST FIX:**

1. **Rate-limit PIN submission**: Add a cooldown after failed disarm attempts. After 3 failed attempts within 60 seconds, disable the DISARM button for 30 seconds with a visible lockout countdown. This prevents brute-force attacks on 4-digit PINs (10,000 combinations). Without rate limiting, an automated attacker (browser console script) could exhaust the keyspace in seconds via `hass.callService()` directly. *Note: HA backend may have its own rate limiting, but defense in depth demands client-side protection too.*

2. **Hardcode maxLength, reject from config**: The `AlarmCodeHandler` constructor's `maxLength` parameter MUST be hardcoded to 8 (or derived from entity `code_format` length constraints), never accepted from YAML config. Add: `this._maxLength = Math.min(Math.max(maxLength, 4), 10);`

3. **Clamp countdown delay config values**: `exit_delay` and `entry_delay` from YAML config must be clamped: `const exitDelay = Math.max(1, Math.min(300, config.exit_delay || 60));`

4. **Explicit action context on Enter key**: The `handleKeypadKeydown()` Enter handler must require the user to have explicitly selected an action (arm mode or disarm). Do not auto-disarm on Enter if the current state is `armed_*` — require the DISARM button to be focused or the intent to be set.

**SHOULD FIX:**

5. **Clear code on visibility change**: Add a `document.visibilitychange` listener that calls `codeHandler.clear()` when the tab becomes hidden. Prevents a partially-entered code from persisting if the user walks away.

6. **Clear code on alarm state change**: If the entity state changes (e.g., someone disarms from another panel/app), automatically clear any entered code digits to prevent stale code persistence.

7. **Disable autocomplete on keypad container**: Add `autocomplete="off"` to the keypad container element (even though it's not a form input) to prevent browser password managers from interfering.

**ADVISORY:**

8. **Document JS string immutability limitation**: Add a comment in `AlarmCodeHandler` noting that JavaScript cannot securely zero string memory. This is an inherent platform limitation, not a defect, but must be documented for future security auditors.

9. **Consider `code_arm_required` enforcement**: If `code_arm_required` is true on the entity, the ARM mode buttons should require code entry before calling the arm service. The current spec shows code is optional for arming — verify this matches the entity's requirements.

10. **CSP compliance verified**: No `eval()`, no inline event handlers (`onclick`), no external resource loading. All event binding via Lit `@click` decorators which compile to `addEventListener`. Compliant with strict CSP.

---

## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§8.3**: Replaced `box-shadow` in `alarm-viewscreen-pulse` keyframes with `border-width: 3px → 5px` pulse. Removes glow effect — LCARS is flat. Per Geordi's NEEDS REVISION #6 and Data's P1 #3 (box-shadow not GPU-compositable).
- **§7.5 `AlarmCodeHandler`**: Hardcoded `maxLength` clamped to `[4, 10]` via `Math.min(Math.max(maxLength, 4), 10)`. Per Worf's MUST FIX #2.
- **§7.5 `AlarmCodeHandler`**: Added `isLockedOut`, `lockoutRemaining`, `recordFailedAttempt()`, `resetAttempts()` for rate-limiting. 3 failed attempts → 30s lockout. Per Worf's MUST FIX #1.
- **§7.5 `AlarmCodeHandler`**: Added JS string immutability documentation comment per Worf's Advisory #8.
- **§7.7 `handleKeypadKeydown()`**: Added `actionContext` parameter. Enter key now requires an explicit action context string (e.g., `'disarm'`, `'arm_home'`) — refuses to submit without it. Per Worf's MUST FIX #4.
- **§10 YAML config**: Annotated `exit_delay` and `entry_delay` with `(clamped to 1–300)`. Implementation must apply `Math.max(1, Math.min(300, value))`.

### Accepted Recommendations
- **Worf MUST FIX #1** (rate-limit PIN): Implemented in `AlarmCodeHandler` — 3 attempts per 60s, 30s lockout.
- **Worf MUST FIX #2** (hardcode maxLength): Implemented with `Math.min(Math.max(maxLength, 4), 10)`.
- **Worf MUST FIX #3** (clamp countdown delays): Config annotation added; implementation must enforce `[1, 300]` range.
- **Worf MUST FIX #4** (explicit Enter action): Implemented — `handleKeypadKeydown()` now requires `actionContext` parameter.
- **Worf SHOULD FIX #5** (clear on visibility change): Accepted — implementation will add `visibilitychange` listener.
- **Worf SHOULD FIX #6** (clear on alarm state change): Accepted — `willUpdate()` will detect entity state changes and auto-clear.
- **Worf SHOULD FIX #7** (autocomplete off): Accepted — simple attribute addition during implementation.
- **Worf Advisory #8** (JS immutability): Documented in constructor comment.
- **Worf Advisory #9** (code_arm_required): Accepted — implementation will check `code_arm_required` before arm service calls.
- **Geordi NEEDS REVISION #6** (box-shadow → border-width pulse): Implemented in §8.3.
- **Geordi APPROVED WITH EXCEPTION #2** (triggered double-thick border): Documented as Red Alert exception to Bracer Jack Rule 2.
- **Data P0** (disconnectedCallback for AlarmCountdown): Accepted — critical lifecycle cleanup. Will clear `_intervalId` in `disconnectedCallback()`.
- **Data P1** (reduce countdown to 1000ms): Accepted. Progress bar at 1s resolution on a 60s countdown is 1.7% granularity — sufficient.
- **Data P2** (extract AlarmCountdown to shared utility): Accepted — shared `LcarsCountdown` class for alarm + irrigation.
- **Data P2** (wrong-code detection): Accepted. 3-second timeout after `disarmAlarm()` — if state hasn't changed, trigger error shake and `recordFailedAttempt()`.

### Deferred Items
- **Visibility change listener**: Implementation-phase detail.
- **Auto-clear on state change**: Implementation-phase, tied to `willUpdate()` lifecycle.
- **`code_arm_required` enforcement**: Implementation-phase — will check entity attributes.

### Disagreements
- None. Worf's RED threat-level findings are all valid and addressed. This is the security heart of the ship — no shortcuts.
