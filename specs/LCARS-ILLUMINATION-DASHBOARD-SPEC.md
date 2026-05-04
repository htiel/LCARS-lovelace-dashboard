# LCARS Illumination Dashboard Spec (5X-2.5)

> Illumination — all lighting devices (light entities + lighting circuits) across the site.
> Frame color: `--lcars-sunflower` (#ffcc99). Sidebar panel + bottom elbow + footer bar: `--lcars-african-violet` (#cc99ff).
> Filters: ALL DEVICES / LIGHTS / CIRCUITS
> **Updated**: 2026-05-03 — current as of v5.1.0-beta.38. Capability-tiered device classification (Type A/B/C/D) shipped in v5.0.0-beta.12; mobile sidebar narrowed-but-vertical ruling in v5.1.0-beta.37 (Geordi-canon, no horizontal flip).

Source files (truth):
- [custom_components/lcars_dashboard/js/src/lcars-illumination-layout.js](custom_components/lcars_dashboard/js/src/lcars-illumination-layout.js) — frame + sidebar + filter pills (`LcarsIlluminationLayout`)
- [custom_components/lcars_dashboard/js/src/lcars-illumination-card.js](custom_components/lcars_dashboard/js/src/lcars-illumination-card.js) — orchestrator (`LcarsIlluminationCard`)
- [custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel.js](custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel.js) — per-area device renderer (`LcarsIlluminationPanel`)
- [custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel-styles.js](custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel-styles.js)
- [custom_components/lcars_dashboard/js/src/lcars-styles.js](custom_components/lcars_dashboard/js/src/lcars-styles.js)

Cross-references: [LCARS-UI-ARCHITECTURE.md](specs/LCARS-UI-ARCHITECTURE.md) · [LCARS-AUDIO-SPEC.md](specs/LCARS-AUDIO-SPEC.md) · [LCARS-ENGINEERING-DASHBOARD-SPEC.md](specs/LCARS-ENGINEERING-DASHBOARD-SPEC.md) (label-override pattern)

---

## §1 Entity Scope

| Domain | Inclusion Rule | Notes |
|--------|---------------|-------|
| `light` | All entities passing `isLightingEntity()` (excludes infrastructure LEDs) | Always Type A/B/C — see §4 |
| `switch` | Lighting circuits only — name/entity_id matches `light\|lamp\|sconce\|chandelier\|pendant\|fixture\|dimmer\|illuminat` regex; `device_class: outlet` excluded | Type D |
| `switch` (Insteon) | All Insteon platform switches treated as lighting (4X-51) | Type D |
| `input_boolean` | Same name regex as `switch` | Type D |
| `scene` | Always included | Rendered as scene pills in area header |

**Exclusions** (`isInfrastructureLED()` + `LIGHTING_NEGATIVE_RE` in `lcars-entity-utils.js`): status LEDs, "indicator" naming, outlet-class switches, diagnostic entities (`isDiagnosticEntity()` in `lcars-illumination-card.js#_resolveAreaEntities`).

**Label-override pattern**: per-entity area-prefix stripping in `LcarsIlluminationPanel#_shortName()` — strips `area.name` (and possessive form) from `friendly_name`, then `UPPERCASE`. Same pattern as Engineering spec §3 device label normalization.

Entity classifiers (all from [lcars-entity-utils.js](custom_components/lcars_dashboard/js/src/lcars-entity-utils.js)):
- `isLightingEntity(entry)` — gate predicate (line 516)
- `classifyLightType(state)` — returns `'onoff' | 'dimmer' | 'full'` from `supported_color_modes` + `effect_list` (line 539)
- `classifyDevice(devEntries)` — claims multi-entity devices for circuit grouping
- `isDiagnosticEntity(entry)` — filtered out before partition

---

## §2 Layout Structure

Same elbow + sidebar + content + footer LCARS frame as `lcars-dashboard-layout.js`, but the sidebar contains **3 filter tabs** instead of area navigation. Frame color is `--lcars-sunflower` (top elbow + header bar + endcap). Bottom elbow + footer bar + endcap are `--lcars-african-violet`.

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow:sunflower]  SITE NAME ═══════════════ [🔇][⚙]   │
├──────────┬───────────────────────────────────────────────┤
│ Illumin- │  GROUND FLOOR ════════════════════           │
│ ation    │  KITCHEN ──────── [SCENE-1][SCENE-2] [ALL ON]│
│          │   ┌──────────┐  ┌─────────┐                  │
│ ┌──────┐ │   │ COUNTER  │  │ ISLAND  │  (Type B/C —    │
│ │ ALL  │ │   │ DIM 65%  │  │ RGB 80% │   complex left) │
│ │ DEV  │ │   │ [▓▓▓▓░░] │  │ [▓▓▓▓▓░]│                 │
│ ├──────┤ │   │ [ON/OFF] │  │ presets │  ┌─────────┐    │
│ │LIGHT │ │   └──────────┘  └─────────┘  │ PANTRY  │    │
│ │      │ │                               │   ON    │    │
│ ├──────┤ │   ─── CIRCUITS ─────────────  └─────────┘    │
│ │CIRCT │ │   ┌──────────┐  ┌─────────┐  (Type A —      │
│ │      │ │   │ SCONCES  │  │ FAN LT  │   simple right) │
│ ├──────┤ │   │   ON     │  │   OFF   │                  │
│ │filler│ │   └──────────┘  └─────────┘                  │
│ │ gray │ │                                              │
├──────────┤  ── LCARS 5.1.0-BETA.38 ═══════════════      │
│ [Elbow:violet]                                           │
└──────────┴───────────────────────────────────────────────┘
```

Hierarchy renderer (`LcarsIlluminationCard#render`):
1. `getFloors(hass)` + `getAreasByFloor(hass)` group areas by floor; orphan areas (no floor) appended last.
2. Floor header: `.ilm-floor-header` — name in `--lcars-ice` 1.25rem + horizontal swept bar (rounded right).
3. Per-area section `.ilm-area-section`:
   - `.ilm-area-header`: area name (sunflower) + thin underline + scene pill strip + master toggle pill (`ALL ON`/`ALL OFF`).
   - `<lcars-illumination-panel>` — no panel frame (per panel-extraction architecture, dashboard mode skips `<lcars-panel-frame>` wrap; see panel `render()` `if (this.group)` branch).

