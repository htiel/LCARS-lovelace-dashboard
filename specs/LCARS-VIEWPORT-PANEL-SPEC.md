# LCARS Viewport Panel — Design Specification

**Author**: Geordi La Forge (LCARS UI Design Authority)
**Date**: Stardate 2026.05.03
**Status**: SHIPPED — 4X-41 panel extraction; current as of v5.1.0-beta.38.
**Priority**: MEDIUM
**Panel Type**: `viewport`
**Extends**: `LcarsBasePanel` (`js/src/lcars-base-panel.js`)
**Source files**:
- `custom_components/lcars_dashboard/js/src/panels/viewport/lcars-viewport-panel.js`
- `custom_components/lcars_dashboard/js/src/panels/viewport/lcars-viewport-panel-styles.js`

---

## 0. Design Philosophy

The Viewport Panel is the **observation port console** — the bridge or quarters station that controls the physical shutters, blinds, and exterior screens that regulate light, privacy, and view through a window. On a Galaxy-class starship, viewports are not passive glass; they have variable opacity shutters the occupant can raise, lower, or hold partway. In a 21st century habitat, the analog is window coverings: blinds, shades, curtains, awnings.

This panel handles those — and only those. Security-bearing covers (`garage_door`, `gate`, `door`) are explicitly **routed to Tactical**, where intrusion-class movement belongs. A blind opening at 14:00 to let in afternoon light is a comfort event; a garage door opening at 14:00 is a security event. Same domain, different consoles.

Per Roddenberry's mandate: **the ship takes care of you**. The operator wants to know "is the viewport open, closed, or somewhere in between" and to act on it with a single tap. No scripting language, no scenes — just open, close, stop. The position percentage is read out as plain data; the row is the control.

Per Bracer Jack's Manifesto: **empty space is beautiful**, and **buttons within a frame must be uniform**. Every cover row uses the same three-button vocabulary (▲ ■ ▼) at the same size, in the same order. No row invents a new shape because it happens to be a curtain instead of a blind. The Home Assistant `supported_features` bitmask hides individual buttons that the device cannot perform — the row stays uniform in *style*, even if a particular cover only exposes open + close.

Per Bracer Jack's Core Design Rules: **LCARS is inherently flat/vector**. The position readout is a number, not a gauge. The state indicator is a 2px vertical bar, not an icon. No glyphs except the three universally-readable shutter triangles.

---

## 1. Panel Frame Design

### 1.1 Frame Color

| Frame Color | CSS Variable | Hex | Rationale |
|---|---|---|---|
| **Sunflower** | `--lcars-sunflower` | `#ffcc99` | Warm, light-associated hue. Viewports gate *light* — sunflower is the dashboard's canonical "illumination / sunlight" color. Matches the Illumination dashboard frame, reinforcing the wayfinding cue: warm pale colors = ambient/light systems, not power or security |

```js
get frameColor() { return 'var(--lcars-sunflower)'; }
```

The "active" indicator on each cover row reuses `--lcars-sunflower` when the cover is open, and `--lcars-gray` when closed. One hue, two states — within Bracer Jack's tint/shade safe zone.

### 1.2 Border Style

Standard `LcarsBasePanel` frame; thick→thin alternating per Bracer Jack Rule 2. Inherited unchanged from the base class.

### 1.3 Typography

| Element | Size Token | Casing | Color |
|---|---|---|---|
| Panel header | Sub | UPPERCASE | `--lcars-text-heading` |
| Cover name | Data (`--lcars-font-size-data`) | UPPERCASE | `--lcars-space-white` |
| Position readout | Data, `font-weight: 700` | UPPERCASE | `--lcars-space-white` |
| Empty-state message | Data | UPPERCASE | `--lcars-gray` |

Font family: `var(--lcars-font)` — Antonio everywhere.

---

## 2. Entity Scope

### 2.1 Inclusion

All `cover.*` entities returned by `this._getAllEntities()` **except** those whose `device_class` is in the tactical set.

