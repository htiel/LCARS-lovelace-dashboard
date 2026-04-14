# Changelog

All notable changes to the LCARS Dashboard project are documented here.

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
