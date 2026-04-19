## 7. Responsive Behavior

### 7.1 Width Context Change

The consolidated panel now lives in `area-split-main` (left column) instead of `area-split-panels` (right column). In the two-column layout, `area-split-main` is typically wider (~60–65% of content width). In single-column fallback, it's 100%.

This means circuit tiles have **more horizontal room** than before, which is beneficial for areas with many circuits.

### 7.2 Breakpoints

```css
/* ─── Desktop (≥1024px) — Left column, ~60% width ─── */
.lcars-consolidated-power-panel .power-circuits {
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
}

/* ─── Tablet (768–1023px) — Tighter tiles ─── */
@media (max-width: 1023px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  }
}

/* ─── Mobile (<768px) — 2-column tile grid ─── */
@media (max-width: 767px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: 1fr 1fr;
    max-height: 16rem;
  }

  .lcars-consolidated-power-panel .power-device-row {
    flex-wrap: wrap;
  }

  .lcars-consolidated-power-panel .power-strip-children {
    padding-left: 0.5rem;
  }
}

/* ─── Narrow mobile (<480px) — Single column tiles ─── */
@media (max-width: 479px) {
  .lcars-consolidated-power-panel .power-circuits {
    grid-template-columns: 1fr;
  }
}
```

### 7.3 Max-Height & Scroll

The circuit grid retains `max-height: 24rem` with the bottom fade mask. For areas like the Admiral's Server Room (6+ Vue circuits + 2 strips), the circuits section scrolls while strips remain visible below.

For extreme cases (40+ circuits on Main Panel), the 24rem cap prevents the panel from dominating the page. The fade mask communicates "scroll for more."

---
