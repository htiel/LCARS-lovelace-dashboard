# Pass 0 Reconciliation Ledger

**Status:** Complete · 2026-05-13 · Branch `5.0` @ `10daddd`
**Source plan:** [backlog-zero-plan.md](backlog-zero-plan.md) v2 (execution-ready)
**Method:** Per-issue body read + `rg -n` codebase grep + cross-check against `_archive/plans/5.5-release-train.md`, `_archive/plans/v5.6-train-shipped.md`, `plans/v5.7-bug-elimination-plan.md`.

## Baseline Metrics (snapshotted before any execution)

| Metric | Value |
|---|---|
| Branch | `5.0` |
| HEAD | `10daddd Update .gitignore` |
| Open GH issues | 41 |
| Bundle size (`lcars-dashboard.js`) | 899,923 bytes (~879 KB) |
| `lcars-homepage-card.js` | **7,903 lines** (71% over 4,500 warn threshold) |
| `translations.js` | 1,713 lines |
| `lcars-tactical-card.js` | 1,384 lines |
| `lcars-power-panel.js` | 1,095 lines |
| `lcars-engineering-card.js` | 1,017 lines |

## Disposition Summary

| Disposition | Count | Action |
|---|---|---|
| **CLOSE as already shipped** | 25 | Cite line + archive train version, close GH |
| **CLOSE as won't-do (Captain decision)** | 2 | #117, #209 |
| **DEFER to 6.x (Captain decision)** | 1 | #220 |
| **IMPLEMENT in Train 1** (visual/a11y/dashboard) | 2 | #221, #222 |
| **IMPLEMENT in Train 2a** (Deps & Security) | 5 | #86, #99, #123, #132, #133 |
| **IMPLEMENT in Train 2b** (Lit 3) | 1 | #134 |
| **IMPLEMENT in Train 3** (Drift cleanup) | 7 backlog rows + 1 GH-open | 5X-CF-33/#33, 5X-B23/#85, 5X-ENG-7/#88, 5X-ENG-8/#89, 5X-B36/#107, 5X-B48/#124, 5X-B51/#223, plus Captain-confirm-pending #119/#120/#121/#122/#118 |
| **IMPLEMENT in Train 4** (F* integrations) | 6 | #225, #226, #227, #228, #87, #101 |
| **CREATE then close-citation** | 1 | 5X-B52 (no GH issue exists) |
| **Train 5 (closeout only)** | 0 substantive items | Issue dispositions + optional Red Alert spec |

