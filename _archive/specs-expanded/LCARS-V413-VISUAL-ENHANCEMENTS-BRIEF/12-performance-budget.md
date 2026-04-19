## Performance Budget

| Metric | Target |
|--------|--------|
| Total concurrent CSS animations per visible panel | ≤ 6 |
| Max animation duration (ambient) | ≤ 12s |
| Max animation duration (confirmation) | ≤ 500ms |
| Pseudo-elements per panel | ≤ 4 |
| `box-shadow` animations (GPU-intensive) | ≤ 2 per panel |
| All animations use `will-change` | Only on elements actively animating |
| `transform` and `opacity` preferred over | `width`, `height`, `top`, `left`, `background-position` |

---
