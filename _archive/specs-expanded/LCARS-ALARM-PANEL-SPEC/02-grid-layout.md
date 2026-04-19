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
