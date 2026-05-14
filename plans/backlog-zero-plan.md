# LCARS Dashboard — Backlog Zero Program Plan

> **Status:** v2 · **Pass 0 COMPLETE (2026-05-13)** · Train 1 ready to begin · **Owner:** Riker · **Finalized:** 2026-05-13
> **Goal:** Drive branch `5.0` to **zero open GitHub issues** and a **clean `plans/backlog-5x.md`** that retains only the reset post-zero Epic structure and any explicitly non-executable reference material the Captain keeps alive.
> **Release strategy:** **Six sequential release trains** with a mandatory **Pass 0 reconciliation** before Train 1. Each train ends with a GitHub release. Pre-releases use `5.x.0-beta.N` tags against branch `5.0`.
> **Method:** Treat inventory drift as the first defect. Reconcile GitHub, `plans/backlog-5x.md`, shipped-train records, and Captain decisions into one source of truth before any code work begins. Honor grep-before-edit, cumulative end-of-train multi-agent review, three-file version sync, bundle-delta gates, and the homepage-card extraction threshold.

## Status

**Status: v2 — Pass 0 reconciliation COMPLETE 2026-05-13. Open issues: 41 → 17. See [PASS-0-LEDGER.md](PASS-0-LEDGER.md). Train 1 ready.**

## Mission Statement

Backlog Zero is done only when all of the following are true:

1. `gh issue list --state open` returns **zero open issues** for `htiel/LCARS-lovelace-dashboard`.
2. `plans/backlog-5x.md` no longer carries stale `TODO` rows for shipped, duplicated, or explicitly-deferred 5.x work.
3. `plans/backlog-5x.md` is reduced to a reset Epic structure for post-zero work plus any explicitly non-executable reference sections the Captain keeps alive.
4. Every surviving issue/backlog item has one disposition only: **implemented**, **closed as already shipped**, **closed as duplicate/superseded**, **closed as won't-do**, or **deferred to 6.x by Captain decision**.
5. Every train ships with a GitHub release, and every release honors the standing workflow:
   - `custom_components/lcars_dashboard/const.py`
   - `custom_components/lcars_dashboard/manifest.json`
   - `custom_components/lcars_dashboard/js/package.json`
   - `gh release create ... --target 5.0`
6. Every train ends with cumulative Geordi + Worf + Data review before release publication, per the v5.6 lesson that cumulative review catches cross-pass regressions better than isolated spot checks.

Plan v2 finalized 2026-05-13 — execution begins on Captain's go.

## Inventory & Reconciliation

### Input Snapshot

| Source | Snapshot |
|--------|----------|
| `.tmp-open-issues.txt` | 41 open GitHub issues: 29 bugs, 12 enhancements |
| `plans/backlog-5x.md` | Top-level backlog mixes active 5X-B/F items, carry-forward work, stale TODO rows, shipped rows, Epic 3/4/5 sub-tasks, and Wesley's unscheduled buckets |
| `plans/v5.7-bug-elimination-plan.md` | Approved prior-art plan for a 45-bug cleanup campaign on `5.0` |
| `plans/NEXT-SESSION-HANDOFF.md` | Standing Captain decisions and current in-flight assumptions |
| `plans/v5.6-train-shipped.md` | Recent shipped-train cadence and cumulative review pattern |
| User memory: `lcars-train-lessons` / `lcars-release-workflow` | Grep-before-edit, HACS-only deploy, 3-file version sync, GitHub release requirement |

### Reconciliation Findings

The repo is not carrying one clean queue. It is carrying at least four overlapping queues.

| Bucket | Count | What it means |
|--------|-------|---------------|
| Open on GitHub and represented in backlog | 33 | These are normal active candidates for train scheduling |
| Open on GitHub but **not** represented in backlog | 8 | These are inventory drift and must be added to the source-of-truth ledger before execution |
| In backlog as `TODO` but **not** open on GitHub | 20 linked items + 1 no-issue item | These are stale-backlog candidates until repro or Captain reprioritization proves otherwise |
| Explicitly deferred / blocked / policy-gated | several | These need Captain disposition before the team spends engineering effort |

### GitHub-Open But Missing From `plans/backlog-5x.md`

These eight items must be reconciled in Pass 0 before coding begins:

