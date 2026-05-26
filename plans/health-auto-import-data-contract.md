# Health Auto Import — Data Contract Handoff

**To**: Maintainer / author of the Home Assistant `health_auto_import` integration (the plug-in that ingests Apple Health JSON exports from Health Auto Export iOS app)
**From**: LCARS Lovelace Dashboard project — Sickbay (Medical Bay) maintainers
**Purpose**: Request a small set of additions to the plug-in's exposed entity attributes so the LCARS Sickbay BIOMEDICAL tab can render clinically-meaningful visualizations (ECG waveform, sleep hypnogram, workout route, accurate HR zones).
**Backing spec**: [specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md](../specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md)
**Backing plan**: [plans/5.14-sickbay-tab-redesign.md](5.14-sickbay-tab-redesign.md) Stories 5 + 6
**Stardate**: 2026.05.25

---

## 0. What this is, what this isn't

**This is** a polite ask. The plug-in already exposes 60+ Apple Health metrics and works well as-is. The Sickbay redesign degrades gracefully when the requests below are not implemented — every visualization falls back to a single LCARS pill. The four asks here unlock **better** visualizations, not required ones.

**This is not** a feature gate. Ship none of these and Sickbay still works. Ship all four and Sickbay reaches reference-app fidelity.

**This is not** a complaint about the current shape of the data. The current per-metric `_latest` / `_today` sensors are well-named and easy to consume. The asks below add **attributes** to those sensors (or new sensors) without disturbing existing entity IDs or state values.

---

## 1. Quick-reference summary (revised v2 — 2026.05.25 crew review)

| # | Ask | Effort | Unlocks |
|---|---|---|---|
| 2.1 | ECG voltage samples as attribute on `sensor.health_auto_import_heart_ecg_*` (**current reading only** — history list ask withdrawn per Worf S0-3, see N6) | S | `<lcars-ecg-strip>` waveform render (currently classification + avg BPM + duration only) |
| 2.2 | Sleep-stage segments array as attribute on `sensor.health_auto_import_health_metrics_sleep_analysis_latest` | S | `<lcars-hypnogram>` per-segment Awake/REM/Core/Deep timeline |
| 2.3 | Workout HR time series as attribute on `sensor.health_auto_import_workouts_workout_last_*` | M | `<lcars-hr-zones>` accurate per-zone duration calculation |
| 2.4 | Workout GPS as **Google-encoded polyline string** (not raw `{lat,lon}[]` array — see N7 for why raw arrays are rejected) | M | `<lcars-workout-route>` route visualization |
| 2.5 | **NEW** — `lcars_schema_version: "1"` attribute on every modified entity (schema-probe) | XS | Future-safe contract evolution; degraded-mode fallback when schema mismatched |

All five asks are **attribute additions** to entities that already exist. No new entity IDs required.

**v2 changes since v1** (the v1 of this doc had 4 asks; v2 has 5):
- Added §2.5 schema-probe (per Data CR-9).
- §2.1 ECG history list **withdrawn** (per Worf S0-3) — contradicted the `recorder.exclude` privacy recommendation. Future revisit via opt-in.
- §2.4 raw `route[]` array **withdrawn** (per Worf S0-2) — open-DOM-readable; encoded form now required, not alternative.

---

## 2. Detailed asks

### 2.1 ECG voltage samples (current reading only, per v2 — history list withdrawn)

**Current state**: the plug-in exposes:

- `sensor.health_auto_import_heart_ecg_classification` → string (`"Sinus Rhythm"`, `"Atrial Fibrillation"`, etc.)
- `sensor.health_auto_import_heart_ecg_average_bpm` → number
- `sensor.health_auto_import_heart_ecg_duration` → seconds
- `sensor.health_auto_import_heart_ecg_sampling_frequency` → Hz
- `sensor.health_auto_import_heart_ecg_last_taken` → ISO timestamp
- `sensor.health_auto_import_heart_ecg_voltage_measurements` → **today this entity exists but its state appears to be a single number (count? mean?). The microvolt samples themselves are not exposed.**