---

## §3 Filter Pills

Three vertical sidebar tabs in `LcarsIlluminationLayout` (`role="tablist"`, each button `role="tab"` + `aria-selected`):

| Filter constant | Label | Behavior |
|----------------|-------|----------|
| `FILTER_ALL` (`'all'`) | `ALL DEVICES` | Lights + circuits + scenes |
| `FILTER_LIGHTS` (`'lights'`) | `LIGHTS` | `domain === 'light'` + scenes |
| `FILTER_CIRCUITS` (`'circuits'`) | `CIRCUITS` | Lighting switches/input_booleans only — no scenes |

Filter state is broadcast via `lcarsEventBus` `CustomEvent('lcars-ilm-filter', { detail: { filter } })`. The card listens in `connectedCallback()` and re-renders. The layout also pushes `card.filter` directly when `hass` is set, covering the initial mount race.

Active state: `background: var(--lcars-gold, #ffaa00)`. Inactive: `--lcars-african-violet`. Pill shape: `border-radius: var(--lcars-btn-radius) 0 0 var(--lcars-btn-radius)` (rounded-left, flat-right — connects into the LCARS sweep).

Audio: `lcarsAudio.play('navAcknowledge')` on each filter change (`_setFilter`).

---

## §4 Device Capability Classification

Per-light tier from `classifyLightType(state)` (entity-utils.js):

| Type | Trigger | Renderer | Section |
|------|---------|----------|---------|
| **A — onoff** | `supported_color_modes` empty OR `['onoff']` only | `_renderOnOffPill()` | §5 |
| **B — dimmer** | `supported_color_modes` present, no color modes, no effects | `_renderDimmer()` | §6 |
| **C — full** | Includes `hs`/`rgb`/`xy` color mode OR non-empty `effect_list` | `_renderFullLight()` | §7 |
| **D — circuit** | Domain ≠ `light` (switch / input_boolean / Insteon) — passed `isLightingEntity()` | `_renderCircuitPill()` | §8 |

Sub-partition in `LcarsIlluminationPanel#render()`:
- `complexLights` = Type B + Type C → left column `.ilm-complex` (flex-grow grid, `repeat(auto-fill, minmax(min(18rem,100%),1fr))`).
- `simpleLights` = Type A → right column `.ilm-simple-group` (vertical stack, 10–14 rem, 1px violet-gray left rule).
- `circuits` = Type D → below a `.ilm-section-divider` labeled `CIRCUITS`.

Per-area device order is persisted in `localStorage` under key `lcars-ilm-order-<area_id>` (`_getOrderKey()`); reorder is exposed only in edit mode (`lcars-ilm-edit` event from layout cog button).

