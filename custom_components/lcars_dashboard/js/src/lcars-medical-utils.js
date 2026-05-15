// LCARS Medical Bay — utilities, vital classifier, anchor map, threshold engine
// Per LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md (v5.3.0)
//
// PRIVACY NOTE (Worf §16): This module must NEVER log values. Any console call that
// includes ${...} substitutions in lcars-medical-*.js is a CI failure.

export const MEDICAL_PLATFORMS = new Set([
  'withings',
  'fitbit',
  'dexcom',
  'garmin_connect',
  'oura',
  'google_fit',
  // 5.11.0-beta.1 — Apple Health via Health Auto Export iOS app (state-only,
  // no entity_registry entry). Discovery walks hass.states and admits entities
  // without a registry entry whose suffix matches a vital pattern; see classifyVital.
  'apple_health',
  'hae',
  'health_auto_export',
]);

// 5.11.0-beta.1 — bridge platforms whose entities are state-only (no entity_registry
// entry). When a state-only entity matches a vital suffix pattern, we still admit it.
const STATE_ONLY_BRIDGE_PLATFORMS = new Set(['apple_health', 'hae', 'health_auto_export']);

// 5.12.0-beta.4 — entity-id domains used by state-only HAE/Apple Health bridges.
// HAE (Health Auto Export) registers entities under its OWN domain `hae.*`
// (e.g. `hae.leith_heart_rate_avg`) rather than `sensor.*`. The binding editor
// sweeps every entity in these domains into the `hae:<prefix>` bucket so the
// Captain can map ALL of an Apple Health user's data to a person, not just
// the subset that happens to match a current classifyVital suffix pattern.
const STATE_ONLY_BRIDGE_DOMAINS = new Set(['hae', 'apple_health']);

// Vital kinds in display order. Anchor slot = where on the silhouette the value renders.
// `tile` = whether it gets a Zone C detail tile.  `spark` = sparkline-eligible.
// `composite` = renders a multi-sub-lozenge tile (Oura-style readiness breakdown).
export const MEDICAL_VITAL_CLASSES = [
  { kind: 'blood_pressure',     anchor: 'left_arm',   label: 'BP',          unit: 'mmHg', spark: true,  tile: false, paired: true },
  { kind: 'heart_rate',         anchor: 'heart',      label: 'HR',          unit: 'bpm',  spark: true,  tile: true },
  { kind: 'spo2',               anchor: 'right_arm',  label: 'SpO2',        unit: '%',    spark: true,  tile: false },
  { kind: 'respiration_rate',   anchor: 'throat',     label: 'RESP',        unit: 'brpm', spark: false, tile: false },
  // 5.11.0-beta.3 — TEMP relocated from 'forehead' (top edge, clipped the head
  // ellipse) to 'left_chest' (left edge above BP) per Captain visual review.
  { kind: 'body_temp_deviation',anchor: 'left_chest', label: 'TEMP',        unit: '°C',   spark: true,  tile: true },
  { kind: 'weight',             anchor: 'abdomen',    label: 'WEIGHT',      unit: 'kg',   spark: true,  tile: true },
  { kind: 'body_fat_pct',       anchor: null,         label: 'BODY FAT',    unit: '%',    spark: false, tile: true },
  { kind: 'fat_mass',           anchor: null,         label: 'FAT MASS',    unit: 'kg',   spark: true,  tile: true },
  { kind: 'lean_mass',          anchor: null,         label: 'LEAN',        unit: 'kg',   spark: true,  tile: true },
  { kind: 'muscle_mass',        anchor: null,         label: 'MUSCLE',      unit: 'kg',   spark: true,  tile: true },
  { kind: 'bone_mass',          anchor: null,         label: 'BONE',        unit: 'kg',   spark: true,  tile: true },
  { kind: 'visceral_fat',       anchor: null,         label: 'VISCERAL',    unit: '',     spark: false, tile: true },
  { kind: 'bmi',                anchor: null,         label: 'BMI',         unit: '',     spark: false, tile: true },
  { kind: 'hydration',          anchor: null,         label: 'HYDRATION',   unit: 'L',    spark: false, tile: true },
  { kind: 'readiness',          anchor: null,         label: 'READINESS',   unit: '/100', spark: true,  tile: true, composite: true },
  // v5.8.0-beta.2 (Geordi+Wesley P0): sleep_score is a wellness metric, not an
  // anatomical vital. Anchoring it at 'head_top' collided with body_temp_deviation
  // at 'forehead' (both routed to the top edge bucket). Tile-only now.
  { kind: 'sleep_score',        anchor: null,         label: 'SLEEP',       unit: '/100', spark: true,  tile: true },
  { kind: 'sleep_duration',     anchor: null,         label: 'SLEEP TIME',  unit: 'h',    spark: false, tile: true },
  { kind: 'sleep_efficiency',   anchor: null,         label: 'EFFICIENCY',  unit: '%',    spark: false, tile: true },
  { kind: 'hrv',                anchor: null,         label: 'HRV',         unit: 'ms',   spark: true,  tile: true },
  { kind: 'hrv_balance',        anchor: null,         label: 'HRV BAL',     unit: '/100', spark: false, tile: true },
  { kind: 'body_battery',       anchor: null,         label: 'BODY BATT',   unit: '/100', spark: true,  tile: true },
  { kind: 'recovery_score',     anchor: null,         label: 'RECOVERY',    unit: '/100', spark: true,  tile: true },
  { kind: 'stress_resilience',  anchor: null,         label: 'RESILIENCE',  unit: '',     spark: false, tile: true },
  { kind: 'vo2_max',            anchor: null,         label: 'VO2 MAX',     unit: 'ml/kg/min', spark: false, tile: true },
  { kind: 'cardiovascular_age', anchor: null,         label: 'CV AGE',      unit: 'yr',   spark: false, tile: true },
  { kind: 'activity_score',     anchor: null,         label: 'ACTIVITY',    unit: '/100', spark: false, tile: true },
  { kind: 'steps',              anchor: 'right_foot', label: 'STEPS',       unit: '',     spark: true,  tile: true },
  { kind: 'active_minutes',     anchor: 'left_leg',   label: 'ACTIVE',      unit: 'min',  spark: false, tile: true },
  { kind: 'workout_distance',   anchor: 'right_leg',  label: 'DISTANCE',    unit: 'km',   spark: false, tile: false },
  { kind: 'last_workout',       anchor: null,         label: 'LAST WORKOUT',unit: '',     spark: false, tile: true },
];

