# LCARS Consolidated Power Panel — Technical Design Addendum

**Backlog Item**: 4X-6 · Consolidated Power Panel (Area Grouping)  
**Author**: Wesley Crusher (Creative Technology & Experimentation)  
**Reviewed by**: Geordi La Forge (UI layout), Worf (toggle rate-limiting unchanged)  
**Date**: Stardate 2026.04.14  
**Status**: **SHIPPED** — v4.16.0, hotfixes v4.16.1–v4.16.6  
**Extends**: `specs/LCARS-POWER-PANEL-SPEC.md`, `specs/LCARS-POWER-PANEL-WESLEY-ADDENDUM.md`

### Post-Ship Amendments (v4.16.1–v4.16.6)
- **v4.16.1**: Added missing `import { svg }` for arc template literals
- **v4.16.4**: Strip `subType` tagging, aggregate circuit exclusion from totals, UPS parent dedup, strip child dedup
- **v4.16.5**: Strip parent/child classification via `via_device_id` check (Kasa HS300 inherited model fix)
- **v4.16.6**: Parent-owned switch matching for child outlets (normalized name comparison), LCARS sliding track toggles replacing all pill-style toggles

---
