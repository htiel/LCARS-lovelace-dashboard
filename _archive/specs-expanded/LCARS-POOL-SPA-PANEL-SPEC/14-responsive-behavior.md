## 13. Responsive Behavior

### Desktop (≥1024px) — Full 3-Column

The spec above — chemistry, aquatics (two viewscreens side-by-side), controls, lighting strip.

### Tablet (768px–1023px) — 2-Column, Stacked Chemistry

```css
@media (max-width: 1023px) {
  .lcars-pool-spa-panel {
    grid-template-areas:
      "header    header"
      "aquatics  controls"
      "chemistry chemistry"
      "lighting  lighting";
    grid-template-columns: minmax(16rem, 2fr) minmax(8rem, 1fr);
    grid-template-rows: auto 1fr auto auto;
  }

  .pool-chemistry {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
    border-top: 2px solid var(--panel-frame-color);
    padding-top: var(--lcars-gap);
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }
}
```

### Mobile (<768px) — Single Column, Stacked Everything

```css
@media (max-width: 767px) {
  .lcars-pool-spa-panel,
  .lcars-pool-spa-panel.no-chem {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "aquatics"
      "controls"
      "chemistry"
      "lighting";
  }

  .pool-aquatics {
    flex-direction: column;
    gap: calc(var(--lcars-gap) * 2);
    align-items: stretch;
  }

  .pool-body-viewscreen {
    max-width: 100%;
  }

  .pool-body-frame {
    aspect-ratio: 16 / 9;
  }

  .pool-chemistry {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Circuit toggles go horizontal on mobile */
  .pool-controls {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pool-circuit-row {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Swatch strip remains horizontal, scrollable */
  .pool-lighting-swatches {
    gap: 0.5rem;
  }

  .pool-swatch {
    min-width: 3rem;
  }
}
```

On mobile, viewscreens stack vertically (pool on top, spa below), followed by controls and chemistry as wrapped pairs. The lighting strip stays horizontal and scrollable — it's the one element that works better as a continuous strip regardless of viewport.

---
