## 1. Grid Layout

### ASCII Layout — Full Panel (Desktop)

This is a **standard-width panel** — narrower than pool/spa. It fits in the normal 2-column dashboard grid alongside other device panels.

```
┌──────────────────────────────────────────────────────────────┐
│  IRRIGATION — RACHIO              IDLE   NEXT: TUE 05:30    │  ← header
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  SCHEDULE    │  ZONE GRID                                    │
│              │                                               │
│  NEXT RUN    │  ┌─────────╮                                  │
│  TUE 05:30   │  │ ● START │  FRONT LAWN       IDLE          │
│              │  └─────────╯                                  │
│  DURATION    │  ┌─────────╮                                  │
│  45 MIN      │  │ ● START │  BACK LAWN        IDLE          │
│              │  └─────────╯                                  │
│  RAIN DELAY  │  ┌─────────╮                                  │
│  NONE        │  │ ■ STOP  │  GARDEN      ████░░░  12:34     │
│              │  └─────────╯                                  │
│  DAILY USED  │  ┌─────────╮                                  │
│  124 GAL     │  │ ● START │  FLOWER BEDS      IDLE          │
│              │  └─────────╯                                  │
│  ──────────  │  ┌─────────╮                                  │
│  CONTROLLER  │  │ ● START │  SIDE YARD        IDLE          │
│  ● ONLINE    │  └─────────╯                                  │
│              │  ┌─────────╮                                  │
│              │  │ ● START │  DRIP LINE        IDLE          │
│              │  └─────────╯                                  │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│  ┌──────────╮                                                │
│  │ STANDBY  │                                                │  ← standby toggle
│  └──────────╯                                                │
└──────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Zone Active (Watering)

When a zone is actively running, its row expands to show a countdown fill bar:

```
│  ┌─────────╮                                                  │
│  │ ■ STOP  │  GARDEN      ████████░░░░  12:34 REMAINING      │
│  └─────────╯                                                  │
```

The fill bar uses `--lcars-ice` for the filled portion against a dim `--lcars-gray` track — water flowing through the pipe.

### ASCII Layout — Zone Expanded (Tap to View Attributes)

Tapping a zone row expands to show secondary attributes:

```
│  ┌─────────╮                                                  │
│  │ ● START │  FRONT LAWN       IDLE                           │
│  └─────────╯  SOIL: CLAY LOAM   NOZZLE: FIXED SPRAY          │
│               SHADE: LOTS       SLOPE: FLAT                   │
```

### CSS Grid Definition

```css
.lcars-irrigation-panel {
  display: grid;
  grid-template-areas:
    "header   header"
    "schedule zones"
    "standby  standby";
  grid-template-columns: minmax(8rem, 1fr) minmax(16rem, 3fr);
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

  /* Irrigation frame color: ice (water/blue semantic) */
  --panel-frame-color: var(--lcars-ice);

  min-height: calc(var(--lcars-vunit) * 4);
}
```

### Why `--lcars-ice` for the Frame

Water systems across all LCARS panels use the blue family. The pool panel uses `--lcars-bluey` (#8899ff) for its frame because it's a complex multi-system panel. Irrigation is simpler and more utilitarian — `--lcars-ice` (#99ccff) is lighter, cleaner, and appropriate for a straightforward water distribution grid. It's the same color used for the pool body in its idle state — cool, calm, functional water.

---
