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
