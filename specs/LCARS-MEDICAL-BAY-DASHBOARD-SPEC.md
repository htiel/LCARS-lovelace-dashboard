# LCARS Medical Bay Dashboard — Design Specification

**Author**: Lt. Cmdr. Data (Architecture / Operations)
**Reviewed by**: Cmdr. William Riker (handoff to development)
**Coordination**: **Worf — privacy review REQUIRED before any Lit code is written** (see §7); Geordi (UI), Wesley (multi-source roadmap)
**Date**: Stardate 2026.05.04
**Status**: SHIPPED in v5.8.0 (Sickbay release). Initial structural skeleton landed in v5.3.0; multi-source rendering + Oura coverage in v5.7.2; readiness composite, rest-mode banner, enum-aware tiles, body-temp deviation, HRV balance / sleep efficiency / VO2 max / cardiovascular age / stress resilience, FILE ID label + status-pill legend, generalized `data-*` passthrough, and `--lcars-thermal-bloom` token in v5.8.0. Posterior + top-down SVG anchor paths (#117) remain deferred to 6.0 (`needs-external-artist`).
**Priority**: MEDIUM-HIGH
**Branch**: `5.0`
**Privacy class**: **PHI-adjacent** — opt-in, default-disabled, with non-negotiable design constraints in §7
**Extends**: `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` (shared component pattern), `LCARS-AUDIO-SPEC.md` (audio mode `medical`), `LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md` (depends on `<lcars-sparkline>` from that release)

---

## 0. Design Philosophy

The Medical Bay dashboard is modeled after the **canonical Star Trek LCARS medical displays** — *Medical Report*, *Anatomical Scan*, and *Biomedical Scan* (see §15 Reference Inspiration). Each shows the same disciplined pattern: a stylized humanoid silhouette, numeric callouts anchored to anatomical landmarks via leader lines, a left rail of metadata, and an optional thermal/density overlay highlighting anomalies. Dr. Crusher does not need an animated heart icon to know a patient is stable; she needs the **value, the unit, the trend, the threshold**, and a coordinate on the body to which it belongs.

This dashboard surfaces vitals from the Withings integration today (14 entities, one profile) and is architected to absorb additional profiles and additional medical platforms (Fitbit, Dexcom, Oura, Garmin Connect, Google Fit, Apple Health) without rewrite. The architectural unit is the **Biofunction Card** — one per HA `person.*` — composed of three vertical zones (Header, Silhouette + Callouts, Detail Stat Panel). Multi-user composition is a responsive grid of these cards; focus mode unlocks two additional canonical scan modes (Anatomical, Biomedical).

Per the Roddenberry mandate, *the ship takes care of you* — the panel reflects status, not adjustment. There are no setpoints, no thresholds to tune in this UI. Per Bracer Jack, **empty space is beautiful** — the silhouette breathes in black, callouts are sparse, and the detail tiles use generous letter-spacing.

Per the Lower Decks easter-egg convention (gated by `dashboard_options.easter_eggs: true`), the alternate header reads **"Tendi's Sickbay"**.

---

## 1. Goals

1. Render one **Biofunction Card** per enrolled crew member (HA `person.*`) — header / silhouette + anchored callouts / detail stat panel — with a responsive grid composition for households of N members.
2. Establish a `MEDICAL_PLATFORMS` discovery contract that the dashboard auto-extends as new medical integrations are added — same pattern as `POOL_SPA_PLATFORMS` (v5.0.2).
3. Provide a **gender-neutral humanoid silhouette** as a single inline SVG asset, color-tintable via CSS, with a documented 12-point anatomical anchor map so vital values render at the correct body coordinate.
4. Provide a **threshold engine** (`medical_thresholds.yaml`) so each profile's status pill (`NOMINAL`/`ELEVATED`/`ALERT`/`OFFLINE`) is derived from concrete numeric ranges with per-user overrides.
5. Establish PHI-adjacent privacy primitives (default-disabled dashboard, consent string, silhouette-render consent gate, screenshot redaction hook, per-user scope masking) that future health-data surfaces inherit.
6. Reuse `<lcars-sparkline>` shipped with Subspace Relay (5.2.0); add **one** new shared primitive (`<lcars-biofunction-silhouette>`) and no others.

## 2. Non-Goals

- **Not a medical record system.** No history beyond what HA already records via the recorder; no editing, no notes, no medication tracking.
- **Not a coaching app.** No goal-setting UI, no streak counters, no gamification. Goals are read from the source integration (e.g. `withings_weight_goal`) and shown only as reference lines.
- **Not a real-time alerting system.** Vitals never trigger HA notifications from this dashboard. If the user wants a "high BP" automation, they author it themselves; the dashboard is read-only.
- **Not multi-tenant within one HA install today.** Multi-profile is supported architecturally (§4) but profile-to-user authorization is the only privacy gate at first ship. Stronger isolation (separate dashboards per user) is deferred.

## 3. Dashboard Registration

| Field | Value |
|---|---|
| `key` (in `DASHBOARD_REGISTRY`) | `medical` |
| `title` | `Medical Bay` |
| `easter_egg_title` | `Tendi's Sickbay` |
| `subtitle` (LCARS frame) | `SICKBAY · BIOFUNCTION MONITOR` |
| `icon` | `mdi:medical-bag` |
| `url_path` | `lcars-medical` |
| `default_enabled` | **`False`** — explicit consent required (see §7.5) |
| `audio_mode` | `medical` (soft single-beep biobed pulse on data refresh; no transient chirps) |
| `MAX_DASHBOARDS` | 8 (already bumped by Subspace Relay) |

Sidebar grouping: top-level entry (parallel to other dashboards), but **only present in the sidebar when `default_enabled` is overridden to `True` in config-flow options**. When disabled, no sidebar entry, no panel registration, no URL listening.

---

## 4. Entity Contract

### 4.1 `MEDICAL_PLATFORMS` discovery set

Mirrors the `POOL_SPA_PLATFORMS` pattern from `lcars-entity-utils.js`. Researched against the HA Health category and HACS for v5.3.0; six canonical platforms are in scope, four deferred.

```js
// js/src/lcars-medical-utils.js
export const MEDICAL_PLATFORMS = new Set([
  'withings',        // CORE — BP, weight, body composition, sleep, workouts, HR
  'fitbit',          // CORE — steps, sleep stages, resting HR, calories, distance
  'dexcom',          // CORE — CGM blood glucose value + trend (per-user)
  'garmin_connect',  // HACS (cyberjunky) — 130+ sensors: BP, body comp, HRV, sleep, body battery, VO2max, stress, hydration
  'oura',            // HACS — sleep score, readiness, HRV, activity, body temp deviation
  'google_fit',      // HACS (YorkshireIoT) — steps, HR, sleep, weight
]);

// Deferred (no clean v5.3.0 entity contract; revisit for v5.4):
//   'whoop'              — no maintained HACS integration as of stardate 2026.05
//   'apple_health'       — requires Health Auto Export bridge → MQTT/webhook; entity ids are user-defined
//   'sleep_as_android'   — MQTT-only, no first-class HA integration
//   'smart_scale_*'      — renpho/eufy/etekcity/mi_band fragmented across BLE projects
```

### 4.1.1 Per-platform entity-id conventions

| Platform | HACS/Core | Entity ID prefix | Per-user? | Notable units |
|---|---|---|---|---|
| `withings` | Core | `sensor.<profile>_*` | Yes (one config entry per Withings account) | kg, mmHg, bpm, kcal, m |
| `fitbit` | Core | `sensor.<display_name>_*` (e.g. `_resting_heart_rate`, `_steps`) | Yes (one config entry per Fitbit user) | steps, bpm, kcal, hours |
| `dexcom` | Core | `sensor.dexcom_<USERNAME>_glucose_value` / `_glucose_trend` | Yes (one config entry per Dexcom Share user) | mg/dL or mmol/L |
| `garmin_connect` | HACS | `sensor.garmin_connect_*` (per-account prefix configurable) | Yes (multi-account supported) | bpm, ms, kg, kcal, mL/(kg·min), % |
| `oura` | HACS | `sensor.oura_*` (varies by fork) | Yes | score 0–100, ms, °C deviation |
| `google_fit` | HACS | `sensor.<email_localpart>_*` | Yes | steps, bpm, kcal, kg, hours |

All six platforms expose **per-user multi-account** semantics — critical for the household scenario. The `MEDICAL_PROFILES` resolver (§4.5) joins `person.user_id` ↔ `<platform>:<user_id>` for each enrolled platform; a single person may carry mappings into multiple platforms (e.g. Withings scale + Garmin watch + Dexcom CGM).

### 4.2 Pickup in `process_yaml.py` / `load_dashboard.py`

No special handling required in either file. The dashboard is registered like every other v5.x dashboard:

- `load_dashboard.py` already resolves `lovelace/ui-lovelace-{key}.yaml` for any non-habitat key. The new YAML is `lovelace/ui-lovelace-medical.yaml`.
- `process_yaml.py` Jinja2 preprocessing applies as for any LCARS YAML file (header `# lcars_dashboard`).
- `__init__.py` already exposes `hass.states` to the websocket; the card filters by `state.platform in MEDICAL_PLATFORMS` client-side. No new websocket commands required.

The contract lives in **JS** (`lcars-medical-utils.js`), not in Python. Adding a new platform to the set is a one-line frontend change — exactly the leverage the contract is designed for.

### 4.3 `MEDICAL_VITAL_CLASSES` — vital classifier

Independent of platform set, since each platform spreads across many `device_class` values. Keyed by `(platform, device_class | unit | entity_id_pattern)` → `vital_kind`. Each `vital_kind` declares a default **anchor slot** (see §6.5) — the silhouette renders the value at that body coordinate when present.

| `vital_kind` | Sources | Default anchor | Display | Sparkline tile? |
|---|---|---|---|---|
| `blood_pressure` | `withings:*systolic+diastolic*`, `garmin_connect:*blood_pressure_*` | `left_arm` | "118/76 mmHg" | yes (systolic) |
| `heart_rate` | `withings:*heart_pulse*`, `fitbit:*resting_heart_rate*`, `garmin_connect:resting_heart_rate` | `heart` | "62 bpm" | yes |
| `spo2` | `garmin_connect:latest_spo2`, `withings:*spo2*` | `right_arm` | "97 %" | yes |
| `respiration_rate` | `garmin_connect:latest_respiration`, `withings:*respiratory_rate*` | `throat` | "14 brpm" | no |
| `weight` | `withings:*weight*`, `garmin_connect:weight`, `google_fit:*weight*` | `abdomen` | "78.4 kg ▼0.3" | yes (goal reference line) |
| `weight_goal` | `withings:*weight_goal*` | (reference only) | reference line on weight sparkline | n/a |
| `body_fat_pct` | `withings:*fat_ratio*`, `garmin_connect:body_fat` | (tile only) | "22.4 %" | yes |
| `bmi` | `garmin_connect:bmi`, computed from weight + person.height | (tile only) | "24.1" | no |
| `hydration` | `garmin_connect:hydration`, `withings:*hydration*` | (tile only) | "1.4 / 2.5 L" | no |
| `sleep_score` | `oura:*sleep_score*`, `fitbit:*sleep_score*`, `garmin_connect:sleep_score` | `head_top` | "82 / 100" | yes |
| `sleep_duration` | `withings:*sleep_*hours*`, `fitbit:*sleep_minutes_asleep*`, `garmin_connect:sleep_duration` | (tile only) | "7h 14m" | yes |
| `hrv` | `oura:*hrv*`, `garmin_connect:hrv_last_night_average` | (tile only) | "48 ms" | yes |
| `vo2_max` | `garmin_connect:vo2_max` | (tile only) | "42 mL/(kg·min)" | no |
| `body_battery` | `garmin_connect:body_battery` | (tile only) | "68 / 100" | yes |
| `recovery_score` | `oura:*readiness*`, `garmin_connect:training_readiness` | (tile only) | "74 / 100" | yes |
| `steps` | `fitbit:*steps*`, `garmin_connect:steps`, `google_fit:*steps*` | `right_foot` (split decoratively to `left_foot`) | "8,431" | yes |
| `active_minutes` | `fitbit:*minutes_very_active*`, `garmin_connect:*intensity*` | `left_leg` | "42 min" | no |
| `workout_distance` | `withings:*last_workout_distance_travelled*`, `garmin_connect:last_activity_distance` | `right_leg` | "4.2 km" | no |
| `glucose` | `dexcom:*glucose_value*` + `dexcom:*glucose_trend*` | `abdomen` (override; weight slides to tile) | "112 mg/dL ↗" | yes |
| `workout_calendar` | `calendar.*workouts*` | (tile only) | 7-day strip | n/a |
| `last_workout` | `withings:*last_workout_*`, `garmin_connect:last_activity_*` | (tile only) | "Run · 32min · 4d ago" | n/a |
| `battery` | `*battery*` from medical devices | **NOT shown here** — routed to Engineering battery panel | n/a | n/a |

The card iterates `MEDICAL_VITAL_CLASSES` in display order and renders only rows with ≥ 1 matching entity for the current profile. Anchor slots that resolve to no entity render as a dash (`—`) so the silhouette layout stays stable; leader line is suppressed.

### 4.4 Concrete entity table (Withings, today, 14 entities)

| # | Entity (pattern) | `vital_kind` | Notes |
|---|---|---|---|
| 1 | `sensor.*_systolic_blood_pressure` | `blood_pressure` (sys) | paired |
| 2 | `sensor.*_diastolic_blood_pressure` | `blood_pressure` (dia) | paired |
| 3 | `sensor.*_heart_pulse` | `heart_rate` | sparkline source |
| 4 | `sensor.*_weight` | `weight` | sparkline source |
| 5 | `sensor.*_lean_mass` | (deferred — not displayed in v5.3.0) | future row |
| 6 | `sensor.*_fat_mass` | (deferred) | future row |
| 7 | `sensor.*_fat_ratio` | (deferred) | future row |
| 8 | `sensor.*_weight_goal` | `weight_goal` | reference line |
| 9 | `calendar.*_workouts` | `workout_calendar` | 7-day strip |
| 10 | `sensor.*_last_workout_type` | `last_workout` | badge |
| 11 | `sensor.*_last_workout_duration` | `last_workout` | badge |
| 12 | `sensor.*_last_workout_calories_burnt` | `last_workout` | badge |
| 13 | `sensor.*_last_workout_distance_travelled` | `last_workout` | badge |
| 14 | `sensor.*_*battery*` | `battery` | **routed out — Engineering** |

Patterns above use generic prefixes; no real device hostnames appear in this spec.

### 4.5 Per-crew-member binding (`MEDICAL_PROFILES`)

Captain's eventual model is one Withings profile per family member. Today there is one profile; the architecture must absorb N without rewrite. Three discovery strategies, in priority order:

1. **HA Person registry pairing (preferred).** A `person.*` entity carries an attribute `lcars_medical_source: <platform>:<user_id>` set via the dashboard's config-flow options. The card joins on this. No vitals leave HA; only the mapping ID is stored.
2. **Device-name area heuristic fallback.** Medical-platform entities whose device shares an `area_id` with exactly one `person.*` entity are auto-paired.
3. **Manual map in `lovelace-medical.yaml`.** Power-user override:
   ```yaml
   profiles:
     CRW-001:
       entities:
         - sensor.<...>_systolic_blood_pressure
         - sensor.<...>_heart_pulse
   ```

Today (single profile, no person link) the card falls through to **single biobed mode** — the only profile renders with the title "BIOBED" (no name). No config required.

---

## 5. Layout — Biofunction Card (per crew member)

A single Biofunction Card is a vertical container ~640 px tall × 360 px wide (default) with three stacked zones: A (Header), B (Silhouette + Callouts), C (Detail Stat Panel). Multi-user composition is a responsive grid of these cards (§5.4). Focus mode (§5.5) expands one card full-width and unlocks two additional canonical scan-mode tabs.

### 5.1 Zone A — Header strip (~80 px)

LCARS classic numeric header bar.

- **Title (left):** `MEDICAL REPORT {FILE_ID}` where `FILE_ID` is a stable 7-char hash of `person.entity_id` (deterministic, no PII — e.g. `MEDICAL REPORT 4703-502747.9`). The numeric form intentionally echoes the canonical screen.
- **Decorative numeric scroll columns (center):** Three vertical columns of 6-digit numbers, generated deterministically from the `FILE_ID` seed. Values do not change on data refresh — they are visual chrome, not telemetry. Re-seeded once per page load.
- **Status pill (right):** One of `NOMINAL` / `ELEVATED` / `ALERT` / `OFFLINE`, computed by the threshold engine (§5.6) against all anchored vitals. `OFFLINE` if the most recent vital sample is older than 24h. Pill colors: nominal = `--lcars-color-nominal` (cyan), elevated = `--lcars-color-warning` (amber), alert = `--lcars-color-alert` (red), offline = `--lcars-color-muted` (grey).

### 5.2 Zone B — Silhouette + Callouts (~320 px, the centerpiece)

Centered **gender-neutral humanoid silhouette** rendered by the new `<lcars-biofunction-silhouette>` shared primitive, which inlines `js/assets/biofunction-silhouette.svg` (front view, neutral pose, arms slightly out — see §5.7 asset spec). Anatomical callout points are absolutely positioned over the SVG using `%`-based coordinates (see §6.5 anchor map) so the silhouette and callouts scale together.

Each callout is a `<button>` (focusable, keyboard-navigable) containing:

- A short LCARS leader line (`<svg><line>` from anchor point to label box, ~36 px)
- A label box: `vital_kind` short label uppercase + value + unit + optional Δ arrow + 7-day spark if `sparkline tile = yes` is suppressed in detail panel

Empty anchors (no resolved entity) render a dash (`—`) and suppress the leader line — preserves layout stability without implying a missing vital is normal.

**Optional thermal overlay** (toggle in Zone A header rail, off by default): if any vital resolves to `ALERT`, tint the silhouette region nearest the offending anchor with a red radial gradient (`radial-gradient(circle at {anchor.x}% {anchor.y}%, rgba(239,68,68,0.45) 0%, transparent 30%)`) — a deliberate echo of the BIOMEDICAL SCAN 808 red-abdomen overlay. The overlay is a single CSS layer above the silhouette stroke; the silhouette is `currentColor`-tinted so the overlay reads cleanly through.

### 5.3 Zone C — Detail stat panel (~200 px)

LCARS table grid, **4 columns × 3 rows = 12 metric tiles**. Each tile renders:

```
┌────────────────┐
│ LABEL          │   ← e.g. "WEIGHT"
│ 78.4           │   ← big value, LCARS heading font
│ kg ▼0.3        │   ← unit + Δ
│ ▁▂▁▂▃▂▁▂▁▂▁  │   ← 7-day <lcars-sparkline> (if sparkline=yes)
└────────────────┘
```

**Default tile lineup** (rendered if entity present, in this order, first 12 used):

1. Weight (with sparkline + goal ref line)
2. Resting HR
3. Sleep last night (hours + score)
4. HRV last night
5. Body Battery / Recovery Score
6. Steps today
7. Active minutes today
8. Body fat %
9. BMI (computed if `person.height` set; otherwise hidden)
10. Hydration
11. VO2 max
12. Last workout (type · duration · cal)

Each tile carries the `.lcars-medical-redactable` CSS class (§7.4). An "+ ADD TILE" affordance opens an entity picker filtered to entities whose platform is in `MEDICAL_PLATFORMS`; user selections persist in `lcars-dashboard/configs/medical/profiles.yaml` under `profiles.<file_id>.tile_overrides`.

### 5.4 Multi-user composition

Default dashboard view is a **responsive grid of Biofunction Cards**, one per enrolled `person.*` whose `lcars_medical_source` attribute resolves (§4.5).

| Viewport | Columns | Card width |
|---|---|---|
| `< 720 px` (mobile) | 1 | 100 % − 32 px |
| `720–1199 px` (tablet) | 2 | `(100 % − 48 px) / 2` |
| `1200–1799 px` (desktop) | 3 | `(100 % − 64 px) / 3` |
| `≥ 1800 px` (wide) | up to 4 | `360 px` capped |

Grid uses CSS `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))` — no JS-driven column math.

### 5.5 Focus mode + scan-mode tabs

Clicking a card (or pressing Enter on a focused card) navigates to focus mode, expanding that card full-width and activating a tab strip in Zone A:

| Tab `id` | URL fragment | Renders |
|---|---|---|
| `summary` | `#person/{file_id}` (default; no fragment also valid) | The default 3-zone Biofunction Card, full-width |
| `anatomical` | `#person/{file_id}/anatomical` | **Two-up silhouettes** (front + back) inside a vertical `T-34..T-41` grid scale; left rail shows SAGITAL SECTION categories sourced from anchor-slot grouping (Cranium / Thorax / Abdomen / Limbs). Echoes ANATOMICAL SCAN 4012. Back-view silhouette is `biofunction-silhouette-back.svg` (deferred to v5.3.1 — front-only for v5.3.0 with placeholder "BACK VIEW PENDING" label). |
| `biomedical` | `#person/{file_id}/biomedical` | **Top panel:** full-width vitals strip — heart rate as ECG-style waveform if `garmin_connect`/`withings` provides high-resolution samples, otherwise a 60-sample `<lcars-sparkline>` of resting HR. **Bottom panel:** top-down silhouette (`biofunction-silhouette-top.svg`, deferred to v5.3.1) with thermal/density gradient overlay anchored to ALERT vitals; grid overlay with repeating coordinate label `22.30` (decorative, deterministic from `file_id`). Echoes BIOMEDICAL SCAN 808. |

Fragment routing is handled by a lightweight `hashchange` listener in `lcars-medical-card.js` — no router dependency. Browser back/forward navigates between focus-mode tabs and back to the grid.

For v5.3.0, `anatomical` and `biomedical` tabs render their layout frames + the **front-view silhouette** + a `"SCAN MODE PENDING — v5.3.1"` overlay where the back/top silhouettes will go. This ships the routing skeleton without blocking on three SVG assets.

### 5.6 Threshold engine + status pill

The status pill is computed per render by walking each rendered `vital_kind` and resolving its current value against a threshold table. Status precedence: `OFFLINE` > `ALERT` > `ELEVATED` > `NOMINAL`.

Default thresholds (AHA guidelines for BP and resting HR; clinically standard ranges elsewhere):

| `vital_kind` | NOMINAL | ELEVATED | ALERT |
|---|---|---|---|
| `blood_pressure` (systolic / diastolic) | <130 / <85 | 130–139 / 85–89 | ≥140 / ≥90 |
| `heart_rate` (resting) | 50–80 bpm | 81–100 bpm | <40 or >100 bpm |
| `spo2` | ≥95 % | 92–94 % | <92 % |
| `respiration_rate` | 12–20 brpm | 21–24 brpm | <10 or >24 brpm |
| `glucose` (mg/dL) | 70–140 | 141–180 or 60–69 | <60 or >180 |
| `body_battery` | ≥40 | 20–39 | <20 |
| `sleep_score` | ≥80 | 60–79 | <60 |
| `recovery_score` | ≥70 | 50–69 | <50 |
| `weight` Δ7d | within ±2 % | ±2–4 % | >±4 % |

User overrides live in `lcars-dashboard/configs/medical/medical_thresholds.yaml`:

```yaml
# medical_thresholds.yaml — per-profile threshold overrides
# All ranges are inclusive on both ends. Omit a key to inherit defaults.
profiles:
  CRW-001:
    heart_rate:
      nominal: { min: 45, max: 75 }   # athlete band
      elevated: { min: 76, max: 95 }
      alert: { below: 40, above: 95 }
    blood_pressure:
      systolic:
        nominal: { max: 125 }
        elevated: { min: 126, max: 135 }
        alert: { min: 136 }
```

Validation: card refuses to load thresholds where `nominal` and `alert` overlap; logs a single warning at module load (no values).

### 5.7 Silhouette asset spec

**File:** `js/assets/biofunction-silhouette.svg` (single source of truth; inlined into the bundle at build time so the CSP `default-src 'self'` rule does not require `img-src` exemptions).

| Attribute | Value |
|---|---|
| `viewBox` | `0 0 200 480` |
| Stroke | `currentColor`, `stroke-width="2"`, `stroke-linejoin="round"` |
| Fill | `none` (so CSS overlay layers show through; thermal gradient is a separate CSS layer above) |
| Embedded fonts/rasters | **Forbidden** — pure path commands only |
| Gender presentation | Neutral: no breast contour, no genital indication, neutral hip-shoulder ratio (~0.85), short hairline implied by head outline only |
| Pose | Front view, arms slightly abducted (~15° from torso) so left/right arm anchors are visually distinct from torso anchors |
| File size budget | ≤ 4 KiB minified |
| License | Hand-authored for this project — explicitly NOT traced from any Star Trek production asset (avoids IP ambiguity; design is *inspired by* the canonical references in §15) |

**Reserved future variants** (deferred to v5.3.1):

| File | Use |
|---|---|
| `biofunction-silhouette-back.svg` | `anatomical` tab right pane |
| `biofunction-silhouette-top.svg` | `biomedical` tab bottom pane |

Reviewer validation: all path commands authored inline in the SVG with comments naming each anatomical region (`<!-- skull -->`, `<!-- ribcage -->`, etc.). Worf reviews for absence of embedded scripts, foreignObject nodes, or external resource references.

### 5.8 ASCII sketch (Biofunction Card, summary tab)

```
┌─ MEDICAL REPORT 4703-502747.9 ────── 027411 029553 003721 ── [NOMINAL] ─┐
│                                                                          │
│                          ___                                             │
│        HEAD_TOP ────────(   )──── 82/100  SLEEP                          │
│                          \_/                                             │
│        FOREHEAD ─────── │   │ ──── —                                     │
│                         │   │                                            │
│        THROAT ───────── │   │ ──── 14 brpm  RESP                         │
│                       __│   │__                                          │
│  118/76               /         \                97 %                    │
│  BP    ◄──── L_ARM─── │  HEART  │ ────R_ARM───►  SpO2                    │
│                       │   62    │                                        │
│                       │   bpm   │                                        │
│                       │ ABDOMEN │                                        │
│                       │  78.4kg │                                        │
│                       │  ▼0.3   │                                        │
│                       └─┬─────┬─┘                                        │
│                         │     │                                          │
│        L_LEG ────42min ─┤     ├── 4.2km ── R_LEG                         │
│                         │     │                                          │
│        L_FOOT ─ 4,215 ──┘     └── 4,216 ── R_FOOT                        │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  WEIGHT      RESTING HR    SLEEP        HRV                              │
│  78.4        62            7h 14m       48 ms                            │
│  kg ▼0.3     bpm  ▁▂▁▃▁▂   82 score     ▁▂▁▂▃▂▁                          │
│                                                                          │
│  BODY BATT   STEPS         ACTIVE       BODY FAT                         │
│  68/100      8,431         42 min       22.4 %                           │
│  ▁▃▅▇▅▃▁    ▁▃▂▅▇▆▄        / 60 goal    ▁▂▁▂▁▂▁                          │
│                                                                          │
│  BMI         HYDRATION     VO2 MAX      LAST WORKOUT                     │
│  24.1        1.4 / 2.5 L   42           Run · 32min · 4d                 │
│              ▁▂▃▅▄▃▂        mL/(kg·min)  ago                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.9 Trend visualization

**Inline-SVG `<lcars-sparkline>`**, the shared primitive shipped with Subspace Relay (5.2.0). Justification unchanged from prior revision:

1. `mini-graph-card` is a 30 KB+ HACS dependency that violates the bundle directive.
2. Native LCARS color tokens; no theme override hacks.
3. Already paid for by 5.2.0.

**Hard dependency:** Medical Bay 5.3.0 ships *after* Subspace Relay 5.2.0. Do not invert.

---

## 6. Workout Calendar Tile

`calendar.*workouts` is a single calendar entity with rich event payloads. Within the Biofunction Card it occupies the `LAST WORKOUT` tile in Zone C. Render as:

- **Top half of tile:** small 7-day strip (one cell per day, filled if a workout occurred, color by intensity if `event.summary` includes intensity tokens; otherwise neutral).
- **Bottom half of tile:** "LAST WORKOUT" badge bound to the four `*last_workout_*` sensors (or `garmin_connect:last_activity_*` equivalents).

No HA `calendar` card embedded — its Material grid styling would have to be overridden. Native LCARS uses the calendar entity's `events` attribute via the existing WebSocket `calendar/event/list` (already used by Habitat schedule panel, if present; otherwise add to `entity-utils` once).

## 6.5 Anatomical Anchor Map

The silhouette uses a `200 × 480` viewBox. Anchor coordinates are expressed as **percentages** of that viewBox so layout scales cleanly with card size. "Left" and "right" are **viewer-perspective** (left side of screen = `left_*`), which matches the LCARS reference imagery — *not* anatomical-left convention. This must be documented in the silhouette component's JSDoc to prevent confusion during Worf's medical-correctness review.

| `slot` | Region | x % | y % | Default `vital_kind` | Notes |
|---|---|---|---|---|---|
| `head_top` | Top of skull | 50 % | 4 % | `sleep_score` | Above silhouette; leader line points down |
| `forehead` | Forehead center | 50 % | 10 % | (empty default) | Reserved — neural/cognitive metric slot |
| `throat` | Throat / larynx | 50 % | 20 % | `respiration_rate` | Centered on neckline |
| `heart` | Cardiac region | 44 % | 33 % | `heart_rate` | Slightly viewer-left of centerline (anatomically correct) |
| `left_lung` | Upper-left thorax (viewer) | 38 % | 30 % | (empty default) | Reserved — pulmonary metrics |
| `right_lung` | Upper-right thorax (viewer) | 62 % | 30 % | `spo2` | SpO2 reads as oxygenation, lung-adjacent |
| `left_arm` | Mid-bicep, viewer-left | 25 % | 42 % | `blood_pressure` | BP cuff is upper-arm anatomically |
| `right_arm` | Mid-bicep, viewer-right | 75 % | 42 % | (empty default) | Reserved — secondary BP / IV slot |
| `abdomen` | Lower torso center | 50 % | 50 % | `weight` | Also default for `glucose` (overrides weight to tile) |
| `left_leg` | Mid-thigh, viewer-left | 41 % | 75 % | `active_minutes` | Activity → leg |
| `right_leg` | Mid-thigh, viewer-right | 59 % | 75 % | `workout_distance` | Distance → leg |
| `left_foot` | Foot, viewer-left | 39 % | 96 % | `steps` (split half) | Decorative split if integration provides single steps total |
| `right_foot` | Foot, viewer-right | 61 % | 96 % | `steps` (split half) | (paired with `left_foot`) |

That is **13 slots** total (12 distinct + the foot pair counted as one logical anchor). The `left_lung`, `forehead`, and `right_arm` slots are reserved for future expansion (e.g. PFT-style respiratory volume from Withings sleep tracker, EEG headband HACS integrations, IV/medication trackers); they render as `—` today without leader lines and exist in the schema so future integrations need zero anchor-map changes.

Leader-line geometry: each callout label box anchors at one of four screen quadrants (top-left, top-right, bottom-left, bottom-right of the silhouette frame); the leader is a single `<line>` from the body anchor `(x%, y%)` to the label box edge. Quadrant assignment is fixed per slot in the component (head_top → top-center, heart → middle-left label column, abdomen → middle-right label column, etc.) — see component JSDoc.

---

## 7. PRIVACY POSTURE — Worf coordination required before merge

Vitals are **PHI-adjacent**. The user is the patient and the doctor in their own home, but the architecture must not externalize anything. **Worf must review and sign this section before any Lit code is written.** The constraints below are non-negotiable design inputs; they are not "review later" items.

### 7.1 No external network calls from the card

Withings already polls cloud via the HA integration. The card touches **only** `hass.states` and the local WebSocket. No analytics, no telemetry, no remote logging endpoint, no CDN fetches, no font CDN, no map tiles. Zero outbound bytes.

### 7.2 No values in logs

`console.debug` calls in the card **must redact numeric values**. Log `"[medical] BP updated"`, never `"[medical] BP=118/76"`. A lint rule (or test) should enforce: any string-template literal in a `lcars-medical-*.js` file containing `${...}` inside a `console.*` call fails CI.

### 7.3 `aria-live` discipline

| Element | Value | Rationale |
|---|---|---|
| Vital value cells (BP, HR, weight) | `aria-live="off"` | AT must not announce silently changing systolic numbers as someone walks past the room. |
| "LAST WORKOUT" badge | `aria-live="polite"` | Lifestyle data, non-sensitive. |
| Battery low warning (if any reaches the card) | `aria-live="polite"` | Operational. |

### 7.4 Screenshot redaction hook

Every numeric vital cell — both **anchored callouts in Zone B** and **detail tiles in Zone C** — carries the CSS class `.lcars-medical-redactable`. The existing screenshot tool (the one referenced by the `/memories/session/lcars-screenshot-pii-map.md` session note) gains a `--redact-medical` flag that **blurs anything matching that selector** to a non-recoverable opacity. Default **ON**. The screenshot tool refuses to write a file if the dashboard URL is `/lcars-medical` and `--redact-medical=false` was not explicitly passed.

**Critical clarification for the silhouette layout:** the gender-neutral silhouette SVG itself is **non-PII** (no avatar, no biometric likeness, no identifying contour) and remains visible in screenshots. Only the numeric callout values, the leader-line label boxes, the status pill text, and the detail tile values are redacted. The thermal-overlay layer is also redacted (its presence and location reveal which body region is in `ALERT`). The `FILE_ID` in the Zone A title is a hash, not a name, but is also redacted by default since it correlates back to a `person.entity_id`.

Redacted selectors:
- `.lcars-medical-redactable` — vital values (callouts + tiles)
- `.lcars-medical-redactable-overlay` — thermal overlay layer
- `.lcars-medical-redactable-id` — FILE_ID in header

### 7.5 Explicit dashboard opt-in

Unlike Habitat / Power / etc. which auto-enable, Medical Bay must be **disabled by default**:

- `default_enabled: False` in `DASHBOARD_REGISTRY` — requires the new registry field shipped by Subspace Relay (5.2.0).
- The user toggles it on in the integration's config-flow options.
- The config flow shows a one-line consent string (English baseline; translatable via HA translations):
  > *"Enabling this dashboard will display health data on any device that loads Home Assistant. Continue?"*
- The toggle's HA log entry records *"medical dashboard enabled"* with **no values**, only the action.

### 7.6 No persistence of vitals in dashboard config

All data flows from `hass.states` per render. The only thing written to `lcars-dashboard/configs/medical/profiles.yaml` is the **person ↔ medical-user mapping** — no values, no thresholds, no history. The dashboard never calls `recorder` or `history` services.

### 7.7 Per-user HA auth respected (optional, default ON)

If the person→user link is set (HA's existing `person.user_id`), and a viewer is **not** that user **and** not an admin, the biobed renders with values masked as `•••` (the row still appears so layout is stable). Toggle: `medical.respect_user_scoping` (default `true`). When false, the dashboard logs a single warning at module load: *"medical dashboard: per-user scoping disabled — vitals visible to all dashboard users"*.

### 7.8 Camera/snapshot interactions

Medical Bay must not embed `camera.*` entities or render any image whose `entity_picture` is sourced from a person's profile photo. The header `FILE_ID` (a 7-char hash) replaces the avatar/monogram entirely in the new layout — there is no avatar slot in the Biofunction Card, intentional design choice to avoid any per-person visual likeness.

### 7.9 Per-person silhouette consent gate (NEW for Biofunction layout)

The silhouette + callout layout displays significantly more PHI per screen than the prior biobed strip (12 anchored values + 12 detail tiles per profile, simultaneously visible). On **first render of a Biofunction Card for a given `person.entity_id` per browser**, the card renders in **consent-pending state**:

- Silhouette renders normally (non-PII)
- All callouts render as `—`
- All detail tiles render as `—`
- Center overlay: `"BIOFUNCTION DISPLAY REQUIRES CONSENT — TAP TO ENABLE FOR THIS PROFILE"`
- Tapping records consent in `localStorage` under key `lcars_medical_consent.<file_id>` with timestamp
- A single config-flow option (`medical.require_per_profile_consent`, default `true`) gates this behavior; advanced users may disable household-wide

Consent does not persist across browsers/devices intentionally — sharing the dashboard URL must require explicit re-consent on each device. The consent record contains only the FILE_ID hash and a timestamp; no values, no decisions are logged anywhere else.

### 7.10 Threshold-engine privacy

The threshold engine (§5.6) computes status pills from current values. Threshold rules are **per-profile** in `medical_thresholds.yaml`. The card never logs which threshold tier was crossed — only `"[medical] threshold check complete"` with no values, no profile id, no vital_kind.

---

## 8. New JS modules + assets

| Module / asset | Lines / size (est.) | Purpose | Visibility |
|---|---|---|---|
| `js/src/lcars-medical-layout.js` | 250–350 | Frame, dashboard grid composition, focus-mode tab routing, hashchange listener | dashboard-private |
| `js/src/lcars-medical-card.js` | 700–1000 | Biofunction Card (Zone A/B/C), profile pairing, vital classification, threshold engine, consent gate, redaction-class application | dashboard-private |
| `js/src/lcars-medical-utils.js` | 300–400 | `MEDICAL_PLATFORMS`, `MEDICAL_VITAL_CLASSES`, `MEDICAL_PROFILES` resolution, anchor map, threshold defaults | dashboard-private |
| `js/src/lcars-biofunction-silhouette.js` | 150–200 | **NEW shared primitive** — wraps the SVG asset, accepts `anchors` prop (slot → value), renders leader lines + thermal overlay layer, exposes `currentColor` tinting | shared (`lcars-shared-components/`) |
| `js/assets/biofunction-silhouette.svg` | ≤ 4 KiB | Front-view gender-neutral silhouette path data; inlined into bundle at build time | asset |
| `js/assets/biofunction-silhouette-back.svg` | (deferred v5.3.1) | Back-view variant for `anatomical` tab right pane | asset |
| `js/assets/biofunction-silhouette-top.svg` | (deferred v5.3.1) | Top-down variant for `biomedical` tab bottom pane | asset |

**One new shared primitive** — `<lcars-biofunction-silhouette>` — is introduced. It is shared (not dashboard-private) because the anchor-map + leader-line + overlay pattern is reusable for any future "diagram with anchored values" need (e.g. a vehicle dashboard, a network topology card). Per LCARS-PANEL-EXTRACTION-ARCHITECTURE.md, a primitive is promoted to shared on first use only when its abstraction is genuinely domain-neutral; the silhouette component meets that bar by accepting an arbitrary SVG asset + anchor table as props.

**Bundle delta (revised estimate)**: +22 to +30 KiB minified — higher than the prior biobed strip estimate due to (a) the silhouette component, (b) the threshold engine, (c) the focus-mode routing. Net projected bundle after Subspace + Medical: ~945–955 KiB. Approaches but does not exceed the 1000 KiB review threshold from `data-limits-policy.md`. Re-measure on the v5.3.0-beta.1 commit; if delta exceeds +35 KiB, defer focus-mode tabs to v5.3.1.

---

## 9. Performance

Worst-case render: 5 profiles × (3 vital cells + 1 sparkline detail) when one is expanded.

- Strip rendering: O(profiles × vitals); each cell is a ~30-byte text node. Negligible.
- Sparkline: 60-sample SVG polyline; only drawn for the **selected** biobed. Switching selection is the only re-render trigger.
- `shouldUpdate()` short-circuits using `Map<entity_id, lastValue>` — same pattern as Habitat / Network.
- No `recorder` / `history` queries from the card. Sparkline holds the last N (~60) samples in an in-memory ring buffer, reset on page reload.

Acceptance: first paint under 200 ms; selection switch under 50 ms.

---

## 10. Audio (per LCARS-AUDIO-SPEC §2)

Audio mode `medical`:

| Event | Tone |
|---|---|
| New vital sample arrives | suppressed (no chirp) |
| Profile selection change | single soft `acknowledge` chirp |
| Dashboard first paint | one `ready` tone (existing) |
| Battery-low on a paired device (only if displayed) | rate-limited `acknowledge`, ≤ 1 per device per hour |
| Default | suppressed |

The "biobed pulse" referenced in early planning is **deferred** — it risks pattern-matching a real medical alert sound and could be misinterpreted in an emergency. Worf concurrence captured here.

---

## 11. Implementation Tasks (for Cmdr. Riker / dev hand-off)

### Phase 0 — Privacy primitives + silhouette asset (5.3.0-beta.1, gated by **Worf sign-off on §7**)

1. Confirm `default_enabled: bool` registry field (shipped by Subspace 5.2.0); verify config-flow honors it.
2. Add the consent string (§7.5) to the config-flow translations file.
3. Add `medical.respect_user_scoping`, `medical.show_all_profiles_to_admins`, `medical.require_per_profile_consent` config-flow options.
4. Add `--redact-medical` flag to the screenshot tool; default ON; redact `.lcars-medical-redactable`, `-overlay`, `-id` selectors; refuse to save unredacted screenshots from `/lcars-medical`.
5. Add CI lint rule: `console.*` in `lcars-medical-*.js` files cannot include `${...}` template substitutions.
6. **Author the gender-neutral silhouette SVG** (`js/assets/biofunction-silhouette.svg`) per §5.7 spec. Hand-author paths; no tracing of any reference. Worf reviews for absence of script/foreignObject nodes and for medical neutrality of presentation.
7. **Worf signs Phase 0 before Phase 1 starts.** Hard gate.

### Phase 1 — Single-profile Biofunction Card, summary tab only (5.3.0-beta.2)

8. Bump `medical` entry into `DASHBOARD_REGISTRY` with `default_enabled: False`.
9. Create `lovelace/ui-lovelace-medical.yaml` (single view, `type: custom:lcars-medical-layout`).
10. Implement `lcars-medical-utils.js` with `MEDICAL_PLATFORMS`, `MEDICAL_VITAL_CLASSES`, anchor map, threshold defaults, single-profile resolver, `FILE_ID` hash function.
11. Implement `<lcars-biofunction-silhouette>` shared primitive (loads SVG asset, accepts `anchors: { slot: { value, status, sparkline? } }` prop, renders leader lines + thermal overlay layer).
12. Implement `lcars-medical-layout.js` (frame, responsive grid, audio mode wiring).
13. Implement `lcars-medical-card.js` Zone A header (FILE_ID + decorative numerics + status pill), Zone B silhouette mount, Zone C 4×3 tile grid for the single-profile case.
14. Implement threshold engine (`computeStatus(vital_kind, value, profile_overrides) → 'NOMINAL'|'ELEVATED'|'ALERT'|'OFFLINE'`); validate non-overlapping ranges at load.
15. Apply `.lcars-medical-redactable` to all numeric vital cells (callouts + tiles + status pill + FILE_ID).
16. Apply `aria-live` discipline per §7.3.
17. Implement per-profile consent gate (§7.9): localStorage key write on tap, `—`-only render when pending.
18. Captain dogfoods on his own data before beta.3.

### Phase 2 — Multi-profile grid + focus mode + workout calendar (5.3.0-beta.3)

19. Add `MEDICAL_PROFILES` resolver with three-tier discovery (§4.5).
20. Add config-flow UI to set `lcars_medical_source` attribute on `person.*` entities.
21. Implement responsive grid composition (§5.4).
22. Implement focus-mode tab routing (§5.5) via `hashchange` listener; render `summary` tab fully; render `anatomical` and `biomedical` tab frames + front-silhouette + `"SCAN MODE PENDING"` overlays.
23. Implement workout calendar tile (7-day strip + last-workout badge in Zone C).
24. Implement per-user-scope masking (§7.7).
25. Implement `medical_thresholds.yaml` parser (§5.6).

### Phase 3 — Stable release (5.3.0)

26. Re-measure bundle size; confirm under 955 KiB ceiling. If over, defer focus-mode routing to 5.3.1.
27. Geordi visual QA on Biofunction Card, silhouette anchor alignment, and tile typography.
28. **Worf re-signs §7** against the as-built code, including silhouette consent gate and screenshot-redaction selectors.
29. Update `plans/backlog-5x.md`: add `5X-3.5 · Medical Bay (shipped)`; queue `5X-3.6 · Medical Bay back/top silhouettes` for v5.3.1.
30. HACS release per `lcars-release-workflow` memory.

---

## 12. Open Questions for Cmdr. Riker

1. **Easter-egg label**: is "Tendi's Sickbay" approved, or does Captain prefer another LD reference (Dr. T'Ana?)?
2. **Avatar policy**: §7.8 removes the avatar slot entirely from the Biofunction Card; the header `FILE_ID` hash is the only per-profile identifier. Confirm Captain accepts (he previously asked about photo avatars; the silhouette layout obviates the question).
3. **Per-user scoping default**: §7.7 defaults `respect_user_scoping` to `true`. Confirm with Worf.
4. **Per-profile consent (§7.9)**: gate adds friction. Acceptable, or default to off and rely on the dashboard-level consent in §7.5?
5. **Threshold defaults (§5.6)**: AHA BP and resting-HR ranges encoded; confirm with Captain that medical defaults are acceptable as shipped (vs. "empty defaults; user must configure"). The shipped defaults will be visible in the source — they are recommendations, not medical advice. Add disclaimer to README?
6. **Anchor slot priority** when multiple platforms supply the same `vital_kind` (e.g. Withings + Garmin both give weight). First-match by `MEDICAL_PLATFORMS` declaration order, or last-write-wins by `last_changed`? Lean toward last-changed.
7. **Battery routing**: §4.3 / §4.4 send Withings/Garmin battery sensors to Engineering. Confirm with Geordi.
8. **Focus-mode tabs scope**: ship `summary` only in v5.3.0 and defer `anatomical`/`biomedical` to v5.3.1, or ship the routing skeleton with placeholder content? Spec currently assumes the latter.
9. **Multi-tenant isolation**: is per-user scope masking sufficient at first ship, or does Captain require fully separated dashboards per household member (much larger architectural change)?
10. **Deferred platforms** (Whoop, Apple Health, smart scales, Sleep as Android): which is highest priority for v5.4? Apple Health via Health Auto Export is the highest-leverage but the messiest entity contract.

---

## 13. Acceptance Criteria

- [ ] **Worf has signed §7** before merge (including §7.9 consent gate and §7.10 threshold privacy).
- [ ] Dashboard is **not** registered when `default_enabled` is `False` (verified: no sidebar entry, no panel, URL 404).
- [ ] Enabling via config-flow shows the §7.5 consent string and requires explicit confirmation.
- [ ] Single-profile Biofunction Card renders correctly with the existing 14 Withings entities, with at least 6 of 12 default tiles populated.
- [ ] Silhouette SVG asset is hand-authored, ≤ 4 KiB, contains no script / foreignObject / external resource references.
- [ ] All 12 anchor slots in §6.5 render at the documented coordinates within ±2 % at all viewport sizes.
- [ ] Multi-profile grid auto-fills at the breakpoints in §5.4.
- [ ] Focus-mode tab routing works for all three tabs; `anatomical` and `biomedical` show placeholder overlay in v5.3.0.
- [ ] Threshold engine returns correct status pill for the AHA BP / HR test cases; profile overrides in `medical_thresholds.yaml` apply.
- [ ] All numeric vital cells (callouts + tiles) carry `.lcars-medical-redactable` and `aria-live="off"`.
- [ ] Per-profile consent gate renders in `—`-only state until tap; tap persists to localStorage.
- [ ] Screenshot tool refuses to save unredacted screenshots from `/lcars-medical` without explicit `--no-redact` flag.
- [ ] No `console.*` call in `lcars-medical-*.js` contains a value substitution (CI enforced).
- [ ] No outbound network requests originate from the card (verified by network-tab audit during QA).
- [ ] Per-user scope masking renders `•••` for non-owner non-admin viewers.
- [ ] No avatar slot present; FILE_ID hash is the only per-profile identifier.
- [ ] Bundle delta ≤ +30 KiB; total bundle < 955 KiB.
- [ ] Geordi signs off on Biofunction Card aesthetics, anchor alignment, and tile typography.
- [ ] `plans/backlog-5x.md` updated with shipped status; `5X-3.6 · back/top silhouettes` queued for 5.3.1.

---

## 14. References

- `specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md` — ships the `default_enabled` registry field and the `<lcars-sparkline>` primitive this dashboard depends on
- `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` — shared component pattern; `<lcars-biofunction-silhouette>` is the sole new shared primitive introduced here
- `specs/LCARS-AUDIO-SPEC.md` — audio mode definitions
- `memories/repo/lcars-release-workflow.md` — release process
- `memories/repo/data-limits-policy.md` — bundle/file-size thresholds
- `memories/session/lcars-screenshot-pii-map.md` — screenshot redaction selectors
- HA Withings integration docs — https://www.home-assistant.io/integrations/withings
- HA Fitbit integration docs — https://www.home-assistant.io/integrations/fitbit
- HA Dexcom integration docs — https://www.home-assistant.io/integrations/dexcom
- HACS Garmin Connect (cyberjunky) — https://github.com/cyberjunky/home-assistant-garmin_connect (130+ sensors; reference for `MEDICAL_VITAL_CLASSES` coverage)

## 15. Reference Inspiration

The Biofunction Card design is inspired by three canonical Star Trek LCARS medical screens reviewed by the Captain on stardate 2026.05.04. Images are not embedded in this public-repo spec; descriptive synopsis only.

1. **MEDICAL REPORT** (file ID format `47xx-yyyyyy.z`) — full-body standing silhouette with numeric callouts at anatomical points (head, chest, arms, abdomen, legs, feet). Left rail carries a metadata block (FILE ID / SUBJECT ID / DATE / etc.). Top carries the classic numeric scroll header. **Mapped to:** Zone A header + Zone B silhouette + Zone B anchored callouts.
2. **ANATOMICAL SCAN** (file ID `40xx`) — two-up standing silhouettes (front + back view) inside a vertical `T-34..T-41` grid. Left rail carries SAGITAL SECTION categories (Cranium / Frontal / Parietal / Occipital / Temporal lobe) with bulleted sub-items. **Mapped to:** Focus-mode `anatomical` tab. Back-view silhouette deferred to v5.3.1.
3. **BIOMEDICAL SCAN** (file ID `808`, subject "Humanoid Icheb") — top panel shows ECG/EKG-style vitals waveform across full width; bottom panel shows top-down body silhouette with thermal/density gradient overlay (red zone = problem area), grid overlay with repeating coordinate label `22.30`, numeric stack on the right. **Mapped to:** Focus-mode `biomedical` tab + the optional thermal-overlay layer in §5.2. Top-down silhouette deferred to v5.3.1.

**Design fidelity policy:** the silhouette and screen frames are *inspired-by*, not traced from, the canonical references. All SVG paths and layout dimensions are hand-authored for this project. This is consistent with the Captain's standing IP-cleanliness preference and avoids any ambiguity about Star Trek production assets in a public repo. The numeric `FILE_ID` format (`47xx-yyyyyy.z`) is a deterministic hash output, not a copy of any specific canonical file ID.

---

## 16. Security Review — Lt. Worf, Chief of Security
*Filed: stardate 2026.05.04*

This dashboard renders **Protected Health Information** into the DOM. PHI in the DOM is PHI in browser memory, GPU compositor surface, OS swap, browser cache, screen-share frames, console logs, and HA recorder exports. Data's privacy gate is necessary but **not sufficient** on its own; the controls below are required.

### Threat model
| Threat | Likelihood | Impact | Mitigation status |
|---|---|---|---|
| Screenshot exfiltration of vital values (intentional share, support ticket, screen-share) | High | High | Obfuscator hook required (BLOCKING) |
| PHI persisted to browser storage (localStorage/sessionStorage/IndexedDB) | Medium | High | Policy: ephemeral in-memory only (BLOCKING) |
| Vital values leaked to `console.*` or unhandled rejection traces | Medium | Medium | CI lint already specified §13; extend to PHI-tagged DOM |
| Cross-card DOM access by a sibling Lovelace card on same view | Low | High | Strict CSP + closed shadow root (BLOCKING) |
| Third-party card screen-grab via `html2canvas`/foreignObject | Low | High | `data-medical="phi"` opt-out attribute (BLOCKING) |
| Multi-user HA install: User B views User A's biofunction card | Medium | High | Per-user scope mask documented §13; HA lacks per-card ACL — accept limitation |
| PHI written to HA recorder DB via state attribute round-trip | Low | High | Card MUST NOT write derived vitals back to any entity |
| Spec-author misuse of canonical disclaimer (HIPAA covered-entity language) | Low | Low | Add `medical_disclaimer` field rendered in consent gate |

### OWASP Top 10 mapping
- **A01 Broken Access Control** — per-user scope mask is the only access control; HA does not provide per-card ACL. Document the limitation in user-facing copy.
- **A02 Cryptographic Failures** — PHI traversing browser storage / cache is the failure mode. Mitigated by no-persistence policy.
- **A03 Injection** — vital values are numeric; profile names rendered through Lit auto-escape. No `unsafeHTML` permitted in `lcars-medical-*.js`.
- **A04 Insecure Design** — design must assume the screenshot WILL be shared. Default state is redacted; reveal is per-tap, time-boxed.
- **A05 Security Misconfiguration** — strict CSP applies; no inline event handlers, no `eval`.
- **A09 Logging Failures** — inverse risk: we must NOT log values. CI guard already specified.

### Required hardening (BLOCKING)
- [ ] Every numeric vital cell carries `data-medical="phi"` AND `class="lcars-medical-redactable"`. Obfuscator MUST blank both silhouette callouts and detail tiles when active.
- [ ] No PHI written to `localStorage`, `sessionStorage`, or `IndexedDB`. Consent-gate state may persist a per-profile boolean ONLY (no values, no timestamps with identifying granularity beyond date).
- [ ] Lit components use **closed** shadow roots (`{ mode: 'closed' }`) for biofunction silhouette and detail tiles. Prevents `document.querySelector` reach-in by sibling cards.
- [ ] Card MUST NOT issue any outbound network request (verified §13). No telemetry, no avatar fetch, no remote font.
- [ ] Card MUST NOT call `service.set_state` or write any derived vital back to HA (would be persisted by recorder).
- [ ] Screenshot tool refuses to save unredacted captures from `/lcars-medical` without explicit `--no-redact` flag (already in §13 — confirmed BLOCKING).
- [ ] CI guard: `grep -E "console\.(log|warn|error|debug)\(.*\$\{" js/src/lcars-medical-*.js` returns zero matches.

### Recommended hardening
- [ ] Apply `view-transition-name: none` to `.lcars-medical-redactable` so View Transitions API cannot snapshot PHI into a transition pseudo-element.
- [ ] Add `medical_disclaimer` field to dashboard config; render at top of consent gate. Default copy: "Personal residence dashboard. Not a HIPAA-covered medical record. Values shown for situational awareness only."
- [ ] Document in README that this is a single-tenant residential tool, not a covered-entity health record. GDPR Art. 9 special-category data handling is the user's responsibility.
- [ ] Audit any new sparkline/ECG library for transitive deps via `socket npm install`. Prefer hand-authored SVG over imported chart libs.

### Screenshot redaction (obfuscator integration)
Obfuscator MUST hook these selectors when redaction mode is active on `/lcars-medical`:
- `[data-medical="phi"]` — universal opt-in (preferred)
- `.lcars-medical-redactable` — legacy class hook
- `lcars-biofunction-silhouette >>> .vital-callout` — shadow-piercing for the silhouette primitive
- `.lcars-medical-detail-tile .value` — tile numeric region
- Profile name → replace with `SUBJECT-{FILE_ID_SHORT}` (already deterministic hash per §15)

### Data classification & retention
- **Classification**: PHI-equivalent (vitals, glucose, weight, sleep, cycle data). Treat as Confidential-Restricted.
- **Retention in card**: zero. In-memory only for current view; cleared on navigation.
- **Retention in HA recorder**: governed by upstream integrations (Withings, Fitbit, Dexcom, Garmin). Out of scope for this card; document in README that recorder retention applies.
- **Retention in screenshot artifacts**: zero — redaction is default-on.

### Sign-off condition
I will sign off when: (1) all BLOCKING items above are checked; (2) §13 acceptance criteria pass including the no-network-request audit; (3) the obfuscator hook list above is wired into `localinfo/screenshot-obfuscator.js` and tested against a live `/lcars-medical` view; (4) README carries the single-tenant / non-covered-entity disclaimer. **Today is a good day to harden our defenses.**

---

## Engineering Console Review — Lt. Cmdr. Geordi La Forge
*Filed: stardate 2026.05.04*

### Visual / LCARS grammar
Elbow + pill frame intact. Callouts must use Classic palette only (`--lcars-sunflower`/`--lcars-ice`/`--lcars-african-violet`/`--lcars-tomato`) — no off-palette pinks. Antonio, ALL-CAPS labels + numerics; mixed case only for the workout paragraph. Silhouette stroke flat (no glow/drop-shadow); frame thickness rule (thick→thin) applies to Zone A.

### Accessibility (WCAG 2.2 AA, EAA, EN 301 549)
Callouts over a stroke-only silhouette need a backdrop scrim (`background: rgba(0,0,0,0.85); padding: 2px 4px`) **or** `text-shadow: 0 0 3px #000` — verified ≥4.5:1 (SC 1.4.3). Focus-mode tab strip: APG tabs pattern (Arrow to switch, Tab in/out), 2px `--lcars-ice` focus ring + 2px offset (SC 2.4.7/2.4.13), focus restored to originating card on exit (SC 2.4.3). Anchor dots wrapped in 44×44 hit-areas (SC 2.5.5). Disabled `—` uses `--lcars-gray` (5.1:1 on black, passes AA). LCARS is dark-only — set `color-scheme: dark` and document `prefers-color-scheme` is ignored. Verify 200% zoom + reflow collapses to single-column at ≥320 CSS px (SC 1.4.10).

### Audio grammar (per LCARS-AUDIO-SPEC)
`audio_mode: medical` correct — soft biobed pulse, no chirps. **No** `alert`/`criticalAlert` for vital threshold crossings; medical anomalies are a clinician's call, not a klaxon. Mute toggle persists across dashboards via the shared `lcars-audio-muted` key.

### Required changes (blocking)
- [ ] Add **"Vocalize vitals" toggle** (default OFF, per-profile localStorage). OFF → vital nodes carry `aria-hidden="true"` (in addition to `aria-live="off"`) so AT users in shared spaces don't read PHI aloud. Document in §7.3.
- [ ] Confirm §7.3: anchor callouts never carry `aria-live`; only the status pill (NORMAL/ELEVATED/CRITICAL) gets `aria-live="polite"`, fired on class change only — not on numeric change.
- [ ] Silhouette `<svg role="img" aria-label="Biofunction silhouette: <N> nominal, <M> elevated, <K> critical">`, recomputed on pill-class change only.
- [ ] Each anchor `aria-describedby="<tile_id>"` to associate dot with detail tile.
- [ ] `prefers-reduced-motion: reduce` disables biobed-pulse cadence (drop to 1/5s), BIOMEDICAL SCAN waveform (render static), and any thermal pulse.
- [ ] Lower-Decks easter-egg labels carry `aria-label="Medical Bay"` override.
- [ ] Callout backdrop scrim / text-shadow rule added to silhouette CSS and contrast verified.

### Suggestions (non-blocking)
- [ ] Pill state-change fires `toggle` (550→770 Hz, 80ms) — within `medical` envelope, no alarm connotation.
- [ ] Visible "PHI HIDDEN" badge in Zone A when consent gate is closed, so `—` state isn't mistaken for a data outage.
- [ ] Workout calendar heat-map cells need non-color differentiation (numeric label or pattern) per SC 1.4.1.

### Sign-off condition
All seven blocking items resolved before v5.3.0-beta.1; Geordi re-reviews rendered card for anchor alignment, scrim contrast, and tab focus order before stable.

---

## XO Implementation Review — Cmdr. William Riker
*Filed: stardate 2026.05.04*

### Answers to Data's open questions
1. `Tendi's Sickbay` is approved. It fits the easter-egg tone without undercutting the dashboard.
2. Confirm avatar removal. No photo slot, no initials badge, no likeness surface; `FILE_ID` is enough.
3. `medical.respect_user_scoping` stays default `true`. Worf gets veto authority if implementation weakens that guarantee.
4. Keep per-profile consent in §7.9 default `true`. Household dashboards are exactly where accidental overexposure happens.
5. Ship threshold defaults, not blanks, and add a README disclaimer: informational defaults, not medical advice.
6. When multiple platforms supply one `vital_kind`, choose the freshest non-stale sample; break timestamp ties by configured platform order. Do not first-match stale data.
7. Confirm battery routing to Engineering. Medical only owns patient-facing biofunction values.
8. Revise scope: `v5.3.0` ships `summary` only. Do not spend bundle and QA budget on placeholder `anatomical`/`biomedical` tabs.
9. Per-user masking plus opt-in and consent gates are sufficient for first ship; fully separate per-person dashboards are deferred.
10. Highest-priority follow-on is Apple Health via Health Auto Export, but only after a contract spike proves stable entity naming.

### Sequencing & dependencies
Keep global ship order at `5.2.0 -> 5.3.0 -> 5.4.0`. Do not move `<lcars-anatomical-silhouette>` into `5.2.x`; Medical is the correct first home because it is the first real consumer. What should ride in `5.2.x` are the enablers: `default_enabled`, screenshot-obfuscator extension, and any generic lint guard for value-bearing logs. For `5.3.0`, ship the summary card, privacy gates, threshold engine, and multi-profile grid; defer back/top silhouettes plus scan tabs to `5.3.1`. Backlog hygiene: `5X-3.5 Medical Bay` is reasonable, but the proposed `5X-3.6` for back/top silhouettes conflicts with Subspace's deferred Infrastructure item. Use a fresh ID instead. Capacity: 22 points. Critical path: silhouette primitive + privacy gates + single-profile summary card.

### Story breakdown (epic → stories)
Epic: Medical Bay v5.3.x
1. Privacy enablers — Size M, 3 pts, deps on `5.2.x` tooling. AC: config-flow consent copy lands, screenshot tool supports medical selectors, log-lint rule blocks numeric interpolation.
2. Discovery + threshold contract — Size M, 3 pts, deps 1. AC: `MEDICAL_PLATFORMS`, `MEDICAL_VITAL_CLASSES`, staleness handling, and override parsing work against Withings fixtures.
3. Silhouette primitive + front SVG — Size L, 5 pts, deps 1-2. AC: hand-authored front silhouette renders 13 slots within tolerance; overlay and leader lines work; no script or foreignObject surface.
4. Summary Biofunction Card — Size L, 5 pts, deps 2-3. AC: Zone A/B/C render for single-profile Withings; at least 6 tiles populate; status pill matches threshold cases.
5. Multi-profile binding + scoping — Size M, 3 pts, deps 2-4. AC: `person` mapping resolves, non-owner viewers see `•••`, consent gate holds values behind tap-to-enable.
6. Workout tile + docs/release assets — Size M, 3 pts, deps 4-5. AC: workout strip renders from calendar payload, README/gallery/changelog/release notes are updated, `v5.3.1` follow-on story captured for scan modes.

### Definition of Done (additions to spec's acceptance criteria)
- [ ] Add one redacted and one developer-only unredacted visual QA capture to `examples/`, with the public artifact using screenshot-obfuscator by default.
- [ ] Extend the screenshot-obfuscator for `.lcars-medical-redactable`, `.lcars-medical-redactable-overlay`, and `.lcars-medical-redactable-id` and verify refusal behavior on `/lcars-medical`.
- [ ] Add `CHANGELOG.md` entry, README Panel Gallery update, HACS release notes draft, and a beta tester checklist focused on consent, masking, and stale-data handling.
- [ ] Add the README disclaimer that dashboard thresholds are informational defaults and not medical advice.
- [ ] Update `plans/backlog-5x.md` with the shipped Medical item and a non-conflicting follow-on ID for back/top silhouettes and scan tabs.

### Risk register (Six Sigma FMEA)
| Risk | Severity | Occurrence | Detection | RPN | Mitigation |
|---|---:|---:|---:|---:|---|
| PHI-adjacent values leak through screenshots, logs, or DOM text | 10 | 4 | 6 | 240 | Default redaction on, log-lint rule, Worf review, screenshot refusal path |
| Per-profile consent fails on a shared browser and exposes another user's data | 9 | 4 | 6 | 216 | Browser-local consent key per `FILE_ID`, explicit pending overlay, QA on multi-user devices |
| Threshold defaults are mistaken for medical advice | 8 | 4 | 6 | 192 | README disclaimer, config copy, no recommendation language in UI |
| Freshest-source arbitration flips between platforms and shows wrong vital | 7 | 5 | 5 | 175 | Staleness window, deterministic tie-break order, per-profile preferred-source override |
| User scoping masks the wrong profile or fails on `person.user_id` mismatch | 9 | 3 | 6 | 162 | Mapping validation, admin override audit, tests for owner/admin/other-user paths |

### Make it so?
GO-WITH-CONDITIONS. The dashboard is sound, but `5.3.0` must stay disciplined: summary mode only, privacy gates intact, and no backlog-ID collision. Ship the primitive here, prove it with Medical, and let Starship generalize it afterward instead of prebuilding speculative plumbing in `5.2.x`.

---

## Innovation Review — Acting Ensign Wesley Crusher
*Filed: stardate 2026.05.04*

### What's exciting here
The Biofunction Card is the first *truly anatomical* surface in the LCARS family — anchors on a silhouette is a primitive that unlocks a whole class of future panels (engineering ship cutaway, plant-watering schematic, even pet-bowl scales). The redaction-first, consent-gated, no-network posture is exactly the right model for vitals data and worth canonizing as a reusable `<lcars-redactable-tile>` mixin. ECG-style waveform + thermal-overlay focus mode is the most cinematic LCARS surface we've shipped.

### HA/HACS ecosystem opportunities
Roadmap candidates that feed directly into `MEDICAL_VITAL_CLASSES` and silhouette anchors:

| HACS | Repo pattern | Adds | Caveat |
|---|---|---|---|
| Google Fit | `github.com/YorkshireIoT/ha-google-fit` | Steps, calories, weight, sleep | OAuth setup; Google deprecating Fit API in 2026 — verify successor |
| Dexcom | `github.com/gagebenne/dexcom` | Real-time CGM glucose mg/dL | Requires Dexcom Share account; Type-1 households only |
| Garmin Connect | `github.com/cyberjunky/home-assistant-garmin_connect` | 130+ sensors (HR, HRV, Body Battery, stress, sleep stages) | Unofficial; rate-limit risk |
| Oura Ring | `github.com/jeroenterheerdt/HA-Oura` | Sleep score, readiness, temp deviation | Personal-access-token gate |
| Fitbit Charge | `github.com/zewelor/ha-fitbit` (community) | Continuous HR, SpO2, skin temp | Native HA `fitbit` covers basics — only add for premium fields |
| Mi Band | `github.com/AlexxIT/MiBand` | Steps + HR via BLE proxy | Needs ESPHome BLE proxy in range |
| Apple Health | `github.com/lukas-clarke/apple-health-auto-export` | iOS Shortcuts → REST → HA sensors | Requires paid Auto Export app + a webhook endpoint |

Each should ship with a `MEDICAL_VITAL_CLASSES` entry and an anchor mapping so the silhouette "lights up" as integrations come online.

### Modern web platform leverage
- **View Transitions API** (`document.startViewTransition`) for the focus-mode expansion — anchored callout grows into the full ECG/anatomical/biomedical tab. Gate with `if (!document.startViewTransition)` fallback. Newly-Baseline same-document; cross-doc not needed here.
- **Container Queries** on the biofunction-card grid so it reflows cleanly when sidebar collapses or on the upcoming portrait wall-tablet mode.
- **CSS `@scope`** to isolate silhouette styling from the parent dashboard — prevents a stray `path { stroke }` rule from bleeding in.
- **CSS `@property`** for animatable thermal-overlay gradient stops (typed `<color>` registration enables true gradient interpolation).
- **Web Animations API** for the ECG waveform — `element.animate()` with a `linear` timing keeps GC churn lower than rAF redraws and yields automatic `prefers-reduced-motion` honoring.
- **Speech Synthesis API** behind a per-profile `vocalize_vitals` toggle (default OFF). Worf will object — pre-empt with: utterance is always sanitized to redacted strings unless consent gate is open, never speaks raw values from background.

### Stretch features (post-MVP)
- **ESPHome MAX30102** pulse-ox/HR sensor on a meditation cushion — local, no cloud, populates HR anchor when seated.
- **ESP32 + MR24HPC1 mmWave** in the bedroom for sleep-posture / breathing-rate detection without a wearable.
- **BLE-to-MQTT bridges** (`github.com/custom-components/ble_monitor`) to ingest cheap medical BLE devices (thermometers, scales, pulse-oximeters) without their cloud apps.
- **Withings BPM Connect → automation hook**: meditation low-BP session detected → `scene.medbay_low_light` (dim lights, lower thermostat 1°F, pause loud media). Flag for Worf: ensure no BP value crosses an event-bus boundary unredacted.

### "What if we…?" experiments
- **Holodeck Fitness Programs**: predefined workout cards that cross-link to media playback ("PROGRAM: KLINGON CALISTHENICS" → starts a YouTube playlist on the gym TV via `media_player.cast_to`).
- **Family leaderboard** (opt-in, gated, profile-scoped) — workout streak badges, weekly step crown. Strictly non-numeric in shared view: "GOLD / SILVER / BRONZE" pills, no raw counts.
- **"EMH Activated" easter egg** when SpO2 < threshold AND HR > threshold simultaneously — flashes a soft amber alert pill (informational only, never medical advice).
- **Cross-link to Cetacean Ops**: pool/spa session detected → temporarily inflate "recovery" bias on Garmin Body Battery anchor.

### Sign-off
**ENTHUSIASTIC** — this is the most ambitious privacy-respecting biometric surface I've seen in the HA ecosystem. The silhouette+anchor primitive will pay dividends across three more dashboards. Ship the MVP, then aggressively expand the integration matrix.

