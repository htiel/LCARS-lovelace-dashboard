# Changelog

All notable changes to the LCARS Dashboard project are documented here.

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
