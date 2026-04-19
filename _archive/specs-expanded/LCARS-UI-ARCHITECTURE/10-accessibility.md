## 9. Accessibility

### WCAG 2.2 Compliance Targets

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.4.3 Contrast (Minimum) | AA | All text meets 4.5:1 or 3:1 for large text on black background |
| 1.4.11 Non-text Contrast | AA | UI components (buttons, elbows) have 3:1 contrast vs background |
| 2.1.1 Keyboard | A | All interactive elements reachable and operable via keyboard |
| 2.4.7 Focus Visible | AA | 2px white outline on `:focus-visible` |
| 2.4.11 Focus Not Obscured | AA | Sticky header/footer must not hide focused elements |
| 2.4.13 Focus Appearance | AAA* | Focus ring 2px thick, `#f5f6fa` on `#000000` = well above 3:1 |
| 2.5.8 Target Size | AA | All buttons ≥ 48px height (3rem), minimum 24×24 for small controls |
| 4.1.2 Name, Role, Value | A | ARIA labels on all custom elements |

### Contrast Validation (Key Pairs)

| Foreground | Background | Ratio | Pass? |
|------------|------------|-------|-------|
| `#f5f6fa` (space-white) | `#000000` (black) | 18.1:1 | AA ✔ |
| `#ffcc99` (sunflower) | `#000000` (black) | 11.3:1 | AA ✔ |
| `#99ccff` (ice) | `#000000` (black) | 9.4:1 | AA ✔ |
| `#cc99ff` (african-violet) | `#000000` (black) | 7.0:1 | AA ✔ |
| `#666688` (gray) | `#000000` (black) | 3.5:1 | AA large text ✔ |
| `#000000` (text-on-button) | `#ffcc99` (sunflower) | 11.3:1 | AA ✔ |
| `#000000` (text-on-button) | `#cc99ff` (african-violet) | 7.0:1 | AA ✔ |
| `#000000` (text-on-button) | `#99ccff` (ice) | 9.4:1 | AA ✔ |
| `#000000` (text-on-button) | `#666688` (gray) | 3.5:1 | AA large text ✔ |

**Note**: Gray text on black (3.5:1) passes for large text (≥18px / 1.125rem bold, or ≥24px / 1.5rem normal) but fails for small body text. Use gray ONLY for labels that are ≥ `--lcars-font-subtitle` (1.5rem) OR supplement with an icon.

### ARIA Patterns

```html
<!-- Layout landmark structure -->
<div class="lcars-frame" role="application" aria-label="LCARS Dashboard">
  <header class="lcars-header" role="banner">...</header>
  <nav class="lcars-sidebar__nav" role="navigation" aria-label="Dashboard navigation">
    <button aria-current="page">HOME</button>
    <button>DEVICES</button>
  </nav>
  <main class="lcars-content" role="main" aria-live="polite">
    <slot></slot>
  </main>
  <footer class="lcars-footer" role="contentinfo">...</footer>
</div>

<!-- Popup -->
<div class="lcars-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
  <div class="lcars-popup">
    <div class="lcars-popup__header">
      <span id="popup-title">ENTITY DETAILS</span>
      <button class="lcars-popup__close" aria-label="Close">✕</button>
    </div>
    ...
  </div>
</div>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus through sidebar buttons, then content area |
| `Enter` / `Space` | Activate focused button |
| `Escape` | Close popup/modal |
| `Arrow Up/Down` | Navigate within sidebar button group |
| `Home` / `End` | Jump to first/last sidebar button |

---