**Ask**: expose the full microvolt sample array on `sensor.health_auto_import_heart_ecg_voltage_measurements` (or a sibling entity if attribute size on a state sensor is undesirable) as a structured attribute. Recommended attribute shape:

```yaml
sensor.health_auto_import_heart_ecg_voltage_measurements:
  state: <last-taken ISO timestamp, or sample count>  # whatever makes sense
  attributes:
    classification: "Sinus Rhythm"           # mirror of classification sensor, for atomicity
    average_bpm: 78
    duration_s: 30
    sampling_frequency_hz: 512
    voltage_uv: [12, -5, 8, 14, ...]         # microvolt samples (CURRENT reading only)
    voltage_unit: "uV"                       # explicit for renderer
    recorded_at: "2026-05-23T08:17:00Z"
    source: "Apple Watch Series 10"          # optional but recommended (shown in LCARS footer, allowlist-sanitized)
    lcars_schema_version: "1"                # per §2.5
```

**What the LCARS Sickbay does with this data**: the `<lcars-ecg-strip>` component (full spec at [specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md](../specs/LCARS-SICKBAY-TAB-REDESIGN-SPEC.md) §4.1) treats `voltage_uv` exactly the way Apple Health's ECG measurement screen does — renders the array as an SVG polyline waveform over a faint LCARS grid, classification banner above, avg-BPM / duration / device / timestamp + HR-notifications footer below. Conceptually an ECG-grade sparkline: voltage → y-coordinate, sample index → x-coordinate, auto-scaled so peak-to-peak fills the card height. The renderer applies LTTB downsampling on the client side, so any sample density you ship (250 Hz, 512 Hz, raw) renders cleanly at 1200 visible points. The waveform is gated by a per-profile `consent.ecg` toggle (default OFF); when consent is not granted the banner + footer still render with classification + BPM but the waveform is suppressed.

**History list withdrawn** (Worf S0-3): the v1 of this doc asked the plug-in to retain voltage arrays in recorder so the LCARS renderer could build an Apple-Health-style history list of past readings. **That ask is withdrawn**. It contradicted the `recorder.exclude` privacy recommendation below — you can't lazy-fetch waveforms from a store the plug-in told users to disable. The LCARS renderer now shows **current reading only**; a future captain-ratified opt-in (with retention cap) may revisit. See N6 below.

Apple Health's ECG JSON in Health Auto Export already includes `"voltageMeasurements"` as an array under each ECG sample. The ask is to surface the **most-recent** array onto the entity's attributes verbatim, not to retain a history.

**Size note**: a 30-second 512 Hz ECG is ~15,400 samples — at 2 bytes each that's ~30 KB. HA's recorder default attribute size limit is 16 KB. Two options:
1. **Preferred**: expose the full array but mark the entity `entity_category=diagnostic` and set `recorder.exclude.entity_globs: ["sensor.*_ecg_voltage_measurements"]` in the plug-in's `manifest.json` recommendations so it's not persisted to long-term recorder storage. **The LCARS renderer never persists or transmits the array off-device** — reads from `hass.states`, applies LTTB downsampling inside a closed shadow root, draws the polyline, discards. With the history list withdrawn, the renderer **never** needs `recorder/history` to fetch this attribute.
2. **Alternative**: downsample to ~250 Hz × 30 s = 7,500 samples (~15 KB) inside the plug-in before exposing.

The LCARS renderer can handle either resolution — 250 Hz is more than enough for a visual strip.

**Privacy callout** (Worf W4, S1-7): please **do not log** the voltage array to HA logs at any level above DEBUG, and DEBUG logging should require explicit user opt-in. The classification + average BPM are fine. The waveform is the single most clinically sensitive surface the LCARS Sickbay surfaces; treat it accordingly.



### 2.2 Sleep-stage segments array

**Current state**:

- `sensor.health_auto_import_health_metrics_sleep_analysis_latest` → state appears to be total sleep duration (or a single stage's latest end-time? unclear from entity name alone)
- No per-stage segment array exposed

**Ask**: on the sleep-analysis sensor (or a new `sensor.health_auto_import_health_metrics_sleep_segments_latest`), expose the per-segment array:

```yaml
sensor.health_auto_import_health_metrics_sleep_analysis_latest:
  state: 379                                 # total minutes asleep (or whatever makes most sense)
  attributes:
    unit_of_measurement: min
    time_asleep_min: 379                     # 6h 19m
    time_in_bed_min: 477                     # 7h 57m
    efficiency_pct: 79.5
    sleep_score: 62                          # if provided by Apple Sleep Score
    night_start: "2026-05-23T23:28:00-04:00"
    night_end: "2026-05-24T08:00:00-04:00"
    segments:
      - start: "2026-05-23T23:28:00-04:00"
        end: "2026-05-23T23:43:00-04:00"
        stage: "core"                        # one of: awake | rem | core | deep
      - start: "2026-05-23T23:43:00-04:00"
        end: "2026-05-24T00:02:00-04:00"
        stage: "deep"
      - start: "2026-05-24T00:02:00-04:00"
        end: "2026-05-24T00:14:00-04:00"
        stage: "rem"
      # ... continues for the full night
```

Apple Health's sleep analysis JSON in Health Auto Export already breaks the night into stage segments (Apple's HealthKit `HKCategoryValueSleepAnalysis` enumerates `inBed / asleepUnspecified / awake / asleepCore / asleepDeep / asleepREM`). The ask is to expose those segments as a structured array.

**Stage vocabulary**: please normalize to lowercase `awake | rem | core | deep`. If Apple emits `inBed` separately from `awake`, fold `inBed` into the night-start/night-end timestamps and treat `awake` as the displayable awake-during-sleep state. The renderer cannot show `inBed` as a stage — it's a wrapper.

**Size note**: a typical night is 30–80 segments. JSON-serialized, well under 4 KB.

**Stale-data note** (parent §3.5 caveat): if the iOS app misses an overnight export, please surface `night_start: null` or omit the segments attribute entirely rather than emitting yesterday's data. The LCARS renderer treats absence as "no data last night".

### 2.3 Workout HR time series

**Current state**:

- `sensor.health_auto_import_workouts_workout_last_avg_hr` → number (bpm)
- `sensor.health_auto_import_workouts_workout_last_max_hr` → number (bpm)
- `sensor.health_auto_import_workouts_workout_last_duration` → seconds
- `sensor.health_auto_import_workouts_workout_last_type` → string
- `sensor.health_auto_import_workouts_workout_last_energy` → kcal
- `sensor.health_auto_import_workouts_workout_last_started` → ISO timestamp

Avg + Max + Duration give us *crude* zone math (single-zone estimate from avg, dominant zone hint from max). For real per-zone duration we need samples.

**Ask**: expose a HR samples array as an attribute on `sensor.health_auto_import_workouts_workout_last_avg_hr` (or a new sibling sensor):

```yaml
sensor.health_auto_import_workouts_workout_last_avg_hr:
  state: 142                                 # average bpm (unchanged)
  attributes:
    unit_of_measurement: bpm
    avg_bpm: 142
    max_bpm: 178
    duration_s: 2520                         # 42 min
    workout_started: "2026-05-23T14:43:00-04:00"
    workout_type: "Other"
    samples:                                 # one sample per ~30 s — downsampled is fine
      - { t_s: 0,    bpm: 88 }
      - { t_s: 30,   bpm: 95 }
      - { t_s: 60,   bpm: 103 }
      - { t_s: 90,   bpm: 112 }
      # ... continues for full workout duration
```

`t_s` = seconds since workout start. `bpm` = beats/min at that sample.

Apple Health's workout JSON in Health Auto Export already includes a `heartRateData` sub-array. Recommend downsampling to ~30 s cadence inside the plug-in (so a 60-min workout = 120 samples = ~2 KB attribute).

**Why ~30 s, not raw 1 Hz?** Visualization is a stacked-bar zone chart, not a clinical trace. 30-s buckets are more than enough resolution to compute time-in-zone accurately. Raw 1 Hz blows attribute size for nothing.

### 2.4 Workout GPS polyline — **encoded polyline required** (revised per Worf S0-2)

**Current state**: no GPS data exposed.

