## 12. Design Verification Checklist

### LCARS Compliance

- [ ] Frame uses thick→thin border pattern (4px left/bottom, 2px top/right) — **Bracer Jack Rule 2** ✓
- [ ] All colors from approved LCARS Classic palette — no rogue hex values ✓
- [ ] Font: Antonio only, three sizes only (title/sub/data) — **Bracer Jack Rule 6** ✓
- [ ] Text: UPPERCASE for all UI labels, mixed case never used ✓
- [ ] Flat design: No gradients, no shadows, no 3D effects — **Bracer Jack Rule 1** ✓
- [ ] Standard pill-button vocabulary for toggles — **Bracer Jack Rule 4** ✓
- [ ] CSS custom properties only, no hardcoded hex — **Project constraint** ✓
- [ ] Empty space preserved — panels with few devices breathe — **Manifesto §3** ✓
- [ ] ≤5 hue families (orange, blue/ice, gray, white, tomato) — **Bracer Jack color theory** ✓
- [ ] TheLCARS.com attribution preserved in footer — **EULA** ✓

### Accessibility (WCAG 2.2 AA)

- [ ] All text meets 4.5:1 contrast on black (§1.4.3) ✓
- [ ] Non-text elements (borders, indicators) meet 3:1 contrast (§1.4.11) ✓
- [ ] Color not sole indicator — shape + number redundancy (§1.4.1) ✓
- [ ] All interactive elements keyboard accessible (§2.1.1) ✓
- [ ] Focus order matches visual layout (§2.4.3) ✓
- [ ] Focus-visible: 2px solid ice outline on all focusable elements (§2.4.7, §2.4.13) ✓
- [ ] Focus not obscured: scroll container auto-scrolls focused tile (§2.4.11) ✓
- [ ] Target size ≥24×24 CSS px for all interactive elements (§2.5.8) ✓
- [ ] `role="region"` + `aria-label` on panel root (§4.1.2) ✓
- [ ] `role="switch"` + `aria-checked` on toggles (§4.1.2, APG Switch) ✓
- [ ] `role="list"` / `role="listitem"` on grids and rows (§4.1.2) ✓
- [ ] `aria-live="polite"` on summary status cards (§4.1.3) ✓
- [ ] `prefers-reduced-motion` disables all looping animations ✓
- [ ] All animations ≤1s duration ✓
- [ ] `sr-only` class for visually hidden screen reader text ✓

---
