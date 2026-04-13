# LCARS Dashboard — Implementation Plan v4.11+

> **Captain's Log**: Plan formulated stardate 2026.04.13.  
> All specs reviewed and approved. Shared utilities extraction underway.  
> Implementation proceeds bottom-up: enablers → critical panels → remaining domain panels.

---

## Executive Summary

8 new device panel types to implement (to-do items 4–11), based on 11 spec documents in `specs/`. All specs are status **"REVISED — Ready for Implementation"** with sign-off from Geordi (UI/a11y), Worf (security), Data (architecture), and Wesley (creative/final pass).

**Current bundle**: 203 KiB  
**Projected bundle**: ~239 KiB (+17.7%)  
**Architecture**: LitElement v2 web components, webpack 5, single-bundle HACS distribution  
**Main file**: `lcars-homepage-card.js` (3,140 lines) — all panel renderers live here  

---

## Phase 0 — Shared Utilities (Enablers)

**Objective**: Extract reusable modules that ALL new panels depend on. Must ship before any panel work begins.

| Story | File | Description | Complexity | Status |
|-------|------|-------------|------------|--------|
| 0.1 | `lcars-color-utils.js` | 13 color resolver functions (AQI, HVAC, alarm, media, pool, weather, irrigation, comfort) | S | ✅ CREATED |
| 0.2 | `lcars-entity-utils.js` | `classifyEntities()` — routes entity groups to panel type. Replaces `_getDevicePanelType()` with extensible registry. Entity partition helpers per panel. | M | 🔲 TODO |
| 0.3 | `lcars-service-utils.js` | `clampSetpoint()` — range validation. `createRateLimiter()` — throttle service calls (climate, alarm PIN, irrigation). | S | 🔲 TODO |
| 0.4 | `lcars-sparkline.js` | SVG sparkline renderer — shared by atmoscrubber (refactor), weather, temp/humidity grid. Pure function: `renderSparkline(data, options)` → SVG `TemplateResult`. | M | 🔲 TODO |
| 0.5 | `lcars-weather-utils.js` | `fetchForecasts()` — `weather.get_forecasts` WS wrapper with TTL cache. Used by weather panel only but isolated for testability. | S | 🔲 TODO |

### Phase 0 Definition of Done
- [ ] All 5 utility modules created and exported
- [ ] Existing `_getSensorIndicatorColor()` in homepage card refactored to import `getStateColor()`
- [ ] Existing sparkline code in atmoscrubber panel refactored to import shared sparkline
- [ ] Webpack build succeeds, bundle size increase < 2 KiB from utility extraction alone
- [ ] Data reviews architecture of all utility modules

---

## Phase 1 — Critical + Quick-Win Panels

