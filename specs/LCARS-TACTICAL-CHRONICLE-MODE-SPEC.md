# LCARS Tactical Chronicle Mode — Design Specification

**Author**: Lt. Cmdr. Data (Architecture)
**Reviewed by**: Lt. Worf (Security — BLOCKING rules in §7), Lt. Cmdr. Geordi La Forge (UI), Mr. Wesley Crusher (Creative), Cmdr. William Riker (Sequencing)
**Date**: Stardate 2026.05.12
**Status**: Shipping in v5.9.0-beta.1
**Tracking issue**: #224 (5X-F32)
**Branch**: `5.0`

---

## 1. Summary

Chronicle Mode is a fourth `lcars-tactical-mode` value (alongside `cruise`, `tactical`, `red-alert`) that turns the Tactical dashboard into a **per-area 24-hour state-history Gantt timeline**. It is the "what happened?" complement to Tactical's existing "what's happening?" view.

The mode is reachable from the existing Tactical mode-switcher and from every Habitat area card via a "CHRONICLE →" deep-link pill scoped to that area.

---

## 2. Goals

- Show 24h state-change history for each Habitat area in a single dense view.
- Reuse the existing Tactical area-registry, entity selection (`isTacticalEntity`), and LCARS color tokens.
- Stay within the existing `MAX_DASHBOARDS` cap — Chronicle is a *mode*, not a new dashboard.
- Honor the existing `data-tactical` screenshot-obfuscator path for any rendered device/area names.

## 3. Non-goals

- Sub-minute replay scrubbing (single snapshot fetch + incremental polling delta).
- Multi-day calendar / week / month view.
- Export to PNG / PDF mission log.
- Comparison overlays (yesterday ghosted behind today).

These are explicitly deferred to a future "Chronicle Plus" release.

---

## 4. Visual structure

