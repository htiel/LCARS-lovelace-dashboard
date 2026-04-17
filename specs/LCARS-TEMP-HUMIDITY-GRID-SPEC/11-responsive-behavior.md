## 10. Responsive Behavior

### Breakpoint Strategy

| Viewport          | Columns   | Tile Size    | Sparklines | Summary        |
|-------------------|-----------|--------------|------------|----------------|
| < 480px (phone)   | 1         | Full width   | Hidden     | Stacked, 2-row |
| 480–767px (small) | 2         | ~50% width   | Hidden     | 1-row compact  |
| 768–1023px (tablet) | 3       | ~8rem min    | Visible    | Full           |
| 1024–1439px (desktop) | 4     | ~9.5rem min  | Visible    | Full           |
| ≥ 1440px (wide)   | 5–6       | 9.5rem min   | Visible    | Full           |

### CSS

```css
/* Sparklines hidden on small viewports — too compressed to be useful */
@media (max-width: 767px) {
  .tile-sparkline {
    display: none;
  }

  /* Tiles become horizontal rows on mobile */
  .sensor-tile {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    min-height: var(--lcars-vunit);           /* 3rem = 48px = 1 vertical unit */
    padding: 0.25rem 0.5rem;
  }

  .tile-name {
    flex: 1;
    min-width: 0;                             /* Allow truncation */
  }

  .tile-readings {
    flex-shrink: 0;
  }
}
```

### Grid-to-List Transition

On mobile, the card transitions from a **grid of tiles** to a **vertical list** — each room becomes a single-line row. This matches TNG's smaller status displays (PADDs, armrest consoles) which showed the same environmental data in list format.

---