// Anchor map (slot → {x,y} as % of 200x480 silhouette bodyBox).
// Left/right are VIEWER-perspective (matches LCARS reference imagery, not anatomical).
export const ANCHOR_MAP = {
  head_top:   { x: 50, y:  4, label: 'top' },
  forehead:   { x: 50, y: 10, label: 'top' },
  throat:     { x: 50, y: 17, label: 'right' },
  // 5.11.0-beta.3 — left_chest hosts BODY TEMP. Sits above left_arm so Pass 2
  // distribution (left edge) renders TEMP just above BP without overlap.
  left_chest: { x: 38, y: 36, label: 'left' },
  heart:      { x: 56, y: 33, label: 'right' },
  left_lung:  { x: 38, y: 30, label: 'left' },
  right_lung: { x: 62, y: 30, label: 'right' },
  left_arm:   { x: 18, y: 42, label: 'left' },
  right_arm:  { x: 82, y: 42, label: 'right' },
  // 5.11.0-beta.4 — abdomen moved from y=52 (crotch level) to y=38 (navel)
  // per Captain: no callout dots on sensitive body areas.
  abdomen:    { x: 50, y: 38, label: 'right' },
  left_leg:   { x: 41, y: 75, label: 'left' },
  right_leg:  { x: 59, y: 75, label: 'right' },
  left_foot:  { x: 39, y: 96, label: 'left' },
  right_foot: { x: 61, y: 96, label: 'right' },
};

// Default thresholds (AHA / clinically standard ranges). User overrides via medical_thresholds.yaml
// arrive in Phase 2 (5.3.0-beta.3).
export const DEFAULT_THRESHOLDS = {
  blood_pressure: { sysAlert: 140, sysElev: 130, diaAlert: 90, diaElev: 85 },
  // 5.10.0-beta.3 — bands widened: Withings `_heart_pulse` and Oura `_heart_rate`
  // feed POINT-IN-TIME readings (scale grip, live ring sample), not resting HR.
  // Tight resting bands (50-80 nominal, 100 alert) misfire during normal activity.
  // Resting HR proper is exposed only via attributes (Oura readiness) or Apple
  // Health `_resting_heart_rate` entities; reverting to tight bands is planned
  // once the card consumes those sources directly (see backlog "Oura attribute extraction").
  heart_rate:     { nominalMin: 50, nominalMax: 100, elevMax: 130, alertMax: 150, alertMin: 40 },
  spo2:           { nominalMin: 95, elevMin: 92 },
  respiration_rate: { nominalMin: 12, nominalMax: 20, elevMax: 24 },
  glucose:        { nominalMin: 70, nominalMax: 140, elevLow: 60, elevHigh: 180 },
  body_battery:   { nominalMin: 40, elevMin: 20 },
  sleep_score:    { nominalMin: 80, elevMin: 60 },
  recovery_score: { nominalMin: 70, elevMin: 50 },
  // 5.8.0-beta.1 — Oura-derived bands. Defaults track Oura UI conventions;
  // user override planned via medical_thresholds.yaml (Phase 2 loader).
  readiness:           { nominalMin: 70, elevMin: 50, alertMin: 30 },
  // body_temp_deviation: ABSOLUTE deviation in °C from personal baseline.
  // status applied to Math.abs(value) so +1.2 and -1.2 trigger identically.
  body_temp_deviation: { nominalMaxAbs: 0.3, elevMaxAbs: 0.6, alertMaxAbs: 1.0 },
  hrv_balance:         { nominalMin: 70, elevMin: 50 },
  stress_resilience:   { nominalMin: 70, elevMin: 50 },
  sleep_efficiency:    { nominalMin: 85, elevMin: 75 },
  activity_score:      { nominalMin: 70, elevMin: 50 },
  vo2_max:             { nominalMin: 35, elevMin: 25 },
};

const STATUS = Object.freeze({ NOMINAL: 'NOMINAL', ELEVATED: 'ELEVATED', ALERT: 'ALERT', CRITICAL: 'CRITICAL', OFFLINE: 'OFFLINE' });
const PRECEDENCE = { OFFLINE: 5, CRITICAL: 4, ALERT: 3, ELEVATED: 2, NOMINAL: 1 };

// Compute a per-vital status. Numeric inputs only — never log the value.
export function computeStatus(kind, value, t = DEFAULT_THRESHOLDS, secondary = null) {
  if (value == null || isNaN(value)) return STATUS.OFFLINE;
  const cfg = t[kind];
  if (!cfg) return STATUS.NOMINAL;
  switch (kind) {
    case 'blood_pressure': {
      const sys = value, dia = secondary;
      if (sys >= cfg.sysAlert || (dia != null && dia >= cfg.diaAlert)) return STATUS.ALERT;
      if (sys >= cfg.sysElev  || (dia != null && dia >= cfg.diaElev))  return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    }
    case 'heart_rate': {
      if (value < cfg.alertMin || value > cfg.alertMax) return STATUS.ALERT;
      if (value > cfg.nominalMax) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    }
    case 'spo2':
      if (value < cfg.elevMin)    return STATUS.ALERT;
      if (value < cfg.nominalMin) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    case 'respiration_rate':
      if (value < cfg.nominalMin || value > cfg.elevMax) return STATUS.ALERT;
      if (value > cfg.nominalMax) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    case 'glucose':
      if (value < cfg.elevLow || value > cfg.elevHigh)   return STATUS.ALERT;
      if (value < cfg.nominalMin || value > cfg.nominalMax) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    case 'body_battery':
    case 'sleep_score':
    case 'recovery_score':
    case 'readiness':
    case 'hrv_balance':
    case 'stress_resilience':
    case 'sleep_efficiency':
    case 'activity_score':
    case 'vo2_max':
      if (cfg.alertMin != null && value < cfg.alertMin) return STATUS.ALERT;
      if (value < cfg.elevMin) return cfg.alertMin != null ? STATUS.ELEVATED : STATUS.ALERT;
      if (value < cfg.nominalMin) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    case 'body_temp_deviation': {
      // Symmetric bands around personal baseline (±). >|1.0| escalates to CRITICAL
      // since sustained 1°C fever/hypothermia warrants escalation per AHA / Oura UI.
      const dev = Math.abs(value);
      if (dev > cfg.alertMaxAbs) return STATUS.CRITICAL;
      if (dev > cfg.elevMaxAbs)  return STATUS.ALERT;
      if (dev > cfg.nominalMaxAbs) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
    }
    default:
      return STATUS.NOMINAL;
  }
}

// Roll up many per-vital statuses into the card's overall status pill.
export function rollupStatus(statuses) {
  let best = STATUS.NOMINAL;
  let bestRank = 0;
  for (const s of statuses) {
    const r = PRECEDENCE[s] || 0;
    if (r > bestRank) { best = s; bestRank = r; }
  }
  return best;
}

// Explicit ignore patterns — Worf MUST-FIX (5X-F35e). Surface PHI-irrelevant chrome
// is dropped early so future regex changes can't accidentally promote them to vitals.
// Order matters: most specific first.
const IGNORE_SUFFIXES = [
  /_breathing_disturbance_index$/,                                   // Oura beta, no clinical threshold
  /_ring_battery_level$|_battery_level$|_low_battery_alert$/,        // routed to Engineering per spec §4.4
  /_(rest_mode|optimal_bedtime|bedtime)_(start|end)$/,                // timestamps render meaninglessly numeric
  /_target_calories$/,                                                // goal not measurement
  /_(stress_high|recovery_high)_duration$/,                           // raw bucket durations, redundant
  /_stress_day_summary$/,                                             // enum chrome
  /_(mindfulness_sessions|meditation_duration|tag_count|tags)_today$/,// behavioral counts
  /_workouts_today$/,                                                 // count; last_workout suffices
  /_(deep|rem|light)_sleep_percentage$/,                              // explicit Oura case
  /_awake_time$/,                                                     // surfaces via sleep_duration variants instead
];

