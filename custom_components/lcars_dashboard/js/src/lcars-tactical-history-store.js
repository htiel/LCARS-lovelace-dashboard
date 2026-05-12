/**
 * lcars-tactical-history-store.js
 *
 * Module-scope cache + polling client for the Tactical Chronicle mode (#224).
 *
 * Single in-flight request enforced via AbortController. Uses HA WebSocket
 * `history/history_during_period` with `minimal_response: true,
 * no_attributes: true, significant_changes_only: true` per spec §7.7.
 *
 * Security gates (BLOCKING — see specs/LCARS-TACTICAL-CHRONICLE-MODE-SPEC.md §7):
 *   • No raw payload logging (counts only)
 *   • No localStorage/IndexedDB persistence
 *   • Default-deny domains + entity_id patterns enforced before query
 *   • Hard cap 170 entities, hours clamped [6,72]
 *   • Camera attributes stripped if any camera leaks through
 *
 * Backoff schedule on failure: 30 → 60 → 120 → 300 s (cap).
 * Hidden-tab pause via visibilitychange.
 */

const LOG_TAG = 'TacticalHistory';

const DENY_DOMAINS = new Set(['camera', 'device_tracker', 'person', 'media_player']);
const DENY_PATTERNS = [/secret/i, /key/i, /token/i, /password/i, /api_/i];
const SENSITIVE_AREA_RE = /guest|nursery|bath|bathroom|kid/i;

const ENTITY_CAP = 170;
const HOURS_MIN = 6;
const HOURS_MAX = 72;

const POLL_INTERVAL_MS = 30_000;
const MODE_SWITCH_DEBOUNCE_MS = 500;
const BACKOFF_SCHEDULE_S = [30, 60, 120, 300];

const PARALLEL_BATCH_SIZE = 60;

const CAMERA_STRIP_KEYS = [
  'entity_picture', 'access_token', 'frontend_stream_type',
  'stream_source', 'last_image',
];

/* ── Module-scoped store ──────────────────────────────────────────── */
const _state = {
  cache: new Map(),         // entityId -> Array<segment>
  lastCursor: null,         // ISO string of most recent fetch end
  hass: null,
  filter: null,             // { entityIds, hours, areas }
  pollTimer: null,
  abortCtrl: null,
  visibilityHook: false,
  failureCount: 0,
  subscribers: new Set(),
  debounceTimer: null,
};

/* ── Filtering & sanitisation ─────────────────────────────────────── */
function isDenied(entityId) {
  if (typeof entityId !== 'string') return true;
  const dot = entityId.indexOf('.');
  if (dot < 0) return true;
  const domain = entityId.slice(0, dot);
  if (DENY_DOMAINS.has(domain)) return true;
  for (const re of DENY_PATTERNS) if (re.test(entityId)) return true;
  return false;
}

function sanitizeEntityList(rawList, { excludedAreas = [], hass = null } = {}) {
  const out = [];
  const excluded = new Set();
  const areaExcl = new Set(excludedAreas);
  for (const eid of (rawList || [])) {
    if (out.length >= ENTITY_CAP) break;
    if (isDenied(eid)) { excluded.add(eid); continue; }
    if (hass && areaExcl.size) {
      const entry = hass.entities?.[eid];
      const areaId = entry?.area_id;
      const name = entry?.name || eid;
      if (areaId && areaExcl.has(areaId)) { excluded.add(eid); continue; }
      if (SENSITIVE_AREA_RE.test(name) || SENSITIVE_AREA_RE.test(areaId || '')) {
        excluded.add(eid); continue;
      }
    }
    out.push(eid);
  }
  return { allowed: out, excludedCount: excluded.size };
}

function clampHours(h) {
  const n = Number(h);
  if (!isFinite(n)) return 24;
  return Math.max(HOURS_MIN, Math.min(HOURS_MAX, Math.round(n)));
}