```
┌─ TACTICAL MODE: CHRONICLE ──────────────────────────────────────────┐
│ ◆ SHIELDS DISARMED · PERIMETER 18/20 SECURE · SENSORS ALL CLEAR ·    │
│                                          VIEWSCREENS 8/8 · LAST 0247 │ ← Summary Bar (#146)
├──────────────────────────────────────────────────────────────────────┤
│ 12PM   4PM   8PM   MID   4AM   8AM    NOW▼                  JUMP NOW │ ← X-axis + Jump-To-Now
├──────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░██████████████████████████████░░░░░░░░░░░░░░░░░ │ ← Sun row (4-band)
├──────────────────────────────────────────────────────────────────────┤
│ ▾ LIVING ROOM                                                       │
│   MOTION    │░░░██░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░██░░░░░│
│   LAMP      │░░░██░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░░░██░░░░░│
│   FRONT DR  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────────────────────────────────────┤
│ ▸ KITCHEN  ⚑ 2 INCIDENTS                                           │ ← collapsed
├──────────────────────────────────────────────────────────────────────┤
│ ▾ FRONT PORCH                                                       │
│ ...                                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.1 Sun row

4-band gradient computed astronomically from `sun.sun` attributes (`next_dawn`, `next_dusk`, `next_rising`, `next_setting`) — **does not** depend on HA history recorder retaining 24h of `sun.sun` state.

| Band | Color token | Position |
|---|---|---|
| Deep night | `--lcars-bluey` | before dawn, after dusk |
| Civil twilight | `--lcars-ice` | dawn–rise, set–dusk |
| Golden hour | `--lcars-peach` (or `--lcars-sunflower` 0.6α) | first/last hour of daylight |
| Daylight | `--lcars-sunflower` 0.35α | rise → set |

Height: 8px. Position: directly under X-axis, above first area.

### 4.2 Landmark hairlines

Single 1px vertical lines across **all** rows in the visible viewport at these timestamps:

| Landmark | Color token | Label |
|---|---|---|
| Sunrise | `--lcars-sunflower` | `☀ 0612` (HH:MM) |
| Sunset | `--lcars-peach` | `☾ 1942` |
| Alarm armed | `--lcars-butterscotch` | `▲ ARMED 2247` |
| Alarm disarmed | `--lcars-ice` | `▼ DISARM 0612` |
| Alarm triggered | `--lcars-tomato` | `⚠ ALERT 0214` |
| Weather alert start | `--lcars-tomato` | `☁ WEATHER 1402` |

Labels render along the X-axis at top in micro-caps. Hairlines are drawn behind data bars (lower z-index) so bars remain readable.

### 4.3 State → color tokens

| State | Color token |
|---|---|
| Occupancy detected (`device_class: occupancy`) | `--lcars-gold` |
| Motion detected | `--lcars-butterscotch` |
| Light on | `--lcars-sunflower` |
| Door/window open | `--lcars-peach` |
| Lock unlocked | `--lcars-peach` |
| Alarm armed | `--lcars-butterscotch` |
| Alarm triggered / problem / tamper | `--lcars-tomato` |
| Idle/off | (no bar — black row) |

WCAG 1.4.1: alert state (`tomato`) additionally renders a 1px diagonal-stripe overlay so color is not the only differentiator.

### 4.4 Bar dimensions

- Row height: `2rem` (32px)
- Bar height: `1.25rem` (20px) within row
- Bar corner radius: `0.25rem` (subtle; not pill — Gantt bars are not buttons)
- Minimum bar width: `0.5rem` (8px) so sub-5-minute events remain visible. Adjacent collapsed events show "N events" in tooltip.
- Label column width: `8rem` fixed; truncate with ellipsis.

### 4.5 Per-area collapse

- Default: all areas **expanded** on first render. Chronicle is investigative.
- Persistence: `sessionStorage` key `lcars-chronicle-collapsed-areas` → JSON array of area_id. Not `localStorage` — does not survive browser restart.
- Animation: `max-height` transition 200ms; respect `prefers-reduced-motion: reduce`.
- Collapsed-area header shows incident pip cluster (●●●) in `--lcars-tomato` for distinct alert windows in last 24h, max 3 dots ("●●● +N" if more). Non-alert activity is not represented when collapsed — only alerts matter at-a-glance.

### 4.6 INCIDENT callout pill

When a collapsed area has ≥1 distinct alert block in the visible window, show a "⚑ N INCIDENTS" pill next to the area name (tomato fill, black text, LCARS pill grammar).

### 4.7 Hover/touch affordance

Desktop: hover a bar → tooltip with friendly_name + state label + start–end timestamps (12h format).
Mobile: tap bar → same tooltip anchored above for 3s, auto-dismiss.

Bars are focusable (`tabindex="0"`) with `aria-label` containing the full tooltip text so the same context is available to AT users via keyboard navigation.

### 4.8 Now indicator

`2px` vertical line in `--lcars-ice` spanning the full Chronicle viewport. Moves as time advances (re-rendered on 30s polling delta).

### 4.9 JUMP TO NOW pill

Top-right of the Chronicle viewport. LCARS pill (butterscotch fill). On tap, smooth-scrolls the viewport horizontally so the now-indicator is at the right edge of the visible area.

---

## 5. Data flow

```
                     ┌──────────────────────────────────────────────┐
                     │  HA WebSocket connection (hass.connection)  │
                     └────────────────────┬─────────────────────────┘
                                          │
              ┌───────────────────────────▼──────────────────────────┐
              │  lcars-tactical-history-store.js                     │
              │  ─ module-scope cache (per tab)                      │
              │  ─ history/history_during_period (NOT REST)          │
              │  ─ minimal_response: true, no_attributes: true,      │
              │    significant_changes_only: true                    │
              │  ─ AbortController, 30s polling delta, hidden-tab    │
              │    pause, 5xx backoff 30→60→120→300s cap             │
              └───────────────────────────┬──────────────────────────┘
                                          │
                                          ▼
              ┌──────────────────────────────────────────────────────┐
              │  lcars-tactical-chronicle.js                         │
              │  ─ groups entities by area                           │
              │  ─ converts state arrays → Gantt segments            │
              │  ─ DROPS raw arrays after segment build              │
              │  ─ renders <svg> per row (1 path per state segment)  │
              └──────────────────────────────────────────────────────┘
