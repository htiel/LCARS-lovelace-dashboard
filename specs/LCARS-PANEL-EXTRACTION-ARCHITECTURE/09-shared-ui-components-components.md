## 8. Shared UI Components (`components/`)

### 8.1 Rationale — The Mushroom Pattern

Mushroom's architecture includes shared UI primitives as registered custom elements: `mushroom-slider`, `mushroom-button`, `mushroom-state-info`, etc. These are small, focused components with their own shadow DOM, own styles, and a simple property API. Each card uses them via HTML tags — change the component once, every card updates.

The LCARS monolith has the same pattern, but currently implemented as duplicated inline HTML across panels (31 sensor row blocks, 11 frame blocks, 6 option strips). Extracting these into `components/` achieves:

1. **Single source of truth** — update a control's style once, all panels reflect the change
2. **Consistency enforcement** — impossible for panels to drift apart visually
3. **Reduced panel code** — 8-line inline blocks become single `<lcars-sensor-row>` tags
4. **Accessibility centralized** — ARIA roles, keyboard handlers, focus management in one place

### 8.2 Component Inventory

| Component | Tag | Panels Using | Instances | Lines Saved | Priority |
|---|---|---|---|---|---|
| **Panel Frame** | `<lcars-panel-frame>` | All 10 | 11 | ~480 | P0 |
| **Sensor Row** | `<lcars-sensor-row>` | 10 | 31 | ~248 | P0 |
| **Option Strip** | `<lcars-option-strip>` | 4 (Env, Battery, Climate, Alarm) | 6 | ~90 + unify 79 CSS | P1 |
| **Section Divider** | `<lcars-section-divider>` | 4 (Env, Battery, Climate, Alarm) | 6 | ~16 CSS | P1 |
| **Setpoint Control** | `<lcars-setpoint>` | 2 (Climate, Pool/Spa) | 4 | ~40 | P2 |

**Not extracted as components** (too few callers or power-only):
- `_renderTrackToggle` — 3 callers, all Power panel. Stays as a method on `LcarsBasePanel` or moves to Power panel.
- `_renderClickableValue` — 6 callers, all Power panel. Same — stays as method.
- SVG renderers (arcs, compass) — panel-specific, move with their panel.

### 8.3 Component API Designs

#### `<lcars-panel-frame>`

The frame wraps every panel. The panel only sets its color and provides content via a slot.

```html
<!-- Usage in a panel's render() — called by base class, not subclass -->
<lcars-panel-frame
  .name=${"ECOLOGICS 4500"}
  .frameColor=${"var(--lcars-blue)"}
  .panelCode=${this._generatePanelCode(this.device?.id)}
  .panelType=${"climate"}
>
  <span slot="badge">${badgeHtml}</span>
  <!-- Panel content goes in default slot -->
  ${this.renderContent()}
</lcars-panel-frame>
```

**Properties**: `name` (String), `frameColor` (String), `panelCode` (String), `panelType` (String — used as CSS class for panel-type-specific theming hooks, e.g. `.panel-type-climate`)  
**Slots**: `badge` (optional header badge), default (panel body content)  
**CSS**: ~115 lines — frame border, corner brackets, header bar, panel code display  
**Design invariants** (Geordi U-1, U-2):
- **Thick→Thin** (Bracer Jack Rule 2): Left + bottom borders = 4px, top + right = 2px. This is non-negotiable LCARS canon.
- **Corner brackets** (not elbows): Device panels use squared corner brackets. The sidebar elbows are a separate pattern belonging to the dashboard layout, not panel frames.
- **No pip strip** (U-3): Pips belong on the main dashboard frame, not device panel frames. Removed.

#### `<lcars-sensor-row>`

Replaces 31 inline `device-sensor-line` blocks with a single tag.

```html
<!-- Before: 8 lines of HTML per instance, duplicated 31 times -->
<lcars-sensor-row
  .name=${"Temperature"}
  .value=${"72°F"}
  .icon=${"mdi:thermometer"}
  .color=${"var(--lcars-orange)"}
  .entityId=${"sensor.living_room_temp"}
  ?clickable=${true}
></lcars-sensor-row>
```

**Properties**: `name` (String), `value` (String), `unit` (String), `icon` (String — optional MDI icon, W-1), `color` (String), `entityId` (String), `clickable` (Boolean)  
**Events**: `lcars-sensor-click` (detail: { entityId }) — prefixed per W-4. Component handles its own click dispatch when `clickable` is true (N2 — component-managed pattern).  
**Accessibility** (N-1, N-4):
- When `clickable`: `role="button"`, `tabindex="0"`, `min-height: 1.5rem` touch target
- When read-only: no role, no tabindex — just display  
**CSS**: ~40 lines — indicator dot, label, value display, hover/focus states

#### `<lcars-option-strip>`

Unifies 3 CSS variants (option buttons, climate mode, alarm arm) into one component.

```html
<lcars-option-strip
  .options=${[
    {value: 'heat', label: 'HEAT'},
    {value: 'cool', label: 'COOL'},
    {value: 'off', label: 'OFF', disabled: true},
  ]}
  .value=${"heat"}
  .label=${"HVAC MODE"}
  .accentColor=${"var(--lcars-orange)"}
  @lcars-option-changed=${(e) => this._handleClimateMode(entityId, e.detail.value)}
></lcars-option-strip>
```

