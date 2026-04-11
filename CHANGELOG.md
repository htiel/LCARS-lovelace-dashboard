# Changelog

All notable changes to the LCARS Dashboard project are documented here.

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