// Per-kind priority list. Lowest index = canonical (drives anchor + status rollup).
// All other matches become tile variants displayed with their sourceLabel.
// VITAL_SUFFIX_PRIORITY entries: { re, label } where label is the LCARS-style source tag.
export const VITAL_SUFFIX_PRIORITY = {
  // v5.8.0-beta.2 (Geordi+Wesley P0): real-time / resting variants outrank
  // sleep-period averages. Previously _average_sleep_heart_rate was index 1 and
  // won the canonical slot on Oura-only profiles, which is clinically wrong for
  // a 'current status' display.
  // v5.11.0-beta.2: bare `_heart_rate$` MOVED TO LAST position because it was
  // matching `_lowest_sleep_heart_rate`, `_maximum_heart_rate`, `_minimum_heart_rate`
  // etc. as the literal suffix `_heart_rate` IS present at end of those strings,
  // and the linear `for` loop returned the first hit. Specific Oura/HAE max/min
  // and HAE day-bucket variants now have their own labels above the fallback.
  heart_rate: [
    { re: /_current_heart_rate$/,            label: 'CURRENT' },
    { re: /_heart_pulse$/,                   label: 'PULSE' },
    { re: /_resting_heart_rate$/,            label: 'RESTING' },
    { re: /_walking_heart_rate_average$/,    label: 'WALK AVG' },
    { re: /_maximum_heart_rate$/,            label: 'MAX' },
    { re: /_minimum_heart_rate$/,            label: 'MIN' },
    { re: /_heart_rate_max$/,                label: 'MAX' },
    { re: /_heart_rate_min$/,                label: 'MIN' },
    { re: /_heart_rate_avg$/,                label: 'AVG' },
    { re: /_average_heart_rate$/,            label: 'AVG' },
    { re: /_lowest_sleep_heart_rate$/,       label: 'LOW SLEEP' },
    { re: /_average_sleep_heart_rate$/,      label: 'AVG SLEEP' },
    { re: /_heart_rate$/,                    label: 'HR' },
  ],
  sleep_duration: [
    { re: /_total_sleep_duration$/,          label: 'TOTAL' },
    { re: /_deep_sleep_duration$/,           label: 'DEEP' },
    { re: /_rem_sleep_duration$/,            label: 'REM' },
    { re: /_light_sleep_duration$/,          label: 'LIGHT' },
    { re: /_time_in_bed$/,                   label: 'IN BED' },
    { re: /_sleep_duration$/,                label: 'SLEEP' },
    { re: /_minutes_asleep$/,                label: 'ASLEEP' },
    { re: /_sleep_.*hours$/,                 label: 'HOURS' },
  ],
  recovery_score: [
    { re: /_sleep_recovery_score$/,          label: 'SLEEP' },
    { re: /_daytime_recovery_score$/,        label: 'DAYTIME' },
    { re: /_training_readiness$/,            label: 'TRAINING' },
    { re: /_recovery_score$/,                label: 'OVERALL' },
  ],
  spo2: [
    { re: /_spo2$/,                          label: 'SPOT' },
    { re: /_spo2_average$/,                  label: 'AVG' },
    { re: /_latest_spo2$/,                   label: 'LATEST' },
    { re: /_oxygen_saturation$/,             label: 'SAT' },
  ],
  // v5.8.0-beta.2 (Geordi+Wesley P0): same as heart_rate — promote current /
  // non-sleep variants above sleep-period averages.
  hrv: [
    { re: /_hrv$/,                           label: 'HRV' },
    { re: /_hrv_last_night_average$/,        label: 'LAST NIGHT' },
    { re: /_hrv_last_night$/,                label: 'LAST NIGHT' },
    { re: /_heart_rate_variability$/,        label: 'HRV' },
    { re: /_average_sleep_hrv$/,             label: 'AVG SLEEP' },
  ],
  sleep_score: [
    { re: /_sleep_score$/,                   label: 'SCORE' },
    { re: /_sleep_regularity_score$/,        label: 'REGULARITY' },
  ],
  readiness: [
    { re: /_readiness_score$/,               label: 'OURA' },
    { re: /_daily_readiness$/,               label: 'DAILY' },
    { re: /_overall_readiness$/,             label: 'OVERALL' },
  ],
  body_temp_deviation: [
    { re: /_temperature_deviation$/,         label: 'CORE' },
    { re: /_body_temperature_deviation$/,    label: 'BODY' },
    { re: /_skin_temperature_deviation$/,    label: 'SKIN' },
  ],
  hrv_balance: [
    { re: /_hrv_balance_score$/,             label: 'BALANCE' },
  ],
  sleep_efficiency: [
    { re: /_sleep_efficiency$/,              label: 'EFFICIENCY' },
    { re: /_sleep_efficiency_score$/,        label: 'SCORE' },
  ],
  activity_score: [
    { re: /_activity_score$/,                label: 'DAILY' },
  ],
  vo2_max: [
    { re: /_cardio_capacity_score$/,         label: 'OURA' },
    { re: /_vo2_max$/,                       label: 'VO2' },
  ],
  // v5.8.0-beta.2 (Geordi+Wesley P0): Oura's `_resilience_level` is the
  // human-readable enum (Great/Strong/Solid/Low). Numeric resilience scores were
  // winning canonical and rendering '33 SCORE' instead of 'STRONG'. The enum is
  // routed to the _renderEnumTile path via classifier `isEnum` flag.
  stress_resilience: [
    { re: /_resilience_level$/,              label: '' },
    { re: /_resilience$/,                    label: 'RESILIENCE' },
    { re: /_stress_resilience$/,             label: 'STRESS' },
    { re: /_resilience_score$/,              label: 'SCORE' },
  ],
  steps: [
    { re: /_steps$/,                         label: 'STEPS' },
  ],
  active_minutes: [
    { re: /_high_activity_time$/,            label: 'HIGH' },
    { re: /_medium_activity_time$/,          label: 'MEDIUM' },
    { re: /_low_activity_time$/,             label: 'LOW' },
    { re: /_minutes_very_active$/,           label: 'VIGOROUS' },
    { re: /_intensity$/,                     label: 'INTENSITY' },
  ],
  workout_distance: [
    { re: /_last_workout_distance$/,                  label: 'LAST' },
    { re: /_last_activity_distance$/,                 label: 'LAST' },
    { re: /_distance_trave(lle|le)d_last_workout$/,   label: 'LAST' },
  ],
  last_workout: [
    { re: /_last_workout_type$/,             label: 'TYPE' },
    { re: /_last_workout_intensity$/,        label: 'INTENSITY' },
    { re: /_last_workout_duration$/,         label: 'DURATION' },
    { re: /_last_workout_calories$/,         label: 'KCAL' },
    { re: /_calories_burnt_last_workout$/,   label: 'KCAL' },
    { re: /_elevation_change_last_workout$/, label: 'ELEV' },
    { re: /_pause_during_last_workout$/,     label: 'PAUSE' },
    { re: /_last_workout_/,                  label: 'WORKOUT' },
    { re: /_last_activity_/,                 label: 'ACTIVITY' },
  ],
};

