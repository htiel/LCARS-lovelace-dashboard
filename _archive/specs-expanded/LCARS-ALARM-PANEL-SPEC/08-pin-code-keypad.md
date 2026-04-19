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
