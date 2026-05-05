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
export const MEDICAL_VITAL_CLASSES = [
  { kind: 'blood_pressure',    anchor: 'left_arm',   label: 'BP',          unit: 'mmHg', spark: true,  tile: false, paired: true },
  { kind: 'heart_rate',        anchor: 'heart',      label: 'HR',          unit: 'bpm',  spark: true,  tile: true },
  { kind: 'spo2',              anchor: 'right_arm',  label: 'SpO2',        unit: '%',    spark: true,  tile: false },
  { kind: 'respiration_rate',  anchor: 'throat',     label: 'RESP',        unit: 'brpm', spark: false, tile: false },
  { kind: 'weight',            anchor: 'abdomen',    label: 'WEIGHT',      unit: 'kg',   spark: true,  tile: true },
  { kind: 'body_fat_pct',      anchor: null,         label: 'BODY FAT',    unit: '%',    spark: false, tile: true },
  { kind: 'bmi',               anchor: null,         label: 'BMI',         unit: '',     spark: false, tile: true },
  { kind: 'hydration',         anchor: null,         label: 'HYDRATION',   unit: 'L',    spark: false, tile: true },
  { kind: 'sleep_score',       anchor: 'head_top',   label: 'SLEEP',       unit: '/100', spark: true,  tile: true },
  { kind: 'sleep_duration',    anchor: null,         label: 'SLEEP TIME',  unit: 'h',    spark: false, tile: true },
  { kind: 'hrv',               anchor: null,         label: 'HRV',         unit: 'ms',   spark: true,  tile: true },
  { kind: 'body_battery',      anchor: null,         label: 'BODY BATT',   unit: '/100', spark: true,  tile: true },
  { kind: 'recovery_score',    anchor: null,         label: 'RECOVERY',    unit: '/100', spark: true,  tile: true },
  { kind: 'steps',             anchor: 'right_foot', label: 'STEPS',       unit: '',     spark: true,  tile: true },
  { kind: 'active_minutes',    anchor: 'left_leg',   label: 'ACTIVE',      unit: 'min',  spark: false, tile: true },
  { kind: 'workout_distance',  anchor: 'right_leg',  label: 'DISTANCE',    unit: 'km',   spark: false, tile: false },
  { kind: 'last_workout',      anchor: null,         label: 'LAST WORKOUT',unit: '',     spark: false, tile: true },
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
  heart_rate:     { nominalMin: 50, nominalMax: 80, elevMax: 100, alertMax: 100, alertMin: 40 },
  spo2:           { nominalMin: 95, elevMin: 92 },
  respiration_rate: { nominalMin: 12, nominalMax: 20, elevMax: 24 },
  glucose:        { nominalMin: 70, nominalMax: 140, elevLow: 60, elevHigh: 180 },
  body_battery:   { nominalMin: 40, elevMin: 20 },
  sleep_score:    { nominalMin: 80, elevMin: 60 },
  recovery_score: { nominalMin: 70, elevMin: 50 },
};

const STATUS = Object.freeze({ NOMINAL: 'NOMINAL', ELEVATED: 'ELEVATED', ALERT: 'ALERT', OFFLINE: 'OFFLINE' });
const PRECEDENCE = { OFFLINE: 4, ALERT: 3, ELEVATED: 2, NOMINAL: 1 };

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
      if (value < cfg.elevMin) return STATUS.ALERT;
      if (value < cfg.nominalMin) return STATUS.ELEVATED;
      return STATUS.NOMINAL;
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

