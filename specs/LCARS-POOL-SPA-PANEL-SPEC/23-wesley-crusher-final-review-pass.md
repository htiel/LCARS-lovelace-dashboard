## Wesley Crusher — Final Review Pass

**Author**: Wesley Crusher (Creative Technologist)  
**Date**: Stardate 2026.04.13  
**Status**: REVISED — Ready for Implementation

### Changes Made
- **§7.2 `.pool-swatch-label`**: Replaced visible 0.55rem labels with visually-hidden/sr-only pattern. Swatch identification now via color alone + `aria-label` + optional tooltip. Per Geordi's NEEDS REVISION #4 (Bracer Jack Rule 6 violation).
- **§5.2 `.pool-setpoint-label`**: Changed `font-size: 0.6rem` to `var(--lcars-font-size-data)` (0.875rem). Per Geordi's NEEDS REVISION #5 (Bracer Jack Rule 6 violation).
- **§5.5 `adjustPoolSetpoint()`**: Added `ABSOLUTE_MIN = 32` and `ABSOLUTE_MAX = 120` safety bounds for aquatic bodies. Per Worf's MUST FIX #1.
- **§7.5 `startSuperChlor()`**: Added press-and-hold requirement documentation. Per Worf's MUST FIX #2.

### Accepted Recommendations
- **Worf MUST FIX #1** (absolute aquatic bounds): Implemented. 32°F–120°F range prevents freeze and scald scenarios.
- **Worf MUST FIX #2** (super chlor confirmation): Documented as press-and-hold requirement. LCARS doesn't do modal dialogs — press-and-hold is the appropriate interaction pattern.
- **Worf SHOULD FIX #3** (rate-limit setpoints): Accepted. 300ms debounce during implementation.
- **Worf SHOULD FIX #4** (config_entry not in DOM): Accepted. UUID used only in service call payloads.
- **Worf SHOULD FIX #5** (pump safety interlock): Accepted — excellent idea. Will show inline warning if pump stop attempted while heater `hvac_action === 'heating'`.
- **Geordi NEEDS REVISION #4** (swatch labels): Implemented. Swatches are now color-only with sr-only text.
- **Geordi NEEDS REVISION #5** (setpoint label font): Implemented. Changed to `--lcars-font-size-data`.
- **Geordi NOTE #8** (circuit toggle height bump): Accepted. Will increase to 2.25rem during implementation if layout permits.
- **Data P1** (populate configEntryId): Accepted — critical. Will discover via entity registry entry's `config_entry_id`.
- **Data P1** (share adjustSetpoint): Accepted. Will extract shared `adjustSetpoint()` parameterized by step, min, max.
- **Data P2** (generic thresholdColor): Accepted. Will replace 4 chemistry functions with `thresholdColor(value, optimalRange, acceptableRange)`.
- **Data P2** (strengthen pool/spa entity identification): Accepted. Will add `preset_modes` check as disambiguation.
- **Data P3** (MAX_POOL_PANELS guard): Noted. Will add console warning if >1 instance detected.

### Deferred Items
- **Worf Advisory #6** (chemistry alert automation): Documentation note — not a panel feature. Will add a note in the spec about recommended HA automation triggers.
- **Data P3** (swatch font size): Resolved by removing visible labels entirely — moot point.

### Disagreements
- None. Both Geordi's font-size findings and Worf's safety concerns are valid and addressed.

---