// Resolve { priority, label } for a (kind, eid). Lower priority = preferred canonical.
// Returns { priority: 999, label: '' } when no priority list exists for the kind.
export function entityPriority(kind, eid) {
  const arr = VITAL_SUFFIX_PRIORITY[kind];
  if (!arr) return { priority: 0, label: '' };
  const lid = String(eid).toLowerCase();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].re.test(lid)) return { priority: i, label: arr[i].label };
  }
  return { priority: 999, label: '' };
}

// Match a HA state object to a vital_kind. Pattern-based; tolerant to platform variation.
// Returns { kind, sourceLabel, isSystolic, isDiastolic } or null.
//
// 5.11.0-beta.1 — admits entities WITHOUT an entity_registry entry (state-only
// HAE / Apple Health bridges write directly to hass.states). The platform gate
// still rejects entities whose registry entry exists but isn't a medical integration
// (so a zigbee `sensor.bedroom_temperature` cannot be misclassified).
export function classifyVital(state, entityRegistryEntry) {
  const eid = state.entity_id;
  const platform = entityRegistryEntry?.platform || '';
  // Reject only when a registry entry exists AND its platform is non-medical.
  // Missing registry entry → state-only bridge → fall through to suffix matching.
  if (entityRegistryEntry && !MEDICAL_PLATFORMS.has(platform)) return null;
  const lid = eid.toLowerCase();

  // Worf MUST-FIX: drop chrome/diagnostic/timestamp/enum suffixes BEFORE any vital regex
  // can match them. Prevents future Oura suffix expansion from leaking PHI-irrelevant nodes.
  for (let i = 0; i < IGNORE_SUFFIXES.length; i++) {
    if (IGNORE_SUFFIXES[i].test(lid)) return null;
  }

  // Helper: wrap a bare { kind } with its priority-derived sourceLabel for the hybrid
  // multi-source rendering (Captain decision 5X-F35: show all variants with source tag).
  const withLabel = (cls) => {
    if (!cls) return cls;
    const { label } = entityPriority(cls.kind, eid);
    return label ? { ...cls, sourceLabel: label } : cls;
  };

  if (/_systolic.*blood.*pressure$|_systolic_blood_pressure$/.test(lid)) return { kind: 'blood_pressure', isSystolic: true, sourceLabel: 'SYS' };
  if (/_diastolic.*blood.*pressure$|_diastolic_blood_pressure$/.test(lid)) return { kind: 'blood_pressure', isDiastolic: true, sourceLabel: 'DIA' };

  // Heart rate — explicit suffix set; `_score` variants are NOT HR (Oura readiness components).
  // 5.11.0-beta.1 (S0-3): `_resting_heart_rate` is a 0-100 SCORE (not BPM) on Oura
  // post-v2.0.0; for Oura it's intentionally dropped here so it doesn't poison the
  // heart_rate threshold gate. For HAE/Apple Health/Withings/Fitbit/Garmin etc.
  // the same suffix really is BPM, so route normally.
  if (/_resting_heart_rate$/.test(lid)) {
    if (platform === 'oura') return null;
    return withLabel({ kind: 'heart_rate' });
  }
  // 5.11.0-beta.1 — HAE Apple Health emits `_heart_rate_avg`, `_heart_rate_max`,
  // `_heart_rate_min` (all BPM). Add to the heart_rate kind so they stack as variants.
  if (/_(heart_pulse|heart_rate|current_heart_rate|average_heart_rate|lowest_sleep_heart_rate|average_sleep_heart_rate|heart_rate_avg|heart_rate_max|heart_rate_min|walking_heart_rate_average)$/.test(lid)) return withLabel({ kind: 'heart_rate' });

  // SpO2 — accept Oura's `_average` suffix and the standard. HAE: `_blood_oxygen_saturation`.
  if (/_(spo2|spo2_average|oxygen_saturation|latest_spo2|blood_oxygen_saturation)$/.test(lid)) return withLabel({ kind: 'spo2' });

  if (/_respiration|_respiratory_rate$|_latest_respiration$/.test(lid)) return withLabel({ kind: 'respiration_rate' });

  if (/_weight$/.test(lid) && !/_goal$/.test(lid)) return withLabel({ kind: 'weight' });
  if (/_weight_goal$/.test(lid)) return { kind: 'weight_goal' };
  // 5.11.0-beta.1 — HAE: `_body_fat_percentage`, `_body_mass_index`.
  if (/_fat_ratio$|_body_fat$|_body_fat_percentage$/.test(lid)) return withLabel({ kind: 'body_fat_pct' });
  if (/_fat_mass$/.test(lid)) return withLabel({ kind: 'fat_mass' });
  if (/_(fat_free_mass|lean_body_mass|lean_mass)$/.test(lid)) return withLabel({ kind: 'lean_mass' });
  if (/_muscle_mass$/.test(lid)) return withLabel({ kind: 'muscle_mass' });
  if (/_bone_mass$/.test(lid)) return withLabel({ kind: 'bone_mass' });
  if (/_visceral_fat(_index)?$/.test(lid)) return withLabel({ kind: 'visceral_fat' });
  if (/_(bmi|body_mass_index)$/.test(lid)) return withLabel({ kind: 'bmi' });
  if (/_hydration$/.test(lid)) return withLabel({ kind: 'hydration' });

  // 5.8.0-beta.1 — new Oura-derived vital kinds (5X-F35d). Must precede sleep_score so
  // `_readiness_score` / `_sleep_efficiency` route to their first-class kinds rather than
  // falling into the legacy sleep_score variant bucket.
  if (/_readiness_score$|_(daily|overall)_readiness$/.test(lid)) return withLabel({ kind: 'readiness' });
  if (/_temperature_deviation$|_body_temperature_deviation$|_skin_temperature_deviation$/.test(lid)) return withLabel({ kind: 'body_temp_deviation' });
  if (/_hrv_balance_score$/.test(lid)) return withLabel({ kind: 'hrv_balance' });
  // Stress resilience — Oura `_resilience_level` is an ENUM (Great/Strong/Solid/Low).
  // Other integrations may emit a numeric `_resilience_score`; both route here, kind
  // consumers must dispatch on string vs number.
  if (/_resilience_level$|_resilience(_score)?$|_stress_resilience$/.test(lid)) return withLabel({ kind: 'stress_resilience', isEnum: /_resilience_level$/.test(lid) });
  if (/_sleep_efficiency(_score)?$/.test(lid)) return withLabel({ kind: 'sleep_efficiency' });
  if (/_activity_score$/.test(lid)) return withLabel({ kind: 'activity_score' });
  if (/_(vo2_max|cardio_capacity_score)$/.test(lid)) return withLabel({ kind: 'vo2_max' });
  if (/_cardiovascular_age$/.test(lid)) return withLabel({ kind: 'cardiovascular_age' });

  // Sleep score — Oura sleep_score primary + regularity as a variant. (readiness_score
  // and sleep_efficiency MOVED OUT to first-class kinds above.)
  if (/_sleep_score$|_sleep_regularity_score$/.test(lid)) return withLabel({ kind: 'sleep_score' });

  // Sleep duration — total + per-stage (deep/rem/light) + time_in_bed all map; priority list ranks them.
  if (/_total_sleep_duration$|_deep_sleep_duration$|_rem_sleep_duration$|_light_sleep_duration$|_sleep_duration$|_time_in_bed$|_sleep_.*hours$|_minutes_asleep$/.test(lid)) return withLabel({ kind: 'sleep_duration' });

  // HRV (raw, milliseconds) — base reading; balance_score went to hrv_balance above.
  // 5.11.0-beta.2: HAE Apple Health emits `_heart_rate_variability` (also ms).
  if (/_(hrv|hrv_last_night|hrv_last_night_average|average_sleep_hrv|heart_rate_variability)$/.test(lid)) return withLabel({ kind: 'hrv' });

  if (/_body_battery$/.test(lid)) return withLabel({ kind: 'body_battery' });

  if (/_steps$/.test(lid)) return withLabel({ kind: 'steps' });

  // Active minutes — Oura high/medium/low activity time, Fitbit very_active, Garmin intensity.
  if (/_(high_activity_time|medium_activity_time|low_activity_time|minutes_very_active|intensity)$/.test(lid)) return withLabel({ kind: 'active_minutes' });

  if (/_last_workout_distance$|_last_activity_distance$|_distance_travelled_last_workout$|_distance_traveled_last_workout$/.test(lid)) return withLabel({ kind: 'workout_distance' });
  if (/_last_workout_|_last_activity_|_last_workout$|_last_activity$|_calories_burnt_last_workout$|_elevation_change_last_workout$|_pause_during_last_workout$/.test(lid)) return withLabel({ kind: 'last_workout' });

  if (/_glucose_value$/.test(lid)) return withLabel({ kind: 'glucose' });

  return null;
}

