# LCARS Habitat Dashboard Spec (5X-2.1)

> Habitat — the omnibus dashboard. Per-area device panels for everything that doesn't ship to a specialty dashboard.
> Frame color: `--lcars-butterscotch` (#ff9966) (header + top elbow); footer + sidebar + bottom elbow: `--lcars-african-violet` (#cc99ff).
> Sidebar: floor-grouped HA Areas (lilac floor headers, violet area buttons).
> Filters: Area selection (single-select); Floor selection (overrides area).
> **Updated**: 2026-05-03 — current as of v5.1.0-beta.38. Floor grouping shipped earlier in 5.x; mobile narrow-frame ruling shipped in v5.1.0-beta.36; icon-only mobile sidebar (Captain's call, closes #94) shipped in v5.1.0-beta.38.

Cross-reference: [LCARS-UI-ARCHITECTURE.md](LCARS-UI-ARCHITECTURE.md), [LCARS-PANEL-EXTRACTION-ARCHITECTURE.md](LCARS-PANEL-EXTRACTION-ARCHITECTURE.md), [LCARS-AUDIO-SPEC.md](LCARS-AUDIO-SPEC.md).

---

## §1 Entity Scope

Habitat is the **omnibus**: it ingests every entity in the selected HA Area and dispatches each device-group to a per-domain LCARS panel. Specialty dashboards (Engineering, Life Support, Tactical, Cetacean Ops, Illumination) consume their own scoped entity sets; Habitat keeps everything else.

| Domain / Classifier | Routed Panel | Source |
|---|---|---|
| `camera` | `<lcars-camera-panel>` (`PANEL_TYPE_CAMERA`) | [lcars-entity-utils.js](custom_components/lcars_dashboard/js/src/lcars-entity-utils.js) `CAMERA_DOMAINS` |
| `climate` (`isClimateEntity`) | `<lcars-climate-panel>` (`PANEL_TYPE_CLIMATE`) | `CLIMATE_DOMAINS` |
| `media_player` | `<lcars-media-panel>` (`PANEL_TYPE_MEDIA`) | `MEDIA_DOMAINS` |
| `alarm_control_panel` | `<lcars-alarm-panel>` (`PANEL_TYPE_ALARM`) — subsumed by tactical | `ALARM_DOMAINS` |
| `weather` | `<lcars-weather-panel>` (`PANEL_TYPE_WEATHER`) | `WEATHER_DOMAINS` |
| Pool/spa devices (`screenlogic`, `iaqualink`, `waterguru`, `pentair`, `poolmath`) | `<lcars-pool-spa-panel>` (`PANEL_TYPE_AQUATICS`) | platform map |
| Irrigation device class / suffix | `<lcars-irrigation-panel>` (`PANEL_TYPE_IRRIGATION`) | `AQ_DEVICE_CLASSES`, `AQ_ENTITY_SUFFIX_RE` |
| Battery devices | `<lcars-battery-panel>` (`PANEL_TYPE_BATTERY`) | classifier in `lcars-entity-utils.js` |
| Lights / `isLightingEntity` | `<lcars-illumination-panel>` (`PANEL_TYPE_ILLUMINATION`) | `isLightingEntity()` |
| `cover` / `isViewportEntity` | `<lcars-viewport-panel>` (`PANEL_TYPE_VIEWPORT`) | `isViewportEntity()` |
| Smoke/CO/heat (`isHazardEntity`) | `<lcars-hazard-panel>` (`PANEL_TYPE_HAZARD`) | classifier |
| Smart appliances (galley) | `<lcars-galley-panel>` (`PANEL_TYPE_GALLEY`) | classifier |
| EV chargers | `<lcars-ev-charger-panel>` (`PANEL_TYPE_EV_CHARGER`) | classifier |
| Environment sensors (`isEnvironmentEntity`, `isAmbientSensor`) | `<lcars-environment-panel>` (`PANEL_TYPE_ENVIRONMENT`) | classifier |
| Tactical (`isTacticalEntity`) | `<lcars-tactical-panel>` (`PANEL_TYPE_TACTICAL`) — subsumes alarm | classifier |
| Power-grouped sensors | `<lcars-power-panel>` (`PANEL_TYPE_POWER`) | classifier |
| Toggleable (`switch`/`fan`/`lock`/`script`) | LCARS toggle pill | `TOGGLE_DOMAINS` |
| Sensors / binary sensors | data readout bar | `SENSOR_DOMAINS` |
| Default | LCARS button | — |
| `SUPPRESS_DOMAINS` | (not rendered) | exclusion set |
| `isDiagnosticEntity` | (filtered to device sub-panels) | — |

Routing logic lives in `groupEntities()` ([lcars-entity-query.js](custom_components/lcars_dashboard/js/src/lcars-entity-query.js)) and is dispatched via `PANEL_TAG_REGISTRY` in [lcars-homepage-card.js](custom_components/lcars_dashboard/js/src/lcars-homepage-card.js).

---

## §2 Layout Structure (v5.1.0)

Implemented in [lcars-dashboard-layout.js](custom_components/lcars_dashboard/js/src/lcars-dashboard-layout.js) — the **canonical** LCARS frame; Engineering/LifeSupport/Tactical/Cetacean/Illumination layouts are derivatives.

```
┌──────────────────────────────────────────────────────────┐
│ [Elbow butterscotch]  SITE NAME ════ [🔇][⇅][⚙]       │  ← top row
├──────────┬───────────────────────────────────────────────┤
│ AREAS    │  <lcars-homepage-card>                       │
│ ┌──────┐ │   per-area panels stacked in 1-2 columns     │
│ │ ⌂ 1F │ │   (left/right column assigned by             │
│ ├──────┤ │   PANEL_COLUMN map)                          │
│ │KITCHN│ │                                              │
│ │LIVING│ │                                              │
│ ├──────┤ │                                              │
│ │ ⌂ 2F │ │                                              │
│ ├──────┤ │                                              │
│ │BEDRM │ │                                              │
│ │OFFICE│ │                                              │
│ ├──────┤ │                                              │
│ │UNASSN│ │                                              │
│ │GARAGE│ │                                              │
│ ├──────┤ │                                              │
│ │▓▓▓▓▓▓│ │                                              │
│ │filler│ │                                              │
├──────────┤───────────────────────────────────────────────┤
│ [Elbow violet]  ═══ LCARS 5.1.0-BETA.38 ═══════         │  ← bottom row
└──────────┴───────────────────────────────────────────────┘
```

### §2.1 Frame Tokens
From [lcars-styles.js](custom_components/lcars_dashboard/js/src/lcars-styles.js):
- `--lcars-elbow-top` = butterscotch
- `--lcars-header-bar` = butterscotch
- `--lcars-elbow-bottom` = african-violet
- `--lcars-footer-bar` = african-violet
- `--lcars-sidebar-bg` = african-violet
- `--lcars-dash-habitat` = butterscotch (wayfinding token)

CSS Grid: `grid-template-columns: var(--lcars-sidebar-w) 1fr;` and `grid-template-rows: var(--lcars-elbow-h) 1fr var(--lcars-elbow-h);` with `gap: var(--lcars-gap)`.

### §2.2 Header Region
- Top-left elbow: butterscotch arc; **long-press (800ms)** triggers admin Edit Mode (`_handleElbowPointerDown`)
- Header title: site name from `hass.config.location_name` (fallback `window.location.hostname`); editable by clicking when in edit mode (`_editHeaderTitle` → `lcars-edit-homepage-header-card`)
- Header endcap buttons (right side):
  - Mute toggle (`mdi:volume-high` / `mdi:volume-off`) — `role="switch"`, `aria-checked`
  - Sort variant (`mdi:sort-variant`, admin only) — opens `<lcars-sidebar-reorder>` to reorder dashboards in the HA sidebar
  - Cog (`mdi:cog-outline`, admin only) — toggles edit mode; `aria-pressed` reflects state

### §2.3 Content Region
Renders `<lcars-homepage-card>`. The card subscribes to `lcars-area-selected` / `lcars-floor-selected` events from the layout via `lcarsEventBus` and re-renders.

### §2.4 Footer
- Bottom-left elbow: african-violet
- Footer bar: african-violet, ends in a flush rectangular endcap (no rounded terminator on this dashboard's frame end)
- Footer text: `LCARS {VERSION}` in `--lcars-sky` on the bar

### §2.5 Edit-Mode Visual State
When `_editMode === true`, the frame elbow + header bar + header endcap all switch to `--lcars-lilac` (`:host([edit-mode])`). The header title appends `· CONFIGURATION MODE`.

---

## §3 Sidebar — Floor-Grouped Area Navigation

The Habitat sidebar is unique among dashboards: areas are **grouped by HA Floor** with clickable floor headers.

### §3.1 Grouping Algorithm — `_getAreasGroupedByFloor()`
1. Read `Object.values(hass.areas)` and `Object.values(hass.floors)`.
2. Build a floor-keyed Map; bucket each area into its `area.floor_id`.
3. Areas with no floor or an unknown floor go into a separate `unassigned` bucket.
4. Sort floors by ascending `level` (default 99), then alphabetically by name.
5. Drop empty floors. Append `unassigned` last (rendered under a `UNASSIGNED` label in `--lcars-sky`).

### §3.2 Floor Header Buttons (`.sidebar-floor-btn`)
- Background: `--lcars-lilac` (#cc55ff)
- Height: 0.7× standard button height
- Font size: 0.85× standard data font
- Active state: `--lcars-gold`
- Icon size: 16px
- `aria-pressed`, focus ring 2px `--lcars-ice`
- Click → `_selectFloor(floorId)`:
  - Plays `navAcknowledge` audio
  - Toggles `_selectedFloor`; clears `_selectedArea`
  - Dispatches `lcars-floor-selected` event

### §3.3 Area Buttons (`.sidebar-area-btn`)
- Background: `--lcars-african-violet`
- Height: `--lcars-btn-height` (full)
- Active state: `--lcars-gold`
- Icon size: 18px (mdi: from area registry)
- Text-align: left, ellipsized on overflow
- Click → `_selectArea(areaId)`:
  - First selection in session plays `ready`; subsequent plays `navAcknowledge`
  - Toggles `_selectedArea`; clears `_selectedFloor`
  - Updates URL hash to `#area:<area_id>` via `history.replaceState`
  - Dispatches `lcars-area-selected` event

### §3.4 Deep-Linking
On mount and on `hashchange`, `_applyHashDeepLink()` parses `#area:<area_id>` (case-insensitive) and auto-selects that area after a 100ms delay (to wait for `hass.areas`).

### §3.5 Auto-Deselect on Deletion
If `hass.areas` or `hass.floors` change and the currently selected id is gone, the layout auto-deselects and re-dispatches the selection event with `null`.

### §3.6 Structural Filler
`.lcars-sidebar-areas::after` is a `flex: 1 0 0px` gray panel that fills any leftover sidebar height with a rounded corner — collapses to 0 when the area list overflows and scrolls.

---

## §4 Per-Area Panel Discovery

Per-area rendering is the responsibility of `<lcars-homepage-card>` ([lcars-homepage-card.js](custom_components/lcars_dashboard/js/src/lcars-homepage-card.js)).

### §4.1 Pipeline (per area selection)
1. `_getAreaEntities(areaId)` → delegates to `getAreaEntities()` ([lcars-entity-query.js](custom_components/lcars_dashboard/js/src/lcars-entity-query.js)) with a per-card `_entityCache` Map.
2. Filters: skips `disabled_by`, `hidden_by === 'user'`, `hidden`, and `SUPPRESS_DOMAINS`. Diagnostic entities are routed into device sub-panels rather than top-level.
3. `_groupEntities(entities)` → `groupEntities(hass, entities)` returns an ordered array of panel groups. Each group carries `{ panelType, deviceId | null, entities, label, areaId }`.
4. Each group is dispatched via `PANEL_TAG_REGISTRY.get(panelType)` to a `lit-html` factory that renders the matching `<lcars-*-panel>` element. Unknown types fall through to a default LCARS button list.

### §4.2 Column Assignment
- `PANEL_COLUMN` map ([lcars-entity-utils.js](custom_components/lcars_dashboard/js/src/lcars-entity-utils.js)) assigns each panel type to `'left'` or `'right'`.
- Per-area override: `data.panel_column_overrides[areaId][panelId]` (saved via the panel-order editor) wins over the default map.

### §4.3 Panel Order
- `PANEL_TYPE_ORDER` numeric map sets the within-column priority.
- Left column (low → high): illumination (0), climate (2), environment (4), viewport (4.5), galley (4.7), ev_charger (4.8), power (5).
- Right column: tactical/alarm (0), camera (1), battery (2), irrigation (3), media (4), aquatics (5), weather (6), hazard (7).
- Tactical and alarm are **mutually exclusive**: when tactical entities are detected, the alarm panel is suppressed.

### §4.4 Cache Invalidation
The `_entityCache` is cleared on:
- Area or floor selection change
- `hass.entities` or `hass.devices` registry change
- Area deletion auto-deselect

### §4.5 Camera Auto-Refresh (per-area)
- `IntersectionObserver` (`rootMargin: 50px`) tracks `<img data-entity>` visibility.
- 10-second interval refreshes only **visible** camera images by appending `_cb=<timestamp>` to `entity_picture`.
- Paused on `document.hidden` (visibility change handler).
- State is fully reset on area/floor change to avoid 5X-B04 (camera proxy 500s on stale entity ids).

---

## §5 Mobile Responsive Behavior

Per Geordi ruling (v5.1.0-beta.36–38): **never collapse the sweep**. Hold the LCARS frame; narrow the sidebar to one elbow unit.

### §5.1 Narrow Frame (≤767px) — beta.36
```css
@media (max-width: 767px) {
  --lcars-sidebar-w: 5.5rem;
  --lcars-elbow-w:   5rem;
  --lcars-elbow-h:   3rem;
  --lcars-elbow-radius: 2.25rem;
}
```
- Header title: `1.25rem`, padding `0 0.5rem`
- Sidebar panel label: `0.625rem`, center-aligned
- Content padding: `0.25rem`
- Mute icon: 14px

### §5.2 Icon-Only Sidebar (≤767px) — beta.38, closes #94
At narrow widths (5.5rem) the area names truncate to 2–3 characters, which is illegible. Captain's call: drop labels entirely on phone and let the area's `mdi:` icon carry the affordance.

```css
.sidebar-area-btn,
.sidebar-floor-btn {
  justify-content: center;
  padding: 0.5rem 0.25rem;
  gap: 0;
}
.sidebar-area-btn .area-name,
.sidebar-floor-btn .floor-name { display: none; }
.sidebar-area-btn ha-icon  { --mdc-icon-size: 28px; }
.sidebar-floor-btn ha-icon { --mdc-icon-size: 24px; }
.sidebar-unassigned-label { display: none; }
```

Accessibility is preserved by `aria-label` and `title=` on every button (set in `render()`).

### §5.3 What This Is Not
There is no off-canvas drawer, no horizontal nav bar, no hamburger. The sweep is the brand.

---

## §6 Customization

All editor surfaces are admin-only and gated on `hass.user.is_admin`.

### §6.1 Edit Mode Toggle
- Cog button (header) **or** long-press (800ms) on the top-left elbow
- Plays `toggle` audio
- Dispatches `lcars-edit-mode` event; `<lcars-homepage-card>` listens and reveals edit pips on each entity
- Visual: frame turns lilac

### §6.2 Sidebar Reorder Dialog
- Sort-variant button (header) → opens `<lcars-sidebar-reorder>` ([lcars-sidebar-reorder.js](custom_components/lcars_dashboard/js/src/lcars-sidebar-reorder.js))
- Reorders LCARS dashboards in the HA sidebar (cross-dashboard, not area-specific)

### §6.3 Area Button Editor
- `<lcars-edit-area-button-card>` ([lcars-edit-area-button-card.js](custom_components/lcars_dashboard/js/src/lcars-edit-area-button-card.js))
- Invoked via `openEditPopup()` from edit-mode UI on a per-area button
- Edits area icon and display attributes

### §6.4 Panel Order / Column Editor
- `<lcars-edit-panel-order-card>` ([lcars-edit-panel-order-card.js](custom_components/lcars_dashboard/js/src/lcars-edit-panel-order-card.js))
- Per-area visual layout editor; reorders panels and assigns left/right column
- Persists to `data.panel_column_overrides[areaId]` via the dashboard configuration WS API
- Entry point: `_handlePanelReorder(e, areaId, panelId, allPanels)` on `<lcars-homepage-card>`

### §6.5 Entity / Device Editors
- `<lcars-edit-entity-card>` — per-entity icon/name overrides
- `<lcars-edit-device-button-card>` — per-device label/icon overrides
- `<lcars-edit-homepage-header-card>` — header title override

---

## §7 Audio Cues

Per [LCARS-AUDIO-SPEC.md](LCARS-AUDIO-SPEC.md). All sounds synthesized via Web Audio API in [lcars-audio.js](custom_components/lcars_dashboard/js/src/lcars-audio.js).

| Trigger | Sound |
|---|---|
| First area selection in session | `ready` (sine triad 330→440→660 Hz, 340ms) |
| Subsequent area selection | `navAcknowledge` (sine 440→660 Hz, 140ms) |
| Floor button click | `navAcknowledge` |
| Edit mode toggle (cog or long-press) | `toggle` (sine sweep 550→770 Hz, 80ms) |
| Header title edit click | `acknowledge` (sine 880 Hz, 60ms) |
| Entity tap (more-info) | `playForEntity(entityId)` — domain-derived cue |
| Mute toggle | (no sound — visual only) |

Mute state persists in `localStorage['lcars-audio-muted']`. `prefers-reduced-motion` suppresses non-critical cues per spec §4.

---

## §8 Accessibility

### §8.1 Keyboard Navigation
- Skip-nav link to `#lcars-main-content` (GEO-006)
- All buttons (mute, sort, cog, area, floor) are native `<button>` — Tab-reachable, Enter/Space to activate (WCAG 2.1.1)
- Focus visible: 2px solid `--lcars-ice` outline, 2px offset (WCAG 2.4.7, 2.4.13 ≥3:1 contrast)

### §8.2 ARIA Semantics
- `role="banner"` on header
- `aria-hidden="true"` on decorative elbow + header bar
- Mute button: `role="switch"`, `aria-checked`, `aria-label="Dashboard sounds"`
- Cog button: `aria-pressed`, dynamic `aria-label` ("Enter/Exit configuration mode")
- Sort button: `aria-label="Reorder sidebar dashboards"`
- Area buttons: `aria-label` (full area name), `title=` (mobile tooltip), active button gets visual gold + name remains in DOM
- Floor buttons: same pattern

### §8.3 Color Contrast
- Black text on butterscotch: ~10:1 (AAA)
- Black text on african-violet: AA-passing
- Black text on lilac (floor headers): AA-passing
- Sky-blue footer text on african-violet: verified AA
- Edit pip & focus ring: ice-blue meets non-text contrast 3:1

### §8.4 Long-Press Caveat
Long-press elbow gesture is admin-only and is **not** the primary path to Edit Mode — the cog button is the keyboard-accessible equivalent. WCAG 2.5.7 (single-pointer alternative) is satisfied.

---

## §9 Performance Notes

### §9.1 Entity Discovery
- `getAreaEntities()` walks `Object.values(hass.entities)` once, filtered by `area_id` (or device's `area_id`).
- Per-card `_entityCache: Map<areaId, Entity[]>` avoids re-walking on re-renders that don't change the area.
- Cache cleared on entity/device registry change (avoids stale data after HA config changes).

### §9.2 Area Enumeration (Sidebar)
- `_getAreasGroupedByFloor()` runs on each layout `render()` — O(A + F) where A = areas, F = floors.
- For typical installs (≤30 areas, ≤5 floors) this is sub-millisecond. Not memoized; re-evaluated cheaply.

### §9.3 Camera Refresh
- Only **visible** camera `<img>` elements refresh; throttled to 10s; paused on tab hidden.
- Each refresh is a single image src swap (cache-bust via `_cb` query); no re-render of the panel tree.

### §9.4 Panel Dispatch
- `PANEL_TAG_REGISTRY` is a static `Map`, lookup is O(1).
- Factory functions return lit-html templates directly — no `unsafeStatic`, no dynamic tag construction (Geordi ruling 4X-21).

### §9.5 Bundle Cost
- All panels are imported as side-effects in `lcars-homepage-card.js`. The Habitat dashboard pulls the entire panel set; specialty dashboards import only the panels they render.

---

## §10 Known Limitations / Future Work

- **No multi-area selection.** Floor selection unions areas, but there is no "multiple areas" mode.
- **No drag-to-reorder for area buttons** within a floor — order is dictated by HA area registry.
- **Floor `level` collisions** sort alphabetically; no manual override.
- **`UNASSIGNED` group** is hard-coded last and labeled in sky-blue; not customizable.
- **Panel registry growth** — every new panel type requires both an entry in `PANEL_TAG_REGISTRY` and an import in `lcars-homepage-card.js`. Tracked in [LCARS-PANEL-EXTRACTION-ARCHITECTURE.md](LCARS-PANEL-EXTRACTION-ARCHITECTURE.md).
- **Mobile icon-only sidebar** depends on every area having a meaningful `mdi:` icon. Areas without icons fall back to the default `mdi:texture-box` and are visually indistinguishable on phone — captured in backlog as a follow-up to #94.
- **Long-press edit-mode trigger** has no visible affordance. Acceptable because the cog button is always present and admin-only.
- **Deep-link hash** only persists area selection, not floor selection.
- See [plans/backlog-5x.md](../plans/backlog-5x.md) for tracked Habitat items.