**Properties**: `options` (Array<{value, label, disabled?}>), `value` (String), `label` (String — container aria-label, N-3), `accentColor` (String)  
**Events**: `lcars-option-changed` (detail: { value }) — prefixed per W-4  
**Accessibility** (N-3, N3, N-8):
- Container: `role="radiogroup"`, `aria-label` set from `label` property
- Buttons: `role="radio"`, `aria-checked`, `aria-disabled` for disabled options (W-2)
- Keyboard: Roving tabindex — Arrow keys move focus + selection, only active option is in tab order (N3)
- Visual: LCARS pill shape with border-radius matching TheLCARS.com spec (Geordi N-8)

#### `<lcars-section-divider>`

Simple horizontal separator with optional label.

```html
<lcars-section-divider label="DIAGNOSTICS"></lcars-section-divider>
```

**Properties**: `label` (String, optional)

#### `<lcars-setpoint>`

Temperature/value adjustment control with −/+ buttons.

```html
<lcars-setpoint
  .value=${72}
  .step=${0.5}
  .min=${60}
  .max=${90}
  .unit=${"°F"}
  .label=${"HEAT 72°"}
  .color=${"var(--lcars-orange)"}
  @lcars-setpoint-changed=${(e) => this._handleSetpoint(entityId, e.detail.value)}
></lcars-setpoint>
```

**Properties**: `value` (Number), `step` (Number), `min`/`max` (Number), `unit` (String — W-3: °F, °C, %, etc.), `label` (String), `color` (String)  
**Events**: `lcars-setpoint-changed` (detail: { value }) — prefixed per W-4  
**Accessibility** (N-2): `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` on the control group. −/+ buttons have explicit `aria-label` ("Decrease/Increase target temperature")

### 8.4 CSS Ownership

Components own their CSS in their shadow DOM. This means:

- **Panel frame CSS** moves from Tier 2 (`panelFrameStyles`) into `<lcars-panel-frame>` — the frame is now a component, not base class CSS
- **Sensor row CSS** moves from the monolith into `<lcars-sensor-row>` — no longer duplicated across panels
- **Option strip CSS** — 3 variants unified into 1 component stylesheet
- Panels no longer need to include frame or sensor CSS — they just use the tags

The **3-tier model** becomes:

```
Tier 1: lcars-styles.js (lcarsBaseStyles) — tokens, colors, typography
Tier 2: components/ — shared UI primitives with own shadow DOM + styles
Tier 3: panels/*/styles — panel-specific CSS only (content layout, unique elements)
```

### 8.5 Extraction Timing (YAGNI-Aligned)

Components are extracted **when first needed** — not all upfront:

1. **Phase 0 (Foundation)**: Create `<lcars-panel-frame>` + `<lcars-sensor-row>` — used by ALL panels
2. **Phase 1 (Irrigation)**: First panel to USE them — proving the pattern
3. **Phase 4 (Environment)**: Create `<lcars-option-strip>` + `<lcars-section-divider>` — first panel that needs them
4. **Phase 6 (Pool/Spa) or Phase 8 (Climate)**: Create `<lcars-setpoint>` — first panel with +/− controls

This YAGNI approach (Data N4) reduces Phase 0 scope from 5 components to 2, getting to the first real panel extraction faster.

### 8.6 CSS Custom Property Theming Contract (N-5)

Components expose theming hooks via CSS custom properties. Panels set these on the component tag to control appearance without piercing shadow DOM:

```css
/* Example: panel overrides component color */
lcars-sensor-row {
  --lcars-sensor-dot-color: var(--lcars-orange);
  --lcars-sensor-hover-bg: var(--lcars-card-bg-color);
}
lcars-panel-frame {
  --lcars-frame-border-color: var(--lcars-blue);
}
```

Each component documents its custom property API in its styles file. This is the ONLY way panels may customize component appearance.

### 8.7 Entity ID Validation (Worf ADV-1)

All components that accept `entityId` must validate the format before use:

```js
_validateEntityId(id) {
  return typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id);
}
```

Invalid entity IDs are logged and ignored — never passed to `hass.states[]` or service calls.

### 8.8 Animation Distribution Matrix (Geordi X-2)

When panels are extracted, CSS animations must transfer to the correct owner. This matrix tracks every animation and its post-extraction destination:

| Animation | Current Selector | Post-Extraction Owner | New Selector |
|---|---|---|---|
| `lcars-cascade-in` | `.content-area-panel .lcars-device-panel` | Orchestrator | Element tag selectors or shared attribute |
| `lcars-heartbeat` | `.climate-panel[data-heat/cool]` | Climate panel | `:host([data-heat]), :host([data-cool])` |
| `lcars-heartbeat` | `.toggle-pill[data-on]`, `.media-strip:not([data-off])` | Orchestrator (domain) | Unchanged |
| `lcars-distress` | `.sensor-readout[data-off]`, `.toggle-pill[data-off]` | Orchestrator (domain) | Unchanged |
| `viewscreen-activate` | `.device-panel-media img` | Camera panel | Same, inside shadow DOM |
| `panel-distress` | `.lcars-device-panel:has(.device-panel-media[data-offline])` | Camera panel | `:host(:has(...))` |
| Cascade stagger | `animation-delay: calc(var(--i) * 40ms)` | Orchestrator sets `--i` on panel element | `style="--i: ${index}"` |
| `prefers-reduced-motion` | All above | Split per owner | Each owner adds `:host` overrides |

**Rule**: Every phase PR includes an "Animation Migration" checklist item verifying that all animations for that panel transfer correctly and `prefers-reduced-motion` overrides are present in the new owner.

---