// 5.12.0-beta.1 — Medical profile binding store accessor.
//
// Fetches the persisted Captain-curated mapping (lcars-dashboard/configs/medical_profiles.yaml)
// once per hass.connection and caches the result on a WeakMap. Listens to
// `lcars_dashboard_medical_profiles_updated` bus events to invalidate so other
// connected sessions pick up admin edits without a refresh.
//
// Async-by-nature, but the resolver below is synchronous — discoverProfiles()
// reads the cached map. First call returns null (no mapping yet), and the
// resolver falls back to the heuristic. Once the WS round-trip completes the
// renderer re-runs (lit reactivity on the same hass object) with the mapping
// available.
const _profileMapCache = new WeakMap(); // key: hass.connection, value: { mapping, byBinding, ready, fetching, listenerOff }

function _kickProfileMapFetch(hass) {
  const conn = hass?.connection;
  if (!conn) return null;
  let entry = _profileMapCache.get(conn);
  if (entry) return entry.mapping;
  entry = { mapping: null, byBinding: new Map(), ready: false, fetching: true, listenerOff: null };
  _profileMapCache.set(conn, entry);

  const apply = (raw) => {
    const mapping = raw && typeof raw === 'object' ? raw : null;
    entry.mapping = mapping;
    entry.byBinding = new Map();
    if (mapping && Array.isArray(mapping.profiles)) {
      for (const p of mapping.profiles) {
        if (!p || typeof p !== 'object') continue;
        const pid = typeof p.id === 'string' ? p.id : null;
        if (!pid) continue;
        const bindings = Array.isArray(p.bindings) ? p.bindings : [];
        for (const b of bindings) {
          if (typeof b === 'string') entry.byBinding.set(b, pid);
        }
      }
    }
    entry.ready = true;
    // Bust the discoverProfiles cache so the next render rebuilds with the new mapping.
    _discoverProfilesCache = new WeakMap();
  };

  conn.sendMessagePromise({ type: 'lcars_dashboard/medical_profiles/get' })
    .then(apply)
    .catch(() => apply(null))
    .finally(() => { entry.fetching = false; });

  // Subscribe to update events for live invalidation.
  try {
    const sub = conn.subscribeEvents(
      () => {
        entry.ready = false;
        conn.sendMessagePromise({ type: 'lcars_dashboard/medical_profiles/get' })
          .then(apply)
          .catch(() => apply(null));
      },
      'lcars_dashboard_medical_profiles_updated',
    );
    if (sub && typeof sub.then === 'function') {
      sub.then((off) => { entry.listenerOff = off; }).catch(() => {});
    }
  } catch (_) { /* subscribeEvents unavailable in some test harnesses */ }

  return null;
}

// Public accessor for the cached mapping. Returns the canonical
// { version, respect_user_scoping, profiles: [...] } object once loaded; null
// before the first WS round-trip completes.
export function getMedicalProfileMap(hass) {
  if (!hass) return null;
  const conn = hass.connection;
  if (!conn) return null;
  if (!_profileMapCache.has(conn)) _kickProfileMapFetch(hass);
  return _profileMapCache.get(conn)?.mapping || null;
}

// Returns the binding-key -> person.* map derived from the persisted mapping,
// or an empty Map until the WS round-trip completes.
export function getMedicalBindingIndex(hass) {
  if (!hass) return new Map();
  const conn = hass.connection;
  if (!conn) return new Map();
  if (!_profileMapCache.has(conn)) _kickProfileMapFetch(hass);
  return _profileMapCache.get(conn)?.byBinding || new Map();
}

// Looks up the friendly label for a profile id, falling back to the HA
// person friendly_name and finally to the raw id.
export function profileLabelFor(hass, profileId) {
  if (!profileId) return '';
  const mapping = getMedicalProfileMap(hass);
  if (mapping?.profiles) {
    const hit = mapping.profiles.find((p) => p && p.id === profileId);
    if (hit?.label) return hit.label;
  }
  if (profileId.startsWith('person.') && hass?.states?.[profileId]) {
    const fn = hass.states[profileId].attributes?.friendly_name;
    if (fn) return fn;
  }
  return profileId;
}