/* ── State → segment conversion ───────────────────────────────────── */
function statesToSegments(states, windowEndMs) {
  // history/history_during_period returns Array<{s, lu}>  with minimal_response
  // s = state, lu = last_updated (ISO or epoch). We synthesise [start, end] for
  // each "on-like" run. Raw arrays are dropped after return.
  if (!Array.isArray(states) || states.length === 0) return [];
  const out = [];
  let runStart = null;
  let runState = null;
  for (let i = 0; i < states.length; i++) {
    const sample = states[i];
    const stateVal = sample.s || sample.state;
    const ts = sample.lu || sample.last_updated || sample.last_changed;
    const tMs = typeof ts === 'number' ? ts * 1000 : Date.parse(ts);
    if (!isFinite(tMs)) continue;
    if (stateVal !== runState) {
      if (runStart != null && runState != null && isOnLike(runState)) {
        out.push({ start: runStart, end: tMs, state: runState });
      }
      runStart = tMs;
      runState = stateVal;
    }
  }
  if (runStart != null && runState != null && isOnLike(runState)) {
    out.push({ start: runStart, end: windowEndMs, state: runState });
  }
  return out;
}

function isOnLike(stateVal) {
  if (!stateVal) return false;
  const s = String(stateVal).toLowerCase();
  if (s === 'on' || s === 'open' || s === 'unlocked' || s === 'triggered' || s === 'pending') return true;
  if (s.startsWith('armed')) return true;
  return false;
}

/* ── WebSocket fetch ──────────────────────────────────────────────── */
async function _fetchHistoryWindow(hass, entityIds, startTime, endTime, signal) {
  // Parallel batches of ≤PARALLEL_BATCH_SIZE for serialisation friendliness.
  const batches = [];
  for (let i = 0; i < entityIds.length; i += PARALLEL_BATCH_SIZE) {
    batches.push(entityIds.slice(i, i + PARALLEL_BATCH_SIZE));
  }
  const merged = {};
  await Promise.all(batches.map(async (batch) => {
    if (signal && signal.aborted) return;
    const result = await hass.callWS({
      type: 'history/history_during_period',
      start_time: startTime,
      end_time: endTime,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: true,
      entity_ids: batch,
    });
    if (signal && signal.aborted) return;
    if (result && typeof result === 'object') {
      for (const eid of Object.keys(result)) {
        // strip camera attributes defensively if any leaked through
        const arr = result[eid];
        if (Array.isArray(arr)) {
          for (const sample of arr) {
            if (sample && typeof sample === 'object') {
              for (const k of CAMERA_STRIP_KEYS) {
                if (k in sample) delete sample[k];
                if (sample.a && k in sample.a) delete sample.a[k];
              }
            }
          }
          merged[eid] = arr;
        }
      }
    }
  }));
  return merged;
}

/* ── Polling driver ───────────────────────────────────────────────── */
function _schedulePoll(delayMs) {
  if (_state.pollTimer) clearTimeout(_state.pollTimer);
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
  _state.pollTimer = setTimeout(_pollDelta, delayMs);
}

function _onBackoff() {
  _state.failureCount = Math.min(_state.failureCount + 1, BACKOFF_SCHEDULE_S.length - 1);
  const delaySec = BACKOFF_SCHEDULE_S[_state.failureCount];
  _schedulePoll(delaySec * 1000);
}