// Match a HA state object to a vital_kind. Pattern-based; tolerant to platform variation.
// Returns { kind, isSystolic, isDiastolic } or null.
export function classifyVital(state, entityRegistryEntry) {
  const eid = state.entity_id;
  const platform = entityRegistryEntry?.platform || '';
  if (!MEDICAL_PLATFORMS.has(platform)) return null;
  const lid = eid.toLowerCase();

  if (/_systolic.*blood.*pressure$|_systolic_blood_pressure$/.test(lid)) return { kind: 'blood_pressure', isSystolic: true };
  if (/_diastolic.*blood.*pressure$|_diastolic_blood_pressure$/.test(lid)) return { kind: 'blood_pressure', isDiastolic: true };
  if (/_heart_pulse$|_heart_rate$|_resting_heart_rate$/.test(lid)) return { kind: 'heart_rate' };
  if (/_spo2$|_oxygen_saturation$/.test(lid)) return { kind: 'spo2' };
  if (/_respiration|_respiratory_rate$/.test(lid)) return { kind: 'respiration_rate' };
  if (/_weight$/.test(lid) && !/_goal$/.test(lid)) return { kind: 'weight' };
  if (/_weight_goal$/.test(lid)) return { kind: 'weight_goal' };
  if (/_fat_ratio$|_body_fat$/.test(lid)) return { kind: 'body_fat_pct' };
  if (/_bmi$/.test(lid)) return { kind: 'bmi' };
  if (/_hydration$/.test(lid)) return { kind: 'hydration' };
  if (/_sleep_score$|_readiness$/.test(lid)) return { kind: 'sleep_score' };
  if (/_sleep.*hours$|_sleep_duration$|_minutes_asleep$/.test(lid)) return { kind: 'sleep_duration' };
  if (/_hrv$|_hrv_last_night/.test(lid)) return { kind: 'hrv' };
  if (/_body_battery$/.test(lid)) return { kind: 'body_battery' };
  if (/_training_readiness$|_recovery_score$/.test(lid)) return { kind: 'recovery_score' };
  if (/_steps$/.test(lid)) return { kind: 'steps' };
  if (/_minutes_very_active$|_intensity/.test(lid)) return { kind: 'active_minutes' };
  if (/_last_workout_distance/.test(lid) || /_last_activity_distance/.test(lid)) return { kind: 'workout_distance' };
  if (/_last_workout_/.test(lid) || /_last_activity_/.test(lid)) return { kind: 'last_workout' };
  if (/_glucose_value$/.test(lid)) return { kind: 'glucose' };
  return null;
}

// Discover unique medical profiles by extracting the leading "<profile>_" prefix from
// classified entity ids. Phase 1: returns at most one (single-profile mode).
export function discoverProfiles(hass) {
  if (!hass) return [];
  const reg = hass.entities || {};
  const profiles = new Map();

  for (const eid of Object.keys(hass.states)) {
    const reEntry = reg[eid];
    if (!reEntry || !MEDICAL_PLATFORMS.has(reEntry.platform)) continue;
    const cls = classifyVital(hass.states[eid], reEntry);
    if (!cls) continue;
    // Profile id = device_id if present, else first segment of object_id
    const objId = eid.split('.')[1] || '';
    const profileKey = reEntry.device_id || objId.split('_')[0] || 'biobed';
    if (!profiles.has(profileKey)) {
      profiles.set(profileKey, { profileId: profileKey, entities: [], platforms: new Set() });
    }
    const p = profiles.get(profileKey);
    p.entities.push({ eid, state: hass.states[eid], cls, platform: reEntry.platform });
    p.platforms.add(reEntry.platform);
  }

  // Phase 1 single-profile mode: collapse to the largest bucket if >1 (multi-profile in beta.3).
  const list = Array.from(profiles.values());
  list.sort((a, b) => b.entities.length - a.entities.length);
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
export function formatVital(kind, value, secondary = null) {
  if (value == null || isNaN(value)) return '—';
  switch (kind) {
    case 'blood_pressure':
      return secondary != null ? `${Math.round(value)}/${Math.round(secondary)}` : `${Math.round(value)}`;
    case 'heart_rate':
    case 'respiration_rate':
    case 'active_minutes':
    case 'body_battery':
    case 'sleep_score':
    case 'recovery_score':
    case 'bmi':
      return String(Math.round(value));
    case 'spo2':
    case 'body_fat_pct':
      return `${value.toFixed(1)}`;
    case 'weight':
      return value.toFixed(1);
    case 'hrv':
    case 'glucose':
      return String(Math.round(value));
    case 'steps':
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
    case 'workout_distance':
      return value.toFixed(1);
    case 'sleep_duration': {
      const h = Math.floor(value);
      const m = Math.round((value - h) * 60);
      return `${h}h ${m}m`;
    }
    default:
      return String(value);
  }
}

export const MEDICAL_STATUS = STATUS;
