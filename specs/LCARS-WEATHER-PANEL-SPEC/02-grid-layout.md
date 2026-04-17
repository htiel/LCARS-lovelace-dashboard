## 1. Grid Layout

### ASCII Layout — Standard (Current + Forecast)

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ☀ SUNNY           72°F      │  ← header
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  74°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   72°   │     ║           │
│  62%             │        ║      │  SUNNY  │     ║           │
│                  │        ║      │         │     ║           │
│  DEW POINT       │        ║      └─────────┘     ║           │
│  54°F            │        ║                      ║           │
│                  │        ║    ┌──┐ N  ┌──┐      ║           │
│  PRESSURE        │        ║    │  │↑7  │  │      ║           │
│  30.12 INHG ↑    │        ║    └──┘    └──┘      ║           │
│                  │        ║    8 MPH  NNW         ║           │
│  UV INDEX        │        ║                      ║           │
│  6 HIGH          │        ╚══════════════════════╝           │
│                  │                                           │
│  VISIBILITY      │   ☀ RISE 06:42    ☀ SET 19:58             │
│  10 MI           │   ═══════●════════════════════            │
│                  │                                           │
│  SOLAR RAD       │                                           │
│  847 W/M²        │                                           │
│                  │                                           │
│  ⚡ LIGHTNING     │                                           │
│  3 STRIKES       │                                           │
│  12.4 MI AVG     │                                           │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │  ← forecast
│  ☀ 74°  ◑ 68°  ◔ 71°  ▽ 65°  ◔ 70°  ☀ 76°  ☀ 78°         │     strip
│    58°    52°    55°    48°    51°    60°    62°             │
│  ██████  ██████  ██████  ██████  ██████  ██████  ██████     │  ← range bars
│    10%    45%    30%    85%    25%     5%     0%            │  ← precip %
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Severe Weather (Exceptional State)

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ⚠ SEVERE WEATHER   82°F     │  ← header (tomato)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  88°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   82°   │     ║           │
│  89%             │        ║      │ THUNDER │     ║           │
│                  │        ║      │ STORM   │     ║           │
│  ⚡ LIGHTNING     │        ║      └─────────┘     ║           │
│  47 STRIKES      │        ║                      ║           │
│  2.1 MI AVG      │        ║    WIND 35 MPH SSW   ║           │
│                  │        ╚══════════════════════╝           │
│  WIND GUST       │                                           │
│  52 MPH          │                                           │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │
│  ⚡ 82°  ▽ 70°  ◔ 68°  ☀ 72°  ☀ 74°  ◑ 71°  ▽ 66°        │
│    64°    58°    54°    56°    58°    55°    50°             │
│  ██████  ██████  ██████  ██████  ██████  ██████  ██████     │
│    90%    65%    30%    10%     5%    35%    60%            │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Night State

```
┌──────────────────────────────────────────────────────────────┐
│  LOCAL WEATHER — GRANDBRIDGE     ● CLEAR NIGHT      58°F     │  ← header (bluey)
├──────────────────┬───────────────────────────────────────────┤
│                  │        ╔══════════════════════╗           │
│  FEELS LIKE      │        ║                      ║           │
│  55°F            │        ║      ┌─────────┐     ║           │
│                  │        ║      │         │     ║           │
│  HUMIDITY        │        ║      │   58°   │     ║           │
│  78%             │        ║      │  CLEAR  │     ║           │
│                  │        ║      │  NIGHT  │     ║           │
│  DEW POINT       │        ║      └─────────┘     ║           │
│  51°F            │        ║                      ║           │
│                  │        ║    5 MPH  WSW         ║           │
│  PRESSURE        │        ╚══════════════════════╝           │
│  30.08 INHG ─    │                                           │
│                  │   ☀ RISE 06:42    ☀ SET 19:58             │
│                  │   ════════════════════════●═══            │
├──────────────────┴───────────────────────────────────────────┤
│  MON     TUE     WED     THU     FRI     SAT     SUN        │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-weather-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "sensors  media"
    "forecast forecast";
  grid-template-columns: minmax(10rem, 1fr) minmax(14rem, 2fr);
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — Bracer Jack Rule 2: thick→thin, NEVER same */
  border-left: 4px solid var(--panel-frame-color, var(--lcars-sky));
  border-top: 2px solid var(--panel-frame-color, var(--lcars-sky));
  border-right: 2px solid var(--panel-frame-color, var(--lcars-sky));
  border-bottom: 4px solid var(--panel-frame-color, var(--lcars-sky));
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Dynamic frame color — set by JS based on weather condition */
  --panel-frame-color: var(--weather-condition-color, var(--lcars-sky));

  /* Dynamic accent for temperature and condition glyph */
  --weather-condition-color: var(--lcars-sky);

  min-height: calc(var(--lcars-vunit) * 5);
}
```

### Why `--lcars-sky` / `--lcars-bluey` for the Frame

Atmospheric and meteorological data on TNG was displayed in the cool blue-violet spectrum — the color of sensor sweeps, planetary scans, and environmental telemetry. `--lcars-sky` (#aaaaff) is the default "clear day" frame: calm, atmospheric, sky-blue. The frame color shifts dynamically based on conditions — warm for sunny/hot, cool for rain/night, red for severe. This gives instant peripheral feedback: glance at the panel border and you know the weather character without reading a number.

---
