## Design Validation Checklist

Before committing any LCARS UI change, verify:

- [ ] Background is `#000000` — no exceptions
- [ ] No gradients, box-shadows, or 3D effects on any element
- [ ] Frame thickness changes at every turn (thick→thin→thick)
- [ ] Elbows use `::after` pseudo-element for inner cutout
- [ ] All text is Antonio font, uppercase (except body prose)
- [ ] Exactly 3 font sizes used (title, subtitle, body)
- [ ] Buttons are pill-shaped with one flat side
- [ ] Hover is `brightness(1.2)` only
- [ ] Active state is gold (`#ffaa00`)
- [ ] Focus indicator is visible: 2px solid white outline
- [ ] Touch targets ≥ 48px tall (3rem)
- [ ] Color contrast meets WCAG AA minimums
- [ ] Animations ≤ 1 second, respect `prefers-reduced-motion`
- [ ] TheLCARS.com attribution is present in footer
- [ ] `aria-label`, `role`, `aria-current` set on interactive/landmark elements

---
