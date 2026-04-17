# Changelog

All notable changes to the LCARS Dashboard project are documented here.

## [4.18.7] — 2026-04-17

### Fixed — Production Hardening (Team Review Pass)

**Security (Worf):**
- **Path traversal in `ws_handle_sort_more_page`** — `sortData` items now validated via `_validate_path_component()` before use as file path segments.
- **Missing auth on notification endpoint** — `websocket_get_notifications` now requires `@websocket_api.require_admin`, matching all other WS handlers.
- **YAML key injection blocked** — `msg["key"]` in 4 bool-value handlers restricted to `ALLOWED_BOOL_KEYS` allowlist via `vol.In()`. `sortType` restricted to `ALLOWED_SORT_TYPES`.
- **innerHTML XSS in power popover** — `_showCircuitPopover()` rewritten from `innerHTML` string concatenation to `lit-html render()` with auto-escaping. `_escapeHtml()` helper removed.

**Python Backend (Data):**
- **17 relative-path `open()` calls fixed** — All file I/O now uses `hass.config.path()` for absolute resolution. Prevents `FileNotFoundError` on Docker/venv installs where CWD ≠ config dir.
- **File handle leak fixed** — Redundant re-read after write in `ws_handle_edit_area_button` deleted (leaked FD on every area edit).
- **Global mutable state eliminated** — `areas`, `entities`, `devices`, `homepage_header` module globals moved to `hass.data[DOMAIN]`. Prevents race conditions on concurrent admin sessions.
- **`async_forward_entry_setups` awaited** — Changed from fire-and-forget `async_create_task` to `await`, ensuring sensor platform errors surface properly.
- **`async_unload_entry` added** — Integration now supports proper unload/reload (unloads sensor platform + removes panel).
- **`sensor.py` uses `SensorEntity`** — Replaced deprecated `Entity` base class with `SensorEntity` from `homeassistant.components.sensor`.
- **`package.json` version synced** — Was stuck at 4.17.2, now matches 4.18.7.

**UI & Accessibility (Geordi La Forge):**
- **11× `font-size: 0.55rem` (8.8px) fixed** — All instances replaced with `var(--lcars-font-size-label, 0.75rem)` across battery, climate, environment, power panel styles and homepage card.
- **`<lcars-setpoint>` circles → endcap pills** — Replaced `border-radius: 50%` circular ±buttons with LCARS-compliant 3rem × 2.5rem endcap pills (rounded-left decrement, rounded-right increment).
- **~24 incorrect CSS hex fallback values corrected** — lilac `#cc99cc`→`#cc55ff`, african-violet `#cc99cc`→`#cc99ff`, gray `#9999aa`→`#666688`, ice `#88f`→`#99ccff`, space-white `#ccc`→`#f5f6fa`, sunflower `#ffcc66`→`#ffcc99`, card bg `#1a1a2e`→`var(--lcars-black, #000)`.
- **`:focus-visible` on `.battery-total-line`** — Added 2px ice-blue outline for keyboard focus visibility (WCAG 2.4.7).
- **Camera panel `aria-label`** — Control buttons now have `aria-label` matching `title` text for consistent screen reader announcement (WCAG 4.1.2).

## [4.18.6] — 2026-04-16

### Fixed — Team Review Pass

**Illumination Panel:**
- **Duplicate `_handleLightKeydown` deleted** — Second definition silently overwrote first, killing Alt+Arrow keyboard reorder (WCAG 2.5.7 drag alternative).
- **Click-after-drag race condition** — Pointer up nulled drag state before click event fired, causing unintentional light toggle after drag reorder.
- **Partition cache optimized** — Only invalidated when data-bearing props change (`hass`, `group`, `entities`, `areaId`), not on every UI state change.
- **Debouncer cancelled on disconnect** — Prevented stale service calls after area switch.
- **`releasePointerCapture` guarded** — Wrapped in try/catch to prevent DOMException on browser focus loss.
- **Drag `hoverIndex` initialized** — Prevented phantom reorder on first drag movement.
- **`CSS.escape()`** — Entity ID selector injection hardened (Worf finding).
- **Area change reset** — `_expandedLight` and drag state cleared when `areaId` changes.

**Irrigation Panel:**
- **`nothing` symbol removed** — lit-html 3.x-only import replaced with `''` across 11 usages (would crash on any irrigation panel render).
- **Quick Run fixed** — Array `entity_id` bypassed base `_callService` validation; now calls `hass.callService` directly with clamped duration.
- **`state: true` → `attribute: false`** — lit-element 2.5.1 compatibility (state: true is 3.x-only).
- **Rate-limited toggles** — Standby/Rain Delay/Schedule toggles now route through `#irrigationLimiter`.
- **Null guard on partition** — Defensive default parameter prevents crash on undefined `group.entities`.
- **Redundant `isOn` check** — Removed inside already-guarded block.

**Homepage Card:**
- **`aria-live` removed from panel container** — Was announcing all right-column panel content on area switch (Geordi finding).
- **Landmark roles added** — Left column: `role="region" aria-label="Device controls"`, Right column: `role="region" aria-label="System panels"`.
- **`min-width: 0`** — Added to `.area-split-panels` to prevent grid blowout from wide panel content.
- **Empty area `role="status"`** — Screen readers now announce empty area state.

## [4.18.5] — 2026-04-16

### Fixed — Element Expression Crash

- **Removed invalid element expression** — The illumination panel's `_renderLightBar()` had `${this.editMode ? html`` : ''}` inside a `<div>` opening tag. Lit-html 1.x does not support element expressions (only lit 3.x does), causing the Template constructor's attribute regex to return null → `null[2]` crash.

## [4.18.4] — 2026-04-16

### Fixed — Illumination Panel Crash & Cache Busting

- **repeat() directive removed** — The bundled lit-html 1.x `repeat()` directive was incompatible with HA's lit 3.x runtime, causing `Cannot read properties of null` crashes. Replaced with `.map()`.
- **const.py VERSION synced** — Cache-busting URL query parameter was stuck at 4.17.2, preventing browsers from loading updated JS bundles.
- **Area-level panel naming** — Illumination and Life Support panels now show "ILLUMINATION CONTROL" / "LIFE SUPPORT" instead of the room name.

## [4.18.3] — 2026-04-16

### Fixed — Panel Layout & Illumination Detection

- **Panel column assignments** — Panels now render in explicit left/right columns instead of a single panels column. LEFT: illumination (above entities), entity groups, climate, life support, environment, power. RIGHT: alarm, camera, battery, irrigation, media, pool/spa, weather. Fixes reversed column order from v4.18.2.
- **Illumination panel detection** — Threshold lowered from ≥2 to ≥1 lighting entity. The `isInfrastructureLED()` exclusion (v4.18.2) reduced counts below the previous threshold in rooms where UniFi AP indicator LEDs inflated the count.
- **Power panel placement** — Power panel now renders in the left column after environment, instead of inside the entity groups section.