async function _pollDelta() {
  if (!_state.filter || !_state.hass) return;
  if (document.visibilityState !== 'visible') return;
  if (_state.abortCtrl) { try { _state.abortCtrl.abort(); } catch (_) {} }
  _state.abortCtrl = new AbortController();
  const signal = _state.abortCtrl.signal;
  const startTime = _state.lastCursor || new Date(Date.now() - clampHours(_state.filter.hours) * 3600_000).toISOString();
  const endTime = new Date().toISOString();
  try {
    const result = await _fetchHistoryWindow(_state.hass, _state.filter.entityIds, startTime, endTime, signal);
    if (signal.aborted) return;
    const endMs = Date.parse(endTime);
    for (const eid of Object.keys(result)) {
      const segs = statesToSegments(result[eid], endMs);
      // merge into cache (replace overlapping end-edge segments)
      const prev = _state.cache.get(eid) || [];
      // Drop prev entries that started after startTime (will be re-derived)
      const startMs = Date.parse(startTime);
      const kept = prev.filter(s => s.end < startMs);
      _state.cache.set(eid, kept.concat(segs));
      // Defensive: clear raw arrays from result so they're GC'd
      result[eid] = null;
    }
    _state.lastCursor = endTime;
    _state.failureCount = 0;
    _notify();
    _schedulePoll(POLL_INTERVAL_MS);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    // count-only logging — never log payload
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`${LOG_TAG}: poll failed; failure #${_state.failureCount + 1}`);
    }
    _onBackoff();
  }
}

function _notify() {
  for (const cb of _state.subscribers) {
    try { cb(); } catch (err) {
      if (typeof console !== 'undefined' && console.debug) console.debug(`${LOG_TAG}: subscriber error`);
    }
  }
}

function _installVisibilityHook() {
  if (_state.visibilityHook || typeof document === 'undefined') return;
  _state.visibilityHook = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      _schedulePoll(0);
    } else {
      if (_state.pollTimer) { clearTimeout(_state.pollTimer); _state.pollTimer = null; }
      if (_state.abortCtrl) { try { _state.abortCtrl.abort(); } catch (_) {} _state.abortCtrl = null; }
    }
  });
}

/* ── Public API ───────────────────────────────────────────────────── */
export function tacticalHistoryStart(hass, { entityIds, hours, excludedAreas } = {}) {
  if (!hass) throw new Error('hass required');
  const { allowed, excludedCount } = sanitizeEntityList(entityIds, { excludedAreas, hass });
  if (excludedCount > 0 && typeof console !== 'undefined' && console.debug) {
    console.debug(`${LOG_TAG}: ${excludedCount} entities excluded by policy`);
  }
  _installVisibilityHook();
  _state.hass = hass;
  _state.filter = {
    entityIds: allowed,
    hours: clampHours(hours),
    excludedAreas: excludedAreas || [],
  };
  _state.lastCursor = null;
  _state.cache.clear();
  if (_state.debounceTimer) clearTimeout(_state.debounceTimer);
  _state.debounceTimer = setTimeout(() => {
    _state.debounceTimer = null;
    _schedulePoll(0);
  }, MODE_SWITCH_DEBOUNCE_MS);
}

export function tacticalHistoryStop() {
  if (_state.pollTimer) { clearTimeout(_state.pollTimer); _state.pollTimer = null; }
  if (_state.debounceTimer) { clearTimeout(_state.debounceTimer); _state.debounceTimer = null; }
  if (_state.abortCtrl) { try { _state.abortCtrl.abort(); } catch (_) {} _state.abortCtrl = null; }
  _state.cache.clear();
  _state.lastCursor = null;
  _state.filter = null;
  _state.failureCount = 0;
}

export function tacticalHistoryUpdateHass(hass) {
  _state.hass = hass;
}

export function tacticalHistorySegments(entityId) {
  return _state.cache.get(entityId) || [];
}

export function tacticalHistorySubscribe(cb) {
  _state.subscribers.add(cb);
  return () => _state.subscribers.delete(cb);
}

export function tacticalHistoryStats() {
  let segs = 0;
  for (const v of _state.cache.values()) segs += v.length;
  return {
    entityCount: _state.cache.size,
    segmentCount: segs,
    failureCount: _state.failureCount,
  };
}

export const __TACTICAL_HISTORY_FOR_TESTING = {
  isDenied,
  sanitizeEntityList,
  clampHours,
  statesToSegments,
  isOnLike,
  DENY_DOMAINS,
  DENY_PATTERNS,
  SENSITIVE_AREA_RE,
  ENTITY_CAP,
  HOURS_MIN,
  HOURS_MAX,
};