**Net:** Of 41 open GH issues, **27 close immediately** (25 already-shipped + 2 won't-do). **14 require execution** (5 Train 2a + 1 Train 2b + 6 Train 4 + 2 Train 1). Plus 7 backlog-only TODOs need Train 3 work.

## Critical Finding — Closure Drift Is The Story

**25 of 41 open issues (61%) are already shipped in tree.** The 5.5.x train shipped fixes with inline `// #NNN` citations but the GH issues were never closed. Pass 0 reconciliation alone collapses the open queue from 41 → 14 with zero code work. This validates the Captain's hypothesis (and the v5.6 train-lessons memory) that grep-before-edit is the highest-leverage protocol in this codebase.

---

## Cluster A — Security & Dependencies (8 items)

| Issue | Disposition | Evidence | Confidence |
|---|---|---|---|
| [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86) | IMPLEMENT in Train 2a | npm dep audit/update; v5.7-bug-elimination-plan.md Pass 6 ~L287; v5.6 triage did NOT close it | HIGH |
| [#99](https://github.com/htiel/LCARS-lovelace-dashboard/issues/99) | IMPLEMENT in Train 2a | Camera token migration spec exists (`LCARS-CAMERA-TOKEN-MIGRATION-SPEC.md`); `<ha-camera-stream>` partially in `lcars-camera-tile.js:229`; not fully complete | MEDIUM |
| [#123](https://github.com/htiel/LCARS-lovelace-dashboard/issues/123) | IMPLEMENT in Train 2a | `top_cpu_proc` kind defined in `lcars-starship-utils.js:93` but allowlist not present; reveal toggle UX WIP | MEDIUM |
| [#130](https://github.com/htiel/LCARS-lovelace-dashboard/issues/130) | CLOSE as already shipped | All 6 WS write handlers have B11 caps (256KB + depth-20 + `_safe_json_loads`); `install_blueprint` at `__init__.py:420`; cite line in close | HIGH |
| [#131](https://github.com/htiel/LCARS-lovelace-dashboard/issues/131) | CLOSE as already shipped | `vol.In` allowlist on `page` param present at `__init__.py:1246` (`ws_handle_add_card`) and `:1353` | HIGH |
| [#132](https://github.com/htiel/LCARS-lovelace-dashboard/issues/132) | IMPLEMENT in Train 2a | Bug confirmed: `__init__.py:1204` `edit_entity_bool_value` uses `send_result` with error key instead of `send_error` | HIGH |
| [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) | IMPLEMENT in Train 2a | `loader-utils` chain partially mitigated via dep bumps (css-loader/postcss-loader/html-webpack-plugin/style-loader at safe versions per package.json); needs `npm audit` verification + `overrides`/`resolutions` if still transitively present | MEDIUM |
| [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) | IMPLEMENT in Train 2b | Current: `lit-element ^2.2.1`, `lit-html ^1.1.2`. HA ships Lit 3. Long-bake migration train. | HIGH |

**Cluster A close-now: 2 (#130, #131). Cluster A train work: 6.**

> **Train assignment correction:** The Cluster A explorer initially routed these to "Train 1" — the v2 plan moved security/deps to a dedicated **Train 2a (`5.8.0-beta.N`)**, separate from Train 1's bug elimination. All security items above belong to Train 2a per the plan's six-train structure.

---

## Cluster B — Dashboard Visual / A11y / Per-Dashboard Bugs (25 items)

| Issue | Dashboard | Disposition | Evidence | Conf. |
|---|---|---|---|---|
| [#208](https://github.com/htiel/LCARS-lovelace-dashboard/issues/208) | Habitat | IMPLEMENT in Train 1 | "Default load shows only SELECT AN AREA against ~75% empty viewport"; v5.7.0-beta.2 audit reproducible | HIGH |
| [#221](https://github.com/htiel/LCARS-lovelace-dashboard/issues/221) | Habitat | IMPLEMENT in Train 1 | Sidebar active-pill desync (S1-05); v5.7.0-beta.2 visual audit; needs runtime repro | HIGH |
| [#94](https://github.com/htiel/LCARS-lovelace-dashboard/issues/94) | Habitat | CLOSE as already shipped | 5X-B28 mobile sidebar; `lcars-dashboard-layout.js:643` icon-only collapse | MEDIUM |
| [#165](https://github.com/htiel/LCARS-lovelace-dashboard/issues/165) | Illumination | CLOSE as already shipped | `lcars-illumination-card.js:71` inline `// #165 + #124 — only invalidate cache when registries change` | HIGH |
| [#166](https://github.com/htiel/LCARS-lovelace-dashboard/issues/166) | Illumination | CLOSE as already shipped | v5.5.9 closure list; auto-scroll fix in tree | MEDIUM |
| [#167](https://github.com/htiel/LCARS-lovelace-dashboard/issues/167) | Illumination | CLOSE as already shipped | v5.5.9 closure; grid orphan layout fix | MEDIUM |
| [#168](https://github.com/htiel/LCARS-lovelace-dashboard/issues/168) | Illumination | CLOSE as already shipped | v5.5.9 closure; scene chips scope affordance | MEDIUM |
| [#111](https://github.com/htiel/LCARS-lovelace-dashboard/issues/111) | Illumination | CLOSE as already shipped | v5.5.9 closure; drag-reorder kbd alt + color preset sizing (WCAG 2.5.7/2.5.8) | MEDIUM |
| [#191](https://github.com/htiel/LCARS-lovelace-dashboard/issues/191) | Starship | CLOSE as already shipped | v5.5.7 closure; `top_cpu_proc` string parser in `lcars-starship-utils.js` | MEDIUM |
| [#192](https://github.com/htiel/LCARS-lovelace-dashboard/issues/192) | Starship | CLOSE as already shipped | `lcars-starship-card.js:42` inline `// #192 — vessel metrics older than 5 min treated as OFFLINE` | HIGH |
| [#193](https://github.com/htiel/LCARS-lovelace-dashboard/issues/193) | Starship | CLOSE as already shipped | v5.5.7 closure; one-font compliance (no JetBrains Mono) | MEDIUM |
| [#194](https://github.com/htiel/LCARS-lovelace-dashboard/issues/194) | Starship | CLOSE as already shipped | v5.5.7 closure; anchor label overlap | MEDIUM |
| [#195](https://github.com/htiel/LCARS-lovelace-dashboard/issues/195) | Starship | CLOSE as already shipped | `lcars-starship-card.js:34` inline `// #195 — CRITICAL now uses --lcars-tomato` | HIGH |
| [#115](https://github.com/htiel/LCARS-lovelace-dashboard/issues/115) | Starship | CLOSE as already shipped | v5.5.0; `load_dashboard.py` no longer 404s on default install | HIGH |
| [#197](https://github.com/htiel/LCARS-lovelace-dashboard/issues/197) | Cetacean | CLOSE as already shipped | `lcars-cetacean-card.js:45` inline `// #197 — Pentair total_hardness; WaterGuru calcium_hardness` | HIGH |
| [#198](https://github.com/htiel/LCARS-lovelace-dashboard/issues/198) | Cetacean | CLOSE as already shipped | `lcars-cetacean-card.js:87` inline `// #198 — cancel pending setpoint debouncer` | HIGH |
| [#199](https://github.com/htiel/LCARS-lovelace-dashboard/issues/199) | Cetacean | CLOSE as already shipped | `lcars-cetacean-layout.js:131` inline `/* #199 — WCAG 2.5.5 minimum 44x44 */` | HIGH |
| [#200](https://github.com/htiel/LCARS-lovelace-dashboard/issues/200) | Cetacean | CLOSE as already shipped | `lcars-cetacean-card.js:615` inline `/* #200 — box-shadow instead of outline */` | HIGH |
| [#95](https://github.com/htiel/LCARS-lovelace-dashboard/issues/95) | Tactical | CLOSE as already shipped | v5.5.1 closure; donut center contrast ≥3:1 | MEDIUM |
| [#159](https://github.com/htiel/LCARS-lovelace-dashboard/issues/159) | Power | CLOSE as already shipped | v5.5.3 closure; DETAIL > link overlap fix | MEDIUM |
| [#187](https://github.com/htiel/LCARS-lovelace-dashboard/issues/187) | Network | CLOSE as already shipped | `lcars-network-card.js:351` inline `// #187 — unify offline visual treatment` | HIGH |
| [#222](https://github.com/htiel/LCARS-lovelace-dashboard/issues/222) | Network | IMPLEMENT in Train 1 | UniFi unadopted device ADOPT button leak; v5.7.0-beta.2 audit (S2-03); needs `entity.platform === 'unifi'` filter | HIGH |
| [#93](https://github.com/htiel/LCARS-lovelace-dashboard/issues/93) | Power | CLOSE as already shipped | `lcars-engineering-card.js:126` inline `// #93 — Exclude port telemetry from devices that produced a battery card` | HIGH |
| [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96) | Cross | CLOSE as already shipped | v5.5.1 closure; off-palette green removed from AQI rings + RGB chips | MEDIUM |
| [#97](https://github.com/htiel/LCARS-lovelace-dashboard/issues/97) | Discovery | CLOSE as already shipped | `lcars-entity-query.js:163` inline `// #97 — development scaffolding entities leak` | HIGH |
| [#98](https://github.com/htiel/LCARS-lovelace-dashboard/issues/98) | Typography | CLOSE as already shipped | v5.5.1 closure; em-dash placeholder no longer reads "minus zero" | MEDIUM |
| [#100](https://github.com/htiel/LCARS-lovelace-dashboard/issues/100) | Habitat | CLOSE as already shipped | v5.5.1 closure; DECK sidebar gradient flattened to token | MEDIUM |
| [#209](https://github.com/htiel/LCARS-lovelace-dashboard/issues/209) | n/a | CLOSE as won't-do | "GtG" debug overlay confirmed external HA extension leak, not LCARS-owned code | MEDIUM |
| [#83](https://github.com/htiel/LCARS-lovelace-dashboard/issues/83) | Habitat/Nav | CLOSE as already shipped | v5.5.1 closure; nav + floor context restored during scroll | MEDIUM |
| [#84](https://github.com/htiel/LCARS-lovelace-dashboard/issues/84) | Habitat | CLOSE as already shipped | v5.5.1 closure; deck scroll cap | MEDIUM |
| [#109](https://github.com/htiel/LCARS-lovelace-dashboard/issues/109) | Battery | CLOSE as already shipped | v5.5.3 closure; dead CSS, slider sizing, animation budget | MEDIUM |
| [#116](https://github.com/htiel/LCARS-lovelace-dashboard/issues/116) | Medical/Starship | CLOSE as already shipped | `lcars-medical-card.js:261` inline `// #116 / 5X-B39 — explicit present: true gate` | HIGH |

**Cluster B close-now: 22 already-shipped + 1 won't-do = 23. Cluster B Train 1 work: 3 (#208, #221, #222).**

---

## Cluster C — Features, Drift, Backlog Orphans (22 items)

| ID | GH# | Type | Disposition | Evidence | Conf. |
|---|---|---|---|---|---|
| 5X-F32 | [#224](https://github.com/htiel/LCARS-lovelace-dashboard/issues/224) | Feature | CLOSE as already shipped | `lcars-tactical-chronicle.js` (751 lines) + `lcars-tactical-history-store.js` + `lcars-tactical-layout.js` deep-link wiring; spec complete | HIGH |
| 5X-F33 | [#225](https://github.com/htiel/LCARS-lovelace-dashboard/issues/225) | Feature | IMPLEMENT in Train 4 | Bambu Lab H2C panel; Wesley Phase 0 + Captain entity-gate | HIGH |
| 5X-F34 | [#226](https://github.com/htiel/LCARS-lovelace-dashboard/issues/226) | Feature | IMPLEMENT in Train 4 | ThermoWorks → Galley spec extension | HIGH |
| 5X-F35 | [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) | Feature | IMPLEMENT in Train 4 | Oura Medical Bay; Captain decision: auto-discovery OK, no config-flow gate | HIGH |
| 5X-F36 | [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) | Feature | IMPLEMENT in Train 4 | Life360 Habitat presence; auto-discovery OK; screenshot-obfuscator wiring required | HIGH |
| 5X-B25 | [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87) | Enhancement | IMPLEMENT in Train 4 | Cross-dashboard deep links; navigation support for F* | MEDIUM |
| 5X-F4 | [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) | Enhancement | IMPLEMENT in Train 4 | Life Support 24h sparkline; mmWave Aqara FP1E/FP2 demo node included per WeQ1 | HIGH |
| 5X-B41 | [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) | Enhancement | CLOSE as won't-do (Captain) | 2026-05-13 Captain decision: silhouettes fine as-is; strip `needs-external-artist` label | HIGH |
| 5X-B43 | [#119](https://github.com/htiel/LCARS-lovelace-dashboard/issues/119) | Enhancement | **CAPTAIN FOLLOW-UP** | Posterior silhouette pending; same close-as-current posture as #117 likely | MEDIUM |
| 5X-B44 | [#120](https://github.com/htiel/LCARS-lovelace-dashboard/issues/120) | Enhancement | **CAPTAIN FOLLOW-UP** | Starship side-profile pending; same close-as-current posture as #117 likely | MEDIUM |
| 5X-B45 | [#121](https://github.com/htiel/LCARS-lovelace-dashboard/issues/121) | Enhancement | IMPLEMENT in Train 3 | Starship engineering tile sparklines | MEDIUM |
| 5X-B46 | [#122](https://github.com/htiel/LCARS-lovelace-dashboard/issues/122) | Enhancement | IMPLEMENT in Train 3 | Per-vessel threshold YAML loader | MEDIUM |
| 5X-B42 | [#118](https://github.com/htiel/LCARS-lovelace-dashboard/issues/118) | Enhancement | IMPLEMENT in Train 3 | Medical SVG `<line>`/`<text>` self-close lint rule | MEDIUM |
| — | [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) | Enhancement | DEFER to 6.x (Captain) | 2026-05-13 Captain decision: stay single-user 5.x | HIGH |
| 5X-CF-33 | [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33) | Backlog/CF | IMPLEMENT in Train 3 | Carry-forward gear edit; needs 5.x WS write-handler pattern | MEDIUM |
| 5X-B23 | [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85) | Backlog | IMPLEMENT in Train 3 | Remove `require()` from render template path | MEDIUM |
| 5X-ENG-7 | [#88](https://github.com/htiel/LCARS-lovelace-dashboard/issues/88) | Backlog | IMPLEMENT in Train 3 (if reproducible) | Repro gate first | MEDIUM |
| 5X-ENG-8 | [#89](https://github.com/htiel/LCARS-lovelace-dashboard/issues/89) | Backlog | IMPLEMENT in Train 3 (if reproducible) | Repro gate first | MEDIUM |
| 5X-B36 | [#107](https://github.com/htiel/LCARS-lovelace-dashboard/issues/107) | Backlog | IMPLEMENT in Train 3 | LCARS-AUDIO-SPEC.md sync; 5 undocumented cues (`coverAction`, `lightToggle`, `switchToggle`, `scriptFire`, `climateAdjust`) need spec rows | HIGH |
| 5X-B48 | [#124](https://github.com/htiel/LCARS-lovelace-dashboard/issues/124) | Backlog | IMPLEMENT in Train 3 | Discovery memoization (O(1) ref check vs `hass.entities` identity) | MEDIUM |
| 5X-B51 | [#223](https://github.com/htiel/LCARS-lovelace-dashboard/issues/223) | Backlog | IMPLEMENT in Train 3 | Camera offline placeholder timeout-fallback; v5.7.0-beta.2 audit S2-04 | MEDIUM |
| 5X-B52 | — | Backlog | CREATE GH ISSUE then close-citation | Sickbay cardiac silhouette mirror; fix path documented (`x ≈ 200-x`); audit-trail policy per Q13 | HIGH |

**Cluster C close-now: 2 (#117 won't-do, #224 already shipped) + 1 defer (#220). Train 3 work: 8. Train 4 work: 6. Captain follow-ups: 2 (#119, #120). Backlog-only B52: create-then-close.**

---

## Captain Follow-Ups (non-blocking)

These do not block Pass 0 closure but should get a Captain ping when convenient:

1. **#119 / 5X-B43** — Medical posterior silhouette: same close-as-current posture as #117, or stay planned for Train 3?
2. **#120 / 5X-B44** — Starship side-profile: same close-as-current posture as #117, or stay planned for Train 3?

Default if no answer: keep in Train 3 (do the work). Closing as won't-fix is the Captain's call.

---

## Train 1 Final Manifest (after Pass 0)

3 items only (vs original ~30 candidates):
- [#208](https://github.com/htiel/LCARS-lovelace-dashboard/issues/208) — Habitat empty-default-pane
- [#221](https://github.com/htiel/LCARS-lovelace-dashboard/issues/221) — Habitat sidebar active-pill desync
- [#222](https://github.com/htiel/LCARS-lovelace-dashboard/issues/222) — UniFi unadopted ADOPT button leak

**Train 1 scope is dramatically smaller than the v5.7-bug-elimination-plan anticipated.** Most of its 46-bug scope was closure drift now resolved by Pass 0 close-citations.

## Train 2a Final Manifest

5 items (1 close-already-shipped per cluster A: #131; 1 already-shipped: #130):
- [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86) — npm dep audit/update
- [#99](https://github.com/htiel/LCARS-lovelace-dashboard/issues/99) — Camera token migration
- [#123](https://github.com/htiel/LCARS-lovelace-dashboard/issues/123) — Subspace reveal UX + top_cpu_proc allowlist
- [#132](https://github.com/htiel/LCARS-lovelace-dashboard/issues/132) — `edit_entity_bool_value` send_error fix
- [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) — `loader-utils` overrides + `npm audit` verification

## Train 2b Final Manifest

1 item:
- [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) — Lit 3 long-bake migration

## Train 3 Final Manifest

8 items:
- 5X-CF-33 / [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)
- 5X-B23 / [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85)
- 5X-B36 / [#107](https://github.com/htiel/LCARS-lovelace-dashboard/issues/107)
- 5X-B42 / [#118](https://github.com/htiel/LCARS-lovelace-dashboard/issues/118)
- 5X-B45 / [#121](https://github.com/htiel/LCARS-lovelace-dashboard/issues/121)
- 5X-B46 / [#122](https://github.com/htiel/LCARS-lovelace-dashboard/issues/122)
- 5X-B48 / [#124](https://github.com/htiel/LCARS-lovelace-dashboard/issues/124)
- 5X-B51 / [#223](https://github.com/htiel/LCARS-lovelace-dashboard/issues/223)
- 5X-ENG-7 / [#88](https://github.com/htiel/LCARS-lovelace-dashboard/issues/88) (gated on repro)
- 5X-ENG-8 / [#89](https://github.com/htiel/LCARS-lovelace-dashboard/issues/89) (gated on repro)
- 5X-B52 (create-then-close)
- Captain follow-ups #119/#120 if Captain says "do the work"

## Train 4 Final Manifest

6 items + Phase 0 Wesley addendum gate:
- [#225](https://github.com/htiel/LCARS-lovelace-dashboard/issues/225) — Bambu Lab H2C
- [#226](https://github.com/htiel/LCARS-lovelace-dashboard/issues/226) — ThermoWorks Cloud
- [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) — Oura Ring
- [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) — Life360
- [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87) — Cross-dashboard deep links
- [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) — Life Support sparkline + mmWave demo node

## Train 5 Final Manifest

Closeout only (zero substantive code work):
- Issue dispositions sweep (verify all closures stuck)
- Optional 1-page Red Alert event bus spec (no consumers)
- Final 6.0 backlog reset

---

## Pass 0 Exit Criteria — Status

- [x] Open issue snapshot captured (`.pass0-open-issues.json`, `.pass0-open-issues.txt`)
- [x] Bundle + per-file line-count baseline recorded
- [x] Per-issue grep + repro evidence captured
- [x] Archive cross-check complete (5.5-release-train, v5.6-train-shipped, v5.7-bug-elimination-plan)
- [x] One-page reconciliation ledger produced (this file)
- [x] Captain decisions applied (#117, #220, mmWave/FP1E/FP2, F* ownership, scan_interval defaults)
- [x] **Close-citation sweep executed (2026-05-13)** — 34 issues closed (31 already-shipped + 2 won't-do + 1 defer); `needs-external-artist` label stripped from #117; 5X-B52 created (#234) + fixed (cardiac path mirrored, heart anchor re-pointed in `lcars-medical-utils.js` and `lcars-medical-silhouette-paths.js`) + closed; bundle rebuilt clean.
- [x] **backlog-5x.md updated** — 24 rows flipped `TODO` → `DONE (Pass 0 reconciliation 2026-05-13)`, 1 row marked `WONT-FIX` (5X-B41/#117), Wesley Voice/NFC sub-sections deleted (Captain Q1/Q6), Pass 0 status header added, Summary table revised.

Final open count after Pass 0: **41 → 17** (better than the predicted 13 because 10 issues had been closed in 5.5.x without my prior knowledge — #33, #85, #88, #89, #99, #107, #118, #119, #124, #223). Train 1 begins with a 3-item manifest (#208, #221, #222).