```

---

## 6. Configuration

The Tactical card accepts the following Chronicle-specific options under `chronicle`:

```yaml
chronicle:
  hours: 24                              # int, [6, 72], default 24
  areas: []                              # area_id allow-list; empty → all tactical areas
  default_collapsed_areas: []            # area_id list, collapsed by default
  excluded_areas: ['guest_bedroom']      # area_id list, never included even if in `areas`
  entity_classes:                        # extra entity_class allow-list (BEYOND default-deny)
    - binary_sensor
    - light
    - switch
    - lock
    - alarm_control_panel
```

**Strict mode validation** (Worf §7.4 BLOCKING):
- `hours` clamped to `[6, 72]` at config-read time (config exceeding bounds is silently coerced and a warning is logged with the *count* only — never the value).
- Entity allow-list capped at 170 entities total. Exceeding the cap is a hard reject with a UI banner ("Chronicle entity cap exceeded — reduce area or class allow-list").

---

## 7. Security (BLOCKING — Worf review gate)

These rules are non-negotiable. Any PR that omits or weakens any rule will be rejected.

### 7.1 Default-deny entity classes

The following entity classes are **excluded by default** from Chronicle, regardless of config:

```js
const CHRONICLE_DENY_DOMAINS = new Set([
  'camera', 'device_tracker', 'person', 'media_player'
]);
const CHRONICLE_DENY_ENTITY_PATTERNS = [
  /secret/i, /key/i, /token/i, /password/i, /api_/i,
];
```

Operator may add domains via `chronicle.entity_classes` but may NOT remove any in the deny set.

### 7.2 Guest/sensitive areas excluded by default

Areas with `area_id` or `name` matching `/guest|nursery|bath|bathroom|kid/i` are **excluded by default** even if `chronicle.areas` is empty (all-areas mode). Operator must add them explicitly to `chronicle.areas` to include. This prevents the accidental "tracked guest-bedroom occupancy" footgun.

### 7.3 No payload logging, no persistence beyond render

- `console.debug` / `console.log` / `_LOGGER` calls in chronicle code paths may include **counts only** ("chronicle: 142 segments in 17 areas, 412 KB"). They may **never** include `entity_id` arrays, response bodies, `state` values, or any history payload content.
- Raw history arrays from `history/history_during_period` are converted to Gantt segments inside the store and the raw response is **dropped** (`raw = null`) before the next render frame.
- No `localStorage`, `sessionStorage` (except `lcars-chronicle-collapsed-areas` containing area_id array only — no state values), or IndexedDB writes of history payload data.

### 7.4 Error toast redaction

All chronicle error paths render `Chronicle data unavailable` — never the failing `entity_id`, HTTP status body, or WebSocket error message. Failing entity counts may be reported in dev tools console as count-only (`Chronicle: 3 entities failed`).

### 7.5 Lit binding only — no innerHTML

`friendly_name`, area names, and value labels are bound exclusively via Lit `${...}` interpolation (which auto-escapes). The chronicle code path MUST NOT contain `innerHTML`, `.insertAdjacentHTML`, `unsafeHTML`, or any equivalent. (Verified across the wider `js/src/` tree at spec time: zero such calls.)

### 7.6 Camera attribute stripping

Even if a camera entity is somehow included (via allow-list override), the following attributes are stripped before any tooltip/render path can touch them: `entity_picture`, `access_token`, `frontend_stream_type`, `stream_source`, `last_image`.

### 7.7 History API hardening

| Control | Rule |
|---|---|
| API surface | **WebSocket** `history/history_during_period` only. REST `/api/history/period/` is **prohibited** in chronicle code. |
| Batch shape | **Single** WS call per mode entry, all entities in one filter list. Never one-call-per-entity. (Internally store may issue 2–3 parallel calls of ≤60 entities each to multiplex HA serialization.) |
| Entity cap | Hard 170 entities. Exceed → reject with UI banner. |
| Window cap | `hours` clamped to `[6, 72]`. |
| Polling cadence | 30s `setInterval` for delta fetch using `end_time` cursor. Single in-flight request enforced via `AbortController`. |
| Mode-switch debounce | 500ms before chronicle-enter triggers the initial fetch (prevents toggle-spam). |
| Backoff | HTTP 5xx / fetch reject: 30→60→120→300s cap. Reset on first success. |
| Hidden-tab pause | `document.visibilityState !== 'visible'` → polling suspended. Resume on `visibilitychange`. No catch-up burst — single delta fetch on resume. |
| Cross-tab coordination | None. Two tabs = 2× recorder load (acceptable; documented). No BroadcastChannel — adds attack surface. |

---

## 8. Performance

Acceptance: ≤17 areas × ≤10 entities (≤170 entities) renders within **2s on initial load** on a typical HA instance.

Strategies:
- WebSocket `minimal_response: true, no_attributes: true, significant_changes_only: true` (cuts payload ~5×).
- 2–3 parallel WS calls of ≤60 entities each.
- `IntersectionObserver` per area `<section>`: below-fold areas render headers only on mount; rows render on first intersection.
- Polling delta: only `[lastPollTimestamp, now]` (typically <1 KB); `requestAnimationFrame`-coalesced row updates.

Bundle budget: +20 KB (`lcars-tactical-chronicle.js` + `lcars-tactical-history-store.js` combined, minified).

---

## 9. Habitat integration

Each Habitat area card gains a "CHRONICLE →" pill (LCARS-style, butterscotch fill, hairline border, font-size 0.6rem) routing to:

```
/lovelace/tactical?mode=chronicle&area=<area_id>
```

The Chronicle component reads the `area` query parameter on mount; if present, it auto-expands only that area and collapses the rest (overriding sessionStorage for that mount only).

---

## 10. Out of scope (Chronicle Plus → v5.10.x)

- REPLAY mode (60× now-indicator sweep with transport controls)
- Compare-mode (yesterday ghosted behind today)
- Multi-day / week / month view
- 1px sparkline inside Summary Bar tier pills
- Per-area "QUIET 5h" badge in collapsed header
- Chronicle export (PNG / PDF)
- Top-entity sigil per area

---

## 11. Rollback

If Chronicle introduces a regression in production:
1. Set `dashboard_options.chronicle.enabled: false` in the integration options flow — Chronicle mode-switcher pill disappears, dashboard reverts to cruise/tactical/red-alert only. No data path is touched in this disabled state.
2. If hard rollback is needed, revert the v5.9.0-beta.1 tag and re-release the prior stable.

---

## Appendix A — entity classifier table

The chronicle entity classifier uses the existing `isTacticalEntity()` from `lcars-entity-utils.js` plus the §7 default-deny rules. State→color mapping:

| Domain | device_class | Color token | Bar predicate |
|---|---|---|---|
| `binary_sensor` | `motion` | butterscotch | state === 'on' |
| `binary_sensor` | `occupancy` | gold | state === 'on' |
| `binary_sensor` | `door`/`window`/`opening` | peach | state === 'on' |
| `binary_sensor` | `smoke`/`gas`/`safety`/`tamper`/`vibration`/`carbon_monoxide`/`heat` | tomato | state === 'on' |
| `binary_sensor` | `problem` | tomato | state === 'on' |
| `light` | — | sunflower | state === 'on' |
| `switch` | — | ice | state === 'on' |
| `lock` | — | peach | state === 'unlocked' |
| `alarm_control_panel` | — | butterscotch (armed), tomato (triggered) | state in `armed_*`, `triggered`, `pending` |

— Data, Lt. Commander
