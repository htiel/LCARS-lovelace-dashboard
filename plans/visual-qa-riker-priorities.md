# LCARS Visual QA - Riker Priority Matrix

## SECTION 1: Executive Summary

The four QA reports do not describe four separate problem sets. They collapse into six root fix chains: entity-category policy, illumination switch routing, hazard false positives, area-level climate capture, environment fan overmatching, and missing shared formatting/filtering utilities. Most of the high-visibility breakage Geordi and Wesley call out is downstream fallout from Data's classifier and formatting defects, so the right move for v4.22.0 is root-cause repair, not panel-by-panel cosmetics. One report-level inconsistency needs to be called out plainly: Geordi's file claims 22 active bugs, but the current document actually contains 29 numbered active entries after the three removals; I used the actual numbered entries, not the stale count. Worf's findings are real but mostly defense-in-depth hardening, not blockers for the visual QA release, so they board behind the user-facing 4.x defect chain unless they are near-zero-cost.

## SECTION 2: Unified Bug Matrix

Note: Priority is implementation order, not original report order. I used the actual live report contents, which yields 88 actionable or triaged items.

| Priority | Bug ID | Owner | Severity | Category | Summary | Dependencies | Release Target |
|---|---|---|---|---|---|---|---|
| P01 | DATA-011 | Data | HIGH | Architecture | Set one entity_category policy for classify vs render layers | None | v4.22.0 |
| P02 | DATA-001 | Data | CRITICAL | Classification | Remove illumination catch-all switch absorption | DATA-011 | v4.22.0 |
| P03 | DATA-002 | Data | CRITICAL | Classification | Exclude diagnostic CO false positives from hazard detector | DATA-011 | v4.22.0 |
| P04 | DATA-021 | Data | MEDIUM | Classification | Restrict environment fan matching to AQ platforms | DATA-011 | v4.22.0 |
| P05 | DATA-020 | Data | MEDIUM | Classification | Map EcoFlow platform to battery/power instead of lights | DATA-011 | v4.22.0 |
| P06 | DATA-004 | Data | HIGH | Panel Assignment | Exclude appliance climate entities from area Life Support | DATA-011 | v4.22.0 |
| P07 | DATA-005 | Data | HIGH | Panel Assignment | Exclude pool/spa climate entities from area Life Support | DATA-011 | v4.22.0 |
| P08 | DATA-008 | Data | HIGH | Formatting | Add shared numeric rounding and unit-aware formatting | None | v4.22.0 |
| P09 | DATA-018 | Data | MEDIUM | Architecture | Wire shared formatter into lcars-sensor-row/base panel | DATA-008 | v4.22.0 |
| P10 | DATA-007 | Data | HIGH | Filtering | Filter camera panels to camera-relevant sensors only | DATA-011 | v4.22.0 |
| P11 | DATA-006 | Data | HIGH | Render Path | Stop hazard devices from inheriting empty atmoscrubber render | DATA-002, DATA-011 | v4.22.0 |
| P12 | DATA-012 | Data | LOW | Formatting | Normalize button unknown state to READY/STANDBY | DATA-008 | v4.22.0 |
| P13 | DATA-019 | Data | MEDIUM | Architecture | Make classifyDevice augmentation consistent across orchestrator/panels | DATA-011 | v4.22.0 |
| P14 | GEORDI-001 | Geordi | CRITICAL | Rendering | Raw decimals break typography and overflow layouts | DATA-008, DATA-018 | v4.22.0 |
| P15 | GEORDI-002 | Geordi | CRITICAL | Rendering | Hide empty atmoscrubber on non-AQ devices | DATA-002, DATA-006 | v4.22.0 |
| P16 | GEORDI-004 | Geordi | HIGH | Visual Symptom | Irrigation zones leak into illumination circuits | DATA-001 | v4.22.0 |
| P17 | GEORDI-005 | Geordi | HIGH | Visual Symptom | Battery/config switches leak into illumination circuits | DATA-001, DATA-020 | v4.22.0 |
| P18 | GEORDI-013 | Geordi | HIGH | Visual Symptom | Camera diagnostics dump overwhelms panel layout | DATA-007 | v4.22.0 |
| P19 | GEORDI-006 | Geordi | HIGH | Rendering | Offline atmoscrubber styling uses ambiguous orange outline | DATA-006 | v4.22.0 |
| P20 | GEORDI-012 | Geordi | HIGH | Duplicate Symptom | Smart outlet in Life Support is same hazard false-positive chain | DATA-002, GEORDI-002 | v4.22.0 |
| P21 | WESLEY-UX-003 | Wesley | HIGH | UX | Unknown should read READY/NO DATA, not red failure | DATA-012, DATA-008 | v4.22.0 |
| P22 | WESLEY-UX-001 | Wesley | HIGH | UX | Replace ambiguous Adopt Device with actionable setup guidance | DATA-014 optional | v4.23.0 |
| P23 | WESLEY-UX-002 | Wesley | HIGH | UX | Collapse unavailable media players instead of full dead panels | GEORDI-017, WESLEY-IDEA-003 | v5.x |
| P24 | GEORDI-003 | Geordi | HIGH | A11y | WaterGuru labels truncate away meaning | GEORDI-032 | v4.23.0 |
| P25 | GEORDI-032 | Geordi | MEDIUM | Labeling | Canonical short-form labels needed across sensor panels | DATA-008 | v4.23.0 |
| P26 | WESLEY-UX-010 | Wesley | MEDIUM | UX | Sparkline labels need canonical abbreviations and clearer differentiation | GEORDI-032 | v4.23.0 |
| P27 | GEORDI-010 | Geordi | MEDIUM | Visual Symptom | Fridge climate arc is wrong panel semantics | DATA-004 | v4.22.0 |
| P28 | DATA-017 | Data | MEDIUM | Classification | Ceiling fan rooms trigger Life Support via environment match | DATA-021 | v4.22.0 |
| P29 | DATA-009 | Data | MEDIUM | Formatting | Humanize Emporia/pool circuit names | None | v4.23.0 |
| P30 | DATA-010 | Data | MEDIUM | Formatting | Trim duplicate dryer pair artifacts and leading dashes | DATA-009 optional | v4.23.0 |
| P31 | GEORDI-007 | Geordi | HIGH | A11y | Duplicate POOL EQUIPMENT labels hide circuit identity | DATA-009 | v4.23.0 |
| P32 | GEORDI-008 | Geordi | MEDIUM | Rendering | Duplicate laundry circuit rows waste space | DATA-010 | v4.23.0 |
| P33 | GEORDI-009 | Geordi | MEDIUM | Labeling | Raw internal power IDs shown to users | DATA-009 | v4.23.0 |
| P34 | GEORDI-014 | Geordi | MEDIUM | Color Semantics | Non-alert unavailable/unknown states should not be red | DATA-012, DATA-008 | v4.23.0 |
| P35 | GEORDI-018 | Geordi | MEDIUM | Color Semantics | DISARMED alarm should be ice, not tomato | None | v4.23.0 |
| P36 | GEORDI-021 | Geordi | MEDIUM | Graceful Degradation | Weather offline state lacks gray disabled skeleton | None | v4.23.0 |
| P37 | GEORDI-022 | Geordi | MEDIUM | Graceful Degradation | Irrigation offline controller needs disabled visual treatment | None | v4.23.0 |
| P38 | WESLEY-UX-005 | Wesley | MEDIUM | UX | Offline camera needs recovery path and last signal context | GEORDI-015 | v4.23.0 |
| P39 | WESLEY-UX-012 | Wesley | MEDIUM | UX | Weather offline needs last-known data and calm messaging | GEORDI-021 | v4.23.0 |
| P40 | WESLEY-UX-007 | Wesley | MEDIUM | UX | Irrigation offline/idle wording is contradictory | GEORDI-022 | v4.23.0 |
| P41 | WESLEY-UX-006 | Wesley | MEDIUM | UX | Show hidden circuit count and wattage before expand | DATA-009 | v4.23.0 |
| P42 | WESLEY-UX-008 | Wesley | MEDIUM | UX | Collapse 0W power panels to standby summary | None | v4.23.0 |
| P43 | GEORDI-024 | Geordi | MEDIUM | Information Density | Diagnostic rows need collapse/limit behavior | DATA-011 | v4.23.0 |
| P44 | WESLEY-IDEA-011 | Wesley | MUST | Creative Idea | Tier sensor data into hero/operational/diagnostic disclosure | DATA-011, DATA-007 | v5.x |
| P45 | WESLEY-IDEA-017 | Wesley | SHOULD | Creative Idea | Universal panel-level LAST ACTIVE offline timestamp | None | v5.x |
| P46 | GEORDI-015 | Geordi | MEDIUM | Rendering | Offline viewscreen needs distinct visual state | None | v4.23.0 |
| P47 | WESLEY-IDEA-002 | Wesley | SHOULD | Creative Idea | Add controlled CRT static effect for offline cameras | GEORDI-015 | v5.x |
| P48 | WESLEY-UX-004 | Wesley | MEDIUM | UX | Standby media panels should not repeat full-size cards | GEORDI-017, WESLEY-IDEA-003 | v5.x |
| P49 | GEORDI-017 | Geordi | LOW | Visual Redundancy | Three identical standby media panels waste space | WESLEY-IDEA-003 | v5.x |
| P50 | WESLEY-IDEA-003 | Wesley | MUST | Creative Idea | Consolidated media hub for multi-speaker rooms | None | v5.x |
| P51 | WESLEY-UX-011 | Wesley | MEDIUM | UX | Tactical panel duplicated across rooms | WESLEY-IDEA-010, Worf ruling | v5.x |
| P52 | WESLEY-IDEA-010 | Wesley | SHOULD | Creative Idea | Replace duplicate alarm panels with room-header badge | Worf security constraints | v5.x |
| P53 | WESLEY-UX-009 | Wesley | MEDIUM | UX | Garage doors need clear state and action labeling | None | v4.23.0 |
| P54 | WESLEY-IDEA-006 | Wesley | COULD | Creative Idea | Add garage door visual position indicator | WESLEY-UX-009 | v5.x |
| P55 | GEORDI-019 | Geordi | MEDIUM | A11y | Alarm keypad spacing is too tight for security input | None | v4.23.0 |
| P56 | GEORDI-029 | Geordi | MEDIUM | A11y Audit | Focus visibility needs verification across dynamic content | None | v4.23.0 |
| P57 | GEORDI-030 | Geordi | MEDIUM | A11y | Sensor indicator dots may be too low-contrast | None | v4.23.0 |
| P58 | GEORDI-031 | Geordi | LOW | A11y Audit | Verify reduced-motion coverage in component-level animations | None | v4.23.0 |
| P59 | GEORDI-016 | Geordi | LOW | Layout | Sparse rooms feel abandoned | WESLEY-IDEA-001 optional | v4.23.0 |
| P60 | WESLEY-IDEA-001 | Wesley | SHOULD | Creative Idea | Add room vitals strip for sparse rooms; reject decorative-only options in 4.x | None | v5.x |
| P61 | WESLEY-IDEA-004 | Wesley | SHOULD | Creative Idea | Add contextual empty-state copy across panel types | Per-panel offline fixes | v5.x |
| P62 | WESLEY-UX-013 | Wesley | MEDIUM | Interaction | Add undo/confirm pattern for risky actions | Worf security constraints | v5.x |
| P63 | WESLEY-IDEA-005 | Wesley | SHOULD | Creative Idea | Progressive power panel modes by load threshold | WESLEY-UX-006, WESLEY-UX-008 | v5.x |
| P64 | WESLEY-IDEA-012 | Wesley | SHOULD | Creative Idea | Pool circuit disambiguation plus wattage-tier color coding | DATA-009 | v5.x |
| P65 | GEORDI-027 | Geordi | LOW | Visual Cue | 100% media volume needs warning color | None | v4.23.0 |
| P66 | GEORDI-028 | Geordi | LOW | Labeling | Pentair hex/model naming needs humanization | DATA-009 optional | v4.23.0 |
| P67 | DATA-003 | Data | MEDIUM | Architecture | Detector weighting is theoretical; monitor after root fixes | DATA-002, DATA-011 | Monitor |
| P68 | DATA-016 | Data | MEDIUM | Defense in Depth | Add negative lighting keywords only after catch-all removal | DATA-001 | Monitor |
| P69 | WORF-SEC-007 | Worf | MEDIUM | Security | Add schema and size validation to blueprint installs | None | v4.23.0 |
| P70 | WORF-SEC-002 | Worf | MEDIUM | Security | Audit and selectively update vulnerable npm tooling | lit-html compatibility constraints | v4.23.0 |
| P71 | WORF-SEC-006 | Worf | LOW | Security | Validate more_pages subdirectory names before path join | None | v4.23.0 |
| P72 | WORF-SEC-008 | Worf | MEDIUM | Security | Validate template filenames before Jinja load | None | v4.23.0 |
| P73 | WORF-SEC-001 | Worf | LOW | Security | Replace innerHTML with textContent in vendor editor | None | v4.23.0 |
| P74 | WORF-SEC-003 | Worf | LOW | Security | Document server-side alarm auth; improve rate-limit feedback only | None | v4.23.0 |
| P75 | WORF-SEC-004 | Worf | LOW | Security | Add sanitizeColor only if color inputs ever broaden beyond fixed palette | None | Monitor |
| P76 | WORF-SEC-005 | Worf | LOW | Security | Lit auto-escaping already makes this a non-issue | None | No change |
| P77 | DATA-013 | Data | MEDIUM | External Config | Cross-room leaks are HA area/entity assignment issues | None | HA config |
| P78 | DATA-014 | Data | LOW | External Config | Unadopted IPC camera should likely collapse to offline bucket | None | v4.23.0 |
| P79 | DATA-015 | Data | LOW | External Config | Renamed area stale friendly_names are HA maintenance, not code | None | HA config |
| P80 | GEORDI-025 | Geordi | LOW | External Config | Link Color label is an HA naming problem | None | HA config |
| P81 | GEORDI-026 | Geordi | LOW | External Config | Ephraim/Elysia mismatch is stale HA entity naming | DATA-015 | HA config |
| P82 | WESLEY-IDEA-008 | Wesley | COULD | Creative Idea | Room last-activity header indicator for sparse spaces | None | v5.x |
| P83 | WESLEY-IDEA-014 | Wesley | COULD | Creative Idea | Adaptive climate arc for legitimate non-standard HVAC ranges | DATA-004, DATA-005 fixed first | v5.x |
| P84 | WESLEY-IDEA-016 | Wesley | COULD | Creative Idea | Trend arrows from sparkline history | Sparkline data scope limits | v5.x |
| P85 | WESLEY-IDEA-009 | Wesley | WISH | Creative Idea | View Transitions room navigation prototype | Shadow DOM validation | v5.x |
| P86 | WESLEY-IDEA-013 | Wesley | WISH | Creative Idea | Dashboard boot sequence animation | Motion/accessibility review | v5.x |
| P87 | WESLEY-IDEA-015 | Wesley | COULD | Creative Idea | Mobile haptics for toggle actions | Companion app behavior review | v5.x |
| P88 | WESLEY-IDEA-007 | Wesley | WISH | Creative Idea | Source-aware media waveform behavior | media_content_type reliability | v5.x |

