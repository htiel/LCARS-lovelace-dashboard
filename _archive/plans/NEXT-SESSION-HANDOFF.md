# LCARS Dashboard — Next Session Handoff (autonomous run 2026-05-10+)

**Author:** Copilot (REDACTED) on behalf of Captain (autonomous run)
**Branch:** `5.0`
**Last shipped:** **v5.10.0-beta.5** (commit `b075690`, tag pushed, GitHub release published)
**Open issues:** **10** (was 17 at session start → 7 closed this session)

> Prior handoff archived at `plans/NEXT-SESSION-HANDOFF.v5.6.md`.

---

## Closed this session

| # | Title | Resolution |
|---|---|---|
| #208 | Habitat audit — area headers | Shipped in v5.10.0-beta.4 (`96815c9`) — home overview + floor headers + dispatcher |
| #221 | Habitat audit — area not selecting | Shipped in v5.10.0-beta.4 — `_selectArea()` requestUpdate fix |
| #222 | Habitat audit — Unifi unadopted devices | Shipped in v5.10.0-beta.4 — `_isUnadoptedDevice()` filter |
| #132 | `_safe_json_loads` send_error consistency | Already-fixed-in-tree — `__init__.py:101-135` already calls `connection.send_error` on every failure branch |
| #133 | loader-utils CVE chain | Already-fixed-in-tree — package.json bumps + `npm audit` = 0 vulns |
| #134 | Lit migration off EOL `lit-element@2.x` / `lit-html@1.x` | Shipped in v5.10.0-beta.5 — migrated to `lit@^2.8.0` family (transitively `lit-element@3.3.3` + `lit-html@2.8.0`, still pinned as direct deps). API-compatible, 0 source changes, bundle −5.5 KB |
| #86 | npm dep audit | Closed by #134 — `npm audit` 0 vulns; lit-html 1.x constraint cited in AC is also removed |

---

## Remaining 10 — Captain triage required

Per `memories/repo/lcars-lovelace-dashboard.md` policy and `lcars-train-lessons.md` ("Captain triage decisions can collapse a release"), the agent stopped the autonomous run after these grep-before-edit findings:

### Already-mooted-by-redesign (recommend close)

| # | Title | Finding |
|---|---|---|
| #123 | Subspace reveal toggle UX polish | The reveal toggle was **removed by #219** (cleartext-by-default policy; redaction moved to screenshot obfuscator only). `lcars-network-card.js:281` comment confirms: `// #219 — was: hash device name when reveal toggle off. Now: render real name.` No `_revealTimer` / setTimeout / countdown remains in `lcars-network-layout.js`. Only stale header comment + tooltip text reference an obsolete behavior. **Recommend: close #123 as obsolete-by-#219**, OR scope down to the `top_cpu_proc` allowlist sub-item (no allowlist found in tree — that part is real TODO) |

### Genuine TODOs needing design input

| # | Title | Scope |
|---|---|---|
| #87 | Cross-dashboard deep links (5X-B25) | Dep #83 (5X-B16) is closed, so unblocked. LOW pri / M size. Needs deep-link URL format design + nav-shell integration. **Defer to next train.** |
| #101 | Life Support: 24h occupancy sparkline | P2 / S size but requires HA recorder history API integration (new pattern). Wesley A1 design needed. **Defer or queue with Wesley input.** |
| #120 | Starship tactical-tab side-profile | "SCAN MODE PENDING — v5.4.2" placeholder still in `lcars-starship-card.js:432`. Needs Wesley silhouette + tactical anchor map design. **Defer to next train.** |
| #121 | Starship engineering-tile sparklines | `spark: true` flags set in `STARSHIP_KINDS` but no recorder pull wired. Needs Data review of debounce/cache pattern. **Defer to next train.** |
| #122 | Per-vessel `starship_thresholds.yaml` loader | `STARSHIP_THRESHOLDS` still `Object.freeze({…})` in `lcars-starship-utils.js:137`. Issue cites "parallel to medical_thresholds.yaml Phase 2 pattern" but **`lcars-medical-utils.js:91` confirms the medical loader is also still TODO** (comment: "user override planned via medical_thresholds.yaml (Phase 2 loader)"). Pattern needs to be designed from scratch; #122 effectively blocks on doing the medical loader first. **Defer to a dedicated YAML-config train.** |

### Train 4 — new integration features (blocked on Captain entity confirmation)

| # | Title | Blocker |
|---|---|---|
| #225 | Bambu Lab H2C — Fabrication panel | Wesley creative addendum + Captain entity-confirmation gate per Train 4 plan |
| #226 | ThermoWorks Cloud — Galley probes | Same |
| #227 | Oura Ring — Medical Bay elevation | Same |
| #228 | Life360 — Habitat presence aggregation | Same |

---

## Recommended next moves (Captain)

1. **Quick close** #123 as obsolete-by-#219 (or comment with allowlist-only sub-scope retained).
2. **Triage decision** on #87/#101/#120/#121/#122 — are these still wanted in 5.x, or should they be deferred to 6.x? `lcars-train-lessons.md` warns against sunk-cost on planned releases.
3. **Train 4 kickoff** (#225-#228) needs your entity-confirmation pass before any code is written. Could be batched into a single review session.
4. **Dependabot drift**: GitHub web UI still shows 10 stale alerts (fast-uri@3.1.2, postcss@8.5.14, hono in `mcp/`). All installed versions already patched. Safe to dismiss-as-fixed if alerts don't refresh after this push.

---

## Build / verification state

- `npm run build` green (webpack 5.106.1, 2.8s, 0 errors)
- `npm audit` 0 vulnerabilities
- Bundle: **1,173,053 bytes** (−5.5 KB vs beta.4)
- Three-file version sync verified: `const.py` / `manifest.json` / `js/package.json` all on `5.10.0-beta.5`
- HACS deploy: pre-release published; ha.mariner.example update via HACS UI (Cloudflare-proxied, no SSH)
