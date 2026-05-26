# Changelog

All notable changes to the LCARS Dashboard project are documented here.

## [5.15.0-beta.2] — Sickbay live-review fixes (Stories 5–6)

Three live-review bugs caught after beta.1 install against the malick HAI v1.1.0 deployment.

- **BP chart body visibility**: Withings persists one BP reading per day for most users, so `min == max == mean`. The beta.1 mean-only fallback rendered a 1-SVG-unit pill (~2 px) — invisible. Reworked: every day with a `mean` value now draws a visible 2.4-unit-tall horizontal tick (~5 px); days with a real range additionally draw a range bar with a 3-unit minimum height clamp. Visible regardless of intra-day variability.
- **Workout-route NO DATA vs ROUTE UNAVAILABLE**: when the HAI workout entity is `state: unavailable`, the attrs dict still contains `{device_class, friendly_name}`. Beta.1 treated that as schema-mismatch (`WORKOUT · ROUTE UNAVAILABLE`). Now correctly falls to `WORKOUT · NO DATA` when no meaningful workout fields are present.
- **Hypnogram efficiency > 100%**: HAI / Apple Health occasionally ship `efficiency_pct > 100` when a multi-day window aggregates or naps overlap with overnight sleep. Display value is now clamped at 100% in the header pill. Underlying data is not modified.

Build clean.

## [5.15.0-beta.1] — Sickbay Stories 5–6 (HAI-dependent primitives)

The v5.15 train arrives. Three new BIOMEDICAL primitives land once the Health Auto Import HACS integration (v1.1.0) ships the LCARS Sickbay Data Contract v2 attributes. Also rolls in two bugs caught during live review of v5.14.0-beta.2.

### Stories 5–6 — new primitives

- **`<lcars-ecg-strip>`** (Story 5) — LCARS analog of the Apple Health "Electrocardiograms" measurement screen. Classification banner + LTTB-downsampled waveform card (1,200 visible points from any sample density) + footer with status, sanitized source device, timestamp, and folded 7-day HR-alerts notifications. **Two-layer consent gate**: base profile consent AND a second-layer `consent.ecg` (Worf §7.7); the waveform renders only when both are true. Default OFF. Schema-mismatch + truncation degraded states surface as pills, never raw fallback. Per spec §4.1.
- **`<lcars-hypnogram>`** (Story 6a) — per-segment sleep timeline (Awake / REM / Core / Deep) over the night's clock span. Default placement: BIOMEDICAL tab row 6 with `suppressTimestamps=true` per Worf S2-10 (totals only). When the `segments[]` attribute is absent, falls back to a stacked-bar totals view derived from `time_asleep_min` / `time_in_bed_min`. Per spec §4.2.
- **`<lcars-workout-route>`** (Story 6b) — workout GPS route. Accepts the Google-encoded polyline string only (Worf S0-2 — raw `{lat,lon}[]` arrays explicitly rejected). Decodes inside the closed shadow root, normalizes to a 200×200 viewBox, and discards the lat/lng pairs. No coordinate text rendered anywhere (Worf W2). Per spec §4.5.

All three primitives:
- Carry `data-medical="phi"` and `data-redact-priority="high"` so the screenshot obfuscator blackouts the entire surface in one click.
- Implement the W6 cache-lifecycle contract: `_disposeCaches()` runs on every `cacheRevision` bump (parent ticks on consent change, binding change, profile switch).
- Silence numeric PHI in `aria-label` by default (Worf W7).
- Schema-probe HAI's `lcars_schema_version: "1"` attribute and fall back gracefully when absent.
- Handle the `(truncated — too large for entity attributes)` degraded state per HAI handback caveat #2.

### Consent — second layer

- `hasEcgConsent(fileId)` / `grantEcgConsent(fileId)` / `revokeEcgConsent(fileId)` added to `lcars-medical-utils.js`. Browser-local storage at `lcars_medical_consent.<fileId>.ecg`. AND-gated with base consent. Full medical_profiles.yaml schema migration deferred to a later beta.
- The waveform card surfaces an `ENABLE WAVEFORM »` pill when consent is missing; clicking grants ECG consent and bumps the cache ticker so any stale frames from the prior consent state cannot survive the transition (§7.7 mid-render toggle contract).

### Bug fixes (rolled in from v5.14.0-beta.2 live review)

- **BP 30-day chart body empty** (live-review bug): when Withings persists only `mean` per day (no separate `min`/`max`), the chart bars never drew even though averages computed correctly. The chart now falls back to a slim 1-unit-tall pill at the mean position when ranges are absent — visually represents the day instead of going blank.
- **ANATOMICAL silhouette anchor dash spam** (live-review bug): non-anatomical anchors (BP/HR/TEMP/SPO2/RESP/ACTIVE/DISTANCE/STEPS) were rendering as `—` instead of being omitted. The silhouette is now sparse by design — only WEIGHT (abdomen) appears, which is the only body-composition kind with an anchor.

### HAI handoff

- [plans/health-auto-import-data-contract.md](plans/health-auto-import-data-contract.md) gained a new §7 "v5.15.0 implementation feedback" documenting what worked perfectly in HAI v1.1.0 (all five asks shipped cleanly) and four small soft asks for future iteration (none blocking) — `source_devices` on the ECG entity, per-stage `_min` totals on sleep, true `ended_at` on workouts, documented HealthKit classification vocabulary.

## [5.14.0-beta.2] — Sickbay live-review fixes

Bug-fix beta addressing the issues the crew (Riker / Data / Geordi / Wesley / Worf) caught on the live install of beta.1. Per Captain ruling "fix it all in beta 2" this is a comprehensive synthesis pass — no scope deferred.

### Crew S1 — data correctness

- **BP 30-day range** (`<lcars-bp-range>`) now reads the underlying entity `unit_of_measurement` and rescales `inHg → mmHg` (×25.4) before aggregation. The Withings integration stores blood pressure in `inHg`; the parent reducer was converting, but the recorder-stats path was not — producing `SYS AVG 4 · DIA AVG 3`. Fixed.
- **Sleep score bar** (`<lcars-sleep-score-bar>`) now resolves contributors from `vitalsByKind` first (EFFICIENCY / RECOVERY / HRV BAL / ACTIVITY) and only falls back to the Oura suffix walk for LATENCY / REGULARITY / RESTFULNESS / SLEEP RECOVERY / DAY RECOVERY / RESILIENCE. Previously only 3 of N contributors rendered. Missing contributors now show as dashed placeholders with `N OF M CONTRIBUTORS RESOLVED` sub-note.
- **HR zones** (`<lcars-hr-zones>`) `SET BIRTHDATE` empty-state pill is now clickable and fires the standard `hass-more-info` event on the bound `person.<slug>`.
- **ECG composite tile** now uses `_isEnumValueDisplayable` + `_formatEnum` helpers — the `String(NaN).toUpperCase() → "NAN"` artifact is gone; empty cells render as `NO DATA` or `—`.
- **ANATOMICAL silhouette** anchor callouts are now filtered to body-composition kinds only (anchored kinds whose `tabs[]` includes `anatomical`). The SUMMARY callout cloud no longer leaks into ANATOMICAL.
- **Body-temp deviation** classifier is now asymmetric — only positive deviations escalate to ELEVATED / ALERT / CRITICAL; negative deviations cap at ELEVATED only when `|cool| > alertMaxAbs`. A nominal `-0.5 °C` morning reading no longer trips a false ELEVATED.
- **SUMMARY tab** narrowed from ~15 tiles to ~6 (readiness, sleep_score, stress_resilience, steps, active_minutes, medications, last_workout). Body battery / recovery / cardiac kinds moved to BIOMEDICAL where they belong.
- **Variant rows** with non-finite or unknown values are now skipped from tile render (`displayVariants` filter).
- **Breathing Disturbance Index** un-ignored and labeled `BDI` under the sleep-breathing class.
- **MEDICAL_SOURCE_PRIORITY** re-promotion: when a kind has variants from multiple platforms, the canonical platform per `MEDICAL_SOURCE_PRIORITY` is moved to `variants[0]` so it wins the headline.

### Crew S2 — UX

- **Status pill** now carries a `WHY` sub-line when the rollup is non-NOMINAL — names the highest-severity present anchor (label + value). Value carries `data-medical="phi"` so the screenshot obfuscator redacts cleanly.

### Crew W (Worf) — privacy

- **W7 — aria-label PHI silenced** by default on `<lcars-bp-range>`, `<lcars-sleep-score-bar>`, `<lcars-hr-zones>`. Aria labels are now generic ("Blood pressure 30-day range", "Sleep score breakdown", "Heart rate zone distribution"); numeric values stay visible in the DOM but are gated under `data-medical="phi"` for the obfuscator.
- **W6 — cache lifecycle**: all three new primitives accept a `cacheRevision` prop. Parent bumps `_cacheRevision` on consent grant, binding change, and focus-mode change so cached frames from a prior consent / profile state cannot survive a transition.

### Captain rulings applied

1. Numeric PHI silenced in `aria-label` by default (W7).
2. Source chips + last-sync row stay readable (admin-only screen; obfuscator handles screenshots).
3. `personMaxHrEst` stays precise (220 - age).
4. Comprehensive synthesis scope — every reviewed item shipped in this beta.

## [5.14.0-beta.1] — Sickbay tab redesign (Stories 0–4)

First beta of the v5.14 Sickbay redesign — the focus-mode tab content reorganization and the three new BIOMEDICAL primitives that do not depend on Health Auto Import plug-in cooperation. Stories 5–6 (`<lcars-ecg-strip>` waveform, `<lcars-hypnogram>` per-segment, `<lcars-workout-route>`, optional SLEEP tab) ride v5.15 once HAI ships the data-contract attributes per [plans/health-auto-import-data-contract.md](plans/health-auto-import-data-contract.md). The Riker split keeps this train honest.

### Sickbay — tab content reorganization (Story 1)

