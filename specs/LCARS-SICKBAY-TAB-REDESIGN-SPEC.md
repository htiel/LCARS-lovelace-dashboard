# LCARS Sickbay — Tab Redesign Spec (Summary / Anatomical / Biomedical)

**Author**: Lt. Cmdr. Data (architecture)
**Reviewers (v2 — full crew review applied 2026.05.25)**: Geordi (UI/LCARS grammar), Worf (PHI/security), Wesley (feature ideation), Riker (priority/sequencing)
**Stardate**: 2026.05.25 (v1 draft) · 2026.05.25 (v2 crew-reviewed)
**Extends**: [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) §5.5 (scan-mode tabs) and §7 (PHI primitives — amended per W6 below), [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md) (entity inventory)
**Status**: DRAFT v2 — incorporates full crew review (Riker, Data, Geordi, Wesley, Worf). v5.14 scoped to Stories 1–4 per Riker split. Companion plan: [plans/5.14-sickbay-tab-redesign.md](../plans/5.14-sickbay-tab-redesign.md). Data-contract handoff to Health Auto Import plug-in: [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md).
**Privacy class**: PHI-adjacent — inherits all §7 constraints of the parent spec **plus** new W6 cache-lifecycle gate (this spec §7.9) and a per-profile `consent.ecg` second-layer gate (§7.7). Parent §7.4 redaction selector list must be amended to include `[data-medical="phi"]` before any new primitive ships.

---

## 0a. Crew Review Consensus (v2 — 2026.05.25)

Five officers reviewed the v1 draft. The following decisions are **ratified** and bind the rest of the spec:

### Ratified open decisions (was §10 questions)

| ID | Decision | Resolution |
|---|---|---|
| Q-A | Workout-route source | **Most-recent-with-GPS**, skipping treadmill / indoor workouts. Falls back to `WORKOUT · NO ROUTE` after 5 GPS-less workouts in a row. |
| Q-B | Hypnogram placement | **BIOMEDICAL row 6 by default**, moves to SLEEP tab row 1 when `dashboard_options.sickbay_sleep_tab: true`. Per Worf S2-10: when rendered in BIOMEDICAL, the header pill **suppresses** `night_start`/`night_end` timestamps (totals only); timestamps appear only in the SLEEP tab placement. |
| Q-C | HR-zones birthdate fallback | **Hide HR-zones entirely** when `person.birthdate` is absent. No silent default to age 40. Pill replacement: `WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES`. |
| Q-D | At-a-glance tile strip | **Shrink-to-fit** (no `—` padding). Below 720 px viewport, wrap to 2–3 rows via `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`. |

### Crew-blessed structural changes (applied throughout the spec below)

| # | Change | Origin | Section affected |
|---|---|---|---|
| C1 | **Train split** — v5.14 ships Stories 1–4 only. Stories 5–6 (ECG waveform, hypnogram per-segment, workout route) move to v5.15 after v5.11 binding-editor + v5.13 Apple Health stabilize AND HAI plug-in commits to data contract. | Riker | Plan; spec timeline references |
| C2 | **Fold `tabs[]` into `MEDICAL_VITAL_CLASSES`** as an array field. No parallel `MEDICAL_TAB_ASSIGNMENTS` map. | Data CR-1 | §3 preamble |
| C3 | **Sleep-score donut → horizontal stacked LCARS bar.** Donuts are circles; circles aren't LCARS grammar. | Geordi #1, Wesley cut | §4.6 |
| C4 | **Semicircular fitness gauges → Langford horizontal gauges.** Same shape rule. | Geordi #2 | §3.2.2 |
| C5 | **Hypnogram colors revised**: `awake = warning amber` (not alert red — 1–3 awake periods/night is normal); `rem = violet-creme`; `core = nominal cyan`; `deep = nominal cyan bold-stroke`. | Geordi #3 | §4.2 |
| C6 | **BP-range chart color tokens locked**: systolic = `--lcars-butterscotch`, diastolic = `--lcars-ice`, avg-tick = `--lcars-space-white`, AHA thresholds = `--lcars-gray` @ 50%. Drop "green-ish/blue-ish". | Geordi #4 | §4.4 |
| C7 | **ECG history list — DROPPED in v5.14 spec.** Worf S0-3: the lazy `recorder/history` fetch contradicts the data-contract's `recorder.exclude` privacy recommendation. ECG renders **current reading only**; history list deferred to a future captain-ratified opt-in (§7.7 ECG History Opt-In policy below). | Worf S0-3, Data CR-3 | §4.1, handoff §2.1 |
| C8 | **HR-notifications row folded into ECG strip footer.** Eliminates one BIOMEDICAL row, lets the chart breathe. New ECG footer line: `NOTIFICATIONS · 2 HIGH · 1 LOW · 0 IRREG (7 DAYS)`. | Geordi (cut) | §3.3 row 2 → merged into row 1; §4.1 |
| C9 | **Workout-route polyline source switched to Google-encoded polyline string (required, not alternative).** Worf S0-2: raw `route[]` array on `hass.states` is open-DOM-readable by every Lovelace card. Encoded string is harder to casually scrape and decodes inside the closed shadow root. Lat/lng disclosure added to §7 W2. | Worf S0-2 | §4.5; handoff §2.4 |
| C10 | **§7 expanded**: new W6 (cache lifecycle), §7.7 (consent.ecg full lifecycle contract), §7.8 (input hygiene + attribute allowlist), §7.9 (`[data-medical="phi"]` on shadow host + amend parent §7.4). | Worf S0-1/S0-4/S0-5, W6 | §7 entire |
| C11 | **Wesley wins added**: medications tile in SUMMARY at-a-glance (slot 6), `rest_mode` → status pill modifier `RECOVERY MODE · DAY N` (amber), cross-source priority resolver with superscript source chip on each tile. | Wesley #1, #2, #6 | §3.1.1, §5 |
| C12 | **Bundle-size + schema-probe gates added** (≤40 KB total across six new primitives; HAI exposes `lcars_schema_version: "1"` attribute). | Data CR-8, CR-9 | §9 DoD; handoff §5 |
| C13 | **Empty-state strings standardized** to `{KIND} · NO DATA`. Drop "ON FILE", "LAST NIGHT", "PENDING". | Geordi #8 | §4 throughout |
| C14 | **Touch targets + aria-labels** added per primitive (≥44 px row height; `role`/`aria-label` table). | Geordi #5, #6 | §4 throughout |
| C15 | **New primitives co-located with `<lcars-sparkline>` at `js/src/`** (no new `lcars-shared/` subdir — declined to keep import paths simple). Sparkline relocation deferred to a future arch refactor train. | Data CR-7 | §4 preamble; plan story task lists |

### Crew-bessed-as-is (no change required)

- Domain split SUMMARY / ANATOMICAL / BIOMEDICAL (Riker + Geordi + Worf concur)
- Multi-card grid view untouched (scope discipline)
- Last-sync row in SUMMARY (operator diagnostic value)
- Additive-attribute philosophy in HAI handoff (Riker, Data both bless)
- Privacy posture **direction** (Worf — conditional bless once S0 items addressed)

### Crew-rejected