// Discover unique medical profiles by walking hass.states and classifying every entity
// the resolver recognizes as medical.
//
// Per-entity binding key derivation (used to look up a Captain-curated mapping):
//   1. HAE / Apple Health bridge entities — `hae:<prefix>` (object_id leading segment).
//   2. Registry entries with a config_entry_id — `<platform>:<config_entry_id>`.
//   3. Registry entries with only a device_id — `<platform>:<device_id>`.
//   4. Other registry entries — `<platform>:_` as a catch-all.
//
// Bucketing rules (5.12.0-beta.1):
//   - If a Captain-curated mapping exists (medical_profiles.yaml via WS) and the
//     entity's binding key is mapped to a `person.*`, the entity goes in that
//     person's bucket. Per-entity overrides (`include` / `exclude`) take priority.
//   - Otherwise the entity goes in an `unmapped:<bindingKey>` bucket so it still
//     surfaces and the Captain can see what needs mapping.
//   - When NO mapping is configured at all, behavior is identical to v5.11.0:
//     HAE-prefix collapse with non-HAE buckets merged into the primary.
//
// Cache key includes (hass.entities, hass.states) reference identity — HA mutates these
// by replacement, not in-place, so reference equality is a sound invalidation signal.
let _discoverProfilesCache = new WeakMap();
export function discoverProfiles(hass) {
  if (!hass) return [];
  const reg = hass.entities || {};
  const states = hass.states || {};
  // Kick off (or refresh) the mapping fetch as a side effect of the first call.
  _kickProfileMapFetch(hass);
  const bindingIndex = getMedicalBindingIndex(hass);
  const mappingActive = bindingIndex.size > 0;

  // Per-entity overrides: build (eid -> profileId) and (eid -> 'EXCLUDED') maps.
  const entityIncludes = new Map();
  const entityExcludes = new Set();
  if (mappingActive) {
    const mapping = getMedicalProfileMap(hass);
    if (mapping?.profiles) {
      for (const p of mapping.profiles) {
        const overrides = p?.entity_overrides || {};
        for (const eid of overrides.include || []) entityIncludes.set(eid, p.id);
        for (const eid of overrides.exclude || []) entityExcludes.add(eid);
      }
    }
  }

  let bucket = _discoverProfilesCache.get(reg);
  if (bucket && bucket.states === states && bucket.bindingIndex === bindingIndex) {
    return bucket.result;
  }

  // Provisional bucketing. `kind` records WHICH signal produced the key so the
  // post-walk collapse logic can prefer HAE-prefix profiles (authoritative per Captain).
  const provisional = new Map();
  const haePrefixKeys = new Set();
  // 5.12.0-beta.1 — `bindingKeysSeen` records every binding key encountered on this
  // walk so the editor UI (Phase 2) can offer all of them as mapping candidates.
  const bindingKeysSeen = new Set();

  for (const eid of Object.keys(states)) {
    if (entityExcludes.has(eid)) continue;

    const reEntry = reg[eid];
    const cls = classifyVital(states[eid], reEntry);
    if (!cls) continue;

    const objId = eid.split('.')[1] || '';
    let profileKey;
    let bindingKey;
    let isHae = false;

    if (!reEntry || STATE_ONLY_BRIDGE_PLATFORMS.has(reEntry.platform)) {
      // State-only HAE / Apple Health bridge — leading prefix is the user identifier.
      profileKey = objId.split('_')[0] || 'biobed';
      bindingKey = `hae:${profileKey}`;
      isHae = true;
      haePrefixKeys.add(profileKey);
    } else if (reEntry.config_entry_id) {
      profileKey = `entry:${reEntry.config_entry_id}`;
      bindingKey = `${reEntry.platform || 'unknown'}:${reEntry.config_entry_id}`;
    } else if (reEntry.device_id) {
      profileKey = `device:${reEntry.device_id}`;
      bindingKey = `${reEntry.platform || 'unknown'}:${reEntry.device_id}`;
    } else {
      profileKey = objId.split('_')[0] || 'biobed';
      bindingKey = `${reEntry.platform || 'unknown'}:_`;
    }
    bindingKeysSeen.add(bindingKey);

    // 5.12.0-beta.1 — Captain mapping takes priority. Per-entity include override
    // beats binding-level mapping; both override the heuristic profileKey.
    let mappedTo = entityIncludes.get(eid) || bindingIndex.get(bindingKey) || null;
    if (mappedTo) {
      profileKey = mappedTo;
      isHae = false;
    } else if (mappingActive) {
      // Mapping is configured but doesn't cover this binding — surface it under a
      // dedicated unmapped bucket so the Captain can see what needs assignment.
      profileKey = `unmapped:${bindingKey}`;
      isHae = false;
    }

    if (!provisional.has(profileKey)) {
      provisional.set(profileKey, {
        profileId: profileKey,
        entities: [],
        platforms: new Set(),
        bindings: new Set(),
        isHae,
        isMapped: !!mappedTo,
        isUnmapped: mappingActive && !mappedTo,
      });
    }
    const p = provisional.get(profileKey);
    p.entities.push({
      eid,
      state: states[eid],
      cls,
      platform: reEntry?.platform || (isHae ? 'hae' : ''),
      bindingKey,
    });
    p.bindings.add(bindingKey);
    if (reEntry?.platform) p.platforms.add(reEntry.platform);
    if (isHae && !reEntry?.platform) p.platforms.add('hae');
  }

  let result;
  if (mappingActive) {
    // Captain-curated bucketing: take provisional buckets as-is. Order: mapped
    // person.* profiles first (in mapping definition order), then unmapped buckets.
    const mapping = getMedicalProfileMap(hass);
    const personOrder = (mapping?.profiles || []).map((p) => p.id);
    const ordered = [];
    for (const pid of personOrder) {
      const b = provisional.get(pid);
      if (b) ordered.push(b);
    }
    for (const [key, b] of provisional) {
      if (key.startsWith('unmapped:')) ordered.push(b);
    }
    result = ordered;
  } else {
    // Legacy collapse (unchanged from v5.11.0): pick the primary HAE prefix bucket
    // (largest if multiple); merge all non-HAE buckets into it. Other HAE prefix
    // buckets remain as separate profiles (multi-person HAE households).
    const allBuckets = Array.from(provisional.values());
    const haeBuckets = allBuckets.filter((b) => b.isHae);
    const nonHaeBuckets = allBuckets.filter((b) => !b.isHae);

    if (haeBuckets.length > 0) {
      haeBuckets.sort((a, b) => b.entities.length - a.entities.length);
      const primary = haeBuckets[0];
      for (const nh of nonHaeBuckets) {
        for (const e of nh.entities) primary.entities.push(e);
        for (const p of nh.platforms) primary.platforms.add(p);
        for (const bk of nh.bindings) primary.bindings.add(bk);
      }
      result = haeBuckets;
    } else if (nonHaeBuckets.length > 0) {
      // No HAE bridge present — collapse all integration buckets into one synthetic profile.
      const merged = {
        profileId: 'biobed',
        entities: [],
        platforms: new Set(),
        bindings: new Set(),
        isHae: false,
      };
      for (const nh of nonHaeBuckets) {
        for (const e of nh.entities) merged.entities.push(e);
        for (const p of nh.platforms) merged.platforms.add(p);
        for (const bk of nh.bindings) merged.bindings.add(bk);
      }
      result = [merged];
    } else {
      result = [];
    }
  }

  _discoverProfilesCache.set(reg, { states, bindingIndex, result });
  return result;
}