- **`MEDICAL_VITAL_CLASSES` now carries a `tabs[]` field** per kind (`summary` / `anatomical` / `biomedical` / `sleep`). Replaces the "first 20 tiles" slice. `vitalKindsForTab(tab)` returns the filtered list; `_renderTiles(vitalsByKind, profileKey, tab)` walks it. No parallel `MEDICAL_TAB_ASSIGNMENTS` map (per Data CR-1 — two sources of truth would drift).
- **SUMMARY** keeps the silhouette + tile strip and gains a new **LAST SYNC row** at the bottom: `LAST SYNC · {max_freshness} · {N} SOURCES ({comma_list})` (per spec §3.1.2). Slot 6 of the tile strip is now the new **MEDS** composite tile (Wesley #1) — surfaces the HAI medications sensors so the captain can glance at "did mom take her morning pill?". Status bands: TAKEN (nominal), PENDING within 30m (nominal), PENDING 30m–2h (elevated), OVERDUE (alert).
- **ANATOMICAL** still renders the anterior silhouette + posterior placeholder, and now appends the tile strip filtered to body-composition + mobility + fitness kinds (weight composite, body fat, lean / fat / muscle / bone / visceral mass, hydration, BMI, mobility composite, VO2 max).
- **BIOMEDICAL** retains the existing ECG/HR-alerts panes and appends three new sections:
  - cardiac tile strip (HRV, HRV BAL, VO2 MAX, CV AGE, audio exposure, data-link, last-workout, ECG composite, HR ALERTS composite)
  - 30-day `<lcars-bp-range>` chart + `<lcars-hr-zones>` two-up
  - full-width `<lcars-sleep-score-bar>` (donut REJECTED per crew C3 — circles aren't LCARS grammar)

### Sickbay — cross-source priority + RECOVERY MODE (Story 1c)

- **`MEDICAL_SOURCE_PRIORITY` table** keyed by `vital_kind` → ordered platform list. When a kind has variants from more than one platform, the tile shows a one-glyph superscript chip (ᴼ Oura, ᴴ HAI, ᵂ Withings, ᴹ MQTT, ᴬ Apple Health, ᶠ Fitbit, ᴳ Garmin, ᴰ Dexcom). Wesley #2 — no more "why does this number disagree with my watch" support thread.
- **`RECOVERY MODE` status-pill modifier** (Wesley #6). When Oura `binary_sensor.*_rest_mode` is on, the Zone-A status pill renders `RECOVERY MODE · DAY N` in amber regardless of the underlying reducer, preserving the "ship takes care of you" tone. Day count derived from `_rest_mode_start`. Reverts to reducer-computed status when rest mode returns to `off`.
- **Last-sync row** computes `max_freshness` from the newest `last_changed`/`last_updated` across all bound entities for the profile; platform list is uniqued by source-chip class.

### Sickbay — new visual primitives (Stories 2–4)

- **`<lcars-hr-zones>`** — four stacked horizontal LCARS bars (PEAK / INTENSE / MODERATE / LIGHT) sized by time spent in each zone during the last workout. Zone thresholds derived from `220 - age` via `person.birthdate`. Per ratified Q-C: when birthdate is absent, the bars hide and an LCARS pill renders `WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES`. Sample-based when HAI ships `samples[]`, dominant-zone estimate otherwise (prefixed `~`).
- **`<lcars-bp-range>`** — 30-day blood-pressure min/max/avg range chart over AHA-banded mmHg scale (80/90/120/130/140 dashed reference lines). Color tokens locked per Geordi C6: sys = `--lcars-butterscotch`, dia = `--lcars-ice`, avg-tick = `--lcars-space-white`, AHA lines = `--lcars-gray` @ 50%. Shadow host carries `data-redact-priority="high"` per Worf W3 so the screenshot macro can blackout the entire 30-day surface in one click. Data via `recorder/statistics_during_period` through the new shared `lcars-recorder-stats.js` helper (Story 0b — per Data CR-4).
- **`<lcars-sleep-score-bar>`** — horizontal stacked LCARS bar (donut REJECTED per crew C3). One pill-segment per contributor (Oura: EFFICIENCY / LATENCY / REGULARITY / RESTFULNESS / DURATION; HAI: DURATION / BEDTIME / INTERRUPTIONS — vocabulary auto-detected). Score numeric + qualitative band (EXCELLENT / GOOD / OK / POOR / ALERT) above the bar, contributor breakdown table below.

### Architecture (Story 0)

- **`lcars-recorder-stats.js`** — shared HA `recorder/statistics_during_period` fetcher with per-call cache + 5-min TTL + simple batching. Supports both 24h hourly (sparkline-style) and 30-day daily (BP-range-style) windows via the same call. `aggregateDaily()` helper rolls per-hour buckets into per-day min/max/mean rows. `<lcars-sparkline>` continues to use its own helper for now; migration deferred to a future arch refactor.
- **§7.4 parent-spec redaction selector** — verified that the shipped `data-medical="phi"` data-attribute on shadow hosts is already what the screenshot obfuscator targets in `localinfo/screenshot-obfuscator.js`. Worf S0-1 amendment is documentation-only; no code change required because the contract already matches.
- **PHI gates W1, W3, W6 enforced** on every new primitive: shadow host carries `data-medical="phi"`, BP-range additionally carries `data-redact-priority="high"`, all primitives implement `_disposeCaches()` (no-op for HR-zones / sleep-score-bar where no cache exists; BP-range clears its recorder cache on profile switch / consent change / unbind).

### Specs + plans

- **New**: [specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md](specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md) — v2 crew-reviewed, ratified Q-A/B/C/D in §10, expanded §7 privacy (W1–W6 + §7.7 consent.ecg lifecycle + §7.7a ECG history opt-in policy + §7.8 input hygiene + §7.9 W6 cache lifecycle + §7.10 trust-boundary disclosure + §7.11 admin-gate option).
- **New**: [plans/5.14-sickbay-tab-redesign.md](plans/5.14-sickbay-tab-redesign.md) v2 — Riker split (v5.14 = Stories 1–4 only; Stories 5–6 v5.15 with permanent-degraded-mode fallback if HAI never ships), expanded risk register + verification matrix.
- **New**: [plans/health-auto-import-data-contract.md](plans/health-auto-import-data-contract.md) v2 — 5 asks (ECG voltage, sleep segments, workout HR samples, **encoded** workout polyline, schema-probe). ECG history list withdrawn per Worf S0-3, raw `route[]` withdrawn per Worf S0-2.
- **Updated**: [specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) — status line now points to the v5.14 redesign spec.
- **localinfo**: split [combined.entities.csv](localinfo/combined.entities.csv) into 82 per-integration files under [localinfo/entities/](localinfo/entities/) for readability; new health_auto_import.csv captures 64 entities from the Apple Health Auto Import plug-in.

### Crew review

Full crew review of v1 spec/plan/handoff produced 5 verdicts and ~40 change requests; v2 documents apply every accepted change. Geordi: 8 LCARS-grammar fixes; Worf: S0-1/S0-3/S0-4/S0-5 + new W6 gate + 4 Captain-consent items; Data: 10 architecture refinements; Wesley: 11 feature ideas (2 shipped in this beta: medications tile, rest_mode pill modifier); Riker: train split + Story-0 prerequisites + parallel-train-collision risk added.

### Known limitations

- ECG waveform render, per-segment hypnogram, and workout-route map remain spec'd but **not implemented** in this beta — they ride v5.15 once HAI plug-in ships the required attributes. Today's BIOMEDICAL tab keeps the existing decorative ECG strip.
- Optional 4th SLEEP tab (`dashboard_options.sickbay_sleep_tab`) is spec'd; config plumbing ships in v5.15 alongside the hypnogram migration.
- `<lcars-bp-range>` requires the user's Withings (or HAI BP) entities to have `state_class: measurement` for `recorder/statistics_during_period` to populate min/max/mean. Most Withings BP sensors already do; HAI BP latest does not always — known follow-on.

## [5.10.0] — Stable promotion (Train 4)

Stable promotion of the 5.10 line, rolling up all `5.10.0-beta.{1..9}` work into one shipping release. Highlights since v5.9.0:

### Sickbay
- Heart-rate band recalibration (`nominalMax: 100 / elevMax: 130 / alertMax: 150`) for point-in-time pulse readings (Withings, Oura). Resting-HR remains a follow-on path. _(beta.3)_
- Biometric source mix tweaks. _(beta.2)_

### Habitat
- Visual polish on the Home Overview area tiles, re-shaped as LCARS pill buttons (right-rounded `--lcars-african-violet` fills, sidebar-pill aesthetic, hover→gold, WCAG-compliant min-height). _(beta.4, beta.7)_

### Tactical
- Chronicle now filters out network/uplink/connectivity switches (DPU 4G failover, WAN, LTE, cellular, modem, VPN, PoE port toggles, WiFi/SSID/guest-network, radio, status-LEDs) — they were leaking into the Movement & Illumination timeline. _(beta.7)_

### Galley (#226 — ThermoWorks PROBES)
- ThermoWorks Cloud probe thermometers (BlueDOT, Signals, Smoke X4, RFX Meat) are first-class Galley citizens. Added `thermoworks_cloud` to `GALLEY_PLATFORMS` and `PLATFORM_PANEL_MAP` in `lcars-entity-utils.js`.
- New PROBES cluster alongside APPLIANCES with section header (`PROBES · N`). `_partitionEntities()` splits the device map by platform.
- Per-probe card with name + last-4 device-id slug (RFX MEAT disambig), 6 channel chips, battery (tomato `<20%`), signal, STALE pill (`>15min` since `_last_seen`).
- Border color tracks hottest channel: gray idle / butterscotch `<60°C` / gold `60–90°C` / tomato `>90°C`.
- STALE-hide toggle, sort fresh→recent→stale, badge counts cooking + probes separately (`2 COOK · 4 PROBE`). _(beta.8)_

### Engineering — Fabrication subpanel (#225)
- New `FAB` sidebar tab in the Engineering dashboard alongside `ALL / LIVE / DAILY`, rendering Bambu Lab printers via `_renderFabrication()`. Discovery groups entities by printer slug and resolves display name preferring the primary device.
- Per-printer card: status pill, tomato error border (`*_print_error` / `*_hms_errors`), progress track + `L X/Y` / `ETA Nm` / task name, temperature tiles (`BED / L NOZ / R NOZ / CHAMBER`) with target deltas, chamber camera `<img>` from `image.*_cover_image`, AMS humidity row + per-tray filament pills, `CHAMBER LIGHT` / `BED LIGHT` toggle buttons.
- Hidden as diagnostic noise: `*_mqtt_*`, `*_ip_address`, `*_firmware`, `*_wi_fi_signal`, `*_sd_card_status`, `*_developer_lan_mode`, `*_hotendrack_*`, fan-speed sensors. _(beta.8)_
- **Fabrication WATCH cameras (label-tagged):** Tag any HA camera with the label `fabrication`, `fab`, `printer`, `printers`, `3d_printer`, or `3dprinter` (entity, device, or area) to surface it in a `WATCH` row beneath the printer grid. 16:9 snapshot tile from `entity_picture`, name overlay, click → live more-info. Empty-state guard relaxed so the WATCH row renders without a Bambu printer present. _(beta.9)_

### Hotfix line
- Reverted `b075690` (Lit migration originally shipped in beta.5) — broke shared card chrome across #235 (Subspace Relay AP tile grid), #236 (Sickbay anatomical silhouette + vitals layout), #237 (Engineering 4×3 tile grid / pill tabs / corner-docked badges). #134 re-opened for a future, properly-reviewed migration. _(beta.6)_

### Documentation
- New: `specs/LCARS-FABRICATION-PANEL-SPEC.md`.
- Updated: `specs/LCARS-GALLEY-PANEL-SPEC.md` §2.1/§2.2 (PROBES cluster).
- Updated: `TAGGING.md` — new "Fabrication Camera Labels" section.

### Issues closed
- #225, #226 (Train 4 #1).

## [5.10.0-beta.9] — Fabrication WATCH cameras (label-tagged)

### Engineering — FAB tab
- **External cameras pointed at a printer can now be surfaced on the FAB tab.** Tag a camera (entity, device, or area) with the HA label `fabrication`, `fab`, `printer`, `printers`, `3d_printer`, or `3dprinter` and it shows up in a new `WATCH` row beneath the printer grid. Each camera renders as a 16:9 snapshot tile (sourced from `entity_picture`) with the friendly name overlaid; click → live more-info dialog. `NO SIGNAL` placeholder when the camera doesn't expose `entity_picture` yet.
- **Section header counter extended to `N UNITS · M CAM`** when cameras are present.
- **Empty-state guard relaxed:** the FAB tab is no longer empty when you have only a tagged camera and no Bambu integration. Captain who runs a non-Bambu printer with a Reolink pointed at it gets the WATCH row by itself.
- New helper `_entityHasLabel(ent, labelSet)` reuses the entity → device → area precedence chain that circuit/camera labels already use.

### Documentation
- **TAGGING.md:** New "Fabrication Camera Labels" section.
- **specs/LCARS-FABRICATION-PANEL-SPEC.md:** New §5.1 (WATCH camera discovery + render).

## [5.10.0-beta.8] — Train 4 #1: ThermoWorks PROBES + Bambu Fabrication

### Galley (#226)
- **ThermoWorks Cloud probe thermometers are now first-class Galley citizens.** Added `thermoworks_cloud` to `GALLEY_PLATFORMS` and to `PLATFORM_PANEL_MAP` in `lcars-entity-utils.js`; existing detector auto-routes BlueDOT / Signals / Smoke X4 / RFX Meat devices into the Galley card.
- **New PROBES cluster** in the Galley card renders alongside APPLIANCES with its own section header (`PROBES · N`). `_partitionEntities()` splits the discovered device map by `platform` (appliances vs probes) so the two grids render independently.
- **Per-probe card:** device name + last-4 of device-id slug (disambiguates the eight commonly-identical "RFX MEAT" devices), up to 6 channel chips (`CH1 195°F`, `CH2 75°F`, ...), battery % (tomato `<20%`), signal strength, and a relative-time `LAST` indicator on stale probes.
- **Border color tracks hottest channel** (converted to °C): gray idle / butterscotch `<60°C` / gold `60–90°C` / tomato `>90°C` (smoking).
- **STALE detection:** `>15min` since `*_last_seen` (or since channel reading) desaturates the card to 55% opacity and adds a `STALE` pill. Stale probes hidden by default with a `SHOW ALL (N STALE)` / `HIDE STALE` toggle alongside the section header.
- **Badge counts active appliances + fresh probes separately** (`"2 COOK · 4 PROBE"`).

### Engineering (#225)
- **New `FAB` sidebar tab** in the Engineering dashboard (`lcars-engineering-layout.js`) routes to a Fabrication subpanel rendered by `_renderFabrication()` in `lcars-engineering-card.js`. Decision (Data): a single 3D printer does not earn a top-level dashboard slot, so Bambu lives inside Engineering as the fourth filter tab alongside `ALL / LIVE / DAILY`.
- **Discovery:** `_discoverFabrication()` scans `hass.entities` for `platform === 'bambu_lab'`, groups by printer slug (`h2c_31b8ap612800082`-style prefix), resolves display name preferring the primary device (filters out `_AMS_` / `_ExternalSpool` / `_HotendRack` sub-device names).
- **Per-printer card:**
  - Status pill + current stage in the header; error border (tomato) when `*_print_error` is set or `*_hms_errors > 0`.
  - Progress track with `*_print_progress` fill + `L 247/1245` / `ETA 47m` / task name meta.
  - Temperature tiles for `BED` / `L NOZ` / `R NOZ` / `CHAMBER` with target deltas; tile color tracks heating state.
  - Chamber camera `<img>` sourced from `image.*_cover_image` `entity_picture`.
  - AMS row: humidity label + one pill per tray with filament color swatch and `T{N} · {type}` label.
  - Footer: print-type and speed-profile meta, `CHAMBER LIGHT` / `BED LIGHT` toggle buttons (call `light.turn_on` / `light.turn_off`).
- **Hidden:** `*_mqtt_*`, `*_ip_address`, `*_firmware`, `*_wi_fi_signal`, `*_sd_card_status`, `*_developer_lan_mode`, `*_hotendrack_*`, fan-speed sensors — diagnostic noise without operator value.

### Documentation
- **New spec:** `specs/LCARS-FABRICATION-PANEL-SPEC.md` (sidebar tab placement, discovery, per-printer card anatomy, hidden list, follow-ons).
- **Updated:** `specs/LCARS-GALLEY-PANEL-SPEC.md` §2 — `thermoworks_cloud` added to platform table; new §2.1 (sub-cluster partitioning) and §2.2 (PROBES cluster behavior).

### Notes
- Closes #225 (Bambu Lab integration) and #226 (ThermoWorks probes).
- Habitat per-area surfaces (Kitchen PROBES-active tile, Office printer-status tile) deferred to a follow-on release.
- Primary live test surface is Boimler's ha.boimler.example (has both integrations). Captain doesn't have either device on ha.mariner.example yet — visual confirmation will come from Boimler.

## [5.10.0-beta.7] — Home Overview LCARS compliance + Chronicle network-switch filter

### Habitat
- **Home Overview area tiles re-shaped as LCARS pill buttons** (Geordi compliance review). Was: rectangular tile, `border-left: 4px solid` accent, area name in `--lcars-font-size-title` (2rem). Now: right-rounded pill (`border-radius: 0 var(--lcars-btn-radius) var(--lcars-btn-radius) 0`), solid `--lcars-african-violet` fill, dark text, area name + entity-count meta on one row in `--lcars-font-size-data`. Matches the sidebar area-pill aesthetic. Hover swaps to gold. Min-height bound to `--lcars-btn-height` for WCAG 2.5.5.

### Tactical
- **Chronicle now filters out network / uplink / connectivity switches.** The DPU 4G failover toggle (and siblings: WAN, LTE, cellular, modem, VPN, PoE port toggles, WiFi/SSID/guest-network, radio, status-LEDs) were leaking into the Movement & Illumination timeline because the pre-existing power-only reject regex didn't cover network config. New regex on the `switch.*` branch in `isChronicleEntity()` (`lcars-tactical-chronicle.js`) rejects `_4g|_5g|_lte|_cellular|_modem|_failover|_wan|_uplink|_poe|_port_N|_vpn|_wifi|_radio|_ssid|_guest_network|_iot_network|_led`.

## [5.10.0-beta.6] — Revert Lit migration (cluster hotfix)

### Hotfix
- **Reverted `b075690` (#134 Lit migration shipped in beta.5)** — the swap to the
  `lit@2.8` family broke shared card chrome across **#235** (Subspace Relay AP tile
  grid), **#236** (Sickbay anatomical silhouette + vitals layout), and **#237**
  (Starship Engineering 4×3 tile grid / pill tabs / corner-docked badges). Captain
  confirmed side-by-side regression vs v5.8.0. Reverting restores `lit-element@^2.2.1`
  / `lit-html@^1.1.2` direct deps (still EOL — **#134 re-opened**; will redo with
  proper Geordi/Data review pass next train). Bundle returns to 1,178,574 bytes
  (beta.4 baseline). `npm audit` still clean.

## [5.10.0-beta.3] — Heart-rate threshold recalibration

### Sickbay
- **Heart-rate bands widened** in `lcars-medical-utils.js` `DEFAULT_THRESHOLDS`.
  New: `nominalMax: 100`, `elevMax: 130`, `alertMax: 150` (was 80/100/100).
  Withings `_heart_pulse` and Oura `_heart_rate` (HACS `nitobuendia`) feed
  POINT-IN-TIME readings — scale grip, live ring sample — not resting HR.
  The prior tight resting-HR bands (50–80 nominal, 100 alert) misfired on
  any normal activity, painting the silhouette red during a brisk walk or
  immediately after standing up.
- **Resting HR is preserved as a future path**: Apple Health `_resting_heart_rate`
  entities and any integration that exposes a dedicated resting-HR entity already
  match our existing classifier and will get the strict bands back once the
  card consumes them as a separate `kind`. Backlog: pull Oura's resting HR out
  of the `sensor.oura_readiness` `resting_heart_rate` attribute (Option B).

## [5.10.0-beta.2] — Sickbay biofunction silhouette redesign

### Sickbay
- **Wireframe Anatomy silhouette** (Wesley Option 4 / X-Ray Mode) replaces the
  prior stick-figure-with-volume in `lcars-medical-silhouette-paths.js`. Now
  uses idealized 8-head proportions (1 head = 60px in 200x480 viewBox) with
  proper anatomical landmarks: chin y=60, nipples y=120, navel y=180, crotch
  y=240, knees y=360, ankles y=460. Elbows land at navel level, wrists at
  crotch — anatomically correct arm hang.
- **Internal anatomy layer** at 35% opacity behind the outline: clavicle,
  sternum, 5 rib-pair arcs, cardiac silhouette (anchored under HR callout),
  diaphragm arc, dashed spinal hint, pelvic ring, femurs, tibias. Reads as
  TNG biofunction monitor / tricorder schematic.
- **Cardiac silhouette uses `currentColor` + `fill-opacity`** — inherits the
  full-figure recolor on alert/critical states (heart goes red when whole
  silhouette goes tomato; thermal-bloom radial overlay still anchored on heart).
- All 9 callout anchors (forehead, throat, heart, left/right arm, abdomen,
  left/right leg, right foot) verified to land within Geordi's tolerance zones.
- ~3.8 KB inline SVG, 53 elements. Within 12 KB beta-2 budget (Captain raised
  ceiling from Geordi's original 4 KB / 50-element cap to enable X-Ray internals).

### Notes
- Supersedes `5.10.0-beta.1`. The body-composition + Tactical noise filter
  changes from beta.1 are included unchanged.

## [5.10.0-beta.1] — Sickbay body composition + Tactical noise filter

### Sickbay (#230)
- **5 new body-composition vital kinds** mapped from Withings: `bone_mass`,
  `muscle_mass`, `fat_mass`, `lean_mass` (fat-free mass), `visceral_fat`. All
  render as Zone C tiles with 2-decimal kg precision.
- **3 new last-workout variants**: `KCAL` (calories burnt), `ELEV` (elevation
  change), `PAUSE` (pause during workout). Captured by extended classifier
  regex `_calories_burnt_last_workout$ | _elevation_change_last_workout$ |
  _pause_during_last_workout$` plus catch-all extension to `/_last_workout$/`.

### Tactical Chronicle (#229)
- **`entity_category` early-exit** in `isChronicleEntity()` — entities
  HA-categorised as `config` or `diagnostic` are now rejected before any
  domain check. Catches the bulk of vendor helper toggles automatically.
- **Extended `CONFIG_TOGGLE_RE`** for status-LED / appliance-config noise:
  `*_display`, `*_panel_light`, `*_status_light`, `*_status_led`,
  `*_indicator_led`, `*_beeper`, `*_buzzer`, `*_audible_alarm`,
  `*_audible_warning`, `*_auto_reboot`, `*_auto_restart`, `*_power_cycle`,
  `*_always_on`, `*_ac_enabled`, `*_usb_enabled`, `*_schedule_enabled`,
  `*_timer_enabled`, `*_child_lock`.
- **New `APPLIANCE_FAN_RE`** rejects `fan.*` entities for purifiers,
  humidifiers, dehumidifiers, ionizers, air-quality units, diffusers. Real
  room-ventilation fans (ceiling/exhaust/floor) still admitted.

### Closed
- Closes #229 (Chronicle device-config switch noise).
- Closes #230 (Sickbay Withings body-composition + workout sensors).

## [5.9.0] — Tactical hardening + Chronicle mode (GA)

Stable release of the v5.9 Tactical train. Rolls up beta.1 → beta.3 plus a final
camera-config-toggle filter polish. Closes #99, #146, #223, #224.

### Headline
- **Hybrid camera tile** (`<lcars-camera-tile>`) — `<ha-camera-stream>` for focused
  viewscreens, fetch+blob+Bearer-token for grid tiles. Zero `?token=` in URLs.
- **Tactical Summary Bar** replacing the ring-gauge cluster — threat glyph, four
  state-coloured pill quadrants (SHIELDS / PERIMETER / SENSORS / VIEWSCREENS),
  LAST EVENT pill. Pulse animation on alarm-triggered. 2×2 grid below 720 px.
- **Chronicle Mode** — per-area 24-hour Gantt timeline of movement & illumination
  state. Astronomical 4-band sun row, JUMP TO NOW, INCIDENT pills, LIGHTS WASTED
  alert (lights on + nobody home + sun up), click any row or bar for `hass-more-info`.
- **8-second camera connect timeout** with 30-second auto-retry while OFFLINE.

### Filter charter (Chronicle)
Strict whitelist — only entities matching the movement-and-illumination charter
appear: `light`, `fan`, `lock`, `switch` (sans power-monitoring), `cover`
(door/window/garage classes), `binary_sensor` with `device_class ∈ {motion,
occupancy, presence, door, window, opening, garage_door}`, plus regex fallback
for unclassified door/contact sensors, `alarm_control_panel`. Now also rejects
camera-config toggles disguised as motion entities — `*_motion_detection`,
`*_detection_enabled`, `*_alarm_enabled`, `*_recording`, `*_audio_detection`,
`*_pir_enabled`, `*_ir_lights`, `*_night_vision`, `*_floodlight_on`, etc.
The actual motion sensors (`device_class: motion`) stay.

### Security
- Camera access token never enters the URL — `Authorization: Bearer` header only.
- Chronicle BLOCKING gates from spec §7: default-deny domains
  (`camera`/`media_player`/`person`/`device_tracker`), sensitive-area regex
  (`/guest|nursery|bath|bathroom|kid/i`), payload-free logging, no
  localStorage/IndexedDB, WS history API only, AbortController on every poll,
  30→60→120→300 s back-off, hidden-tab pause, entity cap 170, hours clamped
  6–72, 500 ms mode-switch debounce.

### Issues closed
- #99 — Camera token leak (hybrid migration)
- #146 — Tactical Summary Bar
- #223 — Camera ESTABLISHING LINK retry
- #224 — Chronicle Mode

### Beta history (rolled into this GA)
- beta.1 — Initial train ship
- beta.2 — Camera Bearer-auth hotfix + Chronicle Map-iteration hotfix
- beta.3 — UX pass: strict scope filter, label de-dupe, click-for-more-info,
  lilac dividers, rounded pill bars, silent-row hide, LIGHTS WASTED indicator,
  Summary-Bar value pills

## [5.9.0-beta.3] — Tactical UX pass (Chronicle scope + Summary pills)

Captain's review pass on beta.2. Eight defects tackled — five Chronicle UX,
one Summary-Bar visual, two derived-insight additions.

### Fixed
- **Chronicle scope: strict whitelist.** beta.1 swept in UPS / EcoFlow G6 power
  telemetry, AI camera-derived detections (`*_animal`, `*_vehicle`, `*_baby`,
  `*_package`), and irrigation entities. `isChronicleEntity()` is now a strict
  whitelist: `light`, `fan`, `lock`, `switch` (sans power-monitoring suffixes),
  `cover` (door/window/garage classes), `binary_sensor` with `device_class ∈
  {motion, occupancy, presence, door, window, opening, garage_door}` plus a
  fallback `object_id` regex for unclassified door/contact/motion sensors,
  `alarm_control_panel`.
- **Chronicle row label de-dupe.** "BACKYARD MOTION" under area "Back Yard"
  now renders as "MOTION". Area prefix stripped (case-insensitive, tolerant of
  spaces/underscores/dashes). Label column widened from 8rem → 11rem.
- **Chronicle silent rows hidden.** Entities with zero state changes inside the
  visible time window are dropped from render — eliminates ~40 % of vertical
  noise on dense areas.
- **Chronicle area dividers visible.** Headers now wear an LCARS African-violet
  end-cap (left 0.5rem bar) + gradient background + space-white bolder name —
  rooms separate at a glance.
- **Chronicle bars rounded.** `border-radius` keyed to bar height — proper LCARS
  pill caps.
- **Chronicle clickable.** Row label and individual bar segments are buttons
  that fire `hass-more-info` (entity dialog). Keyboard-accessible (Enter/Space).

### Added
- **LIGHTS WASTED indicator.** Per area, when any `light.*` is on AND every
  motion/occupancy/presence binary_sensor is off AND `sun.sun` is
  `above_horizon`, a tomato `⚠ LIGHTS WASTED` pill renders in the area header.
  Current-moment evaluation; historical overlay deferred.
- **Summary Bar values as LCARS capsule pills.** SHIELDS / PERIMETER / SENSORS /
  VIEWSCREENS values are now rounded color-filled pills (black text, state-keyed
  background) instead of plain text — matches the LAST EVENT pill and the
  CREW / LOCK pill grammar everywhere else in the bar.

### Issues
No new closes — UX iteration on shipped #99/#146/#223/#224.

## [5.9.0-beta.2] — Tactical hotfix: camera auth + Chronicle render

Two-bug hotfix on beta.1. Both surfaces were inert in production due to subtle
defects in code paths that were not reachable in the dev sandbox.

### Fixed
- **Camera tiles stuck on "ESTABLISHING LINK"**: `/api/camera_proxy/` requires a
  `Authorization: Bearer <access_token>` header. The beta.1 fetch used
  `credentials: 'include'` only and got back HTTP 403. `<lcars-camera-tile>` now
  reads the token from `hass.auth.accessToken` / `hass.auth.data.access_token` and
  attaches it as a request header (still never in the URL — token-leak invariant
  from #99 preserved). Stream mode (`<ha-camera-stream>`) was already correct.
- **Chronicle Mode: "NO TACTICAL ENTITIES IN SCOPE"**: `_gatherEntities()` treated
  `getAreasByFloor()` as `Array<{areas:[…]}>`, but the helper returns
  `Map<floorId, Array<Area>>`. Net effect: the inner loop iterated zero areas
  and Chronicle short-circuited to the empty state on every account.
  `_gatherEntities()` now uses `Map.forEach` over the area lists.

## [5.9.0-beta.1] — Tactical hardening + Chronicle mode

The v5.9.0 Tactical release train closes every open Tactical-tagged issue and
introduces Chronicle Mode — a per-area 24h Gantt timeline for after-action review.
Closes #99, #146, #223, #224. #148 already-fixed in tree (closed pre-train).

### Added — Chronicle mode (#224)
- **`<lcars-tactical-chronicle>`** component: per-area collapsible 24h Gantt timeline
  with astronomical 4-band sun row (deep night → twilight → golden hour → daylight),
  now-indicator, JUMP TO NOW pill, INCIDENT pills on collapsed areas, and dot-cluster
  alert preview when an area is collapsed.
- **`<lcars-tactical-history-store>`** module: module-scoped cache backed by HA
  WebSocket `history/history_during_period` (NOT REST), `minimal_response: true,
  no_attributes: true, significant_changes_only: true`. 30s polling delta with
  AbortController, 500ms mode-switch debounce, 30→60→120→300s backoff schedule,
  hidden-tab pause via `visibilitychange`. Hard cap 170 entities, hours clamped
  [6, 72]. Spec: `specs/LCARS-TACTICAL-CHRONICLE-MODE-SPEC.md`.
- **CHRONICLE sidebar button** added to the Tactical layout as a fourth filter
  (ALL / ACCESS / ZONES / CHRONICLE) — Chronicle replaces the main render path
  entirely when active.
- **Deep link from Habitat** — Tactical layout reads `?mode=chronicle` from
  `window.location.search` on mount and auto-selects the Chronicle filter.

### Security — Chronicle BLOCKING gates (Worf §7)
- **Default-deny domains** (`camera`, `device_tracker`, `person`, `media_player`) and
  entity_id patterns (`/secret|key|token|password|api_/i`) — enforced before query.
- **Default-excluded areas** matching `/guest|nursery|bath|kid/i` unless explicitly
  added to `chronicle.areas`.
- **No payload logging** — counts only. Raw arrays dropped after segment build.
- **No `localStorage` / IndexedDB** — only `sessionStorage` carries
  collapsed-areas list (area_id only, no state values).
- **Camera attribute strip** (`entity_picture`, `access_token`,
  `frontend_stream_type`, `stream_source`, `last_image`) on every history sample,
  defensively, even though cameras are domain-denied.
- **Lit `${}` binding only** — no `innerHTML`/`unsafeHTML` in chronicle code path.

### Added — Camera token-leak fix (#99 + #223)
- **`<lcars-camera-tile>`** new Lit component (hybrid mechanism per
  `specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md` §2):
  - `mode="stream"` (focused viewscreen) → `<ha-camera-stream>` web component,
    auth-via-`hass` (no token in URL); feature-detected with snap-mode fallback.
  - `mode="snap"` (grid tiles) → `fetch('/api/camera_proxy/' + eid,
    { credentials: 'include' })` → `Blob` → `URL.createObjectURL(...)` → `<img>`.
  - 8s connect-timeout state machine: ESTABLISHING → LIVE / OFFLINE.
  - 30s auto-retry while OFFLINE (#223).
  - 3s active / 30s idle blob refresh on snap mode.
  - `URL.revokeObjectURL` on every refresh + `disconnectedCallback`
    (memory-leak prevention — Worf's hard requirement).
- **Camera tile migrated into**: `lcars-tactical-card.js` (main viewscreen + grid),
  `lcars-homepage-card.js` (Habitat area-card cameras × 2), and
  `panels/camera/lcars-camera-panel.js` (device panel).
  Zero `?token=` in `<img src>` across the bundle.

### Added — Tactical Summary Bar (#146)
- **`_renderOverview()` replaced** with a dense full-width Summary Bar:
  threat glyph (`❯`/`◆`/`⚡`) far-left, four quadrant tiles
  (SHIELDS / PERIMETER / SENSORS / VIEWSCREENS) center, LAST EVENT pill far-right.
  Whole-bar color follows alarm state. Pulse animation on `triggered`/`pending`
  (respects `prefers-reduced-motion`). Collapses to a 2×2 grid below 720px.
- **Ring-gauge cluster removed** from the Tactical overview surface — bar reads as
  one shape and frees vertical real estate for the main grid.

### Specs
- **New**: `specs/LCARS-TACTICAL-CHRONICLE-MODE-SPEC.md` (Chronicle Mode design,
  §7 BLOCKING security rules).
- **Revised**: `specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md` §2 (Captain hybrid
  override of pure-`<ha-camera-stream>` mandate; rationale documented).

### Bundle
- **`lcars-dashboard.js`**: 1.09 MiB → 1.11 MiB (+20 KiB — within Chronicle budget).

### Issues closed
- #99 — camera access_token leak (token never in URL across the bundle)
- #146 — Tactical Summary Bar replaces ring-gauge cluster
- #223 — Camera ESTABLISHING-LINK reconnect after WAN flap
- #224 — Chronicle Mode (24h per-area Gantt)
- #148 — already-fixed pre-train (v1 file not in webpack entries)

## [5.8.0] — Sickbay (Medical Bay dashboard)

The "Sickbay" release closes every open Medical-tagged issue and ships the Medical Bay
dashboard as a stable feature, consolidating betas 1 and 2 after Geordi + Wesley visual
review against both Withings-only and Oura+Withings live dashboards. Closes #116, #119
(relabel + defer to 6.0), #173, #175, #176, #178, #179, #124. Defers #117 (back-anchor
SVG paths) to 6.0 with `needs-external-artist`.

### Added — Medical Bay
- **New vital kinds** in `MEDICAL_VITAL_CLASSES`: `readiness` (composite headline +
  contributor sub-lozenges), `body_temp_deviation` (symmetric ±°C bands; CRITICAL at
  |Δ|>1.0°C), `hrv_balance`, `sleep_efficiency`, `activity_score`, `vo2_max`,
  `cardiovascular_age`, `stress_resilience` (enum-typed Oura resilience_level).
  `DEFAULT_THRESHOLDS` extended with matching bands.
- **Readiness composite tile** (`_renderReadinessTile`) renders the canonical Oura
  readiness_score 0–100 as a large headline above a 2×2 grid of top sub-score lozenges
  (`discoverReadinessSubscores` → RESTING HR, HRV BAL, BODY TEMP, RECOVERY, etc.).
  Collapses to a single column when there is no canonical value (Withings-only
  dashboards).
- **Rest mode banner** (`_renderRestBanner`) surfaces above the silhouette whenever
  Oura's `binary_sensor.*_rest_mode` is `on`. Butterscotch for routine recovery, tomato
  for illness signal. Transition plays a single audio cue (`navAcknowledge` /
  `navError`) gated through `lcarsAudio.isMuted`.
- **Enum-aware tile** (`_renderEnumTile`) derives status from the enum string itself
  (`low|exceptional` → ALERT, `solid|adequate` → ELEVATED) so resilience_level renders
  as a colored chip rather than a meaningless number.
- **Generalized `data-*` passthrough** on `lcars-anatomical-silhouette`: allowlist
  `{medical, starship, network, tactical}` instead of hardcoded medical/starship
  branches (#178).
- **`--lcars-thermal-bloom` CSS token** for the thermal heat-bloom gradient — no
  hardcoded literals in the silhouette anymore (#179 follow-through).
- **FILE ID label + status-pill legend** in the Medical header (#175, #176): a short
  uppercase `FILE ID` precedes the identifier (butterscotch, 95% opacity, weight 700
  for clean read against the screenshot-obfuscator rect), and the rollup pill carries
  a full-tier-description `title` + visually-hidden `aria-describedby` legend.

### Changed
- `_renderTiles` slice limit raised from 12 → 16 to fit the new Oura tiles.
- `classifyVital` reordered so the new kind branches run *before* the legacy
  `sleep_score` block; `_readiness_score` and `_sleep_efficiency` are no longer
  swallowed as sleep_score variants.
- `formatVital` extended: timestamp values render as `HH:MM` local; enum values are
  uppercased with underscores stripped; `body_temp_deviation` always carries a signed
  `±` and 1 decimal; `sleep_duration` heuristically detects seconds / minutes / hours.
- `VITAL_SUFFIX_PRIORITY.heart_rate` reordered so `_current_heart_rate` /
  `_resting_heart_rate` outrank `_average_sleep_heart_rate` /
  `_lowest_sleep_heart_rate`. Boimler's Oura-only HR no longer canonicalizes the
  sleep-period average as "AVG SLEEP" for current-status display.
- `VITAL_SUFFIX_PRIORITY.hrv` similarly reordered to promote non-sleep HRV variants.
- `VITAL_SUFFIX_PRIORITY.stress_resilience` leads with `_resilience_level` so the Oura
  enum ("Great"/"Strong"/"Solid"/"Low") wins canonical and routes through the enum
  renderer instead of rendering "33 SCORE".
- `sleep_score` removed from the silhouette anchor map (was colliding with
  `body_temp_deviation` at the top-of-head edge).
- Source-label pill suppressed when it echoes the tile label (EFFICIENCY · EFFICIENCY,
  HRV BAL · BALANCE, VO2 MAX · VO2).
- `_reduceVitals` filters duplicate `(label, value)` pairs so HR no longer stacks
  "HR 111 / HR 111" when Withings ships both `_heart_rate` and `_current_heart_rate`
  at the same number.
- `discoverReadinessSubscores` no longer aborts on a single 'unknown' state; sub-lozenge
  contrast raised so sub-scores register against the dark biofunction body.
- Posterior + top-down silhouette placeholders re-tagged from `SCAN MODE PENDING —
  5.4.2` to `SCAN MODE PENDING — 6.0` per Captain's deferral (#119).
- `_buildAnchors` success branch now sets `present: true` explicitly so the rollup
  gate ignores absent slots (#116).

### Performance
- `discoverProfiles` memoized via `WeakMap` keyed on `hass.entities` reference, with
  an inner `hass.states` reference check (#124). The medical card no longer re-walks
  the entire entity registry on every Lovelace render tick.

### Deferred to 6.0 / beyond
- **#117** — back-anchor SVG silhouette paths. Tagged `needs-external-artist`. The
  posterior pane continues to render the placeholder caption.
- Wesley creative roadmap: halo wellness ring; data-source roster footer chip strip;
  time-of-day-aware canonical; THERM bloom on alert anchors with
  `--lcars-thermal-bloom`; SLEEP and HRV composite tiles with sub-lozenges; signed
  body-temp deviation glyph (↗ ↘ =); LAST SYNC clinical timestamp.

[5.8.0]: https://github.com/htiel/LCARS-lovelace-dashboard/releases/tag/5.8.0

## [5.7.2] — Medical Bay multi-source rendering + Oura coverage (5X-F35)

Captain hybrid decision (#227): show every variant of a vital with a source tag rather
than coin-flipping the newest-timestamp winner. One canonical per kind still drives the
silhouette anchor and status rollup; additional sources stack beneath in Zone C tiles.

### Added
- **`VITAL_SUFFIX_PRIORITY` table + `entityPriority(kind, eid)`** in
  `lcars-medical-utils.js` — explicit per-kind precedence for heart_rate, sleep_duration,
  recovery_score, spo2, hrv, sleep_score, steps, active_minutes, workout_distance,
  last_workout. Lowest index wins the canonical slot; all others render as variants.
- **`classifyVital` returns `sourceLabel`** (e.g. `RESTING`, `AVG SLEEP`, `DEEP`,
  `TRAINING`, `READINESS`, `EFFICIENCY`) derived from the matched suffix and rendered on
  variant rows in Zone C.
- **Explicit ignore list** at the top of `classifyVital` for Oura chrome/diagnostic/
  timestamp/enum entities (`_ring_battery_level`, `_breathing_disturbance_index`,
  `_optimal_bedtime_*`, `_target_calories`, `_stress_day_summary`, `_*_today`, etc.).
  Worf MUST-FIX.
- **`tools/check-phi-logging.js` CI guard** — fails the build if `lcars-medical-card.js`,
  `lcars-medical-utils.js`, or `lcars-anatomical-silhouette.js` contains a `console.*`
  call that interpolates a value. Wired into `npm run build`. Worf §16 BLOCKING.

### Changed
- **`_reduceVitals`** in `lcars-medical-card.js` now keeps `variants[]` per kind sorted
  by priority (tiebreak: newest ts), marks `variants[0].isCanonical = true`, and exposes
  back-compat `value`/`eid` aliases so `_buildAnchors` and the Biomedical ECG zone keep
  working unchanged.
- **Zone C tile rendering** displays the canonical value at full size with its source
  label in the unit row, then stacks remaining variants beneath with their own labels.
  Status color from `computeStatus` applies to the canonical only.
- **Oura entity coverage** — classifier now matches `_resting_heart_rate$`,
  `_average_heart_rate$`, `_lowest_sleep_heart_rate$`, `_average_sleep_heart_rate$`,
  `_current_heart_rate$`, `_spo2_average$`, `_total_sleep_duration$`,
  `_deep_sleep_duration$`, `_rem_sleep_duration$`, `_light_sleep_duration$`,
  `_time_in_bed$`, `_average_sleep_hrv$`, `_sleep_recovery_score$`,
  `_daytime_recovery_score$`, `_readiness_score$`, `_sleep_efficiency$`,
  `_sleep_regularity_score$`, `_high_activity_time$`, `_medium_activity_time$`,
  `_low_activity_time$`.

### Fixed (security)
- **Multi-Oura profile-key fallback** in `discoverProfiles` — when `device_id` is absent,
  Oura entity ids carry the person prefix in `oura_ring_<name>_<metric>`. Previous
  fallback collapsed two rings in one household into a single profile and could
  cross-contaminate PHI. New extractor uses the full `oura_ring_<name>` prefix. Worf §4.

### Deferred to 5.8.0
- New vital kinds (readiness composite, body_temp_deviation, activity_score,
  sleep_efficiency tile, vo2_max, cardiovascular_age, hrv_balance, stress_resilience).
- Sleep-stage stacked-bar tile (Geordi recommendation).
- Readiness composite tile with sub-lozenges.
- Rest mode banner.
- Obfuscator regression for enum + timestamp PHI surfaces (Worf Gaps B/E — currently
  blocked by the explicit ignore list).

## [5.7.0] — 2026-05-11 — Visual audit S0/S1 batch + sidebar pill polish

Promotion of beta.3 + beta.4 to stable. No further changes since beta.4.

### Fixed (since 5.6.6)
- **Medical & Starship sidebar subpanel pill** (beta.4): `BIOFUNCTION MONITOR` and `VESSEL STATUS` pills now round their bottom-left corner so they transition cleanly into the gray filler beneath, matching the canonical LCARS pattern used by Engineering/Habitat dashboards.
- All beta.3 fixes below (S0/S1 batch from v5.7.0-beta.2 visual crawl).

## [5.7.0-beta.3] — 2026-05-11 — Visual audit S0/S1 batch (rolled into 5.7.0)

### Fixed (from v5.7.0-beta.2 visual crawl — see `plans/v5.7.0-beta.2-visual-audit.md`)
- **S0-01..S0-04**: Medical & Starship sidebar filler color + admin chrome (Geordi pixel-pass fixes deployed via fresh bundle; source was already correct in beta.2 but HACS cache served stale per-route bundles).
- **S0-05**: Bundle drift mitigated by version bump (cache-bust on every dashboard).
- **S1-01**: Tactical ring gauges bumped 80→96px so `DISARMED` / `VIEWSCREENS` / `TRIGGERED` labels fit the inner mask (`lcars-tactical-card.js`).
- **S1-06**: Idle media tile collapsed from 12rem viewscreen + L/R bars to compact one-line `STANDBY` pill, applied to all areas (widens 4X-63 fix beyond Master Bedroom). `lcars-media-panel-styles.js`.
- **S1-08**: Filter-life segment bar at ≤5% now pulses all 10 segments in critical color and animates the pct text. `lcars-environment-panel.js` + styles.
- **S1-09**: Main Panel circuit grid widened (minmax 11rem→13rem) + `title` attribute on circuit tile for hover-tooltip on long names. `lcars-power-panel-styles.js` + `lcars-power-panel.js`.
- **S1-10**: Illumination labels get `title` attribute on `.ilm-pill__name` and `.ilm-dimmer__name` for hover-tooltip when ellipsis truncates. `lcars-illumination-panel.js`.

### Chores
- Moved PII screenshot crawls (`screenshots/v5.7.0-beta.1/`, `screenshots/v5.7.0-beta.2-crawl/`) to `localinfo/` and added gitignore rule; purged from git history via `git filter-repo` + force-push.
- Pruned GitHub releases tree to one beta (5.7.0-beta.3) + last stable (5.6.6) + last 4.x stable (4.23.0). Older 5.x intermediate releases deleted; tags retained.

### Deferred to next beta (need runtime reproduction)
- **#221 (S1-05)**: Habitat sidebar active-pill desyncs from rendered area.
- **#222 (S2-03)**: Unadopted UniFi devices render `ADOPT` button in user dashboards.
- **#223 (S2-04)**: Camera `ESTABLISHING LINK` placeholder perpetual when offline.
- Already tracked: Cetacean empty-state (#197/#198), Medical/Starship binding (#191..#195, #175/#176), Subspace MAC-named tiles + disconnected empty tiles (#187).

## [5.6.6] — 2026-05-10

### Fixed
- **HOTFIX: Subspace Relay HEALTH panel now detects UniFi infrastructure again.** The `^sensor\.unifi_` prefix anchor introduced with #183 in 5.5.5 produced empty Health panels on every site because modern HA UniFi entity IDs are named after the device (e.g. `sensor.dream_machine_pro_cpu_utilization`, `sensor.u7_pro_xg_uptime`), not `sensor.unifi_*`. `UNIFI_HEALTH_RE` is now suffix-only; the `entity.platform === 'unifi'` gate (which always worked) is the actual integration filter. The `_state` classifier is gated against `_(port|uplink)_` to keep the #183 last-write-wins fix intact.

## [5.6.5] — 2026-05-10

### Fixed (cumulative agent-team review of v5.5.7 → v5.6.4)
- **MUST-FIX (M1): popup Tab focus trap removed.** The trap shipped in 5.6.0 could not pierce the embedded card's shadow root, so `querySelectorAll` only ever found the close button. Result: Tab cycled stuck on the X (when focus was on the close button) or escaped the modal entirely (when focus was inside the embedded card host). Focus restoration on close + initial close-button focus on open continue to satisfy WCAG 2.4.3.
- **SHOULD-FIX (S1): popup Escape no longer eats nested-dialog Escape.** The document-capture handler now checks `e.composedPath().includes(this)` before `stopPropagation()`/`close()`, so an `<ha-more-info-dialog>` opened from inside the popup body receives Escape first. Removed duplicate `@keydown` binding on `.popup-backdrop`.
- **SHOULD-FIX (S2/S3): medical vital-tile `aria-live` reverted to always `off`.** The 5.6.2 unmute → polite flip would queue N polite announcements per render (HR/SpO₂/BP-sys/BP-dia/temp), violating the file-header rule that "AT must not announce silent BP changes". PHI `aria-hidden` gating remains intact; debounced single-region vocalize-on-change is on the AUDIO-SPEC roadmap.
- **SHOULD-FIX (S4): sidebar reorder list semantics.** `.reorder-body` now carries `role="list"` `aria-label="Dashboard order"` so the `role="listitem"` children get list semantics + 1-of-N positional context.
- **SHOULD-FIX (S5): tactical filter announcement.** Visually-hidden `role="status"` `aria-live="polite"` announcer reports the active filter when the sidebar dispatches `lcars-tac-filter`.
- **SHOULD-FIX (S6): camera-static respects `prefers-reduced-motion`.** `cam-static-drift` on the offline-camera overlay is now wrapped in `@media (prefers-reduced-motion: reduce) { animation: none }`.

## [5.6.4] — 2026-05-10

### Code health
- **#185 — Network layout dead state removed.** `lcars-network-layout.js` no longer declares `_deferredHint`/`_deferredHintTimer` fields, the toast render block, or the disconnectedCallback `clearTimeout`. Nothing in the file ever assigned them.

### Security
- **#215 — `_yaml_locks` LRU cap raised 256 → 4096.** Worf option 3: every key passes `_validate_path_component` upstream, so an attacker cannot synthesize 4K distinct legitimate paths inside one executor write window. Refcount-based eviction rejected as over-engineering for the admin-only surface; comment block above `_YAML_LOCKS_MAX` documents the threat model and rejected alternatives.

### Triage closures (already-fixed at audit, no code change needed)
- #136 `_PANEL_ID_RE` is actually used (`__init__.py` L1809 + L1871).
- #137 WS-count log lines both read literal `37`, matching the actual `Select-String` count of `websocket_api.async_register_command(hass, ...)` calls.
- #138 `_yaml_locks` growth — already mitigated by the 5X-B42 256-cap LRU; raised to 4096 in this release as part of #215.
- #139 `MAX_DASHBOARDS` drift — runtime guard already in `const.py` L36-39.

### Deferred
- #134 Lit 1.x → Lit 3 migration (5.7 backlog; multi-card refactor).
- #208 Habitat default-load overview pane (5.7 backlog; new render path).

## [5.6.3] — 2026-05-10 — Habitat pass

### Performance
- **#201 — Camera observer can no longer leak.** `lcars-homepage-card._startCameraRefresh()` now disconnects any prior `IntersectionObserver` before constructing a new one, closing the slot-change re-attach window where two observers could run against the same camera tiles.

### Visual
- **#203 — LCARS flatness on offline-camera overlay.** Dropped the `linear-gradient(180deg, …)` layer; kept the two `repeating-linear-gradient` scan-line patterns over a flat `background-color: rgba(30,30,30,1)`.
- **#204 — LCARS flatness on device-group border.** Dropped `border-image: linear-gradient(...)`; kept the solid `border-left: 3px solid var(--lcars-gold)`.

### Accessibility
- **#205 — Habitat sidebar floor buttons now labeled.** `.sidebar-floor-btn` carries `aria-label` and `title="${floor.name}"` (matches the area-button pattern; recovers labeling on mobile where `.floor-name` text is hidden).

### Code health
- **#206 — Deep-link timer cleanup.** `lcars-dashboard-layout._applyHashDeepLink()` now tracks the deferred `setTimeout` in `this._deepLinkTimer` and clears it in `disconnectedCallback`, so a rapid dashboard switch on first load can no longer dispatch `lcars-area-selected` against a detached element 100ms after teardown.

## [5.6.2] — 2026-05-10

### Accessibility
- **#169 — Medical PHI is now `aria-hidden` while the dashboard is muted.** Per Captain's directive, vocalize behavior follows the existing header mute switch instead of a separate Vocalize-vitals toggle. PHI nodes (`file-id`, ECG wrap, every vital tile-value) carry `?aria-hidden=${this._audioMuted}`. `lcarsAudio.mute()`/`unmute()` now dispatch a `lcars-audio-mute-changed` `CustomEvent` on `window` so cards can react in lockstep without polling localStorage.

### Spec
- **#180 / #181 — Subspace Relay spec aligned to as-shipped button-grid.** §4.6 of `LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md` gains an "As-shipped" note documenting that the Connected Clients section ships as a button-tile grid (not a default-collapsed semantic `<table>` with [All]/[Wired]/[Wi-Fi]/[LAN]/[IoT]/[Guest] filter chips), per Captain's 2026-05-10 decision. WAN latency tri-graph reclassified as future enhancement. Any future move to a semantic `<table>` must preserve the same `data-network` attribute hooks.

## [5.6.1] — 2026-05-10

### Fixed
- **#144 — Tactical card honors sidebar ALL/ACCESS/ZONES filter.** The registered `tactical-card` (v2) now listens for `lcars-tac-filter` events from the sidebar (was only the v1 internal filter). `render()` gates Crew Manifest + Lock Status (access), Cameras (all), Sensor Summary (zones); SystemStatus always renders.

## [5.6.0] — 2026-05-10

### Accessibility
- **#210 — Popup focus restoration on close.** `lcars-popup` captures `document.activeElement` on `open()` and restores focus to it on `close()`, satisfying WCAG 2.4.3.
- **#211 — Sparkline `role="img"`.** `lcars-sparkline` wrap div now has the role its `aria-label` always implied; SR users finally hear the alt text.
- **#212 — Popup Escape works regardless of focus.** Document-level `keydown` listener (capture phase). *Note: the inline Tab focus trap shipped here was found broken in the 5.6.5 review and removed.*
- **#213 — Sidebar reorder is keyboard-operable.** ArrowUp/ArrowDown moves items, plus 44×44 minimum ▲/▼ buttons per item, fully aria-labelled and disabled-at-ends. WCAG 2.5.7 hard fail closed.
- **`--lcars-tomato`** substituted for the previously-undefined `--lcars-red-alert` token on `.popup-close:hover`.

## [5.5.8] — 2026-05-10

### Privacy / UX
- **#219 — Finish in-card deobfuscation across Medical, Anatomical Silhouette, Starship.** Removed all `lcars-*-redactable` CSS-class application sites in `lcars-medical-card.js`, `lcars-anatomical-silhouette.js`, and `lcars-starship-card.js`. The `data-medical` / `data-starship` attribute hooks remain so the out-of-card screenshot redactor (`localinfo/screenshot-obfuscator.js`) keeps working. `vesselIdFor(seed)` now renders the full seed in cleartext (e.g. `VESSEL-LOCAL`, `VESSEL-<UUID>`) — was a 7-char fnv1a hash. `fnv1a()` is retained for `vesselClassFor` and `decorativeNumerics` (creative chrome, not identifier obfuscation).

## [5.5.1] — 2026-05-10

### Accessibility
- **#95 — Donut center text now passes WCAG 1.4.3 against any ring color.** `lcars-ring-gauge.js` now renders a `var(--lcars-card-bg)` masking disc behind the center text and fixes text fill to `var(--lcars-text)` (`#f5f6fa` on `#000` ≈ 19.85:1, AAA). Tomato-on-tomato regression on Tactical LOCKS donut is closed.
- **#98 — Empty-cell placeholders no longer parse as "minus zero".** Seven trailing-unit-after-dash sites fixed across `lcars-homepage-card.js`, `panels/weather/lcars-weather-panel.js`, `panels/climate/lcars-climate-panel.js`, `lcars-lifesupport-card.js`. A null temperature now renders as `—` (bare em-dash), not `—°`.
- **#214 — Mute switch `aria-label` added** on Cetacean, Engineering, and Life Support layouts. The label is dynamic (`'Mute LCARS audio'` ↔ `'Unmute LCARS audio'`) to match the existing pattern in Medical, Network, and Starship. All nine `*-layout.js` files now ship a labeled `role="switch"`. WCAG 4.1.2 satisfied.
- **#216 — New `lcars-toast.js` accessible error toast.** WS rejection codes (`invalid_format`, `payload_too_large`, `invalid_json`, `payload_too_deep`, `invalid_card`, `invalid_card_type`, `invalid_yaml`, `invalid_blueprint`) now surface as LCARS-styled toasts with `role="alert"` + `aria-atomic="true"` on each toast (not the container, to avoid stacked re-announcement). Each toast includes a `Dismiss notification` close button to satisfy WCAG 2.2.1 (Timing Adjustable), pauses auto-dismiss on hover/focus, and auto-dismisses after 8 s. Wired into the nine `lcars-edit-*-card.js` save paths. Message body is rendered via `textContent` only — no XSS surface even on adversarial backend error messages.

### Code health
- **#85 — `require('../package.json')` replaced with ES default-import** across nine `*-layout.js` files. Webpack 5 import-warning chain cleaned.
- **#118 — `tools/check-svg-selfclose.js` lint added.** Pre-build hook (`npm run lint:selfclose`) rejects unquoted-attribute-end + `/>` patterns (the v4.13 regression class — `stroke-opacity=0.9/>` slurping the slash). Build fails on offense. Currently passing 0 offenses on `src/`.

### Security follow-ups (from 5.5.0 review carry-overs)
- **Worf S2 — `_safe_path` belt-and-suspenders in `ws_handle_add_card`.** Schema already validates each path part via `_validate_path_component`; the final filesystem path is now also routed through `_safe_path(lcars_root, ...)`. Defense-in-depth against any future schema regression.
- **Worf S3 — `ws_handle_install_blueprint` refactored.** No longer carries its own inline `_check_depth`; uses the module-level helper. Size cap now counts UTF-8 bytes (was character count — exploitable via multi-byte payloads). Error envelope switched from `connection.send_result({"error": msg})` to `connection.send_error(code, msg)` so client `await callWS(...)` rejects properly with a `{code, message}` object the new toast can map. **Breaking change for any external blueprint-installer caller** that read `result.error` on a resolved promise; such callers must switch to `try/catch` around the awaited `callWS`. No internal callers exist in `js/src/`.
- **Worf S4 — `_safe_json_loads` rejects scalar top-level.** A JSON payload of `"42"`, `"\"foo\""`, or `true`/`false`/`null` now fails with `invalid_json` rather than slipping through and crashing downstream on `.get('type')`. UTF-8 byte length used for the 256 KB cap (closes the multi-byte-bypass that S3 also closed on the YAML path).

### Documentation
- **#217 — Camera migration spec addendum.** [`specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md`](specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md) §5.1 records the three LCARS-visual constraints Geordi requires before 5.5.2 lifts `<ha-camera-stream>` into Tactical: frame containment, `object-fit: cover` preservation, and the LCARS offline overlay sitting over the streaming element.

### Resolved without code change (verified during 5.5.1 audit)
- **#96 — Off-palette green in AQI rings.** Verified all AQI-tier color logic in `lcars-color-utils.js`, `lcars-homepage-card.js`, `lcars-lifesupport-card.js`, `panels/lifesupport/lcars-lifesupport-panel.js`, and `panels/environment/lcars-environment-panel.js` already returns `var(--lcars-ice)` for the 0–50 GOOD tier. The remaining `--lcars-green` references in `panels/illumination/lcars-illumination-panel.js` represent the literal output color of user-controllable RGB bulbs (`_hueToLcarsColor` and the `GREEN` color preset), which is canonical for the device, not LCARS chrome.
- **#100 — DECK sidebar gradient.** Verified `.sidebar-floor-btn` in `lcars-dashboard-layout.js` already uses flat `var(--lcars-lilac)` with `[data-active]` flipping to `var(--lcars-gold)` — no gradient. No `linear-gradient` with magenta/violet/lilac/purple stops exists anywhere in `js/src/`.

### Release engineering
- **Bundle delta vs v5.5.0:** raw 1,106,382 B → 1,108,509 B (+2,127 B); gzip 221,531 B → 222,047 B (+516 B). Well within the +5 KiB gzip per-release ceiling.
- **Build chain status.** `npm audit` clean on both `custom_components/lcars_dashboard/js/` and `mcp/image-generator/` (0 vulnerabilities). Frontend transitive `fast-uri` is at 3.1.2 (≥ patched 3.1.2) and `postcss` is at 8.5.14 (≥ patched 8.5.10); Dependabot alerts auto-close on next scan.
- **Executable validation.** Python compile-clean on all 5 integration files; `npm run build` succeeds with `lint:selfclose` prebuild gate passing 0 offenses.
- **Rollback criterion:** if HA startup logs any new ERROR-level trace from `custom_components.lcars_dashboard.*` that did not appear in v5.5.0, revert via HACS to v5.5.0 and open a follow-up issue with the trace.
- **Reviewed by:** Data (architecture, GO), Worf (security, GO), Geordi (LCARS/a11y, GO conditional → must-fixes applied), Riker (release eng., NO-GO → resolved with CHANGELOG + Geordi must-fixes).
- **Follow-ups tracked for 5.5.2:** Worf S5 (`_safe_json_loads` typed `expected_type` parameter), Worf S6 (promote LCARS palette tokens to `:root` so body-level UI themes correctly), Geordi (normalize three static `'Dashboard sounds'` mute labels to the dynamic pattern). Open issue [#215](https://github.com/htiel/LCARS-lovelace-dashboard/issues/215) (Worf 5.5.0 lock-eviction race) remains scheduled for a 5.5.x follow-up; confirmed not aggravated by 5.5.1.

## [5.5.0] — 2026-05-10

### Security
- **#127 — YAML loader no longer monkey-patches the global `yaml.composer.Composer`.** The tolerant `compose_node` override and the `!include` constructor are now confined to a private `LcarsPythonSafeLoader` subclass of `annotatedyaml.PythonSafeLoader`. Every other HA integration loading YAML was previously affected by our monkey-patch; now only files routed through our loader factory see the override.
- **#128 — Jinja `FileSystemLoader` no longer falls back to filesystem root.** `_get_jinja_env()` raises `HomeAssistantError` when invoked before `init_jinja_env()`. The prior `base = config_dir or _jinja_base_dir or "/"` exposed the entire host filesystem to Jinja template includes if any code path reached the environment pre-initialization.
- **#129 — `ws_handle_add_card` now validates `card_data.type` through `_validate_path_component`.** Path traversal via JSON-supplied `type` (`../`, separators, NULs, hidden-file prefixes) is rejected with `invalid_card_type` before the filesystem path is constructed.
- **#130 / #132 — JSON write handlers now apply the B11 three-layer guard.** `_safe_json_loads` enforces: 256 KB size cap → `json.loads` in `try/except (JSONDecodeError, ValueError, TypeError, RecursionError)` → `_check_depth(max_depth=20)`. Failure paths return WS errors via `connection.send_error(code, message)` instead of the prior `send_result({"error": ...})` envelope. Codes: `invalid_format`, `payload_too_large`, `invalid_json`, `payload_too_deep`, `invalid_card`, `invalid_card_type`. (Note: `ws_handle_install_blueprint` continues to carry its own inline three-layer guard for the YAML write path — same pattern, scoped to YAML rather than JSON.)
- **#131 — `page` WS parameter now schema-validated.** `ws_handle_add_card` and `ws_handle_remove_card` constrain `page` to `vol.In({"areas", "devices"})` rather than accepting arbitrary strings.
- **#138 — `_yaml_locks` bounded.** OrderedDict with LRU eviction at 256 entries to prevent unbounded growth on adversarial path inputs. (Known follow-up: lock-eviction race tracked as [#215](https://github.com/htiel/LCARS-lovelace-dashboard/issues/215) — admin-only, deferred to 5.5.x.)
- **#133 — Build-chain CVE remediation.** Bumped `css-loader ^5.1.3 → ^6.7.2`, `html-webpack-plugin ^5.3.1 → ^5.5.1`, `postcss-loader ^5.2.0 → ^7.0.2`, `style-loader ^2.0.0 → ^3.3.2`. `npm audit fix` ran clean; `npm audit --audit-level=high` and `npm audit signatures` both report zero vulnerabilities.

### Fixed
- **#125 — Notifications module no longer crashes with `NameError: _LOGGER is not defined`.** Service calls (`lcars_dashboard.notification_create` / `dismiss` / `mark_read`) raised `NameError` whenever the error branches were taken because `_LOGGER` was referenced but never assigned. Added `_LOGGER = logging.getLogger(__name__)`.
- **#126 — `process_yaml()` no longer blocks the HA event loop.** The HKI-installation walk (`loader._find_files` + per-file `load_yamll`) was running synchronously inside the async function. Both are now wrapped in `hass.async_add_executor_job`.
- **#115 — Starship Health (and the other built-in dashboards) now register on a fresh install.** `DEFAULT_DASHBOARDS` was hardcoded to `["habitat"]`, so every dashboard except Habitat 404'd until the user re-ran the options flow. `DEFAULT_DASHBOARDS` is now derived from `DASHBOARD_REGISTRY` and includes every entry where `default_enabled` is not explicitly `False`. **Behavior change on fresh install:** admins now see **8** dashboards in the sidebar (Habitat, Tactical, Power Distribution, Life Support, Illumination, Cetacean Ops, Subspace Relay, Starship Health); non-admins see 6 (Subspace Relay and Starship Health are `require_admin=True`). Medical Bay remains opt-in (`default_enabled=False`, PHI-equivalent vitals). Existing installs are unaffected — `config_entry.options[CONF_DASHBOARDS]` is read first and only falls back to `DEFAULT_DASHBOARDS` when that key is absent.
- **#135 — `annotatedyaml.load_yaml` is no longer globally reassigned.** Previously the module assigned `loader.load_yaml = load_yamll`, replacing the library entry point for every consumer in the HA process. Removed; LCARS YAML now flows through `_lcars_loader_factory` only.
- **#136 — Dead `_PANEL_ID_RE` is now wired up.** Used by the sort-order WS handlers as the validation regex against malformed panel IDs.
- **#137 — WS command count log lines corrected.** `_LOGGER.debug("Registering %d websocket commands", 28)` and `_LOGGER.info("LCARS Dashboard ... %d WS commands registered", 35)` now both read `37` to match the actual `async_register_command` count.
- **#139 — `MAX_DASHBOARDS` no longer drifts vs the registry.** Replaced the silent `len(DASHBOARD_REGISTRY)` expression with an explicit `MAX_DASHBOARDS = 9` plus a runtime `if/raise` guard. `assert` was rejected because `python -O` would strip it.

### Changed
- **Three-file version bump:** `const.py`, `manifest.json`, `js/package.json` all read `5.5.0`.

### Release engineering

- **Bundle delta vs v5.4.6 baseline:** raw 1,106,382 B → 1,106,382 B (0 B); gzip 221,524 B → 221,531 B (+7 B). Well within the +5 KiB gzip per-release ceiling.
- **Baselines captured at 5.5.0:** `lcars-dashboard.js` raw 1,080.5 KB, gzip 216.3 KB. HA startup, homepage first-paint, warp-scrubber FPS, and 30-minute Tactical idle memory will be captured against a running HACS deployment of this release and recorded as the baseline for 5.5.1–5.5.9 deltas. (5.5.1+ are required to report deltas; 5.5.0 establishes the baseline.)
- **Executable validation:** HA restart on the Captain's instance, `lcars_dashboard.create_notification` service call exercised, no startup errors. Sidebar shows 8 dashboards for admin (Medical correctly omitted).
- **Rollback criterion:** if HA startup logs any new ERROR-level trace from `custom_components.lcars_dashboard.*` that did not appear in v5.4.6, revert via HACS to v5.4.6 and open a follow-up issue with the trace.
- **#99 camera spec landed** at [`specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md`](specs/LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md) (prereq for 5.5.2). Geordi sign-off conditional on three LCARS-visual addenda tracked as [#217](https://github.com/htiel/LCARS-lovelace-dashboard/issues/217).
- **Reviewed by:** Data (architecture, GO), Worf (security, GO conditional on [#215](https://github.com/htiel/LCARS-lovelace-dashboard/issues/215) follow-up), Geordi (LCARS/a11y, GO with carry-overs to 5.5.1 tracked as [#216](https://github.com/htiel/LCARS-lovelace-dashboard/issues/216) and [#217](https://github.com/htiel/LCARS-lovelace-dashboard/issues/217)), Riker (release engineering).

## [5.4.6] — 2026-05-10

### Fixed
- **Blueprint loading no longer fails with `TypeError: argument of type 'PosixPath' is not a container or iterable`.** Home Assistant's blueprint loader passes `pathlib.PosixPath` instances to our monkey-patched YAML loader; `_is_our_file()` in `process_yaml.py` ran a `str in fname` substring check that raises on `PosixPath`. The bare `except Exception` re-raised it as `HomeAssistantError`, surfacing as "Failed to load blueprint" cards in the UI for every third-party blueprint (sbyx low-battery, gmlupatelli unavailable-entities, zenguru84 esphome-auto-update, homeassistant confirmable_notification, etc.) and noisy ERROR tracebacks in the log. Reported by Boimler.
- **Fix:** coerce `fname` via `os.fspath()` before substring checks so both `str` and `PathLike` inputs work. Non-LCARS blueprints now fall through to the normal YAML load path and load successfully.

## [5.4.5] — 2026-05-05

### Fixed
- **Vessel-diagnostic callouts no longer chop into each other.** With 5.4.4 wiring four additional metric kinds into Starship Health, the populated-anchor count tipped past the silhouette callout renderer's collision threshold — labels collapsed into single edge columns producing readouts like "CPLOTAMP" (CPU TMP + LOAD), "BAGSCKUP" (BACKUP + ADDONS), and a left-edge pile-up of MEM / TX / CORE.
- **Root cause** was structural: the `lcars-anatomical-silhouette` element interpreted each anchor's `label` field as an edge-column selector with no awareness of how many anchors were on the same edge. Every `top`-labelled anchor snapped to canvas-center-x, every `left` to vbX+inset, and the per-anchor y values stacked into thin vertical bands. On the landscape viewBox (480×200) the auxiliary `fontScale = vbH/480` formula compounded the problem at 0.42×, making labels both small and overprinting.

### Changed
- **Edge-stagger rail callout layout (Data architectural review).** The silhouette element now buckets active callouts by edge, sorts each bucket along its run-axis (anchor.x for top/bottom, anchor.y for left/right), and distributes slot positions evenly in the [10%, 90%] band of that edge. n=1 keeps the natural anchor coordinate so sparse maps (Medical at n≤3/edge) render unchanged. Iteration uses `Object.keys(anchorMap).sort()` for cross-engine deterministic ordering.
- **New `bottom` edge** added as the 4th cardinal. Five Starship anchors relabeled — `main_computer`, `sensor_array`, `warp_core`, `starboard_nacelle`, `starboard_impulse` — so the top edge now carries 6 callouts, bottom 5, left and right 1 each.
- **Typography (Geordi):** `fontScale = clamp(min(vbW/480, vbH/240), 0.75, 1.25)` — landscape-safe with a hard floor and ceiling. Label bumped 9 → 12, value 14 → 16, stacked label-above-value in MSD canon.
- **Accessibility:** each callout is now wrapped in `<g role="img" aria-label="LABEL, VALUE, status">` so assistive tech announces the readout as a unit. Decorative leader `<line>` and silhouette path `<g>` carry `aria-hidden="true"`. The outer `<svg>` is `role="group"` to prevent the browser collapsing it to a single image. Resolves WCAG 1.3.1 / 4.1.2 failures introduced by the colliding `<text>` elements.

## [5.4.4] — 2026-05-05

### Added
- **Starship Health now wires up Home Assistant Supervisor + add-on telemetry.** When the Captain enables the supervisor / addon CPU, memory, disk, and version sensors in HA's entity registry, the local-vessel card now lights up four additional anchors and tiles:
  - **Bridge (CPU)** — accepts `sensor.home_assistant_core_cpu_percent` in addition to the existing `sensor.processor_use` family.
  - **Main Computer (MEM)** — accepts `sensor.home_assistant_core_memory_percent`.
  - **Engineering Hull (DISK)** — derives a percent from the `sensor.home_assistant_host_disk_used` / `disk_total` pair when no system_monitor `disk_use_percent_*` is available.
  - **Shuttlebay (ADDONS)** — addon-running classifier widened from the `addon_/hassio_` prefix to any `binary_sensor.*_running` (the SYSTEM_PLATFORMS gate in `discoverVessels` keeps appliance sensors out, so the Worf m6 / Data #2 isolation guarantee is preserved).
- **HA Core / Supervisor version tile** also now sources its string from `sensor.home_assistant_operating_system_version` (plain state) when present, falling back to `update.home_assistant_core_update`'s `installed_version` attribute.
- **New `updates_pending` tile** counts how many `update.*` entities on the vessel are currently `on` (pending). Shows `pending/total`, degrades when > 0.

### Changed
- `localinfo/combined.entities.csv` regenerated for all 70 enabled hassio entities on the reference HA install. Previous disabled-hidden rows replaced with `suggested_panel_tag = starship`.

## [5.4.3] — 2026-05-04

### Fixed
- **Silhouette anchor labels were still invisible after 5.4.2.** The `<line>` self-close in the callout template was emitted as `stroke-opacity="0.9/>"` because the trailing `/` (no separating space) got slurped into the unquoted attribute value when lit-html stamped numeric values. The unterminated `<line>` then absorbed every following sibling — including all `<text>` callouts — causing the labels to render with width=0 (no bbox). Added a leading space before `/>` so the self-close is parsed correctly. Inspecting via shadow-root DOM forensics confirmed `getBBox().width === 0` on every label before the fix and proper bounding boxes after.

### Changed
- **Starship Health silhouette is now landscape (480 × 200).** The ship now points forward to the LEFT with the saucer on the bow and twin nacelles trailing aft on the RIGHT — far better-suited to wide dashboard cards than the previous portrait 200 × 480 layout. Anchor map updated for the new orientation: deflector forward, bridge dorsal-saucer, port nacelle upper, starboard nacelle lower, shuttlebay aft. Hand-authored geometry, still not traced from any production asset.

## [5.4.2] — 2026-05-04

### Fixed
- **Silhouette anchor callouts (HR/BP/SpO2/etc. on Medical and all 13 subsystem readouts on Starship Health) were invisible.** When the silhouette primitive was generalized in 5.4.0, the dynamic `callouts` array was built with the `html` template tag, then interpolated into the parent `<svg>` rendered by another `html` template. lit-html does not propagate SVG namespace through array interpolation — the `<line>` and `<text>` elements were being created in the HTML namespace (uppercase `LINE` tagName) and therefore did not paint. Switched the callout builder to the `svg` template tag from `lit-element`, which correctly stamps the children into the SVG namespace. Affects both `<lcars-anatomical-silhouette>` consumers (Medical Bay anterior + Starship Health summary/engineering).

## [5.4.1] — 2026-05-04

**Mega-release.** Combines the four scheduled milestones (5.2.1, 5.3.1, 5.4.0, 5.4.1) into a single ship after a full team code review (Data, Geordi, Worf). Bundle: 1.05 MiB (budget 1.5 MiB).

### Added — 5.2.1 · Subspace Relay: Connected Clients
- New **CLIENTS** sidebar filter (previously deferred). Surfaces every UniFi `device_tracker` entity in a responsive grid with online/offline indicator, hostname (default-redacted), MAC (default-redacted), and SSID.
- Per-session **REVEAL IDENTIFIERS** toggle reveals plaintext hostnames + MACs + SSIDs. Auto-reverts after 60 seconds (Worf m3); never persisted to localStorage. Toggle plays `navAcknowledge` on reveal, `negativeAcknowledge` on hide (Geordi audio grammar).
- UniFi infrastructure device names (UDM/AP/Switch) and printer names also flow through the same reveal toggle (Worf M1) — no operational identity strings render in cleartext by default.
- `lcars-network-card` now uses a **closed shadow root** for parity with Medical (Worf B2).

### Added — 5.3.1 · Medical Bay: Anatomical + Biomedical scan tabs
- Three focus modes routed via URL hash fragment: `#summary` (default), `#anatomical`, `#biomedical`. Hashchange listener keeps tabs in sync with browser navigation.
- **Anatomical** tab: front silhouette + posterior placeholder pane (back-silhouette path data deferred to v5.4.2 with `SCAN MODE PENDING` overlay).
- **Biomedical** tab: decorative ECG strip whose beat count derives from the present `heart_rate` vital + top-down silhouette placeholder. ECG SVG sits inside `data-medical="phi"` so screenshot redaction can mask both the BPM readout and the polyline geometry.
- Status pill now carries `aria-live="polite"` for parity with Starship (Geordi #5).

### Added — 5.4.0 · Starship Health (Engineering): single-host
- New dashboard `lcars-starship-health` (registry key `starship-health`, icon `mdi:rocket-launch-outline`). Default-enabled but **admin-gated** (Worf B1) — header surfaces HA Core / OS version, addon counts, and process names which are CVE-fingerprintable.
- New `<lcars-starship-card>` Vessel Diagnostic Card (closed shadow root): Zone A header (vessel ID + class string + decorative numerics + thermal toggle [ON by default per spec §5.2] + status pill), Zone B `<lcars-anatomical-silhouette>` with starship paths + 13-anchor map (deflector / bridge / main_computer / saucer_section / sensor_array / engineering_hull / warp_core / port_nacelle / starboard_nacelle / port_impulse / starboard_impulse / shuttlebay / cargo_bay), Zone C 12-tile detail grid.
- New `<lcars-starship-layout>` LCARS frame: gold + butterscotch palette (distinct from Medical's gold + african-violet and Subspace's butterscotch + ice).
- Threshold engine in `lcars-starship-utils.js`: status precedence OFFLINE > CRITICAL > WARNING > DEGRADED > NOMINAL with sensible engineering defaults for cpu_usage / cpu_temp / gpu_temp / nvme_temp / memory / swap / disk_root / io_wait / load_15m_norm / composite_thermal / entity_health / backup_age_days / addon_stopped.
- Vessel IDs are 7-char fnv1a hashes of the config-entry ID (no hostnames/IPs/MACs); vessel class strings cycle generic ship-class names (INTREPID/GALAXY/MIRANDA/NOVA/DEFIANT/OBERTH) + OS+version.
- Hand-authored top-down starship silhouette (~5 KiB inline SVG) with subsystem-named path comments (saucer / neck / engineering hull / nacelles / pylons / impulse engines / shuttlebay / cargo bay). NOT traced from any production asset.
- WAN-down assertive announce: `aria-live="assertive"` fires on UP→DOWN transition only. State diff moved out of `render()` into `updated()` (Geordi #7) — eliminates spurious announcements under double-render or hot-reload.

### Added — 5.4.1 · Starship Health: tactical tab + multi-host
- Three focus modes per vessel: `summary` (default 3-zone) / `engineering` (full diagnostics) / `tactical` (placeholder for v5.4.2 side-profile silhouette). Hashchange routing: `#vessel/{id}/{mode}`.
- Multi-host: every Glances config entry surfaces as an additional vessel in the responsive grid (`grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`). Single-vessel installs (default) render one card; multi-host installs render N cards.

### Changed — Silhouette primitive generalization
- `<lcars-biofunction-silhouette>` retired in favor of `<lcars-anatomical-silhouette>` — fully dashboard-neutral primitive accepting `paths` (lit-html template), `anchorMap`, `anchors`, `viewBox`, `redactClass`, and `redactAttr` as injectable properties. Closed shadow root preserved.
- Medical silhouette path data extracted to `lcars-medical-silhouette-paths.js`; Starship silhouette path data lives in `lcars-starship-utils.js` (consider extracting in v5.5.0 for symmetry).
- Backward-compat: `<lcars-biofunction-silhouette>` registers as a subclass alias so any external consumer keeps working.

### Fixed (team-review pass)
- **Worf B1**: `starship-health` now `require_admin: True` (CVE fingerprinting via HA Core/OS version + addon counts + process names).
- **Worf B2**: `lcars-network-card` now uses closed shadow root.
- **Data #1 / Geordi #1**: silhouette `data-medical`/`data-starship` attributes now render with their actual values (`"phi"` / `"op"`) instead of empty boolean attributes — screenshot redaction selectors targeting `[data-medical="phi"]` now match SVG callouts.
- **Geordi #2**: silhouette callout text gets a black stroke (`paint-order: stroke fill`) so ALERT/CRITICAL values stay legible against any background — addresses #cc6666 4.07:1 contrast failure.
- **Data #4**: `disk_root` regex fixed (`/^sensor\.disk_use_percent_/i`) — DISK anchor now matches all real `system_monitor` mount entities (`disk_use_percent_/`, `_home`, `_media`, etc.).
- **Data #2 / Worf m6**: `addon_running` regex constrained to `binary_sensor.(addon_|.*_addon_running$|hassio_)` — appliance sensors like `binary_sensor.dishwasher_running` no longer inflate the ADDONS counter.
- **Geordi #3+#4**: focus tabs in both Medical and Starship cards drop the broken `role="tab"`/`role="tablist"` pattern (would have required arrow-key handlers + `role="tabpanel"` linkage). Use plain `<button aria-pressed>` toggle group instead.
- **Geordi #6**: thermal toggles + clients reveal toggle now play `navAcknowledge`/`negativeAcknowledge` per AUDIO-SPEC.
- **Geordi #11**: vessel "× CLOSE" button gets explicit `aria-label="Return to vessel grid"`.
- **Geordi #17**: thermal-toggle buttons get explicit `aria-label="Toggle thermal overlay"`.
- **Worf m4**: `wan_reachable` no longer treats `device_tracker` `home` as UP — locked to true binary state values.
- **Data #10**: removed fabricated noise-band sparklines from Engineering tiles. Sparklines requiring recorder-history sourcing land in v5.4.2.
- **Data #7**: dropped unused `SYSTEM_PLATFORMS` import from starship-card; **Worf n2**: dropped unused `MEDICAL_PLATFORMS` import from medical-card.
- **Data #18**: stale `network-layout.js` doc comment ("CLIENTS deferred to 5.2.1") updated to reflect the ship.

### Deferred to v5.4.2
- Posterior + top-down medical silhouette path data
- Starship side-profile silhouette (tactical tab)
- Recorder-history-sourced sparklines for Starship Engineering tiles
- Per-vessel `starship_thresholds.yaml` loader
- Top-CPU process-name allowlist redaction (Worf M2)
- Tab pattern: implement full APG `role="tab"` keyboard model with `role="tabpanel"` linkage if user demand emerges
- Memoize `discoverVessels` / `_discoverClients` against `hass.entities` reference identity (Data #3)

## [5.3.0-beta.2] — 2026-05-04

Bugfix release on top of 5.3.0-beta.1, against Captain's first-light dogfooding screenshot.

### Fixed
- **Silhouette callouts were invisible.** The `text-anchor` for left-side labels was `end` at viewBox `x=4` (text drew leftward off the canvas) and right-side labels were `start` at `x=196` (text drew rightward off the canvas). Swapped: left side now `text-anchor="start"` at `x=4` (extends right, into the canvas) and right side `text-anchor="end"` at `x=196` (extends left, into the canvas). Heart, BP, SpO2, weight, sleep-score, and limb anchors now render their values next to the silhouette as designed.
- **Status pill stuck on OFFLINE despite NOMINAL vitals.** The rollup was including empty anchor slots and any populated slot whose state parsed to NaN (Withings sensors briefly read `unknown` after restart) — `OFFLINE` has the highest precedence so it dominated. Now the rollup considers only anchors flagged `present: true`. Empty anchors render as `—` for layout stability but no longer drag the pill OFFLINE.
- Detail tiles now distinguish "no integration installed" (muted gray `—`) from "integration installed but reading offline" (status-tinted `—`). Previously both rendered identically.

## [5.3.0-beta.1] — 2026-05-04

First release of the **Medical Bay (Sickbay)** dashboard. Per spec §11 phasing, beta.1 lands Phase 0 (privacy primitives + silhouette asset) plus Phase 1 (single-profile Biofunction Card, summary tab only). Multi-profile grid, focus-mode tabs, and workout calendar tile follow in beta.2/beta.3.

### Dashboard registry
- New `medical` dashboard entry (`MAX_DASHBOARDS` → 8) with `require_admin: True` and `default_enabled: False`. Disabled by default — Captain must explicitly add `medical` to `dashboards` in config-flow options to register the panel.

### Worf §16 hardening (Phase 0 BLOCKING — applied)
- **Closed shadow roots** on both `<lcars-medical-card>` and `<lcars-biofunction-silhouette>`. Sibling Lovelace cards cannot reach in via `document.querySelector` (trade: `card_mod` themes cannot pierce PHI surfaces — accepted).
- Every numeric vital cell carries both `data-medical="phi"` and `class="lcars-medical-redactable"`. The existing `localinfo/screenshot-obfuscator.js` REDACTORS table already had the medical hooks wired.
- Closed-shadow-root + redaction class apply to **callouts on the silhouette** *and* **detail tiles in Zone C** *and* **the FILE_ID hash in the Zone A header**.
- `aria-live="off"` on every vital tile — assistive tech must not announce silently changing systolic numbers as someone walks past the room.
- **No localStorage writes other than a per-profile consent boolean.** No values, no thresholds, no history persisted client-side.
- **No outbound network requests** originate from the card. Verified by network-tab during build smoke-test.
- **No `service.set_state`** calls or write-backs to HA — vitals never round-trip through the recorder via this card.
- **No `${value}` substitutions** in any `console.*` call across `lcars-medical-*.js` (CI guard documented; lint rule to land in beta.2).

### Geordi UI / canonical-LCARS layout
- Three-zone Biofunction Card per spec §5: header strip (Zone A) + silhouette with anchored callouts (Zone B) + 4×3 detail tile grid (Zone C).
- Hand-authored gender-neutral silhouette inlined as SVG path data (200×480 viewBox, currentColor stroke, no scripts/foreignObject/external refs). Asset also lives at `js/src/assets/biofunction-silhouette.svg` for reference; the runtime copy is inlined into `lcars-biofunction-silhouette.js` so CSP `default-src 'self'` covers it.
- 13-slot anatomical anchor map per spec §6.5 (head_top, forehead, throat, heart, lungs ×2, arms ×2, abdomen, legs ×2, feet ×2). Empty slots render as `—` with suppressed leader line for layout stability.
- Optional **thermal overlay** (toggle in Zone A header) — radial red gradient anchored to ALERT vitals; echoes BIOMEDICAL SCAN 808.
- Status pill (NOMINAL / ELEVATED / ALERT / OFFLINE) with deterministic color tokens; black text on all status colors for AA contrast.
- Distinct frame palette: **gold** top elbow + **african-violet** sidebar/bottom — keeps Medical visually distinct from Subspace Relay (butterscotch+ice) and Engineering (butterscotch).

### Data correctness — vital classification + threshold engine
- `MEDICAL_PLATFORMS` discovery contract: `withings`, `fitbit`, `dexcom`, `garmin_connect`, `oura`, `google_fit`. Allowlist; non-medical entities are ignored even if their platform is `sensor`.
- `classifyVital()` regex map covers BP (systolic/diastolic pairing), heart rate, SpO2, respiration, weight, body fat, BMI, hydration, sleep score / duration, HRV, body battery, recovery, steps, active minutes, workout distance, last workout, and CGM glucose.
- Multi-platform conflict resolution: when multiple integrations supply the same `vital_kind`, **last-changed wins** (per spec §12 Open Questions resolution).
- AHA-aligned default thresholds: BP (sys ≥130 elevated, ≥140 alert; dia ≥85/≥90), resting HR (50–80 nominal), SpO2 (≥95 nominal, <92 alert), respiration (12–20 nominal), CGM glucose (70–140 nominal, <60 or >180 alert), body-battery / sleep / recovery score bands.
- Status precedence rollup: `OFFLINE` > `ALERT` > `ELEVATED` > `NOMINAL`.

### Per-profile consent gate (spec §7.9)
- First render of a Biofunction Card per `(file_id, browser)` shows a centered consent overlay. All callouts and tiles render as `—` until tap. Tap persists a single boolean to `localStorage` under `lcars_medical_consent.<file_id>` — no values, no precise timestamps.
- Consent string includes the residential-not-HIPAA disclaimer (Worf §16 recommended hardening — applied).

### Phase 1 scope
- **Single-profile** mode: largest entity bucket renders (multi-profile resolver lands in beta.3 with `MEDICAL_PROFILES` three-tier discovery).
- **Summary tab only** — focus-mode `anatomical` and `biomedical` tabs are spec-deferred to beta.3.
- **No workout-calendar tile** in this beta (LAST WORKOUT badge renders from sensor data; calendar event strip lands in beta.3).
- **No `medical_thresholds.yaml` user-overrides loader** in this beta — defaults only. Loader lands in beta.3.

### Audio
- Audio mode `medical`: data-refresh chirps suppressed; only `navAcknowledge` fires on consent grant and thermal-overlay toggle. The biobed-pulse pattern is intentionally NOT shipped (Worf concurrence — risks pattern-matching real medical alert sounds).

### Bundle
- Bundle: 1010 KiB → ~1034 KiB (~+24 KiB delta, well under the +35 KiB defer threshold).

### Files
- New: `custom_components/lcars_dashboard/lovelace/ui-lovelace-medical.yaml`
- New: `custom_components/lcars_dashboard/js/src/lcars-medical-utils.js`
- New: `custom_components/lcars_dashboard/js/src/lcars-medical-card.js`
- New: `custom_components/lcars_dashboard/js/src/lcars-medical-layout.js`
- New: `custom_components/lcars_dashboard/js/src/lcars-biofunction-silhouette.js`
- New: `custom_components/lcars_dashboard/js/src/assets/biofunction-silhouette.svg` (reference copy)
- Updated: `const.py` (registry + version), `manifest.json`, `package.json`, `webpack.config.js`, `lcars-sidebar-reorder.js`

## [5.2.0-beta.2] — 2026-05-04

Code-review fixes from the senior staff review of beta.1 (Data, Geordi, Worf, Riker — all CONDITIONS verdicts cleared).

### Worf hardening (BLOCKING for stable, fixed)
- **Per-dashboard `require_admin` registry flag.** `DASHBOARD_REGISTRY` now supports a per-key `require_admin` bool; `network` defaults to `True` (Subspace Relay surfaces host/client/MAC data, admin-only per spec §15). `_register_single_dashboard` plumbs it through to HA's panel registration. Other dashboards default to `False` (unchanged).
- WAN-tile probe-target label carries `data-network="hostname"` defensively — public DNS (Google/Cloudflare/Microsoft) remains visible in screenshots, private/self-hosted probe targets get scrubbed.
- Article-level `aria-label` no longer leaks hostnames into the AX tree; switched to `aria-labelledby` referencing the inner `data-network="hostname"` span (single redaction target).

### Geordi UI/A11y (BLOCKING for stable, fixed)
- **Ink-bar palette tokens.** Hardcoded CMYK hex (`#222 #00bcd4 #c2185b #fbc02d`) replaced with new `--lcars-ink-{black,cyan,magenta,yellow}` CSS custom properties in `lcars-styles.js` (intentional off-LCARS-palette physical-color affordances, scoped to ink/dye usage only).
- **Glyph contrast.** `.net-ink.crit .net-ink-glyph` swapped from `#fff` (4.08:1, fail) → `#000` on tomato (~5.7:1, pass) per WCAG 1.4.3 AA.
- **Tablist semantics completed.** Tabs now carry `aria-controls="net-content"` + roving `tabindex` (active = 0, inactive = -1). The content area gets `id="net-content"` + `role="tabpanel"` + `tabindex="0"`. Arrow-key navigation tracked for cross-dashboard refactor.
- **`prefers-reduced-motion`** now also gates the sidebar filter-button background transition.
- **Sub-empty + loading states** all carry `role="status"` so screen readers announce them on filter switch.
- Unknown/unavailable state color upgraded from `--lcars-gray` (4.0:1, fail) → `--lcars-sky` (~9:1, pass).

### Geordi audio grammar
- Deferred CLIENTS button now plays `negativeAcknowledge` (per audio spec: denied actions must announce) and surfaces a 4s `role="status" aria-live="polite"` toast hint instead of silently logging to console.

### Data correctness fixes (BLOCKING for stable, fixed)
- **WAN-latency label regex** rewritten to strip the *suffix* not the prefix — tiles now correctly differentiate Google / Cloudflare / Microsoft (or any custom probe name) instead of all rendering "Latency".
- **IPP printer status detection** now correctly reads `entity.translation_key === 'printer'` from the entity-registry entry (was incorrectly probing `state.attributes.translation_key`, which doesn't exist there). Eliminates false matches on unrelated enum sensors.
- **`UNIFI_HEALTH_RE` properly anchored.** Was matching unanchored substrings (`state` would match `*_state_changes`); now requires `_<keyword>$` end-anchors. Excludes future false positives from new UniFi sensor types.
- **Ink dedupe.** Same color sensor appearing twice (e.g. duplicate config entries) now replaces in place rather than appending.
- Removed unused `lcarsLog` / `TAG` imports.

### Backlog hygiene
- `plans/backlog-5x.md` 5X-3.3 "Stellar Cartography" marked **SHIPPED 5.2.0** with delivered/deferred breakdown.

### Known gaps (rolling to 5.2.x)
- Per-port PoE / link-speed grid on switches (5.2.1+).
- Cross-card discovery memoization on `(entities, devices)` registry identity (defect shared by Engineering / Cetacean / Life Support — fix in shared `entity_query.js` once layout extraction lands, 5.3.x prerequisite).
- Promote per-card threshold maps into a single `lcars-thresholds.js` (cross-dashboard consistency).
- `DASHBOARD_URL_MAP` in `lcars-sidebar-reorder.js` duplicates Python `DASHBOARD_REGISTRY`; generate at build time.

## [5.2.0-beta.1] — 2026-05-04

### Subspace Relay — Network Dashboard (NEW, retires backlog 5X-3.3)

First release of the dedicated Network dashboard ("Subspace Relay"), per [`specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md`](specs/LCARS-SUBSPACE-RELAY-DASHBOARD-SPEC.md). Adds a 7th sidebar slot and ships the **Network Health** + **WAN Status** + **Equipment & Peripherals** panels.

**What's in beta.1:**
- New `network` dashboard key (URL `/lcars-network`) registered in `DASHBOARD_REGISTRY`. `MAX_DASHBOARDS` 6 → 7.
- New layout `lcars-network-layout` (butterscotch frame, ice sidebar) with ALL / HEALTH / PERIPHERALS / CLIENTS sidebar tabs (CLIENTS gated as deferred to 5.2.1 per Worf privacy review).
- **Network Health panel** auto-discovers UniFi infrastructure (`platform: unifi`) grouped by device. Per-device tile row: CPU%, MEM%, TEMP, UPTIME, CLIENTS, LINK SPEED. Threshold colors per spec §5 (green ≤ warn, gold = warn, red = crit). UDM-class devices (with temperature sensors) sort first.
- **WAN Status hero strip** auto-discovers `wan_latency` sensors (Google / Cloudflare / Microsoft style) and renders a per-source latency tile with threshold coloring (60 ms warn, 150 ms crit).
- **Equipment & Peripherals panel** auto-discovers IPP printers (`platform: ipp`) and renders per-printer status pill + KCMY ink-level bars with `LOW` / `CRIT` text glyph (color-blind safe).
- All host/MAC/SSID/WAN-IP/model identifiers carry `data-network="*"` attributes; `localinfo/screenshot-obfuscator.js` extended to redact them automatically (Worf hard requirement).
- Audio: `navAcknowledge` on tab change; mute toggle persists across dashboards.
- A11y: `role="tablist"` sidebar, 44 × 44 min hit targets, `:focus-visible` outlines, `aria-label` on every interactive element, `prefers-reduced-motion` respected on ink-bar fills.

**Deferred to 5.2.1:**
- Connected Clients table (device_tracker) — pending Worf privacy gate (default-redact hostnames, opt-in reveal).

**Known limitations:**
- Per-port PoE / link-speed details on switches not yet rendered (rolls into 5.2.x).
- WAN-down state surfaces as red latency tile only; cross-dashboard "Red Alert" cascade lands with Starship Health (5.4.0).

## [5.1.0-beta.38] — 2026-05-03

### Habitat — Icon-Only Sidebar on Mobile (Captain's call, closes #94)

Following visual review of beta.37, the narrowed (~88 px) Habitat sidebar at ≤ 767 px showed area names truncated to 2-3 characters (`DEC…`, `FR…`, `EN…`) — unrecognizable. **Captain's call:** drop the text label entirely on mobile and let the area's `mdi:` icon carry the affordance. More LCARS-canonical (PADD-style pictograms), no extra component, every area still reachable in one tap.

**Changes:**
- `.sidebar-area-btn .area-name` and `.sidebar-floor-btn .floor-name` are hidden at ≤ 767 px.
- Icon size bumped: 18 px → 28 px (areas), 16 px → 24 px (floors). Centered both axes.
- `aria-label` + `title=` retained — screen readers and long-press still expose the area name.
- Active-state gold background unchanged.
- Tablet/desktop (≥ 768 px) behavior identical to beta.37.

### Engineering — Battery PASS-THRU State (Captain's spot, hotfix)

The Engineering battery cards previously had three flow states: ▲ CHARGING / ▼ DISCHARGING / ━ IDLE. A UPS in **online mode** (grid → battery → load with balanced flow) was silently labeled IDLE because the net delta was within the 5 W deadband. Captain noticed two UPS units showing IDLE while clearly passing power; only the truly-off `BigBoy-DPU` reads 0/0.

**Fix:** Added a fourth state — `═ PASS-THRU NNN W` (sunflower) — triggered when both `totalIn > 0` and `totalOut > 0` but neither charging nor discharging. Truly idle units (0/0) still read `━ IDLE` (gray).

| State | Symbol | Color | Condition |
|---|---|---|---|
| CHARGING | ▲ | ice | `in > out + 5` |
| DISCHARGING | ▼ | butterscotch | `out > in + 5` |
| **PASS-THRU** | **═** | **sunflower** | `in > 0 && out > 0` (balanced) |
| IDLE | ━ | gray | both 0 (or one ≤0) |

### Accessibility Fixes (from beta.38 spec audit, rolled into release)

**Camera Panel — Keyboard Activation (closes #103, WCAG 2.1.1 Level A)**
- The per-area `.camera-frame` was previously click-only — keyboard users could not open the camera more-info dialog. Added `role="button"`, `tabindex="0"`, `aria-label`, and an Enter/Space `@keydown` handler. Same pattern as beta.36 PRESENCE / battery / alarm pills.

**Hazard Panel — Alarm `aria-live` Announcement (closes #105, WCAG 4.1.3, safety-critical)**
- Smoke/CO/heat/safety state changes were previously visual-only. Screen-reader users now get an assertive `role="alert"` announcement on the `⚠ N ALERT` badge and a polite `role="status"` for `ALL CLEAR` transitions.

### Documentation

- Added 7 missing specs reverse-engineered from shipped code: Battery, Camera, Galley, Hazard, Viewport (panels) + Habitat, Illumination (dashboards).
- README version badge bumped to beta.38; "Responsive" bullet rewritten to reflect Geordi-canon (sweep preserved + Habitat icon-only).
- `LCARS-UI-ARCHITECTURE.md §10` rewritten — old "horizontal-flip on mobile" approach marked as historical / do-not-implement.
- `LCARS-ENGINEERING-DASHBOARD-SPEC.md`, `LCARS-LIFESUPPORT-DASHBOARD-SPEC.md` "Updated" lines refreshed.
- `LCARS-EV-CHARGER-PANEL-SPEC.md`, `LCARS-PORTABLE-AC-ADDENDUM.md` — clarified v5 carry-over status.

## [5.1.0-beta.37] — 2026-05-03

### Mobile Navigation Consistency — LCARS Sweep Preserved at All Widths (Geordi ruling)

Per Geordi's design ruling on the beta.35 mobile QA, the LCARS swept silhouette must be preserved on small screens (PADD canon). Previous behavior on **Habitat** and **Illumination** was to flip the sidebar to a horizontal pill row at ≤ 767px, breaking the elbow geometry and visually degrading to "generic mobile app chrome."

**Changes:**
- **Habitat** (`lcars-dashboard-layout`): removed mobile horizontal-flip media block. Sidebar now stays vertical, narrowed to one elbow unit (~88 px / 5.5 rem). Area / floor button labels truncate inline with ellipsis.
- **Illumination** (`lcars-illumination-layout`): same fix — ALL DEVICES / LIGHTS / CIRCUITS pills now stack vertically in the narrow sidebar, matching Tactical / Power / Life Support.
- **Shared frame tokens** (`lcars-styles.js`): added a global `@media (max-width: 767px)` block that shrinks `--lcars-sidebar-w`, `--lcars-elbow-w`, `--lcars-elbow-h`, and `--lcars-font-size-title`. All five dashboards inherit consistently.

**Result:** all five dashboards now present an identical LCARS frame on mobile — swept elbow + vertical sweep + footer bar — with the same 88 px sidebar width. Bracer Jack uniformity principle satisfied.

**Deferred:** Habitat has many areas; per Geordi a future release should add a `MORE ▸` overflow popup so only the 4-6 most-used areas live in the sidebar and the rest open via popup. Tracked in backlog.

## [5.1.0-beta.36] — 2026-05-03

### Quad-Agent QA Polish (Geordi / Wesley / Worf / Data review of beta.35)

**Architecture / Maintainability (Data P1)**
- Replaced brittle `.ls-section:last-of-type` selector with explicit `.ls-temp-grid` class on the Life Support **TEMPERATURE & HUMIDITY** table. Future appended `.ls-section`'s no longer silently break the 5-column PRESENCE layout.
- Tightened sidebar 7-column override (`.ls-sidebar .ls-purifier-table:not(.ls-temp-grid)`) so it cannot accidentally style the 5-cell temp grid if it ever lands in the sidebar.
- Tightened the main-content 7-column rule the same way.

**Performance (Data P2-1)**
- Engineering battery card switch labels are now **memoized during enrichment** rather than recomputed on every render. The `friendly_name` regex (USB / Grid Bypass / X-Boost / DC 12V / AC Enabled / Backup Reserve) runs once per state change instead of 12–40 times per `requestUpdate`.
- Switches now sort by computed label rather than entity_id for stable, human-readable order.

**Accessibility (Worf P3-5)**
- Life Support **PRESENCE** cell gained `role="button"`, `tabindex="0"`, an `aria-label` (`"<ROOM> presence: OCCUPIED|VACANT|NO SENSOR"`), and Enter/Space keyboard activation. Now matches the keyboard parity already on the Engineering switch pills.

**Security / Defensive (Worf P3-1, P3-3)**
- Removed three raw `console.debug(...)` calls from `lcars-lifesupport-card.js` (area names, entity IDs, discovery totals leaked to devtools on every render). Now routed through `lcarsLog.debug()` which is gated on `window.__LCARS_DEBUG`.
- Added a 40-character cap on Engineering battery switch pill labels to defend against malicious or excessively long `friendly_name` values overflowing the layout.

### Notes
- The **"BETA.33" footer** flagged on the Power dashboard during QA was traced to browser/HACS cache, not a code bug — every layout (`lcars-dashboard-layout`, `lcars-engineering-layout`, `lcars-tactical-layout`, etc.) reads its version from `package.json` at build time. Hard reload after upgrading.

## [5.1.0-beta.35] — 2026-05-03

### Life Support — Sidebar Per-Room Table Layout Fix
- Fixed cell wrapping in the sidebar **PER-ROOM ENVIRONMENT** table where the 7th column (RH/humidity) wrapped below the room name (e.g. `61%` appearing under `MASTER BEDROOM`).
- Added sidebar-specific 7-column grid template with compact font and `nowrap`/ellipsis cell behavior.

## [5.1.0-beta.34] — 2026-05-03

### Life Support — Per-Room Presence
- **Temperature & Humidity Sensors** table gains a new **PRESENCE** column. Each row now shows `●` (occupied, sunflower) / `○` (vacant, bluey) / `—` (no presence sensor) derived from `binary_sensor` `motion`/`occupancy`/`presence` entities scoped to the area. Click the indicator to open the underlying sensor.
- Discovery: `binary_sensor` motion/occupancy/presence are now collected (previously skipped wholesale). Safety/smoke/CO binaries continue to live on Tactical only.
- Picks up the 5 new HomeKit-paired Ecobee remote sensors (Quinn's Room, Game Room, Master Bedroom, Duncan's Room, Office) plus the main Ecobee zone, with no YAML changes.

### Engineering — Operational Switch Pills on Battery Cards
- Battery source cards now render a row of clickable **switch pills** for the device's operational switches (e.g. EcoFlow UPS Air `USB Enabled`, `Grid Bypass`, `AC Enabled`, `X-Boost`, `DC 12V`, `AC Always On`, `Backup Reserve`).
- Pills exclude `config` and `diagnostic` category switches (no `Beeper` clutter).
- Pill color reflects state (ice = on, gray = off). Click opens HA's native more-info dialog for toggling.

## [5.1.0-beta.30] — 2026-04-30

### Engineering Dashboard — Power Distribution Enhancements

#### 5X-ENG-1: Power Flow Topology
- **Solid EPS conduits**: Replaced dashed animated lines with solid 6px structural bars from source cards to distribution bus, and 4px trunk from bus to load circuits (thick→thin per LCARS design rules)
- **Conduit pulse animation**: Subtle opacity breathing (0.5→0.8) replaces scrolling dash pattern — flat/vector compliant
- **`prefers-reduced-motion` fallback**: All animations disabled (conduit pulse, section scan line, warp core idle/charging) per WCAG 2.3.3

#### 5X-ENG-2: Load Grouping Summary — Already Shipped
- Confirmed by Geordi: category classifier, grouped pill headers, and per-category watt totals already shipped with the v5.1.0 engineering redesign. Marked DONE in backlog.

#### Voltage Overview (New Section)
- **Three-tier voltage display** between Distribution Bus and Load Circuits:
  - HIGH VOLTAGE (>130V) — tomato, lists each anomalous sensor
  - HOME VOLTAGE (110–130V) — auto-averaged from all standard sensors, no HA helper needed. Shows sensor count and min–max range
  - LOW VOLTAGE (<110V) — sunflower, lists each device (doorbells, PoE, etc.)
- Auto-discovers all `device_class: voltage` sensors across all areas

#### Battery Stored Energy
- New `storedKwh` sibling in battery discovery — matches EcoFlow remain/stored/available energy entities
- **STORED** row in System Status sidebar showing total kWh across all batteries for offline capacity awareness

#### Circuit Classification Overhaul
- **Reclassified categories**: HVAC → DEDICATED (broadened to include dryer, washer, fridge, water heater, EV charger, etc.), NETWORK → INFRASTRUCTURE (server room, UPS, rack equipment)
- **5 categories + OTHER**: DEDICATED (butterscotch), OUTLETS (bluey), LIGHTING (sunflower), INFRASTRUCTURE (ice), BATTERY (african-violet), OTHER (gray)
- **HA Labels override**: Same pattern as Tactical camera labels — `dedicated`, `infrastructure`, `lighting`, `outlets`, `battery` labels on entity/device/area override name heuristics. First match wins (entity → device → area)

#### Keyboard Accessibility (WCAG 2.1.1)
- All interactive elements now have `role="button" tabindex="0"` and `@keydown` handlers: grid card, UPS card, battery cards, circuit group rows, bar chart rows, battery DETAIL link, voltage rows

### Documentation
- New [TAGGING.md](TAGGING.md) — consolidated tagging instructions for camera location labels and circuit classification labels, with examples, keyword tables, and tips
- README: HA Labels section updated to reference TAGGING.md; Engineering dashboard description expanded with voltage overview, circuit tagging, stored kWh, and accessibility notes

### Build
- Bundle: 976 KiB (webpack 5.106.1)
- Version files: const.py, manifest.json, package.json bumped to 5.1.0-beta.30

## [5.1.0-beta.16] — 2026-04-27

### Life Support Dashboard Overhaul
Complete redesign of the Environmental/Life Support dashboard, closing the gap with the ChatGPT mockup.

- **3-column layout**: Main content (purifiers + climate) left, AQ detail sidebar right. Responsive — collapses to single column on mobile (<960px)
- **Colorful overview cards**: Each of the 4 summary cards has a distinct border color and ring gauge color:
  - Air Purifiers: ice blue border, green ring when all active
  - Thermostats: butterscotch border, orange ring when heating, blue when cooling
  - Air Quality: sunflower border, green ring when AQI good
  - Environment: violet border, green ring when temp normal
- **Ring gauge upgrade**: 6px stroke width (up from 4px), glow drop-shadow (`filter: drop-shadow`), color-matched track, larger 80px size in overview cards
- **VIEW DETAILS / VIEW ZONES action buttons**: LCARS pill-shaped buttons per overview card that filter the dashboard to Air or Climate sections
- **Per-room atmosphere table**: 7 columns — LOCATION | SCORE | PM2.5 | CO₂ | VOC | TEMP | RH. Groups by area, averages when multiple sensors in same room. Purifier-platform sensors excluded (shown in purifier table instead). Color-coded by EPA thresholds
- **Purifier MODEL column**: Device model from HA device registry displayed in purifier table
- **24h AQ History sidebar**: PM2.5 (peach) + CO₂ (sunflower) sparklines via `recorder/statistics_during_period` API
- **24h Environment History sidebar**: Temperature (butterscotch) + Humidity (ice) sparklines
- **CO₂ sparklines per room**: Below per-room table, one trend line per Awair sensor
- **Combined climate panel**: Thermostat zones and temp/humidity grid rendered in one "CLIMATE MONITORING" section, reducing dead space
- **Thermostat card details**: Shows humidity, HVAC mode, fan mode. Wider layout when single zone
- **Bug fixes**:
  - `volatile_organic_compounds_parts` added to `AIR_CLASSES` — VOC data was silently dropped
  - Score entities (`_score` suffix) now captured in `aqSensors` discovery
  - Temp/Humidity injected from `tempSensors` into per-room AQ grid for rooms with Awair sensors

### Engineering Dashboard Enhancements
- **Mini warp core battery cards**: Replace ring gauge SOC with animated CSS warp core bars (idle pulse, charging flow stripes, static discharge fill). Side-by-side layout: core | SOC% + flow rate + voltage
- **Enriched GRID card**: Voltage, frequency, today's energy (kWh), horizontal power draw bar. Ice blue border distinguishing from battery cards. ONLINE status pill
- **Circuit double-count fix**: Aggregate sensors (`totalusage`, `balance`, `mainload`) excluded from circuits and totalDraw. 240V paired circuits (L1+L2) deduplicated when combined sensor exists
- **24 visible circuits**: Up from 12. Power bars scale relative to highest-draw circuit
- **DETAIL ► deep link**: Battery cards navigate to Habitat dashboard with `#area:<area_id>` hash for room-specific deep linking
- **Enriched battery telemetry**: State of Health (SOH%), Cycles, directional runtime ("FULL IN" / "EMPTY IN")

### Dashboard Animations
- **Scanning section headers**: Light sweep animation across all section divider lines (butterscotch on Engineering, ice on Life Support)
- **Thermostat glow**: Breathing box-shadow on active thermostat cards — warm orange pulse when heating, cool blue pulse when cooling
- **Distribution bus glow**: Pulsing butterscotch shadow on the AC Distribution Bus bar
- **Conduit flow**: Animated dashed pattern on source-to-bus connector lines
- **Circuit/filter bar shimmer**: Light sweep across power bars and filter life bars
- **AQ hero pulse**: Ambient glow on the main AQI ring gauge
- **Ring gauge glow**: SVG `drop-shadow` filter on all ring gauge arcs
- **Table row highlights**: Left-edge ice blue inset shadow on hover

### Habitat Dashboard
- **Hash-based area deep linking**: URL `#area:<area_id>` auto-selects the corresponding area on page load. Sidebar area clicks update the hash via `history.replaceState`. Supports browser back/forward and bookmarks. `hashchange` event listener for dynamic navigation

### MCP Image Generator
- New `mcp/image-generator/` service using Azure OpenAI `gpt-image-1` (eastus2)
- Three tools: `generate_image`, `list_mockups`, `delete_mockup`
- Wesley agent has explicit MCP tool bindings for design prototyping
- VS Code MCP config: `.vscode/mcp.json` with Azure credentials
- 7 mockups generated: power sources warp core, 6 life support sections

### Build
- Bundle: 951 KiB (webpack 5.106.1)
- Version files: const.py, manifest.json, package.json bumped in sync

## [5.0.2-beta.1] — 2026-04-24

### Agent Review Hardening
Follow-up fixes from Worf (security), Data (code quality), and Geordi (accessibility) agent reviews of v5.0.1-beta.8.

- **B11 hardening**: `yaml.safe_load()` wrapped in `try/except RecursionError` — catches pathological nesting at parse stage before depth check runs
- **B10 hardening**: `!include` path enforcement now fails closed when YAML environment is uninitialized (`_jinja_base_dir is None`)
- **B04 extension**: Camera proxy caches cleared in `_onFloorSelected` — same race condition as area transitions
- **B05 hardening**: Life Support summary label opacity 0.70 → 0.75 (additional WCAG contrast headroom on bluey background)
- **B20 hardening**: Atmoscrubber scale label opacity 0.6 → 0.7 (improved readability)

## [5.0.1-beta.8] — 2026-04-24

### Epic 0: QA Bug Fixes (17 bugs)

Full QA review by all five specialist agents (Geordi, Wesley, Data, Worf, Riker) identified 23 bugs. This release fixes all 12 CRITICAL and 5 HIGH severity items.

#### Security
- **B09**: Static asset path restricted to `js/dist/` only — `src/`, `vendor/`, `package.json`, `webpack.config.js` no longer served via HTTP
- **B10**: `!include` YAML path boundary enforcement via `os.path.realpath()` — blocks directory traversal and symlink escape
- **B01**: `_apply_sidebar_order()` removed — eliminated private `async_user_store` API that crossed user-isolation boundaries. Sidebar order WS handler now validates against `DASHBOARD_REGISTRY` allowlist
- **B11**: Blueprint YAML depth capped at 20 levels with 256 KB size limit — prevents resource exhaustion via deeply nested structures

#### Functional
- **B03**: Update domain entities unsuppressed — now render with humanized LCARS text instead of being hidden
- **B04**: Camera proxy race condition fixed — `_visibleCameras` and `_loadingCameras` cleared on area transition to prevent stale HTTP 500s
- **B15**: Camera-derived binary sensors (motion/tamper from Blink, UniFi Protect) filtered from Life Support panel
- **B08**: Unadopted camera CTA improved — shows device name and platform: "CONFIGURE {name} IN {platform}"

#### Accessibility
- **B05**: Summary bar contrast fixed — black text on butterscotch/bluey backgrounds (WCAG AA: ~5–10:1 ratios). Removed inline colored styles
- **B13**: Sidebar area buttons now have `title` and `aria-label` attributes for screen reader and tooltip access
- **B02**: Update entity states humanized — `off` → "UP TO DATE", `on` → "UPDATE AVAILABLE", `installing` → "INSTALLING"
- **B14**: Media transport controls and volume hidden when player is idle/standby/off (DOM removal, not CSS hide)
- **B07**: Battery 0% stale data guard — shows "NO DATA" when `last_changed` exceeds 7 days and no recent updates

#### Panel Polish
- **B18**: EV charger offline empty state — gray "OFFLINE" badge when status entity is unavailable/unknown
- **B06**: Model-number suffixes stripped from device names via regex in `_shortenName()`
- **B19**: Tactical summary bar gains "VIEWSCREENS X/Y ACTIVE" camera badge; red-alert trigger extended to include `pending` alarm state
- **B20**: AQI and PM2.5 scale labels added below atmoscrubber score numbers; Life Support sparklines enlarged from 120×24 to 160×32px

#### Build
- Webpack output relocated to `js/dist/` — source files no longer in static serving path
- Bundle: 866 KiB (webpack 5.106.1)

## [4.23.0] — 2026-04-22

### New — Synthesized Audio System
Spatial audio feedback across all 14 panel types using Web Audio API (OscillatorNode → GainNode).
- **15 sound definitions** — acknowledge, navAcknowledge, negativeAcknowledge, alert, criticalAlert, ready, lightToggle, switchToggle, fanToggle, lockToggle, coverAction, climateAdjust, scriptFire, entityInfo, mediaAction
- **All panels wired** — Illumination (toggle/effect/color/brightness), EV Charger (solar mode/current/lock), Alarm (PIN digit/arm/disarm/state transitions), Irrigation (zone/toggle/pause/resume/stop/quick run), Media (transport/volume), Battery (sort), Camera (disclosure)
- **Ready sound** — Plays once on first area selection after load
- **Unavailable entity feedback** — `negativeAcknowledge` sound when toggling unavailable entities
- **Mute toggle** — Header endcap button with `aria-label="Dashboard sounds"`, persisted to localStorage
- **GainNode cleanup** — `osc.onended` disconnects GainNode to prevent AudioContext leaks

### New — EV Charger Panel (4X-55, 4X-58)
Full EV charger panel for Wallbox Vilya V2G bidirectional chargers.
- **SVG energy flow visualization** — Animated chevron cascade for charging/V2G, directional flip, idle dashes
- **15-row sensor telemetry** — Status, session, energy balance, vehicle, charger metrics
- **Solar mode strip** — Radio group with `select.select_option`
- **Max current adjuster** — ±stepper with `number.set_value`, clamped to entity min/max
- **Cable lock toggle** — `lock.lock`/`lock.unlock` with `role="switch"`
- **Wallbox lock excluded from tactical** — `LOCK_EXCLUSION_PLATFORMS`

### New — Panel Placement Override (4X-8)
Persistent panel reorder per area via edit-mode gear pip.
- **Backend**: `panel_order/get` and `panel_order/set` WebSocket commands with YAML persistence and validation
- **Frontend**: `lcars-edit-panel-order-card.js` editor popup with numbered list, move up/down/save/reset

### Enhanced — Climate Panel: Portable AC Support (4X-56)
- Swing mode strip, auxiliary switch toggles (eco/turbo/swing) with per-switch colors, timer stepper
- **Integrations**: midea_ac_lan (Midea portable AC)

### Enhanced — Alarm Panel: Zone Sibling Pips (4X-7)
- Battery and illuminance sensors on zone devices render inline as pips (BAT/LUX) with `role="img"` + `aria-label`
- Sibling entities consumed by area filter predicate to prevent orphan button rendering

### Enhanced — Environment Panel: Filter Life Recovery (4X-54)
- BlueAir filter_life sensors render as 10-segment bars with critical pulse animation
- `prefers-reduced-motion` disables pulse

### Fixed — Display & Formatting
- **4X-47**: Battery telemetry → `formatNumber()` with domain-appropriate rounding
- **4X-48**: Life Support header badge → `formatNumber()` + unavailable placeholder
- **4X-49**: Environment sparkline labels → `canonicalLabel()` (PM₂.₅, CO₂, VOC)

### Fixed — Offline State Normalization
- **4X-50**: All `unavailable`/`unknown` entities resolve to `var(--lcars-disabled)`
- **4X-52**: Life Support badge shows gray "—" when temperature sensor is offline

### Fixed — Classification & Detection
- **4X-51**: Insteon platform switches correctly classified as lighting entities
- **4X-57**: HomeKit air purifiers (fan + AQ sensor on same device) detected for Life Support

### Fixed — Media Standby Compaction (4X-53)
- Idle/standby media players hide transport controls, waveform, and secondary metadata
- Volume bar dimmed; panel opacity reduced to 0.7

### Fixed — HACS Library Icon (4X-5)
- Removed deprecated `icon` URL from `hacs.json`

### Fixed — Accessibility (QA Regression)
- **GEO-001**: `:focus-visible` outlines (2px solid ice) on illumination light bars, circuits, scene buttons
- **GEO-002/009**: Hardcoded hex colors → CSS custom properties in illumination panel
- **GEO-003**: `role="listitem"` moved to correct wrapper element
- **GEO-004**: Removed `aria-live="polite"` from `<main>`
- **GEO-005**: Stable `aria-label="Dashboard sounds"` on mute button
- **GEO-006**: Skip-nav link for keyboard accessibility
- **GEO-007**: Scene hover uses `filter: brightness(1.2)` instead of opacity
- **GEO-008**: Removed duplicate `.lcars-sidebar-areas::after` CSS rule
- **GEO-010**: Scene `:first-child` pill targets listitem wrapper
- **GEO-011**: `preventDefault` on elbow pointerdown
- **GEO-013**: Merged configure/mute button CSS
- **GEO-014**: Effect button focus ring uses ice instead of sunflower
- **GEO-015**: Reactive `_siteName` from `hass.config.location_name`

### Fixed — Camera (QA Regression)
- **WES-010**: Skip `unknown` state cameras in refresh
- **WES-012**: 500ms delay on "ESTABLISHING LINK" overlay to prevent flash

### Fixed — Python Backend (QA Regression)
- **DATA-005**: Module-level `_PANEL_ID_RE` regex, removed redundant inline `import re`
- **DATA-008**: Fixed KeyError in `edit_homepage_header` (safe `.get()` access)
- **DATA-009**: Fixed `areaId`/`device` truthy checks (`is not None` instead of falsy)
- **DATA-010**: YAML locks (`_get_yaml_lock`) on all read-modify-write WebSocket handlers
- **DATA-011**: Fixed all `succesfully` → `successfully` spelling errors
- **DATA-016**: Corrected WebSocket command count (28 → 35)
- **DATA-017**: Global state (`lcars_dashboard_more_pages`, `llgen_config`) reset on reload
- **DATA-018**: Removed deprecated `bind_hass` from notifications.py

### Fixed — Footer & Version Display (QA Regression)
- **WES-016**: Footer shows `LCARS ${version}` from package.json instead of hardcoded `LCARS 47`

### Code Review Fixes
- **DATA-1**: `panel_overrides` in error fallback response
- **DATA-2**: `customElements.get()` guard on EV charger registration
- **DATA-6/WORF-3**: EV charger uses `_callService()` from base panel
- **DATA-13**: `this.hass` null guard on climate panel handlers
- **DATA-16**: `||` → `??` for EV charger min/max/step
- **GEORDI-1**: `prefers-reduced-motion` for EV charger chevron animation
- **GEORDI-2**: Zone sibling pip color → `var(--lcars-sky)` (WCAG AA)
- **GEORDI-5**: Panel order editor uses `role="list"`/`role="listitem"` semantics
- **GEORDI-6**: Edit-mode gear pip 20→24px (WCAG 2.5.8)
- **WORF-1/2**: Panel order array capped at 50, strings validated against regex

## [4.22.0-rc.11] — 2026-04-19

### Fixed — 4X-46: Life Support Sensor/Purifier Split + Hotfix

Resolves issue #44: Life Support panel clipping by un-nesting passive AQ monitors from the atmoscrubber substation path.

#### Architecture Change
- **Sensor/purifier split** — Life Support now distinguishes active air purifiers (VeSync, Blueair — devices with `fan` entity) from passive AQ monitors (Awair — sensor-only devices). Previously both were treated identically as atmoscrubber panels.
- **4-group partitioning** — `_partitionEntities()` rewritten from 3 groups (climate/environment/ambient) to 4 groups (climate/scrubber/sensor-array/ambient). Environment entities are split by device-level fan presence.
- **New predicates** — Added `isAirPurifierEntity()` and `isAQSensorEntity()` to `lcars-entity-utils.js` for Life Support's internal classification boundary.

#### Rendering Changes
- **Sensor Array layout** — Passive AQ monitors (Awair) render as a compact inline metric grid with color-coded CO₂/VOC/PM2.5 values and Awair Score badge. No cylinder animation, no fan controls.
- **5 layout configs** — Life Support now supports: `full` (climate+scrubber+sensor-array+ambient), `atmos-only` (active purifier), `climate-only` (thermostat+sensors), `sensor-array-only` (passive AQ monitor), `sensors-only` (ambient temp/humidity hero).
- **Clipping resolved** — Passive AQ monitors no longer nest inside the environment panel substation, eliminating the triple-nested width overflow.

#### Spec Updates
- **Atmoscrubber spec §8** — Sensor-only adaptation marked as deprecated. Atmoscrubber panel is now exclusively for active air purifiers. Passive AQ monitors handled by Life Support sensor array.

## [4.22.0-rc.9] — 2026-04-19

### Fixed — Code Review: Critical, High & Medium Bug Fixes

Full Data subagent code review identified 23 issues across all Python and JS files. This RC addresses the most impactful findings.

#### Critical
- **C1: Blocking I/O in process_yaml.py** — Rewrote `process_yaml()` and `reload_configuration()` to use async executor for all file system operations. Added `_read_yaml_safe()`/`_write_yaml_safe()` helpers replacing raw `open()` calls.
- **C2: Unguarded json.loads in WS handlers** — Added `_safe_json_loads()` helper wrapping all 12 `json.loads()` call sites across `__init__.py` WS handlers. Invalid JSON now returns error response instead of crashing.

#### High
- **H1: Notification WS type mismatch** — Fixed `_loadNotifications()` WS type from `lcars_dashboard/notification/get` to `lcars_dashboard_notification/get`.
- **H2: Reload crash on empty YAML** — `_read_yaml_safe()` now returns None for empty/missing files; callers check before processing.
- **H3: File handle leak** — All raw `open()` calls replaced with `_read_yaml_safe()`/`_write_yaml_safe()` context-managed helpers.
- **H4: YAML write race condition** — Added per-file `asyncio.Lock` infrastructure (`_get_yaml_lock()`) protecting concurrent read-modify-write on entity YAML.
- **H5: Climate debouncer leak** — Added `disconnectedCallback()` to `LcarsClimatePanel` that cancels the setpoint debouncer timer on disconnect.

#### Medium
- **M1: Variable shadowing** — Fixed `page_config` variable shadowing in `process_yaml()` (renamed to `page_data`).
- **M2: Entities list validation** — Added `isinstance(list)` check for entities boolean value WS handler.
- **M4: Dead alarm timer cleanup** — Removed orphaned `_alarmLockoutTimer` cleanup from homepage card `disconnectedCallback`.
- **M5: Unbounded notifications** — Added FIFO eviction (max 100) in notification create service to prevent memory growth.

## [4.22.0-rc.8] — 2026-04-19

### Fixed — Consolidated P6b–P9: Formatting, Offline Degradation, Media Compaction, A11y, Security (17 items)

**17 bugs implemented** across 6 stories, covering shared formatting utilities, offline panel degradation, media player compaction, accessibility polish, and security hardening. 13 items deferred to v5.x, 4 closed as HA-config-only, 3 monitored, 1 closed.

#### Shared Formatting Foundation (RC8-1)
1. **Data-size scaling (QA-E10):** Raw byte values (B) now auto-scale to KB/MB/GB/TB with appropriate decimal precision.
2. **ISO timestamp humanization (QA-E11):** Raw ISO 8601 timestamps render as "JUST NOW", "5M AGO", "2H AGO", "3D AGO", or short date (e.g., "APR 15").
3. **Possessive name stripping (QA-E09):** Area and device names with possessives (e.g., "mariner's Office") are now stripped correctly during entity name shortening.

#### Weather Offline Degradation (RC8-2)
4. **Gray offline skeleton (GEORDI-021):** Weather panel shows grayed-out frame, "OFFLINE" badge, and skeleton viewscreen when weather entity is unavailable/unknown.
5. **Last-known data label (WESLEY-UX-012):** Offline weather banner displays humanized "LAST DATA X AGO" timestamp from entity's last_changed.

#### Irrigation Offline Semantics (RC8-3)
6. **Offline vs idle distinction (GEORDI-022):** Irrigation zones now show "OFFLINE" (gray) when unavailable, distinct from "IDLE" (sunflower). Controller offline banner with "LAST SEEN" timestamp.
7. **Disabled offline controls (WESLEY-UX-007):** Zone start/stop buttons, quick-run, and control buttons are suppressed when controller is offline, preventing failing service calls.

#### Media Compaction and Volume Warning (RC8-4)
8. **Collapse unavailable players (WESLEY-UX-002):** All-unavailable media players show minimal "UNAVAILABLE" skeleton instead of broken controls.
9. **Collapse standby siblings (GEORDI-017, WESLEY-UX-004):** When active players exist, unavailable players are filtered from the rendered list. Standby players remain visible.
10. **100% volume warning (GEORDI-027):** Volume bar and percentage turn tomato-red when volume reaches 100%.

#### A11y and Truncation Polish (RC8-5)
11. **Sensor indicator contrast (GEORDI-030):** Indicator dots increased from 0.5rem to 0.625rem with subtle white ring (box-shadow) for improved visibility on dark backgrounds.
12. **Label truncation floor (QA-E08):** Sensor labels now have 3rem minimum width to prevent premature truncation on narrow panels.

#### Security Hardening (RC8-6)
13. **innerHTML → textContent (WORF-SEC-001):** Card picker button in vendor/editor.js now uses textContent instead of innerHTML.
14. **more_pages path validation (WORF-SEC-006):** Subdirectory names in more_pages are validated against `[a-zA-Z0-9_-]` regex in both process_yaml.py and __init__.py.
15. **Blueprint size limit (WORF-SEC-007):** Blueprint YAML payloads are rejected if they exceed 256 KB. Blueprint name must be a non-empty string.
16. **Template filename validation (WORF-SEC-008):** more_pages subdirectory enumeration in websocket_get_configuration now validates names via _validate_path_component.

### Deferred to v5.x (13 items)
- WESLEY-IDEA-003 (consolidated media hub), WESLEY-IDEA-007 (waveform personality), GEORDI-016 (sparse room shell), WESLEY-IDEA-001 (room vitals strip), WESLEY-IDEA-004 (empty-state copy), WESLEY-IDEA-008 (idle-room timestamp), WESLEY-IDEA-009 (View Transitions), WESLEY-IDEA-013 (boot sequence), WESLEY-IDEA-014 (adaptive climate arc), WESLEY-IDEA-015 (mobile haptics), WESLEY-IDEA-016 (trend arrows), WESLEY-IDEA-017 (universal LAST ACTIVE), WORF-SEC-002 (npm audit churn)

### Closed / No-Code (4 items)
- DATA-013, DATA-015, GEORDI-025, GEORDI-026 — HA configuration issues, not dashboard code

### Monitoring (3 items)
- GEORDI-029 (focus visibility), GEORDI-031 (reduced-motion), WORF-SEC-004 (color sanitization) — validated as acceptable, no code needed

## [4.22.0-rc.6] — 2026-04-19

### Fixed — Site Crawl Bug Fixes: Tactical, Camera, Viewport (P6)

**3 bugs fixed** from full 19-room site crawl of ha.mariner.example.

#### Tactical Panel
1. **Camera motion bleed (CRAWL-001):** Camera-device motion/occupancy sensors no longer appear in the Tactical MOTION section. Filter applied at area classification, entity consumption, and tactical partition levels. Standalone motion sensors (e.g., Aqara) still route correctly to Tactical.

#### Camera Panel
2. **Sensor hero tier expansion (CRAWL-002):** All non-diagnostic binary_sensors on camera devices now render inline as hero-tier data instead of collapsing behind "X MORE" disclosure. Detection events (person, vehicle, animal, glass break, etc.) are all visible by default. Diagnostic/config entities remain collapsed.

#### Viewport Panel
3. **Duplicate cover rendering (CRAWL-003):** Cover entities consumed by the Viewport Controls panel are now excluded from standalone device-group rendering. Added `isViewportEntity` predicate to area consumption filter.

## [4.22.0-rc.5] — 2026-04-19

### Fixed — Tactical, Alarm, Garage Door, High-Impact Action Safety (P5)

**8 bugs fixed** spanning alarm state color, keypad sizing, garage door UX, tactical dedup, inline confirmation, and lockout feedback.

#### Alarm Panel
1. **Disarmed ice semantics (GEORDI-018):** Tactical panel `frameColor` now delegates to canonical `getAlarmStateColor()` — disarmed alarm correctly shows ice regardless of unlocked doors.
2. **Keypad spacing (GEORDI-019):** Alarm keypad buttons enlarged to 4rem height with `minmax(3.5rem, 4.5rem)` columns and 0.5rem/0.75rem gap (desktop/mobile). Exceeds WCAG 2.5.8 44px minimum tap target. Code dots enlarged to 14px.
3. **Lockout feedback (WORF-SEC-003):** Rate-limited PIN attempts now show "LOCKED OUT" alert (announced once) + silent countdown timer. Keypad buttons disabled during lockout. Timer cleanup in `disconnectedCallback`.

#### Garage Door & Covers
4. **Contextual state labels (WESLEY-UX-009):** Garage doors in tactical access section show contextual labels — OPEN/TAP TO CLOSE, CLOSED/TAP TO OPEN, OPENING…, CLOSING…. Transitional states disable interaction.
5. **Position indicator (WESLEY-IDEA-006):** Covers with `current_position` show an 8px vertical fill bar with percentage label. Bottom-up fill, 500ms CSS transition.
6. **Confirm flow for risky actions (WESLEY-UX-013):** Lock unlock, garage open, and garage close now require inline confirmation strip (5s timeout, auto-cancel). `role="alert"`, keyboard accessible (Enter/Space confirms, Escape cancels), reduced-motion safe.

#### Tactical Dedup & Room Badge
7. **Deduplicate tactical across rooms (WESLEY-UX-011):** Per-render-cycle tracking of rendered alarm device IDs prevents duplicate tactical panels across rooms sharing the same alarm.
8. **Room-header alarm badge (WESLEY-IDEA-010):** Secondary rooms show inline `◆ STATE` badge in room header (alarm-state-colored, link semantics, Enter-only activation). Tap navigates to the alarm's primary area.

### Bundle
- 721 KiB (+12 KiB / +1.7% from rc.4)

## [4.22.0-rc.4] — 2026-04-19

### Fixed — Power Naming, Circuit Correctness, Progressive Disclosure (P4)

**10 bugs fixed** spanning power circuit naming, 240V pair detection, pool disambiguation, and progressive power panel rendering.

#### Circuit Name Humanization
1. **Emporia Vue raw names (DATA-009, GEORDI-009):** New 6-stage `_humanizePowerName()` pipeline strips manufacturer prefixes (Vue, Emporia, Pentair, ScreenLogic), hex/serial codes, orphan separators, converts snake_case to title case. `VUEG3_MAINLOAD1` → `MAIN LOAD 1`.
2. **`-- Dryer` artifacts (DATA-010):** Fixed 240V pair detection baseName cleanup — leading/trailing separators stripped. Entity-level dedup ensures circuits claimed by 240V combined entries don't also appear standalone.
3. **Duplicate laundry circuits (GEORDI-008):** Two-pass entity dedup in `_detect240VPairs()` — 240V combined entries take priority, standalone entries with already-claimed entities are dropped.
4. **Pentair hex names (GEORDI-028):** Pipeline strips MAC addresses, serial numbers, and `Pentair:` prefix. Empty result falls back to `POOL CONTROLLER` for Pentair/ScreenLogic devices.
5. **Identical pool circuits (GEORDI-007):** Post-humanization `_deduplicateCircuitNames()` extracts smart keywords from entity_id (PUMP, HEATER, etc.) before falling back to numeric suffixes.

#### Progressive Power Panel
6. **0W standby collapse (WESLEY-UX-008):** Rooms with power monitoring at 0W draw now show compact `○ ALL CIRCUITS STANDBY — N MONITORED` instead of full empty panel. Uses `--lcars-sunflower` label + `--lcars-gray` detail per WCAG contrast requirements.
7. **Low-activity mode (WESLEY-IDEA-005):** Rooms ≤100W show summary card + top 3 active circuits with "ACTIVE CIRCUITS" header. No arc, no section dividers. Threshold configurable via `power_thresholds.lowActivity`.
8. **Hidden wattage pill (WESLEY-UX-006):** Truncated circuit grid pill now reads `EXPAND GRID — N MORE (X W)` with butterscotch alert dot when any hidden circuit exceeds 500W.

#### Visual Enhancements
9. **Wattage color tiers (WESLEY-IDEA-012):** Circuit tiles now carry tier classes (standby/low/moderate/high/critical) matching existing `getPowerColor()` palette. Standby tiles dim indicator dot only (not text) per Geordi WCAG review.
10. **Collection cache (Data refinement):** `_buildPowerCollection()` now caches by reference equality, preventing 3× rebuild per render cycle (frameColor + renderBadge + render).

## [4.22.0-rc.3] — 2026-04-19

### Fixed — Entity Routing, Diagnostics Disclosure, Camera UX (P3)

**18 bugs fixed** spanning entity classification, sensor tiering, camera offline UX, and diagnostics management.

#### Entity Classification & Routing
1. **Standalone smoke detectors (QA-E03):** Split hazard threshold — strong classes (smoke, CO, gas, heat) trigger HAZARD at ≥1 entity; generic `safety` keeps ≥2 threshold to avoid TP-Link/Kasa false positives.
2. **FP2 presence sensors (QA-E04):** New `PRESENCE_PLATFORMS` detector routes Aqara FP2/FP1E devices to Tactical panel (occupancy/motion). Illuminance entities stay hidden in operational tier.
3. **Ceiling fans (QA-E01):** Fan lights already route to Illumination; fan speed entities now suppressed from fallback rendering when Illumination panel is active. No generic "fan" device cards.
4. **"OTHER ENTITIES" → "AUXILIARY SYSTEMS" (QA-E02):** `SUPPRESS_DOMAINS` filters update, device_tracker, event, conversation, input_datetime, input_text. Remaining unclassified entities render under "AUXILIARY SYSTEMS" section-divider in gray. Empty sections produce no output.

#### Diagnostics Disclosure (WESLEY-IDEA-011)
5. **Three-tier entity partitioning:** New `tierEntities()` free function in entity-utils. Partitions sensors into hero (always visible), operational (collapsed), and diagnostic (collapsed). Per-panel hero filters determine relevance.
6. **Camera sensor cleanup (DATA-007, GEORDI-013, GEORDI-024):** Camera panels now tier sensors — motion, occupancy, sound, connectivity, battery, recording stay hero; everything else collapses behind a `▸ N MORE` disclosure button with proper `aria-expanded`, keyboard handling, and 24px touch target.
7. **Nest Protect diagnostics (QA-E06):** Life Support panel now explicitly filters `entity_category: diagnostic` entities before partitioning. Buzzer test, speaker test, PIR test, etc. no longer flood the panel.
8. **Sparkline deduplication (QA-E05):** Life Support sparkline tray deduplicates by `device_class`, keeping the entity with the most recent `last_updated`. "PM₂.₅, PM₂.₅, AQI, AQI" duplicates eliminated.

#### Camera Offline UX
9. **Gray offline border (GEORDI-015):** Offline camera frames use `--lcars-gray` border instead of tomato red. Offline is dormant, not an alert.
10. **CRT static effect (WESLEY-IDEA-002):** Offline camera viewscreens display CSS scanlines + noise strips with GPU-composited drift animation. `prefers-reduced-motion: reduce` freezes to static scanlines.
11. **"VIEWSCREEN OFFLINE" breathing text:** Slow opacity pulse (0.6–1.0 at 4s). Plus "LAST SIGNAL: Xh Ym AGO" timestamp from `last_changed`. Suppressed for signals < 5 minutes old (likely rebooting).
12. **"CONFIGURE IN [INTEGRATION]" CTA (DATA-014, WESLEY-UX-001, WESLEY-UX-005):** When all device entities are unavailable, gold button navigates to HA device configuration page. 3-entry platform humanization map (UniFi Protect, Blink, Nest). Fallback: "DEVICE REQUIRES SETUP".

#### Environment Panel
13. **Atmoscrubber offline state (GEORDI-006):** When all AQ sensors unavailable, cylinder renders as gray outline with "OFFLINE" label and gray distress pulse. `role="meter"` → `role="img"` when offline. `prefers-reduced-motion` freezes pulse. Non-AQ devices (Nest Protect) never render a cylinder.
14. **Atmoscrubber guard verified (DATA-006):** `showAtmoscrubber` boolean already gates cylinder rendering correctly — confirmed, no code change needed.

#### Device Card Formatting
15. **Generic sensor formatting (QA-E07):** Homepage `_renderSensors()` now routes through `formatStateValue()` for device-class-aware rounding. Raw unformatted decimals eliminated from fallback device cards.

**New exports from `lcars-entity-utils.js`:** `SUPPRESS_DOMAINS`, `tierEntities()`.

**Bundle impact:** 693→703 KiB (+10 KiB) — disclosure CSS, static effect, tier logic, platform detection.

## [4.22.0-rc.2] — 2026-04-18

### Fixed — Shared Formatting, Labels, and State Semantics (P2)

**New module: `lcars-format-utils.js`** — Centralized sensor value formatting, state text, and canonical labels. 9 bugs fixed.

1. **Device-class-aware rounding (DATA-008, DATA-018, GEORDI-001):** All sensor values now format through `formatNumber()` with per-device-class decimal rules: temperature→1dp, humidity→0dp, power→0dp, CO₂→0dp, VOC→0dp, etc. Raw decimals like `2.1594203157...` no longer appear in sensor rows, sparkline trays, or ambient readings.

2. **Domain-aware state semantics (DATA-012, WESLEY-UX-003, GEORDI-014):** `formatStateValue()` returns context-appropriate text for unknown/unavailable states:
   - Button/scene/script `unknown` → **READY** (gray, not red)
   - Sensor `unknown` → **NO DATA** (gray)
   - Sensor `unavailable` → **OFFLINE** (gray)
   - Diagnostic/config → **—** (em dash, gray)
   - Only genuinely offline operational entities (lights, covers, locks) remain alert red

3. **Canonical short labels (GEORDI-032, GEORDI-003, WESLEY-UX-010):** `canonicalLabel()` maps device classes to LCARS-appropriate abbreviations: PM₂.₅, CO₂, VOC, AQI, RH, TEMP, PRESS, BATT, RSSI. Sparkline tray labels like "VOLATILE ORGANIC COMPOUNDS" (truncated) now display as "VOC". Pool chemistry suffix matching: ORP, pH, SALT, ALK, CYA, FREE CL.

4. **Accessibility:** `ariaLabel()` strips Unicode subscripts for screen-reader-safe announcements. Sparkline slots upgraded from `aria-hidden` to descriptive `aria-label`.

**Integration:** All sensor rendering sites in environment panel, lifesupport panel (sparklines, ambient, hero), and homepage card (camera, environment, battery, pool chemistry) routed through centralized formatters. Slider display values use `formatNumber()` for consistent rounding.

**Bundle impact:** +3 KiB (690→693 KiB) — consistent with architectural estimate.

### Phase 6 Team Review

| Reviewer | Verdict |
|----------|---------|
| Geordi La Forge (Design) | APPROVED WITH CONDITIONS — 2 non-blocking (sparkline SVG a11y pre-existing, current 2dp) |
| Data (Architecture) | APPROVED — M1/M2/M3 verified resolved, 3 advisory (dead import fixed, sensor hero fixed, ariaLabel micro-opt) |
| Worf (Security) | APPROVED — 0 findings, pipeline confirmed XSS-safe |
| Wesley Crusher (Creative) | APPROVED WITH CONDITIONS — sentinel guard added, unconverted panels tracked for P3+ |

---

## [4.22.0-rc.1] — 2026-04-18

### Fixed — Classification Core (P1)

**Entity Classification Overhaul** — 16 bugs fixed across entity routing, panel assignment, and classifier logic. Two root causes addressed:

1. **Illumination switch catch-all removed (DATA-001, GEORDI-004, GEORDI-005):** The illumination panel no longer absorbs every unclaimed `switch` entity into "Circuits." Only switches matching `isLightingEntity()` appear. Fixes irrigation zones (Rachio), EcoFlow config switches, appliance controls, and cross-domain switches leaking into lighting panels across ~15 rooms in both homes.

2. **Diagnostic entity_category filtering (DATA-002, DATA-011, GEORDI-002, GEORDI-012):** Hazard detector now ignores `entity_category: diagnostic/config` binary sensors. TP-Link Kasa devices (HS200, KP200) with diagnostic CO Status sensors no longer misclassify ceiling fans, outlets, and switches as hazard/life-support devices. Fixes ~7 rooms in Boimler's home.

**Additional classification fixes:**
- GE Home refrigerator climate entities excluded from area-level Life Support (DATA-004, GEORDI-010) — fridges route to Galley panel instead of rendering HVAC arcs at 5°F
- ScreenLogic pool/spa climate entities excluded from Life Support (DATA-005) — pool temp routes to Pool/Spa panel
- EcoFlow `ecoflow_cloud` platform added to `PLATFORM_PANEL_MAP` → battery routing (DATA-020) — EcoFlow config switches no longer pollute illumination
- `isEnvironmentEntity()` fan matching restricted to AQ platforms only (DATA-017, DATA-021) — ceiling fans (Bond, Kasa, Insteon) no longer trigger Life Support/environment panels
- `isLightingEntity()` negative keyword hardening (DATA-016) — defense-in-depth exclusion of irrigation, battery, HVAC, and appliance terms
- Empty atmoscrubber cylinder hidden when device has no AQ data (GEORDI-002) — no more green outlines on non-air-quality devices
- `VIEWPORT_COVER_CLASSES` lifted to module-level constant for consistency
- Optional chaining added to environment panel entity_id access

### Phase 6 Team Review

| Reviewer | Verdict |
|----------|---------|
| Geordi La Forge (Design) | APPROVED — 0 blocking, 2 non-blocking |
| Data (Architecture) | APPROVED — 0 blocking, 0 non-blocking |
| Worf (Security) | APPROVED — 0 blocking, 2 recommendations |
| Wesley Crusher (UX) | APPROVED WITH CONDITIONS — 2 conditions fixed |

### Files Modified
- `lcars-entity-utils.js` — PLATFORM_PANEL_MAP, hazard detector, isClimateEntity, isEnvironmentEntity, isLightingEntity, classifyArea
- `lcars-illumination-panel.js` — _partitionLightingEntities circuit collection
- `lcars-environment-panel.js` — atmoscrubber visibility guard

## [4.21.0] — 2026-04-17

### Added — 4 New Panel Types

**Tactical Panel (4X-42):** Composite security panel — alarm control, lock toggles, perimeter sensors, motion indicators. Subsumes alarm panel.

**Viewport Controls (4X-41):** Blinds/shades/covers with open/close/stop controls and position display.

**Hazard Detection (4X-39):** Smoke/CO/heat detector status grid (Nest Protect) with battery overview.

**Galley Systems (4X-40):** Smart appliance cards (GE Home, LG SmartThinQ) with cook status, timers.

### Added — Entity Routing

**Media Consolidation (4X-43):** Area-level media panel with primary/secondary speaker layout. Camera doorbell media_players excluded.

**Platform-to-Panel Routing (4X-44):** 20+ integration platforms mapped. Diagnostic entity filter.

**Weather Detection (4X-36):** Platform + sensor class detection.

**Pool/Spa Detection (4X-37):** Platform-based detection for screenlogic, iaqualink, waterguru, pentair.

### Added — CSS Polish

**Responsive Breakpoints (4X-29):** 9 panels, single-column below 30rem. Power panel px→rem.

**Gradient Cleanup (4X-30):** 4 decorative gradients removed.

### Fixed

- **Life Support Clipping (4X-46):** flex-basis auto, :host display:block, overflow fixes.
- **Device Ownership (#45):** claimedDeviceIds guard in illumination circuits.
- **Media Entity Bleeding (#46):** Device-affinity scoping + camera doorbell exclusion.

## [4.19.1] — 2026-04-17

### Added — Entity Routing Improvements

**Media Consolidation (4X-43):**
- Media panel now operates at the area level — all `media_player` entities in a room render in a single panel.
- Primary player selection: playing > paused > most features (Apple TV over HomePod).
- Secondary speakers render as compact rows with play/pause + volume controls.

**Platform-to-Panel Routing (4X-44):**
- `PLATFORM_PANEL_MAP` — 20+ known HA integration platforms mapped to correct panel types.
- Platform-based fallback detector in DETECTORS array catches devices missed by domain/device_class.
- `isDiagnosticEntity()` filter — entities with `entity_category: diagnostic/config` excluded from all room panels.
- Mappings: unifiprotect/blink→camera, screenlogic/waterguru→aquatics, weatherflow/weatherlink→weather, rachio/flume→irrigation, nest_protect→hazard, ge_home/smartthinq→galley, ha_blueair/vesync→environment, emporia_vue→power.

**Weather Station Detection (4X-36):**
- `WEATHER_PLATFORMS` set: weatherflow, weatherlink, met, openweathermap, accuweather, ecobee, environment_canada, nws, pirateweather.
- `WEATHER_SENSOR_CLASSES` device_class matching: wind_speed, wind_direction, precipitation, pressure, irradiance.
- ≥2 weather sensor classes on a device triggers weather panel.

**Pool/Spa Detection (4X-37):**
- `POOL_SPA_PLATFORMS` set: screenlogic, iaqualink, poolmath, waterguru, pentair.
- Platform check runs before entity_id/preset heuristics for reliable detection.

### Also includes from earlier pre-releases

**Responsive Breakpoints (4X-29):**
- 9 panels gain single-column fallback below 30rem (~480px).
- Battery & environment cylinders rotate horizontal on narrow screens.
- Power panel breakpoints normalized from px to rem.

**Gradient Cleanup (4X-30):**
- 4 decorative gradients removed (forecast fill, waveform peak, weather glow, pool caustic shimmer).
- 10 functional gradients kept and documented.

**Life Support Clipping Fix (4X-46):**
- `.panel-content { flex: 1 1 auto }` — content-based sizing.
- `:host { display: block }` in LcarsBasePanel for all panels.
- `.env-content` overflow + min-width fixes.

## [4.20.0-rc.1] — 2026-04-17

### Added — Responsive Breakpoints (4X-29)

- **9 panels gain mobile-first responsive layout**: Alarm, battery, camera, climate, environment, irrigation, media, weather, pool/spa panels all collapse to single-column layout below 30rem (~480px).
- **Battery & environment cylinders rotate horizontal** on narrow screens — 4rem tall horizontal bar instead of vertical cylinder.
- **Power panel breakpoints normalized** from px to rem units (64rem/48rem/30rem) per Data's architectural review.

### Fixed — Gradient Cleanup (4X-30)

- **4 decorative gradients removed** per Bracer Jack Rule 1:
  - Forecast range fill → flat `var(--lcars-butterscotch)`
  - Waveform peak bar → flat `var(--lcars-tomato)`
  - Weather glow radial → replaced with `border-color` shift
  - Pool caustic shimmer → removed entirely (thermal tint backgrounds sufficient)
- **10 functional gradients documented and kept**: scroll fades, particle animations, scan sweeps, charge flow stripes.

### Review Summary
- Geordi: Designed all 9 breakpoint specs + classified 14 gradients
- Data: APPROVE (condition met: power panel px→rem)
- Worf: Auto-approve (pure CSS)

## [4.19.1-rc.3] — 2026-04-17

### Fixed — Environment panel horizontal clipping (4X-46 continued)

- **Horizontal overflow on nested environment panel**: `.env-content` grid and `.env-controls` now have `overflow: hidden` and `min-width: 0` to prevent the atmoscrubber cylinder from overflowing the right side of the panel frame when nested inside Life Support.

## [4.19.1-rc.2] — 2026-04-17

### Fixed — Life Support Panel Clipping (4X-46) — continued

- **Root cause #2 found**: `<lcars-lifesupport-panel>` had no `:host { display: block; }` — defaulted to `display: inline`, breaking height propagation through the Shadow DOM boundary. Every other panel had this rule.
- **Fix**: Added `:host { display: block; }` to `LcarsBasePanel.static get styles()` — all panels now inherit it. No panel can miss it going forward.

## [4.19.1-rc.1] — 2026-04-17

### Fixed — Life Support Panel Clipping (4X-46)

**UI (Geordi):**
- **Root cause identified**: `flex: 1` on `.panel-content` expands to `flex-basis: 0%`, collapsing height to zero across nested Shadow DOM boundaries (Life Support → environment substation).
- **Fix 1**: `.panel-content { flex: 1 1 auto }` — content-based initial sizing instead of zero-basis. Affects all 12 panels via shared `lcars-panel-frame` but zero visual change for standalone panels.
- **Fix 2**: `.env-content { grid-template-rows: auto auto }` — explicit content sizing for environment panel grid, removing fragile `1fr` track dependency.

### Review Summary
- Geordi: APPROVE (diagnosed root cause, verified fix)
- Data: APPROVE (confirmed zero regression for standalone panels)
- Worf: APPROVE (pure CSS, no security surface)

## [4.19.0] — 2026-04-17

### Fixed — File I/O Hardening (4X-28)

**Architecture (Data):**
- **All 44 raw `open()` calls migrated** to `_read_yaml_file` / `_write_yaml_file` helpers — entire I/O lifecycle (open→read/write→close) now executes inside executor threads, eliminating event loop blocking.
- **~25 blocking `os.path.exists()` calls removed** — replaced by helper's internal missing-file handling.
- **~12 blocking `os.makedirs()` calls removed** — consolidated into `_write_yaml_file`'s internal `makedirs(exist_ok=True)`.
- **4 blocking `os.path.isdir()` calls wrapped** in `async_add_executor_job` in card directory loaders.
- **5 blocking `os.remove()` calls wrapped** in executor lambdas for delete handlers.
- **Redundant `yaml.safe_load(json.dumps(...))` round-trips removed** from 6 card write handlers — data from `json.loads()` is already YAML-safe.
- **Net reduction: ~200 lines** of boilerplate file I/O code.

**Security (Worf):**
- **`ws_handle_sort_entity` sortType validated** — changed from `vol.Required("sortType"): str` to `vol.In(ALLOWED_SORT_TYPES)`, preventing arbitrary YAML key injection. Consistent with existing `ws_handle_sort_area_button` validation.

### Review Summary
- Data: APPROVE (3 review rounds — caught async def closure bug and missing isdir fix)
- Worf: APPROVE (all 5 security conditions met)

## [4.18.9] — 2026-04-17

### Fixed — Bug Fixes (4X-27, 4X-31, 4X-32, 4X-34)

**Architecture (Data):**
- **`async_unload_entry` cleanup (4X-27)** — `hass.data.pop(DOMAIN, None)` now cleans up stale data (4 OrderedDicts) on config entry unload. Returns actual `unload_ok` result instead of hardcoded `True`. Follows HA convention.

**UI (Geordi):**
- **Sidebar icon updated (4X-34)** — Default sidebar icon changed from legacy `mdi:alpha-d-box` (Dwains Dashboard holdover) to `mdi:star-four-points`. Consistent with config flow default.
- **Life Support panel clipping fixed (4X-31)** — Added `overflow: visible` to panel frame content area, life support substations grid, and substation cells. Prevents clipping of nested climate + environment panels and LCARS corner bracket pseudo-elements.
- **Switches now appear in Illumination Circuits (4X-32)** — All `switch` domain entities in a room (excluding `device_class: outlet`) now appear in the Illumination panel's Circuits section. Previously only switches matching lighting keywords were included, missing smart plugs powering lamps.

### Review Summary
- Data: APPROVE (4/4, one condition applied — outlet exclusion added)
- Worf: APPROVE (4/4, no security concerns)
- Geordi: APPROVE (4/4, brackets rendering correctly, accessible toggle-pills)

## [4.18.8] — 2026-04-17

### Fixed — Production Hardening (Team Review Pass)

**Security (Worf):**
- **Path traversal in `ws_handle_sort_more_page`** — `sortData` items validated via `_validate_path_component()`.
- **Missing auth on notification endpoint** — `websocket_get_notifications` now requires `@websocket_api.require_admin`.
- **YAML key injection blocked** — 4 bool-value handlers restricted to `ALLOWED_BOOL_KEYS` allowlist, `sortType` restricted to `ALLOWED_SORT_TYPES`.
- **innerHTML XSS in power popover** — `_showCircuitPopover()` rewritten with `lit-html render()`. `_escapeHtml()` removed.

**Python Backend (Data):**
- **17 relative-path `open()` calls fixed** — all use `hass.config.path()`.
- **File handle leak fixed** — redundant re-read in `ws_handle_edit_area_button` deleted.
- **Global mutable state eliminated** — `areas`, `entities`, `devices`, `homepage_header` moved to `hass.data[DOMAIN]`.
- **`async_forward_entry_setups` awaited** — was fire-and-forget.
- **`async_unload_entry` added** — proper unload/reload support.
- **`sensor.py` uses `SensorEntity`** — replaced deprecated `Entity`.
- **`package.json` version synced** — was stuck at 4.17.2.

**UI & Accessibility (Geordi La Forge):**
- **11× `font-size: 0.55rem`** replaced with `var(--lcars-font-size-label, 0.75rem)`.
- **`<lcars-setpoint>` circles → endcap pills** — LCARS-compliant ± buttons.
- **~24 CSS hex fallback values corrected** — lilac, african-violet, gray, ice, sunflower, space-white.
- **`:focus-visible` on `.battery-total-line`** — keyboard focus visibility.
- **Camera panel `aria-label`** — control buttons now accessible.
- **Environment panel clipping** — sensor values no longer overflow into atmoscrubber cylinder.

### Added — Illumination Panel: Color & Effects (4X-11 Enhancement)

- **Full-width layout** — illumination panel spans both columns as primary room control via `--panel-max-width` CSS custom property.
- **Multi-column responsive grid** — light bars and circuits use `repeat(auto-fill, minmax(min(20rem, 100%), 1fr))` for 2-3 per row.
- **Effect strip** — 2-column LCARS pill grid showing all device effects (Nanoleaf, Govee). Active effect highlighted gold.
- **Color presets** — 6 LCARS palette pills (Warm, Cool, Red, Green, Blue, Purple) for HS/RGB lights.
- **Bar value: effect name** — active effect name shown instead of brightness % when an effect is running.
- **RGB-aware bar fill** — `_hueToLcarsColor()` maps HS hue to nearest LCARS palette color.
- **Toggle-only lights** — `onoff` mode lights show ON/OFF without expandable slider/controls.
- **Live state reactivity** — all renders read from `this.hass.states` for immediate feedback.
- **Stale room bug fixed** — partition cache removed; entities recomputed every render.
- **Effect/color button `:focus-visible`** — WCAG 2.4.7 keyboard focus outlines.
- **Circuit row `aria-label`** — state announced to screen readers.

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