### 2.2 Exclusion — `TACTICAL_COVER_CLASSES`

```js
// from lcars-viewport-panel.js
const TACTICAL_COVER_CLASSES = new Set(['garage_door', 'gate', 'door']);
```

These three device classes route to the Tactical dashboard. Filter logic:

```js
_getCoverEntries() {
  return this._getAllEntities().filter(entry => {
    if (entry.domain !== 'cover') return false;
    const dc = entry.state?.attributes?.device_class || '';
    return !TACTICAL_COVER_CLASSES.has(dc);
  });
}
```

In-scope device classes (non-exhaustive): `blind`, `shade`, `curtain`, `shutter`, `awning`, `window`, and any `cover` entity with no `device_class` set.

### 2.3 Empty State

When `_getCoverEntries()` returns zero entities, the panel renders:

```html
<div class="viewport-empty">NO VIEWPORT CONTROLS</div>
```

Styled gray, uppercase, centered, 2rem vertical padding.

---

## 3. Grid Layout

### 3.1 Container

```css
.viewport-content {
  display: flex;
  flex-direction: column;
  gap: var(--lcars-gap);
}
```

A single vertical stack — one row per cover. No multi-column grid; covers are typically few enough per area that a single column reads cleaner than wrapping.

### 3.2 Row Structure

Each `.viewport-cover-row` is a flex row with `gap: 0.5rem`, `padding: 0.375rem 0.75rem`, and the canonical LCARS half-pill radius `0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0` (flat left edge, rounded right). Minimum height `var(--lcars-btn-height, 2rem)` — meets WCAG 2.5.8 target size (24×24 CSS px) with margin to spare.

Row children, left to right:

| Child | Class | Width | Purpose |
|---|---|---|---|
| State indicator | `.viewport-indicator` | 2px × 1rem | Solid bar — sunflower if open, gray if closed |
| Cover name | `.viewport-name` | `flex: 1`, ellipsis | Friendly name from HA |
| Position | `.viewport-position` | `min-width: 3rem`, right-aligned | "47%" or state text |
| Controls | `.viewport-controls` | `flex-shrink: 0` | Up to three 2rem × 2rem buttons |

### 3.3 Hover / Focus

```css
.viewport-cover-row:hover { background: rgba(255,255,255,0.05); }
.viewport-cover-row:focus-visible {
  outline: 2px solid var(--lcars-ice);
  outline-offset: 2px;
}
```

Ice outline on focus matches the dashboard-wide focus ring convention (see `lcarsFocusRing` in `lcars-styles.js`).

---

## 4. Position Display

### 4.1 Source

`entry.state?.attributes?.current_position` — the standard Home Assistant cover attribute, integer 0–100 where 0 = fully closed, 100 = fully open.

### 4.2 Rendering

```js
const positionText = hasPosition
  ? `${position}%`
  : state.toUpperCase();
```

- If the cover reports `current_position`, display `"47%"`.
- If not (covers without position support, e.g. tilt-only or simple two-state shutters), display the state text uppercased: `OPEN`, `CLOSED`, `OPENING`, `CLOSING`, `STOPPED`, `UNKNOWN`.

The position cell is `font-weight: 700` and right-aligned so the digit column lines up vertically across rows.

### 4.3 No Visual Bar / Gauge

Deliberate. Per §0, the position is plain data — no graphical fill bar, no needle. The button row immediately to the right *is* the control surface; a gauge would be redundant and would force a non-flat visual element (gradient fill or animated transition) that violates the flat-vector rule.

---

## 5. Open / Close / Stop Controls

### 5.1 Feature Detection

The Home Assistant cover `supported_features` bitmask:

| Bit | Constant | Glyph | Service |
|---|---|---|---|
| 1 | `SUPPORT_OPEN` | `▲` | `cover.open_cover` |
| 2 | `SUPPORT_CLOSE` | `▼` | `cover.close_cover` |
| 8 | `SUPPORT_STOP` | `■` | `cover.stop_cover` |

