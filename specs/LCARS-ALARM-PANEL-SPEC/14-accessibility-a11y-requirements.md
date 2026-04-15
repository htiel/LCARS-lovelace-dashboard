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
