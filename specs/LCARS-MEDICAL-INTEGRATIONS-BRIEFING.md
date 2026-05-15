# LCARS Medical Integrations Briefing — Oura / Withings / Apple Health

**Author**: Lt. Cmdr. Data (Architecture, with research consolidated from Explore officer recon)
**Reviewers**: Geordi (UI), Worf (privacy/security), Wesley (feature ideas), Riker (priority/triage)
**Stardate**: 2026.05.15
**Status**: TRAINING REFERENCE — supersedes upstream-integration assumptions in [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) §4 (entity contract). When an assumption in the parent spec disagrees with this briefing, this briefing wins until the parent spec is updated.
**Scope**: Three external health platforms — **Oura Ring** (HACS), **Withings** (HA core), **Apple Health** (iOS bridge). All other `MEDICAL_PLATFORMS` (Fitbit, Dexcom, Garmin Connect, Google Fit) are out of scope of this briefing.
**Audience**: Every officer who touches the Medical Bay card or its utility module. Read before opening a PR against [lcars-medical-card.js](../custom_components/lcars_dashboard/js/src/lcars-medical-card.js) or [lcars-medical-utils.js](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js).

---

## 0. TL;DR — what changed upstream that breaks our assumptions

| # | Severity | Where | What |
|---|---|---|---|
| 1 | **S0** | Oura HACS v2.0.0 (Nov 2025) | Entity IDs renamed `sensor.oura_<metric>` → `sensor.oura_ring_<metric>` AND adopted `has_entity_name=True`. The user name no longer appears in the entity ID. Our `oura_ring_(.+?)_[a-z]/i` person-binding regex is wrong — it captures the metric stem, not the person. Latent under healthy device registry; **shatters into ~30 pseudo-profiles or cross-contaminates two rings into one biobed** the moment device registry is mid-restore. |
| 2 | **S0** | Oura HACS v2.0.0 | Resilience enum vocabulary is now `limited / adequate / solid / strong / exceptional`. Our `_renderEnumTile()` matches the legacy `Great / Strong / Solid / Low` — result: `limited` (worst) → NOMINAL, `exceptional` (best) → ALERT. **Inverted safety semantics.** |
| 3 | **S0** | Oura HACS — `resting_heart_rate` semantics | Oura's `_resting_heart_rate$` is a 0–100 readiness contributor SCORE, not actual BPM. We classify it as `heart_rate` BPM. **Display will show 50–80 "bpm" that is actually a 0–100 score.** Other platforms (Apple Health, Withings) DO emit actual BPM at this suffix — fix must be platform-branched. |
| 4 | **S1** | Oura HACS v2.6.0 | `rest_mode` is now a `binary_sensor` with state `on`/`off`. `classifyRestMode('on')` returns `'off'`. **Rest-mode banner never lights up.** |
| 5 | **S1** | Oura HACS v2.7.0 | New sensors silently dropped by `IGNORE_SUFFIXES`: `breathing_disturbance_index`, `mindfulness_sessions_today`, `meditation_duration_today`, `ring_battery_level` (latter is correct in Medical, but Engineering wire-up never landed). |
| 6 | **S1** | Withings | `in_bed` binary sensor REQUIRES webhooks (no polling fallback). If user lacks a public HTTPS URL on port 443 with a valid cert, the sensor is permanently unavailable. **No diagnostic surface in Medical Bay today.** |
| 7 | **S2** | Withings | Sleep durations are NATIVE seconds (suggested unit hours). If we read `state` directly without unit-aware formatting we display 28800 s instead of 8h. |
| 8 | **S2** | Apple Health | No upstream change — but the deferred bridge plan needs picking. **Health Auto Export** (iOS app + REST webhook) is the unanimous recommendation. HA Companion iOS only exposes pedometer (no vitals). |

**Riker's read**: items 1–3 are release-blockers for v5.11.x. Items 4–5 ride the same patch. Items 6–8 are next-train backlog.

---

## 1. Oura Ring (HACS) — canonical source: `louispires/Oura-Home-Assistant-Integration` v2.7.0

### 1.1 Source of truth has moved