---

## §5 Type A — Simple Pill Button (onoff)

Class `.ilm-pill`, full-width (`width:100%`), 3rem high, left-aligned text:

| Element | Style |
|--------|-------|
| Shape | `border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0` (flat-left swept-right, slots into the area divider) |
| ON background | `--lcars-sunflower` |
| OFF background | `--lcars-gray` + `animation: standbyPulse 4s ease-in-out infinite` (opacity 0.5 ↔ 0.65) |
| Active press | `--lcars-gold` |
| Hover | `filter: brightness(1.2)` |
| Focus-visible | `2px solid --lcars-ice`, 2px offset |

Layout: `[indicator strip 3×20px][name (ellipsis)][state ON/OFF tabular-nums]`. ARIA: `aria-pressed` + descriptive `aria-label="<NAME> — ON|OFF"`. Right-click → `showMoreInfo()`.

`prefers-reduced-motion`: `standbyPulse` disabled; static `opacity: 0.55`.

---

## §6 Type B — Dimmer (Slider + Compact Pill)

Container `.ilm-dimmer` — bordered card (`1px solid rgba(255,204,153,0.15)`, `0.5rem` radius, `0.375rem` padding):

1. **Header row** `.ilm-dimmer__header`:
   - Name (sunflower 0.875rem, ellipsis)
   - `.ilm-type-badge` reading `DIM` (gray 0.625rem)
   - Value: `{pct}%` or `OFF` (sunflower, tabular-nums, right-aligned)
2. **`<lcars-slider>`** (custom component) — `min="1" max="100" step="1"`:
   - `color` = result of `_getBarColor(state)` — color-temp-aware (butterscotch < 3250K, sunflower mid, ice > 5500K), color-mode-aware via `_hueToLcarsColor()` (8 hue bands → palette tokens), gray when off.
   - `@lcars-slider-input` → debounced via `createDebouncer(..., 300ms)` calling `light.turn_on { brightness }`.
   - `@lcars-slider-change` → immediate `_setBrightness()` for keyboard/end-of-drag commit.
   - Brightness clamped via `clampValue(pct, 1, 100)` then converted `pct/100*255`.
3. **Compact ON/OFF pill** `.ilm-pill.compact` — 2rem high, fully rounded both sides, `aria-pressed`.

---

## §7 Type C — Full-Featured Light (Slider + Color/Effect)

Container `.ilm-full` — same as Type B plus `border-left: 4px solid var(--lcars-gold)` accent rail (denotes "full capability"):

