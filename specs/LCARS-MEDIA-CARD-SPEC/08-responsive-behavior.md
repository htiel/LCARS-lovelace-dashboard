## 7. Responsive Behavior

### Desktop (≥768px) — Full 2-Column Layout

The spec above. Metadata left, media/controls right, volume bottom.

### Mobile (<768px) — Stacked Layout

```css
@media (max-width: 767px) {
  .lcars-media-panel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "media"
      "metadata"
      "volume";
  }

  .media-viewscreen {
    max-height: 14rem;
  }

  .media-metadata {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .device-sensor-line {
    flex: 1 1 45%;
    min-width: 8rem;
  }

  /* Group members list goes horizontal */
  .media-group-section {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .media-group-member {
    padding-left: 0.5rem;
  }

  /* Transport buttons get tighter but maintain min target size */
  .media-transport {
    gap: calc(var(--lcars-gap) * 0.5);
  }

  .media-transport-btn {
    min-width: 2.5rem;       /* Still ≥ 24px WCAG */
    padding: 0 0.5rem;
  }

  .media-transport-btn.primary {
    min-width: 4rem;
  }
}
```

On mobile, the viewscreen goes full-width above metadata (which flows horizontally in pairs). Volume bar remains full-width at the bottom. Reading order maintained: status → visual → controls → context → volume.

### Compact Mode (≤480px)

```css
@media (max-width: 480px) {
  /* Hide text labels on transport buttons, icon-only */
  .media-transport-btn .btn-label {
    display: none;
  }

  .media-transport-btn {
    min-width: 2.5rem;
    padding: 0 0.5rem;
  }

  /* Metadata column hidden in compact, except source */
  .media-metadata > .device-sensor-line:not(:first-child) {
    display: none;
  }

  .media-group-section {
    display: none;
  }
}
```

---