- **Donut chart** (Geordi #1, Wesley cut): replaced per C3
- **Semicircular gauges** (Geordi #2): replaced per C4
- **ECG history list lazy-fetch from recorder** (Worf S0-3): dropped per C7 (revisitable opt-in)
- **Raw `route[]` array on `hass.states`** (Worf S0-2): replaced with encoded polyline per C9
- **`<lcars-trend-arrow>` shared chip** (Data CR-10): YAGNI; existing tile arrow chip sufficient
- **R-peak audio cue on `▶ PLAY ECG`** (Wesley wow moment vs Geordi audio gate): rejected — Sickbay `audio_mode: medical` deliberately suppresses transient cues
- **`lcars-shared/` subdir as proposed in v1** (Data CR-7): declined — co-locate with existing primitives

---

## 0. Why this exists

The shipped Sickbay focus mode (v5.8.0) groups *all* vital tiles under `SUMMARY`, mirrors the front silhouette into `ANATOMICAL`, and renders a decorative ECG strip + HR-alerts composite under `BIOMEDICAL`. That structure was correct when the only data sources were Withings (14 entities) and Oura (62 entities). With **Health Auto Export / Health Auto Import (HAI)** now exposing 60+ Apple Health metrics — including ECG voltage samples, sleep stages, workout HR series, wrist temperature, blood pressure events, mobility (walking asymmetry / speed / step length), and heart-rate notifications — the SUMMARY tab is overloaded and the BIOMEDICAL/ANATOMICAL tabs are under-utilized.

This addendum reorganizes the three focus-mode tabs by **clinical domain**, replaces decorative placeholders with real LCARS-grammar visualizations inspired by the Apple Health, Withings Health Mate, and Oura reference apps (see §6 Reference Inspiration), and reserves a new optional fourth tab `SLEEP` for households where Oura/HAI sleep data is rich enough to deserve its own surface.

> **Aesthetic non-negotiable** (Geordi gate): every chart in this spec renders in **pure LCARS grammar** — pill-shaped frames, monospaced numeric callouts, semantic color tokens (`--lcars-color-nominal/warning/alert`), no skeuomorphism, no gradients except the existing `--lcars-thermal-bloom`, no rounded sparkline shadows, no app-store iconography. The Apple/Withings/Oura screenshots are inspiration for **information density and layout**, not for visual styling.

---

## 1. Goals

1. **Re-domain** the three existing focus tabs so each answers a single clinical question:
   - **SUMMARY** → "How is this person, at a glance?"
   - **ANATOMICAL** → "What is this person *made of*?" (body composition, segmental mass, gait/mobility)
   - **BIOMEDICAL** → "What is this person's *cardiac* and *autonomic* state?" (ECG, HR series, HRV, BP trend, last workout HR zones)
2. Add **six new LCARS-grammar visual primitives** (§4) — each one a re-skin of a screen we already saw in the reference apps:
   - `<lcars-ecg-strip>` (Apple ECG measurement screen)
   - `<lcars-hypnogram>` (Apple Sleep stages, Oura sleep hypnogram)
   - `<lcars-hr-zones>` (Withings HR-zones bars)
   - `<lcars-bp-range>` (Withings monthly BP min/max/avg chart)
   - `<lcars-workout-route>` (Withings/Apple workout map+route)
   - `<lcars-sleep-score-donut>` (Apple Sleep Score contributor donut)
3. **Reserve** a fourth optional tab `SLEEP` behind a `dashboard_options.sickbay_sleep_tab: true` flag — default off, opt-in for users with rich sleep data. When off, sleep visuals live in BIOMEDICAL (`<lcars-hypnogram>` below the ECG strip) and SUMMARY (sleep-score tile).
4. **No new entity contracts** required for ship — every new visual degrades gracefully to a single-line summary when the underlying samples aren't available. The §3 entity coverage table calls out which visuals need plug-in cooperation (handoff lives in [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md)).
5. **Zero regressions** to the SHIPPED Biofunction Card grid view, the threshold engine (§5.6 of parent), the PHI redaction hook (§7.4 of parent), or the audio grammar.

## 2. Non-Goals

- Not changing the grid view (multi-card overview). The redesign affects **focus mode only**.
- Not changing person↔source binding mechanics. The [profile binding editor](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md) is the canonical contract — this spec consumes it.
- Not introducing real-time push. Existing 30 s render cadence holds.
- Not introducing a separate dashboard for sleep — the optional `SLEEP` tab lives inside Sickbay focus mode.
- Not adding any "edit threshold" affordance to the tabs. Read-only stays read-only.
- Not displaying GPS coordinates as text. Workout routes render as normalized SVG polylines; lat/lng never appear on the screen (Worf gate W2).

---

## 3. Tab content reorganization

The status pill, decorative numeric scroll columns, and three tab pills in Zone A of the header (parent spec §5.1) are unchanged. What changes is **what each tab renders below the header**.

### 3.1 SUMMARY — "How is this person, at a glance?"

**Layout** (full-width focus mode, top-to-bottom):

| Row | Content | Width | Source |
|---|---|---|---|
| 1 | Existing anatomical silhouette + anchor callouts | full | parent §5.2 unchanged |
| 2 | **At-a-glance tile strip** — 6 large tiles in a single row | full | new — see §3.1.1 |
| 3 | **7-day activity sparkline strip** — steps · active energy · exercise minutes, three small `<lcars-sparkline>` side-by-side with goal-line if available | full | existing kinds, new layout |
| 4 | **Last sync row** — `LAST SYNC · 4m AGO · 3 SOURCES (WITHINGS · OURA · APPLE HEALTH)` — single-line LCARS footer pill | full | new — see §3.1.2 |

Body-composition tiles (`weight`, `body_fat_pct`, `muscle_mass`, `bone_mass`, `lean_mass`, `hydration`, `visceral_fat`, `bmi`) **move out of SUMMARY** into ANATOMICAL. Cardiac time-series tiles (`hrv`, `hrv_balance`, `cardiovascular_age`, `vo2_max`, `cardio_recovery`) **move into BIOMEDICAL**. The current 16-tile dump becomes 6 + 3 sparklines, and the silhouette gets to breathe.

#### 3.1.1 At-a-glance tile strip (6 tiles, shrink-to-fit per Q-D)

| Slot | Kind(s) | Display when present | Empty state |
|---|---|---|---|
| 1 | `readiness` (Oura composite) **or** `body_battery` (Garmin) **or** computed from sleep_score + recovery_score | `READINESS · 87/100` + 7-day spark | hide tile, slide remaining left |
| 2 | `sleep_score` | `SLEEP · 78/100 · 7H 14M` (score + duration on same tile) | `SLEEP · —` |
| 3 | `stress_resilience` (Oura enum) **or** `stress_day_summary` enum | `STRESS · ADEQUATE` (color by enum band) | hide tile |
| 4 | `steps` | `STEPS · 8,431 / 10K` + ring-progress LCARS pill | hide tile |
| 5 | `active_minutes` | `ACTIVE · 42 MIN` | hide tile |
| 6 | `medications` (HAI `medication_last_scheduled` + `_last_status`) **or** `last_workout` composite | `MEDS · ATORVASTATIN · TAKEN 07:14` (or `MEDS · OVERDUE 2H` in `--lcars-color-warning`); falls back to `WORKOUT · RUN · 32M · 4D AGO` when no medication data | hide tile |

Tiles use the existing `_renderTile` plumbing — only the *order*, *count*, and *gating* change. **Wesley #1 added**: the medications slot prioritizes HAI medications data when present (the entity inventory shipped it but the v1 spec didn't surface it) — Sickbay is literally named for this kind of clinical signal. **Shrink-to-fit** (Q-D ratified): tiles with no data hide; remaining tiles flow left. No `—` padding.

Below 720 px viewport, wrap to 2–3 rows via `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`.

#### 3.1.2 Last sync row

A single LCARS pill at the bottom of SUMMARY: `LAST SYNC · {max_freshness} · {N} SOURCES ({comma_list})`. `max_freshness` = age of the most-recent sample across all bound entities for this profile. `comma_list` = platforms that produced at least one rendered value. Implements Wesley's X5 ("ambient diagnostic without opening logs"). Status pill in header still rules; this row is supplemental.

---

### 3.2 ANATOMICAL — "What is this person *made of*?"

**Layout** (full-width focus mode, top-to-bottom):

| Row | Content | Width | Source |
|---|---|---|---|
| 1 | **ANTERIOR pane** (existing silhouette + anchor callouts, callout set restricted to body-composition kinds) + **POSTERIOR placeholder** (unchanged, still "SCAN MODE PENDING — 6.0") | full (split 50/50) | parent §5.5 — anatomical, restricted callouts |
| 2 | **Body composition strip** — 4 tiles in a row: `WEIGHT` (composite), `BODY FAT %`, `LEAN MASS`, `HYDRATION` | full | existing kinds, new layout |
| 3 | **Segmental composition table** — Withings per-segment muscle/fat (when enabled) rendered as a 5-row × 3-col LCARS table: `SEGMENT · MUSCLE · FAT` for `torso / left_arm / right_arm / left_leg / right_leg` | full | new — see §3.2.1 |
| 4 | **Mobility & gait strip** — 4 tiles: `WALK SPEED` (m/s), `STEP LENGTH` (cm), `ASYMMETRY` (%), `DOUBLE SUPPORT` (%) — all HAI mobility kinds | full | existing `mobility` composite re-laid as 4 tiles |
| 5 | **Fitness gauge row** — 3 LCARS gauges: `VO2 MAX` (band: poor/fair/good/excellent by age/sex), `6-MIN WALK` (m), `STAIR SPEED` (m/s) | full | new — see §3.2.2 |

Cardiac and sleep kinds **do not appear** in ANATOMICAL.

#### 3.2.1 Segmental composition table

```
┌──────────┬──────────┬──────────┐
│ SEGMENT  │ MUSCLE   │ FAT      │
├──────────┼──────────┼──────────┤
│ TORSO    │ 32.4 kg  │ 8.1 kg   │
│ LEFT ARM │  4.7 kg  │ 0.9 kg   │
│ RIGHT ARM│  4.9 kg  │ 0.9 kg   │
│ LEFT LEG │ 11.2 kg  │ 2.5 kg   │
│ RIGHT LEG│ 11.4 kg  │ 2.5 kg   │
└──────────┴──────────┴──────────┘
```

Rendered with monospace numeric column, right-aligned values, LCARS divider rules. If a segment is missing (most Withings users only have `torso` enabled by default), render `—`. If **all** segments are missing (no segmental scale), suppress the entire row 3 and let row 4 slide up. Implements parent spec §4 deferred items 5-7 (lean_mass / fat_mass / fat_ratio segmental).

#### 3.2.2 Fitness gauge row (revised per crew C4 — Langford horizontal gauges)

Three small **horizontal LCARS gauges in the Langford pattern** (already blessed for Cetacean Ops): each gauge is a horizontal range bar with a needle marker indicating the current value within a banded scale. **Semicircular arcs rejected per Geordi #2** — same shape rule as the donut (no circles in LCARS).

- `VO2 MAX` band scale: `POOR / FAIR / GOOD / EXCELLENT` keyed on `person.age` + `person.sex` from ACSM tables.
- `6-MIN WALK` (m): single linear scale 0–800 m, NOMINAL band by age.
- `STAIR SPEED` (m/s): single linear scale 0–1.5 m/s, NOMINAL band by age.

6-Min Walk and Stair Speed are HAI-only kinds; suppress the gauge if not present. Each gauge has `NOMINAL`/`ELEVATED`/`ALERT` status derivation that contributes to the header status pill via the existing reducer.

---

### 3.3 BIOMEDICAL — "Cardiac and autonomic state"

**Layout** (full-width focus mode, top-to-bottom — revised per crew C8 to fold HR-notifications into ECG strip footer, eliminating a row):

| Row | Content | Width | Source |
|---|---|---|---|
| 1 | **`<lcars-ecg-strip>`** — full-width LCARS ECG card: classification banner above the waveform, avg BPM + duration + last-taken + 7-day HR-notifications count (`NOTIFICATIONS · 2 HIGH · 1 LOW · 0 IRREG (7D)`) in footer | full | new primitive — see §4.1 |
| 2 | **Cardiac vitals strip** — 6 tiles: `RESTING HR`, `HRV` (ms), `HRV BAL` (Oura /100), `VO2 MAX`, `CV AGE` (Oura), `CARDIO RECOVERY` (HAI) | full | existing kinds, new home |
| 3 | **`<lcars-bp-range>`** — 30-day blood-pressure min/max/avg chart, sys + dia overlaid as two range bars per day with average tick. Average pills below: `SYS AVG · 118 mmHg · DIA AVG · 76 mmHg · MAX SYS · 132/82 · MAX DIA · 124/89` | full | new primitive — see §4.4 |
| 4 | **`<lcars-workout-route>` + `<lcars-hr-zones>`** — two-up: left pane = last-workout GPS route as normalized SVG polyline over a dark LCARS grid (no map tiles, no lat/lng); right pane = HR-zone horizontal bars with duration in each zone. Below: `LAST WORKOUT · RUN · 42 MIN · 4.2 KM · 397 KCAL · AVG 142 BPM · MAX 178 BPM` | full (split 50/50) | new primitives — see §4.3, §4.5 |
| 5 | **`<lcars-hypnogram>`** — last-night sleep stages (Awake/REM/Core/Deep). **Default placement** when `dashboard_options.sickbay_sleep_tab: false` (the shipped default). **Header pill suppresses `night_start`/`night_end` timestamps** when rendered here (Worf S2-10) — totals only. Timestamps appear only in the SLEEP tab placement (§3.4 row 1). | full | new primitive — see §4.2 |

Row 4's left pane gracefully degrades: if no GPS route attribute is present (every source today; arrives with HAI plug-in §2.4), it hides and the right pane (HR zones) expands to full width. HR-zones itself hides per Q-C if `person.birthdate` is absent.

---

### 3.4 SLEEP — optional 4th tab (gated by `dashboard_options.sickbay_sleep_tab`)

Default OFF. When ON, the tab strip in Zone A renders four pills (SUMMARY / ANATOMICAL / BIOMEDICAL / SLEEP), the hypnogram in §3.3 row 5 is suppressed (relocated here), and the SLEEP tab renders:

| Row | Content | Source |
|---|---|---|
| 1 | `<lcars-hypnogram>` — full-width, last-night stages, **with `night_start`/`night_end` timestamps in header pill** (timestamps only ever appear in this placement) | new primitive §4.2 |
| 2 | `<lcars-sleep-score-bar>` — horizontal stacked LCARS bar with one pill-segment per contributor proportional to `value/max`, score numeric above the bar, contributor breakdown table to the right. Vocabulary auto-detected: Oura (Duration / Efficiency / Latency / Regularity / Restfulness) vs HAI (Duration / Bedtime / Interruptions). **Donut chart was rejected per crew C3 — circles are not LCARS grammar.** | new primitive §4.6 (revised) |
| 3 | Sleep-detail tiles strip — `EFFICIENCY %`, `LATENCY MIN`, `REGULARITY /100`, `RESTFULNESS /100`, `WAKEUPS`, `BREATHING DISTURBANCE INDEX` | existing kinds |
| 4 | Wrist-temperature trend — `<lcars-sparkline>` with center reference line at baseline, last-7-night deviation values. Source: HAI `apple_sleeping_wrist_temperature_latest` OR Oura `temperature_deviation` | existing |
| 5 | Bedtime regularity bar — 14-night bedtime vs. average bedtime (single LCARS horizontal bar chart, ±2h window). Source: Oura `bedtime_start` / `optimal_bedtime_start` OR HAI `sleep_analysis` start timestamps | new — see §4.7 (deferred to v5.15) |

Rows 4 and 5 are progressive — missing data → suppress row, others slide up.

---

## 4. New visual primitives

All new primitives:
- Live at `custom_components/lcars_dashboard/js/src/` co-located with the existing `<lcars-sparkline>` (per crew C15 — no `lcars-shared/` subdir until existing shared primitives are migrated in a separate refactor train)
- Inherit `<lcars-shared-element>` base; the **shadow host** carries `data-medical="phi"` AND `.lcars-medical-redactable` so the screenshot-redaction macro catches the entire component (per crew C10 + W6 below). Every numeric `<text>`/`<span>` **inside** the shadow tree also carries `.lcars-medical-redactable`. A snapshot test enforces this — see §9 DoD.
- Accept a single `vitals` object via Lit property, never reach into `hass` directly
- **Input hygiene** (per §7.8): each component declares an explicit allowlist of attributes it reads from `hass.states`. Unknown attributes are ignored. All string interpolation uses Lit `${}` safe-binding. No `unsafeHTML`, no `innerHTML`, no `document.write`. A unit-test fixture with `source: "<script>alert(1)</script>"` device name must render harmless.
- Degrade to a single LCARS pill `{KIND} · NO DATA` when the input is empty/null (per crew C13 — standardized empty-state strings; no "ON FILE", no "PENDING", no "LAST NIGHT")
- Render in **closed shadow root** (parent spec §7.4)
- **Cache lifecycle** (per §7.9 W6): on any of (a) `personFileId` prop change, (b) `consent.*` change, (c) `binding_unbind` WS event, (d) `medical_profiles.yaml` reload — synchronously call `_disposeCaches()` in `updated(changedProps)` **before** rendering new data
- **Aria + role**: every primitive carries the role and aria-label template per crew C14 (table in §4.8)
- **Forbidden**: external assets, foreignObject, scripts, animations on `transform` (LCARS spec — only opacity transitions allowed for status changes)
- **Bundle-size budget** (per crew C12): each primitive ≤ 12 KB minified+gzip; total across all six ≤ 40 KB. Measured before and after each Story.

### 4.1 `<lcars-ecg-strip>` (revised per crew C7 + C8)

The LCARS analog of the Apple Health "Electrocardiograms (ECG)" measurement screen. Current-reading only (history list dropped per Worf S0-3 — see §7.7 ECG History Opt-In policy for the future captain-ratified revisit). HR-notifications composite folded into the footer per Geordi (saves a BIOMEDICAL row).

**Props**:

```ts
{
  // Single current reading:
  waveform: Float32Array | null,    // microvolts, length = samplingHz * durationS
  classification: 'sinus' | 'afib' | 'high' | 'low' | 'inconclusive' | null,
  avgBpm: number,
  durationS: number,
  samplingHz: number,
  lastTakenIso: string,
  source: string | null,             // sanitized device name, e.g. "Apple Watch Series 10"

  // HR-notifications composite (folded into footer per C8):
  hrAlerts: {
    high7d: number,
    low7d: number,
    irreg7d: number,
    lastEventIso: string | null,
    lastEventKind: 'high' | 'low' | 'irreg' | null,
  } | null,

  // Privacy gates:
  consent: boolean,                  // per-profile consent.ecg (§7.7); when false, waveform suppressed
  schemaVersion: string | null,      // HAI `lcars_schema_version` attribute (§7.8 + handoff §5)
}
```

**Render** (~180 px tall total, no history list):

1. **Classification banner** (full-width LCARS pill, ~32 px tall): color by class — `sinus` = `--lcars-color-nominal` (cyan), `afib` = `--lcars-color-alert` (red), `high`/`low` = `--lcars-color-warning` (amber), `inconclusive` = `--lcars-color-muted` (grey). Text: `ECG · NORMAL SINUS RHYTHM · 78 BPM · 30 SEC · 8H AGO`. Monospace numerics (`font-variant-numeric: tabular-nums`), uppercase classification.

2. **Waveform card** (~120 px tall, full-width LCARS-framed rectangle):
   - **Backdrop**: faint LCARS dot-grid at 5 mm (vertical) × 200 ms (horizontal) intervals — clinical-grid proportions in LCARS colors. `stroke="var(--lcars-color-grid, rgba(153,204,255,0.12))"`, `stroke-width="0.5"`.
   - **Waveform**: single `<svg><polyline>` over the voltage samples. Auto-scaled so peak-to-peak fills ~80% of card height — same auto-zoom Apple does. `stroke="var(--lcars-data-accent, #99cc99)"`, `stroke-width="2"`, `stroke-linejoin="round"`, `fill="none"`.
   - **No anti-aliasing tricks, no glow, no shadow** — just the polyline. The LCARS frame does the visual work.
   - **Width**: always `viewBox="0 0 600 120" preserveAspectRatio="none"`. Sample stride auto-adjusted: if `samples.length > 1200` (e.g. 30 s × 512 Hz = 15,360), downsample with `LTTB` (Largest Triangle Three Buckets) to 1200 points — preserves visual peaks better than every-Nth decimation. If `samples.length ≤ 600`, render every sample.
   - **Time-axis ticks**: small LCARS tick marks at -1 s, 0 s, +1 s along the bottom edge.

3. **Footer pill row** (~28 px tall, full-width LCARS bar — **single line, two segments**):
   - Segment A (status): `STATUS · NORMAL SINUS RHYTHM · 78 BPM · 30 SEC · {source_or_blank} · 2026-05-23 08:17`. The `source` is allowlist-filtered (§7.8) — only Apple-emitted device strings pass; anything containing `<`, `>`, `"`, `&` is replaced with `UNKNOWN DEVICE`.
   - Segment B (notifications — folded from old row 2): `NOTIFICATIONS · 2 HIGH · 1 LOW · 0 IRREG (7D)`. Counts come from `hrAlerts` prop. If `hrAlerts === null`, segment hides.

4. **Expand affordance** (right end of footer): `▶ PLAY ECG` button. When pressed, an inset vertical LCARS cursor sweeps left → right across the waveform at 1× real-time (takes `durationS` seconds). Decorative only — **no audio** (Geordi gate; Sickbay `audio_mode: medical` deliberately suppresses transient cues). Opacity-only animation, no transform animation.

**Empty state**: `ECG · NO DATA` (standardized per C13). Component collapses to ~32 px so the BIOMEDICAL tab layout flows.

**Consent-suppressed state** (`consent: false`): banner + footer render normally (classification + BPM + duration + sanitized source + timestamp + notifications). Waveform card is replaced with: `WAVEFORM CONSENT NOT GIVEN · ENABLE IN PROFILE SETTINGS`. Non-negotiable per Worf W4.

**Schema-mismatch state** (`schemaVersion` absent or not `"1"`): waveform replaced with `ECG · WAVEFORM UNAVAILABLE`. Renderer treats the upstream contract as unverified (per crew C12 + §7.8). Banner + footer continue to render from the simpler classification/BPM sensors which carry no schema risk.

**Cache lifecycle** (W6, §7.9): `_polylinePointsCache` keyed on `(sampleArrayReference, viewBox.width, targetBucketCount, samplingHz)`. **Not** keyed on theme color (color is CSS-var application, not geometry — per Data CR-5). Cache is cleared in `_disposeCaches()` on any W6 trigger.

**Performance budget**:
- LTTB downsampling to 1200 points runs in O(N) inside a single `requestAnimationFrame`. For 30 s at 512 Hz (15,360 samples) this is ~3 ms in V8 — well inside frame budget.
- The `<polyline>` `points` attribute is computed once per reading and cached. Sparkline re-renders only when the underlying reading changes — not on every parent re-render.

**Data contract**: voltage array via `voltage_uv` attribute on `sensor.health_auto_import_heart_ecg_voltage_measurements` per [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md) §2.1. Until the HAI plug-in ships the attribute, the component renders banner + footer + the `ECG · WAVEFORM UNAVAILABLE` pill in the waveform slot. **The history list previously specified in this section has been removed** — see §7.7 below for the future opt-in policy.

### 4.2 `<lcars-hypnogram>` (revised per crew C5 + Q-B/S2-10)

**Props**: `{ segments: Array<{ start: Date, end: Date, stage: 'awake' | 'rem' | 'core' | 'deep' }>, totalSleepMin: number, timeInBedMin: number, suppressTimestamps: boolean }`

**Render**:
- 4 horizontal LCARS rows (stacked top-to-bottom: AWAKE / REM / CORE / DEEP), each ~24 px tall. Each `segment` paints a rectangle in its row covering `start..end` of the night's timeline (x-axis: night-start → night-end).
- Y-axis: stage labels left rail. X-axis: clock-tick rail at the bottom (suppressed when `suppressTimestamps: true` — see Q-B/S2-10).
- **Color per stage (revised per Geordi #3)**: `awake = --lcars-color-warning` (amber — 1–3 brief awake periods/night is normal sleep architecture; not clinically alarming, so not red); `rem = --lcars-violet-creme`; `core = --lcars-color-nominal` (cyan); `deep = --lcars-color-nominal` (cyan, **bolder stroke weight**).
- **Header pill**: `SLEEP · 6H 19M ASLEEP · 7H 57M IN BED · 79% EFFICIENCY`. When `suppressTimestamps: true` (BIOMEDICAL placement per Worf S2-10), omit any `start` / `end` clock-time mentions; only durations + efficiency appear.
- **Keyboard navigation** (per Geordi accessibility add): `tabindex="0"`; Left/Right Arrow cycles through segments; focused segment gets a 2 px `--lcars-ice` focus ring; aria-live announces `Deep sleep, 23 minutes, 11:43 PM to 12:06 AM` (or duration-only in suppress mode).

**Empty state**: `SLEEP · NO DATA` (standardized per C13).

**Data contract**: Oura exposes per-stage durations as totals (`deep_sleep_duration`, `rem_sleep_duration`, etc.). The **per-segment array** requires HAI plug-in support — see [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md) §2.2. Degraded fallback when only totals exist: render a single stacked horizontal bar (deep + rem + core + awake widths proportional to durations) — no timestamps possible in this mode.

### 4.3 `<lcars-hr-zones>` (revised per Q-C — birthdate-required)

**Props**: `{ avgHr: number, maxHr: number, durationS: number, samples: Array<{tS: number, bpm: number}> | null, personMaxHrEst: number | null }`

**Render**:
- 4 horizontal LCARS bars stacked: `PEAK · INTENSE · MODERATE · LIGHT`. Width of each bar = time spent in that zone. Zone thresholds derived from `personMaxHrEst` = `220 - age` from `person.birthdate`.
  - `PEAK` ≥ 90% maxHr
  - `INTENSE` 80–89%
  - `MODERATE` 70–79%
  - `LIGHT` 50–69%
  - (sub-50%: not shown, contributes to "REST" remainder not displayed)
- If `samples` array is provided, compute durations from it; if not, use the simpler `avgHr` → derive a single-zone estimate (degraded mode shows only the dominant zone with `~` prefix).
- Right rail: numeric durations per zone (`PEAK · 1 MIN 13 SEC`, etc.).

**Empty / unavailable states** (standardized per C13):
- No workout data: `WORKOUT HR · NO DATA`
- `person.birthdate` absent (Q-C ratified resolution — no silent default to age 40): `WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES`. Component hides the bars and renders only the pill. Workout-route pane (§4.5) in BIOMEDICAL row 4 left expands to full width when this happens.

**Data contract**: `avgHr`/`maxHr`/`durationS` already exist as HAI sensors. The **`samples` array is requested HAI addition** for accurate zone math — see [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md) §2.3.

### 4.4 `<lcars-bp-range>` (revised per crew C6 — color tokens locked)

**Props**: `{ days: Array<{date: string, sysMin: number, sysMax: number, sysAvg: number, diaMin: number, diaMax: number, diaAvg: number}>, dataRedactPriority: 'high' }`

**Render**:
- X-axis: 30 day-buckets (oldest → newest, left → right).
- Y-axis: mmHg from 60 (bottom) to 180 (top), with reference lines at 80, 90, 120, 130, 140 (AHA thresholds).
- Each day renders **two vertical range bars** side-by-side. **Color tokens (revised per Geordi #4)**:
  - Systolic range bar: `--lcars-butterscotch` (warm, higher pressure)
  - Diastolic range bar: `--lcars-ice` (cool, lower pressure)
  - Average tick mark: `--lcars-space-white`
  - AHA threshold lines: `--lcars-gray` @ 50% opacity
  - **Drop**: any ad-hoc "green-ish/blue-ish" language.
- Bar spans min→max; horizontal tick marks the avg.
- Header pill: `BP · SYS AVG 118 · DIA AVG 76 · 30 DAYS`. Below chart: `SYS MAX 132/82 · DIA MAX 124/89 · SYS MIN 91/65 · DIA MIN 88/52`.
- **Bulk-redaction flag**: shadow host carries `data-redact-priority="high"` (per Worf W3) so the screenshot-redaction macro can blackout the entire 30-day surface in one click, not per-value.

**Empty state**: `BP · NO DATA` (standardized per C13).

**Data contract**: HA `recorder` long-term statistics provide `min/max/mean` per hour for any sensor with state class `measurement`. The component calls `recorder/statistics_during_period` (via the new shared `lcars-recorder-stats.js` batcher per Data CR-4) for `sensor.withings_systolic_blood_pressure` and `sensor.withings_diastolic_blood_pressure`, aggregates to per-day, and renders. **No plug-in handoff needed** — pure HA-side query. Same approach works for `sensor.health_auto_import_health_metrics_blood_pressure_latest` if the user supplies BP via Apple Health.

**Cache lifecycle** (W6, §7.9): 30-day result cached in `sessionStorage` with 5 min TTL, key = `(statistic_id, period=day, window=30d)`. Cleared on every W6 trigger.

### 4.5 `<lcars-workout-route>` (revised per crew C9 + Worf S0-2)

**Props**: `{ encodedPolyline: string | null, distanceM: number, durationS: number, startedIso: string, endedIso: string }`

**Critical**: the component accepts a **Google-encoded polyline string** (`encodedPolyline`), NOT a raw `{lat, lon}[]` array. This is non-negotiable per Worf S0-2 (raw arrays on `hass.states` are open-DOM-readable by every Lovelace card; encoded strings are harder to casually scrape, and the LCARS renderer decodes them once inside the closed shadow root and discards). The HAI handoff §2.4 promotes `route_compressed` from "alternative" to **required**.

**Render**:
- Decode the encoded polyline to `{lat, lon}[]` inside the closed shadow root (using a 30-line in-house implementation of [Google polyline algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) — no external dependency).
- Compute bounding box from decoded points. Normalize lat/lon to `viewBox="0 0 200 200"` (square, preserve aspect via padding).
- Draw the route as `<polyline>` over a faint LCARS grid backdrop (`stroke="var(--lcars-cyan)"`, `stroke-width="2"`).
- Mark start with a hollow LCARS circle, end with a filled triangle. **No actual lat/lng text** anywhere — Worf W2.
- Above route: route stats pill `4.2 KM · 42 MIN · 6:00 /KM PACE`. Below: `START 14:43 · END 15:25`.

**Empty state**: `WORKOUT · NO DATA` (standardized per C13) — let HR-zones pane in §3.3 row 4 expand to full width.

**Trust-boundary disclosure** (per Worf S0-2 expanded W2): the encoded polyline still arrives at the LCARS renderer through `hass.states` (one trust boundary). The encoded form is a deliberate obfuscation, not a cryptographic protection. The PHI disclosure banner in setup.md must explicitly state: *"Workout route data crosses watchOS → Health Auto Export iOS app → Home Assistant `health_auto_import` integration → LCARS renderer. The encoded polyline is harder to casually scrape than a raw lat/lng array but is still visible to any user with access to the HA WebSocket API or `hass.states`. To minimize exposure: (a) mark the workout entity `homeassistant.hidden: true` in panel-config so it does not appear in entity pickers; (b) request the HAI plug-in to never log the polyline at info-level."*

**Data contract**: HAI plug-in does not currently expose workout polylines. **Requested addition (encoded form required)** — see [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md) §2.4.

### 4.6 `<lcars-sleep-score-bar>` (revised per crew C3 — donut rejected, replaced with horizontal stacked bar)

**Donut rejected**: circles are not LCARS grammar (Geordi #1, Wesley cut concur). Replaced with a horizontal stacked LCARS progress bar — same information density, LCARS-compliant shape, half the SVG math.

**Props**: `{ score: number, contributors: Record<string, {value: number, max: number, label: string}>, role: 'meter' }`

**Render**:
- **Score numeric** (top): big numeric `${score}` + `/100` suffix in LCARS heading font. Above-bar pill: `SLEEP SCORE · {score} · {qualitative_band}` where band = `OK` (<70) / `GOOD` (70–84) / `EXCELLENT` (≥85).
- **Horizontal stacked bar** (middle, full-width, ~32 px tall): one LCARS pill-segment per contributor, width proportional to `value/max`. Total bar width represents 100% achievement; segments sum left-to-right. Each segment color-coded by contributor:
  - Oura vocabulary: `EFFICIENCY` (cyan), `LATENCY` (ice), `REGULARITY` (violet-creme), `RESTFULNESS` (butterscotch), `DURATION` (gold)
  - HAI vocabulary: `DURATION` (cyan), `BEDTIME` (ice), `INTERRUPTIONS` (butterscotch)
  - Empty (no value): segment renders at LCARS-gray @ 30% opacity at minimum-width (preserves layout legibility).
- **Contributor breakdown table** (right rail or below on narrow viewports): one row per contributor, `LABEL · VALUE / MAX` in monospace. Tabular-nums for column alignment.
- **Aria**: role=`meter`, aria-label per §4.8 template.

**Empty state**: hide the bar + table, render single LCARS pill `SLEEP SCORE · {score} / 100` or `SLEEP SCORE · NO DATA` (per C13).

**Data contract**: contributors come straight from Oura (`sleep_efficiency`, `sleep_latency`, `sleep_regularity_score`, `restfulness`, `total_sleep_duration` against goal) or HAI (Duration / Bedtime / Interruptions). The renderer adapts to whichever vocabulary is present.

### 4.7 Bedtime regularity bar — deferred to v5.15

Spec'd here for completeness but not shipped in v5.14. Bar chart of last-14-night actual bedtime vs. average bedtime, with the average drawn as a vertical reference line. Single horizontal track, dot per night colored by deviation band. Source data straightforward (Oura `bedtime_start`, HAI sleep-analysis start timestamps) — held back only because §3.4 row 1+2 already give the captain enough sleep signal.

### 4.8 Accessibility contract (per crew C14 — Geordi #6)

Every new primitive carries:

| Primitive | `role` | `aria-label` template |
|---|---|---|
| `<lcars-ecg-strip>` | `figure` | `ECG recording: ${classification}, ${avgBpm} BPM, recorded ${friendlyTime}` |
| `<lcars-hypnogram>` | `img` | `Sleep stages: ${totalSleepMin} minutes asleep over ${timeInBedMin} minutes in bed` |
| `<lcars-hr-zones>` | `img` | `Workout heart rate zones: ${durationS/60} minutes total` |
| `<lcars-bp-range>` | `figure` | `Blood pressure trend, last 30 days: systolic average ${sysAvg}, diastolic average ${diaAvg}` |
| `<lcars-workout-route>` | `img` | `Workout route: ${distanceM/1000} kilometers in ${durationS/60} minutes` |
| `<lcars-sleep-score-bar>` | `meter` | `Sleep score: ${score} out of 100` |

Additional rules:
- All interactive elements (ECG history list removed per C7; remaining: `▶ PLAY ECG` button, hypnogram segments) have `min-height: 44 px` and `min-width: 44 px` per WCAG 2.5.8 touch-target rule.
- Hypnogram is keyboard-navigable (Arrow keys; per Geordi accessibility add).
- Empty-state pills use `aria-live="polite"` so screen-reader users hear data-state changes without a refresh.

### 4.9 Cross-source priority resolver (per crew C11 — Wesley #2)

When multiple sources emit the same `vital_kind` for one profile (e.g. Oura `average_heart_rate` + Withings `heart_pulse` + HAI `resting_heart_rate_latest`), the renderer picks one and displays a single tile with a small superscript source chip indicating origin.

Per-kind precedence table lives in `MEDICAL_SOURCE_PRIORITY` in `lcars-medical-utils.js`:

```js
export const MEDICAL_SOURCE_PRIORITY = {
  resting_heart_rate: ['oura', 'health_auto_import', 'withings'],
  heart_rate:         ['oura', 'health_auto_import', 'withings'],
  weight:             ['withings', 'health_auto_import'],
  spo2:               ['health_auto_import', 'oura'],
  blood_pressure:     ['withings', 'health_auto_import'],
  // ... per-kind entries; default = first-discovered
};
```

**Render**: each tile gets a single superscript chip on the value line — `RESTING HR · 58 ᴼ` where the chip is `ᴼ` (Oura), `ᴴ` (HAI), `ᵂ` (Withings). One-character chip keeps the tile from getting wordy. Hover/long-press reveals full source name in a tooltip (also surfaces `source` device attribute when present, per Wesley G3).

---

## 5. Threshold engine — additions

No new `vital_kind` entries; the redesign reorganizes existing kinds and adds visualizations. Threshold table (§5.6 of parent) unchanged.

**Status pill changes**: the existing reducer walks all anchored vitals. The new visualizations don't introduce new anchored vitals — `<lcars-bp-range>` reflects the same `blood_pressure` kind already on the silhouette, `<lcars-hr-zones>` uses `heart_rate` for max-zone classification but doesn't promote workout-bound HR to the header pill (workout-mode HR is *supposed* to be high; status pill stays NOMINAL).

**`RECOVERY MODE` status pill modifier** (per crew C11 — Wesley #6): when `binary_sensor.oura_ring_<profile>_rest_mode` is `on`, the status pill in Zone A renders `RECOVERY MODE · DAY N` in `--lcars-color-warning` (amber) **regardless** of other vital status — preserves the "ship takes care of you" tone (Oura's own recovery-mode classification overrides the default green/amber/red reducer). The day-count is computed from the `rest_mode_start` timestamp. When `rest_mode` returns to `off`, the pill returns to its computed reducer state on the next render. One-line code change; massive clinical signal.

---

## 6. Reference inspiration

Side-by-side mapping from the reference-app screens we examined to the LCARS visualization we're shipping:

| Inspiration source | LCARS-grammar equivalent |
|---|---|
| Apple Health · ECG · 12-lead waveform + classification | `<lcars-ecg-strip>` §4.1 |
| Apple Health · Sleep · day hypnogram (Awake/REM/Core/Deep stacked rows) | `<lcars-hypnogram>` §4.2 |
| Apple Health · Sleep Score · OK 62 donut with 3 contributor arcs | `<lcars-sleep-score-bar>` §4.6 (donut rejected per crew C3 — stacked-bar substitute) |
| Withings Health Mate · Workout HR chart with zone bars | `<lcars-hr-zones>` §4.3 |
| Withings Health Mate · Workout map + speed performance | `<lcars-workout-route>` §4.5 (route only — speed chart deferred) |
| Withings Health Mate · Monthly BP range (sys/dia avg + max + min) | `<lcars-bp-range>` §4.4 |
| Oura · Daytime Stress line chart over 9 AM–12 AM | future v5.15 — kind `stress_level_series`, no primitive yet |
| Oura · Vitals · Sleep · Body Clock · 4-tile summary card | SUMMARY §3.1.1 at-a-glance strip |
| Oura · Heart Rate Variability · "Tags and activities" hint chips | deferred — needs HAI tags support |

Every visualization adheres to: pill-shaped frames, monospaced numerics, semantic color tokens, generous letter-spacing, single-rule dividers, no skeuomorphism, no app-store iconography. The reference apps inform **what to show**, never **how it should look**.

---

## 7. Privacy review (revised v2 — expanded per Worf S0/S1 + W6)

Worf gate checklist for v5.14/v5.15:

| # | Concern | Mitigation |
|---|---|---|
| W1 | New primitives must inherit the existing PHI redaction hook. | (a) Parent §7.4 redaction selector list MUST be amended to include `[data-medical="phi"]` (per Worf S0-1 — this must land **before** Story 1 ships). (b) Every component in §4 sets `data-medical="phi"` AND `.lcars-medical-redactable` on the **shadow host** (open-DOM-visible); every numeric `<text>`/`<span>` **inside** the shadow tree also carries `.lcars-medical-redactable`. (c) Snapshot test walks the rendered tree and fails if a numeric cell lacks the class. |
| W2 | `<lcars-workout-route>` lat/lng on `hass.states` is open-DOM-readable. | The component accepts a **Google-encoded polyline string** (`encodedPolyline` prop), NOT a raw `{lat, lon}[]` array. HAI handoff §2.4 promotes encoded form from "alternative" to **required**. Trust-boundary disclosure surfaced in setup.md and in the binding-editor profile-edit screen (per Worf S0-2). Recommend `homeassistant.hidden: true` on the workout entity. **Closed shadow root protects the rendered SVG, NOT the source `hass.states` attribute** — this is now explicitly documented (the v1 spec implied false closure). |
| W3 | `<lcars-bp-range>` 30-day BP history — wider PHI surface than current single-day tile. | `data-redact-priority="high"` flag so the screenshot-redaction macro fully blackouts this row in one click. No diagnostic templating of source attributes per §7.8. |
| W4 | `<lcars-ecg-strip>` voltage samples — most clinically sensitive surface yet. | (a) Waveform render only fires when `consent.ecg === true` in `medical_profiles.yaml` per-profile; default OFF. (b) When OFF, classification + avg_bpm + duration + notifications **still render**; only the waveform is suppressed with banner `WAVEFORM CONSENT NOT GIVEN · ENABLE IN PROFILE SETTINGS`. (c) HAI plug-in handoff §2.1 explicitly requests no info-level logging of voltage. (d) See §7.7 for full consent-lifecycle contract (per Worf S0-4). (e) **History list dropped per Worf S0-3** — see §7.7 ECG History Opt-In policy for the future captain-ratified revisit. |
| W5 | SLEEP tab adds bedtime regularity — quasi-presence-tracking. | Gated by `dashboard_options.sickbay_sleep_tab` (default OFF). When OFF, no bedtime visualization renders anywhere. Hypnogram in BIOMEDICAL placement **suppresses timestamps** (totals only) per Worf S2-10. |
| **W6** | **Cache and component-state lifecycle on profile-switch / consent-toggle / right-to-erase** (new gate, per crew C10). | Every new primitive MUST dispose all in-memory caches (LTTB-downsampled waveforms, recorder-statistics query results, normalized polyline points, sessionStorage entries keyed on `file_id`) within one render cycle on: (a) `personFileId` prop change, (b) `consent.*` change, (c) `binding_unbind` WS event for active `file_id`, (d) `medical_profiles.yaml` reload event. Verification: unit test asserts `_disposeCaches()` is called and internal cache fields are empty after each trigger. No cached PHI may survive a logical erasure event. |

Worf re-bless required before merge — same gate model as v5.11 binding-editor.

### 7.7 `consent.ecg` lifecycle contract (per Worf S0-4)

Per-profile consent for ECG waveform rendering. The five-point contract:

| Lifecycle event | Behavior |
|---|---|
| **Schema migration** | Existing profiles created pre-v5.14 have no `consent.ecg` field. Default-on-read = `false`. The YAML loader treats missing field as `false` without rewriting the file (preserves user-edited comments). When a profile is next edited in the binding editor, the field is written explicitly. |
| **Config-flow re-add** | If the captain removes + re-adds the dashboard integration, `medical_profiles.yaml` is preserved — `consent.ecg: true` survives. |
| **Profile rebinding** | If a profile is rebinded from one source to another (e.g. Withings → HAI), `consent.ecg` is **reset to false** (privacy-conservative — new data source = new consent decision). The binding editor surfaces a notice: "ECG waveform consent reset due to source rebind." |
| **Mid-render toggle-off** | When the captain flips `consent.ecg: true → false` while the waveform is on screen, Lit reactivity hides the waveform within one render cycle AND `_disposeCaches()` (W6) is called synchronously to clear `_polylinePointsCache`. The LTTB-downsampled waveform is not recoverable from the JS heap after this point. |
| **Right-to-erase cascade** | Wiping a binding triggers the W6 erasure cascade: clears LTTB cache, BP-range sessionStorage cache, `localStorage.lcars_medical_consent.<file_id>`, recorder-statistics result cache, normalized polyline points. Unit-tested. |

**Storage path**: `lcars-dashboard/configs/medical/profiles.yaml`, schema field `profiles.<file_id>.consent.ecg: bool`. **Toggle UI**: a single websocket command (`medical_profiles/update_consent`) mirrored after existing `medical_profiles/*` commands; the binding editor exposes the toggle as a checkbox per-profile. **No YAML hand-edits required.**

**Two-layer consent**: the existing per-browser `localStorage.lcars_medical_consent.<file_id>` boolean (parent spec §7.5) is **preserved unchanged**. The new `consent.ecg` field is an **additional AND-gate** — the waveform renders only when both layers are true. This intentional double-gating (Worf approved) prevents a captain who granted dashboard-level consent on a shared browser from accidentally exposing voltage waveforms to other authorized HA users on the same install.

### 7.7a ECG History Opt-In policy (future revisit — per Worf S0-3 resolution)

The v1 spec proposed an Apple-Health-style ECG history list with lazy-fetched mini-waveforms from `recorder/history`. **Dropped per Worf S0-3**: that design contradicts the data-contract's `recorder.exclude` recommendation (you can't lazy-fetch from a store you told the user to disable). The captain may opt into this surface in a future train via a new flag `dashboard_options.sickbay_ecg_history: false` (default OFF). When enabled, the HAI plug-in would need to relax `recorder.exclude` for ECG voltage AND apply a `purge_keep_days: 14` cap on the voltage entity. The current `<lcars-ecg-strip>` spec renders **current reading only**.

### 7.8 Renderer input hygiene (per Worf S0-5)

All new primitives obey:

1. **Lit safe-binding only**: every string interpolation uses `${}` template binding. Forbidden: `unsafeHTML`, `innerHTML`, `document.write`, manual `Node.appendChild` of unsanitized strings.
2. **Explicit attribute allowlist**: each primitive declares the exact attributes it reads from `hass.states`. Unknown attributes are ignored; there is no "dump remaining attrs to debug pill" code path. This closes the webhook-URL surface preemptively (e.g. if HAI ever adds a `last_error` attribute embedding the webhook URL, our renderer will not surface it).
3. **Error/degraded pills use hardcoded LCARS strings only**, never templated from `hass.states` attributes. Extends Worf W3 to all six new primitives.
4. **String sanitization**: the `source` device-name field (e.g. "Apple Watch Series 10") is user-renameable in iOS Settings and is therefore attacker-controlled. Renderer regex-filters: only ASCII alphanumerics + spaces + dashes pass; anything else is replaced with `UNKNOWN DEVICE`. The Lit template binding handles HTML-entity escaping automatically; this regex layer adds defense-in-depth.
5. **XSS unit-test fixture**: a permanent test asserts `source: "<script>alert(1)</script>"` renders harmlessly (no script execution, displayed as `UNKNOWN DEVICE`).

### 7.9 W6 cache lifecycle (new gate)

See W6 row in §7 table above. Spec is binding: every component MUST implement `_disposeCaches()` and call it synchronously from `updated(changedProps)` on every trigger condition. Test coverage required in the DoD (§9).

Additionally, when the URL fragment changes from `#person/A` to `#person/B`, the focus-mode container MUST either unmount-and-remount each primitive OR explicitly call `_disposeCaches()` on every mounted primitive before rendering the new profile. Implementation choice deferred to Story 1; either approach satisfies W6 as long as cached PHI doesn't survive the switch.

### 7.10 Third-party trust boundaries (new gate, per Worf S1-7)

ECG voltage, workout polyline, and sleep-stage segments cross **four trust boundaries** before reaching the LCARS renderer:

1. **watchOS** (Apple) — source device firmware
2. **Health Auto Export iOS app** (Lybron) — third-party paid iOS app, supply-chain risk
3. **`health_auto_import` HA integration** (community plug-in) — Python; supply-chain risk
4. **LCARS renderer** — the only link LCARS audits

The PHI consent disclosure in the binding-editor profile screen MUST display the four-boundary disclosure text **adjacent to the `consent.ecg` toggle** (not buried in docs). Suggested text: *"ECG waveform data is collected by Apple Watch, exported by the Health Auto Export iOS app, ingested by the Home Assistant `health_auto_import` integration, then displayed by this dashboard. LCARS audits only the last step. By enabling waveform display, you accept supply-chain risk on the three upstream layers."*

### 7.11 Optional admin-gate for ECG (per Worf S2-9 — captain-deferrable)

`dashboard_options.sickbay_require_admin_for_ecg: false` (default — preserves single-user UX). When true, `<lcars-ecg-strip>` waveform card additionally checks `hass.user.is_admin`; non-admin users see `WAVEFORM CONSENT NOT GIVEN` regardless of `consent.ecg`. Recommended for multi-user households where child accounts have dashboard access.

---

## 8. Backward compatibility

- The shipped grid view (multi-card overview) is **unchanged**.
- The `summary` URL fragment (`#person/{file_id}` or `#summary`) still resolves; the SUMMARY tab simply renders a different set of tiles. Users who deep-linked the dashboard never see a 404.
- The `anatomical` and `biomedical` fragments are unchanged; their content changes.
- The new `sleep` fragment activates only when `dashboard_options.sickbay_sleep_tab: true`. Default OFF means no behavioral change for shipped installs.
- All existing `vital_kind` classifications remain — no breaking changes to `MEDICAL_VITAL_CLASSES`. A new `tabs[]` field is added per kind (additive — old code ignores). **No parallel `MEDICAL_TAB_ASSIGNMENTS` map** (per Data CR-1).
- Existing redaction hooks continue to work. New primitives register *additionally* with the redaction hook **after** the parent §7.4 selector list is amended to include `[data-medical="phi"]` (per Worf S0-1).
- The `consent.ecg` field default-on-read is `false`; existing profiles continue to work with the waveform suppressed (unchanged behavior — they never had a waveform to begin with).

---

## 9. Definition of done (revised v2 — expanded per Riker, Worf, Data)

### v5.14 (Stories 1–4 only per Riker split — see plan)

- [ ] Geordi sign-off on visual fidelity to LCARS grammar (no app-store icon leakage; donut and semicircular gauges replaced per C3/C4)
- [ ] Worf re-bless of W1–W6, §7.7, §7.8, §7.9, §7.10
- [ ] **Pre-Story-1**: parent spec [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md §7.4](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) redaction selector list amended to include `[data-medical="phi"]`
- [ ] **Pre-Story-1**: bundle-size baseline captured for `js/dist/lcars-dashboard.js`
- [ ] All new primitives ship with: `.lcars-medical-redactable` on shadow host AND every numeric child; closed shadow root; `data-medical="phi"` on shadow host; `_disposeCaches()` implementation; aria role + label per §4.8; min-height 44 px on touch targets
- [ ] **Snapshot test** walks rendered tree and fails if any numeric cell lacks `.lcars-medical-redactable`
- [ ] **Unit tests** assert `_disposeCaches()` is called on each W6 trigger condition and internal cache fields are empty after
- [ ] **XSS unit test** fixture: `source: "<script>alert(1)</script>"` renders as `UNKNOWN DEVICE` with no script execution
- [ ] SUMMARY tab renders silhouette + at-a-glance tile strip (shrink-to-fit, mobile-wrap) + 3 sparkline strips + last-sync row
- [ ] ANATOMICAL tab renders anterior + posterior placeholder + body-comp strip + segmental table + mobility strip + **Langford fitness gauges** (not semicircular)
- [ ] BIOMEDICAL tab renders **ECG strip with notifications folded into footer** (no separate HR-alerts row) + cardiac vitals strip + BP range chart (locked color tokens, `data-redact-priority="high"`) + workout route (encoded polyline only) + HR zones (hidden when birthdate absent per Q-C) + hypnogram (timestamps suppressed per Worf S2-10)
- [ ] **Cross-source priority resolver** (§4.9) wired with superscript source chip on each tile
- [ ] **`RECOVERY MODE` status pill modifier** (Wesley #6) wired for Oura `rest_mode` binary sensor
- [ ] **Medications slot** (Wesley #1) added to SUMMARY at-a-glance strip slot 6
- [ ] Empty-state pills render the standardized `{KIND} · NO DATA` string per C13
- [ ] **Bundle-size verification**: per-primitive ≤ 12 KB gzipped; aggregate ≤ 40 KB
- [ ] **No regression** in the multi-card grid view (visual diff)
- [ ] `dashboard_options.sickbay_sleep_tab` documented in setup.md
- [ ] **HAI data-contract** acknowledged by plug-in author (handoff §0 acceptance) **OR** explicit captain decision to ship degraded-mode-only permanently (per Riker fallback)
- [ ] All new primitives covered by unit tests for the empty-state degradation path
- [ ] **Verification matrix** (§10 of plan) executed end-to-end including: profile-switch cache flush, consent toggle-off mid-render, multi-source precedence resolution

### v5.15 (Stories 5–6 full fidelity — gated on v5.11 + v5.13 stable + HAI commitments)

- [ ] All v5.14 DoD items still pass
- [ ] HAI plug-in has shipped §2.1 (voltage attribute), §2.2 (sleep segments), §2.3 (workout HR samples), §2.4 (encoded polyline)
- [ ] **Worf re-review of actual HAI plug-in source** for §2.1 voltage logging compliance (S1-7)
- [ ] `consent.ecg` toggle UI in binding editor displays four-boundary trust disclosure text adjacent to the toggle
- [ ] ECG waveform renders only when `consent.ecg: true` AND existing per-browser dashboard consent is true
- [ ] Hypnogram per-segment rendering replaces totals-only fallback
- [ ] Workout-route encoded polyline decodes inside closed shadow root; no raw lat/lng in any rendered DOM attribute
- [ ] Optional SLEEP tab content rendering verified when `dashboard_options.sickbay_sleep_tab: true`

---

## 10. Ratified decisions (was open questions, v1 → v2)

Per crew review, the four open questions are now **ratified** and bind the spec. Captured here for traceability:

| ID | v1 question | Ratified answer | Reasoning |
|---|---|---|---|
| Q-A | Workout-route source | **Most-recent-with-GPS**, falling back to `WORKOUT · NO DATA` after 5 GPS-less workouts in a row. | Riker call; both Riker and Wesley agreed treadmill workouts shouldn't blank the visualization. |
| Q-B | Hypnogram placement | **BIOMEDICAL row 5 by default**, moves to SLEEP tab row 1 when `dashboard_options.sickbay_sleep_tab: true`. **Timestamps suppressed in BIOMEDICAL placement** (per Worf S2-10). | Resolves Worf's S2-10 partial-gate concern without requiring all users to enable the SLEEP tab. |
| Q-C | HR-zones birthdate fallback | **Hide HR-zones entirely** when `person.birthdate` is absent. Replacement pill: `WORKOUT HR · SET PERSON BIRTHDATE TO ENABLE ZONES`. | Riker + Worf concurred: silently defaulting to age 40 misrepresents zone math. Honest absence > false precision. |
| Q-D | At-a-glance tile shrink vs pad | **Shrink-to-fit**. Mobile wrap via `repeat(auto-fit, minmax(140px, 1fr))`. | Geordi: dashes are noisy clutter; empty space is beautiful. |

---

## 11. References

- Parent spec: [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md)
- Integrations briefing: [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md)
- Binding editor: [LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md](LCARS-MEDICAL-PROFILE-BINDING-EDITOR-SPEC.md)
- Implementation plan: [plans/5.14-sickbay-tab-redesign.md](../plans/5.14-sickbay-tab-redesign.md)
- HAI data-contract handoff: [plans/health-auto-import-data-contract.md](../plans/health-auto-import-data-contract.md)
- Entity inventories: [localinfo/entities/withings.csv](../localinfo/entities/withings.csv), [localinfo/entities/oura.csv](../localinfo/entities/oura.csv), [localinfo/entities/health_auto_import.csv](../localinfo/entities/health_auto_import.csv)