**Objective**: Ship the highest-impact panels first. Climate is CRITICAL (Eric's 3 Nest thermostats). Alarm is HIGH (security-sensitive). BlueAir is a quick verification patch.

### 1.1 Climate Panel (Item 5) — CRITICAL / XL

**Spec**: `specs/LCARS-CLIMATE-PANEL-SPEC.md`  
**Entities**: `climate.*` (Nest, Ecobee thermostats)  
**Frame color**: Dynamic per `hvac_action` via `getHvacActionColor()`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 1.1.1 | Panel type detection: add `PANEL_TYPE_CLIMATE` to entity classifier | 0.2 | Data |
| 1.1.2 | Partition function: `_partitionClimateEntities()` — thermostat, aux sensors, humidity | 0.2 | Data |
| 1.1.3 | Temperature arc SVG — current temp display with setpoint indicators | 0.1 | Geordi |
| 1.1.4 | HVAC mode selector strip — heat/cool/auto/off pill buttons | 0.1, 0.3 | Geordi, Worf |
| 1.1.5 | Setpoint controls — up/down with clamping, rate-limited service calls | 0.3 | Worf |
| 1.1.6 | Aux sensor readouts — humidity, occupancy from Nest | 0.1 | Geordi |
| 1.1.7 | CSS grid layout + dynamic frame color | — | Geordi |
| 1.1.8 | Integration test with Nest entities | All above | Data |

**Acceptance Criteria**:
- Renders for any `climate.*` entity with correct HVAC action colors
- Setpoint changes are clamped to `[min_temp, max_temp]` from entity attributes
- Service calls rate-limited to 1 per 2 seconds
- Keyboard accessible (arrow keys for setpoint, Enter for mode)
- Frame color transitions smoothly on HVAC action change

### 1.2 Alarm Panel (Item 6) — HIGH / XL

**Spec**: `specs/LCARS-ALARM-PANEL-SPEC.md`  
**Entities**: `alarm_control_panel.*` (SimpliSafe)  
**Frame color**: Dynamic per alarm state via `getAlarmStateColor()`  
**Security**: PIN keypad requires Worf MANDATORY sign-off

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 1.2.1 | Panel type detection: add `PANEL_TYPE_ALARM` to entity classifier | 0.2 | Data |
| 1.2.2 | Partition function: `_partitionAlarmEntities()` — panel, sensors, entry sensors | 0.2 | Data |
| 1.2.3 | PIN keypad UI — 0-9 grid, clear, submit, maxLength=6 | — | Geordi, **Worf** |
| 1.2.4 | PIN handling — rate limiter (3 attempts/60s), input sanitization, no logging | 0.3 | **Worf** |
| 1.2.5 | Arm/disarm mode selector — home/away/night/off buttons | 0.1, 0.3 | Worf |
| 1.2.6 | Countdown timer — arming/pending state with visual countdown, clamped to 0 | — | Geordi |
| 1.2.7 | Sensor roster — entry sensors with state indicators | 0.1 | Geordi |
| 1.2.8 | CSS grid layout + dynamic frame color + triggered animation | — | Geordi |
| 1.2.9 | Security review — full Worf audit of PIN flow, input sanitization, timing | All above | **Worf** |

**Acceptance Criteria**:
- PIN never appears in logs, DOM attributes, or state
- PIN input sanitized to digits only, maxLength=6
- Rate limiter: max 3 PIN attempts per 60 seconds, then cooldown with visual feedback
- Countdown clamped to 0 (never negative)
- `triggered` state pulses alert animation
- Full keyboard navigation for PIN entry

### 1.3 BlueAir Verification (Item 8) — MEDIUM / S

**Spec**: `specs/LCARS-AIR-PURIFIER-VERIFICATION-SPEC.md`  
**Scope**: 3 optional patches to existing atmoscrubber panel for BlueAir compatibility

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 1.3.1 | Verify BlueAir entity patterns against atmoscrubber detection logic | — | Data |
| 1.3.2 | Add BlueAir-specific entity_id patterns to `AQ_ENTITY_SUFFIX_RE` if needed | — | Data |
| 1.3.3 | Test with BlueAir entity mocks | 1.3.2 | Data |

**Acceptance Criteria**:
- BlueAir purifiers detected and rendered by existing atmoscrubber panel
- No regression for VeSync (existing) purifiers
- PR includes entity_id examples from BlueAir integration

---

## Phase 2 — Domain Expansion

**Objective**: Add remaining HIGH and MEDIUM panels. Media card is a standalone Lovelace card (not homepage panel), so it's parallelizable.

### 2.1 Media Card (Item 4) — MEDIUM / L

**Spec**: `specs/LCARS-MEDIA-CARD-SPEC.md`  
**Type**: Standalone Lovelace card (NOT a homepage device panel)  
**Entities**: `media_player.*` (Apple TV, HomePod, Sonos)  
**Frame color**: Dynamic per playback state via `getPlaybackStateColor()`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 2.1.1 | Create `lcars-media-card.js` — new standalone card file | — | Data |
| 2.1.2 | Album art display + backdrop blur | — | Geordi |
| 2.1.3 | Transport controls — play/pause/prev/next/volume | 0.3 | Geordi, Worf |
| 2.1.4 | Source selector — input_source list | — | Geordi |
| 2.1.5 | Group/ungroup controls for Sonos/HomePod | — | Data |
| 2.1.6 | Add to webpack entry + register custom element | 2.1.1 | Data |
| 2.1.7 | Editor card for card picker configuration | 2.1.1 | Data |

### 2.2 Pool/Spa Panel (Item 7) — HIGH / XL

**Spec**: `specs/LCARS-POOL-SPA-PANEL-SPEC.md`  
**Entities**: Pentair ScreenLogic (`climate.pool_heat`, `climate.spa_heat`, `switch.pool_pump`, sensors)  
**Frame color**: Dynamic per pool body via `getPoolBodyColor()`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 2.2.1 | Panel type detection: add `PANEL_TYPE_POOL` to entity classifier | 0.2 | Data |
| 2.2.2 | Partition function: `_partitionPoolEntities()` — pool body, spa body, pump, chemistry | 0.2 | Data |
| 2.2.3 | 3-column layout — pool / shared controls / spa | — | Geordi |
| 2.2.4 | Water temp display + setpoint controls | 0.1, 0.3 | Geordi, Worf |
| 2.2.5 | Pump mode selector — on/off/schedule | 0.3 | Worf |
| 2.2.6 | Chemistry readouts — pH, ORP, salt with color bands | 0.1 | Geordi |
| 2.2.7 | CSS grid layout + frame color | — | Geordi |

### 2.3 Temp/Humidity Grid (Item 9) — MEDIUM / M

**Spec**: `specs/LCARS-TEMP-HUMIDITY-GRID-SPEC.md`  
**Entities**: SwitchBot `sensor.temperature_*`, `sensor.humidity_*`  
**Frame color**: Static `var(--lcars-ice)`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 2.3.1 | Panel type detection: add `PANEL_TYPE_TEMP_GRID` to entity classifier | 0.2 | Data |
| 2.3.2 | Room grid layout — CSS grid of room cards with temp + humidity | 0.1 | Geordi |
| 2.3.3 | Comfort color coding — cells colored by `getComfortColor()` | 0.1 | Geordi |
| 2.3.4 | Sparkline history — 24h trend per room | 0.4 | Data, Geordi |
| 2.3.5 | CSS grid layout | — | Geordi |

---

## Phase 3 — Data Visualization

**Objective**: Weather and irrigation panels. Both depend on Phase 0 utilities.

### 3.1 Weather Panel (Item 10) — MEDIUM / M

**Spec**: `specs/LCARS-WEATHER-PANEL-SPEC.md`  
**Entities**: `weather.*` (Davis Instruments, WeatherFlow)  
**Frame color**: Dynamic per condition via `getWeatherConditionColor()`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 3.1.1 | Panel type detection: add `PANEL_TYPE_WEATHER` to entity classifier | 0.2 | Data |
| 3.1.2 | Current conditions display — temp, humidity, wind, pressure | 0.1 | Geordi |
| 3.1.3 | Forecast strip — 5-day forecast using `fetchForecasts()` | 0.5 | Data |
| 3.1.4 | Sparkline trends — temp/humidity 24h | 0.4 | Geordi |
| 3.1.5 | CSS grid layout + dynamic frame color | — | Geordi |

### 3.2 Irrigation Panel (Item 11) — LOW / M

**Spec**: `specs/LCARS-IRRIGATION-PANEL-SPEC.md`  
**Entities**: Rachio `switch.zone_*`, `sensor.*`  
**Frame color**: Dynamic per active zone via `getIrrigationZoneColor()`

| Story | Description | Depends On | Reviewer |
|-------|-------------|------------|----------|
| 3.2.1 | Panel type detection: add `PANEL_TYPE_IRRIGATION` to entity classifier | 0.2 | Data |
| 3.2.2 | Zone strip — horizontal zone buttons with state colors | 0.1 | Geordi |
| 3.2.3 | Zone controls — start/stop with rate limiter | 0.3 | Worf |
| 3.2.4 | Run time display + schedule info | — | Geordi |
| 3.2.5 | CSS grid layout + frame color | — | Geordi |

---

## Dependency Graph

```
Phase 0 (Enablers)
├── 0.1 lcars-color-utils.js ✅
├── 0.2 lcars-entity-utils.js ─────┐
├── 0.3 lcars-service-utils.js ──┐ │
├── 0.4 lcars-sparkline.js      │ │
└── 0.5 lcars-weather-utils.js  │ │
                                 │ │
Phase 1 (Critical)               │ │
├── 1.1 Climate ←────────────────┴─┤
├── 1.2 Alarm ←──────────────────┴─┘
└── 1.3 BlueAir Verification (independent)

Phase 2 (Expansion)
├── 2.1 Media Card (independent — standalone card)
├── 2.2 Pool/Spa ← 0.1, 0.2, 0.3
└── 2.3 Temp Grid ← 0.1, 0.2, 0.4

Phase 3 (Visualization)
├── 3.1 Weather ← 0.1, 0.2, 0.4, 0.5
└── 3.2 Irrigation ← 0.1, 0.2, 0.3
```

---

## Risk Register

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Homepage card monolith (3140+ lines) | HIGH | HIGH | Extract each panel renderer to own module, homepage card imports and dispatches |
| Bundle exceeds 250 KiB | MED | MED | Measure after each phase; tree-shake unused functions; consider lazy loading for Phase 3 |
| PIN keypad security vulnerability | LOW | CRIT | Worf mandatory review; rate limiter in Phase 0; no PIN in logs/DOM/state |
| Climate setpoint out-of-range | MED | HIGH | `clampSetpoint()` in Phase 0; validate against entity `min_temp`/`max_temp` |
| BlueAir entity patterns differ significantly | LOW | LOW | Quick verification in Phase 1.3 before code changes |
| Sparkline performance with many rooms | MED | MED | `requestAnimationFrame` batching; max 20 sparklines visible |
| 5.x.x architectural conflict | LOW | HIGH | All Phase 1-3 work is additive (new panels), no 5.x breaking changes |

---

## Versioning Plan

| Phase | Version | Release Notes |
|-------|---------|---------------|
| Phase 0 complete | 4.11.0 | Shared utility modules (internal, no user-facing changes) |
| Climate panel | 4.12.0 | Climate/thermostat panel — Nest, Ecobee support |
| Alarm panel | 4.13.0 | Alarm panel — SimpliSafe with PIN keypad |
| BlueAir verification | 4.13.1 | BlueAir purifier compatibility |
| Media card | 4.14.0 | LCARS media player card |
| Pool/Spa panel | 4.15.0 | Pool/spa panel — Pentair ScreenLogic |
| Temp/Humidity grid | 4.16.0 | Room temperature/humidity grid |
| Weather panel | 4.17.0 | Weather panel — Davis, WeatherFlow |
| Irrigation panel | 4.18.0 | Irrigation panel — Rachio zones |

---

## Phase 0 Progress Tracker

- [x] **0.1** `lcars-color-utils.js` — 13 functions, 310 lines. Created by Data. ✅
- [x] **0.2** `lcars-entity-utils.js` — Entity classifier + panel type registry ✅
- [x] **0.3** `lcars-service-utils.js` — Setpoint clamper + rate limiter ✅
- [x] **0.4** `lcars-sparkline.js` — SVG sparkline renderer ✅
- [x] **0.5** `lcars-weather-utils.js` — Forecast fetcher with cache ✅
- [x] **Refactor** — Wire `getStateColor()` into homepage card, replace `_getSensorIndicatorColor()` ✅
- [x] **Refactor** — Extract sparkline from atmoscrubber into shared module ✅
- [ ] **Build** — Verify webpack build, measure bundle delta (pending user review)
- [x] **Review** — Data architecture review of all utility modules ✅

## Phase 1-3 Progress

- [x] **1.1** Climate Panel (Item 5) — CRITICAL / XL ✅
- [x] **1.2** Alarm Panel (Item 6) — HIGH / XL ✅
- [ ] **1.3** BlueAir Verification (Item 8) — MEDIUM / S (pending testing)
- [x] **2.1** Media Panel (Item 4) — MEDIUM / L ✅
- [x] **2.2** Pool/Spa Panel (Item 7) — HIGH / XL ✅
- [ ] **2.3** Temp/Humidity Grid (Item 9) — MEDIUM / M (standalone card, deferred to separate PR)
- [x] **3.1** Weather Panel (Item 10) — MEDIUM / M ✅
- [x] **3.2** Irrigation Panel (Item 11) — LOW / M ✅

## Status: v4.11.0 — Ready for review and commit
