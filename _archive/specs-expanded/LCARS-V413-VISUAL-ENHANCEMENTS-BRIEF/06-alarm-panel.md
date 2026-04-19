## 5. Alarm Panel

### 5.1 — Red Alert Frame Strobe

- **What it does**: When the alarm is in `triggered` state, the panel frame rapidly pulses between `--lcars-tomato` and 50% brightness red — a true Red Alert strobe. This is the most aggressive animation in the entire dashboard: it demands immediate attention.
- **Where it goes**: `.lcars-alarm-panel[data-state="triggered"]` border animation
- **LCARS justification**: *RED ALERT.* The entire bridge bathes in pulsing red. This is the single most iconic visual state in all of Star Trek. When the alarm triggers, there is zero subtlety. The frame screams.
- **Animation details**: `@keyframes lcars-red-alert` — `border-color: var(--lcars-tomato)` → `border-color: #882222` → `var(--lcars-tomato)`. Duration: `1s`. Timing: `linear infinite`. **Must** respect `prefers-reduced-motion` → falls back to static tomato border (no strobe). Consider also toggling a `box-shadow: 0 0 20px var(--lcars-tomato)` in sync for ambient room glow on dark screens.

### 5.2 — Shield Icon Reactive Glow

- **What it does**: The shield SVG in the viewscreen responds to alarm state with layered glow effects: Disarmed = cool blue static glow. Armed Home = warm amber static glow. Armed Away = bright amber with slow pulse. Triggered = red with rapid pulse (sync with §5.1). The shield itself is the status beacon.
- **Where it goes**: `.lcars-shield-icon` SVG element — apply `filter: drop-shadow(0 0 Xpx color)` with dynamic values
- **LCARS justification**: The Enterprise shield status display shows the ship outline with a color-coded energy field around it — blue for shields up and holding, amber for shields at reduced power, red for shields failing. The shield icon IS the tactical readout.
- **Animation details**: Disarmed: `filter: drop-shadow(0 0 8px var(--lcars-ice))` static. Armed: `@keyframes lcars-shield-armed` — drop-shadow spread `6px→12px→6px`. Duration: `3s`. Triggered: `@keyframes lcars-shield-critical` — drop-shadow rapid cycle, duration: `0.5s`. Color set via CSS custom property `--shield-glow-color`.

### 5.3 — Keypad Button Tactile Flash

- **What it does**: Each keypad digit, when pressed, emits the `lcars-button-flash` ripple (§1.4) AND briefly shows the pressed digit in an enlarged ghost above the button (like a phone keyboard preview) that fades up and out over 200ms.
- **Where it goes**: `.lcars-keypad-btn:active::before` — pseudo-element positioned above the button, showing the digit character at 150% scale
- **LCARS justification**: Starship security keypads (seen in VOY "Basics" and DS9 brig scenes) show a magnified confirmation of the pressed key — the operator sees what they've entered. On a touchscreen without physical keys, this visual feedback is critical.
- **Animation details**: `@keyframes lcars-key-preview` — `opacity: 1; transform: translateY(-100%) scale(1.5)` → `opacity: 0; transform: translateY(-150%) scale(1.5)`. Duration: `200ms`. Timing: `ease-out`. Trigger: `:active` state.

### 5.4 — Countdown Timer Urgency Escalation

- **What it does**: During the arm/disarm countdown, the countdown number progressively changes: >15s = normal `--lcars-sunflower` text, 10-15s = `--lcars-golden-orange` with gentle pulse, 5-10s = `--lcars-tomato` with faster pulse, <5s = `--lcars-tomato` with scale pulsing (number grows/shrinks slightly). Urgency increases as time runs out.
- **Where it goes**: `.lcars-countdown-display` text element
- **LCARS justification**: Self-destruct countdowns on TNG/VOY show escalating visual urgency — the numbers get more intense, the display more insistent as time expires. The alarm countdown is literally a self-destruct sequence for your security system's grace period.
- **Animation details**: `@keyframes lcars-countdown-urgent` — at <5s: `transform: scale(1.0)→scale(1.1)→scale(1.0)`. Duration decreases with time: 2s → 1s → 0.5s. Color transitions via CSS variable `--countdown-color` updated by JS.

### 5.5 — Zone Status Micro-Pips

- **What it does**: Each zone in the zone roster gets a small colored dot prefix — green for OK, amber for bypass, red for fault/open. When a zone changes state, the dot briefly flashes bright before settling to its new color.
- **Where it goes**: `.lcars-zone-row::before` — `width: 6px; height: 6px; border-radius: 50%; background: var(--zone-status-color)`
- **LCARS justification**: Tactical displays on the Enterprise show status pips for individual subsystems — small colored indicators showing per-unit readiness. Worf's tactical display uses exactly this pattern: rows of system names with status dots.
- **Animation details**: State change flash: `@keyframes lcars-pip-flash` — `background: white; transform: scale(1.5)` → `background: var(--zone-status-color); transform: scale(1)`. Duration: `300ms`.

---
