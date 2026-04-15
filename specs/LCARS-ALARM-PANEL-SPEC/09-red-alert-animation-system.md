## 8. Red Alert Animation System

The triggered state is the most visually intense state in the entire LCARS Dashboard. This is **Red Alert** — the ship is under attack.

### v4.13.0 Visual Enhancements

#### Red Alert Frame Strobe
Triggered state — frame rapidly pulses tomato/dark-red with 20px ambient glow. Zero subtlety.

```css
.lcars-alarm-panel[data-state="triggered"] {
  animation: lcars-red-alert 1s linear infinite;
  box-shadow: 0 0 20px var(--lcars-tomato);
}

@keyframes lcars-red-alert {
  0%, 100% { border-color: var(--lcars-tomato); box-shadow: 0 0 20px var(--lcars-tomato); }
  50%      { border-color: #882222;             box-shadow: 0 0 8px #882222; }
}
```

#### Shield Icon Reactive Glow
Shield SVG drop-shadow by state: disarmed=ice, armed-home=amber, armed-away=amber+3s pulse, triggered=rapid red 0.5s pulse.

```css
.lcars-shield-icon {
  --shield-glow-color: var(--lcars-ice);
  filter: drop-shadow(0 0 8px var(--shield-glow-color));
  transition: filter 500ms ease-out;
}

.lcars-alarm-panel[data-state="armed_home"] .lcars-shield-icon {
  --shield-glow-color: var(--lcars-butterscotch);
}

.lcars-alarm-panel[data-state="armed_away"] .lcars-shield-icon {
  --shield-glow-color: var(--lcars-butterscotch);
  animation: lcars-shield-armed 3s ease-in-out infinite;
}

.lcars-alarm-panel[data-state="triggered"] .lcars-shield-icon {
  --shield-glow-color: var(--lcars-tomato);
  animation: lcars-shield-critical 0.5s linear infinite;
  /* [Worf M1] MUST NOT shorten below 0.34s (>2.94 Hz) — WCAG 2.3.1 general
     flash threshold. Combined with frame strobe (1 Hz) and viewscreen pulse
     (1 Hz), the aggregate visual field flash rate must stay below 3/s across
     >25% of a 10° field of view. Current 0.5s = 2 Hz. Minimum safe = 0.34s. */
}

@keyframes lcars-shield-armed {
  0%, 100% { filter: drop-shadow(0 0 6px var(--shield-glow-color)); }
  50%      { filter: drop-shadow(0 0 12px var(--shield-glow-color)); }
}

@keyframes lcars-shield-critical {
  0%, 100% { filter: drop-shadow(0 0 12px var(--shield-glow-color)); }
  50%      { filter: drop-shadow(0 0 4px var(--shield-glow-color)); }
}
```

#### Keypad Button Tactile Flash
Enlarged ghost digit floats upward and fades on press (200ms).

```css
.lcars-keypad-btn {
  position: relative;
  overflow: visible;
}

.lcars-keypad-btn:active::before {
  content: attr(data-digit);
  position: absolute;
  top: 0;
  left: 50%;
  font-size: 150%;
  color: var(--lcars-gold);
  pointer-events: none;
  animation: lcars-key-preview 200ms ease-out forwards;
}

@keyframes lcars-key-preview {
  0% { opacity: 1; transform: translateX(-50%) translateY(-100%) scale(1.5); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-150%) scale(1.5); }
}
```

#### Countdown Timer Urgency Escalation
4-tier urgency: >15s=sunflower, 10-15s=orange+2s pulse, 5-10s=tomato+1s pulse, <5s=tomato+0.5s scale pulse.

```css
.lcars-countdown-display[data-urgency="calm"]     { color: var(--lcars-sunflower); }
.lcars-countdown-display[data-urgency="elevated"] { color: var(--lcars-orange); animation: lcars-countdown-pulse 2s ease-in-out infinite; }
.lcars-countdown-display[data-urgency="high"]     { color: var(--lcars-tomato); animation: lcars-countdown-pulse 1s ease-in-out infinite; }
.lcars-countdown-display[data-urgency="critical"] { color: var(--lcars-tomato); animation: lcars-countdown-critical 0.5s ease-in-out infinite; }

@keyframes lcars-countdown-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}

@keyframes lcars-countdown-critical {
  0%, 100% { transform: scale(1.0); opacity: 1; }
  50%      { transform: scale(1.1); opacity: 0.7; }
}
```

#### Zone Status Micro-Pips
6px coloured dot per zone row. Ice=OK, butterscotch=bypass, tomato=fault. Flash on state change.

```css
.lcars-zone-row::before {
  content: '';
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--zone-status-color, var(--lcars-gray));
  transition: background 300ms ease-out;
}

.lcars-zone-row.state-change::before {
  animation: lcars-pip-flash 300ms ease-out 1;
}

@keyframes lcars-pip-flash {
  0%   { background: var(--lcars-space-white); transform: scale(1.5); }
  100% { background: var(--zone-status-color); transform: scale(1); }
}
```

#### Alarm Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .lcars-alarm-panel[data-state="triggered"] { animation: none; border-color: var(--lcars-tomato); }
  .lcars-alarm-panel[data-state="armed_away"] .lcars-shield-icon,
  .lcars-alarm-panel[data-state="triggered"] .lcars-shield-icon { animation: none; }
  .lcars-keypad-btn:active::before { animation: none; }
  .lcars-countdown-display[data-urgency="elevated"],
  .lcars-countdown-display[data-urgency="high"],
  .lcars-countdown-display[data-urgency="critical"] { animation: none; transform: none; }
  .lcars-zone-row.state-change::before { animation: none; }
}
```

### 8.1 Frame Pulse (Triggered)

> **[Data C-3] — LEGACY: Superseded by v4.13.0 Visual Enhancements section above.**
> The v4.13.0 `lcars-red-alert` / `lcars-shield-critical` / `lcars-key-preview`
> definitions are canonical. Sections 8.1–8.10 are retained for reference only and
> MUST NOT be implemented alongside the v4.13.0 versions.

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