| Issue | Current state | Reconciliation action |
|------|---------------|-----------------------|
| [#130](https://github.com/htiel/LCARS-lovelace-dashboard/issues/130) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Security/Deps train |
| [#131](https://github.com/htiel/LCARS-lovelace-dashboard/issues/131) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Security/Deps train |
| [#132](https://github.com/htiel/LCARS-lovelace-dashboard/issues/132) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Security/Deps train |
| [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Security/Deps train |
| [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) | Open GH issue, not present in backlog | Add to source-of-truth ledger as lit-migration decision gate |
| [#208](https://github.com/htiel/LCARS-lovelace-dashboard/issues/208) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Drift Cleanup train |
| [#209](https://github.com/htiel/LCARS-lovelace-dashboard/issues/209) | Open GH issue, not present in backlog | Add to source-of-truth ledger under Drift Cleanup train |
| [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) | Open GH enhancement, not represented in backlog | Captain decision: 5.x privacy scope or 6.x defer |

### Backlog `TODO` Rows That Are Not Open GitHub Issues

These are stale until proven otherwise. Do not blindly implement them. Grep first, reproduce second, reopen/create issue only if the defect or feature request still exists.

| Backlog ID | Issue | Current note |
|-----------|-------|--------------|
| 5X-CF-33 | [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33) | Carry-forward work item; active backlog-only candidate |
| 5X-B23 | [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85) | Backlog open, GH not open |
| 5X-ENG-7 | [#88](https://github.com/htiel/LCARS-lovelace-dashboard/issues/88) | Backlog open, GH not open |
| 5X-ENG-8 | [#89](https://github.com/htiel/LCARS-lovelace-dashboard/issues/89) | Backlog open, GH not open |
| 5X-B26 | [#93](https://github.com/htiel/LCARS-lovelace-dashboard/issues/93) | Backlog open, GH not open |
| 5X-B28 | [#94](https://github.com/htiel/LCARS-lovelace-dashboard/issues/94) | Backlog open, GH not open |
| 5X-B29 | [#95](https://github.com/htiel/LCARS-lovelace-dashboard/issues/95) | Backlog open, GH not open |
| 5X-B30 | [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96) | Backlog open, GH not open |
| 5X-B27 | [#97](https://github.com/htiel/LCARS-lovelace-dashboard/issues/97) | Backlog open, GH not open |
| 5X-B31 | [#98](https://github.com/htiel/LCARS-lovelace-dashboard/issues/98) | Backlog open, GH not open |
| 5X-B33 | [#99](https://github.com/htiel/LCARS-lovelace-dashboard/issues/99) | Backlog open, GH not open |
| 5X-B32 | [#100](https://github.com/htiel/LCARS-lovelace-dashboard/issues/100) | Backlog open, GH not open |
| 5X-B36 | [#107](https://github.com/htiel/LCARS-lovelace-dashboard/issues/107) | Backlog open, GH not open |
| 5X-B40 | [#115](https://github.com/htiel/LCARS-lovelace-dashboard/issues/115) | Backlog open, GH not open |
| 5X-B39 | [#116](https://github.com/htiel/LCARS-lovelace-dashboard/issues/116) | Backlog open, GH not open |
| 5X-B42 | [#118](https://github.com/htiel/LCARS-lovelace-dashboard/issues/118) | Backlog open, GH not open |
| 5X-B43 | [#119](https://github.com/htiel/LCARS-lovelace-dashboard/issues/119) | Backlog open, GH not open |
| 5X-B48 | [#124](https://github.com/htiel/LCARS-lovelace-dashboard/issues/124) | Backlog open, GH not open |
| 5X-B51 | [#223](https://github.com/htiel/LCARS-lovelace-dashboard/issues/223) | Backlog open, GH not open |
| 5X-F32 | [#224](https://github.com/htiel/LCARS-lovelace-dashboard/issues/224) | Backlog open, GH not open |
| 5X-B52 | no GitHub issue | Needs explicit disposition in Pass 0 |

### Likely Already-Fixed Or Closure-Drift Candidates

These are not safe to auto-close, but they are also not safe to re-implement blindly because prior train documents already recorded them as shipped or closed. This is the strongest reason Pass 0 exists.

| Candidate set | Why it is suspicious |
|--------------|----------------------|
| [#115](https://github.com/htiel/LCARS-lovelace-dashboard/issues/115), [#130](https://github.com/htiel/LCARS-lovelace-dashboard/issues/130), [#131](https://github.com/htiel/LCARS-lovelace-dashboard/issues/131), [#132](https://github.com/htiel/LCARS-lovelace-dashboard/issues/132), [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) | `_archive/plans/5.5-release-train.md` recorded them as closed in 5.5.0 |
| [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134), [#83](https://github.com/htiel/LCARS-lovelace-dashboard/issues/83), [#84](https://github.com/htiel/LCARS-lovelace-dashboard/issues/84), [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85), [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86), [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87), [#95](https://github.com/htiel/LCARS-lovelace-dashboard/issues/95), [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96), [#98](https://github.com/htiel/LCARS-lovelace-dashboard/issues/98), [#100](https://github.com/htiel/LCARS-lovelace-dashboard/issues/100), [#118](https://github.com/htiel/LCARS-lovelace-dashboard/issues/118) | `_archive/plans/5.5-release-train.md` recorded them as closed in 5.5.1 |
| [#208](https://github.com/htiel/LCARS-lovelace-dashboard/issues/208), [#209](https://github.com/htiel/LCARS-lovelace-dashboard/issues/209), [#97](https://github.com/htiel/LCARS-lovelace-dashboard/issues/97) | `_archive/plans/5.5-release-train.md` recorded them as closed in 5.5.8b |
| [#165](https://github.com/htiel/LCARS-lovelace-dashboard/issues/165), [#166](https://github.com/htiel/LCARS-lovelace-dashboard/issues/166), [#167](https://github.com/htiel/LCARS-lovelace-dashboard/issues/167), [#168](https://github.com/htiel/LCARS-lovelace-dashboard/issues/168), [#197](https://github.com/htiel/LCARS-lovelace-dashboard/issues/197), [#198](https://github.com/htiel/LCARS-lovelace-dashboard/issues/198), [#199](https://github.com/htiel/LCARS-lovelace-dashboard/issues/199), [#200](https://github.com/htiel/LCARS-lovelace-dashboard/issues/200), [#111](https://github.com/htiel/LCARS-lovelace-dashboard/issues/111), [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101), [#123](https://github.com/htiel/LCARS-lovelace-dashboard/issues/123), [#124](https://github.com/htiel/LCARS-lovelace-dashboard/issues/124) | `_archive/plans/5.5-release-train.md` recorded them as closed in 5.5.9 |
| [#191](https://github.com/htiel/LCARS-lovelace-dashboard/issues/191), [#192](https://github.com/htiel/LCARS-lovelace-dashboard/issues/192), [#193](https://github.com/htiel/LCARS-lovelace-dashboard/issues/193), [#194](https://github.com/htiel/LCARS-lovelace-dashboard/issues/194), [#195](https://github.com/htiel/LCARS-lovelace-dashboard/issues/195), [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117), [#120](https://github.com/htiel/LCARS-lovelace-dashboard/issues/120), [#121](https://github.com/htiel/LCARS-lovelace-dashboard/issues/121), [#122](https://github.com/htiel/LCARS-lovelace-dashboard/issues/122) | `_archive/plans/5.5-release-train.md` recorded them as closed in 5.5.7, yet several are still open now |

### Likely Won't-Do / Captain-Decision Candidates

These should be decided early so they do not pollute every train:

| Issue | Why it may not belong in active implementation scope |
|------|-------------------------------------------------------|
| [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) | `needs-external-artist`; multiple archived plans treat this as a Captain art decision, not normal engineering work |
| [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) | Multi-user PHI/data scoping is a large policy feature with no current 5.x backlog row |
| [#209](https://github.com/htiel/LCARS-lovelace-dashboard/issues/209) | Archived notes question whether this is an LCARS-owned defect or an external extension leak |
| Wesley's unscheduled IoT ideas | Explicitly unscheduled by design; do not let "backlog zero" accidentally turn them into mandatory 5.x work |

### Pass 0 Deliverable

Pass 0 is complete only when the team produces a one-page reconciliation ledger with one row per open GitHub issue and one row per backlog-only top-level `TODO`, each stamped with exactly one disposition:

- `IMPLEMENT in Train N`
- `CLOSE as already shipped`
- `CLOSE as duplicate/superseded`
- `CLOSE as won't-do`
- `DEFER to 6.x with Captain approval`

That ledger becomes the only execution queue. `plans/backlog-5x.md` is not rewritten during Pass 0; it is reduced only after the corresponding train or closeout decision ships.

## Train Schedule

### Train 1 — v5.7.0-beta.N — Bug Elimination + A11y + Visual + Palette Sweep

**Purpose:** Reuse the approved `plans/v5.7-bug-elimination-plan.md` shape, but narrow it to the still-open, still-reproducible subset after Pass 0. Focus on user-visible runtime defects, a11y regressions, dashboard polish, and one formal LCARS palette/typography compliance sweep.

**Scope themes**

- Habitat navigation and viewport behavior
- Illumination/Cetacean polish
- Starship/Subspace/Cetacean/visual audit fixes
- LCARS palette/typography compliance sweep folding [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96), [#193](https://github.com/htiel/LCARS-lovelace-dashboard/issues/193), and [#195](https://github.com/htiel/LCARS-lovelace-dashboard/issues/195) into one Geordi checkpoint
- Any backlog-only UI bugs that Pass 0 proves are still real

**Exit criteria**

- All Train 1 issues are either fixed and released, closed with citation, or explicitly re-bucketed by verified non-repro.
- No unresolved high-priority a11y or navigation defects remain in the train scope.
- Bundle delta is **<= +0 KB** versus the Pass 0 baseline build.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Geordi: required
- Data: required
- Worf: required for any privacy/security-adjacent UI item
- Wesley: optional polish pass

### Train 2a — v5.8.0-beta.N — Deps & Security

**Purpose:** Isolate supply-chain hardening, WS write-surface caps, token/privacy issues, and CVE cleanup. Do not mix this with the Lit 3 migration.

**Scope themes**

- WebSocket write-handler validation and payload caps
- `_safe_json_loads` correctness
- Camera token/privacy handling
- npm dependency audit and `loader-utils` CVE remediation via direct upgrades or `package.json` overrides/resolutions

**Exit criteria**

- All Train 2a issues are fixed and released or escalated to the Captain only if CVE-clean closure proves impossible.
- `npm audit --omit=dev` and `npm audit signatures` are clean, or the Captain has explicitly approved an exception after Worf escalation.
- Worf's 5-control cap checklist is satisfied for every WS write handler in the codebase, not just the handlers cited in the issues.
- Bundle delta is **<= +20 KB** versus the Pass 0 baseline build.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Worf: required blocker gate
- Data: required blocker gate
- Geordi: review only if UI behavior changes
- Wesley: not required

### Train 2b — v5.9.0-beta.N — Lit 3 Long-Bake Migration

**Purpose:** Run [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) as its own long-bake beta with a dedicated regression gate. This train exists specifically to avoid burying a framework migration inside unrelated security work.

**Scope themes**

- Lit 3 migration only
- CSP `Content-Security-Policy-Report-Only` shadow-deploy during beta
- Regression validation on entity-rendering cards and template-sink usage

**Exit criteria**

- [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) ships alone in this train.
- Pre- and post-migration grep for `unsafeHTML|innerHTML|outerHTML|insertAdjacentHTML|document.write` shows **zero net new sites**.
- Manual XSS smoke test passes on entity-attribute-rendering cards.
- CSP Report-Only shadow deploy is exercised during the beta bake window.
- Bundle delta budget is **TBD in Pass 0 after the Lit 3 baseline build** and becomes a release gate before implementation starts.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Worf: required blocker gate
- Data: required blocker gate
- Geordi: required if visual or focus behavior changes
- Wesley: not required

### Train 3 — v5.10.0-beta.N — Drift Cleanup & Spec Reconciliation

**Purpose:** Clean up the stale-backlog / reopened-closure mess without pretending every stale row needs code. This train exists to eliminate inventory drift, spec drift, and carry-forward residue.

**Scope themes**

- Backlog-only TODOs that Pass 0 proves still reproduce
- Issues that archived plans previously marked closed but are now open again
- Carry-forward item [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33)
- Non-security backlog-only correctness work such as audio/spec drift if still real

**Exit criteria**

- All backlog-only top-level 5X-B/F rows have a shipped disposition, an explicit close citation, or a Captain-approved defer.
- `plans/backlog-5x.md` is reduced materially after this train; stale TODO rows do not survive into Train 4.
- Bundle delta is **<= +0 KB** versus the Pass 0 baseline build.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Data: required
- Geordi: required where visual/spec drift is involved
- Worf: required for any PHI/privacy carry-over
- Wesley: review only if a creative-spec drift item survives triage

### Train 4 — v5.11.0-beta.N — F* Integrations

**Purpose:** Ship the F* integrations and the shared primitives they depend on, but only after a hard Phase 0 Wesley design pass and Captain entity confirmation gates are complete.

#### Train 4 Phase 0 — Wesley Creative Addendum Gate

Before any Train 4 panel implementation begins, Wesley authors creative addenda and Geordi reviews each for LCARS grammar compliance:

- `specs/LCARS-GALLEY-PANEL-SPEC.md` — ThermoWorks creative addendum
- `specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md` — Oura creative addendum
- New `specs/LCARS-FABRICATION-PANEL-SPEC.md` — Bambu fabrication spec
- New `specs/LCARS-PERSONNEL-PANEL-SPEC.md` — Life360 personnel/presence spec

These addenda must define the Train 4 shared primitives first:

- **5X-LS-5** — shared sparkline strip primitive
- **5X-TAC-1** — shared event timeline primitive
- **5X-TAC-2** — shared crew manifest primitive

**Scope themes**

- Bambu Lab fabrication panel
- ThermoWorks Galley probe cluster
- Oura Medical Bay implementation
- Life360 Habitat presence aggregation
- Tactical Chronicle Mode
- Life Support sparkline enhancement [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101)
- Cross-dashboard deep links [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87)
- Aqara FP1E / FP2 mmWave demo-node rendering within the Train 4 presence/sparkline work

**Exit criteria**

- Wesley Phase 0 creative addenda are complete and Geordi-approved before any F* panel work begins.
- Captain entity-confirmation gates are satisfied for each F* integration before engineering starts that integration's panel work.
- Shared primitives 5X-LS-5, 5X-TAC-1, and 5X-TAC-2 are designed first and consumed by Train 4 integrations rather than duplicated per panel.
- Bundle delta is **<= +60 KB** versus the Pass 0 baseline build.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Data: required
- Geordi: required
- Worf: required blocker gate for PHI/presence/privacy handling
- Wesley: required Phase 0 gate and end-of-train review

### Train 5 — v5.12.0-beta.N — Closeout

**Purpose:** Publish the final close-citations, collapse the backlog to the intended post-zero shape, and reserve limited closeout slack for one optional spec-only future primitive.

**Scope themes**

- Final backlog reduction and Epic reset after the last 5.x close decisions
- Close [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) with Captain-citation posture already decided on 2026-05-13
- Optional one-page Red Alert event bus spec only, with no consumers and no code
- Final release hygiene and zero-open-issue verification

**Exit criteria**

- Zero open GitHub issues.
- `plans/backlog-5x.md` is reduced to reset Epic structure plus any explicitly retained non-executable reference sections only.
- Bundle delta is **<= +0 KB** versus the Pass 0 baseline build, excluding version metadata and documentation-only closeout changes.
- If the train adds net **+500 lines** to `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, extraction per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` lands before merge.
- Cumulative Geordi + Data + Worf review is signed off before release.
- Three-file version sync is verified before release publication.

**Gating reviewers**

- Worf: required blocker gate
- Data: required blocker gate
- Geordi: required
- Wesley: required for optional Red Alert spec review

## Per-Train Issue Manifest

### Train 1 — v5.7.0-beta.1 — Bug Convergence

| GH issue | 5X ID | Scope |
|---------|-------|-------|
| [#83](https://github.com/htiel/LCARS-lovelace-dashboard/issues/83) | 5X-B16 | Restore navigation and floor context while scrolling |
| [#84](https://github.com/htiel/LCARS-lovelace-dashboard/issues/84) | 5X-B17 | Compact sparse areas and cap deck scroll length |
| [#111](https://github.com/htiel/LCARS-lovelace-dashboard/issues/111) | 5X-B38 | Illumination keyboard reorder + target size + palette cleanup |
| [#159](https://github.com/htiel/LCARS-lovelace-dashboard/issues/159) | 5X-VISUAL | Power detail links overlap feeder pipe graphic |
| [#165](https://github.com/htiel/LCARS-lovelace-dashboard/issues/165) | 5X-BUG | Illumination `_entityCache` invalidation regression |
| [#166](https://github.com/htiel/LCARS-lovelace-dashboard/issues/166) | 5X-VISUAL | Illumination initial auto-scroll overshoots first card |
| [#167](https://github.com/htiel/LCARS-lovelace-dashboard/issues/167) | 5X-VISUAL | Illumination orphaned BED PLUG BOT layout |
| [#168](https://github.com/htiel/LCARS-lovelace-dashboard/issues/168) | 5X-VISUAL | Illumination scene-chip scope affordance |
| [#187](https://github.com/htiel/LCARS-lovelace-dashboard/issues/187) | 5X-VISUAL | Network disconnected-tile inconsistency |
| [#191](https://github.com/htiel/LCARS-lovelace-dashboard/issues/191) | 5X-SPEC | Starship `top_cpu_proc` string parsing drift |
| [#192](https://github.com/htiel/LCARS-lovelace-dashboard/issues/192) | 5X-SPEC | Starship OFFLINE-when-stale pill behavior |
| [#193](https://github.com/htiel/LCARS-lovelace-dashboard/issues/193) | 5X-A11Y | Starship one-font violation |
| [#194](https://github.com/htiel/LCARS-lovelace-dashboard/issues/194) | 5X-VISUAL | Starship anchor labels overlap silhouette |
| [#195](https://github.com/htiel/LCARS-lovelace-dashboard/issues/195) | 5X-VISUAL | Starship THERM vs CRITICAL color collision |
| [#197](https://github.com/htiel/LCARS-lovelace-dashboard/issues/197) | 5X-BUG | Cetacean calcium hardness fallback |
| [#198](https://github.com/htiel/LCARS-lovelace-dashboard/issues/198) | 5X-BUG | Cetacean debouncer cleanup |
| [#199](https://github.com/htiel/LCARS-lovelace-dashboard/issues/199) | 5X-A11Y | Cetacean mute button target size and label |
| [#200](https://github.com/htiel/LCARS-lovelace-dashboard/issues/200) | 5X-A11Y | Cetacean gauge needle competes with focus indicator |
| [#221](https://github.com/htiel/LCARS-lovelace-dashboard/issues/221) | 5X-B49 | Habitat active-pill desync |
| [#222](https://github.com/htiel/LCARS-lovelace-dashboard/issues/222) | 5X-B50 | Unadopted UniFi ADOPT button leakage |
| [#208](https://github.com/htiel/LCARS-lovelace-dashboard/issues/208) | no current 5X row | Habitat empty-pane default behavior if Pass 0 proves still real |
| [#209](https://github.com/htiel/LCARS-lovelace-dashboard/issues/209) | no current 5X row | GtG badge leak if confirmed LCARS-owned |
| [#94](https://github.com/htiel/LCARS-lovelace-dashboard/issues/94) | 5X-B28 | Mobile icon-only Habitat sidebar if still open in product intent |
| [#95](https://github.com/htiel/LCARS-lovelace-dashboard/issues/95) | 5X-B29 | Tactical donut center-text contrast if not already fixed |
| [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96) | 5X-B30 | Off-palette green cleanup if not already fixed |
| [#98](https://github.com/htiel/LCARS-lovelace-dashboard/issues/98) | 5X-B31 | Placeholder minus-sign parsing if not already fixed |
| [#100](https://github.com/htiel/LCARS-lovelace-dashboard/issues/100) | 5X-B32 | Flat-color deck headers if not already fixed |

### Train 2a — v5.8.0-beta.N — Deps & Security

| GH issue | 5X ID | Scope |
|---------|-------|-------|
| [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86) | 5X-B12 | Audit and selectively update npm dependencies |
| [#99](https://github.com/htiel/LCARS-lovelace-dashboard/issues/99) | 5X-B33 | Remove camera access-token leak path if still unresolved |
| [#123](https://github.com/htiel/LCARS-lovelace-dashboard/issues/123) | 5X-B47 | Subspace reveal-toggle UX polish + allowlist follow-through |
| [#130](https://github.com/htiel/LCARS-lovelace-dashboard/issues/130) | no current 5X row | Apply 256KB / depth-20 caps to WS write handlers |
| [#131](https://github.com/htiel/LCARS-lovelace-dashboard/issues/131) | no current 5X row | `page` allowlist hardening in `add_card` WS path |
| [#132](https://github.com/htiel/LCARS-lovelace-dashboard/issues/132) | no current 5X row | `_safe_json_loads` failure signaling fix |
| [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) | 5X-DEPS | Eliminate `loader-utils` transitive CVE chain |

### Train 2b — v5.9.0-beta.N — Lit 3 Long-Bake

| GH issue | 5X ID | Scope |
|---------|-------|-------|
| [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) | 5X-DEPS | Lit 3 migration as a dedicated long-bake beta with CSP Report-Only and XSS regression gate |

### Train 3 — v5.10.0-beta.N — Drift Cleanup & Spec Reconciliation

| GH issue | 5X ID | Scope |
|---------|-------|-------|
| [#33](https://github.com/htiel/LCARS-lovelace-dashboard/issues/33) | 5X-CF-33 | Persistent per-area device-button reorder carry-forward |
| [#85](https://github.com/htiel/LCARS-lovelace-dashboard/issues/85) | 5X-B23 | Remove `require()` from render template path if still needed |
| [#88](https://github.com/htiel/LCARS-lovelace-dashboard/issues/88) | 5X-ENG-7 | Grid 0W mapping investigation if still reproducible |
| [#89](https://github.com/htiel/LCARS-lovelace-dashboard/issues/89) | 5X-ENG-8 | Battery classification cleanup if still reproducible |
| [#93](https://github.com/htiel/LCARS-lovelace-dashboard/issues/93) | 5X-B26 | Battery telemetry double-count if still reproducible |
| [#107](https://github.com/htiel/LCARS-lovelace-dashboard/issues/107) | 5X-B36 | Audio spec drift reconciliation |
| [#109](https://github.com/htiel/LCARS-lovelace-dashboard/issues/109) | 5X-B37 | Battery panel dead CSS / slider / animation-budget cleanup |
| [#115](https://github.com/htiel/LCARS-lovelace-dashboard/issues/115) | 5X-B40 | Starship default-install 404 if the archived closure did not actually hold |
| [#116](https://github.com/htiel/LCARS-lovelace-dashboard/issues/116) | 5X-B39 | Sparse anchors dragging status pill |
| [#118](https://github.com/htiel/LCARS-lovelace-dashboard/issues/118) | 5X-B42 | SVG self-close lint rule if closure drift is real |
| [#119](https://github.com/htiel/LCARS-lovelace-dashboard/issues/119) | 5X-B43 | Medical posterior silhouette |
| [#120](https://github.com/htiel/LCARS-lovelace-dashboard/issues/120) | 5X-B44 | Starship tactical-tab side profile |
| [#121](https://github.com/htiel/LCARS-lovelace-dashboard/issues/121) | 5X-B45 | Starship engineering sparklines |
| [#122](https://github.com/htiel/LCARS-lovelace-dashboard/issues/122) | 5X-B46 | Per-vessel threshold YAML loader |
| [#124](https://github.com/htiel/LCARS-lovelace-dashboard/issues/124) | 5X-B48 | Discovery memoization across cards |
| [#223](https://github.com/htiel/LCARS-lovelace-dashboard/issues/223) | 5X-B51 | Camera offline placeholder timeout fallback |
| — | 5X-B52 | Sickbay cardiac silhouette mirror fix; create issue only if still unresolved after grep/repro |

### Train 4 — v5.11.0-beta.N — F* Integrations

#### Train 4 Phase 0 — Wesley Creative Addenda

| Spec / artifact | Required addendum | Reviewer | Gate |
|-----------------|-------------------|----------|------|
| `specs/LCARS-GALLEY-PANEL-SPEC.md` | ThermoWorks creative addendum | Geordi | Must be approved before [#226](https://github.com/htiel/LCARS-lovelace-dashboard/issues/226) work starts |
| `specs/LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md` | Oura creative addendum | Geordi | Must be approved before [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) work starts |
| `specs/LCARS-FABRICATION-PANEL-SPEC.md` | New Bambu fabrication spec | Geordi | Must be approved before [#225](https://github.com/htiel/LCARS-lovelace-dashboard/issues/225) work starts |
| `specs/LCARS-PERSONNEL-PANEL-SPEC.md` | New Life360 personnel/presence spec | Geordi | Must be approved before [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) work starts |

#### Train 4 Foundational Primitives

| Item | Scope |
|------|-------|
| 5X-LS-5 | Shared sparkline strip primitive for Life Support / Bambu / ThermoWorks / Oura |
| 5X-TAC-1 | Shared event timeline primitive |
| 5X-TAC-2 | Shared crew manifest primitive |

#### Train 4 Implementation Manifest

| GH issue | 5X ID | Scope |
|---------|-------|-------|
| [#224](https://github.com/htiel/LCARS-lovelace-dashboard/issues/224) | 5X-F32 | Tactical Chronicle Mode |
| [#225](https://github.com/htiel/LCARS-lovelace-dashboard/issues/225) | 5X-F33 | Bambu Lab Fabrication panel |
| [#226](https://github.com/htiel/LCARS-lovelace-dashboard/issues/226) | 5X-F34 | ThermoWorks probe cluster in Galley |
| [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) | 5X-F35 | Oura Ring Medical Bay implementation |
| [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) | 5X-F36 | Life360 Habitat presence aggregation |
| [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) | 5X-F4 | Life Support presence dot → sparkline strip, including Aqara FP1E motion/approach distance and FP2 zone-occupancy demo-node rendering |
| [#87](https://github.com/htiel/LCARS-lovelace-dashboard/issues/87) | 5X-B25 | Cross-dashboard deep links as Train 4 navigation support |

#### Train 4 Captain Entity-Confirmation Gates

| Integration | GH issue | Captain confirmation required before engineering starts panel work |
|-------------|----------|---------------------------------------------------------------|
| Bambu Lab | [#225](https://github.com/htiel/LCARS-lovelace-dashboard/issues/225) | Captain confirms fabrication entities are live in his HA dump |
| ThermoWorks | [#226](https://github.com/htiel/LCARS-lovelace-dashboard/issues/226) | Captain confirms Galley probe entities are live in his HA dump |
| Oura | [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) | Captain confirms Medical Bay entities are live in his HA dump |
| Life360 | [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) | Captain confirms personnel/presence entities are live in his HA dump |

### Train 5 — v5.12.0-beta.N — Closeout

| Work item | Type | Scope |
|----------|------|-------|
| Closeout-1 | Close citation | Close [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) as won't-fix per Captain decision dated 2026-05-13 and strip `needs-external-artist` |
| Closeout-2 | Backlog hygiene | Remove/resolve remaining stale TODO rows and leave only reset Epic structure plus explicitly retained non-executable reference material |
| Closeout-3 | Optional spec-only | Red Alert event bus contract only; no consumers, no code |
| Closeout-4 | Policy closeout | [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) remains out of Train 5 implementation scope and closes as deferred / won't-do for 5.x per Captain decision dated 2026-05-13 |

## Pre-Execution Checklist

Run this once before Pass 0, then repeat the grep/repro slice before each train.

```powershell
# 1. Verify branch and working tree
git status --short
git branch --show-current   # must be 5.0

# 2. Pull latest history and tags
git pull --ff-only origin 5.0
git fetch --tags

# 3. Snapshot current open issues
gh issue list --state open --limit 500 --json number,title,labels

# 4. For every open GH issue and backlog-only TODO row, grep first
rg -n "#83|#84|#86|#87|#88|#89|#93|#94|#95|#96|#97|#98|#99|#100|#101|#107|#109|#111|#115|#116|#117|#118|#119|#120|#121|#122|#123|#124|#130|#131|#132|#133|#134|#159|#165|#166|#167|#168|#187|#191|#192|#193|#194|#195|#197|#198|#199|#200|#208|#209|#220|#221|#222|#223|#224|#225|#226|#227|#228" .

# 4a. Cross-reference prior train docs before assigning work
rg -n "#83|#84|#86|#87|#88|#89|#93|#94|#95|#96|#97|#98|#99|#100|#101|#107|#109|#111|#115|#116|#117|#118|#119|#120|#121|#122|#123|#124|#130|#131|#132|#133|#134|#159|#165|#166|#167|#168|#187|#191|#192|#193|#194|#195|#197|#198|#199|#200|#208|#209|#220|#221|#222|#223|#224|#225|#226|#227|#228" plans/v5.7-bug-elimination-plan.md plans/v5.6-train-shipped.md _archive/plans/5.5-release-train.md

# 4b. Inspect in-tree issue citations before coding
rg -n "#83|#84|#86|#87|#88|#89|#93|#94|#95|#96|#97|#98|#99|#100|#101|#107|#109|#111|#115|#116|#117|#118|#119|#120|#121|#122|#123|#124|#130|#131|#132|#133|#134|#159|#165|#166|#167|#168|#187|#191|#192|#193|#194|#195|#197|#198|#199|#200|#208|#209|#220|#221|#222|#223|#224|#225|#226|#227|#228" custom_components/

# 5. Reconfirm reproducibility before assigning implementation work
#    If the issue is not reproducible and grep shows an apparent fix, classify it for close-citation instead of coding.

# 6. Capture baseline build before any dependency or UI train
cd custom_components/lcars_dashboard/js
npm run build
(Get-Item dist/lcars-dashboard.js).Length
cd ../../..

# 7. Keep 3-file release sync ready, but do not bump versions until train release time
#    custom_components/lcars_dashboard/const.py
#    custom_components/lcars_dashboard/manifest.json
#    custom_components/lcars_dashboard/js/package.json
```

Additional execution rules:

- Do not reopen a closed issue just because the backlog row says `TODO`. Reopen only after grep + repro establish the defect still exists.
- Do not close an open issue just because an archived plan claimed it shipped. Close only after grep + behavior check confirm the fix is actually present.
- Close GitHub issues only when the relevant train release is published, not mid-train.
- Every train gets one cumulative review pass from Data + Worf + Geordi before the release tag.
- Pass 0 must record file-size and line-count baselines for `custom_components/lcars_dashboard/js/src/cards/lcars-homepage-card.js`, `custom_components/lcars_dashboard/js/src/translations.js`, and `custom_components/lcars_dashboard/js/src/cards/lcars-tactical-card.js`.
- Any train that exceeds its bundle gate or the homepage-card `+500` line threshold is blocked until the corresponding extraction or scope reduction lands.

## Risks & Dependencies

| Risk | Why it matters | Mitigation |
|------|----------------|------------|
| [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) Lit 3 migration | Non-trivial framework migration with wide frontend blast radius and XSS-regression risk | Isolate in Train 2b; beta-only release; CSP Report-Only shadow deploy; zero-net-new template-sink gate |
| [#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227) Oura PHI handling | Medical Bay exposes personal health data; privacy mistakes are release-blocking | Worf gate mandatory; auto-discovery is allowed in Captain's secured HA environment, but screenshot-obfuscator wiring and no-PHI-in-logs posture remain required |
| [#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228) Life360 privacy | Person/location data demands correct redaction-context behavior even in a secured HA environment | Worf gate mandatory; Captain owns HA-side setup, engineering owns redaction/screenshot wiring |
| [#86](https://github.com/htiel/LCARS-lovelace-dashboard/issues/86) and [#133](https://github.com/htiel/LCARS-lovelace-dashboard/issues/133) dependency blast radius | npm/package updates can destabilize build chain and widen diffs | Keep isolated in Train 2a; build at every step; CVE-clean is a release gate |
| Inventory drift between GitHub, backlog, and archive | Team can waste multiple sessions re-fixing shipped work or missing reopened defects | Pass 0 is mandatory; no execution without a signed reconciliation ledger |
| Feature-integration environment setup | Bambu, ThermoWorks, Oura, and Life360 all depend on HA-side setup not fully controlled by this repo | Captain confirms entities are live in his HA dump before each integration begins; engineering does not start blind |
| `lcars-homepage-card.js` monolith growth | Train 1 and Train 4 can push the main card deeper past the line-count warning threshold | Enforce the `+500` line extraction gate per `specs/LCARS-PANEL-EXTRACTION-ARCHITECTURE.md` |

## Out of Scope / Defer

These items should not silently ride along in backlog-zero execution. They need an explicit close or defer decision.

| Item | Recommended disposition | Rationale |
|------|-------------------------|-----------|
| Wesley's IoT / Voice / NFC / Hardware idea sections in `plans/backlog-5x.md` | Delete from the backlog during closeout | Captain decision dated 2026-05-13: they are out of scope, not parked backlog |
| Wesley's Reference Card Index | Keep as non-executable reference material only | Research/reference material, not executable backlog |
| [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) | Defer / won't-do for 5.x | Captain decision dated 2026-05-13: remain single-user in 5.x |
| [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) | Close as won't-fix for 5.x | Captain decision dated 2026-05-13: silhouettes stay as-is |
| Any backlog-only TODO row that Pass 0 proves is already shipped | Close backlog row with citation, do not reopen GH | Backlog zero is about queue hygiene, not performative reimplementation |
| Any issue proven to be caused by external HA naming/config or another extension | Close as out-of-scope | Do not spend 5.x train capacity on defects outside LCARS code ownership |

## Captain Decisions (tracking)

All Captain-only questions were resolved on 2026-05-13. Team-default decisions on non-Captain questions were adopted the same day and are binding for this plan unless the Captain later overrides them.

| # | Question | Captain's Decision | Date | Implication |
|---|---|---|---|---|
| WQ1 / Q12 | PHI default for Oura ([#227](https://github.com/htiel/LCARS-lovelace-dashboard/issues/227)) and Life360 ([#228](https://github.com/htiel/LCARS-lovelace-dashboard/issues/228)) | **Auto-discovery acceptable. HA environment is secured by default; dashboards are not public; no external exposure risk.** | 2026-05-13 | Train 5 does NOT need an opt-in config-flow gate or Captain-curated entity allowlist. Worf's PHI gates reduce to: screenshot-obfuscator attributes wired (still required for shared screen captures), no PHI in logs (standard hygiene), redaction primitives available but **default ON only for screenshot/shared-display contexts, not runtime dashboard rendering**. |
| WQ4 / Q5 | Multi-user data scoping ([#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220)) | **Stay single-user scoped for 5.x. Revisit only when a second user's data actually lands in sick bay; per-integration mapping at that time.** | 2026-05-13 | Close [#220](https://github.com/htiel/LCARS-lovelace-dashboard/issues/220) as **deferred / won't-do for 5.x** with a citation to this decision. Drop it from the Train 5 manifest. No `is_admin` plumbing, no dashboard-role layer, no per-integration user mapping in 5.x. Re-open under 6.x when a real second-user data source forces the design (the design must then be per-integration, not a generic shim). Train 5 scope reduces to PHI integrations + #117 art decision only. |
| WeQ1 | mmWave demo node in Train 4 to feed [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) | **Keep to existing presence sensors UNLESS Eric has mmWave devices.** Eric's HA dump confirms **Aqara FP1E** (zigbee, kitchen + office; motion-distance, approach-distance, occupancy) and **Aqara FP2** (HomeKit; multi-zone presence + light sensor). → **mmWave demo node IS in scope for Train 4.** | 2026-05-13 | Train 4 [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) sparkline must consume Aqara FP1E `motion_distance` / `approach_distance` and FP2 multi-zone occupancy as first-class data sources, not just generic motion booleans. Wesley's "demo node" entry promoted to a Train 4 sub-task: surface FP1E distance trends in the Life Support sparkline strip and FP2 zone occupancy in the area presence rendering. No new hardware required from Captain — uses Eric's existing devices. |
| WeQ3 | Wesley creative addenda on F* specs before Train 4 | **Wesley designs first — do it right the first time.** | 2026-05-13 | Train 4 gets a **Phase 0: Wesley creative addendum pass** as a hard prerequisite gate. Wesley authors creative-direction addenda onto each F* spec (`LCARS-GALLEY-PANEL-SPEC.md` for ThermoWorks, `LCARS-MEDICAL-BAY-DASHBOARD-SPEC.md` for Oura, new `LCARS-FABRICATION-PANEL-SPEC.md` for Bambu, `LCARS-PERSONNEL-PANEL-SPEC.md` extension for Life360) covering: Langford gauge usage, ring-gauge vs bar choice, mmWave distance visualization (per WeQ1), Wesley's TAC/LS shared primitive plan (WeQ2 — sparkline / event timeline / crew manifest), redaction-context patterns (per WQ1/Q12), and Aqara FP1E/FP2 entity rendering. Geordi reviews each addendum for LCARS grammar compliance before any Train 4 panel work begins. WeQ2 (promoting 5X-LS-5 / 5X-TAC-1 / 5X-TAC-2 as Train 4 foundational sub-tasks) is implicitly **YES** under this decision — Wesley's design pass will define them as the shared primitives that the F* panels then consume. |
| Q2 / #117 | Anatomical silhouettes ([#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117), 5X-B41) | **Captain likes the sick bay silhouettes as they are. Close as won't-fix.** | 2026-05-13 | Close [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117) as **won't-fix** with citation to this decision. Drop 5X-B41 from `backlog-5x.md`. Remove from Train 5 manifest entirely. The `needs-external-artist` GH label is no longer relevant for any open work — strip the label. Companion items 5X-B43 (posterior silhouette pending) and 5X-B44 (Starship side-profile pending) — re-confirm with Captain whether these are also close-as-current or still planned (the "current geometry is fine" posture suggests they may also be won't-fix; flagged for confirmation under same decision rationale but NOT auto-closed without explicit Captain word). |
| Q1 | Wesley's unscheduled IoT / Voice / NFC / Hardware ideas bucket | **Not part of this. Close IoT / Voice / NFC as won't-fix.** | 2026-05-13 | Wesley's `Wesley's IoT / Hardware Ideas (Backlog — Unscheduled)` and any voice/NFC items in `plans/backlog-5x.md` are **out of scope for backlog zero and the 5.x line**. Delete these sections from `backlog-5x.md` outright (do NOT preserve as parked) — they create the illusion of pending work when they are not. No GH issues exist for them, so nothing to close on the GH side. Wesley's `Wesley's Reference Card Index` section may stay as a creative reference doc (not a TODO list). Wesley may re-pitch any of these as fresh proposals under the 6.x program, but they do not carry forward as backlog. **Exception (already decided WeQ1):** mmWave is in scope for Train 4 because Eric has Aqara FP1E/FP2 hardware in production — that is consumption of an existing data source, not Wesley's "future hardware" bucket. |
| DQ3 | Bambu / ThermoWorks `scan_interval` in your HA | **Go with team recommendation: assume HA defaults.** | 2026-05-13 | Train 4 sizes render-throttling against default integration poll/push intervals: Bambu print-progress entities ~1–2 s, ThermoWorks probes ~1 Hz (per Data's review). Any new card consuming these entities uses RAF-batched / throttled `requestUpdate()` and audited `hasChanged` predicates. If Captain later overrides `scan_interval` and observes render thrash, treat as a follow-up performance issue rather than an upfront design constraint. |
| Q3 | F* integration setup ownership | **Go with team recommendation (Wesley).** | 2026-05-13 | **Captain owns HA-side integration setup**: account auth, device pairing, OAuth/API tokens, integration installation, test-data provisioning, and verification that entities materialize in HA. **Engineering owns LCARS-side**: panel implementation, spec authoring, redaction-context plumbing, screenshot-obfuscator wiring, and Wesley's creative addenda. Standard pattern from prior F* work (per `_archive/plans/v4.13.0-implementation-plan.md` and v5.6 train precedent). Train 4 cannot start panel work for a given F* integration until Captain confirms entities are live in his HA dump. |

### Team Defaults Adopted Into Plan v2

| # | Decision | Adopted default | Date | Plan implication |
|---|---|---|---|---|
| Q4 / DQ2 | Lit 3 train split | **Adopt Data + Worf recommendation.** Split into Train 2a (`5.8.0-beta.N`) for deps/security and Train 2b (`5.9.0-beta.N`) for [#134](https://github.com/htiel/LCARS-lovelace-dashboard/issues/134) alone. | 2026-05-13 | The five-train framing is retired. Subsequent trains renumber to Train 3 / Train 4 / Train 5 at `5.10.0-beta.N`, `5.11.0-beta.N`, and `5.12.0-beta.N`. |
| DQ1 | Homepage-card extraction threshold | **Hard rule.** Any train adding net `+500` lines to `lcars-homepage-card.js` must extract before merge. | 2026-05-13 | Added to every train's exit criteria and Pass 0 baseline rules. |
| DQ4 | Bundle budgets | **Hard release gates.** Train 1 `<= +0 KB`, Train 2a `<= +20 KB`, Train 2b `TBD after Lit 3 baseline`, Train 3 `<= +0 KB`, Train 4 `<= +60 KB`, Train 5 `<= +0 KB`. | 2026-05-13 | Added to every train's exit criteria. |
| WQ2 | CSP Report-Only during Lit 3 beta | **Yes.** | 2026-05-13 | Train 2b includes CSP Report-Only shadow deploy as a regression tripwire. |
| WQ3 | CVE-clean release posture | **Hard gate.** | 2026-05-13 | If `loader-utils` cannot be closed via overrides/resolutions or direct upgrades, the train escalates to the Captain instead of silently shipping with debt. |
| WQ5 | Worf blocker authority on WS handlers | **Yes.** | 2026-05-13 | Worf may block Train 2a release if any WS write handler lacks the full 5-control cap set, even if not explicitly named in an issue. |
| Q7 | Close-citation default | **Close with citation when grep finds an in-tree fix; reopen only if behavior repro fails.** | 2026-05-13 | Pass 0 and Train 3 use close-citation as the default queue-hygiene posture. |
| Q10 | [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) placement | **Train 4.** | 2026-05-13 | The sparkline strip is treated as a Train 4 prerequisite primitive, not post-zero backlog. |
| Q13 | 5X-B52 audit-trail posture | **Create the GH issue first, then close.** | 2026-05-13 | Train 3 keeps GH audit parity for this backlog-only item. |
| GQ1 | Palette/typography compliance | **Single Geordi checkpoint.** | 2026-05-13 | Train 1 explicitly folds [#96](https://github.com/htiel/LCARS-lovelace-dashboard/issues/96), [#193](https://github.com/htiel/LCARS-lovelace-dashboard/issues/193), and [#195](https://github.com/htiel/LCARS-lovelace-dashboard/issues/195) into one sweep. |
| WeQ2 | Train 4 foundational primitives | **Yes.** Promote 5X-LS-5, 5X-TAC-1, and 5X-TAC-2 into Train 4 design scope. | 2026-05-13 | Wesley Phase 0 defines these primitives before panel work starts. |
| WeQ4 | Red Alert event bus | **Yes, spec only.** | 2026-05-13 | Train 5 may spend closeout slack on a one-page spec with no consumers and no code. |

## Open Questions for the Captain

All open questions resolved 2026-05-13. See `Captain Decisions (tracking)` table above.

## Captain Follow-Ups (non-blocking)

- [#119](https://github.com/htiel/LCARS-lovelace-dashboard/issues/119) / 5X-B43 — Medical posterior silhouette: confirm whether it shares the same won't-fix posture as [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117), or stays as an intentional future polish item.
- [#120](https://github.com/htiel/LCARS-lovelace-dashboard/issues/120) / 5X-B44 — Starship tactical-tab side profile: confirm whether it shares the same won't-fix posture as [#117](https://github.com/htiel/LCARS-lovelace-dashboard/issues/117), or stays as an intentional future polish item.

## Team Review

### Data

- **Pass 0 procedure is sound but incomplete.** Cross-reference must include `_archive/plans/v5.6-train-shipped.md` and `plans/v5.7-bug-elimination-plan.md`, not only `_archive/plans/5.5-release-train.md` — several of the "stale TODO" rows (#94/#95/#96/#98/#100/#107/#118/#124) match the v5.6 grep-before-edit pattern where in-tree comments already cite the issue number. Add a step: before each train, `rg -n "#<num>" custom_components/` and look for citation comments, not just behavior.
- **Capture quantitative baselines in Pass 0**, not just `npm run build` size. Record per-file line counts for `lcars-homepage-card.js` (currently **7,903 lines**, 71% over the 4,500-line warn threshold), `translations.js` (1,713), `lcars-tactical-card.js` (1,384). Train 1 + Train 4 both push the homepage-card monolith further; without a baseline we cannot enforce "smallest correct intervention." Recommend a hard rule: any train adding net +500 lines to `lcars-homepage-card.js` must extract before merging.
- **Train 2 is two trains pretending to be one.** Lit 3 migration (#134) touches every `LitElement` subclass — that is a >10K-line diff on its own and will trip GitHub's PR diff cap, drowning the WS hardening / token / `loader-utils` work in unrelated noise. Split into **Train 2a — Deps & Security** (#86/#99/#123/#130/#131/#132/#133) and **Train 2b — Lit 3 long-bake beta** (#134 alone). 2a unblocks 2b's CVE risk and keeps cumulative review tractable.
- **Sequencing of Lit 3 vs F* trains is correct as drafted** (2 before 4/5). Shipping new Bambu/ThermoWorks/Oura/Life360 components on Lit 2 then migrating them is wasted work. If Captain defers #134 per Q4, F* components must still be authored Lit-3-compatible (no `UpdatingElement`, no `@internalProperty`).
- **F* integration performance.** All four are HA-side integrations; LCARS consumes states via the existing websocket stream — **no new polling on our side.** Real risk is render thrash: Bambu print-progress entities update every 1–2 s and ThermoWorks probes ~1 Hz. Require RAF-batched / throttled `requestUpdate()` on any new card consuming these, and audit `hasChanged` predicates. Oura/Life360 update infrequently; render cost is negligible but PHI redaction logic must be O(1) per tile.
- **Train sizing.** Train 1 (27 items) is realistic only if Pass 0 closes ~⅓ as already-shipped (consistent with v5.6 ratio). Train 3 (17 items) is realistic because most are close-citations or small. Train 4 is the actual overscoped one: three new integration panels + #101 sparkline + #87 cross-dashboard nav each plausibly add a Lit component; combined bundle delta likely +40–80 KB. Recommend pulling #87 to Train 1 or Train 3 (it is navigation plumbing, not an integration).

**Answers:**
- **Q4:** Split Train 2 as above. Lit 3 ships as its own `5.8.0-beta.N` long-bake; #133 `loader-utils` can be mitigated independently via `overrides`/`resolutions` in `package.json` without Lit 3.
- **Q7:** Default to **close-citation when grep finds a fix**, reopen only if behavior repro fails. v5.6 train data shows this is the higher-yield posture.
- **Q10:** Ship #101 in Train 4 — it is small, additive, and gives the train a non-integration win to de-risk the release.
- **Q13:** Create the GH issue for 5X-B52 before closing — costs nothing, gives the close a permanent citation, matches the audit trail rule used for #130–#133.

**Questions:**
- **DQ1:** Will Captain authorize a homepage-card extraction sub-train (split into per-section panels per `LCARS-PANEL-EXTRACTION-ARCHITECTURE.md`) **before** Train 4 lands new integrations, or do we accept the monolith growing past 8,500 lines?
- **DQ2:** For Train 2 split — is a dedicated `5.8.x-beta` series for Lit 3 acceptable, or must it ship inside a single `5.8.0` to preserve the "five trains" framing?
- **DQ3:** Bambu/ThermoWorks state-update frequency: is the Captain's HA instance configured with default poll intervals, or any `scan_interval` overrides we should size render-throttling against?
- **DQ4:** Should the Pass 0 ledger include a measured-bundle-delta budget per train (e.g. Train 4 ≤ +60 KB) as an exit-criteria gate, or is bundle size only reported, not gated?

### Geordi

- **A11y concentration:** All 5 accessibility-tagged issues (#83, #111, #193, #199, #200) land in Train 1 with me as required reviewer — correct posture; they won't be buried as polish.
- **Dashboard grouping:** Habitat (#208, #221), Illumination (#165–#168, #111), and Starship (#191–#195) visual fixes are co-located in Train 1. Single coordinated pass per dashboard avoids re-touch churn. Approved.
- **Palette/typography coordination:** #193 (one-font), #195 (THERM/CRITICAL red collision), and #96 (off-palette green) are all Train 1 but listed as independent fixes. Recommend a single "LCARS palette compliance sweep" sub-task so they share one review pass and one cumulative color audit — prevents accidental new drift while fixing old drift.
- **Audio-grammar (#107):** Placed in Train 3 (Drift Cleanup). Acceptable — it's spec-vs-implementation reconciliation, not new audio work. I'll review LCARS-AUDIO-SPEC.md alignment when Train 3 opens.
- **#117 (anatomical silhouettes):** Riker's framing is sound — treat it as a Captain art decision, not engineering. Incremental polish (posture labels, alignment tweaks) is in-scope; commissioning new artwork is not. Train 5 placement with explicit defer-or-close gate is reasonable.

**Questions:**
- **GQ1:** Should Train 1's palette/typography fixes (#96, #193, #195) share a formal "LCARS color/font compliance sweep" checkpoint, or is per-issue review sufficient?

**Answers:**
- **Q7:** Prefer close-citation unless repro proves otherwise. Grep-before-edit is standing protocol; re-implementing shipped work burns capacity.
- **Q13:** Backlog-row closure without GH issue creation is acceptable for minor spec-drift items (e.g., 5X-B52) when the fix is grep-verifiable and no user-facing regression existed.

### Worf

- **Security train shape is defensible, but split is real.** Train 2 holds the supply-chain + WS-hardening cluster (#86, #99, #123, #130, #131, #132, #133, #134). PHI/location items (#227, #228) and multi-user scoping (#220) live in Train 5 because they are integration-bound, not because they are lower risk. Both trains require Worf as blocker gate; do not let Train 5's "feature" framing dilute that.
- **WS caps must be applied uniformly, not per-handler.** #130/#131/#132 should land as a single hardening pass: every `@websocket_api.async_response` write handler gets (a) voluptuous schema, (b) 256 KB raw-payload size cap, (c) `_safe_json_loads` wrapped in try/except returning structured WS error, (d) depth-20 cap on any nested dict/list, (e) `@websocket_api.require_admin` audit. Track in a checklist in the Train 2 plan; partial coverage is a regression vector.
- **Lit 3 migration (#134) needs an explicit XSS regression gate.** Migration churn is where `unsafeHTML`, `innerHTML`, and template-literal escaping bugs slip in. Train 2 exit criteria must add: grep for `unsafeHTML|innerHTML|outerHTML|insertAdjacentHTML|document.write` pre- and post-migration with zero net new sites, and a manual XSS smoke test against any card that renders entity attributes or friendly_name.
- **#133 CVE closure must be verified, not assumed.** After `loader-utils` chain remediation, run `npm audit --omit=dev` and `npm audit signatures`; record the clean output in the Train 2 release notes. If a CVE cannot be closed without Lit 3, that is the trigger for the Q4 Captain decision — not a deferral by default.
- **PHI gates for #227 / #228 / #220 (Train 5 blockers).** #227 (Oura) and #228 (Life360): opt-in default OFF; Captain-owned entity allowlist; `data-medical`/new `data-presence` obfuscator attributes wired before merge; no PHI/location values in WS responses, logs, or state attributes; screenshot obfuscator regression-tested. #220 (multi-user scoping): no use of private `async_user_store`; every WS read handler that returns user-scoped data must check `connection.user.is_admin` or filter to `connection.user.id`; document the threat model before code.
- **Pass 0 must include a security-drift sweep.** For the eight already-marked-closed-but-still-open security items (#115, #130, #131, #132, #133, #123, #124), grep for the cited fix in current `5.0` HEAD before reopening engineering work — re-implementing a shipped hardening pass risks weakening it.

**Questions:**
- **WQ1:** For #227/#228, will the Captain commit to opt-in-default-OFF and a Captain-owned entity allowlist, or is auto-discovery acceptable? (Affects whether Train 5 needs a config-flow gate.)
- **WQ2:** For #134 Lit 3, is a CSP `Content-Security-Policy-Report-Only` shadow-deploy acceptable during the migration beta to catch inline-script regressions, or do we rely on grep + manual review only?
- **WQ3:** For #133, if `loader-utils` cannot be removed without Lit 3, is a documented Snyk/Socket.dev exception with mitigation acceptable for 5.x, or is CVE-clean a hard release gate?
- **WQ4:** For #220, does the Captain want HA `is_admin` as the scoping primitive, or a dashboard-level role separate from HA auth? (The former is enforceable today; the latter is a 6.x design.)
- **WQ5:** For Train 2, is Worf authorized to block release if any WS write handler in the codebase lacks the full 5-control cap set, even handlers not listed in #130/#131/#132?

**Answers:**
- **Q4 (security view):** Lit 3 should ship as its own long-bake beta only if #133 cannot be closed without it. If #133 can be mitigated independently (dependency pin, transitive replacement), defer #134 to 6.x — migration risk outweighs hardening benefit when the CVE is already closed.
- **Q5 (security view):** #220 is a 5.x requirement only if any WS handler currently returns cross-user data. If audit shows all handlers are already user-scoped or admin-gated, close as already-satisfied with citation; otherwise it is release-blocking, not deferrable.
- **Q7 (security view):** For security-tagged closed-then-reopened items, prefer **close-citation unless repro proves otherwise**. Re-implementing a hardening pass without diffing against the shipped fix risks introducing a weaker control.
- **Q12 (security view):** Default posture for #227/#228 must be opt-in OFF, entity allowlist required, screenshot-obfuscator attributes mandatory, no PHI/location in logs or WS responses, and friendly-name redaction on by default for shared-display contexts.

### Wesley

- **Unscheduled IoT bucket — keep parked, with one asterisk.** mmWave + Voice + NFC are deliberately untethered creative R&D; they shouldn't ride a backlog-zero train. The asterisk: mmWave room presence is the **physical-world data source** for the 5X-F4 / [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) sparkline. If Captain wants that synergy, mmWave deserves a "demo node" entry in Train 4 — not the whole rollout. Otherwise: park, no regrets.
- **F* trains are scoped minimum-viable; creative wins are cheap if we share primitives.** Bambu wants a Langford progress gauge + AMS color chips + countdown pill (all idioms we already own). ThermoWorks probes are *literally* Langford gauges with target bands. Oura's readiness ring is the first legitimate use of the "circles allowed" Life Support direction. Life360 *is* the Tactical Crew Manifest (5X-TAC-2) — same data shape, two surfaces.
- **Innovation gap = shared primitive, not new features.** Three Epic 3/4/5 sub-tasks are blocking-or-amplifying the four F* integrations: **5X-LS-5 sparklines** (Bambu temp/Oura HRV/ThermoWorks probe trend), **5X-TAC-1 event timeline** (Bambu job log/Oura sleep events/Life360 zone transitions), **5X-TAC-2 crew manifest** (Life360 native fit). Build these *once* in Train 4, then every F* integration consumes them. Without this, each integration rolls its own.
- **Promote 3 sub-tasks into the Train 4 manifest:** 5X-LS-5, 5X-TAC-1, 5X-TAC-2. Leave 5X-LS-12/13/14 (circular gauges) and 5X-ENG-9/10 (donut/SOC ring) parked in Epic — they're polish, not prerequisites. 5X-TAC-6 (full Tactical redesign) stays parked; too big for backlog-zero, deserves its own design train post-zero.
- **One genuine new idea worth considering:** Cross-integration "Red Alert" cascade hook. Bambu print failure / Oura health anomaly / Life360 person-fell-out-of-zone all want the same broadcast bus. Already noted in 5X-3.3 future. If Train 5 closeout has slack, defining the event contract (no consumers yet) future-proofs every integration. **No code in 5.x — just spec.**

**Questions:**
- **WeQ1:** Captain — promote mmWave demo node to Train 4 to feed [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101), or keep mmWave fully parked and let [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) ship from existing motion/presence sensors only?
- **WeQ2:** Riker — can Train 4 explicitly take 5X-LS-5 / 5X-TAC-1 / 5X-TAC-2 as foundational sub-tasks, or do you want them stay in Epic to keep Train 4 scope narrow (and the F* integrations each carry their own duplicated sparkline/timeline code)?
- **WeQ3:** Captain — for Bambu/Oura/Life360, do you want me to author "creative addendum" notes onto each spec before Train 4 starts (Langford gauge usage, ring-gauge vs bar choice, redaction patterns), or stay hands-off and let Geordi+Worf drive once the panels are stubbed?
- **WeQ4:** Riker — Train 5 closeout: room for a 1-page "Red Alert event bus" *spec only* (no consumers), or strictly defer all design work until post-zero Epic reset?

**Answers:**
- **Q1:** Mostly parked — see WeQ1 for the mmWave exception.
- **Q3:** Captain should own HA-side integration setup + test data (auth, device pairing, account config); engineering owns panel/spec/redaction. Standard pattern from prior F* work.
- **Q10:** Ship [#101](https://github.com/htiel/LCARS-lovelace-dashboard/issues/101) in Train 4 — its sparkline component is a prerequisite for Bambu/Oura/ThermoWorks. Folding it post-zero loses that leverage.