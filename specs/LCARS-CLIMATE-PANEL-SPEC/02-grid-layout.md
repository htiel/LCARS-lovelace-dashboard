## 1. Grid Layout

### ASCII Layout

```
┌──────────────────────────────────────────────────────────────┐
│  LIVING ROOM THERMOSTAT          HEATING   72°F              │  ← header
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  CURRENT  72°F   │        ║                      ║           │
│  TARGET   74°F   │        ║     ┌───────────┐    ║           │
│  HUMIDITY  48%   │        ║     │           │    ║           │
│                  │        ║     │    72°    │    ║           │
│  HVAC     HEAT   │        ║     │   ╱    ╲  │    ║           │
│  FAN      AUTO   │        ║     │  74° TGT  │    ║           │
│  PRESET   HOME   │        ║     │           │    ║           │
│                  │        ║     └───────────┘    ║           │
│  FAULTS          │        ║                      ║           │
│  ● NONE          │        ║   ┌──╮  TARGET  ┌──╮ ║           │
│                  │        ║   │ –│   74°F   │ +│ ║           │
│                  │        ║   └──╯          └──╯ ║           │
│                  │        ╚══════════════════════╝           │
├──────────────────┴───────────────────────────────────────────┤
│  ┌──────╮ ┌──────╮ ┌──────╮ ┌──────────╮ ┌──────╮ ┌──────╮ │  ← mode strip
│  │ HEAT │ │ COOL │ │ AUTO │ │HEAT/COOL │ │  DRY │ │  OFF │ │
│  └──────╯ └──────╯ └──────╯ └──────────╯ └──────╯ └──────╯ │
├──────────────────────────────────────────────────────────────┤
│  FAN: ○ AUTO  ● LOW  ○ MED  ○ HIGH    PRESET: ● HOME  ○ ECO│  ← aux controls
└──────────────────────────────────────────────────────────────┘
```

### Dual Setpoint Layout (heat_cool mode)

When in `heat_cool` mode, the media viewscreen adapts to show two setpoint targets:

```
        ╔══════════════════════╗
        ║                      ║
        ║     ┌───────────┐    ║
        ║     │           │    ║
        ║     │    72°    │    ║
        ║     │  CURRENT  │    ║
        ║     │           │    ║
        ║     └───────────┘    ║
        ║                      ║
        ║  ┌──╮  LOW   ┌──╮   ║
        ║  │ –│  68°F  │ +│   ║
        ║  └──╯        └──╯   ║
        ║  ┌──╮  HIGH  ┌──╮   ║
        ║  │ –│  76°F  │ +│   ║
        ║  └──╯        └──╯   ║
        ╚══════════════════════╝
```

### CSS Grid Definition

```css
.lcars-climate-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "modes    modes"
    "auxctrl  auxctrl";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-butterscotch));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Dynamic frame color — set by JS based on hvac_action */
  --panel-frame-color: var(--climate-action-color, var(--lcars-butterscotch));

  /* Dynamic accent for temperature arc and current temp readout */
  --climate-action-color: var(--lcars-butterscotch);

  min-height: calc(var(--lcars-vunit) * 5);
}
```

### Why Dynamic `--panel-frame-color`

The frame color shifts based on the current `hvac_action` attribute — warm when the furnace is firing, cool when the compressor kicks in. This gives **instant, peripheral visual feedback** without reading a single number. You glance at the panel: warm glow = heating, cool glow = cooling, neutral = idle. This is how the Environmental Control station communicates systemwide status on the bridge — color fields you absorb at a distance.

---