```js
const supportsOpen  = (entry.state?.attributes?.supported_features || 0) & 1;
const supportsClose = (entry.state?.attributes?.supported_features || 0) & 2;
const supportsStop  = (entry.state?.attributes?.supported_features || 0) & 8;
```

A button is rendered only when its bit is set. Visual order is **open → stop → close** (▲ ■ ▼) — vertically symmetric, matches the spatial metaphor of the cover's motion.

### 5.2 Service Call

Each button invokes `this._callService('cover', '<service>', { entity_id: eid })`, inherited from `LcarsBasePanel._callService()`. No optimistic UI; the row re-renders when HA pushes the new state.

### 5.3 Button Style

```css
.viewport-btn {
  width: 2rem; height: 2rem;
  border-radius: var(--lcars-btn-radius);
  background: var(--lcars-sunflower);
  color: var(--lcars-black);
  font-family: var(--lcars-font);
}
.viewport-btn:hover     { filter: brightness(1.15); }
.viewport-btn[data-active] { background: var(--lcars-gold); }
```

- Resting: sunflower fill, black glyph — flat, no gradient, no shadow.
- Hover: `brightness(1.15)` — the canonical LCARS hover treatment per Geordi's design rules (no other transform).
- Active: the **▲** is `data-active` while state is `open`; **▼** is `data-active` while state is `closed`. Active background swaps to `--lcars-gold` per the standard LCARS pressed-state convention.

### 5.4 Click Propagation

The `.viewport-controls` wrapper carries `@click=${(e) => e.stopPropagation()}` so that pressing a button does **not** trigger the row-level more-info handler. Without this, every open/close tap would also pop the more-info dialog.

---

## 6. Audio Cues

All audio routes through `lcarsAudio.play(...)` per the LCARS Audio Grammar. Reference: [`specs/LCARS-AUDIO-SPEC.md`](LCARS-AUDIO-SPEC.md).

| Trigger | Cue Name | Synthesis |
|---|---|---|
| Open / Close / Stop button press | `coverAction` | Triangle wave sweep 400 → 250 Hz, 140ms — descending tone evokes mechanical motion (shutter rolling closed) |
| Row click → more-info | *(none from this panel)* | More-info dialog handles its own audio if applicable |

`coverAction` is also the canonical cue for the lock/cover/blind family in `lcars-audio.js` (`SERVICE_AUDIO.cover = 'coverAction'`), so the viewport panel inherits ecosystem consistency for free.

Per audio rules: synthesized only, ≤1s, ≤0.15 gain, suppressed under `prefers-reduced-motion` (handled centrally in `lcars-audio.js`).

---

## 7. Interactions

| Surface | Pointer | Keyboard | Result |
|---|---|---|---|
| `.viewport-cover-row` | Click | Enter / Space | `showMoreInfo(entity_id)` opens the HA more-info dialog |
| `.viewport-btn` (▲) | Click | Enter / Space (button default) | `coverAction` audio + `cover.open_cover` |
| `.viewport-btn` (■) | Click | Enter / Space | `coverAction` audio + `cover.stop_cover` |
| `.viewport-btn` (▼) | Click | Enter / Space | `coverAction` audio + `cover.close_cover` |

Row keyboard handler:

```js
@keydown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), showMoreInfo(eid))}
```

`preventDefault()` on Space prevents page-scroll while the row has focus.

---

## 8. Accessibility

### 8.1 Roles & Labels

| Element | Role | Label |
|---|---|---|
| `.viewport-content` | `list` | `aria-label="Viewport controls"` |
| `.viewport-cover-row` | `listitem`, `tabindex="0"` | `aria-label="${name}: ${positionText}"` (e.g. *"Living Room Blind: 47%"*) |
| `.viewport-btn` ▲ | (native `button`) | `aria-label="Open ${name}"` |
| `.viewport-btn` ■ | (native `button`) | `aria-label="Stop ${name}"` |
| `.viewport-btn` ▼ | (native `button`) | `aria-label="Close ${name}"` |

The position is announced as part of the row label so screen-reader users hear the current state without separately focusing the position cell.

