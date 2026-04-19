## 3. Grid Layout

### ASCII Layout — Desktop (≥768px)

```
┌──────────────────────────────────────────────────────────────────┐
│  INTERNAL SENSORS                          STARDATE 2426.04.13   │  ← header
├──────────────────────────────────────────────────────────────────┤
│  ■ DECK 2 — UPSTAIRS                                            │  ← floor label
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ OFFICE      │ │ BOIMLER     │ │ CMD QTRS    │ │ MARINER    ││
│  │  72.1°  48% │ │  73.4°  51% │ │  71.8°  45% │ │  74.0°  52%││
│  │  ╱╲╱╲╱╲    │ │  ╱╲─╱╲     │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ T'LYN BATH  │ │ TENDI BATH  │ │ ATTIC    ●  │               │
│  │  75.2°  68% │ │  70.9°  44% │ │  88.3°  32% │               │
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ■ DECK 1 — MAIN                                                │  ← floor label
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ LIVING ROOM │ │ MASTER BED  │ │ MASTER BATH │ │ SOUTH BATH ││
│  │  71.5°  49% │ │  70.2°  47% │ │  72.8°  62% │ │  73.1°  58%││
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ GARAGE      │ │ NETWORK CLO │ │ CRAWL SPACE │               │
│  │  64.1°  55% │ │  78.9°  38% │ │  58.2°  72% │               │
│  │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │ │  ╱╲╱╲╱╲    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  SHIP AVG    71.8°F    50%RH    ■ 14 SENSORS ONLINE    ● 0 LOW │  ← summary row
└──────────────────────────────────────────────────────────────────┘
```

### ASCII Layout — Mobile (<768px)

```
┌──────────────────────┐
│ INTERNAL SENSORS     │
├──────────────────────┤
│ ■ UPSTAIRS           │
│ ┌──────────────────┐ │
│ │ OFFICE     72.1° │ │
│ │            48%   │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ BOIMLER    73.4° │ │
│ │            51%   │ │
│ └──────────────────┘ │
│ ...                  │
│ ■ MAIN               │
│ ...                  │
├──────────────────────┤
│ AVG 71.8° 50%  14●  │
└──────────────────────┘
```

### CSS Grid Definition

```css
.lcars-sensors-grid {
  display: grid;
  grid-template-areas:
    "header"
    "body"
    "summary";
  grid-template-rows: auto 1fr auto;
  gap: var(--lcars-gap);

  /* Frame border — thick left/bottom, thin top/right (Bracer Jack Rule 2) */
  border-left: 4px solid var(--lcars-ice);
  border-bottom: 4px solid var(--lcars-ice);
  border-top: 2px solid var(--lcars-ice);
  border-right: 2px solid var(--lcars-ice);
  border-radius: 0.75rem;

  padding: var(--lcars-gap);
  background: var(--lcars-bg);

  /* Environmental frame color: ice (cool, life-support family) */
  --grid-frame-color: var(--lcars-ice);
}
```

### Why `--lcars-ice` for the Frame

The internal sensors grid is an **environmental monitoring display** — the same blue-spectrum family as the Atmoscrubber panel (`--lcars-bluey`). Ice (#99ccff) is a lighter, cooler blue — fitting for a passive monitoring panel that doesn't demand attention the way an active air purifier does. It says "all systems nominal" as a default state. Blue = environmental/life-support. (Source: TNG Engineering wall panels, environmental control substations)

### Floor Group Container

```css
.sensors-floor-group {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}

.sensors-floor-label {
  font-family: var(--lcars-font);
  font-size: var(--lcars-font-size-data);
  color: var(--lcars-ice);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sensors-floor-label::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--lcars-ice);
  /* G-F1: Square indicator — LCARS uses rectangles, not circles */
  flex-shrink: 0;
}
```

### Tile Grid (within each floor group)

```css
.sensors-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: var(--lcars-gap);
}

/* Mobile: single column list */
@media (max-width: 767px) {
  .sensors-tile-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2 columns minimum */
@media (min-width: 768px) and (max-width: 1023px) {
  .sensors-tile-grid {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}
```

---