**Ask**: expose route polyline as a **Google-encoded polyline string** attribute. Raw `{lat, lon}[]` arrays are explicitly **not acceptable** — see privacy rationale below.

```yaml
sensor.health_auto_import_workouts_workout_last_started:
  state: "2026-05-23T14:43:00-04:00"         # unchanged
  attributes:
    workout_type: "Other"
    duration_s: 2520
    distance_m: 161                          # 0.10 mi
    route_compressed: "_p~iF~ps|U_ulLnnqC..." # Google encoded polyline string, ≤500 points
    # NOTE: do NOT expose a raw `route: [{lat,lon,t_s,elev_m}]` array.
```

Apple Health's workout JSON in Health Auto Export includes a `route` sub-array of `{lat, lon, timestamp, altitude}` when GPS-tracked. The ask is for the plug-in to:
1. Downsample to ≤500 points (or 1 sample per 5 seconds, whichever is fewer).
2. Encode using the [Google polyline algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm).
3. Expose only the encoded string.

**Why encoded-only, not raw array** (Worf S0-2 — this is the critical change from v1 of this handoff):
The LCARS Sickbay's `<lcars-workout-route>` component normalizes coordinates to a viewBox inside a **closed shadow root** so the rendered SVG never shows lat/lng. However, the attribute on `hass.states` is **open-DOM-readable** by every Lovelace card, every browser-extension content script, every user with WebSocket API access, and every devtools-inspecting household member. Closed-shadow-root protects only the rendered surface, not the source attribute.
An encoded polyline string is functionally still PHI (decoding takes 30 lines of JS), but it is **harder to casually scrape** than a raw array of typed coordinate objects. It also serializes ~10× smaller (~3 KB vs ~20 KB at 500 points), reducing recorder/websocket footprint.
We considered making the LCARS renderer hide entities from the Lovelace entity picker, but that is the user's responsibility (`homeassistant.hidden: true`). Encoded-only at the source is the only mitigation under the plug-in's control.

**Size**: a 500-point encoded polyline is ~3 KB. Well within HA attribute limits; safe to leave in recorder without exclusion.

**Privacy callout** (Worf S0-2, S1-7): the encoded polyline is still PHI. Please:
- **Do not log** the polyline (encoded or raw) at any log level above DEBUG, and DEBUG should require explicit user opt-in.
- **Do not retain** a non-encoded copy in plug-in memory beyond the time needed to encode.
- Recommend users set `homeassistant.hidden: true` on the workout-started sensor.

**Trust-boundary acknowledgement**: ECG voltage, sleep segments, and workout polylines cross four trust boundaries (watchOS → HAE iOS app → HAI integration → LCARS renderer). LCARS audits only the last link. We will surface this disclosure in the binding-editor's per-profile consent UI; users explicitly accept supply-chain risk before enabling waveform / route rendering.

---

## 2.5 Schema-probe attribute (NEW v2 — per Data CR-9)

**Ask**: on every entity modified by §2.1–§2.4, include a single string attribute:

```yaml
attributes:
  lcars_schema_version: "1"
```

**Why**: the LCARS renderer treats `lcars_schema_version` as a signal that the plug-in author has acknowledged the LCARS data contract for that entity. When absent or mismatched, the renderer falls back to degraded mode for that primitive only (other primitives unaffected). Lets you ship attribute shape changes without coordinating every release with us — just bump the version string when the shape changes, and we update the renderer to match.

**Cost**: one byte. **Risk if you skip**: future shape changes will break the renderer without warning.

Future schema bumps: increment to `"2"` when you change attribute names or types. The LCARS renderer will pin a list of accepted versions (`["1", "2"]`) when it accepts a contract change.

---

## 3. Non-asks (deliberately not requesting)

These were considered and rejected — listed here so it's clear no work is needed:

| # | Considered ask | Rejected because |
|---|---|---|
| N1 | BP history array (last 30 days) | HA `recorder` long-term statistics already provide this for `sensor.health_auto_import_health_metrics_blood_pressure_latest`. Renderer queries `recorder/statistics_during_period` directly. |
| N2 | Step-count time series (intra-day) | Daily/today totals are sufficient for the sparkline. Intra-day samples not needed for any current Sickbay visualization. |
| N3 | Daytime stress samples (Apple equivalent of Oura `stress_day_summary`) | Apple Health does not currently expose a stress series. When/if it does, request will be added then. |
| N4 | Wrist-temperature history array | Existing `_apple_sleeping_wrist_temperature_latest` state + 7-day recorder statistics handle this. No attribute change needed. |
| N5 | Per-segment heart-rate-variability over the night | Nice-to-have but not in scope for v5.14/v5.15 Sickbay redesign. Single nightly average `_heart_rate_variability_latest` is sufficient. |
| N6 | **ECG history list with mini-waveforms** (v1 ask, withdrawn per Worf S0-3) | Contradicts the `recorder.exclude` privacy recommendation in §2.1 — can't lazy-fetch waveforms from a store the plug-in told users to exclude. The LCARS renderer now shows current-reading-only. A future opt-in (captain-ratified, retention-capped) may revisit. |
| N7 | **Raw `route: [{lat,lon,t_s,elev_m}]` array** (v1 ask, withdrawn per Worf S0-2) | Open-DOM-readable; encoded-polyline-only at the source is the only effective mitigation under the plug-in's control. See §2.4. |

---

## 4. Test entities for verification

If you ship any of §2.1–§2.4 + §2.5 and want to confirm the LCARS Sickbay BIOMEDICAL tab consumes the data correctly:

1. **ECG (§2.1)**: take any Apple Watch ECG reading; the LCARS waveform card should render within one HA state refresh (≤30 s). Classification banner should match the Apple Watch verdict. The history list previously promised in v1 of this document is **no longer present** — current reading only.
2. **Hypnogram (§2.2)**: any night of sleep tracked by Apple Watch + iPhone; the hypnogram should appear in BIOMEDICAL row 5 (default) or SLEEP row 1 (if the optional 4th tab is enabled). **Note**: in BIOMEDICAL placement, the header pill shows totals only (no `night_start`/`night_end` clock times — privacy gate per Worf S2-10); timestamps appear only in SLEEP-tab placement.
3. **HR zones (§2.3)**: any workout > 10 minutes with the watch on; the HR-zones chart should show 4 stacked bars proportional to time in each zone. **Note**: the chart hides entirely if `person.birthdate` is not set (no silent default to age 40 — per Worf ratified decision Q-C).
4. **Workout route (§2.4)**: any outdoor workout with GPS; the route should appear in BIOMEDICAL row 4 left pane as a normalized SVG polyline decoded from `route_compressed`. **No lat/lng coordinates should ever appear as text on the page** — verifiable by inspecting the rendered DOM.
5. **Schema probe (§2.5)**: temporarily remove the `lcars_schema_version` attribute from any of the above entities; the corresponding LCARS primitive should fall back to degraded mode for that entity only (other primitives unaffected).

---

## 5. Versioning / backwards compatibility

The LCARS Sickbay BIOMEDICAL tab detects each attribute's presence on render. If an attribute is absent, or if `lcars_schema_version` doesn't match an accepted version, the corresponding visualization falls back to degraded mode (single LCARS pill or summary-only view). There is no breaking change.

You can ship §2.1 alone, or §2.2 alone, or all four + §2.5. Order doesn't matter. The LCARS side will light up each visualization independently as its attribute appears.

When you change an attribute shape (rename `samples` → `hr_samples`, etc.), please bump `lcars_schema_version` and open an issue on the LCARS dashboard repo so we can update the renderer's accepted-versions list in sync. The renderer pins on the names in §2.1–§2.5 plus whatever versions we have explicitly accepted.

---

## 7. v5.15.0 implementation feedback (post-handback — 2026.05.25)

HAI v1.1.0 shipped all five asks cleanly — the LCARS Sickbay v5.15.0-beta.1 BIOMEDICAL tab is wired against the documented attribute shapes with no surprises. The renderer fully honors the three caveats in the handback (truncation degraded-mode, absent-vs-null, schema-probe). This section captures observations from wiring up the three new primitives so the HAI team has feedback for any future iteration.

### 7.1 What worked perfectly