- **Old** (in our heads, in old comments): `nitobuendia/oura-custom-component` — v1 API, removed from HACS default in 2024.
- **New canonical** (since 2024): [`louispires/Oura-Home-Assistant-Integration`](https://github.com/louispires/Oura-Home-Assistant-Integration), v2.7.0 (May 2026), MIT license, in HACS default repo, OAuth2 to Cloud API v2.

If a user is still on the old fork, they will see no `oura_ring_*` entities at all and our card will show the empty-state. That's correct behavior — encourage them to migrate.

### 1.2 Auth model

- **OAuth2** via HA Application Credentials. Eleven scopes (email/personal/daily/heartrate/workout/session/tag/spo2/ring_configuration/stress/heart_health).
- Tokens auto-refresh via `OAuth2Session.async_ensure_token_valid()`.
- Reauth flow enforces same Oura account — cannot accidentally swap accounts.

### 1.3 Multi-user model — **the regex is wrong**

**One config entry per Oura account.** Each entry produces its own device, its own entry-scoped unique IDs (`<entry_id>_sleep_score`), and its own friendly entity name. **The user name is NOT in the entity ID.** Two-ring household:

```
User A (alice@example.com): config_entry 01HABC...
  sensor.oura_ring_sleep_score          (unique_id: 01HABC..._sleep_score)
  sensor.oura_ring_readiness_score      (unique_id: 01HABC..._readiness_score)
  …

User B (bob@example.com): config_entry 01HDEF...
  sensor.oura_ring_sleep_score_2        ← HA disambiguates with numeric suffix
  sensor.oura_ring_readiness_score_2
  …
```

**Correct binding strategy** (per Data §A): join via `entity_registry_entry.config_entry_id` to a per-person source list persisted in a new `medical_profiles.yaml` store, edited via a single-screen master/detail UI. `device_id` is the fallback. The current entity-ID regex is deleted. See [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md) for the full mechanism. §4.1 of this doc covers the call-site change.

### 1.4 Entity inventory — 62 sensors + 2 binary sensors (v2.7.0)

The full table is in the Oura research artifact. The salient additions since the parent spec was written:

| Bucket | New since v2.0.0 | LCARS today |
|---|---|---|
| Sleep | `sleep_regularity` (no `_score` suffix), `sleep_efficiency` (now from detailed endpoint, real %, not contributor score) | regex matches `_score` only — `sleep_regularity` silently ignored |
| Readiness | `temperature_deviation` (°C, real), `resting_heart_rate` (0–100 SCORE, NOT bpm), `hrv_balance` (0–100 score), `sleep_regularity` (0–100 score) | classify BPM-as-BPM → wrong domain for Oura |
| Heart rate (REAL bpm) | `current_heart_rate`, `average_heart_rate`, `min_heart_rate`, `max_heart_rate`, `lowest_sleep_heart_rate`, `average_sleep_heart_rate` | all six picked up correctly |
| HRV | `average_sleep_hrv` (ms) | correct |
| Stress | `stress_high_duration`, `recovery_high_duration`, `stress_day_summary` (enum) | ignored (durations) / not yet wired (enum) |
| Resilience (enum) | `resilience_level`: `limited / adequate / solid / strong / exceptional` | enum picked up — **status mapping inverted** (S0-2) |
| Resilience (scores) | `sleep_recovery_score`, `daytime_recovery_score`, `stress_resilience_score` (1–100 each) | partial |
| SpO2 | `spo2_average` (%), `breathing_disturbance_index` | spo2 yes; BDI ignored |
| Fitness | `vo2_max` (mL/kg/min), `cardiovascular_age` (years) | both wired correctly |
| Workout (v2.6.0) | `workouts_today`, `last_workout_type`, `_distance`, `_calories`, `_intensity`, `_duration` | last_workout wired; count ignored |
| Sessions (v2.6.0) | `mindfulness_sessions_today`, `meditation_duration_today` | both ignored (no kinds) |
| Tags (v2.6.0) | `tags_today` | correctly ignored |
| Rest mode (v2.6.0) | `binary_sensor.*_rest_mode` (on/off), `_rest_mode_start` / `_end` (timestamps) | binary `on` mistranslated to `'off'` (S1-1) |
| Battery (v2.7.0) | `ring_battery_level` (0–100 %, device_class=battery), `binary_sensor.*_ring_charging` | spec routes to Engineering — wire-up never landed |

### 1.5 Polling & rate limits

- Default 5 min, configurable 1–60 min.
- Heart-rate endpoint enforces 30-day max per request — integration auto-batches historical imports.
- Optional feature endpoints (SpO2, VO2 Max, Resilience, Cardiovascular Age) gracefully return empty on 401 — Gen2 rings or new accounts without enough baseline data simply lack those entities. **Empty handling is upstream's responsibility; our card must just tolerate the missing entities.**

### 1.6 Hardware gates

- SpO2, Breathing Disturbance Index → Gen3 & Ring 4 only.
- Resilience, Cardiovascular Age, VO2 Max → require sufficient baseline data (weeks of wear).
- Sleep Optimization timestamps → may be unavailable on new rings.

---

## 2. Withings (HA core) — `homeassistant/components/withings/` (HA 2026.5.x)

### 2.1 Auth model

- **OAuth2** via Application Credentials. Manual app registration at https://account.withings.com/partner/add_oauth2 (target: Withings public cloud, NOT US medical cloud).
- Scopes: `user.info`, `user.metrics`, `user.activity`, `user.sleepevents`.
- Config entry unique ID = Withings `userid` (string). One config entry per Withings email account.

### 2.2 Webhook + polling hybrid

Real-time pushes come from Withings webhooks; HA polls every 10 min as fallback. **Webhooks require a public HTTPS URL on port 443 with a valid cert (Let's Encrypt acceptable; self-signed is not).** HA Cloud auto-registers cloudhooks if active.

| Event class | Mechanism | Fallback |
|---|---|---|
| WEIGHT, PRESSURE, ACTIVITY, SLEEP | webhook → 10-min poll | polling fills the gap |
| IN_BED, OUT_BED (binary `in_bed` sensor) | **webhook only** | **no polling fallback — sensor goes unavailable** |

This is item 6 in the TL;DR. Two consequences for our card:

1. If the Captain's HA does not expose port 443 with a valid cert, the `in_bed` sensor will be permanently unavailable. We currently have no diagnostic banner saying "webhooks not registered."
2. With webhooks down, vitals lag 10 minutes. Our "X min ago" freshness display reflects this honestly — fine.

### 2.3 Entity inventory — sensors are **dynamic**

Sensors only appear if data exists in the trailing window:
- Measurements: trailing 14 days
- Sleep sensors: trailing 24 hours
- Workout sensors: latest workout ≤14 days

**Implication**: a user who skips weighing for 15 days will see the weight sensor disappear from the card. We should NOT treat absence as "user has no scale" on the empty-state. Instead, if the user previously had a vital and it just dropped, surface "STALE" instead of silently removing the tile. This is a backlog item.

Key entities and their native units (full table in Withings research artifact):

```
Cardiovascular:   systolic_blood_pressure_mmhg, diastolic_blood_pressure_mmhg,
                  heart_pulse_bpm, spo2_pct, pulse_wave_velocity (m/s)
Body composition: weight_kg (always kg native), fat_mass_kg, fat_free_mass_kg,
                  muscle_mass_kg, bone_mass_kg, fat_ratio_pct, hydration (kg)
Segmental:        muscle_mass_<segment>_kg, fat_free_mass_<segment>_kg,
                  fat_mass_<segment>_kg  (segments: torso, left_arm, right_arm,
                  left_leg, right_leg) — disabled by default except torso
Vascular health:  vascular_age (years), vo2_max (mL/min/kg)
Temperature:      body_temperature_c, skin_temperature_c (NEW with ScanWatch 2)
                  Note: NO native temperature_deviation sensor — we synthesize from baseline
Sleep durations:  sleep_deep_duration_seconds, sleep_light_duration_seconds, etc.
                  (NATIVE = seconds, suggested = hours; see UoM gotcha §2.5)
Sleep quality:    sleep_score, sleep_breathing_disturbances_intensity, sleep_snoring,
                  sleep_wakeup_count, sleep_heart_rate_average_bpm, sleep_respiratory_average_bpm
Activity:         activity_steps_today, activity_distance_today, activity_active_calories_burnt_today, …
Workout:          workout_type (enum), workout_active_calories_burnt, workout_distance,
                  workout_duration (seconds), …
Goals:            step_goal, sleep_goal (seconds), weight_goal (kg)
Binary:           in_bed (occupancy, webhook-only)
```

Entity ID pattern: `sensor.withings_<userid>_<key>` — e.g. `sensor.withings_9876543_weight_kg`.

### 2.4 Multi-profile reality

**One Withings account = one HA config entry.** Sub-profiles within a single Withings account (the "family scale" use case) are NOT modeled. Only the primary/owner profile's data flows to HA. If the Captain wants per-family-member vitals, **each family member needs their own Withings account + their own HA config entry**. The card already binds via config_entry_id (after fix S0-1) so this scales architecturally.

### 2.5 UoM gotchas

| Vital | Native | HA conversion | Risk |
|---|---|---|---|
| Blood pressure | mmHg | auto-convert to inHg if HA UoM = imperial | **bug**: API sometimes returns mmHg even in imperial — LCARS already overrides at [lcars-medical-card.js#L179](../custom_components/lcars_dashboard/js/src/lcars-medical-card.js#L179) |
| Weight | kg | auto-convert to lb if HA UoM = imperial | none |
| Temperature | °C | auto-convert to °F if HA UoM = imperial | none — but **don't hardcode °C** in label rendering |
| Sleep durations | **seconds** | suggested unit = hours | **must use HA's display formatter or unit-aware reducer** — raw `state` is seconds |

### 2.6 What's NOT in HA core (as of 2026.5)

- No ECG / AFib readings (Body Scan exposes them, integration doesn't surface)
- No sleep apnea detection (SpO2 yes, AHI no)
- No `temperature_deviation` sensor — we derive from `body_temperature_c` baseline ourselves
- Arterial stiffness distinct from `vascular_age` — not exposed

If the Captain wants any of these, file an upstream issue against `homeassistant/core` rather than attempting to scrape the Withings REST API directly — the latter would require us to maintain OAuth refresh, which the integration already does correctly.

---

## 3. Apple Health (iOS HealthKit) — bridge required

### 3.1 No first-class HA integration exists

Apple's HealthKit is read-only by design for third-party apps and has no daemon HA can talk to. Every option is an iOS-side bridge. **Spec §4.1 currently lists `apple_health` as deferred.** This briefing recommends un-deferring it for v5.11+ via Health Auto Export.

### 3.2 Bridge inventory

| Bridge | Maturity | Vitals coverage | Setup | Cost | Privacy | Recommend |
|---|---|---|---|---|---|---|
| **Health Auto Export** (iOS app + REST webhook to HA) | HIGH | 150+ HealthKit metrics including ECG, BG, BP, sleep stages, HRV, VO2max, body temp | 2/5 | $5–20 lifetime or $4.99/mo for background sync | local-only, no cloud relay | **PRIMARY** |
| **HA Companion app (iOS)** | HIGH | Pedometer only — `steps`, `distance`, `floors_ascended/descended`, `activity`, `watch_battery_*`. **No vitals.** | 1/5 | free | local-only | secondary — useful for activity totals only |
| **Apple Shortcuts → HA REST webhook** | MEDIUM | 150+ metrics (manual triggers) | 3/5 | free | local-only | tertiary fallback for users who refuse paid apps |
| **HA Companion app (Android)** | HIGH | Health Connect surfaces 20+ vitals natively | 1/5 | free | local-only | for Android households — out of scope here |

### 3.3 Recommended canonical path: Health Auto Export

- **iOS app**: [Health Auto Export](https://apple.co/3iqbU2d) (Lybron) — last commit Dec 2024, 227 stars, MIT-style proprietary, premium for background sync.
- **Transport**: REST POST to a HA webhook URL. JSON payload schema documented at https://github.com/Lybron/health-auto-export/wiki/API-Export---JSON-Format.
- **Frequency**: user-configurable 15 min / 30 min / 1h / 2h / 4h / manual. **iOS 18+ throttles background fetch — plan for 30–90 min real-world latency.**
- **Privacy**: 100% local. No Lybron cloud. No account.

### 3.4 Proposed entity-ID convention

Health Auto Export does not auto-name entities — the user receives raw JSON and constructs entities via `template:` sensors or the REST integration. We must propose a standard so our `MEDICAL_VITAL_CLASSES` regex map can absorb Apple Health entries with minimal additions.

```
sensor.applehealth_<person>_<category>_<metric>
```

Examples:

```
Vitals:
  sensor.applehealth_alice_vitals_heart_rate                 → bpm
  sensor.applehealth_alice_vitals_resting_heart_rate         → bpm  (REAL bpm, unlike Oura)
  sensor.applehealth_alice_vitals_blood_pressure_systolic    → mmHg
  sensor.applehealth_alice_vitals_blood_pressure_diastolic   → mmHg
  sensor.applehealth_alice_vitals_blood_glucose              → mg/dL
  sensor.applehealth_alice_vitals_oxygen_saturation          → %
  sensor.applehealth_alice_vitals_respiratory_rate           → brpm
  sensor.applehealth_alice_vitals_heart_rate_variability     → ms
  sensor.applehealth_alice_vitals_body_temperature           → °C
Sleep:
  sensor.applehealth_alice_sleep_total_duration              → min
  sensor.applehealth_alice_sleep_deep                        → min
  sensor.applehealth_alice_sleep_rem                         → min
  sensor.applehealth_alice_sleep_core                        → min
Activity:
  sensor.applehealth_alice_activity_steps                    → steps
  sensor.applehealth_alice_activity_active_energy            → kcal
  sensor.applehealth_alice_activity_distance                 → km
  sensor.applehealth_alice_activity_vo2_max                  → mL/kg/min
Body composition:
  sensor.applehealth_alice_body_weight                       → kg
  sensor.applehealth_alice_body_bmi                          → (no unit)
  sensor.applehealth_alice_body_fat_percentage               → %
Cardiac events (enum / state):
  sensor.applehealth_alice_cardiac_ecg_classification        → "Sinus Rhythm" | "Atrial Fibrillation" | …
  sensor.applehealth_alice_cardiac_irregular_rhythm          → "None" | "Detected"
```

**Person binding**: bind via the `medical_profiles.yaml` store as a `kind: entity_prefix` source (e.g. `id: applehealth_gandalf` matches `sensor.applehealth_gandalf_*`). Apple Health entities do NOT come from a config entry, so the `entity_prefix` discriminator in the new binding spec is the only viable mechanism. See [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md) §3.2.

### 3.5 Critical caveats

| Severity | Caveat |
|---|---|
| HIGH | iOS 18+ throttles background fetch. Plan for ≤4 updates/hour SLA, not real-time. |
| HIGH | Premium subscription (or lifetime IAP) required for background sync. Free tier is manual export only. |
| HIGH | HealthKit data accuracy varies by source device (Apple Watch HR ≠ third-party band HR). Health Auto Export includes `source` metadata in JSON — surface it in the tile tooltip. |
| MED | No bidirectional control. HA cannot write back to HealthKit. Read-only by Apple's design. |
| MED | iOS 16+ granular per-metric permissions. Users grant per-category consent; Apple may tighten further. |
| MED | Stale-data detection — if the iOS app crashes or loses background privilege, HA never knows. We need a template sensor flagging vitals older than 2× expected interval. |
| LOW | App Store rejection risk if Apple tightens HealthKit export rules. Health Auto Export has been approved for years; monitor. |
| LOW | HealthKit data from non-medical-grade devices (Watch ECG, third-party CGMs) is informational — Medical Bay's existing PHI banner already covers this disclaimer. |

---

## 4. Action ledger by officer

> **Cross-reference**: the S0-1 fix (deterministic person↔source binding) ships in v5.11.0 alongside the user-facing editor designed in [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md). Same train, single PR — the resolver and discovery rewrite are inseparable from the editor's storage contract.

### 4.1 Data — architecture (S0 + S1)

**S0-1.** Replace the `oura_ring_(.+?)_[a-z]/i` profile-binding regex in `discoverProfiles` with `entity_registry_entry.config_entry_id` as the primary key, sourced from the new `medical_profiles.yaml` store. `device_id` becomes the fallback. Delete the now-incorrect §4 hardening comment at [lcars-medical-utils.js#L417-L423](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js#L417-L423). The same `config_entry_id` strategy generalizes to all other multi-account `MEDICAL_PLATFORMS` — Withings benefits identically. Full mechanism (storage schema, WS commands, resolver algorithm, editor UI) is specified in [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md).

**S0-2.** Rewrite the resilience enum mapping in `_renderEnumTile()` ([lcars-medical-card.js#L502-L505](../custom_components/lcars_dashboard/js/src/lcars-medical-card.js#L502-L505)) for the v2.0.0 vocabulary:

| Enum | Status |
|---|---|
| `limited` | ALERT |
| `adequate` | ELEVATED |
| `solid` | NOMINAL |
| `strong` | NOMINAL |
| `exceptional` | NOMINAL (allow gold accent variant) |

Drop the legacy `low` / `great` matches.

**S0-3.** Stop classifying Oura's `_resting_heart_rate$` as `heart_rate`. Platform-branch in `classifyVital`: route `_resting_heart_rate$` to `heart_rate` only when `platform !== 'oura'`. For Oura, route to the readiness sub-score lane (already wired in `READINESS_SUBSCORE_LABELS`).

**S1-1.** Fix `classifyRestMode()` ([lcars-medical-utils.js#L573-L582](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js#L573-L582)) to recognize `'on'` as `'rest'` when the source entity is a `binary_sensor`. Update `findRestModeState()` to walk `binary_sensor.*_rest_mode$` in addition to `sensor.*`.

**S1-2.** Once S0-1 lands, remove the dead `oura_ring_` needle stripping at [lcars-medical-utils.js#L585](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js#L585) and [L614](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js#L614).

### 4.2 Geordi — UI (S1 + S2)

**G1.** When a previously-present Withings tile drops because the user skipped weighing for >14d, render a `STALE` chip with the last-known timestamp instead of silently removing the tile. Applies to all dynamic Withings sensors (§2.3 dynamic-window rule).

**G2.** Resilience-level enum tile: `exceptional` should render with a subtle gold accent (e.g. `--lcars-color-bonus`) — celebration without breaking the four-state status pill grammar.

**G3.** Apple Health tile data-source disclosure — if `source` metadata is present in the entity attributes, surface it in the tile's hover/long-press detail view (e.g. "Apple Watch Series 10", "Dexcom G7"). Avoids the "two heart rates that disagree" confusion when a user has both Oura and Apple Health emitting HR.

**G4.** No Apple Health-specific layout work needed pre-ship — the existing Biofunction Card grid absorbs `applehealth_*` entities once the regex map is updated. Geordi sign-off needed only on icon choices for new vital_kinds (`bdi`, `mindfulness`, `meditation_duration`).

### 4.3 Worf — privacy / security (must re-bless S0-1)

**W1.** S0-1 changes the person-binding mechanism. Re-validate that:
- `config_entry_id` does not leak across `localStorage` keys for the consent gate (currently keyed on FILE_ID hash — confirm hash input includes entry_id, not raw entity_id).
- The old `oura_ring_` regex's "two-rings-collapse" failure mode (two people merged into one biobed) cannot recur via the new fallback chain.

**W2.** Apple Health bridge — confirm that the Health Auto Export webhook URL is treated as PHI-class (not logged in plaintext, not exposed in the editor's panel-placement debug surface).

**W3.** Withings webhook diagnostic banner — when added (G1-adjacent), the banner must NOT expose the full webhook URL. Show only "WEBHOOK INACTIVE — vitals may lag 10 minutes." The remediation link goes to documentation, not to the live webhook URL.

**W4.** Re-confirm the screenshot-redaction hook (§7.4 of parent spec) covers the new tile lineup — `bdi`, `mindfulness`, `meditation_duration`, plus all `applehealth_*` tiles when added.

### 4.4 Wesley — feature ideas (S2 backlog)

**X1.** Surface `breathing_disturbance_index` (Oura) as a sleep-quality co-tile next to sleep_score. Bands: low <5, moderate 5–15, alert >15 (per AHI conventions).

**X2.** Surface `mindfulness_sessions_today` and `meditation_duration_today` — but only on profiles that have ever logged a session. Empty-by-default tiles diminish the "the ship takes care of you" aesthetic.

**X3.** Surface `sleep_regularity` (no `_score` suffix) as a variant of `sleep_score` — same tile slot, sub-label "REGULARITY."

**X4.** Apple Health ECG classification — when present, render a banner (not a tile) above the silhouette: `ECG · SINUS RHYTHM · 2h AGO`. AFib classification escalates to ALERT pill. This is a unique Apple Health superpower no other platform exposes.

**X5.** "WEBHOOK INACTIVE" ambient indicator for Withings (Worf-blessed phrasing per W3) — shows in the header status pill rail when freshness > 10 min on any Withings vital. Single-glance diagnostic without opening logs.

**X6.** Cross-source vital reconciliation — if both Oura and Apple Health emit heart rate for the same person, show both, label by source, and let the user pick the canonical source per-vital_kind in `profiles.yaml`. Defer until two-source households are common.

### 4.5 Riker — priority / triage

**Train v5.11.0 (release blocker)**: S0 batch (S0-1, S0-2, S0-3) **plus the binding editor** per [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md). Single PR — the editor's storage contract, the resolver rewrite, and the S0-1 discovery fix touch the same call sites; splitting them creates merge conflicts and throwaway code. Worf re-bless required.

**Train v5.11.x patch**: S1 batch (S1-1, S1-2). Geordi G2.

**Train v5.12.0 (feature)**: S2 expansion — Wesley X1/X2/X3 (Oura sensor coverage), G1 (stale tile), W3 + X5 (webhook diagnostic). Plus binding-editor v2 (live preview pane, divergence chip + compare-sources modal) deferred from v5.11.0 per editor spec §10 Story 5.

**Train v5.13.0 (feature)**: Apple Health integration — bridge documentation, regex map additions, person binding via `kind: entity_prefix` slot in `medical_profiles.yaml` (mechanism shipped in v5.11.0 alongside S0 fixes), X4 (ECG banner), G3 (source disclosure tooltip).

**Spec hygiene**: parent [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) §4.1.1 entity-ID conventions table is now outdated for Oura. Update in the same PR as S0-1. Apple Health row moves from "Deferred" to "v5.13 in flight." Withings row gains the webhook-required note for `in_bed`. Add a forward-link from §4.1.1 to [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md) as the canonical binding contract.

---

## 5. References

### Oura
- Repo: https://github.com/louispires/Oura-Home-Assistant-Integration
- Release notes: https://github.com/louispires/Oura-Home-Assistant-Integration/blob/main/release-notes.md
- Const definitions: https://github.com/louispires/Oura-Home-Assistant-Integration/blob/main/custom_components/oura/const.py
- Cloud API v2: https://cloud.ouraring.com/v2/docs

### Withings
- HA docs: https://www.home-assistant.io/integrations/withings/
- HA source: https://github.com/home-assistant/core/tree/dev/homeassistant/components/withings
- Withings developer: https://account.withings.com/partner/add_oauth2

### Apple Health
- Health Auto Export repo: https://github.com/Lybron/health-auto-export
- App Store: https://apple.co/3iqbU2d
- JSON schema wiki: https://github.com/Lybron/health-auto-export/wiki/API-Export---JSON-Format
- Supported metrics: https://github.com/Lybron/health-auto-export/wiki/Supported-Data
- HA Companion sensors: https://companion.home-assistant.io/docs/core/sensors/

### Internal
- Parent spec: [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md)
- Card source: [lcars-medical-card.js](../custom_components/lcars_dashboard/js/src/lcars-medical-card.js)
- Utils source: [lcars-medical-utils.js](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js)
