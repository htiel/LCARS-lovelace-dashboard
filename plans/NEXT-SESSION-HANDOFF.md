# LCARS Dashboard — Next Session Handoff

**Author:** Copilot (REDACTED) on behalf of Captain
**Generated:** 2026-05-10 end-of-day
**Branch:** `5.0` (default + only active)
**Last shipped:** **v5.6.6** (hotfix), commit `08c847f`
**Open issues:** 57 (46 with `bug` label)

---

## Where we left off

Today shipped the entire **v5.5.8 → v5.6.6 release train (8 releases + 1 spec-only commit)** in one session, including a cumulative agent-team review (Data + Worf + Geordi) and a Captain-spotted hotfix for a UniFi-detection regression. See [plans/v5.6-train-shipped.md](plans/v5.6-train-shipped.md) for the full ledger.

Working tree is clean. Tags 5.5.8/5.6.0/5.6.1/5.6.2/5.6.3/5.6.4/5.6.5/5.6.6 are all on origin/5.0 with matching GitHub releases.

---

## Repo conventions cheat sheet (read first)

- **3-file version sync** (must always match): `custom_components/lcars_dashboard/const.py` `VERSION`, `custom_components/lcars_dashboard/manifest.json` `version`, `custom_components/lcars_dashboard/js/package.json` `version`.
- **Bundle build:** `cd custom_components/lcars_dashboard/js; npm run build` (webpack 5.106.1, ~3s, must succeed before commit).
- **Release pattern:**
  ```powershell
  git tag X.Y.Z <SHA>
  git push origin 5.0 X.Y.Z
  gh release create X.Y.Z --target 5.0 --title "vX.Y.Z — ..." --notes "..."
  gh issue close N -c "Shipped in vX.Y.Z."
  ```
- **gh issue create with body:** must use `--body-file .tmp.md` not heredoc (PowerShell limitation).
- **Address Captain as "Captain"**, William Riker as "Commander", etc.
- **HACS deploy is via GitHub releases only** — `ha.malick.us` is behind Cloudflare proxy, SSH/SCP do NOT work.
- **Pattern observed 7+ times this train:** before editing for an issue, grep the file — many "open" issues are already-fixed in tree with comments citing the issue number. Close with line citation rather than re-fixing.
- **Closed shadow root cards:** medical, network, starship — never break the `mode: 'closed'` invariant.
- **Screenshot redaction is OUT-OF-CARD ONLY:** `localinfo/screenshot-obfuscator.js` keys off `data-medical|data-network|data-starship` attributes. Cards never apply runtime CSS-class obfuscation (Captain's #219 directive). Preserve the `data-*` hooks on every PHI/identity node.
- **Audio mute event:** `lcarsAudio.mute()`/`unmute()` dispatch `lcars-audio-mute-changed` `CustomEvent` on `window`. Use this for any per-card mute-aware behavior (e.g. PHI aria-hidden gating).

---

## Captain's standing decisions (carry forward)

1. **#169** — vocalize via header mute switch only (no separate toggle). Vocalize-on-change should be a debounced single-region announcer per AUDIO-SPEC, NOT per-tile `aria-live=polite`. Per-tile MUST remain `aria-live="off"`.
2. **#180/#181** — Subspace Relay button-grid is canonical. Spec updated to match. Don't rebuild as semantic table without preserving `data-network` attribute hooks.
3. **#144** — Tactical card honors sidebar `lcars-tac-filter` events: `all|access|zones`.
4. **#145** — Red Alert is card-internal only. Frame elbows/header/footer do NOT enter red-alert state. Spec follow-up still owed.
5. **#219** — Identifier obfuscation is screenshot-time only.
6. **VESSEL-ID** — Full UUID/seed in cleartext (no fnv1a hash for the operator-visible ID).
7. **#208** — Habitat empty-pane on default load: deferred to 5.7.
8. **#134** — Lit 1.x → Lit 3 migration: deferred to 5.7.

---

## Top of next-session backlog (suggested triage order)

The 46 remaining `bug`-labeled issues cluster by surface. Highest-value clusters first:

### Tier A — Subspace Relay polish (small wins, Captain-visible)
- **#187** — Network: U7 MESH and SERVERROOM-WIFI6 disconnected tiles render inconsistently (visual)
- **#182** — Subspace Relay shows "No X detected" placeholders; spec requires omission
- **#189** — Network: connected clients show raw MACs by default (HIDE IDENTIFIERS is opt-in) — security/privacy

### Tier B — Starship Health (4 visual + 2 spec, all in `lcars-starship-card.js`)
- #191, #192, #193, #194, #195, #196 — single-file pass

### Tier C — Cetacean Ops (4 issues, single-file)
- #197 (calcium_hardness), #198 (debouncer cleanup), #199 (mute-btn drift), #200 (gauge-needle outline)

### Tier D — Medical visual polish (PHI gating already done in this train)
- #172, #173, #175, #176, #178, #179

### Tier E — Illumination (#165–#168)
Single dashboard pass; #165 cache-clear regression looks high-impact.

### Tier F — Tactical follow-ups
- #145 spec-side (decision recorded; spec text still needs update)
- #146 (full-width Tactical Summary Bar hero — spec)
- #148 (constructor setter ordering — codehealth)

### Tier G — Power/Engineering (older 4.x escapees)
- #93 (double-counted battery), #88 (grid 0W), #89 (non-storage battery cards), #109 (battery panel codehealth), #159 (DETAIL link overlap)

### Tier H — Cross-cutting
- #134 (Lit 3 — defer)
- #133 (loader-utils CVEs in webpack chain — research first)
- #131 (add_card vol.In allowlist gap — security)
- #132 (`_safe_json_loads` success-with-error-key — security)
- #130 (six WS write handlers missing 256K/depth-20 caps — security)
- #208 (Habitat empty-pane — feature, defer)

---

## Recommended next session opening move

```powershell
cd c:/Users/leithma/LocalRepos/LCARS-lovelace-dashboard
git fetch --tags
git log --oneline 5.6.6..HEAD       # should be empty
git status                          # should be clean
gh issue list --state open --label bug --limit 50
```

Then ask Captain which tier to attack. Tier A (Subspace polish) is the smallest, fastest, and most visible win after today's UniFi hotfix — recommended starting point.

---

## Memory & convention reminders

- **User memory** `/memories/data-limits-policy.md` — file size warnings at 90% of GitHub/VS Code limits.
- **User memory** `/memories/lcars-release-workflow.md` — release commands, deploy constraints, version-bump file list.
- **Repo memory** at `/memories/repo/` may contain additional facts; check before assuming.
- **Always grep before editing** — many open issues are already-fixed (pattern matched 7+ times in this train).
- **Build before commit, always.** The bundle ships in the repo (HACS).
- **Single-line comments only**, no multi-line docstrings on edits unless adding new public API. Cite issue # when fixing one.
