## 19. Design Review Checklist

### For Geordi La Forge (LCARS Design Authority)

- [ ] Frame uses `--lcars-ice` (#99ccff) — environmental system color family
- [ ] Tile shape: flat-left, rounded-right pill (0 0.75rem 0.75rem 0) — matches LCARS button DNA
- [ ] Three font sizes only: subtitle (1.5rem) for header/summary, body (1rem) for tile names/readings
- [ ] All text uppercase via `text-transform: uppercase`
- [ ] Font: Antonio only
- [ ] Border: thick→thin (4px left/bottom, 2px top/right)
- [ ] Empty space between tiles = black void between decks
- [ ] Color palette: only approved LCARS variables, no custom hex
- [ ] Sparklines minimal — 1rem tall, no axis labels, no grid lines

### For Worf (Security Review)

- [ ] No external API calls — all data from local HA WebSocket
- [ ] Entity discovery uses standard HA API (no custom endpoints)
- [ ] No user-supplied HTML rendered (template literals only)
- [ ] History API uses `encodeURIComponent()` for entity ID in URL
- [ ] No persistent storage beyond HA standard card config
- [ ] No sensitive data exposed — temperature/humidity are non-PII
- [ ] `aria-live="polite"` on summary — no XSS vector (text-only)

---