## SECTION 3: Critical Path

1. DATA-011 -> DATA-001 -> GEORDI-004/005.
   This is the illumination contamination chain. Until the entity_category policy and catch-all removal land, every lighting room audit stays noisy.

2. DATA-011 -> DATA-002 -> DATA-006 -> GEORDI-002/006/012.
   This is the false hazard / empty atmoscrubber chain. Fix routing first, then clean the residual offline scrubber styling.

3. DATA-011 -> DATA-021 -> DATA-017.
   This is the ceiling-fan-overmatches-environment chain. Same file, same decision, one patch.

4. DATA-011 -> DATA-004 + DATA-005 -> GEORDI-010.
   Area-level climate capture is the root. Do not spend time on fridge/pool visual workarounds until climate ownership is corrected.

5. DATA-008 -> DATA-018 -> GEORDI-001 -> DATA-012 -> GEORDI-014 -> WESLEY-UX-003.
   Shared formatting and state normalization is the highest ROI polish chain in the entire set.

6. DATA-011 -> DATA-007 -> GEORDI-013 -> GEORDI-024 -> WESLEY-IDEA-011.
   First suppress irrelevant camera/device telemetry, then decide how much structured disclosure to add later.

7. DATA-009 + DATA-010 -> GEORDI-007/008/009 -> WESLEY-UX-006/008 -> WESLEY-IDEA-012/005.
   Fix naming correctness before adding progressive disclosure or color-tier enhancements.