1. **Header**: name + `.ilm-type-badge.full` reading `RGB` (when color modes present) or `FX` (when only effect_list). Gold text.
2. **Brightness slider** — identical to Type B.
3. **Controls row** `.ilm-full__controls` (flex-wrap):
   - Compact ON/OFF pill (same as Type B).
   - **`.ilm-color-presets`** (when `hs`/`rgb`/`xy` supported) — six fixed presets from `LcarsIlluminationPanel.COLOR_PRESETS`:

     | Name | hs | Token |
     |------|------|-------|
     | WARM | `[30,80]` | `--lcars-butterscotch` |
     | COOL | `[210,20]` | `--lcars-ice` |
     | RED | `[0,100]` | `--lcars-tomato` |
     | GREEN | `[120,100]` | `--lcars-green` (#66bb6a) |
     | BLUE | `[240,100]` | `--lcars-bluey` |
     | PURPLE | `[280,80]` | `--lcars-lilac` |

     Inactive opacity 0.45, active 1.0. Active match: `_isActivePreset()` accepts ±20° hue tolerance (wrap-aware). Click → `light.turn_on { hs_color }`. ARIA `aria-pressed` per button.

   - **`.ilm-fx-toggle`** (when `effect_list.length > 0`) — disclosure button `▸ {n} EFFECTS` / `▾ {n} EFFECTS`, `aria-expanded`. Expanded → `.ilm-effect-strip` of `.ilm-effect-btn` pills, first being `SOLID` (`effect: 'none'`), each effect uppercased; active = `--lcars-gold`.

Effect activation rate-limit: `_sceneRateLimiter = createRateLimiter(3, 5000)` is reserved for scene activation; effects use direct `light.turn_on { effect }` (no extra throttle).

---

## §8 Type D — Switch Toggle Pill (Circuit)

Class `.ilm-pill.circuit`:

| Element | Style |
|--------|-------|
| ON background | `--lcars-almond-creme` (#ffbbaa) — distinct hue from Type A sunflower for at-a-glance domain disambiguation |
| OFF background | `--lcars-gray` + `standbyPulse` |
| Shape, focus, motion-reduce | Identical to Type A |
| Service call | `homeassistant.toggle` via domain-routed `_callService(domain, 'toggle', ...)` |

Lives below a `.ilm-section-divider` labelled `CIRCUITS` whenever both lights and circuits are present in the same area.

---

## §9 Area Sectioning

**No panel frame in dashboard mode.** Devices render directly under the `.ilm-area-header` (vs. Habitat mode which wraps in `<lcars-panel-frame>`). Dashboard-mode is detected by absence of `this.group` in `LcarsIlluminationPanel#render()`.

Area header composition (in `LcarsIlluminationCard`):
- **Area name** — sunflower 1.25rem uppercase, letter-spacing 0.05em.
- **`.ilm-area-line`** — 2px sunflower underline at 0.3 opacity (data-bar callout, not decorative).
- **Scene strip** `_renderScenePills()` — horizontally scrolling row of `.ilm-scene-pill` (sunflower bg, black text, 2rem high). Click → `scene.turn_on` + `lcarsAudio.play('scriptFire')`. Names have area-prefix stripped against `hass.areas`.
- **Master toggle** `_renderMasterToggle()` — `.ilm-master-btn` reading `ALL ON`/`ALL OFF`. Computes state via `_getAreaLightState()` (`'on'|'off'|'mixed'|'empty'`); `mixed` is treated as ON (so press turns OFF). Excludes scenes from toggle set. Audio: `lightToggle` when turning on, `switchToggle` when turning off.

Empty state: `<div class="ilm-empty">NO LIGHTING DEVICES DETECTED</div>` rendered when `floorGroups.length === 0`.

---

## §10 Mobile Responsive

**Geordi-canon ruling (v5.1.0-beta.37 QA fix)**: the LCARS sweep is preserved on mobile. The sidebar **stays vertical** — it does NOT flip to a horizontal nav. Instead, the entire left column narrows to one elbow unit. This matches PADD-canon and keeps the sweep intact (Bracer Jack: "The LCARS Swept IS LCARS").

Single `@media (max-width: 767px)` block in `lcars-illumination-layout.js`:

```css
:host {
  --lcars-sidebar-w: 5.5rem;   /* narrowed from 12rem */
  --lcars-elbow-w:   5rem;     /* narrowed from 9.5rem */
  --lcars-elbow-h:   3rem;     /* narrowed from 4.5rem */
  --lcars-elbow-radius: 2.25rem;
}
.lcars-header-title { font-size: 1.25rem; padding: 0 0.5rem; }
.lcars-sidebar-panel { font-size: 0.625rem; padding: 0.125rem 0.25rem; text-align: center; }
.filter-label       { font-size: 0.75rem; letter-spacing: 0.04em; }
.sidebar-filter-btn { padding: 0.25rem 0.125rem; }
.lcars-content      { padding: 0.25rem; }
.mute-btn ha-icon   { --mdc-icon-size: 14px; }
```

Content-side responsiveness inherits from the panel grid (`repeat(auto-fill, minmax(min(18rem,100%),1fr))`) — single-column on narrow viewports without a media query. The Type B/C bordered cards remain full-width when wrapped.

> Prior approach (filter pills as a horizontal nav row above content) was explicitly rejected by Geordi in beta.37 review — flipping the sweep violates the LCARS layout grammar.

---

## §11 Audio Cues

Per [LCARS-AUDIO-SPEC.md](specs/LCARS-AUDIO-SPEC.md). All sounds are Web Audio synthesized; respect `prefers-reduced-motion` (audio module suppresses non-critical sounds).

| Trigger | Sound |
|---------|-------|
| Filter pill (sidebar) | `navAcknowledge` |
| On/off pill (Type A) | `lcarsAudio.playForEntity(eid)` — domain-routed (light entities → `lightToggle`, switches → `switchToggle`) |
| Compact pill (Type B/C) | Same as above |
| Circuit pill (Type D) | Same as above |
| Brightness slider drag (debounced) | `climateAdjust` (re-used for any analog adjustment) |
| Color preset / effect select / clear | `lightToggle` |
| Scene pill | `scriptFire` |
| Master `ALL ON`/`ALL OFF` | `lightToggle` (turning on) / `switchToggle` (turning off) |
| Mute toggle (header) | `lcarsAudio.toggle()` |

No sound is the sole feedback — every interactive element carries visual state change (color, opacity, ARIA pressed/expanded).

---

## §12 Accessibility

- **Roles**: sidebar `role="tablist"`, each filter `role="tab"` + `aria-selected`. Content `<main id="lcars-main-content" aria-label="Illumination dashboard">`. Color/effect groups `role="group"` with `aria-label`.
- **Keyboard parity**:
  - All pills are real `<button>` elements — `Enter`/`Space` activate.
  - `<lcars-slider>` (custom component) implements arrow-key increment/decrement and Home/End per WebAIM slider pattern; `@lcars-slider-change` fires on keyboard commit so brightness applies without mouse drag.
  - Effect disclosure uses `aria-expanded`.
  - Edit-mode drag handle uses `pointerdown`/`pointermove` only — drag-and-drop reorder has **no keyboard alternative yet** (see §14).
- **Focus indicator**: every interactive element defines `:focus-visible { outline: 2px solid var(--lcars-ice); outline-offset: 2px; }` — meets WCAG 2.4.13 (2 CSS px, 3:1+ contrast vs sunflower/violet/gold).
- **Naming**: every pill has explicit `aria-label` ("`<NAME> — ON|OFF`", "Activate `<scene>` scene", "Toggle all lights in `<area>`"). Color presets read "Set warm color", etc.
- **Contrast**: Black text on sunflower = 13.1:1, on almond-creme ≥ 11:1, on african-violet ≥ 7:1, on gold = 11:1 — all AAA. Space-white on gray = 6.8:1 (AA). 
- **Reduced motion**: `standbyPulse` disabled (replaced with static 0.55 opacity).
- **Touch targets**: pills 3rem (48px) tall; compact pills 2rem (32px) wide-enough; color presets 1.5rem fail WCAG 2.5.8 alone but are spaced ≥ 0.125rem in a non-target-dense pattern (see §14).

---

## §13 Performance Notes

- **Entity cache**: `LcarsIlluminationCard#_entityCache = new Map()` cleared on each `hass` set (full re-resolve per HA state push). For large installs, this is the dominant cost — `getAreaEntities()` is the inner loop.
- **Brightness debounce**: `createDebouncer(..., 300ms)` collapses slider drag traffic to ≤ 1 service call per 300ms; `_setBrightness` (commit) bypasses debouncer.
- **Scene rate-limit**: `createRateLimiter(3, 5000)` — max 3 scene activations per 5 s window (`_activateScene`).
- **Drag reorder persistence**: `localStorage` only — no HA round-trip. Per-area key, JSON array of entity IDs.
- **No timers / no polling** — purely state-driven re-render (Lit `requestUpdate`).
- **Render optimization**: per-area `_resolveAreaEntities()` returns `null` for areas with zero lighting → skipped entirely. Filter visibility check (`_getFilteredEntities() !== null`) prevents empty area headers under non-`ALL` filters.
- **Animation budget**: only `standbyPulse` runs on OFF pills (paint-triggered opacity). Within Geordi animation budget (≤6 concurrent steady-state).

---

## §14 Known Limitations / Future Work

| Item | Status | Notes |
|------|--------|-------|
| Keyboard alternative for drag-reorder | **Open** — WCAG 2.5.7 (Dragging Movements, AA) requires a single-pointer alternative. Edit mode currently exposes drag handles only. Add up/down arrow buttons in edit mode. |
| Color preset target size | Tracked — 1.5rem buttons are below WCAG 2.5.8 minimum (24×24 CSS px ≈ 1.5rem at 16px root). Consider 2rem on mobile. |
| Color picker beyond 6 presets | Future — currently no continuous hue control; relies on `showMoreInfo()` (right-click) for full HA color wheel. |
| `--lcars-green` token | Currently inlined as `#66bb6a` fallback in `_hueToLcarsColor()` and `COLOR_PRESETS`. Promote to canonical theme token if green becomes a frame color elsewhere. |
| Floor ordering | Inherits HA `getFloors()` order; no LCARS-side override. |
| Scene name area-stripping | Falls back to full `friendly_name` on unmatched prefix — non-area-named scenes show with full label (acceptable). |
| Multi-page virtualization | Not implemented; all areas render eagerly. Acceptable up to ~50 areas, may need windowing beyond that (Data: monitor at 90% threshold). |
| Mute icon for layout filter pills | Current pills don't audibly distinguish active vs. inactive selection — `navAcknowledge` plays once on change, no per-pill sound. Sufficient. |
| Sidebar reorder dialog | Admin-only `<lcars-sidebar-reorder>` mounted via `_openSidebarReorder()`; UX is shared across all dashboards. |
