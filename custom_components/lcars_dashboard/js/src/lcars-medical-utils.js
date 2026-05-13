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
]);

// Vital kinds in display order. Anchor slot = where on the silhouette the value renders.
// `tile` = whether it gets a Zone C detail tile.  `spark` = sparkline-eligible.
// `composite` = renders a multi-sub-lozenge tile (Oura-style readiness breakdown).
export const MEDICAL_VITAL_CLASSES = [
  { kind: 'blood_pressure',     anchor: 'left_arm',   label: 'BP',          unit: 'mmHg', spark: true,  tile: false, paired: true },
  { kind: 'heart_rate',         anchor: 'heart',      label: 'HR',          unit: 'bpm',  spark: true,  tile: true },
  { kind: 'spo2',               anchor: 'right_arm',  label: 'SpO2',        unit: '%',    spark: true,  tile: false },
  { kind: 'respiration_rate',   anchor: 'throat',     label: 'RESP',        unit: 'brpm', spark: false, tile: false },
  { kind: 'body_temp_deviation',anchor: 'forehead',   label: 'BODY TEMP',   unit: '°C',   spark: true,  tile: true },
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

// Anchor map (slot → {x,y} as % of 200x480 silhouette viewBox).
// Left/right are VIEWER-perspective (matches LCARS reference imagery, not anatomical).
export const ANCHOR_MAP = {
  head_top:   { x: 50, y:  4, label: 'top' },
  forehead:   { x: 50, y: 10, label: 'top' },
  throat:     { x: 50, y: 17, label: 'right' },
  heart:      { x: 44, y: 33, label: 'left' },
  left_lung:  { x: 38, y: 30, label: 'left' },
  right_lung: { x: 62, y: 30, label: 'right' },
  left_arm:   { x: 18, y: 42, label: 'left' },
  right_arm:  { x: 82, y: 42, label: 'right' },
  abdomen:    { x: 50, y: 52, label: 'right' },
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
  /_(percentage|percent)$/,                                           // ambiguous derived %
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
  heart_rate: [
    { re: /_current_heart_rate$/,            label: 'CURRENT' },
    { re: /_heart_pulse$/,                   label: 'PULSE' },
    { re: /_resting_heart_rate$/,            label: 'RESTING' },
    { re: /_average_heart_rate$/,            label: 'AVG' },
    { re: /_heart_rate$/,                    label: 'HR' },
    { re: /_average_sleep_heart_rate$/,      label: 'AVG SLEEP' },
    { re: /_lowest_sleep_heart_rate$/,       label: 'LOW SLEEP' },
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
export function classifyVital(state, entityRegistryEntry) {
  const eid = state.entity_id;
  const platform = entityRegistryEntry?.platform || '';
  if (!MEDICAL_PLATFORMS.has(platform)) return null;
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
  if (/_(heart_pulse|heart_rate|resting_heart_rate|current_heart_rate|average_heart_rate|lowest_sleep_heart_rate|average_sleep_heart_rate)$/.test(lid)) return withLabel({ kind: 'heart_rate' });

  // SpO2 — accept Oura's `_average` suffix and the standard.
  if (/_(spo2|spo2_average|oxygen_saturation|latest_spo2)$/.test(lid)) return withLabel({ kind: 'spo2' });

  if (/_respiration|_respiratory_rate$|_latest_respiration$/.test(lid)) return withLabel({ kind: 'respiration_rate' });

  if (/_weight$/.test(lid) && !/_goal$/.test(lid)) return withLabel({ kind: 'weight' });
  if (/_weight_goal$/.test(lid)) return { kind: 'weight_goal' };
  if (/_fat_ratio$|_body_fat$/.test(lid)) return withLabel({ kind: 'body_fat_pct' });
  if (/_fat_mass$/.test(lid)) return withLabel({ kind: 'fat_mass' });
  if (/_(fat_free_mass|lean_body_mass|lean_mass)$/.test(lid)) return withLabel({ kind: 'lean_mass' });
  if (/_muscle_mass$/.test(lid)) return withLabel({ kind: 'muscle_mass' });
  if (/_bone_mass$/.test(lid)) return withLabel({ kind: 'bone_mass' });
  if (/_visceral_fat(_index)?$/.test(lid)) return withLabel({ kind: 'visceral_fat' });
  if (/_bmi$/.test(lid)) return withLabel({ kind: 'bmi' });
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
  if (/_(hrv|hrv_last_night|hrv_last_night_average|average_sleep_hrv)$/.test(lid)) return withLabel({ kind: 'hrv' });

  if (/_body_battery$/.test(lid)) return withLabel({ kind: 'body_battery' });

  if (/_steps$/.test(lid)) return withLabel({ kind: 'steps' });

  // Active minutes — Oura high/medium/low activity time, Fitbit very_active, Garmin intensity.
  if (/_(high_activity_time|medium_activity_time|low_activity_time|minutes_very_active|intensity)$/.test(lid)) return withLabel({ kind: 'active_minutes' });

  if (/_last_workout_distance$|_last_activity_distance$|_distance_travelled_last_workout$|_distance_traveled_last_workout$/.test(lid)) return withLabel({ kind: 'workout_distance' });
  if (/_last_workout_|_last_activity_|_last_workout$|_last_activity$|_calories_burnt_last_workout$|_elevation_change_last_workout$|_pause_during_last_workout$/.test(lid)) return withLabel({ kind: 'last_workout' });

  if (/_glucose_value$/.test(lid)) return withLabel({ kind: 'glucose' });

  return null;
}

// Discover unique medical profiles by extracting the leading "<profile>_" prefix from
// classified entity ids. Phase 1: returns at most one (single-profile mode).
// 5.8.0-beta.1 (5X-B48 #124): memoized against (hass.entities, hass.states) reference
// identity — HA mutates these by replacement, not in-place, so reference equality is
// a sound cache key. Cuts discovery walks from every render to first-of-tick.
const _discoverProfilesCache = new WeakMap();
export function discoverProfiles(hass) {
  if (!hass) return [];
  const reg = hass.entities || {};
  const states = hass.states || {};
  let bucket = _discoverProfilesCache.get(reg);
  if (bucket && bucket.states === states) return bucket.result;

  const profiles = new Map();

  for (const eid of Object.keys(hass.states)) {
    const reEntry = reg[eid];
    if (!reEntry || !MEDICAL_PLATFORMS.has(reEntry.platform)) continue;
    const cls = classifyVital(hass.states[eid], reEntry);
    if (!cls) continue;
    // Profile id = device_id when present (canonical).
    // Worf 5X-F35e §4 hardening: when device_id is absent, Oura entity ids carry the
    // person prefix in segments 2..N-1 (`oura_ring_<name>_<metric>`). Falling back to
    // segment[0] alone would collapse two rings in one household into a single profile,
    // cross-contaminating PHI. Extract the person prefix instead.
    const objId = eid.split('.')[1] || '';
    const ouraMatch = objId.match(/^oura_ring_(.+?)_[a-z]/i);
    const profileKey = reEntry.device_id
      || (ouraMatch ? `oura_ring_${ouraMatch[1]}` : null)
      || objId.split('_')[0]
      || 'biobed';
    if (!profiles.has(profileKey)) {
      profiles.set(profileKey, { profileId: profileKey, entities: [], platforms: new Set() });
    }
    const p = profiles.get(profileKey);
    p.entities.push({ eid, state: hass.states[eid], cls, platform: reEntry.platform });
    p.platforms.add(reEntry.platform);
  }

  // Phase 1 single-profile mode: collapse to the largest bucket if >1 (multi-profile deferred).
  const list = Array.from(profiles.values());
  list.sort((a, b) => b.entities.length - a.entities.length);
  _discoverProfilesCache.set(reg, { states, result: list });
  return list;
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
export function classifyRestMode(stateOrString) {
  if (!stateOrString) return 'off';
  const s = (typeof stateOrString === 'string' ? stateOrString : stateOrString.state || '').toLowerCase();
  if (!s || s === 'off' || s === 'none' || s === 'unknown' || s === 'unavailable') return 'off';
  if (/sick|illness|fever/.test(s)) return 'sick';
  if (/rest|recovery|low|moderate/.test(s)) return 'rest';
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
