## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- No spec content changes needed — all three reviewers broadly approved. This is a verification document, not a new panel spec.

### Accepted Recommendations
- **Geordi APPROVED #2** (CO₂ threshold coloring): Accepted — 7 lines, high value, benefits all CO₂-capable devices.
- **Geordi APPROVED #3** (add `light` to environment controls): Accepted — 1-line routing change.
- **Geordi DEFER #4** (EPA-accurate PM2.5→AQI): Deferred — `*4` approximation is sufficient at typical indoor levels (<50 µg/m³).
- **Data P1** (CO₂ threshold coloring): Same as Geordi's — implement during atmoscrubber panel work.
- **Data P2** (add `light` to controls routing): Same as Geordi's — validate no false positives.
- **Data P3** (defer EPA AQI): Agreed. Implement only if users report misleading color buckets.
- **Data SKIP** (filter expired binary sensor): Agreed — filter % at 0 is sufficient.
- **Worf Advisory #1** (HACS supply chain): Noted. Will document `ha_blueair` as a HACS dependency in project security posture. Lit auto-escaping provides defense-in-depth.

### Deferred Items
- **EPA-accurate PM2.5→AQI conversion**: Deferred unless user feedback indicates the linear approximation causes misleading colors at high concentrations.
- **Filter expired binary sensor alert**: Deferred — filter % already covers the use case.

### Disagreements
- None. This was the cleanest review across all 8 specs — three green/approved verdicts.

---