8. GEORDI-021/022/015 -> WESLEY-UX-012/007/005.
   Visual state clarity comes before explanatory copy or last-active messaging.

9. GEORDI-017 + WESLEY-UX-002/004 -> WESLEY-IDEA-003.
   Media duplication is one product decision, not three isolated bugs.

10. WESLEY-UX-011 -> WESLEY-IDEA-010 with Worf's read-only/privacy constraints.
    Alarm deduplication is viable only if the badge remains informational and PIN-gated actions stay in Tactical.

## SECTION 4: Cross-Team Conflicts

1. Data vs Wesley on climate arc workaround.
   Ruling: Data is right. DATA-004 and DATA-005 are routing defects. WESLEY-IDEA-014 is a future enhancement for legitimate HVAC edge cases only, not a workaround for fridges or pools rendering in Life Support.

2. Wesley vs Worf on alarm header badge.
   Ruling: Both are partially right, but Worf gets the binding constraint. The badge may ship only as read-only status plus navigation. No direct arm/disarm from a room header, and add a privacy toggle if this ever becomes ubiquitous.

3. Geordi vs Wesley on sparse-room treatment.
   Ruling: Geordi is right to reject decorative filler in 4.x. Wesley's functional room-vitals strip is the only acceptable version; starfield and decorative border-scan stay out of 4.x and remain optional 5.x experiments.