- **`voltage_uv` as integer μV** — LTTB downsamples 15,360 samples (30 s × 512 Hz) to 1,200 visible points in ~3 ms. No floating-point precision concerns. Perfect.
- **`route_compressed`** — built-in polyline encoder in HAI matched the reference Google decoder bit-for-bit; first attempt rendered. Encoded-only + ≤500 points kept the wire format tight (~3 KB). Worf S0-2 honored.
- **`segments[]` stage normalization** — the lowercase `awake / rem / core / deep` vocabulary on the wire saved the renderer a normalization pass.
- **`lcars_schema_version: "1"` schema probe** — clean three-state fallback ladder for every primitive: truncated → schema-mismatch → ok.

### 7.2 Soft asks for future HAI revs (not blocking)

These are **observations**, not formal asks. None of them block v5.15.0; each unlocks a smaller polish.

| # | Soft ask | Why | Effort estimate |
|---|---|---|---|
| 7.2a | **Surface `source_devices` array on the ECG voltage entity** (it's currently on the sleep entity only — confirmed via the renderer wiring; LCARS sanitizes whichever string lands). | Sickbay footer reads "STATUS · NORMAL SINUS RHYTHM · 78 BPM · 30 SEC · Apple Watch Series 10 · 2026-05-23 08:17" — the device name comes from `source_devices[0]` when present. Without it, the footer omits the device. | XS — pass through existing HAE field |
| 7.2b | **Per-stage total minutes attribute** on the sleep entity (`deep_min`, `rem_min`, `core_min`, `awake_min`). | When `segments[]` is absent (degraded mode), the renderer can't compute per-stage proportions and falls back to a single asleep-vs-awake stacked bar. Per-stage minutes would let the degraded bar show the full 4-stage breakdown — closer to the live hypnogram visual. | S — compute from segments at coordinator time |
| 7.2c | **`ended_at` ISO timestamp on the workout entity**. | Derived today as `state + duration_s` inside the renderer, which assumes the workout was contiguous. Apple HealthKit sometimes pauses mid-workout; the derived end-time is off by the pause duration. Surfacing the true `endDate` would fix that. | XS — pass through HAE field |
| 7.2d | **Document the exact HealthKit `classification` string vocabulary** in the handback. | The renderer covers `sinusRhythm / atrialFibrillation / highHeartRate / lowHeartRate / inconclusive`. If HAI ever surfaces additional values (Apple has added `notClassified` in newer watchOS versions), the renderer falls through to "NO READING". A documented vocabulary lets us add new colors proactively. | XS — docs only |

### 7.3 What is NOT being asked for

To keep this section short and the conversation healthy:

- **History list** — still withdrawn per Worf S0-3. Not revisiting in v5.15.
- **Raw `{lat,lon}[]`** — explicitly rejected per Worf S0-2. Encoded-only stays.
- **Workout HR sample density >1 sample / 30 s** — current downsampling gives accurate zone math; raw 1 Hz would balloon the recorder for no visual benefit.
- **Polling cadence change** — 10 min coordinator interval is correct.

### 7.4 Documentation updates landed on the LCARS side

For visibility:

- [dashboards/SICKBAY.md](../dashboards/SICKBAY.md) gained a "Data Source #3 — Health Auto Import HACS integration" section with the **recorder exclusion YAML** for `sensor.*_ecg_voltage_measurements` (handback caveat #3) and a note about the **`(truncated — too large for entity attributes)` degraded-mode pill** (handback caveat #2).
- The three new primitives' source files reference this handoff document directly in their header comments, so future contributors trace contract questions back here.

---

## 8. Contact

Open an issue (or PR with shape questions) on:
- **LCARS Lovelace Dashboard** repo · [github.com/htiel/LCARS-lovelace-dashboard](https://github.com/htiel/LCARS-lovelace-dashboard) — for clarification on what the LCARS renderer expects.
- Reference the **v5.14 Sickbay Tab Redesign** milestone.

Or reply to this document with comments / counter-proposals; we'll iterate.

Thank you for the plug-in — it's already doing the hard work. These asks are the last 10% that turns the data into a Star-Trek-grade medical display.

— LCARS Sickbay maintainers
