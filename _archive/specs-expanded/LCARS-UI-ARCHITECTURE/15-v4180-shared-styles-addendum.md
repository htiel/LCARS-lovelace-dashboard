## v4.18.0 — Shared Styles Addendum

**Backlog Items**: 4X-24 (Dashboard Identity CSS Properties), 4X-25 (Shared Focus Style Mixin), 4X-16 (Segmented Bar Component)
**Status**: IMPLEMENTED — v4.18.0
**Date**: 2026-04-16
**File**: `js/src/lcars-styles.js`

---

### D1. Dashboard Identity CSS Custom Properties (4X-24)

Added to `lcarsBaseStyles` in `lcars-styles.js`:

```css
/* Dashboard-level color identity tokens */
--lcars-dash-habitat:       var(--lcars-butterscotch);
--lcars-dash-security:      var(--lcars-tomato);
--lcars-dash-power:         var(--lcars-golden-orange);   /* Geordi correction: not sunflower */
--lcars-dash-environmental: var(--lcars-ice);
--lcars-dash-lighting:      var(--lcars-almond);          /* Geordi correction: not gold */
--lcars-dash-comm:          var(--lcars-african-violet);
--lcars-dash-ops:           var(--lcars-bluey);

/* Active dashboard alias */
--lcars-active-dash:        var(--lcars-dash-habitat);
```

**Geordi color corrections applied**:
- `--lcars-dash-power` mapped to `--lcars-golden-orange` (not `--lcars-sunflower` — avoids collision with button default)
- `--lcars-dash-lighting` mapped to `--lcars-almond` (not `--lcars-gold` — almond is warmer, better represents illumination)

**5.x Enablement**: Dashboard chrome inherits color identity. Each dashboard sets `--lcars-active-dash` to its own token.

---

### D2. Shared Focus Style Mixin (4X-25)

Added `lcarsFocusRing` export to `lcars-styles.js`:

```js
export const lcarsFocusRing = css`
  :focus-visible {
    outline: 2px solid var(--lcars-ice);
    outline-offset: 2px;
  }
`;
```

**Naming**: `lcarsFocusRing` (not `lcarsSeraphFocus` as originally proposed — simplified per review).

**Usage**: Import and spread in component styles:
```js
static get styles() {
  return [lcarsFocusRing, myComponentStyles];
}
```

**Applied to**: `<lcars-segmented-bar>` (4X-16). Existing components to migrate incrementally.

**WCAG compliance**: Meets 2.4.7 (Focus Visible) and 2.4.13 (Focus Appearance). Ice blue at 10.3:1 contrast vs black.

---

### D3. `<lcars-segmented-bar>` Shared Component (4X-16)

New component: `components/lcars-segmented-bar/lcars-segmented-bar.js`

**Properties**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | Number | 0 | Current numeric value |
| `min` | Number | 0 | Scale minimum |
| `max` | Number | 100 | Scale maximum |
| `segments` | Number | 7 | Number of bar segments |
| `thresholds` | Array | `[]` | `[{value, color}]` ascending |
| `label` | String | `''` | Accessible label |

**Rendering**:
- N `<div class="segment">` elements in a flex row
- Filled segments: solid color from threshold lookup, opacity 1
- Unfilled segments: `--lcars-gray` at opacity 0.3
- Last segment: `border-radius: 0 var(--lcars-endcap) var(--lcars-endcap) 0`
- Text readout: `<span class="bar-value">` alongside bar

**Accessibility**:
- `role="meter"` on bar container
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- Min height: 24px (WCAG 2.5.8)
- Imports `lcarsFocusRing`

**Geordi compliance**:
- ✅ No gradients — solid color blocks only
- ✅ `role="meter"` with full ARIA
- ✅ Text readout for non-color-dependent information
- ✅ Endcap radius on rightmost segment