### 8.2 Keyboard Parity

Every pointer interaction is reachable by Tab and activated by Enter/Space — meets WCAG 2.1.1 (Keyboard, Level A). Tab order follows DOM order: row → its three buttons → next row.

### 8.3 Focus Visibility

`:focus-visible` on rows and buttons applies a 2px ice outline with 2px offset — exceeds WCAG 2.4.7 (Focus Visible, AA) and is on track for 2.4.13 (Focus Appearance, AAA: ≥2px perimeter, 3:1 contrast against panel black).

### 8.4 Target Size

Buttons are 2rem × 2rem (32 × 32 CSS px at default root font-size) and rows are ≥2rem tall — both clear WCAG 2.5.8 (Target Size Minimum, AA: 24 × 24 CSS px).

### 8.5 Contrast

- Sunflower (`#ffcc99`) on black: ≈12:1 — AAA for all text sizes.
- Black glyph on sunflower button: ≈12:1 — AAA.
- Gray (`#666688`) indicator on black: ≈4.7:1 — meets AA non-text contrast (3:1) with margin.

### 8.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .viewport-cover-row,
  .viewport-btn { transition-duration: 0.01ms !important; }
}
```

The only animation in the panel is the hover background fade and button color transition; both collapse to ~0 under reduced motion.

---

## 9. Mobile / Responsive (≤767px)

The panel inherits the dashboard's responsive frame from `LcarsBasePanel`. The cover-row layout requires no special breakpoint:

- `.viewport-name` is `flex: 1` with ellipsis — long names truncate gracefully on narrow widths.
- `.viewport-position` retains its `min-width: 3rem` so the digit column does not collapse.
- `.viewport-controls` is `flex-shrink: 0` so the three buttons are never compressed below 2rem.
- `gap: 0.5rem` between row children and `var(--lcars-gap)` between rows preserve target separation per WCAG 2.5.8.

If the friendly name plus position plus three buttons exceeds the viewport width, the name truncates first — controls and position stay fully visible because they are the actionable affordances.

---

## 10. Performance

- **Render cost**: One flex row per cover. Typical homes have 3–15 covers; render time is negligible.
- **Re-render trigger**: Standard Lit reactive update on `hass` state change. The base panel batches updates; the viewport panel does not subscribe to additional events.
- **Animation budget**: 0 ambient animations. Only transient transitions on hover/focus (background, ≤200ms). Well under the dashboard's "≤6 concurrent steady-state animations" budget.
- **No SVG, no canvas, no images** — pure DOM and CSS. Negligible paint cost.
- **No timers, no `requestAnimationFrame` loops** — fully reactive.

---

## 11. Known Limitations / Future Work

1. **No tilt control** — venetian blinds with slat-tilt support (`SUPPORT_OPEN_TILT`, bits 128/256/512/1024) are not exposed. Today the panel only handles linear position. Future enhancement: an optional secondary row of tilt controls when those bits are present.
2. **No set-position slider** — `cover.set_cover_position` (bit 4) is supported by many devices but the panel offers only open/stop/close. To set 50%, the user must drop into the more-info dialog. A long-press or row-expand affordance to reveal a position slider is a candidate future enhancement, but must be designed within the flat-LCARS aesthetic (no native range input styling).
3. **No grouping by area** — all covers in one flat list. Once cover counts grow past ~15, area grouping (or alphabetical headers) will become necessary. Defer until a real installation hits that threshold.
4. **No batch "all open / all close"** — intentional. Bulk cover operations are usually scene-driven; the panel is per-device control. Revisit only if user research demands it.
5. **`current_position` semantics vary by integration** — most use 0 = closed / 100 = open, but a small number of integrations invert. The panel trusts HA's reported value verbatim. Document for users; do not auto-invert.
6. **No live "moving" indication** — when state is `opening` or `closing`, the position readout shows the textual state until HA updates `current_position`. A subtle moving glyph (within the flat-vector rule) is a candidate future addition; deferred pending audio + visual review.