// 5.12.0-beta.1 — return the union of binding keys observed in the most recent
// discoverProfiles() walk. Used by the Phase 2 editor UI to populate the
// "available bindings to map" picker. Always re-walks (no cache) because the
// caller is the admin editing surface, not a hot render path.
//
// 5.12.0-beta.3 — also surfaces `mobile_app` device bindings even when no
// entity passes classifyVital. The iOS Companion App is a legitimate Apple
// Health bridge but only forwards health vitals when the user enables them in
// the iOS Sensors settings; pre-mapping the device to a person ensures any
// future Apple Health data lands in the right bucket without a second round
// of Captain action. These rows are flagged `unmanaged: true` and carry a
// `classifiedCount` of 0 so the editor can render them with a clear hint.
export function listObservedBindings(hass) {
  if (!hass) return [];
  const reg = hass.entities || {};
  const dev = hass.devices || {};
  const states = hass.states || {};
  const out = new Map(); // bindingKey -> { count, classifiedCount, platform, sampleEntityId, deviceLabel? }
  const classifiedEids = new Set();

  const bump = (bindingKey, info, classified) => {
    let hit = out.get(bindingKey);
    if (!hit) {
      hit = { count: 0, classifiedCount: 0, platform: info.platform, sampleEntityId: info.sampleEntityId };
      if (info.deviceLabel) hit.deviceLabel = info.deviceLabel;
      out.set(bindingKey, hit);
    }
    hit.count++;
    if (classified) hit.classifiedCount++;
    // Prefer a classified entity as the sample for clarity in the editor.
    if (classified && info.sampleEntityId && hit.classifiedCount === 1) {
      hit.sampleEntityId = info.sampleEntityId;
    }
  };

  const deviceLabelFor = (deviceId) => {
    if (!deviceId) return null;
    const d = dev[deviceId];
    if (!d) return null;
    const name = d.name_by_user || d.name || null;
    if (!name) return null;
    if (d.manufacturer && d.model) return `${name} (${d.manufacturer} ${d.model})`;
    if (d.model) return `${name} (${d.model})`;
    return name;
  };

  // Pass 1 — every entity classifyVital recognizes.
  for (const eid of Object.keys(states)) {
    const reEntry = reg[eid];
    const cls = classifyVital(states[eid], reEntry);
    if (!cls) continue;
    classifiedEids.add(eid);
    const objId = eid.split('.')[1] || '';
    let bindingKey;
    let platform;
    let deviceLabel = null;
    if (!reEntry || STATE_ONLY_BRIDGE_PLATFORMS.has(reEntry?.platform) || STATE_ONLY_BRIDGE_DOMAINS.has(eid.split('.')[0])) {
      bindingKey = `hae:${objId.split('_')[0] || 'biobed'}`;
      platform = 'hae';
    } else if (reEntry.config_entry_id) {
      platform = reEntry.platform || 'unknown';
      bindingKey = `${platform}:${reEntry.config_entry_id}`;
      deviceLabel = deviceLabelFor(reEntry.device_id);
    } else if (reEntry.device_id) {
      platform = reEntry.platform || 'unknown';
      bindingKey = `${platform}:${reEntry.device_id}`;
      deviceLabel = deviceLabelFor(reEntry.device_id);
    } else {
      platform = reEntry.platform || 'unknown';
      bindingKey = `${platform}:_`;
    }
    bump(bindingKey, { platform, sampleEntityId: eid, deviceLabel }, true);
  }

  // Pass 2 — sweep every entity in a state-only bridge domain (hae.*, apple_health.*)
  // under `hae:<prefix>`. Catches the 24 of 32 hae.leith_* entities whose names
  // (active_energy, basal_energy_burned, sleep_analysis_*, walking_*, etc.) don't
  // map to a current classifyVital suffix but still belong in the user's bucket.
  for (const eid of Object.keys(states)) {
    const domain = eid.split('.')[0];
    if (!STATE_ONLY_BRIDGE_DOMAINS.has(domain)) continue;
    if (classifiedEids.has(eid)) continue;
    const objId = eid.split('.')[1] || '';
    const prefix = objId.split('_')[0] || 'biobed';
    bump(`hae:${prefix}`, { platform: 'hae', sampleEntityId: eid }, false);
  }

  // Pass 3 — surface every mobile_app device as a candidate binding even when
  // no entity passed classifyVital. Apple Health forwarding via the iOS
  // Companion App is opt-in; pre-mapping the device avoids a chicken-and-egg.
  const mobileDevicesSeen = new Set();
  for (const eid of Object.keys(states)) {
    const reEntry = reg[eid];
    if (reEntry?.platform !== 'mobile_app') continue;
    if (!reEntry.device_id) continue;
    mobileDevicesSeen.add(reEntry.device_id);
  }
  for (const deviceId of mobileDevicesSeen) {
    const bindingKey = `mobile_app:${deviceId}`;
    if (out.has(bindingKey)) continue; // already counted as a classified binding
    // Pick a representative sensor for this device.
    let sample = null;
    for (const eid of Object.keys(states)) {
      const r = reg[eid];
      if (r?.platform === 'mobile_app' && r.device_id === deviceId) { sample = eid; break; }
    }
    if (!sample) continue;
    const deviceLabel = deviceLabelFor(deviceId);
    out.set(bindingKey, {
      count: 0,
      classifiedCount: 0,
      platform: 'mobile_app',
      sampleEntityId: sample,
      deviceLabel: deviceLabel || null,
    });
  }
  for (const eid of Object.keys(states)) {
    const reEntry = reg[eid];
    if (reEntry?.platform !== 'mobile_app' || !reEntry.device_id) continue;
    const bindingKey = `mobile_app:${reEntry.device_id}`;
    const hit = out.get(bindingKey);
    if (hit) hit.count++;
  }

  return Array.from(out.entries()).map(([bindingKey, info]) => ({
    bindingKey,
    ...info,
    unmanaged: info.classifiedCount === 0,
  }));
}

// Stable, deterministic 7-char file id from a profile key. No PII — the input itself is a
// device_id or object_id segment, and the output is a hex hash truncated.
// Format mimics canonical "47xx-yyyyyy.z" — purely visual chrome.
export function fileIdFor(profileKey) {
  let h = 2166136261;
  const s = String(profileKey || 'biobed');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Two-segment numeric form: 4-digit prefix (always 47xx for the canonical look) + 6-digit body + .z
  const u = (h >>> 0);
  const a = 4700 + (u % 100);                   // 4700-4799
  const b = String((u >>> 7) % 1000000).padStart(6, '0');
  const z = (u >>> 17) % 10;
  return `${a}-${b}.${z}`;
}

// Decorative numeric scroll columns for Zone A header. Deterministic from seed; same per page load.
export function decorativeNumerics(seed, columns = 3) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  const out = [];
  for (let c = 0; c < columns; c++) {
    h = Math.imul(h ^ (c + 1), 2654435761);
    out.push(String((h >>> 0) % 1000000).padStart(6, '0'));
  }
  return out;
}

// Consent-gate storage. Boolean per profile id only — no values, no timestamp granularity beyond date.
const CONSENT_PREFIX = 'lcars_medical_consent.';
export function hasConsent(fileId) {
  try { return localStorage.getItem(CONSENT_PREFIX + fileId) === '1'; }
  catch (_) { return false; }
}
export function grantConsent(fileId) {
  try { localStorage.setItem(CONSENT_PREFIX + fileId, '1'); } catch (_) { /* noop */ }
}

