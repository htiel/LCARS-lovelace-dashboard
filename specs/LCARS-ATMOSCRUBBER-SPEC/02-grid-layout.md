## 1. Grid Layout

### ASCII Layout

```
┌──────────────────────────────────────────────────────────┐
│  ATMOSCRUBBER - OFFICE          AQI: 42   GOOD           │  ← header
├──────────────┬──────────┬────────────────────────────────┤
│  AQI     42  │ ┌──────┐ │  PRESET MODE                   │
│  PM2.5  8µg  │ │░░░░░░│ │  ○ AUTO  ● SLEEP  ○ TURBO     │
│  CO₂   620   │ │░▒░░▒░│ │                                │
│  VOC   185   │ │░░░▒░░│ │  DISPLAY     ┌─────╮           │
│  TEMP  21.3° │ │▒░░░░░│ │  ■ ON        └─────╯           │
│  HUM   48%   │ │░░▒░░░│ │  CHILD LOCK  ┌─────╮           │
│              │ │░░░░▒░│ │  □ OFF       └─────╯           │
│  DIAGNOSTICS │ │░▒░░░░│ │                                │
│  FILTER 78%  │ └──────┘ │  FILTER LIFE ████████░░ 78%    │
│  FW  1.2.14  │          │                                │
├──────────────┴──────────┴────────────────────────────────┤
│  ─── PM2.5 ───   ─── AQI ───   ─── CO₂ ───   ─── VOC ──│  ← sparklines
│  ╱╲  ╱╲          ╱╲   ╱╲       ╱╲  ╱╲         ╱╲  ╱╲    │
│ ╱  ╲╱  ╲╱       ╱  ╲╱  ╲     ╱  ╲╱  ╲╱      ╱  ╲╱  ╲╱  │
└──────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-atmoscrubber-panel {
  display: grid;
  grid-template-areas:
    "header     header     header"
    "sensors    core       controls"
    "sparklines sparklines sparklines";
  grid-template-columns: minmax(8rem, 1fr) minmax(5rem, 6rem) minmax(8rem, 1.2fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-bluey));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-bluey));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-bluey));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-bluey));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Atmoscrubber frame color: bluey (cool, environmental) */
  --panel-frame-color: var(--lcars-bluey);

  /* Dynamic AQI color — set by JS based on air quality */
  --atmos-quality-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 6);
}
```

### Why `--lcars-bluey` for the Frame

Environmental systems on starships are cool-blue displays — life support, atmospheric processing, environmental controls. The blue hue family (`--lcars-bluey` #8899ff) distinguishes this from the warm butterscotch of cameras/generic panels and the violet of nav/media. This is the same logic as the Device Panel Spec §9 table: each device type gets a distinct frame color from a different hue family. Blue = environmental/life-support. (Source: TheLCARS.com color semantics, Ex Astris Scientia TNG Engineering displays)

---
