## 15. Release Strategy

v4.17.0 will be published as a **pre-release tag** to prevent auto-update for stable HACS users.

- **Tag**: `gh release create 4.17.0 --target 4.0 --prerelease --title "v4.17.0 — Panel Extraction Architecture" --notes "..."`
- **Version bump files** (all 3 must match before tagging):
  - `custom_components/lcars_dashboard/const.py` → `VERSION`
  - `custom_components/lcars_dashboard/manifest.json` → `version`
  - `custom_components/lcars_dashboard/js/package.json` → `version`
- **Beta testing**: HACS → find LCARS Dashboard → ⋮ menu → Redownload → toggle "Show beta versions"
- **Promotion to stable**: After Admiral + beta user validation, re-tag as full release (remove `--prerelease`)
- **Scope boundary** (N10): This refactor extracts panels. No new features, no new entities, no API changes.

---

*"I have completed my analysis, Admiral. The data is unambiguous. Ten panels, five shared components, one base class, zero ambiguity. The simplest solution that meets requirements is, as always, the optimal solution."*
