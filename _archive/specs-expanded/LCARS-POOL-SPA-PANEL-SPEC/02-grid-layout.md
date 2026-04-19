## 1. Grid Layout

### ASCII Layout — Full Panel (Desktop)

This is a **full-width panel** — significantly larger than a single device panel. It occupies the entire content area, similar to how Cetacean Ops fills an entire viewscreen.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POOL & SPA — BACKYARD             POOL 78°F   SPA 102°F   AIR 85°F        │  ← header
├──────────────┬───────────────────────────────────────────────┬──────────────┤
│              │   ╔════════════════╗   ╔════════════════╗     │              │
│  CHEMISTRY   │   ║   POOL  78°F  ║   ║   SPA  102°F   ║     │  CONTROLS    │
│              │   ║   ┌──╮TGT┌──╮ ║   ║   ┌──╮TGT┌──╮ ║     │              │
│  PH    7.4   │   ║   │ –│82°│ +│ ║   ║   │ –│104│ +│ ║     │  POOL PUMP   │
│  ORP   720   │   ║   └──╯   └──╯ ║   ║   └──╯   └──╯ ║     │  ■ ON        │
│  SALT  3200  │   ║               ║   ║               ║     │              │
│  SAT   0.12  │   ║  ░░▒░░░░▒░░  ║   ║  ▓▓▒▓▓▓▓▒▓▓  ║     │  SPA PUMP    │
│              │   ║  ░░░░▒░░░░░  ║   ║  ▓▓▓▓▒▓▓▓▓▓  ║     │  □ OFF       │
│  ──────────  │   ║  ░░░░░░░▒░░  ║   ║  ▓▓▓▓▓▓▓▒▓▓  ║     │              │
│  FREEZE  OFF │   ╚════════════════╝   ╚════════════════╝     │  SPILLOVER   │
│  SCL    IDLE │   ──── HEAT: OFF ────   ──── HEAT: ON ─────  │  □ OFF       │
│  FLOW    OK  │                                               │              │
│              │                                               │  CLEANER     │
│  SUPPLY      │                                               │  □ OFF       │
│  PH   FULL   │                                               │              │
│  ORP  FULL   │                                               │  AUX 1       │
│              │                                               │  □ OFF       │
├──────────────┴───────────────────────────────────────────────┴──────────────┤
│  INTELLIBRITE    ┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮       │  ← lighting
│  ● COLOR SWIM    │PAR││ROM││CAR││AMR││SUN││ROY││SWM││SYN││SET││ ▶ │       │
│                  └───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Compact (No IntelliChem)

When IntelliChem chemistry sensors are not present, the chemistry column collapses:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POOL & SPA — BACKYARD             POOL 78°F   SPA 102°F   AIR 85°F        │
├──────────────────────────────────────────────────────────┬──────────────────┤
│   ╔════════════════╗       ╔════════════════╗            │  POOL PUMP  ■    │
│   ║   POOL  78°F   ║       ║   SPA  102°F   ║            │  SPA PUMP   □    │
│   ║   ┌──╮TGT┌──╮ ║       ║   ┌──╮TGT┌──╮ ║            │  SPILLOVER  □    │
│   ║   │ –│82°│ +│ ║       ║   │ –│104│ +│ ║            │  CLEANER    □    │
│   ║   └──╯   └──╯ ║       ║   └──╯   └──╯ ║            │  AUX 1      □    │
│   ║  ░░▒░░░░▒░░░  ║       ║  ▓▓▒▓▓▓▓▒▓▓▓  ║            │  AUX 2      □    │
│   ╚════════════════╝       ╚════════════════╝            │                  │
│   ──── HEAT: OFF ────       ──── HEAT: ON ─────          │  FREEZE     OFF  │
├──────────────────────────────────────────────────────────┴──────────────────┤
│  INTELLIBRITE    ┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮┌───╮       │
│  ● COLOR SWIM    │PAR││ROM││CAR││AMR││SUN││ROY││SWM││SYN││SET││ ▶ │       │
│                  └───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯└───╯       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### CSS Grid Definition

```css
.lcars-pool-spa-panel {
  display: grid;
  grid-template-areas:
    "header    header    header"
    "chemistry aquatics  controls"
    "lighting  lighting  lighting";
  grid-template-columns: minmax(8rem, 1fr) minmax(20rem, 3fr) minmax(8rem, 1.2fr);
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

  /* Pool/Spa frame color: bluey (aquatic/water systems) */
  --panel-frame-color: var(--lcars-bluey);

  /* Dynamic colors — set by JS based on pool/spa state */
  --pool-color: var(--lcars-ice);
  --spa-color: var(--lcars-butterscotch);
  --chem-status-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 6);

  /* Full-width panel */
  grid-column: 1 / -1;
}

/* No-chemistry variant — 2-column */
.lcars-pool-spa-panel.no-chem {
  grid-template-areas:
    "header   header"
    "aquatics controls"
    "lighting lighting";
  grid-template-columns: minmax(20rem, 3fr) minmax(8rem, 1.2fr);
}
```

### Why `--lcars-bluey` for the Frame

Water systems on the Enterprise-D — coolant, aquaculture, hydroponics, Cetacean Ops — are displayed on cool-blue consoles. The `--lcars-bluey` (#8899ff) sits in the blue family, distinct from the butterscotch of cameras, the violet of media, the deeper blue of atmoscrubbers. Within the panel, the two bodies get differentiated colors: `--lcars-ice` (#99ccff) for the pool (cool, unheated water) and `--lcars-butterscotch` (#ff9966) for the spa (warm, heated water). This thermal color coding gives immediate visual feedback about which body is which.

### Why Full-Width

A standard 2-column device panel can't contain two climate entities, chemistry readouts, circuit switches, AND a lighting selector. This panel occupies `grid-column: 1 / -1` on the dashboard layout — the same approach used for wide data panels on the Enterprise Ops console. The three-column internal grid (chemistry | aquatics | controls) keeps information organized without feeling cramped.

---
