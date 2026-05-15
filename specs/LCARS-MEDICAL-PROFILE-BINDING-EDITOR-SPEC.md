# LCARS Medical Profile Binding Editor — Design Specification

**Author**: Lt. Cmdr. Data (architecture lead) with synthesis from Geordi (UI), Wesley (creative), Worf (privacy), Riker (triage)
**Stardate**: 2026.05.15
**Status**: APPROVED for v5.11.0 implementation. Ships in the same release train as the S0 fixes from [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md) §4.1.
**Branch**: `5.0`
**Privacy class**: PHI-routing — every binding change is a routing change. Worf re-bless required before the WS handler ships.
**Extends**: [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) §4 (entity contract, person binding) and [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md) §4.1 (S0-1 binding-key fix)
**Precedent**: v4.23.0 panel-placement override (`__init__.py` WS commands `lcars_dashboard/panel_order/*`, editor `lcars-edit-panel-order-card.js`, reload via `fireEvent('lcars_dashboard_reload')`). This spec clones that pattern verbatim.

---

## 0. Goals

1. Replace the broken Oura `oura_ring_<name>_*` regex (S0-1) with a deterministic, persistent person↔source binding.
2. Allow one person to merge data from multiple integrations (the Captain's case: Oura + Withings + Apple Health via Health Auto Export, all bound to `person.gandalf_the_grey`).
3. Allow the user to order sources by precedence so duplicate vitals (e.g. HR from both Oura and Apple Health) resolve deterministically across HA restarts.
4. Allow per-vital-kind overrides (rare but real: "BP from Withings, even though Oura is my global #1") without forcing the user to think about the matrix on first use.
5. Survive token rotation, integration delete-and-re-add, and HA restarts without data loss or surprise routing changes.
6. Render unbound integrations under the existing "BIOBED" pseudo-profile so users who never open the editor see exactly what they see today (zero regression).
7. Auto-suggest bindings on first boot from `person.user_id` ↔ `config_entry.title`/email matches; never auto-write after the store exists.
8. **First-class support for HAE (Health Auto Export) and other webhook/REST/template-based bridges** that have NO config entry. These bind via `kind: entity_prefix` and discovery walks `hass.states` (not just the entity registry). The HAE prefix (configured by the operator inside the Health Auto Export iOS app — Captain confirmation 2026-05-15: "leith is my name and I configured it in the sync; should be unique per user who syncs data") is treated as the **authoritative person identifier** for HAE-derived sources. A second household member would pick a different prefix, producing a separate `kind: entity_prefix` binding rather than colliding.
9. **Tiles with sensor history are clickable** — tap a tile to open HA's native more-info dialog (with built-in history chart) for the canonical entity that resolved into that tile.

## 1. Non-Goals

- Not a per-vital matrix editor. Per-vital overrides are an "EXCEPTIONS" disclosure, not the default UX.
- Not a multi-step wizard. LCARS chrome is single-screen; the team rejected wizard pattern unanimously.
- Not a live preview pane (deferred to v2 backlog).
- Not a divergence-detection / compare-sources UI (deferred to v2 backlog).
- Not a `person_composite.*` first-class HA entity (deferred to its own spec; see [briefing](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md) Wesley I-1).
- Not generalized to other dashboards (Engineering, Tactical) yet — `lcars-data-source-router` shared primitive deferred until the second consumer exists.
- Not a Withings webhook diagnostic banner (separate v5.11.x feature; tracked in the briefing W3/X5).

## 1.1 Phase A (shipped in v5.11.0-beta.1, no editor yet)

While the editor + backend WS commands are still in flight, the following Phase A behavior ships with v5.11.0-beta.1 to immediately fix the S0 release blockers and unlock HAE/Apple Health rendering:

- **Single-profile collapse with HAE-prefix preference.** `discoverProfiles(hass)` walks `hass.states`; for each entity that `classifyVital` admits:
  - If the entity has no registry entry OR its platform is in `STATE_ONLY_BRIDGE_PLATFORMS` (`apple_health`, `hae`, `health_auto_export`), bucket by the **leading object_id segment** (Captain's `leith` becomes the `leith` profile).
  - Otherwise bucket provisionally by `device:<device_id>` or `entry:<config_entry_id>`.
  - **Collapse**: All non-HAE buckets are merged into the largest HAE bucket if any exists; otherwise into a synthetic `biobed` profile. Multiple HAE prefix buckets remain separate (multi-person households).
- **No persistent storage in Phase A.** No `medical_profiles.yaml`, no WS commands, no editor card. The collapse heuristic is deterministic from `hass.states` alone.
- **The broken `oura_ring_(.+?)_[a-z]/i` regex is gone.** The hardened fallback (which previously shattered Oura entities into pseudo-profiles when the entity registry raced ahead of the device registry) no longer runs.
- **`classifyVital` admits state-only entities.** The pre-Phase-A platform gate (`if (!MEDICAL_PLATFORMS.has(platform)) return null`) now reads `if (entityRegistryEntry && !MEDICAL_PLATFORMS.has(platform)) return null` — missing registry entry falls through to suffix matching, so HAE state-only entities are classified by their suffix alone.
- **HAE / Apple Health classifier patterns.** Heart rate (`_heart_rate_avg$`, `_heart_rate_max$`, `_heart_rate_min$`, `_walking_heart_rate_average$`), SpO2 (`_blood_oxygen_saturation$`), body fat (`_body_fat_percentage$`), BMI (`_body_mass_index$`).
- **Resilience enum vocabulary fix (S0-2).** `_renderEnumTile` rewritten for Oura v2.0.0+ vocabulary: `limited|low` → ALERT, `adequate` → ELEVATED, `solid|strong|exceptional|great` → NOMINAL.
- **Oura `_resting_heart_rate$` is dropped from heart_rate (S0-3).** It's a 0–100 score in Oura post-v2.0.0, not BPM. For non-Oura platforms (HAE, Apple Health, Withings, Fitbit, Garmin) the same suffix continues to route to heart_rate as BPM.
- **Rest-mode binary_sensor (S1-1).** `classifyRestMode` recognizes `'on'` as `'rest'` so Oura v2.6.0+ binary_sensor `_rest_mode` entities surface the rest banner.
- **Clickable tiles (Captain explicit ask).** Tile click / Enter / Space invokes `showMoreInfo(canonical.eid)`, opening HA's native more-info dialog with its built-in history graph. Tiles with no resolved entity (offline placeholders) are not interactive.

Phase B (this spec's main body) replaces the single-profile collapse with per-binding routing once the editor lands.

## 2. User-facing flow

The Captain's request, refined by Geordi §2 (master/detail wins over wizard) and Wesley §1.E (single-page progressive disclosure, no "Next" button):

1. Captain navigates to `/lcars-medical/home`.
2. Captain taps the gear button on the dashboard header rail (currently no-op at [lcars-medical-layout.js#L90-L98](../custom_components/lcars_dashboard/js/src/lcars-medical-layout.js#L90-L98) — wire it up).
3. A modal opens with three vertical zones, all visible simultaneously:
   - **Zone 1 — Person rail (top)**: horizontal radiogroup of all `person.*` entities. Tap to select one. Single-select. Reuses `<lcars-option-strip>`.
   - **Zone 2 — Sources (middle, half-width)**: multi-select check-pill list of every detected health source (config_entry or entity_prefix). Each pill shows the platform icon + account label + a `SUGGESTED` chip if first-boot fuzzy-match scored HIGH. Reuses the `panel-item` pill vocabulary from `lcars-edit-panel-order-card.js`.
   - **Zone 3 — Precedence (middle, half-width)**: ordered list of currently-checked sources, each with ▲/▼ buttons. Reuses the `move-btn` pattern from `lcars-sidebar-reorder.js#L160-L171`. Below it, a collapsed "EXCEPTIONS" disclosure for per-vital overrides — empty by default; one tap to expand and add a vital-kind→source pin.
   - **Zone 4 — Footer**: `[ RESET ]   [ CANCEL ]   [ SAVE ]` action row.
4. Captain checks Oura + Withings (both pre-checked HIGH-confidence on first open), reorders them with ▲/▼, taps SAVE.
5. Modal closes. Card receives `lcars_dashboard_reload` event, refetches profile map, repaints in ~150ms. No page reload.
6. When Apple Health is added later, Captain re-opens the editor, finds it pre-checked under "SUGGESTED — APL · Gandalf's iPhone", drops it into slot 3, saves.

ASCII mockup of the modal:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PERSON ↔ SOURCE MAPPING                                          [×]   │
├─────────────────────────────────────────────────────────────────────────┤
│  PERSON                                                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐                          │
│  │ GANDALF* │  FRODO   │  ARWEN   │ SAMWISE  │                          │
│  └──────────┴──────────┴──────────┴──────────┘                          │
│                                                                         │
│  SOURCES (for GANDALF)            │  PRECEDENCE                         │
│  ┌────────────────────────────┐   │  ┌──────────────────────────────┐   │
│  │ ☑ ORA · alice@example  SUG │   │  │ 1. ORA · alice@example  ▲ ▼ │   │
│  │ ☑ WTH · 9876543        SUG │   │  │ 2. WTH · 9876543        ▲ ▼ │   │
│  │ ☑ APL · gandalf-iphone SUG │   │  │ 3. APL · gandalf-iphone ▲ ▼ │   │
│  │ ☐ ORA · saruman@example    │   │  └──────────────────────────────┘   │
│  └────────────────────────────┘   │                                     │
│                                   │  ▶ EXCEPTIONS (none configured)     │
│                                   │                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                              [ RESET ]    [ CANCEL ]    [ SAVE ]        │
└─────────────────────────────────────────────────────────────────────────┘
```

Expanded EXCEPTIONS (collapsed by default):

```
▼ EXCEPTIONS
  ┌──────────────────────────────────────────────────────┐
  │ BLOOD PRESSURE  →  WTH · 9876543              [×]   │
  │ GLUCOSE         →  ORA · alice@example         [×]   │
  │ [ + ADD EXCEPTION ]                                  │
  └──────────────────────────────────────────────────────┘
```

## 3. Storage

### 3.1 Path

```
<HA_config_dir>/lcars-dashboard/configs/medical_profiles.yaml
```

Co-located with the existing per-concern files (`panel_overrides.yaml`, `panel_column_overrides.yaml`, `areas.yaml`, `entities.yaml`, `devices.yaml`, `settings.yaml`). New file, do NOT extend `panel_overrides.yaml` — different concern (identity vs. layout), different reader (Medical Bay never invokes `LcarsHomepageCard._loadConfiguration()`).

### 3.2 Schema (v1)

```yaml
schema_version: 1
generated_at: "2026-05-15T00:00:00Z"
profiles:
  person.gandalf_the_grey:
    display_name: "GANDALF THE GREY"        # cached for editor display only; not authoritative
    sources:
      - kind: config_entry                  # discriminated union: config_entry | entity_prefix | device_id
        id: "01HABC..."                     # for config_entry: the entry_id ULID
        platform: oura
        label: "Oura — alice@example.com"
        enabled: true
        added_at: "2026-05-15T00:00:00Z"
        last_seen: "2026-05-15T00:00:00Z"   # last successful entity resolution under this source
        tombstoned: false                   # true when config_entry vanished but slot is preserved
      - kind: config_entry
        id: "01HDEF..."
        platform: withings
        label: "Withings — alice@example.com"
        enabled: true
        added_at: "2026-05-15T00:00:00Z"
        last_seen: "2026-05-15T00:00:00Z"
        tombstoned: false
      - kind: entity_prefix                 # for Apple Health (no config entry — bridged via mobile_app/HomeKit)
        id: "applehealth_gandalf"           # matches sensor.applehealth_gandalf_*
        platform: apple_health
        label: "Apple Health — Gandalf's iPhone"
        enabled: true
        added_at: "2026-05-15T00:00:00Z"
        last_seen: "2026-05-15T00:00:00Z"
        tombstoned: false
    overrides:                              # OPTIONAL per-vital pin; empty/absent in the common case
      blood_pressure: "01HDEF..."           # value = source.id; resolver scans only this source
      glucose: "01HABC..."
```

Field rules:

| Field | Rule |
|---|---|
| `schema_version` | Required at file root. Mismatched version → reject in WS handler with `schema_version_unsupported` error; do not auto-overwrite. |
| `kind` | Discriminated union. v1 implements `config_entry` (primary, for OAuth integrations like Oura/Withings) and `entity_prefix` (for webhook/REST bridges with no config entry: HAE, Apple Health, custom Node-RED endpoints). `device_id` reserved for future per-physical-device sub-bindings — schema accommodates without v2 bump. |
| `id` | For `config_entry`: `config_entry.entry_id` (ULID). For `entity_prefix`: the leading underscore-delimited segments common to that source's entities (e.g. `applehealth_gandalf` → matches `sensor.applehealth_gandalf_vitals_heart_rate`). The match is `entity_id.split('.')[1] === id || entity_id.split('.')[1].startsWith(id + '_')`. |
| `platform` | Mirrors `MEDICAL_PLATFORMS` (which gains `apple_health` and `hae` in this PR). Used for icon selection in editor and for diagnostic UI; not consulted by the resolver. For `entity_prefix` sources, the editor sets this from the prefix's first segment when adding a custom binding. |
| `label` | Human-readable string for editor display. Cached at write-time; refreshed on `/discover`. |
| `enabled` | Controls whether the resolver visits this source. False = treated as if absent. |
| `tombstoned` | True when the resolver detects the source's `config_entry` no longer exists (config_entry kind only; entity_prefix sources never tombstone — entities can come and go without integration removal). Editor renders with amber border + "RESTORE / REMOVE" affordance. Resolver skips tombstoned sources entirely. |
| `last_seen` | ISO 8601. Updated by the resolver when it successfully reduces ≥1 entity from this source. Drives "INACTIVE FOR 30 DAYS" decoration. |
| `added_at` | ISO 8601. Diagnostic only; Worf may consult for audit. |
| `overrides` | Optional. Maps `vital_kind` → `source.id`. Resolver consults `overrides[kind]` first (with no fall-through; see §5.2 edge cases). |

### 3.3 Validation

All `set` payloads pass through `_safe_json_loads()` ([__init__.py#L101](../custom_components/lcars_dashboard/__init__.py#L101)) — 256 KB cap, depth ≤20, scalar rejection. Additional schema validation in the handler:

- `person_entity_id` must match an entity whose state-domain is `person`
- `sources[].id` references for `kind: config_entry` are NOT pre-validated against existing config entries — accepted but persisted with `tombstoned: true` if absent (allows pre-staging during integration setup churn)
- `overrides` keys validated against the JS-side `MEDICAL_VITAL_CLASSES` kind list (Python-side mirror constant)
- `overrides` values validated to be present in `sources[].id` (you can't pin to a source you didn't bind)
- Duplicate `source.id` within a profile → `invalid_format`

### 3.4 Concurrency

Per-file LRU `asyncio.Lock` via `_get_yaml_lock("lcars-dashboard/configs/medical_profiles.yaml")` ([__init__.py#L67](../custom_components/lcars_dashboard/__init__.py#L67)). All read-modify-write paths acquire the lock for the full RMW span. Writes use `_write_yaml_file()` via `hass.async_add_executor_job` (event-loop safe).

## 4. Backend — websocket commands

Mirrors the v4.23.0 panel-order pattern at [__init__.py#L1794-L1900](../custom_components/lcars_dashboard/__init__.py#L1794-L1900).

### 4.1 `lcars_dashboard/medical_profiles/get`

- **Auth**: any authenticated user (read-only)
- **Payload**: none
- **Returns**:

```json
{
  "schema_version": 1,
  "profiles": { "person.gandalf_the_grey": { ...as in §3.2... } },
  "suggestions": [
    {
      "person_entity_id": "person.frodo",
      "source": { "kind": "config_entry", "id": "01HXYZ...", "platform": "oura",
                  "label": "Oura — frodo@example.com" },
      "confidence": "HIGH"
    }
  ],
  "available_sources": [
    { "kind": "config_entry", "id": "01HABC...", "platform": "oura",
      "label": "Oura — alice@example.com", "bound_to": "person.gandalf_the_grey" },
    { "kind": "entity_prefix", "id": "applehealth_gandalf", "platform": "apple_health",
      "label": "Apple Health — Gandalf's iPhone", "bound_to": null }
  ]
}
```

The handler runs the tombstone sweep + discovery scan + auto-bind (§6) on every call. `/get` is idempotent — re-running with the same HA state produces byte-identical output.

### 4.2 `lcars_dashboard/medical_profiles/set`

- **Auth**: `@websocket_api.require_admin`
- **Payload**: `{ person_entity_id, profile }` — single-person upsert, NOT bulk replace (atomic edits, smaller payload, no lost-update risk on cross-person edits)
- **Returns**: `{ ok: true, profile: {...as persisted...} }`
- **Errors**: `unauthorized`, `payload_too_large`, `payload_too_deep`, `invalid_format`, `schema_version_unsupported`

### 4.3 `lcars_dashboard/medical_profiles/delete`

- **Auth**: `@websocket_api.require_admin`
- **Payload**: `{ person_entity_id }`
- **Returns**: `{ ok: true }`

### 4.4 `lcars_dashboard/medical_profiles/discover`

- **Auth**: any authenticated user (read-only re-scan, no writes)
- **Payload**: none
- **Returns**: same `suggestions` + `available_sources` as `/get`, but without the persisted `profiles` payload — used by the editor's "RESCAN" affordance to refresh suggestions after the user adds a new HA integration without closing the modal.

### 4.5 Reload event

After successful `set`/`delete`, the handler triggers a `lcars_dashboard_reload` bus event. Cards listening (medical card subscribes in `connectedCallback`) drop their cached profile map and refetch on next render.

## 5. Frontend — discovery + resolver

### 5.1 `discoverProfiles(hass, profileMap)` rewrite

[lcars-medical-utils.js#L405-L444](../custom_components/lcars_dashboard/js/src/lcars-medical-utils.js#L405-L444). New signature, behavior split:

- **`profileMap` populated** (the common case after first `/get`):
  - For each entity classified as a `MEDICAL_PLATFORMS` member, walk `profileMap` to find the binding source. Match priority:
    1. `kind: config_entry` AND `entityRegistryEntry.config_entry_id === source.id`
    2. `kind: entity_prefix` AND `entity_id.split('.')[1].startsWith(source.id + '_')`
    3. `kind: device_id` AND `entityRegistryEntry.device_id === source.id` (reserved for v2)
  - Bound entities go into the bound person's bucket. Unbound entities go to a synthetic `__biobed__` bucket.
  - Tombstoned and disabled sources are skipped — their entities flow to `__biobed__`.
- **`profileMap` empty/null** (boot before first `/get`):
  - Fall through to today's heuristic (device_id → object_id segment → 'biobed'). The broken Oura regex is **deleted** in this PR; the fallback walks `device_id` first, `object_id_segment[0]` second.
  - This zero-regression guarantee for users who never open the editor.

The existing `_discoverProfilesCache` WeakMap key extends to `(hass.entities, profileMap)` so map changes invalidate cleanly.

### 5.2 `_reduceVitals()` resolver rewrite

[lcars-medical-card.js#L174-L225](../custom_components/lcars_dashboard/js/src/lcars-medical-card.js#L174-L225). New deterministic source-precedence algorithm (Data §4):

```
For each kind K in MEDICAL_VITAL_CLASSES:

  # Path 1: per-vital override (no fall-through)
  if profile.overrides[K] is set:
    pinned_source_id = profile.overrides[K]
    cands = entities in profile.entities where source.id == pinned_source_id AND classify(K)
    if cands non-empty:
      canonical = entityPriority(cands) winner
      if canonical fresh AND _bpPlausible/etc gates pass:
        emit canonical (with variants from same source only)
        continue
    # pinned source unavailable/stale → render OFFLINE for K. Do NOT cascade.
    emit OFFLINE
    continue

  # Path 2: ordered source path (fall-through allowed)
  for source in profile.sources (in array order):
    if not source.enabled: continue
    if source.tombstoned:  continue
    cands = entities in profile.entities where source matches AND classify(K)
    if cands empty: continue
    canonical = entityPriority(cands) winner
    if canonical NOT fresh OR plausibility gate fails: continue
    emit canonical (with variants from same source only)
    break

  # No usable source → existing OFFLINE behavior
```

**Edge cases ratified by the team**:

| Case | Behavior | Rationale |
|---|---|---|
| Top-priority source has entity but `unavailable`/`unknown` | Fall through to next source | HA-side absence-of-data; user said "use this as backup" |
| Top-priority source has stale data (>`STALE_VITAL_MS` = 24h) | Fall through to next source | Symmetrical with existing stale demotion |
| Override pinned source unavailable/stale | Render OFFLINE for that kind. **No fall-through.** | User explicitly excluded other sources from this kind. Silently substituting violates Worf §16 PHI-routing intent. |
| Same source has multiple entities for same kind | Use existing `entityPriority()` regex priority + ts tiebreak | No regression; intra-source tiebreaking unchanged |
| Variants stack | Restricted to the resolved source only | Cross-platform variant stacking removed — pre-PR was nondeterministic |
| Unbound source entities | Routed to synthetic `__biobed__` profile | Renders existing BIOBED pseudo-profile for first-boot users |

**Determinism guarantee**: for fixed (`profile.sources` array, `profile.overrides` map, `hass.states` snapshot), output is byte-identical. No iteration-order dependence. Survives HA restarts.

### 5.3 Card lifecycle hooks

`lcars-medical-card.js`:

- `set hass(hass)` — lazily kick `this._loadProfiles()` once (when `_profileMap` is null AND not in-flight)
- `_loadProfiles()` — `await hass.callWS({ type: 'lcars_dashboard/medical_profiles/get' })`. Store `this._profileMap` and `this._availableSources`. Trigger `requestUpdate()`.
- `connectedCallback()` — `window.addEventListener('lcars_dashboard_reload', this._onReload)` where `_onReload = () => { this._profileMap = null; this._loadProfiles(); }`
- `disconnectedCallback()` — `window.removeEventListener('lcars_dashboard_reload', this._onReload)`

Same reactivity contract as v4.23.0 panel-placement editor. Editor save → ~150ms WS round-trip → card refreshes.

## 6. Boot, migration, tombstone lifecycle

Runs Python-side in the `medical_profiles/get` handler on every call (idempotent):

1. **Read store.** Empty/missing → start with `{ schema_version: 1, profiles: {} }`.
2. **Tombstone sweep.** For every persisted `kind: config_entry` source: check `hass.config_entries.async_get_entry(source.id)`. Absent → set `tombstoned: true`. Re-appearance → unset. `kind: entity_prefix` sources are never tombstoned (no integration to vanish; they're stale-detected via `last_seen` instead).
3. **Re-add detection.** When a tombstoned source's `unique_id` matches a freshly-added config entry's `unique_id` (different `entry_id`): bump tombstoned source to live (`tombstoned: false`, update `id` to new `entry_id`, update `last_seen`). Surface in the editor as a "RECONNECTED" toast on next open.
4. **Discovery scan — config-entry path.** Walk `hass.config_entries.async_entries()`; collect entries whose `domain ∈ MEDICAL_PLATFORMS` (Python-side mirror constant including `apple_health`/`hae`/`health_auto_export`).
5. **Discovery scan — entity-prefix path (NEW for HAE/Apple Health).** Walk the entity-registry AND `hass.states` (the latter catches webhook/template/REST entities with no registry entry). Group by `object_id`'s leading prefix segment(s). Heuristic for proposing a prefix:
   - First segment matches a known bridge prefix (`applehealth`, `apple_health`, `hae`, `healthautoexport`) → propose two-segment prefix (e.g. `applehealth_gandalf`)
   - First segment matches `MEDICAL_PLATFORMS` → ignore (handled by config-entry path)
   - Otherwise → don't auto-propose; available_sources includes a synthetic `kind: entity_prefix, label: "<first_segment>…", id: "<first_segment>"` only if the user manually adds it via the editor's "+ ADD CUSTOM PREFIX" affordance
6. **Build suggestions.** For each `person.*` entity, read `attributes.user_id` → look up `hass.auth.async_get_user(user_id)` → `{ name, email }`. For each unbound discovered source, fuzzy-match against every person:
   - For config_entry sources: exact substring of `person.name` in `config_entry.title` OR config entry's email field → confidence HIGH; Levenshtein ≤ 2 of name → confidence MEDIUM
   - For entity_prefix sources: exact substring of `person.name` (lowercased, slugified) in the prefix `id` (e.g. `applehealth_gandalf` contains `gandalf` → binds to `person.gandalf_the_grey`) → confidence HIGH
   - No match → omit from suggestions
7. **First-boot auto-bind.** On the first call where the persisted store is absent (no file on disk), auto-write HIGH-confidence suggestions that have no competing HIGH-confidence person. After this single first-boot write, `/get` only ever surfaces suggestions — never auto-writes.
8. **Migration of unshipped `lcars_medical_source` person attribute.** If found on a `person.*` entity during step 6, treat as a HIGH-confidence binding hint (overrides Levenshtein scoring). Once first-boot auto-bind writes the profile, the attribute is no longer consulted. Document as deprecated.
9. **Unbound sources** (medical entities whose source matches no person mapping) are surfaced under a synthetic `__biobed__` profile in the response (NOT written to disk). Card renders the existing BIOBED pseudo-profile for these.

## 7. Editor card

### 7.1 File and chassis

`custom_components/lcars_dashboard/js/src/lcars-edit-medical-profiles-card.js` — single LitElement file. Loaded via the existing `openEditPopup()` flow at [lcars-homepage-card.js#L359](../custom_components/lcars_dashboard/js/src/lcars-homepage-card.js#L359).

Internal state machine: NONE — single-page form. Selecting a person in Zone 1 is just a state mutation that re-derives Zones 2/3.

### 7.2 Component reuse

| Need | Reuse | New |
|---|---|---|
| Modal frame (backdrop, close X, header, footer) | [lcars-sidebar-reorder.js#L83-L221](../custom_components/lcars_dashboard/js/src/lcars-sidebar-reorder.js#L83-L221) | — |
| Person row radiogroup | `<lcars-option-strip>` ([lcars-option-strip.js](../custom_components/lcars_dashboard/js/src/components/lcars-option-strip/lcars-option-strip.js)) | — |
| Source check-pill list (multi-select) | — | NEW: inline component, ~80 LOC. Clones `panel-item` shape from [lcars-edit-panel-order-card.js#L42-L60](../custom_components/lcars_dashboard/js/src/lcars-edit-panel-order-card.js#L42-L60) + `aria-checked` from `<lcars-option-strip>`. Do NOT extract as shared yet (YAGNI). |
| Precedence list with ▲/▼ buttons | `move-btn` from [lcars-sidebar-reorder.js#L160-L171](../custom_components/lcars_dashboard/js/src/lcars-sidebar-reorder.js#L160-L171) | — |
| Keyboard ArrowUp/Down on focused row | [lcars-sidebar-reorder.js#L370-L389](../custom_components/lcars_dashboard/js/src/lcars-sidebar-reorder.js#L370-L389) | — |
| Exceptions disclosure (collapsible) | Inline expansion pattern from `lcars-homepage-card.js` light items | — |
| Form chrome (label + Save/Cancel) | [lcars-edit-more-page-card.js#L48-L106](../custom_components/lcars_dashboard/js/src/lcars-edit-more-page-card.js#L48-L106) | — |
| Save → reload | `fireEvent('lcars_dashboard_reload')` ([lcars-edit-panel-order-card.js#L182](../custom_components/lcars_dashboard/js/src/lcars-edit-panel-order-card.js#L182)) | — |

### 7.3 Tombstoned source rendering

A `tombstoned: true` source appears in Zone 2/3 with:
- Amber border (`--lcars-color-warning`)
- Greyed text
- "DISCONNECTED" badge in the pill
- Two affordances: `[ RESTORE ]` (no-op until re-add detected; tooltip explains) and `[ REMOVE ]` (deletes the source from the array)

### 7.4 Suggestion rendering

An auto-suggested source (HIGH confidence, not yet bound) appears in Zone 2 with:
- `SUGGESTED` chip in `--lcars-color-bonus` (gold)
- Pre-checked on first open (because first-boot auto-bind already wrote it)
- Tap to uncheck if the suggestion was wrong

A MEDIUM-confidence suggestion appears unchecked with the same chip — user must opt in.

### 7.5 Gear button placement

Wire the existing dead `_toggleEditMode()` at [lcars-medical-layout.js#L90-L98](../custom_components/lcars_dashboard/js/src/lcars-medical-layout.js#L90-L98). Replace its body with `openEditPopup(this.hass, 'lcars-edit-medical-profiles-card', {}, 'PERSON ↔ SOURCE MAPPING')`. The gear button is admin-suggested visually — rendered greyed with a tooltip "ADMIN ONLY" for non-admin users (reading is fine; saving fails at the WS layer with `unauthorized`).

## 8. Privacy (Worf re-bless)

Per Worf §16 PHI-routing intent and the briefing's W1/W2/W3 callouts:

| Concern | Mitigation |
|---|---|
| Binding change is a PHI-routing change | All `set`/`delete` are `@websocket_api.require_admin` |
| Account email visible in editor labels | Labels derived from `config_entry.title` which HA already exposes; no new PII surface |
| Auto-suggest reads `hass.auth` user emails | Accepted — already accessible to admin users; HIGH-confidence threshold prevents accidental cross-binding |
| Webhook URL exposure (Apple Health Health Auto Export) | NOT shown in editor labels. Only the entity_prefix is shown. Per W2 in briefing. |
| `localStorage` consent gate keying (already PHI-class) | Confirm hash input includes `config_entry_id`-derived FILE_ID, not raw entity_id. Worf must verify in code review. |
| Cross-person binding via the editor | UI prevents (single-person upsert payload + per-call admin check); WS handler rejects payloads where `sources[].id` already binds another person unless explicitly transferred |
| Tombstoned source never silently substitutes | Encoded in resolver §5.2 — pinned-source OFFLINE preserves the user's exclusion intent |
| Audit | `added_at` timestamp persisted; consider follow-up adding a `change_log[]` to the file (defer to v5.12) |

Worf must re-bless before WS handlers ship. Sign-off recorded in PR description.

## 9. Testing

### 9.1 Unit (`lcars-medical-utils.js`, `lcars-medical-card.js`)

| ID | Test |
|---|---|
| T-U1 | `discoverProfiles(hass, profileMap)` partitions entities by `config_entry_id` when map populated |
| T-U2 | `discoverProfiles(hass, null)` falls through to device_id heuristic — proves boot-before-store renders unchanged |
| T-U3 | Tombstoned source's entities go to `__biobed__` bucket, not the bound person |
| T-U4 | Resolver determinism: HR with sources=[Oura, Apple Health], both fresh — returns Oura. Reverse order — returns Apple Health. |
| T-U5 | Top source HR `unavailable` — returns next source (fall-through) |
| T-U6 | Top source HR stale (>24h) — returns next source (uses `STALE_VITAL_MS`) |
| T-U7 | `overrides: { heart_rate: <withings_id> }` set, Withings HR unavailable — returns OFFLINE (no fall-through) |
| T-U8 | `overrides: { heart_rate: <withings_id> }` set, Withings AND Oura HR fresh — returns Withings (override wins regardless of source order) |
| T-U9 | Source `enabled: false` — skipped exactly as if absent |
| T-U10 | Source `tombstoned: true` — skipped exactly as if disabled |
| T-U11 | Intra-source `entityPriority()` tiebreak still works (no regression in `_resting_heart_rate` < `_average_heart_rate` < `_heart_rate` ordering for non-Oura platforms) |
| T-U12 | `_discoverProfilesCache` invalidates when `profileMap` reference changes; hits when both `hass.entities` and `profileMap` references unchanged |

### 9.2 Integration (Python, websocket)

| ID | Test |
|---|---|
| T-I1 | `medical_profiles/get` on missing file returns `{ schema_version: 1, profiles: {}, suggestions: [...], available_sources: [...] }` with non-empty discovery data when MEDICAL_PLATFORMS config entries exist |
| T-I2 | `medical_profiles/set` with valid payload writes file; subsequent `/get` returns identical profile section |
| T-I3 | `medical_profiles/set` payload >256 KB → `payload_too_large` |
| T-I4 | `medical_profiles/set` payload depth >20 → `payload_too_deep` |
| T-I5 | `medical_profiles/set` non-admin connection → `unauthorized` |
| T-I6 | `medical_profiles/set` for unknown `person_entity_id` → `invalid_format` |
| T-I7 | `medical_profiles/set` for source.id whose `config_entry_id` doesn't exist → accepted but persisted with `tombstoned: true` |
| T-I8 | Concurrent `medical_profiles/set` for two different persons serialize through `_get_yaml_lock` — both writes land |
| T-I9 | `schema_version` mismatch on read (file says `2`) → reject with `schema_version_unsupported`, do not auto-overwrite |
| T-I10 | Restart persistence: write profile, restart HA, `/get` returns identical profile |
| T-I11 | Tombstone lifecycle: bind A, remove A from HA, restart, `/get` → A `tombstoned: true`. Re-add A (same `unique_id`, new `entry_id`), `/get` → A `tombstoned: false` and `id` updated |
| T-I12 | First-boot auto-bind: empty store + 1 person + 1 config_entry whose title contains person's name → `/get` returns auto-bound profile written to disk; second `/get` is a no-op (no rebind, no duplicate write) |

### 9.3 Manual smoke (Captain's real Medical Bay)

| ID | Test |
|---|---|
| T-M1 | Open Medical Bay before opening editor — card renders today's appearance: one merged profile (no regression) |
| T-M2 | Click gear, `person.gandalf_the_grey` listed; select Gandalf |
| T-M3 | Sources zone lists Oura + Withings, both pre-checked HIGH-confidence with SUGGESTED chip |
| T-M4 | Precedence zone shows Oura then Withings; reorder via ▲/▼; Save |
| T-M5 | Card refreshes within ~200ms (no page reload). All vital tiles repaint. Where both Oura and Withings provide HR, the canonical row's source label changes accordingly. |
| T-M6 | Disable Withings (uncheck `enabled` via editor); Save. HR canonical reverts to Oura entity instantly. |
| T-M7 | Pull Withings token in HA settings (delete-and-re-add to test tombstone flow). Re-open editor — Withings shown as DISCONNECTED with priority slot preserved. Re-add → Reconnected toast on next open. |
| T-M8 | Add Apple Health later. Re-open editor; wizard surfaces "Apple Health — Gandalf's iPhone" as new HIGH-confidence suggestion. Add to Gandalf's profile, place at slot 3. Save. Apple Health entities now appear under Gandalf, contribute as fall-through source for any vital_kind Withings/Oura don't cover. |
| T-M9 | Expand EXCEPTIONS panel; add `BLOOD PRESSURE → Withings` override. Save. Confirm Oura's BP variants no longer appear in the BP variants stack (only Withings rows). |
| T-M10 | Run [VISUAL-CRAWL-PROTOCOL.md](../.github/VISUAL-CRAWL-PROTOCOL.md) — confirm no telemetry presence regression on Habitat / Engineering / etc. (no shared state poisoned). |

## 10. Action ledger — story breakdown for Riker

### Story 1 — Backend storage + WS commands (~1 day, Worf re-bless required)
- New `medical_profiles.yaml` store under `<HA_config_dir>/lcars-dashboard/configs/`
- 4 WS handlers (`get`, `set`, `delete`, `discover`) following the v4.23.0 pattern
- Tombstone sweep, suggestion building, first-boot auto-bind logic
- Python-side `MEDICAL_PLATFORMS` mirror constant
- All Python tests T-I1 through T-I12

### Story 2 — Discovery + resolver rewrite (~1 day, includes briefing S0 fixes)
- `discoverProfiles(hass, profileMap)` rewrite with `config_entry_id` primary binding (briefing S0-1)
- Delete the broken Oura `oura_ring_<name>_*` regex and its incorrect §4 hardening comment
- `_reduceVitals()` deterministic source-precedence resolver (§5.2)
- Resilience enum mapping fix (briefing S0-2)
- `_resting_heart_rate` Oura platform-branch (briefing S0-3)
- Cache key extension for `_discoverProfilesCache`
- All JS unit tests T-U1 through T-U12

### Story 3 — Editor card (~1.5 days)
- New file `lcars-edit-medical-profiles-card.js` (LitElement, single-page master/detail layout per §7)
- Inline `lcars-source-checkpill` component (NEW, ~80 LOC; not extracted)
- Reuse modal frame, `move-btn`, `<lcars-option-strip>`, form chrome per §7.2
- Wire the dead gear at [lcars-medical-layout.js#L90-L98](../custom_components/lcars_dashboard/js/src/lcars-medical-layout.js#L90-L98) to `openEditPopup`
- Tombstoned + suggestion rendering per §7.3/§7.4
- Exceptions disclosure (collapsed by default, list pattern)
- Card lifecycle hooks (subscribe to `lcars_dashboard_reload`)

### Story 4 — Manual smoke + spec hygiene (~0.5 day)
- All T-M1 through T-M10 on the Captain's real install
- Update parent [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) §4.1.1 entity-ID conventions table for Oura's v2.7.0 layout
- Mark Apple Health row in §4.1.1 as "v5.13 in flight" (still deferred for entity-prefix bridge work itself, but binding mechanism now ready)
- Add Withings webhook-required note for `in_bed`
- Run the visual-crawl protocol; confirm no chrome/telemetry regressions

### Story 5 (DEFERRED to v5.12+) — non-blocking
- Live preview pane in editor (Wesley X-D)
- Divergence chip + compare-sources modal (Geordi §5)
- Smart-cadence default precedence (Wesley X-C)
- Ambient divergence pulse (Wesley I-3)

### Story 6 (DEFERRED to its own spec)
- `person_composite.*` first-class HA entity (Wesley I-1)
- `lcars-data-source-router` shared primitive (Wesley I-2)

## 11. References

- [LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md](LCARS-MEDICAL-INTEGRATIONS-BRIEFING.md) — upstream integration intel + S0 fix backlog
- [LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md](LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md) — parent spec
- [LCARS-PANEL-EXTRACTION-ARCHITECTURE.md](LCARS-PANEL-EXTRACTION-ARCHITECTURE.md) — shared component pattern
- v4.23.0 panel-placement override (precedent): [__init__.py#L1794-L1900](../custom_components/lcars_dashboard/__init__.py#L1794-L1900), [lcars-edit-panel-order-card.js](../custom_components/lcars_dashboard/js/src/lcars-edit-panel-order-card.js)
- Existing reorder primitives: [lcars-sidebar-reorder.js#L160-L171](../custom_components/lcars_dashboard/js/src/lcars-sidebar-reorder.js#L160-L171)
- Existing radiogroup primitive: [lcars-option-strip.js](../custom_components/lcars_dashboard/js/src/components/lcars-option-strip/lcars-option-strip.js)
- Existing form chrome: [lcars-edit-more-page-card.js](../custom_components/lcars_dashboard/js/src/lcars-edit-more-page-card.js)
- Visual crawl protocol: [.github/VISUAL-CRAWL-PROTOCOL.md](../.github/VISUAL-CRAWL-PROTOCOL.md)