// Format a numeric value for display in a vital cell. Does NOT log the value.
// 5.8.0-beta.1 (Worf Gap B): timestamp and enum kinds covered explicitly. Sleep
// duration value-range heuristic added because Oura reports seconds while older
// integrations report hours/minutes — same `kind` carries different magnitudes.
export function formatVital(kind, value, secondary = null) {
  if (value == null || (typeof value === 'number' && isNaN(value))) return '—';
  switch (kind) {
    case 'blood_pressure':
      return secondary != null ? `${Math.round(value)}/${Math.round(secondary)}` : `${Math.round(value)}`;
    case 'heart_rate':
    case 'respiration_rate':
    case 'active_minutes':
    case 'body_battery':
    case 'sleep_score':
    case 'recovery_score':
    case 'readiness':
    case 'hrv_balance':
    case 'stress_resilience':
    case 'sleep_efficiency':
    case 'activity_score':
    case 'cardiovascular_age':
    case 'bmi':
      return String(Math.round(value));
    case 'spo2':
    case 'body_fat_pct':
    case 'vo2_max':
      return `${value.toFixed(1)}`;
    case 'body_temp_deviation': {
      // Signed deviation; format with sign + 1 decimal (e.g. +0.4, -0.1).
      const sign = value > 0 ? '+' : (value < 0 ? '−' : '');
      return `${sign}${Math.abs(value).toFixed(1)}`;
    }
    case 'weight':
      return value.toFixed(1);
    case 'fat_mass':
    case 'lean_mass':
    case 'muscle_mass':
    case 'bone_mass':
      return value.toFixed(2);
    case 'visceral_fat':
      return value.toFixed(1);
    case 'hrv':
    case 'glucose':
      return String(Math.round(value));
    case 'steps':
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
    case 'workout_distance':
      return value.toFixed(1);
    case 'sleep_duration': {
      // Heuristic unit detection: Oura reports seconds (often > 1000); HA Fitbit
      // historically reported minutes (60-1000); legacy spec was hours (< 60).
      // Adapt per-value rather than per-platform so multi-source variants render
      // consistently even when one source emits seconds and another emits minutes.
      let hours;
      if (value > 1000)     hours = value / 3600;
      else if (value > 60)  hours = value / 60;
      else                  hours = value;
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    }
    case 'timestamp': {
      // Worf Gap B: timestamps render as HH:MM local time. ISO input or epoch ms.
      const d = (typeof value === 'number') ? new Date(value) : new Date(String(value));
      if (isNaN(d.getTime())) return '—';
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    case 'enum': {
      // Worf Gap B: enum (string) values render uppercased and underscore-spaced.
      // Caller should already have filtered through IGNORE_SUFFIXES; this path
      // exists for explicit enum-vital additions (none currently).
      return String(value).toUpperCase().replace(/_/g, ' ');
    }
    default:
      return String(value);
  }
}

// Worf Gap E: Oura rest_mode_state classifier. Returns one of:
//   'off'     — operator is in normal mode (no banner)
//   'rest'    — Oura rest_mode active OR `mental_resilience: low` (butterscotch banner)
//   'sick'    — Oura illness signal (tomato banner, audio alert on transition)
// Pulled from hass.states[<oura_*_rest_mode_state>] when present. Single string in;
// no PHI logged. Caller may pass either the raw state string or a state object.
//
// 5.11.0-beta.1 (S1-1): Oura v2.6.0 made `rest_mode` a binary_sensor with `on`/`off`
// state strings. The pre-2.6 enum lane (`sick|illness|fever|rest|recovery|low|moderate`)
// stays first so the legacy entity still classifies; the new `on` literal routes to 'rest'.
export function classifyRestMode(stateOrString) {
  if (!stateOrString) return 'off';
  const s = (typeof stateOrString === 'string' ? stateOrString : stateOrString.state || '').toLowerCase();
  if (!s || s === 'off' || s === 'none' || s === 'unknown' || s === 'unavailable') return 'off';
  if (/sick|illness|fever/.test(s)) return 'sick';
  if (/rest|recovery|low|moderate/.test(s)) return 'rest';
  if (s === 'on') return 'rest';
  return 'off';
}

// Worf Gap E: locate the per-profile rest_mode_state entity, if any. Returns
// `{ state, entityId }` or null. profileKey may include the `oura_ring_<name>` prefix
// from the hardened discoverProfiles fallback.
export function findRestModeState(hass, profileKey) {
  if (!hass || !hass.states || !profileKey) return null;
  const needle = String(profileKey).toLowerCase().replace(/^oura_ring_/, '');
  for (const eid of Object.keys(hass.states)) {
    const lid = eid.toLowerCase();
    if (!/_rest_mode$|_rest_mode_state$/.test(lid)) continue;
    if (!lid.includes(needle)) continue;
    return { state: hass.states[eid].state, entityId: eid };
  }
  return null;
}

// Readiness composite sub-scores. Oura HA integration historically exposes 2 (resting_HR,
// HRV balance); some forks expose more. This helper discovers `*_score` entities under
// the same profile that are NOT first-class vital kinds and labels them for the
// readiness composite tile's sub-lozenges.
// Returns an array of { entityId, label, value, status } — ordered, top-4.
const READINESS_SUBSCORE_LABELS = {
  resting_heart_rate_score: 'RESTING HR',
  hrv_balance_score:        'HRV BAL',
  body_temperature_score:   'BODY TEMP',
  recovery_index_score:     'RECOVERY',
  sleep_balance_score:      'SLEEP BAL',
  previous_day_activity_score: 'PREV DAY',
  previous_night_score:     'PREV NIGHT',
  activity_balance_score:   'ACT BAL',
};
const READINESS_SUBSCORE_ORDER = Object.keys(READINESS_SUBSCORE_LABELS);

export function discoverReadinessSubscores(hass, profileKey) {
  if (!hass || !hass.states || !profileKey) return [];
  const needle = String(profileKey).toLowerCase().replace(/^oura_ring_/, '');
  const out = [];
  for (const key of READINESS_SUBSCORE_ORDER) {
    const re = new RegExp(`_${key}$`);
    for (const eid of Object.keys(hass.states)) {
      const lid = eid.toLowerCase();
      if (!re.test(lid)) continue;
      if (needle && !lid.includes(needle)) continue;
      const raw = parseFloat(hass.states[eid].state);
      // v5.8.0-beta.2 — if this entity's state is 'unknown'/'unavailable', keep
      // scanning for another entity with the same suffix instead of giving up.
      if (!Number.isFinite(raw)) continue;
      let status = 'NOMINAL';
      if (raw < 50)       status = 'ALERT';
      else if (raw < 70)  status = 'ELEVATED';
      out.push({ entityId: eid, label: READINESS_SUBSCORE_LABELS[key], value: Math.round(raw), status });
      break;
    }
    if (out.length >= 4) break;
  }
  return out;
}

export const MEDICAL_STATUS = STATUS;
