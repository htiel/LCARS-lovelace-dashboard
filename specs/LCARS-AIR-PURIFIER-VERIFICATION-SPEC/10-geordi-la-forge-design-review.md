## Geordi La Forge — Design Review

**Reviewer**: Geordi La Forge (LCARS UI Design Authority)  
**Date**: Stardate 2026.04.13  
**Status**: APPROVED

### LCARS Compliance
- This document is an **engineering compatibility report**, not a visual design spec. There are no new visual elements, layouts, or colors to review. The existing atmoscrubber panel design (reviewed in LCARS-ATMOSCRUBBER-SPEC.md) applies unchanged.
- The expected BlueAir rendering (§6) shows the same 3-column layout, cylinder visualization, and sensor column as VeSync — the panel is integration-agnostic by design. Confirmed visually consistent.

### Color & Typography
- No new colors or typography patterns introduced. All BlueAir data renders through existing LCARS theme variables and the atmoscrubber's established color mapping.
- The BlueAir panel will have a **richer sensor column** (PM1, PM10, CO₂, VOC, temperature, humidity vs VeSync's PM2.5-only). This is a positive — more data in the same layout framework. No overcrowding concern since the sensor column is vertically scrollable.

### Layout & Visual Balance
- The visual comparison (§6) confirms the BlueAir panel looks balanced. The additional sensor rows are offset by the simpler preset mode strip (2 buttons vs 4). Net visual weight is similar.
- The sensor column being fuller for BlueAir is actually better — VeSync's was notably sparse. This fills out the "science station" sidebar more naturally.

### Accessibility
- §3.3 flags the `light` domain routing gap for BlueAir's LED entity. The suggested fix (adding `light` to the controls domain list) is the right approach. I confirm this won't create false positives for other device types — environment panels filter by the fan + AQ sensor heuristic first, so only devices that already qualify as environment panels would be affected.
- All existing accessibility features (ARIA labels, keyboard nav, screen reader announcements) carry through unchanged since no new components are introduced.

### Recommendations
1. **APPROVED**: BlueAir compatibility confirmed — no visual design changes needed.
2. **APPROVED** (§4.2): Implement the CO₂ threshold coloring enhancement. This was specced in the original atmoscrubber doc and benefits all integrations with CO₂ sensors. 7 lines of code, low risk, high value.
3. **APPROVED** (§3.3): Add `light` to the environment controls routing. 1 line, enables BlueAir LED control.
4. **DEFER** (§4.1): The EPA-accurate PM2.5→AQI conversion. The current `*4` approximation is close enough for color bucket selection at typical indoor levels. Implement only if users report alarmist coloring at high PM2.5.
5. **NOTE**: Wesley's attribution of that closing quote to me is appreciated — and the engineering principle is sound. The entity-driven architecture is exactly the kind of design that survives hardware changes. Good work, Ensign.

---