4. Geordi vs Data on atmoscrubber ownership.
   Ruling: Data owns the root cause, Geordi owns the residual styling. We do not burn sprint time on cylinder cosmetics before DATA-002 and DATA-006 stop non-AQ devices from hitting that path.

5. Wesley's media/alarm UX bugs vs 4.x release discipline.
   Ruling: Wesley is correct about the user pain, but the correct fixes are cross-panel consolidation features. Those are v5.x work, not v4.22.0 bugfix material.

6. Worf's security findings vs current visual release.
   Ruling: Worf is correct on hardening, but his own report classifies the set as defense-in-depth with no active exploitable blocker. They belong in v4.23.0 hardening, not ahead of the visual routing regressions.

7. Source-document disagreement on count.
   Ruling: Geordi's report metadata is stale. The Captain asked for all items, so I used the actual numbered entries in the file rather than the stated 22-active summary.

## SECTION 5: Release Plan

### v4.22.0 Scope

Mission: root-cause visual stabilization in one 2-week sprint. No feature experiments.

- DATA-011, DATA-001, DATA-002, DATA-021, DATA-020, DATA-004, DATA-005, DATA-008, DATA-018, DATA-007, DATA-006, DATA-012, DATA-019.
- Downstream fixes expected to close automatically: GEORDI-001, GEORDI-002, GEORDI-004, GEORDI-005, GEORDI-006, GEORDI-010, GEORDI-012, GEORDI-013, WESLEY-UX-003.
- Stretch only if capacity remains: GEORDI-014.
- Explicitly cut from v4.22.0 despite severity: WESLEY-UX-001 and WESLEY-UX-002. They are real, but they are narrower and less leverage than the classifier/formatter chain.

