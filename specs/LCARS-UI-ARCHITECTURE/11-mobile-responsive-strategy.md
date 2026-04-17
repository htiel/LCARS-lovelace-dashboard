## 10. Mobile / Responsive Strategy

LCARS's strict geometric frame doesn't naturally reflow. Strategy: **collapse the sidebar into a top navigation bar** on small screens, maintaining the elbow aesthetic as a horizontal element.

### Breakpoints

```css
/* Desktop — full LCARS frame */
@media (min-width: 769px) {
  /* Default styles above — sidebar + elbows */
}

/* Tablet — narrower sidebar */
@media (max-width: 768px) and (min-width: 481px) {
  :host {
    --lcars-sidebar-width: 8rem;
    --lcars-elbow-width: 6rem;
  }

  .lcars-btn--nav {
    font-size: 0.85rem;
    padding-left: 0.5rem;
  }
}

/* Mobile — sidebar collapses to horizontal top nav */
@media (max-width: 480px) {
  .lcars-frame {
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas:
      "header-bar"
      "sidebar"
      "content"
      "footer-bar";
  }

  .lcars-header {
    /* Simplified: just the header bar, no elbow */
    flex-direction: row;
  }

  .lcars-elbow { display: none; }

  .lcars-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .lcars-sidebar__nav {
    flex-direction: row;
    gap: var(--lcars-gap);
    padding: var(--lcars-gap);
  }

  .lcars-btn--nav {
    white-space: nowrap;
    border-radius: var(--lcars-btn-radius);  /* Fully rounded on mobile */
    width: auto;
    padding: 0 1rem;
    flex-shrink: 0;
  }

  .lcars-footer {
    flex-direction: row;
  }
}
```

---