**Closes**: [#26](https://github.com/htiel/LCARS-lovelace-dashboard/issues/26)

## [4.18.2] — 2026-04-16

### Fixed — Layout & Entity Coverage

- **Panel column position** — Area-level panels (illumination, life support) now render in the left column; main content renders in the right column. Previously reversed.
- **Infrastructure LED exclusion** — UniFi AP indicator LEDs, ESPHome status LEDs, and `status_led`/`status_panel`/`led_indicator` entities are now excluded from the illumination panel via `isInfrastructureLED()` predicate.
- **Insteon product name detection** — `isLightingEntity()` now matches Insteon dimmer product names (`SwitchLinc`, `LampLinc`, `ToggleLinc`) in entity IDs.
- **Device-level dedup** — Illumination panel no longer shows duplicate entries when multiple entities belong to the same device. Two-pass partition: first pass groups by `device_id`, second pass selects the best representative entity per device.

### Added — Illumination Panel: Stable Sort & Drag-and-Drop Reorder

- **Stable light ordering** — Lights no longer jump position when toggled on/off. Sort order: custom user order (localStorage) → alphabetical fallback. Removed on-state/brightness from sort comparator.
- **Drag-and-drop reorder (edit mode)** — In settings/edit mode, each light bar shows a 3-pip vertical grip handle (LCARS-native design per Geordi). Drag to reorder using Pointer Events API with `setPointerCapture()` — works in Shadow DOM, touch-friendly.
- **FLIP animation** — Reorder transitions use First-Last-Invert-Play technique at 200ms cubic-bezier. Respects `prefers-reduced-motion`.
- **Keyboard reorder** — Alt+ArrowUp / Alt+ArrowDown moves lights in edit mode (WCAG 2.5.7). Position announced via `aria-live="assertive"` status region.
- **localStorage persistence** — Custom light order persisted per area (`lcars-ilm-order-{areaId}`). Stale entity keys automatically pruned on load.
- **`repeat()` directive** — Illumination panel now uses `repeat()` from `lit-html/directives/repeat.js` for keyed DOM diffing, enabling stable FLIP animation across reorders.
- **Partition caching** — `_getPartition()` caches the entity partition result per render cycle via `willUpdate()` dirty flag. Eliminates redundant `_partitionLightingEntities()` calls between `renderBadge()` and `renderContent()`.

### Added — Irrigation Panel V2: Full Rachio Integration

Complete redesign of `<lcars-irrigation-panel>` — "Arboretum Environmental Control" — with full Rachio Gen 3 entity coverage.

- **Zone photo thumbnails** — Each zone row shows a photo from Rachio's `entity_picture` (loaded via HA proxy with `loading="lazy"`, `referrerpolicy="no-referrer"`). Fallback to vegetation type icon (mdi:grass, mdi:tree, mdi:flower) when no photo is set. Zone number badge overlay.
- **Zone detail expansion** — Click a zone name to expand inline attribute badges: Shade (Full Sun/Half Shade/etc.), Vegetation Type (Cool Season Grass/Shrubs/etc.), Slope (Flat/Slight/Moderate/Steep), plus zone Summary text. Badges use LCARS pill shape.
- **Barberpole flow animation** — Active zones show animated diagonal ice-blue stripes scrolling left→right (per original spec). Fill bar width tracks real watering progress using `last_changed` + `Watering Duration seconds`.
- **Countdown timer** — Active zones show `MM:SS` remaining in ice-blue tabular numerals, updated every second.
- **Schedule strips** — Schedule switches rendered as ON/OFF toggle strips with name, type badge (FLEX=african-violet, FIXED=butterscotch), and duration. Replaces generic sensor-row treatment.
- **Controller status telemetry** — Four LCARS horizontal mini-bar indicators: ONLINE/OFFLINE (ice/tomato-pulsing), STANDBY (gold), RAIN DELAY (african-violet), RAIN SENSOR (ice).
- **Rain alert banner** — Full-width conditional banner when rain delay or rain detected is active. 4px left border, CANCEL button for rain delay. `role="alert"` with `aria-live="polite"`.
- **Quick Run builder** — Collapsible section: zone selector (multi-select pill buttons), duration picker (3/5/10/15/20 min presets), ENGAGE button. Calls `rachio.start_multiple_zone_schedule`.
- **Pause/Resume/Stop All** — When watering active: PAUSE button (`rachio.pause_watering`), STOP ALL button (`rachio.stop_watering`). All rate-limited at 5/10s.
- **Rain delay toggle** — Dedicated control to activate/deactivate 24-hour rain delay.
- **LCARS compliance** — All buttons LCARS pill shape (Geordi), status indicators are horizontal mini-bars not dots (Geordi), 4-row consolidated grid, `prefers-reduced-motion` gates on all animations.

## [4.18.1] — 2026-04-16

### Fixed — Bugfixes

- **Illumination panel render order** — Area-level panels (illumination, life support) now sort first in the panel column (`PANEL_TYPE_ORDER` priority -2 and -1). All panels (device + area) merged into a single sorted list.
- **Duplicate standalone entities** — Entities consumed by area-level panels (lights for illumination, climate/environment/ambient for life support) are now filtered out of standalone device groups. Empty groups are pruned.
- **Rachio irrigation detection** — `isIrrigationDevice()` broadened with platform-based detection for known irrigation integrations (Rachio, RainBird, RainMachine, OpenSprinkler, Hydrawise, Hunter) plus heuristic fallback (≥5 switches + rain sensor).
- **Climate/environment device panels subsumed** — When life support panel is active, individual climate and environment device panels are suppressed to avoid redundancy.

## [4.18.0] — 2026-04-16

### Added — Life Support Panel (4X-10)

New `<lcars-lifesupport-panel>` — area-level composite panel that aggregates climate, environment (air quality), and ambient sensor entities into a unified Life Support view.

- **Four graceful degradation configurations**: Full (thermostat + purifier + sensors), Atmos-only (purifier + sensors), Climate-only (thermostat + sensors), Sensors-only (standalone temp/humidity as sensor hero layout)
- **Nested panel composition**: Reuses existing `<lcars-climate-panel>` and `<lcars-environment-panel>` as substations via `frame-mode="nested"` — zero code duplication
- **Ambient sensor row**: Full-width row showing room-level readings from standalone sensors (SwitchBot meters, etc.) with LCARS mini-bar indicators
- **Adaptive sparkline tray**: 24-hour trend sparklines for temperature, humidity, AQI, PM2.5, CO₂, VOC — adapts to available data
- **Sensor hero mode**: Large centered temperature display for sensor-only rooms, colored by comfort zone
- **WCAG 2.2 AA**: Inherits accessibility from child panels, `role="status"` on sensor hero, `aria-label` on all readings, `prefers-reduced-motion` gates

**Closes**: [#10](https://github.com/htiel/LCARS-lovelace-dashboard/issues/10)

### Added — Illumination Control Panel (4X-11)

New `<lcars-illumination-panel>` — area-level lighting control panel that aggregates all light entities, lighting switches, and scenes.

- **Full-width brightness bars**: Each light rendered as interactive bar with status indicator, name, and brightness percentage. Fill bar proportional to brightness level
- **Color temperature awareness**: Bar fill color shifts between warm amber (2000K) and cool white (6500K) based on `color_temp_kelvin`
- **Scene strip**: Horizontal row of LCARS endcap buttons for scene activation via `scene.turn_on`
- **Circuit rows**: Simple on/off rows for non-dimmable lighting switches identified by `isLightingEntity()` heuristic
- **Inline brightness slider**: Click percentage to expand brightness slider with full keyboard navigation (arrow keys ±5%)
- **Badge**: `<lcars-summary-badge>` showing `3/5 ON` active/total count
- **WCAG 2.2 AA**: `role="list"` sections, `role="button"` with `aria-expanded` on brightness toggle, keyboard toggle (Enter/Space), `aria-label` on all controls, `prefers-reduced-motion` gates

**Closes**: [#11](https://github.com/htiel/LCARS-lovelace-dashboard/issues/11)

### Added — `<lcars-summary-badge>` Shared Component (4X-20)

Reusable badge component for panel header status readouts.

- **Props**: `label`, `value`, `total`, `color`, `icon` — renders as `3/5 ON` or `1847 W`
- **Composable**: Designed for horizontal strip composition in multi-stat summaries
- **WCAG**: `role="status"` (WCAG 4.1.3 Status Messages)
- **Style**: Text-only, no borders/background/shadows, ALL CAPS, Antonio font

**Closes**: [#20](https://github.com/htiel/LCARS-lovelace-dashboard/issues/20)

### Added — Entity Query Utility (4X-13)

New `lcars-entity-query.js` — shared entity resolution module extracted from homepage card.

- **`queryEntities(hass, opts, cache?)`**: Multi-criteria entity query with area, floor, domain, device class, and custom predicate filtering
- **`getAreaEntities(hass, areaId, cache?)`**: Drop-in replacement for the original `_getAreaEntities()` with identical behavior
- **`groupEntities(hass, entities)`**: Drop-in replacement for `_groupEntities()` — device grouping with domain-priority sorting
- **External cache injection**: Per Geordi's requirement — no module-level singleton, multiple dashboard instances in 5.x won't collide
- Homepage card refactored to thin wrappers over shared functions

**Closes**: [#13](https://github.com/htiel/LCARS-lovelace-dashboard/issues/13)

### Added — Panel Dispatch Registry (4X-21)

Replaced the `_renderDevicePanel()` switch statement with a `PANEL_TAG_REGISTRY` Map.

- **Factory function pattern**: Each panel type maps to a `(group, hass, editMode, config) => html\`...\`` factory per Geordi's review (no `unsafeStatic`, no dynamic tag injection)
- **12 panel types registered**: All 10 existing panels + `life_support` + `illumination`
- **Irrigation exception**: Retains custom render path for complex irrigation logic
- **Extensible**: New panels add a Map entry — no switch case editing required

**Closes**: [#21](https://github.com/htiel/LCARS-lovelace-dashboard/issues/21)

### Added — `classifyArea()` Function (4X-17)

New area-level entity classification in `lcars-entity-utils.js`.

- **`classifyArea(hass, areaId, entityEntries)`**: Returns `Set<PANEL_TYPE_*>` of composite panel types
- **New constants**: `PANEL_TYPE_LIFE_SUPPORT`, `PANEL_TYPE_ILLUMINATION`
- **Life Support detection**: Triggers on climate entity OR (environment entity AND ambient sensors)
- **Illumination detection**: Triggers on ≥2 lighting entities in the area

**Closes**: [#17](https://github.com/htiel/LCARS-lovelace-dashboard/issues/17)

### Added — Domain/Device_Class Filter Predicates (4X-18)

Composable filter factory functions added to `lcars-entity-utils.js`.

- **Factories**: `createDomainFilter(domains)`, `createDeviceClassFilter(classes)`, `createCompositeFilter(...predicates)`
- **Named predicates**: `isClimateEntity()`, `isEnvironmentEntity()`, `isLightingEntity()`, `isSecurityEntity()`, `isAmbientSensor()`
- **`isLightingEntity()` heuristic**: Identifies switches controlling lights by friendly name/entity_id pattern matching, excludes outlet device_class

**Closes**: [#18](https://github.com/htiel/LCARS-lovelace-dashboard/issues/18)

### Added — Panel Data Model: `entities` Collection (4X-15)

Extended `LcarsBasePanel` with `entities` and `devices` (plural) properties.

- **`entities` property**: Direct entity collection for cross-device panels — bypasses single-device `group` model
- **`devices` property**: Plural device list for composite panels spanning multiple devices
- **Fallback chain**: `_getAllEntities()` prefers `this.entities` → `this.group.entities` — backward compatible
- **Identity fallbacks**: `_getPanelName()` and `_getPanelCode()` fall back through `group.device` → `devices[0]` → area name → defaults

**Closes**: [#15](https://github.com/htiel/LCARS-lovelace-dashboard/issues/15)

### Added — `LcarsBasePanel` Frame-Mode Property (4X-19)

New `frame-mode` attribute for controlling panel chrome level.

- **`standard`** (default): Full `<lcars-panel-frame>` with borders — current behavior
- **`nested`**: Suppresses borders, keeps header bar — for embedding in parent panels
- **`header-only`**: Minimal chrome for tightly packed layouts
- **ARIA preserved**: `role="region"` + `aria-label` persist regardless of frame mode

**Closes**: [#19](https://github.com/htiel/LCARS-lovelace-dashboard/issues/19)

### Added — 5x Prep: Infrastructure & Shared Utilities

Foundational utilities and tokens extracted ahead of the 5.x multi-dashboard architecture.

- **Floor/area hierarchy utilities (4X-12)**: `lcars-hierarchy-utils.js` — `getFloorAreas()` for hierarchical navigation. **Closes**: [#12](https://github.com/htiel/LCARS-lovelace-dashboard/issues/12)
- **`load_dashboard.py` parametric registration (4X-22)**: Dashboard slug/title/icon configurable via `const.py` — enables multi-dashboard registration in 5.x. **Closes**: [#22](https://github.com/htiel/LCARS-lovelace-dashboard/issues/22)
- **Config flow options schema prep (4X-23)**: `_build_options_schema()` helper for dynamic options based on installed version. **Closes**: [#23](https://github.com/htiel/LCARS-lovelace-dashboard/issues/23)
- **Dashboard identity CSS custom properties (4X-24)**: 7 `--lcars-dash-*` color tokens + `--lcars-active-dash` for themed multi-dashboard layouts. **Closes**: [#24](https://github.com/htiel/LCARS-lovelace-dashboard/issues/24)
- **Shared focus style mixin (4X-25)**: `lcarsFocusRing` CSS fragment — consistent `:focus-visible` outline across all components. **Closes**: [#25](https://github.com/htiel/LCARS-lovelace-dashboard/issues/25)

### Fixed — Team Review (Data, Geordi La Forge, Worf)

Comprehensive line-by-line review across all v4.18.0 features. 37 findings fixed (8 critical, 4 high, 13 medium, 12 low).

#### Critical
- **`classifyArea()` wired into dispatch** — Area-level composite panels (life support, illumination) were imported but never instantiated; `_renderAreaContent()` now calls `classifyArea()` and dispatches via `PANEL_TAG_REGISTRY`
- **`showMoreInfo()` signature** — Illumination panel passed `(this, eid)` instead of `(eid)`; context menu now works correctly
- **Sparkline lifecycle** — Life support sparklines fired `fetchSparklineData()` in `connectedCallback()` before `hass` was set; moved to `updated()` with guard
- **Registry `areaId` propagation** — `PANEL_TAG_REGISTRY` referenced `group.areaId` but device groups lacked the property; area-level dispatch now builds synthetic groups with `areaId`
- **WCAG keyboard access** — `tabindex: 0` was in CSS (invalid); moved to HTML attributes on light bars and circuit rows
- **`role="listitem"` on `<button>`** — Overrode implicit button role; scene buttons now wrapped in `<div role="listitem">`
- **`role="slider"` on toggle** — Brightness value span used `role="slider"` but functioned as a disclosure toggle; changed to `role="button"` with `aria-expanded`
- **Slider thumb size** — 20px below WCAG 2.5.8 minimum; increased to 24px (1.5rem)

#### High — Palette Compliance
- **20+ hex fallback corrections** — All `#f1df6f` → `#ffcc99` (sunflower), `#7c8992` → `#666688` (gray), `#ff9900` → `#f5f6fa` (text), `#f1df6f` → `#ff9966` (butterscotch)

#### Medium
- **Unthrottled brightness slider** — Debounced at 300ms via `createDebouncer()`
- **Entity validation bypass** — Illumination panel now uses `_callService()` from base class (entity ID regex validation)
- **`_buildCacheKey()` array mutation** — Spread-copies before `.sort()` to avoid mutating caller arrays
- **`excludeCategories` param** — Was documented in JSDoc but never implemented; now functional
- **`isEnvironmentEntity()` fan gate** — All fans were classified as environment; now gated on `!device_class` (only air purifier fans)
- **Phantom CSS variables** — Defined `--lcars-font-size-label`, `--lcars-font-size-hero`, `--lcars-gray-alpha` in `lcars-styles.js`
- **Font-size fallback mismatches** — `--lcars-font-size-data` fallbacks corrected from `1rem` to `0.875rem`
- **Life support badge** — `renderBadge()` now uses `<lcars-summary-badge>` instead of raw `<span>` (gains `role="status"` + ARIA)
- **Sparkline SVG accessibility** — `aria-hidden="true"` on sparkline slots (label provides text alternative)
- **Sensor hero uppercase** — Added `text-transform: uppercase` on `.ls-hero-humidity`
- **Sequential sparkline fetches** — Single batched `fetchSparklineData()` call replaces O(n) sequential fetches

#### Low
- **Scene rate limiting** — `createRateLimiter(3, 5000)` on scene activation
- **Brightness clamping** — `clampValue(pct, 1, 100)` on slider input
- **Arrow key off-state guard** — Arrow keys no longer turn on lights when brightness is 0
- **`_shortEntityName()` consistency** — Both panels now use base class `_shortenName()` (case-insensitive prefix stripping)
- **`_getAllEntities()` in loop** — Sparkline tray computes entity list once outside loop
- **`requestUpdate()` disconnect guard** — Guarded with `this.isConnected`
- **Stale sparkline cache** — Cleared on area change in `updated()`
- **Redundant `aria-live`** — Removed from `<lcars-summary-badge>` (`role="status"` implies it)
- **`prefers-reduced-motion`** — Added comprehensive override block for illumination panel transitions
- **Hover overlay** — Changed from `rgba(255,255,255,0.08)` to space-white derived value
- **Unused import** — Removed `queryEntities` from life support panel


## [4.17.2] — 2026-04-15

### Added — NUT UPS Battery Panel Support (4X-7)

NUT-monitored UPS devices (CyberPower, APC, Tripp Lite, Eaton, etc.) are now auto-detected and rendered in the warp core battery panel.

- **Detection**: Battery detector recognizes NUT devices (battery sensor + voltage/load/status entities, no power-class entities). Runs alongside existing EcoFlow/Victron/Tesla detection with no regression
- **Entity partitioning**: NUT-specific classification captures load %, input/output voltage, battery runtime, and status codes. Computes watts from `load% × nominal_real_power` when the nominal power entity is enabled
- **NUT status parsing**: Decodes NUT status codes (`OL`=online, `OB`=on battery, `CHRG`=charging, `LB`=low battery, `FSD`=forced shutdown) to drive warp core charge/discharge animations
- **Power flow**: Grid→UPS→Load conduit flow replaces per-port I/O pairs. Grid side shows ONLINE/OFFLINE state, load side shows computed watts or load percentage
- **Telemetry**: Battery runtime formatted as `Xh Ym`, input/output voltage displayed, status badge with human-readable state
- **No visual changes**: Uses existing warp core visualization, SOC gauge, conduit animations, and telemetry layout

**Closes**: [#7](https://github.com/htiel/LCARS-lovelace-dashboard/issues/7)

## [4.17.0] — 2026-04-15

### Added — Panel Extraction Architecture (4X-4)

The monolith `lcars-homepage-card.js` has been decomposed into **10 panel custom elements**, a **shared base class**, **5 shared components**, and a **thin orchestrator**. Zero visual regression — structural refactor only.

#### Base Class & Render Pattern (Spec §5.2)
- **`LcarsBasePanel`** — Abstract base class for all extracted panels. Provides `render()` → `renderContent()` pattern: base class wraps subclass content in `<lcars-panel-frame>`. Subclasses override `renderContent()` and `renderBadge()` — never `render()`
- **Panel getters**: `panelType`, `defaultPanelTitle`, `frameColor` — each panel declares its identity; dynamic panels (climate, alarm, weather) compute `frameColor` from entity state
- **Shared helpers on base**: `_friendlyName()`, `_shortDeviceName()`, `_handleEntityClick()`, `_handleToggle()`, `_getSensorIndicatorColor()`, `_generatePanelCode()`, `_getDeviceCategoryEntities()`

#### Shared Components
- **`<lcars-panel-frame>`** — Unified frame component with header (name + header-line + badge slot + code), flexbox content area, LCARS corner brackets, asymmetric border-radius. Replaces ~200 lines of duplicated frame CSS across 10 panels
- **`<lcars-sensor-row>`** — Reusable sensor readout line (indicator dot + label + value + color). Click-to-more-info, keyboard accessible
- **`<lcars-section-divider>`** — Horizontal rule with optional label text
- **`<lcars-option-strip>`** — Radio-group pill buttons with roving tabindex keyboard navigation, fires `lcars-option-changed`
- **`<lcars-setpoint>`** — Spinbutton with ± adjustment buttons, `role="spinbutton"` with aria-valuenow/min/max, fires `lcars-setpoint-changed`

#### Extracted Panels (10)
- **Irrigation** — `<lcars-irrigation-panel>` (frameColor: `--lcars-ice`)
- **Camera** — `<lcars-camera-panel>` (frameColor: `--lcars-butterscotch`)
- **Environment** — `<lcars-environment-panel>` (frameColor: `--lcars-blue`, badge: AQ score)
- **Battery** — `<lcars-battery-panel>` (frameColor: `--lcars-ice`, badge: charge %)
- **Climate** — `<lcars-climate-panel>` (dynamic frameColor from HVAC action, badge: action state)
- **Alarm** — `<lcars-alarm-panel>` (dynamic frameColor from alarm state, badge: state label)
- **Media** — `<lcars-media-panel>` (frameColor: `--lcars-african-violet`, badge: transport symbol + state)
- **Pool & Spa** — `<lcars-pool-spa-panel>` (frameColor: `--lcars-bluey`, badge: pool/spa temps)
- **Weather** — `<lcars-weather-panel>` (dynamic frameColor from condition, badge: glyph + condition)
- **Power** — `<lcars-power-panel>` (dual-mode: consolidated multi-device + legacy single-device, dynamic frameColor from power usage)

#### CSS 3-Tier Composition
- **Tier 1**: `lcarsBaseStyles` (shared LCARS variables) → inherited via `...super.styles`
- **Tier 2**: Component shadow DOM (panel-frame border/corners, sensor-row layout)
- **Tier 3**: Panel-specific CSS modules (grid layouts, viewscreens, controls)
- Eliminates ~600 lines of duplicated frame/header/sensor CSS across panels

### Fixed — Security (Worf RA-3)
- **Power panel innerHTML XSS** — Replaced `innerHTML` string concatenation in `_showCircuitPopover()` with `lit-html render()` for safe template rendering. Removed `_escapeHtml()` helper

### Fixed — Accessibility
- **Media transport toolbar** — Added `role="toolbar"` to transport controls container
- **Volume slider keyboard** — Added Home/End/PageUp/PageDown key support per WCAG slider pattern
- **Alarm countdown lifecycle** — Moved countdown start/stop from `renderContent()` to `updated()` to prevent Lit render-loop anti-pattern
- **Panel frame font** — Added `font-family: var(--lcars-font)` to `.panel-name` in frame styles

### Changed
- **`customElements.define()` guards** — All components and panels use `if (!customElements.get('tag'))` guard to prevent duplicate registration errors
- **Bundle size** — 566 KiB (down from 573 KiB pre-extraction) despite 5 new components — net savings from CSS deduplication and dead code removal

## [4.16.6] — 2026-04-14

### Added — LCARS Sliding Track Toggles
- **`_renderTrackToggle()`** — Unified toggle renderer producing sliding track switches with circular thumb indicator. Gold track + right thumb = ON, gray track + left thumb = OFF. LCARS font, `prefers-reduced-motion` override
- Applied to all power panel toggles: device row switches, strip master toggles, and per-outlet child toggles

### Fixed — Strip Child Switch Matching (#4 continued)
- **Parent-owned switches** — Kasa HS300 puts all per-outlet `switch.*` entities on the parent device, not on child outlet devices. `_renderStripChild()` now receives the parent's switch list and matches by normalized child device name appearing in the parent switch entity_id or friendly_name

## [4.16.5] — 2026-04-14

### Fixed — Strip Parent/Child Classification (#4 continued)
- **Inherited model string** — Kasa HS300 child outlet devices inherit the parent's model ("HS300"), so `_classifyPowerDevice()` marked all 14 as `'strip'`. Every outlet rendered as a separate strip block with zero children
- **via_device_id check** — Before tagging `subType: 'strip'`, check if the device's `via_device_id` points to another strip-classified device. If so, it's a child outlet — passes through without `subType` so `_groupPowerStrips()` associates it with its parent

## [4.16.4] — 2026-04-14

### Fixed — Power Panel Dedup + Strip Outlet Toggles (#1, #2, #4)
- **#4 — Strip outlets missing toggles** — `_groupPowerStrips()` checked `group.subType === 'strip'` but `subType` was never set on power groups. Tagged strip groups with `subType: 'strip'` in `_buildPowerCollection()`
- **#2 — Mains/total circuit double-counting** — Aggregate channels (Balance, Total, Mains, Net, Whole Home) detected by name pattern and excluded from area total. Individual circuit tiles still render
- **#1 — UPS/battery backup double-counting** — UPS parent devices detected by `device_class: battery` and manufacturer patterns (CyberPower, APC, Tripp Lite). Parent wattage excluded from totals when children are present via `via_device_id`
- **Strip child dedup** — Strip children excluded from area totals since the strip parent already reports their aggregate

### Changed
- **`hacs.json`** — Added `icon` URL pointing to `brand/icon.png` on the `4.0` branch

## [4.16.3] — 2026-04-14

### Fixed — Camera Overlay Visibility (#3 continued)
- **z-index inversion** — `.camera-frame img` had `z-index: 2` sitting on top of overlays (`z-index: 1`). Swapped: img `z-index: 0`, overlays `z-index: 2`
- **Stale image on room switch** — Removed `loading="lazy"` and `display:none` toggling. Added `.src` property binding to force Lit to update the img element when switching rooms
- **Offline black screen** — Added `opacity: 0` for img in offline state. Removed `.device-panel-media[data-offline] opacity: 0.5` that was dimming the entire container including overlays
- **Camera frame fill** — Added CSS for `.camera-frame` inside `.device-panel-media` to remove double borders

## [4.16.2] — 2026-04-14

### Fixed — Camera Overlay in Device Panel (#3)
- **Missing overlays** — Device panel camera renderer (`_renderCameraPanel()`) lacked ESTABLISHING LINK / VIEWSCREEN OFFLINE overlays that existed in the domain-based `_renderCameras()`. Added proper `camera-frame[data-state]` overlay pattern with connecting/offline states

## [4.16.1] — 2026-04-14

### Fixed — SVG Import Crash + HACS Detection
- **`svg is not defined`** — Added missing `import { svg } from 'lit-html'` for power arc SVG template literals
- **HACS version detection** — All patch versions now get GitHub releases (required for HACS update notification)

## [4.16.0] — 2026-04-14

### Added — Consolidated Power Panel (4X-6)

#### Routing & Aggregation
- **Consolidated power routing** — Power devices are intercepted from the per-device panel flow in `_renderAreaContent()` and collected into a single unified panel rendered at the bottom of the area's left column
- **`_buildPowerCollection()`** — New aggregation method classifies power groups (vue/plug/strip), groups strip children by `via_device_id`, detects 240V pairs, sorts circuits power-descending, and computes area-wide `totalWatts`/`totalEnergy`

#### Consolidated Panel Renderer
- **`_renderConsolidatedPowerPanel()`** — Single unified "POWER SYSTEMS" panel with badge (e.g. "6 CIRCUITS · 1 DEVICE · 2 STRIPS"), summary card, optional SVG arc (≥3 sources), and sectioned sub-renderers for circuits, monitored devices, and power strips
- **`_renderConsolidatedPowerArc()`** — Arc adapter that feeds all sources (circuits + plugs + strips) into the existing `_renderPowerArc()` half-arc chart

#### Clickable Values (Geordi G-4)
- **`_renderClickableValue()`** — Wraps sensor values in accessible `role="button"` spans with click-to-more-info, keyboard handlers, and specific `aria-label` text (e.g. "View Kitchen power: 42 watts")
- Applied to circuit tiles, device rows, and strip children for both watts and energy values

#### CSS & Visual Design
- **Panel frame** — Asymmetric border-radius (`0.75rem` left, `0.25rem` right) with corner bracket pseudo-elements (Geordi G-2)
- **Transition separator** — Margin + border between device groups and consolidated panel (Geordi G-1)
- **Section accent bars** — Color-coded left borders: butterscotch (circuits), ice (devices), african-violet (strips) (Geordi G-6)
- **Tile minimum height** — `min-height: 3rem` for circuit tiles (Geordi G-3)
- **Focus-visible outlines** — Sunflower outline on circuit tiles and clickable values (Geordi G-5)
- **Responsive grid** — 4 breakpoints: ≥1024px (11rem), 768–1023px (9rem), 480–767px (2-col), <480px (1-col)
- **Truncation pill** — LCARS-styled "SHOW ALL (N)" pill for sections with >12 items (Geordi G-7)
- **Reduced motion** — Consolidated panel critical pulse disabled under `prefers-reduced-motion: reduce`

### Changed
- **`_renderDevicePanel()`** — Removed standalone `PANEL_TYPE_POWER` case (now handled by consolidated panel)
- **`_renderPowerPanel()`** — Marked `@deprecated` in favor of consolidated renderer

## [4.15.1] — 2026-04-14

### Fixed
- **TreeWalker crash** — Invalid lit-html v1 free-form expression in power panel template caused TreeWalker crash. Fixed with proper attribute binding

## [4.15.0] — 2026-04-14

### Added — Power Panel: Energy Monitoring (4X-3)

#### Power Color Utilities (`lcars-color-utils.js`)
- **`getPowerColor(watts, thresholds)`** — 5-tier power draw color resolver: gray (0W standby), ice (1–500W low), sunflower (501–1500W moderate), butterscotch (1501–3000W high), tomato (3001W+ critical). Supports configurable thresholds via `power_thresholds` YAML config
- **`getPowerLabel(watts, thresholds)`** — Semantic tier labels: STANDBY, LOW DRAW, MODERATE, HIGH DRAW, CRITICAL, UNAVAILABLE
- **`getGridBalanceColor(watts, deadband)`** — Grid import/export balance color: butterscotch (importing), ice (exporting), sunflower (balanced within ±50W deadband)
- **`STATE_COLOR_MAP.power`** — Centralized power state→color lookup entry

#### Power Device Detection (`lcars-entity-utils.js`)
- **`PANEL_TYPE_POWER`** — New panel type constant at position 9 in `PANEL_TYPE_ORDER`
- **Power Detector** — Detects devices with ≥1 power/energy/voltage/current sensor and NO battery sensor. Runs after battery detector — `hasBattery` boolean provides mutual exclusion gate. Supports Emporia Vue circuits, TP-Link Kasa plugs (KP115, KP125M, HS110), and HS300 power strips

#### Power Panel Renderer (`lcars-homepage-card.js`)
- **Panel Frame** — Butterscotch (`--lcars-butterscotch`) EPS conduit frame, shifts to tomato with distress pulse on critical draw (≥3000W)
- **Summary Cards** — Total Usage with dynamic power-level color, From Grid (butterscotch), To Grid (ice) summary cards with `aria-live="polite"` status announcements
- **Circuit Tile Grid** — `repeat(auto-fill, minmax(10rem, 1fr))` responsive grid with `max-height: 24rem` scroll and bottom fade mask. Power-descending sort. Color-blind safe shape indicators (○, ●, ●━, ●━━, ●━━━)
- **240V Pair Detection** — L1/L2 regex pattern combines paired circuits (dryer, oven, EV charger) into single tiles showing combined wattage with `●●` indicator
- **Switch + Monitor Rows** — Toggle pill + power stats for smart plugs with rate-limited toggle calls (10/10s via `createRateLimiter`)
- **Power Strip Blocks** — Parent/child hierarchy via `via_device_id` grouping. Strip header with master toggle and total wattage, child outlet tiles with individual toggles
- **SVG Half-Arc Chart** — Inline SVG power distribution meter showing top 5 circuits by consumption with colored arc segments. Pure SVG, no libraries
- **Singleton Popover** — Popover API circuit detail overlay (1 shared `<div popover>`, not per-tile). LCARS-styled with hero wattage, tier label, energy today, 240V badge, and "VIEW FULL HISTORY" button. Falls back to `showMoreInfo()` on unsupported browsers
- **Scroll-Driven Animations** — `animation-timeline: view()` CSS scroll-driven tile entrance animation. Falls back to instant render on unsupported browsers
- **`text-wrap: balance`** — Applied to section headers, strip names, circuit names
- **Configurable Thresholds** — `power_thresholds: { low_max, moderate_max, high_max }` in card YAML config
- **Format Utilities** — `_formatWatts()` (auto kW at ≥10kW), `_formatEnergy()` (kWh with 1 decimal)

### Accessibility (WCAG 2.2 AA)
- **ARIA Structure** — `role="region"` panel root, `role="heading"` (levels 3–5), `role="list"`/`role="listitem"` for circuits/devices/strips, `role="switch"` + `aria-checked` on all toggles, `role="status"` + `aria-live="polite"` on summary cards, `role="dialog"` on popover
- **Keyboard Navigation** — All tiles/rows `tabindex="0"`, Enter/Space activation, standard tab order
- **Focus Visible** — 2px `--lcars-ice` outline with 2px offset on all interactive elements (10.5:1 contrast ratio)
- **Color-Blind Safety** — Shape indicators (§2.3) provide redundant non-color information for all 5 power tiers
- **`prefers-reduced-motion`** — Critical pulse, scroll animations, and all transitions disabled; static rendering preserved
- **Target Sizes** — All interactive elements exceed 24×24 CSS pixel minimum (§2.5.8)

### Performance
- **Bundle Delta** — +35.2 KB (+10.2%): 343,924 → 379,106 bytes — within 40KB budget guard
- **Device Classification** — Three-tier device routing (vue/plug/strip) prevents unnecessary rendering paths

---

## [4.14.1] — 2026-04-14

### Fixed — Camera Loading & Offline States (4X-5)

- **Three-State Viewscreen** — Camera feeds now show distinct CONNECTING / LIVE / OFFLINE states via `data-state` attribute on `.camera-frame`
- **CONNECTING State** — "ESTABLISHING LINK" overlay text in `--lcars-ice` with 4s opacity breathe animation while camera image loads
- **OFFLINE State** — "VIEWSCREEN OFFLINE" overlay with `mdi:video-off` icon (32px) in `--lcars-tomato`, tomato border, full opacity (WCAG 1.4.3 fix from previous 0.5 opacity)
- **LIVE State** — `viewscreen-activate` clip-path animation scoped to `[data-state="live"]` only
- **Recovery Bug Fix** — `@load` handler now clears `display:none` set by `@error`, enabling cameras to recover on the next 10s refresh cycle
- **Z-Index Stacking Fix** — `<img>` hidden via `opacity: 0` during connecting state so "ESTABLISHING LINK" overlay is visible
- **Overlay Transitions** — State-driven visibility uses `opacity`/`visibility` (not `display:none`) per D-4 architecture decision
- **Accessibility** — `aria-busy` on connecting frames, `aria-label` reflects state, overlays `aria-hidden="true"`, `prefers-reduced-motion` disables breathe animation
- **Scope** — Standalone camera grid only; device panel cameras unchanged (D-3)

## [4.14.0] — 2026-04-14

### Added — BlueAir Air Purifier Support & Internal Sensors Grid

#### BlueAir Air Purifier Enhancements (4X-1)
- **CO₂ Indicator Coloring** — `_getSensorIndicatorColor()` now routes `carbon_dioxide` device class to `getCo2Color()` with 3-tier model: ice (≤800 ppm), sunflower (801–1200 ppm), tomato (>1200 ppm)
- **LED Light Control** — `light` domain added to environment entity controls partition, enabling BlueAir LED brightness/color control alongside fan/switch

#### Internal Sensors Grid Card (4X-2)
- **`lcars-internal-sensors-grid`** (NEW): Standalone card for temperature/humidity sensor monitoring
- **Auto-Discovery** — Discovers temp/humidity devices via `hass.entities/.devices/.areas/.floors` (no WebSocket registry calls), excludes fan/climate/air_quality siblings and appliance devices (fridge, freezer, refrigerator, wine cooler, kegerator)
- **Floor Grouping** — Sensors grouped by HA floor assignment with descending level sort; unassigned devices sort last
- **Responsive Layout** — CSS grid with pill-shaped tiles (LCARS cap termination), switches to row layout on mobile (<768px)
- **Comfort Colors** — Temperature-driven border coloring via `getTempComfortClass()` (nominal/warm/hot/cool/cold)
- **Sparklines** — Inline SVG sparkline charts via shared `fetchSparklineData()` WebSocket fetcher (hidden on mobile)
- **Battery Badges** — Pulsing low-battery indicator with `prefers-reduced-motion` override
- **Ship Averages Summary** — Real-time average temp/humidity with sensor count and low-battery alerts
- **Tile Stagger Animation** — Cascading tile entrance with 50ms stagger, capped at 20 tiles for large grids
- **Configurable** — `show_appliance_meters`, `sparkline_hours`, `low_battery_threshold`, `max_sensors` options via `setConfig()`

### Security & Accessibility
- **Entity ID Validation** — `ENTITY_ID_RE` regex validates all entity IDs at discovery extraction (W-R1)
- **WebSocket Only** — No REST API calls; sparkline data fetched exclusively via WebSocket (W-R2)
- **Tracked-Entity Diffing** — `_trackedEntityIds` Set with reference-equality comparison prevents unnecessary re-renders (D-C3)
- **WCAG 2.2 AA** — Full keyboard navigation (`tabindex="0"`, Enter/Space handlers), `:focus-visible` with 2px sunflower outline, ARIA region/list/listitem/heading/status structure, `aria-live="polite"` on summary
- **`prefers-reduced-motion`** — Disables all animations and transitions, battery badge forced to `opacity: 1`
- **No innerHTML** — All rendering via Lit tagged templates (auto-escaped)

---

## [4.13.0] — 2026-04-13

### Added — Dynamic Visual Enhancements (All Panels)

#### Shared Animation Framework (Phase 0)
- **`lcars-shared-animations.js`** (NEW): Shared CSS keyframes module — `lcars-scanline`, `lcars-frame-breathe`, `lcars-button-flash`, `lcars-pip-sweep`, `lcars-distress-pulse`, `lcars-value-flash`, `lcars-confirm-scale`, `lcars-setpoint-confirm` — extracted for DRY reuse across all panels
- **`lcars-styles.js`**: 8 animation timing tokens as CSS custom properties — `--lcars-anim-flash` (200ms), `--lcars-anim-confirm` (400ms), `--lcars-anim-pulse-urgent` (1s), `--lcars-anim-pulse` (2s), `--lcars-anim-breathe` (4s), `--lcars-anim-ambient` (8s), `--lcars-anim-scan` (600ms), `--lcars-anim-stagger` (50ms)
- **`lcars-color-utils.js`**: `STATE_COLOR_MAP` centralized state→color lookup, `COMFORT_COLORS` whitelist for temp grid, `getTempComfortClass()`, `getSafeComfortColor()`, `getRainDelayInfo()` with numeric guard

#### Device Panel Base (All Panels)
- **Frame Breathing Pulse** — Subtle ambient opacity cycle on all device panels via `lcars-frame-breathe`
- **Data Pip Footer Strip** — Repeating-gradient data pip bar at the bottom of every panel
- **Header Numeric Code Watermark** — Deterministic 6-digit `XXX-XXX` code (DJB2 hash) per entity, `aria-hidden`, 0.4 opacity
- **Button Press Ripple Flash** — Radial flash effect on all `.device-control-btn` active press
- **Viewscreen Scanline Overlay** — 2px luminous sweep on viewscreen power-on

#### Climate Panel Enhancements
- **HVAC Action Frame Pulse** — Panel border pulses butterscotch (heating) or ice (cooling) via `data-hvac-action` attribute
- **Arc Gauge Segmented Stroke** — `stroke-dasharray: 6 2` segmented arc with confirmation flash
- **Setpoint Button Glow** — Confirmation animation on temperature adjustment
- **Mode Strip Active Indicator** — Sliding gold underline on active HVAC mode
- **Ambient Temperature Data Pips** — Small pip row for ambient sensor data

#### Media Panel Enhancements
- **Audio Waveform Visualizer** — 12 bars in 4 groups, `scaleY` GPU-composited animation, pauses when media paused
- **Album Art Viewscreen Glow** — African-violet box-shadow pulse when playing
- **Transport Active State** — Glow indicator on active transport button
- **Progress Bar Luminous Head** — Pulsing gold cursor on playback progress
- **Idle Standby Pulse** — Breathing ♪ glyph when media player idle

#### Alarm Panel Enhancements
- **Red Alert Frame Strobe** — Panel border + box-shadow strobe on `triggered` state (1s cycle)
- **Shield Icon Reactive Glow** — `drop-shadow` glow keyed to alarm state (ice=disarmed, butterscotch=armed, tomato=triggered)
- **Keypad Tactile Flash** — Digit preview floats up on key press
- **Countdown Urgency Escalation** — Color + animation intensity escalates as countdown decreases (calm → elevated → high → critical)
- **Zone Status Micro-Pips** — 6px colored dots for zone OK/bypass/fault status

#### Weather Panel Enhancements
- **Condition Ambient Glow** — Radial background glow keyed to weather condition with storm flicker (4s cycle per Worf M2)
- **Wind Compass Needle** — CSS-animated compass with gust oscillation
- **Forecast Range Bars** — Staggered `scaleY` grow animation for daily forecast bars
- **Sun Arc** — SVG sunrise/sunset arc with tracking dot
- **Precipitation Pips** — 10-pip grid showing precipitation probability

#### Pool/Spa Panel Enhancements
- **Water Caustic Shimmer** — Radial gradient overlay with drift animation on pool viewscreen
- **Heating Active Indicator** — Gradient heat bar with flow animation when heating
- **Chemistry Sensor Badges** — Color-coded OK/warn/critical badges with pulse on critical
- **IntelliBrite Swatch Glow** — Active color swatch glow effect
- **Pump Spinner** — 3-dot rotating spinner on primary pump button (Data R-6: primary only)

#### Irrigation Panel Enhancements
- **Barberpole Flow** — Animated diagonal stripe pattern on active zone fill bars
- **Zone Completion Flash** — Fade-out confirmation when a zone run completes
- **Schedule Countdown Proximity Glow** — Text-shadow intensity scales with proximity to next run
- **Rain Delay Badge** — Cloud-bob animated badge with delay duration

#### Atmoscrubber / Environment Panel Enhancements
- **Particle System** — 6 floating particles inside the atmoscrubber cylinder, parameterized via CSS custom properties (speed, drift, size, opacity), disabled when idle
- **AQI Cylinder Glow** — Inner box-shadow keyed to air quality color with warn pulse
- **Filter Life Segments** — Segmented bar for filter life with critical pulse
- **Sparkline Scan-Draw** — Stroke-dasharray draw-on animation for sparkline paths
- **Preset Mode Wipe** — Fill wipe transition on active preset button

#### Air Purifier Panel Enhancements
- **Sensor Row Stagger** — Cascade-in entry animation with 80ms stagger per row

#### Temp/Humidity Grid Enhancements
- **Tile Comfort Glow** — Warm/cool ambient glow keyed to comfort class (COMFORT_COLORS whitelist per Worf R1)
- **Floor Label Scan-In** — `scaleX` reveal animation staggered per floor
- **Sparkline Draw-On** — Stroke-dashoffset draw animation with tile-index stagger
- **Summary Row Pulse** — Ambient border pulse on summary rows
- **Hot/Cold Alert Pulse** — Dual animation (alert + glow) on tiles exceeding threshold
- **Value Change Ripple** — Box-shadow inset ripple when tile value changes

#### Battery Panel Enhancements
- **Sensor Pill Badges** — Label+value pill format with value flash on change
- **Charge State Glow** — Box-shadow glow keyed to charge level (high=ice, medium=golden-orange, low=tomato)

### Security & Accessibility
- **WCAG 2.3.1 compliant** — All flash animations ≥0.5s cycle (alarm shield, urgency critical), verified by Worf M1
- **`prefers-reduced-motion`** — Comprehensive overrides: ambient loops disabled, confirmations halved, static fallbacks for color state, HVAC pulse specificity gap fixed
- **`aria-hidden="true"`** — All decorative elements (numeric codes, pip strips, particles, waveform, pump spinner)
- **COMFORT_COLORS whitelist** — Only pre-approved CSS variables reach `style.setProperty()` for comfort tile colors (Worf R1)
- **`getRainDelayInfo()`** — `Number()` + `!isNaN()` guard prevents raw entity data in CSS (Worf M4)
- **No innerHTML/unsafeHTML** — All rendering via LitElement `html` tagged template auto-escaping (Worf R5)
- **`color-mix()` fallback** — HVAC pulse keyframe includes fallback `border-color` for browsers without `color-mix()` support
- **Contrast fix** — Chemistry critical badge changed from white-on-tomato (3.3:1) to black-on-tomato (5.2:1) per WCAG AA
- **Reflow fix** — Value change ripple uses `box-shadow: inset` instead of `border-left-width` animation to avoid layout thrash

---

## [4.11.0] — 2026-04-13

### Added — New Device Panels & Shared Utilities

#### Shared Utility Modules (Phase 0)
- **`lcars-color-utils.js`**: 13 pure color resolver functions extracted from spec definitions — `getStateColor()`, `getAqiColor()`, `getAqiLabel()`, `getCo2Color()`, `getTempColor()`, `getHumidityColor()`, `getComfortColor()`, `getHvacActionColor()`, `getAlarmStateColor()`, `getPlaybackStateColor()`, `getPoolBodyColor()`, `getWeatherConditionColor()`, `getIrrigationZoneColor()`
- **`lcars-entity-utils.js`**: Extensible panel type detection registry replacing hardcoded `_getDevicePanelType()` cascade. Priority-ordered detectors: camera → alarm → pool/spa → climate → media → environment → irrigation → weather → battery. Exports all domain sets, panel type constants, and display labels
- **`lcars-service-utils.js`**: `clampSetpoint()` (range validation with absolute bounds), `createRateLimiter()` (token-bucket pattern), `createDebouncer()` (setpoint change collapsing)
- **`lcars-sparkline.js`**: Shared SVG sparkline renderer and `fetchSparklineData()` with TTL cache, extracted from environment panel
- **`lcars-weather-utils.js`**: `fetchForecasts()` wrapper for `weather.get_forecasts` with 10-minute TTL cache and fallback to older service call API

#### New Panel Types (Items 4–7, 10–11)
- **Climate Panel** (Item 5, CRITICAL): Thermostat support for Nest, Ecobee. SVG temperature arc with dynamic HVAC action colors (heating=butterscotch, cooling=ice), setpoint controls with debouncing and clamping, HVAC mode/fan mode/preset mode radiogroup strips, fault sensor display. Dual setpoint support for heat_cool mode
- **Alarm Panel** (Item 6, HIGH): SimpliSafe/Honeywell/Ring support. SVG shield icon with state symbol, PIN keypad with 3-attempt/60s rate limiter (Worf mandate), arm mode selector strip, zone sensor roster, countdown timer for arming/pending states, triggered pulse animation, keyboard capture for physical keypad input
- **Media Panel** (Item 4, MEDIUM): Apple TV, HomePod, Sonos support. Album art viewscreen with Worf-mandated URL validation (`/api/` or `/local/` only), transport controls (play/pause/prev/next/shuffle/repeat) gated by `supported_features` bitmask, click-to-set volume bar with keyboard arrow support, source/shuffle/repeat metadata display
- **Pool & Spa Panel** (Item 7, HIGH): Pentair ScreenLogic support. 3-column layout (chemistry/aquatics/controls) or 2-column (no-chem variant), dual viewscreen bodies (pool=ice, spa=butterscotch) with setpoint controls, circuit toggles, chemistry sensor readouts, pool lighting controls
- **Weather Panel** (Item 10, MEDIUM): Davis Instruments, WeatherFlow support. SVG weather display with condition glyph and temperature, wind compass SVG with directional arrow, 7-day forecast strip with range bars and precipitation probability, sensor roster for lightning/precipitation/wind/pressure
- **Irrigation Panel** (Item 11, LOW): Rachio zone support. Zone list with START/STOP buttons, active zone fill bar, zone status colors, schedule info sidebar, standby toggle, rate-limited zone switching

### Changed
- **Refactored imports**: Homepage card now imports constants, domain sets, and labels from shared `lcars-entity-utils.js` instead of inline definitions
- **`_getSensorIndicatorColor()`**: Delegates to shared `getStateColor()` from `lcars-color-utils.js`
- **`_getDevicePanelType()`**: Delegates to shared `classifyDevice()` from `lcars-entity-utils.js`
- **`_getSparklineData()`**: Delegates to shared `fetchSparklineData()` from `lcars-sparkline.js`
- **`_renderSparkline()`**: Delegates to shared `renderSparkline()` from `lcars-sparkline.js`
- **Panel detection priority**: Now runs 9 detectors in specificity order (camera → alarm → pool/spa → climate → media → environment → irrigation → weather → battery) with first-match-wins

### Security
- **Alarm PIN**: Never logged, never in DOM attributes, input sanitized to digits-only, maxLength=6, rate-limited to 3 attempts per 60 seconds (Worf review)
- **Media artwork**: URL validation restricts to `/api/` or `/local/` paths, `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` on `<img>` elements (Worf review)
- **Setpoint clamping**: All temperature setpoints validated against entity `min_temp`/`max_temp` attributes with absolute safety bounds (Worf review)
- **Service call rate limiting**: Token-bucket pattern prevents rapid-fire service calls from climate setpoints, alarm PIN attempts, and irrigation zone toggles

## [4.10.3] — 2026-04-12

### Fixed
- **Elbow alignment**: Widened top and bottom elbow stems (`--lcars-elbow-w` 9.5rem → 10.5rem) to visually align with sidebar area button length
- Removed extra `+2rem` from elbow inner cutout formula; inner curve radius reduced to 1.5rem to match `--lcars-btn-radius`

## [4.10.2] — 2026-04-12

### Fixed (MEDIUM / LOW priority audit items)
- **Accessibility (P1)**: Semantic headings — `<h2>` for area/floor headers, `<h3>` for device names, `role="heading" aria-level="4"` for domain labels
- **Accessibility (P2)**: Replaced `role="main"` on `.lcars-frame` div; changed `.lcars-content` from `<div>` to `<main>` element
- **Accessibility (P6)**: Added `aria-hidden="true"` to decorative bars (`.lcars-header-bar`, `.lcars-footer-bar`, `.lcars-footer-endcap`)
- **Accessibility (P8/P9)**: Changed `.battery-section-label`, `.lcars-empty`, and `.sidebar-unassigned-label` from `--lcars-gray` to `--lcars-sky` for better contrast
- **Accessibility (O1/R2)**: `.battery-total-line` elements got `tabindex="0"`, `role="button"`, `@keydown` for keyboard activation
- **Accessibility (O2/R1)**: Both battery slider instances got `role="slider"`, `aria-valuemin/max/now`, `aria-labelledby`, `@keydown` with Arrow/Home/End support
- **Accessibility (O3)**: Added `@keydown` to 5 sensor-line instances in environment and battery panels for keyboard interaction
- **Accessibility (O4)**: Edit pips got `tabindex="0"`, `role="button"`, `aria-label`, `@keydown`, `:focus-visible` CSS
- **Security (W-L1)**: Changed two `_LOGGER.warning()` calls to `_LOGGER.debug()` to avoid leaking entity lists in production logs

## [4.10.1] — 2026-04-12

### Fixed (HIGH / CRITICAL priority audit items)
- **Data (D1)**: Added `_configLoading` guard to prevent duplicate configuration fetches during rapid hass updates
- **Data (D5)**: Capped `_envHistoryCache` at 20 entries with oldest-eviction to prevent unbounded memory growth
- **Data (D8)**: Division-by-zero guard in `_renderSensorBar()` when `min === max`
- **Data (D9)**: Removed dead `_cards` property from properties, constructor, and hass setter
- **Data (D7)**: `_elbowPressTimer` cleared in `disconnectedCallback()` to prevent timer leaks
- **Data (D10)**: `openEditPopup` MutationObserver now has 5-minute safety timeout to prevent indefinite observation
- **Security (W-H1)**: `_validate_path_component` applied to 21 vol schemas for path-sensitive fields; `_safe_path()` defense-in-depth added to `delete_blueprint` and `remove_more_page` handlers
- **Security (W-H2)**: `SandboxedEnvironment` Jinja2 loader scoped to HA config directory (was `/`); lazy-initialized via `_get_jinja_env()` with `init_jinja_env(config_dir)` at startup
- **Security (W-M1)**: `@websocket_api.require_admin` added to `websocket_get_configuration` and `websocket_get_blueprints`

## [4.9.0] — 2026-04-12

### Added
- **Floor-Grouped Area Navigation**: Sidebar area buttons are now grouped under floor headers, sorted by floor `level` from the HA floor registry
- Floor header buttons (lilac) act as clickable selectors — click a floor to see a combined view of all areas on that floor
- Click an area under a floor to drill down to the standard single-area view; selections are mutually exclusive (floor clears area, area clears floor)
- `_getAreasGroupedByFloor()` groups areas by `hass.floors`, sorts by `level`, unassigned areas rendered at bottom under "Unassigned" label
- `_selectFloor()` / `lcars-floor-selected` event dispatched via private event bus
- **Floor Combined View**: `_renderFloorView(floorId)` renders a floor-level header (lilac) with all areas as subsections, each showing their full entity content
- `_getFloorAreaIds(floorId)` helper resolves all area IDs belonging to a floor
- Entity cache upgraded from single-entry to `Map`-based — supports concurrent multi-area resolution in floor view
- Auto-deselects deleted floors (mirrors existing area auto-deselect behavior)
- Mobile responsive: floor buttons render in horizontal scroll strip alongside area buttons
- CSS: `.sidebar-floor-btn` (lilac, 70% height), `.sidebar-unassigned-label`, `.content-floor-panel`, `.content-floor-header`, `.floor-area-section`, `.floor-area-subheader`

## [4.8.0] — 2026-04-12

### Added
- **Environment / Atmoscrubber Panel**: Auto-detects air quality devices (Awair, VeSync purifiers, etc.) and renders a dedicated environment panel per device in area views
- AQ detection heuristic: ≥2 AQ-class sensors (CO₂, VOC, PM2.5, PM10, AQI) OR ≥1 AQ sensor + fan domain → `PANEL_TYPE_ENVIRONMENT`
- Entity partitioning via `_partitionEnvironmentEntities()` → score, airQuality, telemetry, controls, diagnostics buckets
- **Atmoscrubber cylinder**: CSS-animated reactor with two-layer radial-gradient particle system, `--scrubber-hue` color interpolation (green=good → red=hazardous), speed tied to fan percentage
- Idle state: dimmed particles with breathing glow animation; `prefers-reduced-motion` pauses all animations
- AQI color mapping: 0-50 ice, 51-100 sunflower, 101-150 butterscotch, 151-200 peach, 201+ tomato
- **24h sparklines**: Hourly mean statistics via `recorder/statistics_during_period` WebSocket call, rendered as SVG polylines with 5-minute cache per device
- Fan controls: toggle button + preset mode radio group (`role="radiogroup"`) with validation against entity's own `preset_modes` attribute
- Switch controls (display, child lock) rendered as standard toggle pills
- Sensor-only devices (e.g., Awair with no fan) automatically collapse the controls column via `.sensor-only` grid variant
- **Panel ordering**: New `PANEL_TYPE_ORDER` constant sorts panels as camera → environment → battery in split layout
- Grid layout: `header | sensors core controls | sparklines` — mirrors battery panel structure

## [4.7.0] — 2026-04-11

### Added
- **Battery Panel Config/Diagnostic Entities**: Battery warp core panels now discover and display `entity_category: "config"` and `"diagnostic"` entities for each battery device
- New `_getDeviceCategoryEntities(deviceId)` method fetches config/diagnostic entities per device, respects `disabled_by` and user `hidden_by`, allows integration-hidden through (since HA hides config/diagnostic by default)
- `_partitionBatteryEntities()` updated — now returns `configControls`, `diagnostics` alongside existing SOC/power/telemetry partitions
- Diagnostic sensors render below telemetry with "DIAGNOSTICS" divider label
- Config controls (number sliders, select dropdowns, switches) render below operational controls with "CONFIG" divider label
- **LCARS Option Strips**: Select entities render as pill button rows (gold = active, gray = inactive) with `role="radiogroup"` ARIA semantics — calls `select.select_option` on click
- New CSS: `.battery-section-divider`, `.battery-section-label`, `.lcars-option-strip`, `.lcars-option-btn`

## [4.6.2] — 2026-04-11

### Fixed
- **Hidden entities now properly filtered**: Added `e.hidden` (runtime boolean) check alongside existing `e.hidden_by` (registry string) in `_getAreaEntities()` — fixes entities like Kasa switch_as_x conversions and hidden switches still appearing in area views

## [4.6.1] — 2026-04-11

### Added
- **Name shortening**: `_shortenName()` iteratively strips area name and device name prefixes from entity friendly names (case-insensitive, longest-first, handles `-`/`–`/`:` separators). "Office Light" → "Light", "BigBoy-DPU AC Charging Power" → "AC Charging Power"
- `_friendlyName()` now routes through `_shortenName()` — all 13+ call sites benefit automatically
- `_shortDeviceName()` strips area name from device display names in panel/group headers

## [4.6.0] — 2026-04-11

### Added
- **Warp Core Battery Panel**: Full battery device panel with EcoFlow auto-detection
- Battery device detection via `_getDevicePanelType()` — triggers on devices with ≥2 of: battery SoC, power, energy, or voltage entities
- `_partitionBatteryEntities()` separates entities into SOC gauge, power-in, power-out, telemetry sensors
- Center visualization: CSS warp core reactor with charge-level-dependent color (blue < 20%, gold 20-80%, green > 80%) and pulsing glow animation
- SOC percentage display overlaid on reactor core
- Power flow I/O section with directional arrows showing charging/discharging state
- Telemetry sensors displayed in left column, operational controls (switches/numbers) in right column
- Grid layout: `header | sensors core controls | ioflow`

## [4.5.0] — 2026-04-11

### Added
- **Configuration Mode**: Admin-only edit mode accessible via CONFIGURE pill button in sidebar or long-press (800ms) on the top-left elbow
- Header bar and top elbow shift to lilac when configuration mode is active; header text shows "LCARS · CONFIGURATION MODE"
- Edit pips (lilac dots) appear on every entity element and device header when in edit mode — click to open the edit popup
- Entity edit popup: edit entity icon, display name, and entity ID via `lcars-edit-entity-card`
- Device edit popup: edit device icon and display name via `lcars-edit-device-button-card`
- Header edit popup: click the LCARS header title in edit mode to configure header via `lcars-edit-homepage-header-card`
- `openEditPopup()` helper in `lcars-helpers.js` — creates `lcars-popup` overlay with auto-cleanup on close

### Security
- **Critical**: Added `@websocket_api.require_admin` to all 29 write-capable WebSocket handlers — previously any authenticated HA user (including guests) could write YAML config files to disk

## [4.4.6] — 2026-04-11

### Fixed
- **CONFIGURATION ERROR resolved**: Removed non-standard top-level keys from `ui-lovelace.yaml` (`lcars_dashboard`, `button_card_templates`, `apexcharts_card_templates`, `lovelace-background`) that HA 2025.x+ Lovelace config validation rejects
- Debug log noise: Added `_is_our_file()` filter in `process_yaml.py` so the global YAML loader patch only debug-logs LCARS-related files (eliminates 40+ core HA services.yaml entries)
- Comprehensive debug logging across Python backend (`__init__.py`, `process_yaml.py`, `load_dashboard.py`, `load_plugins.py`) and JS frontend (`lcars-dashboard.js`, `lcars-dashboard-layout.js`, `lcars-homepage-card.js`)
- Debug flag auto-sync: Python sends `debug` boolean in websocket `configuration/get` response; JS reads it and sets `window.__LCARS_DEBUG`
- Enhanced error handling in `process_yaml.py` with separate catches for YAMLError, UnicodeDecodeError, Jinja2 template errors

## [4.4.5] — 2026-04-11

### Added
- Two-column split layout: entities displayed on the left, camera panels on the right

## [4.4.4] — 2026-04-11

### Added
- Auto-refresh camera still images every 10 seconds using `IntersectionObserver` (only refreshes visible cameras)

## [4.4.3] — 2026-04-11

### Fixed
- Camera image caching: added cache-busting timestamp query parameter to prevent stale/wrong camera feeds
- Camera error handling: graceful fallback when camera entity is unavailable or stream fails

## [4.4.2] — 2026-04-10

### Fixed
- Added structured debug logging across Python and JS modules
- Removed stray quote on line 733 causing SyntaxError in JS bundle

## [4.4.1] — 2026-04-10

### Fixed
- Dynamic area handling — areas now update correctly when HA area registry changes
- Fixed Configuration Error on initial dashboard load

## [4.4.0] — 2026-04-10

### Security
- **Critical**: Switched Jinja2 template engine from `Environment` to `SandboxedEnvironment` in `process_yaml.py` to prevent Server-Side Template Injection (SSTI)
- Replaced `window` event dispatch with private `lcarsEventBus` (`EventTarget`) for inter-component communication — prevents event injection from untrusted cards/extensions
- Added path validation helpers (`_validate_path_component`, `_safe_path`) in `__init__.py` for websocket API file operations
- Added `_read_yaml_file` / `_write_yaml_file` helpers with proper `with` blocks — fixed 4 file handle leaks in `websocket_get_configuration`
- Added missing `TemplateError` import in `notifications.py` (was catching an unimported exception — would crash at runtime)

### Performance
- Entity caching in homepage card: `_getAreaEntities()` now returns cached results when area and registries haven't changed
- Cache busted only when `hass.entities` or `hass.devices` references change (not on every state update)
- Disabled webpack source maps in production (`devtool: false`) — reduces bundle size

### Accessibility
- Sidebar area buttons: `role="group"` with `aria-pressed` on each button
- Toggle pills: `role="switch"` + `aria-checked` + descriptive `aria-label`
- Camera frames: `role="button"` + `tabindex="0"` + keyboard handler (Enter/Space)
- Content region: `aria-live="polite"` for screen reader announcements on area change
- Footer text: improved color contrast (`lcars-sky` instead of `lcars-gray`)

### Fixed
- Cleaned unused imports across Python modules (`time`, `shutil`, `ThreadPoolExecutor`, `asyncio`, `aiofiles.os.scandir`, duplicate `logging`, `entity_registry`, `discovery`, `aiofiles`)
- Layout element registration uses `Promise.race` with 5-second timeout fallback instead of fragile `customElements.whenDefined` chain

## [4.2.2] — 2026-04-10

### Fixed
- Removed deprecated `window.loadCardHelpers()` calls that broke all card registration on HA 2024.8+
- Removed `Promise.race(waitForHelpers)` async wrappers from all 22 card components — cards now register immediately
- Added `createCardElement()` utility in `lcars-helpers.js` for modern HA compatibility (direct element creation with `loadCardHelpers` as guarded fallback)
- Fixed orphaned `});` closure that prevented homepage card class from registering after wrapper removal

## [4.2.1] — 2026-04-10

### Fixed
- Area selection not reaching homepage card — HA wraps cards in `hui-card` elements, so direct property assignment on the wrapper never reached the inner component
- Switched layout→card communication from direct property setting to `window` custom events (`lcars-area-selected`)
- Homepage card now listens via `connectedCallback`/`disconnectedCallback` lifecycle hooks

## [4.2.0] — 2026-04-10

### Added
- Sidebar area navigation: areas listed as pill buttons in the left sidebar (replacing old SYSTEM/STATUS placeholders)
- Content detail panel: clicking an area shows its entities in the main content area to the right
- Scrollable sidebar with CSS mask-image fade and custom 4px scrollbar
- Mobile responsive: area buttons collapse to horizontal scrollable row on narrow viewports
- LCARS design compliance (per Geordi La Forge consultation):
  - Sidebar buttons: `almond-creme` base color, `gold` when active
  - Content header: gold text with `data-accent` rule below
  - Content panel: reuses `lcars-cascade-in` animation

### Changed
- Homepage card converted from area-button-list to content-only renderer
- Layout component fully rewritten with LCARS frame grid (elbow + header + sidebar + content + footer + elbow)
- Removed `_selectArea()` and `_renderArea()` from homepage card (now handled by layout)

## [4.1.0] — 2026-04-10

### Added
- Domain-specific entity renderers:
  - **Camera** — LCARS-framed live feed with viewscreen activation animation
  - **Light/Switch/Fan/Lock** — Toggle pills with on/off state and heartbeat pulse
  - **Sensor/Binary Sensor** — Data readout bars with segmented fill animation
  - **Climate** — Thermostat panel with temperature display
  - **Cover** — Position controls (open/close/stop)
  - **Media Player** — Media strip with playback info
  - **Generic** — LCARS button fallback for all other domains
- 6 LCARS animations: cascade reveal, scan sweep, viewscreen activation, heartbeat pulse, distress pulse, segmented sensor bars
- Device-grouped entity layout: entities sorted by device, then by domain within each device
- `entity_category` filter to skip diagnostic/config entities from area views
- `_groupEntities()` and `_groupByDomain()` helper methods
- Domain sort priority (cameras first, sensors last)
- `prefers-reduced-motion` support — all animations disabled for accessibility

## [4.0.2] — 2026-04-10

### Fixed
- Entity count showing 0 for all areas — `_getAreaEntities()` only checked `entity.area_id`, missing device-inherited area assignments
- Built `areaDeviceIds` set from `hass.devices` to match entities via `device_id`
- Layout clipping when areas expanded — changed CSS Grid `auto-fill` to flexbox column

## [4.0.1] — 2026-04-10

### Fixed
- Added missing `setConfig()` method to homepage card (fixed `CONFIGURATION ERROR`)
- Version bump for browser cache bust (old JS served from CDN cache with same version query string)

## [4.0.0] — 2026-04-10

### Changed
- **Full rebrand**: `dwains_dashboard` → `lcars_dashboard` across all Python, JS, YAML, and config files
- New LCARS visual design: elbows, pill buttons, header/footer bars, LCARS color palette (40+ CSS custom properties)
- All 24 Lit web components rewritten with LCARS styling
- Self-contained dependencies: Antonio font, lit-element, SortableJS, MDI icons vendored locally
- Webpack 5 multi-entry build outputting single `lcars-dashboard.js` bundle
- Shared style tokens in `lcars-styles.js` and utility functions in `lcars-helpers.js`

### Added
- `lcars-dashboard-layout` — Main LCARS frame view layout (registered as Lovelace view type)
- `lcars-homepage-card` — Area-based homepage with entity rendering
- `lcars-navigation-card` — Sidebar navigation buttons
- HACS integration support with proper `manifest.json` and `hacs.json`
- Full attribution for upstream Dwains Dashboard and all third-party components

## [3.9.0] — Pre-rebrand

### Added
- Initial LCARS UI implementation: all 24 Lit components, shared styles, helpers, webpack bundle
- Foundation for the LCARS rebrand built on top of Dwains Dashboard v3.8.0