### v4.23.0 Scope

Mission: medium bugs, degraded-state polish, a11y cleanup, and security hardening.

- Label and naming pass: GEORDI-003, GEORDI-032, WESLEY-UX-010, DATA-009, DATA-010, GEORDI-007, GEORDI-008, GEORDI-009, GEORDI-028.
- Offline/degraded-state pass: GEORDI-021, GEORDI-022, GEORDI-015, WESLEY-UX-005, WESLEY-UX-007, WESLEY-UX-012, DATA-014.
- Power/alarm/garage polish: WESLEY-UX-006, WESLEY-UX-008, WESLEY-UX-009, GEORDI-018, GEORDI-019, GEORDI-027.
- A11y verification and safe cleanup: GEORDI-029, GEORDI-030, GEORDI-031.
- Security hardening: WORF-SEC-007, WORF-SEC-002, WORF-SEC-006, WORF-SEC-008, WORF-SEC-001, WORF-SEC-003.
- External/admin cleanup tracked but not shipped as code: DATA-013, DATA-015, GEORDI-025, GEORDI-026.

### v5.x Scope

Mission: architectural changes, consolidation patterns, and creative experience work.

- Media and alarm consolidation: WESLEY-IDEA-003, WESLEY-UX-002, WESLEY-UX-004, GEORDI-017, WESLEY-IDEA-010, WESLEY-UX-011.
- Interaction model upgrades: WESLEY-UX-013, WESLEY-IDEA-005, WESLEY-IDEA-006, WESLEY-IDEA-011, WESLEY-IDEA-017.
- Creative/system polish: WESLEY-IDEA-001, 002, 004, 008, 009, 013, 014, 015, 016, 007.
- 5.x backlog alignment: this is where multi-dashboard architecture belongs, not mixed into 4.x QA cleanup.

## SECTION 6: Top 5 Quick Wins

1. WORF-SEC-001 - Change innerHTML to textContent in vendor editor. One-line defense-in-depth fix, zero product risk.
2. DATA-012 / WESLEY-UX-003 - Convert button UNKNOWN to READY. Small code touch, removes a lot of false alarm noise across both homes.
3. GEORDI-018 - Correct DISARMED alarm color to ice blue. High visibility, tiny change, restores semantic trust immediately.
4. GEORDI-027 - Add warning color tiers to media volume above 90%. Small visual patch, strong user-safety payoff.
5. GEORDI-021 - Add gray offline weather skeleton and STATION OFFLINE copy. Highly visible quality win without classifier risk.

Make it so.