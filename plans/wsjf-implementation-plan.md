# WSJF Implementation Plan

Date: 2026-04-19
Owner: Riker

This plan scores every unique work item from the four QA reports plus Worf's security findings, then groups them into the minimum practical number of implementation passes based on file affinity.

Assumptions:
- Removed Geordi items GEORDI-011, GEORDI-020, and GEORDI-023 are excluded because the report itself closes them.
- Worf's commentary on WESLEY-IDEA-009, WESLEY-IDEA-010, and WESLEY-IDEA-015 is treated as implementation constraint input, not separate backlog items.
- External Home Assistant configuration issues still receive a pass assignment so they have an explicit disposition.
- Eric's post-P2 visual QA findings are assigned only to P3-P9 because P1 and P2 already shipped; those passes are updated for status only, not rescoping.
- Aggregate pass WSJF is computed as `sum(BV + TC + RR) / sum(JS)` across the items assigned to that pass.

## SECTION 1: WSJF Scoring Table

| ID | Source | Type | Summary | Primary files / functions | BV | TC | RR | JS | WSJF | Pass |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| DATA-001 | Data | Bug | Remove illumination switch catch-all | `lcars-illumination-panel.js::_partitionLightingEntities`, `lcars-entity-utils.js::isLightingEntity` | 13 | 13 | 13 | 3 | 13.00 | P1 |
| DATA-002 | Data | Bug | Filter diagnostic CO false positives from hazard classification | `lcars-entity-utils.js::DETECTORS[hazard]` | 13 | 13 | 13 | 3 | 13.00 | P1 |
| DATA-003 | Data | Enabler | Add detector weighting guardrails after root fixes | `lcars-entity-utils.js::classifyDevice` | 5 | 3 | 8 | 8 | 2.00 | P1 |
| DATA-004 | Data | Bug | Keep GE fridge climate entities out of Life Support | `lcars-entity-utils.js::isClimateEntity`, `classifyArea` | 8 | 8 | 8 | 3 | 8.00 | P1 |
| DATA-005 | Data | Bug | Keep pool/spa climate entities out of Life Support | `lcars-entity-utils.js::isClimateEntity`, `classifyArea` | 8 | 8 | 8 | 3 | 8.00 | P1 |
| DATA-006 | Data | Bug | Stop Nest Protect from inheriting empty environment render path | `lcars-lifesupport-panel.js`, `lcars-environment-panel.js` | 8 | 8 | 8 | 3 | 8.00 | P3 |
| DATA-007 | Data | Bug | Filter camera panel to camera-relevant sensors only | `lcars-camera-panel.js::renderContent`, base partition helpers | 8 | 8 | 8 | 3 | 8.00 | P3 |
| DATA-008 | Data | Bug | Add shared numeric formatting | `lcars-base-panel.js`, shared formatter module | 13 | 8 | 8 | 3 | 9.67 | P2 |
| DATA-009 | Data | Bug | Humanize Emporia and duplicate circuit names | `lcars-power-panel.js`, `lcars-base-panel.js` | 8 | 5 | 5 | 3 | 6.00 | P4 |
| DATA-010 | Data | Bug | Remove `-- Dryer` duplicate artifacts | `lcars-power-panel.js::_detect240VPairs`, name cleanup | 5 | 5 | 5 | 2 | 7.50 | P4 |
| DATA-011 | Data | Enabler | Establish one entity-category policy for classification vs rendering | `lcars-entity-utils.js`, `lcars-illumination-panel.js`, area orchestration | 13 | 13 | 13 | 5 | 7.80 | P1 |
| DATA-012 | Data | Bug | Normalize button unknown to READY/STANDBY | `lcars-base-panel.js`, `lcars-color-utils.js` | 8 | 8 | 8 | 2 | 12.00 | P2 |
| DATA-013 | Data | Ops | Cross-room leakage is HA area assignment drift | HA config, optional UI hint | 3 | 2 | 3 | 1 | 8.00 | P9 |
| DATA-014 | Data | Bug | Improve handling for Adopt Device unavailable camera | `lcars-camera-panel.js`, device empty-state helpers | 5 | 5 | 3 | 2 | 6.50 | P3 |
| DATA-015 | Data | Ops | Room rename drift in friendly names | HA config, optional alias handling | 2 | 1 | 2 | 1 | 5.00 | P9 |
| DATA-016 | Data | Hardening | Add negative lighting keywords after catch-all removal | `lcars-entity-utils.js::isLightingEntity` | 3 | 2 | 5 | 2 | 5.00 | P1 |
| DATA-017 | Data | Bug | Stop ceiling fans from triggering environment panels | `lcars-entity-utils.js::isEnvironmentEntity` | 8 | 8 | 8 | 2 | 12.00 | P1 |
| DATA-018 | Data | Enabler | Route all sensor rows through shared formatter | `lcars-base-panel.js`, `lcars-sensor-row` integration | 8 | 8 | 8 | 3 | 8.00 | P2 |
| DATA-019 | Data | Enabler | Make device augmentation consistent across orchestrator and illumination | `lcars-illumination-panel.js`, area orchestrator | 8 | 5 | 8 | 3 | 7.00 | P1 |
| DATA-020 | Data | Bug | Map EcoFlow to battery/power instead of lights | `lcars-entity-utils.js::PLATFORM_PANEL_MAP` | 8 | 8 | 8 | 2 | 12.00 | P1 |
| DATA-021 | Data | Bug | Restrict environment fan matching to AQ platforms | `lcars-entity-utils.js::isEnvironmentEntity` | 8 | 8 | 8 | 2 | 12.00 | P1 |
| GEORDI-001 | Geordi | Bug | Raw decimals break LCARS typography | `lcars-base-panel.js`, sensor row rendering, power panel fallbacks | 13 | 13 | 8 | 3 | 11.33 | P2 |
| GEORDI-002 | Geordi | Bug | Hide empty atmoscrubber on non-AQ devices | `lcars-environment-panel.js`, Life Support composition | 13 | 13 | 8 | 3 | 11.33 | P1 |
| GEORDI-003 | Geordi | Bug | Prevent WaterGuru label truncation | environment styles, label normalization | 8 | 5 | 3 | 3 | 5.33 | P2 |
| GEORDI-004 | Geordi | Bug | Remove irrigation from illumination circuits | `lcars-illumination-panel.js`, classifier helpers | 13 | 8 | 8 | 2 | 14.50 | P1 |
| GEORDI-005 | Geordi | Bug | Remove battery/config switches from illumination circuits | `lcars-illumination-panel.js`, `lcars-entity-utils.js` | 13 | 8 | 8 | 2 | 14.50 | P1 |
| GEORDI-006 | Geordi | Bug | Make unavailable atmoscrubber visually explicit | `lcars-environment-panel.js::_getAQColor`, render branch | 8 | 8 | 5 | 2 | 10.50 | P3 |
| GEORDI-007 | Geordi | Bug | Disambiguate identical pool circuit names | `lcars-power-panel.js`, `lcars-base-panel.js` | 8 | 8 | 5 | 3 | 7.00 | P4 |
| GEORDI-008 | Geordi | Bug | Remove duplicate laundry circuits | `lcars-power-panel.js`, pair detection | 5 | 5 | 5 | 2 | 7.50 | P4 |
| GEORDI-009 | Geordi | Bug | Replace raw power identifiers with human names | `lcars-power-panel.js`, base naming helpers | 5 | 5 | 3 | 2 | 6.50 | P4 |
| GEORDI-010 | Geordi | Bug | Stop fridge climate arc misuse | `lcars-entity-utils.js::classifyArea/isClimateEntity` | 5 | 5 | 5 | 2 | 7.50 | P1 |
| GEORDI-012 | Geordi | Bug | Remove smart outlet from Life Support rendering | `lcars-entity-utils.js`, environment/life-support routing | 8 | 8 | 5 | 2 | 10.50 | P1 |
| GEORDI-013 | Geordi | Bug | Eliminate camera diagnostics dump | `lcars-camera-panel.js::renderContent` | 8 | 8 | 5 | 2 | 10.50 | P3 |
| GEORDI-014 | Geordi | Bug | Stop using alert red for non-alert unknown/unavailable | `lcars-color-utils.js::getStateColor`, panel display helpers | 8 | 8 | 8 | 2 | 12.00 | P2 |
| GEORDI-015 | Geordi | Bug | Give offline camera viewscreen a distinct state | `lcars-camera-panel.js`, camera styles | 8 | 5 | 5 | 3 | 6.00 | P3 |
| GEORDI-016 | Geordi | Bug | Make sparse rooms feel intentional | `lcars-homepage-card.js` room layout | 3 | 2 | 2 | 3 | 2.33 | P8 |
| GEORDI-017 | Geordi | Bug | Collapse redundant standby media panels | `lcars-media-panel.js` | 5 | 5 | 3 | 5 | 2.60 | P6 |
| GEORDI-018 | Geordi | Bug | Ensure DISARMED alarm uses ice semantics | `lcars-alarm-panel.js`, tactical badge surfaces | 8 | 8 | 8 | 2 | 12.00 | P5 |
| GEORDI-019 | Geordi | Bug | Increase alarm keypad spacing | `lcars-alarm-panel-styles.js` | 5 | 5 | 5 | 2 | 7.50 | P5 |
| GEORDI-021 | Geordi | Bug | Give weather offline state graceful gray skeleton | `lcars-weather-panel.js` | 8 | 5 | 5 | 2 | 9.00 | P7 |
| GEORDI-022 | Geordi | Bug | Gray out offline irrigation controller and zones | `lcars-irrigation-panel.js` | 8 | 5 | 5 | 2 | 9.00 | P7 |
| GEORDI-024 | Geordi | Bug | Collapse or limit diagnostics flood | `lcars-environment-panel.js`, disclosure helpers | 8 | 5 | 8 | 3 | 7.00 | P3 |
| GEORDI-025 | Geordi | Ops | Link Color label is HA naming issue | HA config, optional alias mapping | 2 | 1 | 1 | 1 | 4.00 | P9 |
| GEORDI-026 | Geordi | Ops | Ephraim/Elysia mismatch is HA naming drift | HA config, optional alias mapping | 2 | 1 | 1 | 1 | 4.00 | P9 |
| GEORDI-027 | Geordi | Bug | Warn at 100% media volume | `lcars-media-panel.js` volume fill | 3 | 3 | 2 | 1 | 8.00 | P6 |
| GEORDI-028 | Geordi | Bug | Humanize Pentair hex/model names | `lcars-base-panel.js::_shortDeviceName`, pool/power naming | 3 | 2 | 2 | 2 | 3.50 | P4 |
| GEORDI-029 | Geordi | Audit | Verify focus visibility on dynamic content | panel styles, sensor-row shadow focus, shell interactions | 5 | 5 | 8 | 5 | 3.60 | P8 |
| GEORDI-030 | Geordi | Audit | Increase low-contrast sensor indicator visibility | `lcars-styles.js`, panel styles, sensor-row | 5 | 5 | 8 | 3 | 6.00 | P8 |
| GEORDI-031 | Geordi | Audit | Verify reduced-motion compliance everywhere | shared animations, panel styles | 3 | 3 | 8 | 3 | 4.67 | P8 |
| GEORDI-032 | Geordi | Enabler | Standardize canonical short sensor labels | new label utility, base panel | 8 | 5 | 5 | 3 | 6.00 | P2 |
| QA-E01 | Eric QA | Bug | Route ceiling fans to illumination or suppress generic fan fallback | `lcars-entity-utils.js::classifyDevice`, `lcars-illumination-panel.js`, `lcars-homepage-card.js` | 13 | 8 | 8 | 3 | 9.67 | P3 |
| QA-E02 | Eric QA | Bug | Replace `OTHER ENTITIES` catch-all dumps with LCARS-aware suppression or routing | `lcars-homepage-card.js` fallback renderer, `lcars-entity-utils.js` | 13 | 13 | 13 | 5 | 7.80 | P3 |
| QA-E03 | Eric QA | Bug | Make standalone smoke detectors consistently classify as HAZARD DETECTION | `lcars-entity-utils.js::classifyDevice`, hazard detector logic | 8 | 13 | 8 | 3 | 9.67 | P3 |
| QA-E04 | Eric QA | Bug | Filter or reroute FP2 and presence devices instead of raw device-card fallback | `lcars-entity-utils.js`, tactical routing, `lcars-homepage-card.js` | 8 | 8 | 8 | 3 | 8.00 | P3 |
| QA-E05 | Eric QA | Bug | Deduplicate sparkline tray labels before truncation rules apply | `lcars-lifesupport-panel.js::_renderSparklineTray`, `lcars-format-utils.js` | 8 | 8 | 5 | 2 | 10.50 | P3 |
| QA-E06 | Eric QA | Bug | Filter Nest Protect diagnostic entities from default Life Support views | `lcars-lifesupport-panel.js`, `lcars-environment-panel.js` | 8 | 8 | 8 | 3 | 8.00 | P3 |
| QA-E07 | Eric QA | Bug | Route generic device-card sensors through the shared numeric formatter | `lcars-homepage-card.js`, `lcars-format-utils.js` | 8 | 8 | 8 | 2 | 12.00 | P3 |
| QA-E08 | Eric QA | Bug | Remove cross-panel sensor and circuit label truncation | panel CSS files, `lcars-styles.js`, pool/power/camera styles | 8 | 5 | 5 | 5 | 3.60 | P8 |
| QA-E09 | Eric QA | Bug | Strip possessive area names without leaving orphan punctuation | `lcars-base-panel.js::_shortenName`, `lcars-format-utils.js::canonicalLabel` | 3 | 2 | 3 | 1 | 8.00 | P8 |
| QA-E10 | Eric QA | Bug | Humanize large storage and data-size values with unit scaling | `lcars-format-utils.js::formatNumber`, `lcars-base-panel.js` | 5 | 5 | 8 | 2 | 9.00 | P7 |
| QA-E11 | Eric QA | Bug | Format raw ISO timestamps into human-readable date or relative-time output | `lcars-format-utils.js`, `lcars-base-panel.js`, sensor row rendering | 8 | 8 | 8 | 3 | 8.00 | P7 |
| WESLEY-UX-001 | Wesley | UX | Replace Adopt Device ambiguity with actionable guidance | `lcars-camera-panel.js`, empty-state CTA helper | 5 | 5 | 3 | 2 | 6.50 | P3 |
| WESLEY-UX-002 | Wesley | UX | Collapse unavailable media players | `lcars-media-panel.js` | 8 | 5 | 3 | 5 | 3.20 | P6 |
| WESLEY-UX-003 | Wesley | UX | Show READY / NO DATA instead of red UNKNOWN | `lcars-base-panel.js`, `lcars-color-utils.js` | 8 | 8 | 8 | 2 | 12.00 | P2 |
| WESLEY-UX-004 | Wesley | UX | Collapse redundant standby media players | `lcars-media-panel.js` | 5 | 3 | 2 | 5 | 2.00 | P6 |
| WESLEY-UX-005 | Wesley | UX | Add recovery path to offline cameras | `lcars-camera-panel.js`, offline helper | 5 | 5 | 3 | 3 | 4.33 | P3 |
| WESLEY-UX-006 | Wesley | UX | Show hidden circuit count and hidden wattage | `lcars-power-panel.js::_renderConsolidatedPowerContent` | 5 | 5 | 3 | 2 | 6.50 | P4 |
| WESLEY-UX-007 | Wesley | UX | Explain irrigation offline vs idle states | `lcars-irrigation-panel.js` | 5 | 5 | 3 | 2 | 6.50 | P7 |
| WESLEY-UX-008 | Wesley | UX | Collapse 0W power panels to standby summary | `lcars-power-panel.js::renderContent/_renderConsolidatedPowerContent` | 5 | 5 | 5 | 3 | 5.00 | P4 |
| WESLEY-UX-009 | Wesley | UX | Make garage door state and action explicit | `lcars-tactical-panel.js`, `lcars-homepage-card.js::_renderCovers` | 8 | 5 | 5 | 3 | 6.00 | P5 |
| WESLEY-UX-010 | Wesley | UX | Fix truncated sparkline labels | `lcars-lifesupport-panel.js::_renderSparklineTray`, label utility | 5 | 5 | 3 | 2 | 6.50 | P2 |
| WESLEY-UX-011 | Wesley | UX | Deduplicate tactical panel across rooms | `lcars-homepage-card.js::_renderAreaContent`, room header surfaces | 8 | 5 | 8 | 5 | 4.20 | P5 |
| WESLEY-UX-012 | Wesley | UX | Add calm weather offline context and cached data | `lcars-weather-panel.js` | 5 | 5 | 3 | 2 | 6.50 | P7 |
| WESLEY-UX-013 | Wesley | UX | Add undo/confirm flows for risky actions | `lcars-base-panel.js`, tactical/alarm/power/media entry points | 8 | 8 | 8 | 5 | 4.80 | P5 |
| WESLEY-IDEA-001 | Wesley | Idea | Add room vitals strip for sparse rooms | `lcars-homepage-card.js` room shell | 5 | 2 | 3 | 5 | 2.00 | P8 |
| WESLEY-IDEA-002 | Wesley | Idea | Add CSS static effect for offline cameras | `lcars-camera-panel.js`, camera styles | 5 | 3 | 2 | 3 | 3.33 | P3 |
| WESLEY-IDEA-003 | Wesley | Idea | Build consolidated media hub | `lcars-media-panel.js` | 8 | 5 | 5 | 8 | 2.25 | P6 |
| WESLEY-IDEA-004 | Wesley | Idea | Shared contextual empty-state copy system | base empty-state copy module, panel offline branches | 5 | 3 | 5 | 5 | 2.60 | P8 |
| WESLEY-IDEA-005 | Wesley | Idea | Progressive power panel by load threshold | `lcars-power-panel.js` | 5 | 3 | 5 | 5 | 2.60 | P4 |
| WESLEY-IDEA-006 | Wesley | Idea | Visual garage-door position indicator | `lcars-tactical-panel.js` or `lcars-homepage-card.js::_renderCovers` | 5 | 3 | 3 | 3 | 3.67 | P5 |
| WESLEY-IDEA-007 | Wesley | Idea | Vary waveform by media source type | `lcars-media-panel.js` waveform renderer | 2 | 1 | 1 | 3 | 1.33 | P6 |
| WESLEY-IDEA-008 | Wesley | Idea | Show last-activity timestamp for idle rooms | `lcars-homepage-card.js` room header | 3 | 2 | 3 | 3 | 2.67 | P8 |
| WESLEY-IDEA-009 | Wesley | Idea | Prototype View Transitions room navigation | `lcars-homepage-card.js`, shell navigation | 3 | 1 | 2 | 8 | 0.75 | P8 |
| WESLEY-IDEA-010 | Wesley | Idea | Use room-header alarm badge instead of duplicate panels | `lcars-homepage-card.js`, tactical/alarm handoff | 8 | 5 | 5 | 5 | 3.60 | P5 |
| WESLEY-IDEA-011 | Wesley | Idea | Tier sensor disclosure into hero / operational / diagnostic | `lcars-camera-panel.js`, `lcars-environment-panel.js`, base disclosure helper | 8 | 5 | 8 | 5 | 4.20 | P3 |
| WESLEY-IDEA-012 | Wesley | Idea | Pool circuit disambiguation plus wattage color tiers | `lcars-power-panel.js` | 5 | 3 | 3 | 3 | 3.67 | P4 |
| WESLEY-IDEA-013 | Wesley | Idea | Add dashboard boot sequence | `lcars-homepage-card.js` shell lifecycle | 3 | 1 | 2 | 8 | 0.75 | P8 |
| WESLEY-IDEA-014 | Wesley | Idea | Adapt climate arc to legitimate nonstandard ranges | `lcars-climate-panel.js` | 3 | 2 | 3 | 3 | 2.67 | P8 |
| WESLEY-IDEA-015 | Wesley | Idea | Add mobile haptics for actions | `lcars-base-panel.js` or shell action helpers | 3 | 1 | 1 | 3 | 1.67 | P8 |
| WESLEY-IDEA-016 | Wesley | Idea | Add trend arrows for Life Support sensors | `lcars-lifesupport-panel.js`, sparkline helper | 3 | 1 | 2 | 3 | 2.00 | P8 |
| WESLEY-IDEA-017 | Wesley | Idea | Universal LAST ACTIVE for unavailable panels | `lcars-base-panel.js`, weather/camera/irrigation branches | 5 | 5 | 5 | 3 | 5.00 | P7 |
| WORF-SEC-001 | Worf | Security | Replace `innerHTML` with `textContent` in vendor editor | `vendor/editor.js` | 2 | 2 | 5 | 1 | 9.00 | P9 |
| WORF-SEC-002 | Worf | Security | Audit and selectively update npm dependencies | `js/package.json`, lockfile, build config | 5 | 5 | 13 | 8 | 2.88 | P9 |
| WORF-SEC-003 | Worf | Security | Clarify alarm client-side limiter as UX safeguard and improve feedback | `lcars-alarm-panel.js` | 3 | 3 | 5 | 2 | 5.50 | P5 |
| WORF-SEC-004 | Worf | Security | Add color sanitization guard if style inputs broaden | `lcars-color-utils.js`, style binding helpers | 3 | 2 | 5 | 3 | 3.33 | P9 |
| WORF-SEC-005 | Worf | Security | No XSS fix needed because Lit escapes state text | documentation only | 1 | 1 | 3 | 1 | 5.00 | P9 |
| WORF-SEC-006 | Worf | Security | Validate `more_pages` subdirectory names | `process_yaml.py` | 3 | 3 | 8 | 2 | 7.00 | P9 |
| WORF-SEC-007 | Worf | Security | Add schema and size validation for blueprint YAML install | `__init__.py` websocket handler | 5 | 5 | 13 | 5 | 4.60 | P9 |
| WORF-SEC-008 | Worf | Security | Validate template filenames before Jinja load | `process_yaml.py` | 3 | 3 | 8 | 2 | 7.00 | P9 |

## SECTION 2: Implementation Passes

### Pass P1 — Classification Core and Area Routing

Description: Fix the systemic classification defects first so the dashboard stops sending the wrong entities into the wrong panels. This is the highest-leverage pass because it automatically resolves multiple downstream Geordi symptoms.

- Status: ✅ COMPLETE (shipped in `v4.22.0-rc.1`)

- Included bugs: DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-011, DATA-016, DATA-017, DATA-019, DATA-020, DATA-021, GEORDI-002, GEORDI-004, GEORDI-005, GEORDI-010, GEORDI-012
- Files modified:
  - `custom_components/lcars_dashboard/js/src/lcars-entity-utils.js`
  - `custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/lifesupport/lcars-lifesupport-panel.js`
  - likely adjunct: `custom_components/lcars_dashboard/js/src/lcars-homepage-card.js` if area-consumption predicates must be kept in sync with extracted utils
- Aggregate WSJF: 10.06
- Estimated scope: XL
- Dependencies: None
- Test after pass:
  - Build the JS bundle.
  - Room-level visual QA in Leith Back Yard, Garage, Office and Eric Alex, Ephraim, Kyler, Kitchen, Garage, Outside.
  - Verify illumination no longer absorbs irrigation, EcoFlow, appliance, or cross-domain switches.
  - Verify ceiling-fan rooms do not spawn Life Support unless actual AQ signals exist.
  - Verify GE fridges and ScreenLogic pool climate entities stop feeding Life Support.
- Implementation notes:
  - `lcars-entity-utils.js`
    - Update `PLATFORM_PANEL_MAP` near lines 133-171 to add `ecoflow_cloud -> battery` and keep platform fallback deterministic.
    - Tighten the hazard detector near lines 228-244 to ignore `entity_category: diagnostic/config`, preserve Nest Protect platform positives, and require stronger non-diagnostic hazard evidence.
    - Refactor `isClimateEntity()` near lines 446-448 to reject known galley and pool/spa platforms.
    - Refactor `isEnvironmentEntity()` near lines 451-458 so only AQ-capable fan platforms qualify, not every fan without `device_class`.
    - Adjust `classifyArea()` near lines 505-520 so area-level Life Support only claims valid climate and environment sources after the above filters.
    - Add defensive negative-keyword exclusions to `isLightingEntity()` after the catch-all removal so future switch leaks stay contained.
  - `lcars-illumination-panel.js`
    - Rewrite `_partitionLightingEntities()` near lines 100-157 so pass 2 only includes `isLightingEntity(entry)` matches.
    - Replace the current claimed-device augmentation logic with a single reusable augmentation policy aligned with the orchestrator; do not let illumination see more device evidence than the rest of the app.
  - `lcars-lifesupport-panel.js`
    - Recheck `_partitionEntities()` near lines 58-92 to ensure the environment substation is built only from actual environment entries after the refined predicates land.
    - Keep the nested climate/environment composition logic intact, but only for legitimately classified devices.
  - `lcars-homepage-card.js` if needed
    - Keep `_buildAreaPanelFilter()` and the extracted util predicates aligned so area-level consumption matches the extracted panel logic exactly.

### Pass P2 — Shared Formatting, Labels, and State Semantics

Description: Centralize how values, labels, and idle/error states render. This removes raw decimals, false-red READY states, and label sprawl in one pass through the base rendering pipeline.

- Status: ✅ COMPLETE (shipped in `v4.22.0-rc.2`)

- Included bugs: DATA-008, DATA-012, DATA-018, GEORDI-001, GEORDI-003, GEORDI-014, GEORDI-032, WESLEY-UX-003, WESLEY-UX-010
- Files modified:
  - `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`
  - `custom_components/lcars_dashboard/js/src/lcars-color-utils.js`
  - likely new helper: `custom_components/lcars_dashboard/js/src/lcars-format-utils.js` or `lcars-label-utils.js`
  - likely touch: `custom_components/lcars_dashboard/js/src/components/lcars-sensor-row/lcars-sensor-row.js`
  - secondary consumers: panel renderers that still bypass base helpers
- Aggregate WSJF: 9.52
- Estimated scope: L
- Dependencies: None
- Test after pass:
  - Build the JS bundle.
  - Spot-check environment, power, weather, camera, and Life Support panels for rounding, units, and canonical labels.
  - Verify button entities render READY, sensor unknowns render NO DATA, and only real operational failures stay alert-colored.
  - Verify sparkline tray labels use canonical abbreviations without truncation.
- Implementation notes:
  - `lcars-base-panel.js`
    - Add a shared value formatter near the entity-helper block above `_shortenName()` and route panel renderers through it.
    - Extend `_friendlyName()` / `_shortenName()` around lines 97-138 with canonical label lookup and better prefix stripping for long scientific labels.
    - Add domain-aware state label helpers so `button` and `input_button` show READY, noncritical unknown sensor states show NO DATA, and raw `unknown` does not leak directly into templates.
  - `lcars-color-utils.js`
    - Refine `getStateColor()` near lines 25-49 so diagnostic/config unknown/unavailable states use disabled gray rather than alert red.
    - Keep alarm and playback color semantics consistent with the new state-label helper.
  - New shared helper module
    - Centralize rounding rules by `device_class` and `unit_of_measurement`.
    - Add canonical label map for `PM2.5`, `PM10`, `PM1`, `CO₂`, `VOC`, `AQI`, `TEMP`, `RH`, plus pool chemistry abbreviations.
  - `lcars-sensor-row.js`
    - Ensure the component receives already-formatted label/value pairs and preserves focusability for dynamic rows.
- GitHub issue overlap after Eric QA:
  - `#47` maps to DATA-008 and GEORDI-001. P2 addressed the shared formatter core, but battery-specific and generic-device-card coverage gaps remain open through QA-E07 and QA-E10.
  - `#48` maps to DATA-008 and GEORDI-001. Treat it as a P2 regression check only; the implementation surface belongs to the shipped pass.
  - `#49` maps to GEORDI-032 and WESLEY-UX-010. P2 addressed canonical sparkline labeling, but duplicated label selection remains open through QA-E05.
  - `#50` maps to GEORDI-014. Treat it as addressed by the shipped P2 color-semantic work unless a fresh repro appears.

### Pass P3 — ✅ COMPLETE (v4.22.0-rc.3) — Residual Classification Cleanup, Telemetry Relevance, Diagnostics Disclosure, and Camera Recovery UX

Description: Fix the residual generic-device fallback leaks, noisy sensor dumps, and broken hazard/environment composition that remained after P1 and P2 shipped. This pass is about showing the right data, suppressing the wrong fallback surfaces, and then presenting the surviving telemetry with useful recovery states.

- Included bugs: DATA-006, DATA-007, DATA-014, GEORDI-006, GEORDI-013, GEORDI-015, GEORDI-024, QA-E01, QA-E02, QA-E03, QA-E04, QA-E05, QA-E06, QA-E07, WESLEY-UX-001, WESLEY-UX-005, WESLEY-IDEA-002, WESLEY-IDEA-011
- Files modified:
  - `custom_components/lcars_dashboard/js/src/lcars-entity-utils.js`
  - `custom_components/lcars_dashboard/js/src/lcars-homepage-card.js`
  - `custom_components/lcars_dashboard/js/src/panels/illumination/lcars-illumination-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/environment/lcars-environment-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/camera/lcars-camera-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/lifesupport/lcars-lifesupport-panel.js`
  - likely touch: camera/environment style files
  - likely helper touch: `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`, `custom_components/lcars_dashboard/js/src/lcars-format-utils.js`
- Aggregate WSJF: 7.87
- Estimated scope: XL
- Dependencies: P1, P2
- Test after pass:
  - Build the JS bundle.
  - Verify fan-heavy rooms no longer show generic `FANS` cards or `OTHER ENTITIES` dumps, and that fan-light entities route to Illumination while speed-only fan telemetry is suppressed until a dedicated fan surface exists.
  - Verify standalone smoke detectors consistently render as HAZARD DETECTION, including binary-sensor-only Nest Protect cases.
  - Verify FP2 and similar presence devices stop leaking raw illuminance/light diagnostics into generic device cards.
  - Verify Nest Protect and similar hazard devices no longer render empty atmoscrubbers or full diagnostics dumps.
  - Verify sparkline trays deduplicate labels before truncation so `PM1`, `PM2.5`, `PM10`, and `AQI` each appear once with canonical labels.
  - Verify generic device-card sensors now use shared numeric formatting instead of raw float precision.
  - Verify UniFi Protect cameras show only motion/status-relevant telemetry unless diagnostics are explicitly expanded.
  - Verify offline cameras show distinct offline visuals plus actionable guidance for unadopted devices.
  - Verify diagnostics sections default collapsed and can expand intentionally.
- Implementation notes:
  - `lcars-entity-utils.js`
    - Add a residual post-P1 classification sweep for standalone fan entities, smoke-only hazard devices, and FP2-style presence devices so they stop falling through to the generic renderer.
    - Keep the destination conservative: route fan-light-capable entities to Illumination, route true hazard signals to HAZARD DETECTION, and suppress unsupported fan/presence leftovers rather than minting misleading fallback cards.
  - `lcars-homepage-card.js`
    - Replace the generic `OTHER ENTITIES` dump path with LCARS-aware suppression or a narrower fallback that reuses shared formatter and category-label helpers.
    - Ensure any residual fallback rows use `formatNumber()` and humanized labels instead of raw HA state strings and domain headings.
  - `lcars-illumination-panel.js`
    - Keep fan-adjacent lighting entities aligned with the classifier changes so fan lights land in Illumination without reintroducing switch catch-alls.
  - `lcars-environment-panel.js`
    - Rework `_partitionEnvironmentEntities()` near lines 31-55 so only true AQ/telemetry signals render as primary data and diagnostics are explicitly tiered.
    - Refine `_getAQColor()` near lines 77-84 so missing/unavailable AQ state resolves to disabled gray, not a misleading active hue.
    - In `renderContent()` near lines 116-281, only render `.atmoscrubber-container` when the device actually has AQ score or AQ sensors; otherwise degrade gracefully.
    - Add collapsed diagnostics treatment instead of always dumping the full `diagnostics` array.
  - `lcars-camera-panel.js`
    - Replace the raw `_partitionDeviceEntities(this.group.entities)` usage near lines 34-97 with a camera-specific relevance filter.
    - Introduce tiered sensor disclosure: hero metrics always visible, operational on demand, diagnostics hidden by default.
    - Improve offline/adopt-device states so `VIEWSCREEN OFFLINE` shows last-known context and the setup CTA points to the relevant integration/device page rather than a dead-end label.
  - `lcars-lifesupport-panel.js`
    - Ensure the environment substation only appears when valid environment content exists; otherwise the Life Support composite should stay climate-only or sensor-only.
    - Deduplicate sparkline label candidates before canonicalization and truncation so duplicate PM/AQI rows cannot survive into the tray.
    - Filter Nest Protect `entity_category=diagnostic` rows out of the default panel body and leave them to the explicit diagnostics disclosure path.
  - Base/helper changes
    - Add reusable disclosure-state and setup-CTA helpers so the same logic is not reimplemented in every panel.
    - Extend shared formatting so generic fallback rows and non-panel sensor lists reuse the same numeric and label pipeline as panel content.

### Pass P4 — Power Naming, Circuit Correctness, and Progressive Disclosure

Description: Clean up circuit identity, pairing, and load presentation in one pass through the power stack. This pass removes the unreadable raw IDs and the low-value full-size 0W experience.

- Included bugs: DATA-009, DATA-010, GEORDI-007, GEORDI-008, GEORDI-009, GEORDI-028, WESLEY-UX-006, WESLEY-UX-008, WESLEY-IDEA-005, WESLEY-IDEA-012
- Files modified:
  - `custom_components/lcars_dashboard/js/src/panels/power/lcars-power-panel.js`
  - `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`
  - likely touch: `custom_components/lcars_dashboard/js/src/panels/pool-spa/lcars-pool-spa-panel.js` if pool names also surface there
- Aggregate WSJF: 5.71
- Estimated scope: L
- Dependencies: P2
- Test after pass:
  - Build the JS bundle.
  - Verify Eric Garage, Laundry, Pool, and any 0W standby rooms.
  - Confirm duplicate `POOL EQUIPMENT` names are disambiguated, `-- Dryer` artifacts are gone, aggregate hidden-wattage labels are correct, and 0W views collapse as intended.
- Implementation notes:
  - `lcars-power-panel.js`
    - Improve `_detect240VPairs()` near lines 149-194 so partial matches do not leave orphan `--` names behind.
    - Add stronger humanization and dedupe rules in the circuit tile path around lines 381-526.
    - Extend `_renderConsolidatedPowerContent()` near lines 700-780 to show hidden circuit count plus hidden wattage, and to collapse 0W panels into standby summaries.
    - Add wattage-tier color semantics for duplicate or still-similar pool circuits after names are disambiguated.
  - `lcars-base-panel.js`
    - Extend `_shortDeviceName()` and `_shortenName()` so Emporia/Pentair hex-ish or prefix-heavy names collapse to user-readable labels.

### Pass P5 — Tactical, Alarm, Garage Door, and High-Impact Action Safety

Description: Consolidate the security-facing UX into one pass. This includes alarm semantics, garage-door clarity, room-header badge strategy, and the confirmation/undo rules for high-impact actions.

- Included bugs: GEORDI-018, GEORDI-019, WESLEY-UX-009, WESLEY-UX-011, WESLEY-UX-013, WESLEY-IDEA-006, WESLEY-IDEA-010, WORF-SEC-003
- Files modified:
  - `custom_components/lcars_dashboard/js/src/panels/alarm/lcars-alarm-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/tactical/lcars-tactical-panel.js`
  - `custom_components/lcars_dashboard/js/src/lcars-homepage-card.js`
  - likely touch: `custom_components/lcars_dashboard/js/src/panels/viewport/lcars-viewport-panel.js` if cover affordances are shared
  - likely touch: `custom_components/lcars_dashboard/js/src/lcars-base-panel.js` for shared confirm/undo service wrappers
- Aggregate WSJF: 4.89
- Estimated scope: L
- Dependencies: P2
- Test after pass:
  - Build the JS bundle.
  - Verify Family Room / Front Foyer alarm colors and keypad spacing.
  - Verify garage doors show CLOSED / OPEN / PARTIAL states with contextual action labels.
  - Verify read-only room-header alarm badges navigate to Tactical and never arm/disarm directly.
  - Verify undo and confirm flows obey Worf constraints: high-risk actions require confirmation, lock/security reversals are not one-tap undo.
- Implementation notes:
  - `lcars-alarm-panel.js`
    - Keep `getAlarmStateColor()` usage correct in `frameColor`, `renderBadge()`, and `renderContent()` around lines 24-28 and 156-260.
    - Add explicit rate-limit feedback near `_handleAlarmDisarm()` so the UI communicates the client-side guard rather than silently failing.
    - Increase keypad spacing in the alarm styles file.
  - `lcars-tactical-panel.js`
    - Improve access-point and perimeter renderers around lines 175-280 so garage doors read as physical state, not raw toggle math.
    - Keep tactical status compact when full alarm controls are already shown elsewhere.
  - `lcars-homepage-card.js`
    - Update `_renderAreaContent()` around lines 7041-7144 to support a room-header alarm badge and to suppress duplicate full Tactical panels in secondary rooms.
    - Replace generic cover rendering around lines 7428-7456 with contextual garage-door presentation where security covers route through tactical surfaces.
  - Shared action layer
    - Add confirm/undo primitives in the base panel or shell so power, covers, and climate can reuse one pattern.

### Pass P6 — Media Consolidation and Communication-System States

Description: Fix the media panels as a family. This pass collapses dead or standby clutter, adds high-volume semantics, and builds the consolidated comm-array behavior for multi-speaker rooms.

- Included bugs: GEORDI-017, GEORDI-027, WESLEY-UX-002, WESLEY-UX-004, WESLEY-IDEA-003, WESLEY-IDEA-007
- Files modified:
  - `custom_components/lcars_dashboard/js/src/panels/media/lcars-media-panel.js`
  - likely touch: media styles
- Aggregate WSJF: 2.54
- Estimated scope: L
- Dependencies: P2
- Test after pass:
  - Build the JS bundle.
  - Verify Leith Master Bedroom and Eric Back Porch.
  - Confirm unavailable players collapse into a compact offline strip, standby siblings collapse into a comm-array view, and 100% volume gets a visible warning color.
- Implementation notes:
  - `lcars-media-panel.js`
    - Extend `_partitionMediaEntities()` near lines 31-58 only as needed; keep media-device affinity intact.
    - Rework `renderContent()` near lines 89-217 so idle/unavailable players do not consume full-height hero views.
    - Use `_renderSecondaryOutputs()` near lines 234-260 as the starting point for the compact comm-array rows.
    - Add threshold colors to the volume fill and percentage label so extreme volume is visibly distinct.
    - Keep source-aware waveform behavior optional and behind reliable metadata checks; do not let it destabilize the main collapse work.

### Pass P7 — Weather, Irrigation, and Universal Offline, Time, and Telemetry Context

Description: Standardize calm, useful offline states plus human-readable time and telemetry formatting for long-running sensors and controllers. This is where LAST ACTIVE, cached last readings, disabled-control semantics, timestamp humanization, and large-value scaling land.

- Included bugs: GEORDI-021, GEORDI-022, QA-E10, QA-E11, WESLEY-UX-007, WESLEY-UX-012, WESLEY-IDEA-017
- Files modified:
  - `custom_components/lcars_dashboard/js/src/panels/weather/lcars-weather-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/irrigation/lcars-irrigation-panel.js`
  - `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`
  - `custom_components/lcars_dashboard/js/src/lcars-format-utils.js`
  - likely touch: `custom_components/lcars_dashboard/js/src/components/lcars-sensor-row/lcars-sensor-row.js`
- Aggregate WSJF: 7.81
- Estimated scope: M
- Dependencies: P2
- Test after pass:
  - Build the JS bundle.
  - Verify Eric Outside and Utility rooms.
  - Confirm offline weather uses gray framing plus last-known readings; irrigation offline disables controls, clarifies controller state, and surfaces last active context.
  - Verify storage, data-size, and similar telemetry values scale to readable units instead of exposing raw MB-sized magnitudes.
  - Verify timestamp entities and vehicle activity rows render human-readable dates or relative-time strings instead of raw ISO payloads.
- Implementation notes:
  - `lcars-weather-panel.js`
    - Add explicit unavailable branch in `renderContent()` near lines 150-242 instead of rendering an empty live layout.
    - Keep the frame and viewscreen structure visible, but swap to gray semantics and optional cached-data copy.
  - `lcars-irrigation-panel.js`
    - Add controller-state-aware frame, button disable, and last-seen context for offline controllers.
    - Separate `IDLE` flow state from controller `OFFLINE` connectivity state so the panel never shows both as peers.
  - `lcars-base-panel.js`
    - Add a reusable `_getLastActive()` / relative-time helper so unavailable panels can show LAST ACTIVE without each panel reimplementing date math.
  - `lcars-format-utils.js`
    - Extend `formatNumber()` with storage and data-size scaling so `MB` and similar units can promote to `GB` or `TB` when the magnitude warrants it.
    - Add timestamp detection and humanization helpers that can emit either a compact absolute date or a relative-time label depending on the surface.
  - `lcars-sensor-row.js` and shared row consumers
    - Ensure generic rows that currently print raw ISO strings or overscaled numeric values pick up the same new formatting helpers.

### Pass P8 — Shell Polish, Accessibility, Motion, and Lower-Risk UX Ideas

Description: Finish the presentation layer after the core behavior is stable. This pass is where sparse-room polish, focus verification, reduced-motion cleanup, idle-room metadata, climate arc adaptation, shell-level effects, and the remaining cross-panel label-truncation cleanup belong.

- Included bugs: GEORDI-016, GEORDI-029, GEORDI-030, GEORDI-031, QA-E08, QA-E09, WESLEY-IDEA-001, WESLEY-IDEA-004, WESLEY-IDEA-008, WESLEY-IDEA-009, WESLEY-IDEA-013, WESLEY-IDEA-014, WESLEY-IDEA-015, WESLEY-IDEA-016
- Files modified:
  - `custom_components/lcars_dashboard/js/src/lcars-homepage-card.js`
  - `custom_components/lcars_dashboard/js/src/lcars-shared-animations.js`
  - `custom_components/lcars_dashboard/js/src/lcars-styles.js`
  - `custom_components/lcars_dashboard/js/src/lcars-base-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/lifesupport/lcars-lifesupport-panel.js`
  - `custom_components/lcars_dashboard/js/src/panels/climate/lcars-climate-panel.js`
  - likely touch: `components/lcars-sensor-row/*`, `panels/pool-spa/*`, `panels/power/*`, `panels/camera/*`, and other targeted panel style files
- Aggregate WSJF: 2.38
- Estimated scope: XL
- Dependencies: P2, P3, P5, P7
- Test after pass:
  - Build the JS bundle.
  - Keyboard-only QA across dynamic panels.
  - Reduced-motion QA with OS-level preference enabled.
  - Visual QA for sparse rooms, idle-room metadata, possessive room names, long pool chemistry labels, camera/power label widths, and any boot / transition / haptic enhancements on supported devices.
- Implementation notes:
  - `lcars-homepage-card.js`
    - Add room vitals / last-activity shell treatment only after the core layouts are stable.
    - Prototype View Transitions and boot animation behind feature detection; do not make them required for navigation.
  - `lcars-base-panel.js`
    - Tighten `_shortenName()` so possessive area prefixes like `Alex's` strip cleanly instead of leaving orphan punctuation behind.
  - `lcars-styles.js` and component styles
    - Increase or outline low-contrast indicator dots and verify focus rings through shadow DOM.
    - Audit cross-panel label containers so long chemistry, circuit, and person/device labels either wrap, abbreviate intentionally, or get wider containers instead of ellipsis-by-default.
  - `lcars-shared-animations.js`
    - Audit every animation token and panel-specific override against `prefers-reduced-motion`.
  - `lcars-climate-panel.js`
    - Adapt arc range logic to legitimate nonstandard climate ranges only after fridge/pool misrouting is already fixed by P1.
  - `lcars-lifesupport-panel.js`
    - Add trend arrows only where sparkline data already exists; keep it scoped to Life Support.
  - Targeted panel style files
    - Fix the panel-specific truncation hotspots in pool, power, camera, and other affected tiles without regressing the broader LCARS layout rhythm.

### Pass P9 — Security Hardening and Explicit No-Code Dispositions

Description: Finish the backend and tooling hardening work in one pass, and explicitly close the HA-configuration-only findings so they do not keep re-entering code passes.

- Included bugs: DATA-013, DATA-015, GEORDI-025, GEORDI-026, WORF-SEC-001, WORF-SEC-002, WORF-SEC-004, WORF-SEC-005, WORF-SEC-006, WORF-SEC-007, WORF-SEC-008
- Files modified:
  - `custom_components/lcars_dashboard/js/vendor/editor.js`
  - `custom_components/lcars_dashboard/js/package.json`
  - `custom_components/lcars_dashboard/__init__.py`
  - `custom_components/lcars_dashboard/process_yaml.py`
  - optional docs: README / contributor notes if config-only issues are documented
- Aggregate WSJF: 5.57
- Estimated scope: M
- Dependencies: None
- Test after pass:
  - Run `npm audit` and the JS build after dependency changes.
  - Exercise blueprint install validation and template loading on safe and invalid inputs.
  - Verify vendor editor still renders buttons correctly.
  - Document no-code HA configuration findings so they are explicitly closed, not silently ignored.
- Implementation notes:
  - `vendor/editor.js`
    - Replace `innerHTML` with `textContent`.
  - `js/package.json`
    - Update vulnerable tooling selectively, not indiscriminately; preserve the lit-html/Home Assistant compatibility constraint.
  - `__init__.py`
    - Add schema and size validation to blueprint install payloads.
  - `process_yaml.py`
    - Validate subdirectory names and template filenames before path joins or Jinja template loads.
  - No-code closures
    - Record DATA-013, DATA-015, GEORDI-025, and GEORDI-026 as HA configuration tasks, optionally with a lightweight UI hint instead of pretending they are core JS bugs.

## SECTION 3: Pass Dependency Graph

```text
P1 Classification Core
 ├─> P3 Residual Classification Cleanup / Telemetry Relevance / Diagnostics Disclosure
 └─> P8 Shell Polish (climate arc and sparse-room polish only after routing is correct)

P2 Shared Formatting / Labels / State Semantics
 ├─> P3 Residual Classification Cleanup / Telemetry Relevance / Diagnostics Disclosure
 ├─> P4 Power Naming / Disclosure
 ├─> P5 Tactical / Alarm / High-Impact Actions
 ├─> P6 Media Consolidation
 ├─> P7 Weather / Irrigation Offline / Time / Telemetry Context
 └─> P8 Shell Polish / Accessibility / Motion

P3 Residual Classification Cleanup / Telemetry Relevance / Diagnostics Disclosure
 └─> P8 Shell Polish (empty-state copy and reduced-noise UX assume correct primary data)

P5 Tactical / Alarm / High-Impact Actions
 └─> P8 Shell Polish (room-header badges and shell polish depend on final tactical behavior)

P7 Weather / Irrigation Offline / Time / Telemetry Context
 └─> P8 Shell Polish (shared empty-state copy and room-level quiet-state polish reuse the offline helper)

P9 Security Hardening / No-Code Dispositions
 └─ independent of panel passes, but safest after any package.json churn is coordinated with completed UI work
```

Eric's post-P2 QA does not justify a new pass. The new bugs cluster cleanly into P3 for residual classifier and fallback cleanup, P7 for time-and-telemetry humanization gaps, and P8 for cross-panel label and CSS polish.

Recommended execution order with dependencies respected:

1. P1 Classification Core
2. P2 Shared Formatting, Labels, and State Semantics
3. P3 Telemetry Relevance, Diagnostics Disclosure, and Camera Recovery UX
4. P4 Power Naming, Circuit Correctness, and Progressive Disclosure
5. P7 Weather, Irrigation, and Universal Offline Recovery Context
6. P5 Tactical, Alarm, Garage Door, and High-Impact Action Safety
7. P6 Media Consolidation and Communication-System States
8. P8 Shell Polish, Accessibility, Motion, and Lower-Risk UX Ideas
9. P9 Security Hardening and Explicit No-Code Dispositions

## SECTION 4: Quick Reference

| ID | Pass |
|---|---|
| DATA-001 | P1 |
| DATA-002 | P1 |
| DATA-003 | P1 |
| DATA-004 | P1 |
| DATA-005 | P1 |
| DATA-006 | P3 |
| DATA-007 | P3 |
| DATA-008 | P2 |
| DATA-009 | P4 |
| DATA-010 | P4 |
| DATA-011 | P1 |
| DATA-012 | P2 |
| DATA-013 | P9 |
| DATA-014 | P3 |
| DATA-015 | P9 |
| DATA-016 | P1 |
| DATA-017 | P1 |
| DATA-018 | P2 |
| DATA-019 | P1 |
| DATA-020 | P1 |
| DATA-021 | P1 |
| GEORDI-001 | P2 |
| GEORDI-002 | P1 |
| GEORDI-003 | P2 |
| GEORDI-004 | P1 |
| GEORDI-005 | P1 |
| GEORDI-006 | P3 |
| GEORDI-007 | P4 |
| GEORDI-008 | P4 |
| GEORDI-009 | P4 |
| GEORDI-010 | P1 |
| GEORDI-012 | P1 |
| GEORDI-013 | P3 |
| GEORDI-014 | P2 |
| GEORDI-015 | P3 |
| GEORDI-016 | P8 |
| GEORDI-017 | P6 |
| GEORDI-018 | P5 |
| GEORDI-019 | P5 |
| GEORDI-021 | P7 |
| GEORDI-022 | P7 |
| GEORDI-024 | P3 |
| GEORDI-025 | P9 |
| GEORDI-026 | P9 |
| GEORDI-027 | P6 |
| GEORDI-028 | P4 |
| GEORDI-029 | P8 |
| GEORDI-030 | P8 |
| GEORDI-031 | P8 |
| GEORDI-032 | P2 |
| QA-E01 | P3 |
| QA-E02 | P3 |
| QA-E03 | P3 |
| QA-E04 | P3 |
| QA-E05 | P3 |
| QA-E06 | P3 |
| QA-E07 | P3 |
| QA-E08 | P8 |
| QA-E09 | P8 |
| QA-E10 | P7 |
| QA-E11 | P7 |
| WESLEY-UX-001 | P3 |
| WESLEY-UX-002 | P6 |
| WESLEY-UX-003 | P2 |
| WESLEY-UX-004 | P6 |
| WESLEY-UX-005 | P3 |
| WESLEY-UX-006 | P4 |
| WESLEY-UX-007 | P7 |
| WESLEY-UX-008 | P4 |
| WESLEY-UX-009 | P5 |
| WESLEY-UX-010 | P2 |
| WESLEY-UX-011 | P5 |
| WESLEY-UX-012 | P7 |
| WESLEY-UX-013 | P5 |
| WESLEY-IDEA-001 | P8 |
| WESLEY-IDEA-002 | P3 |
| WESLEY-IDEA-003 | P6 |
| WESLEY-IDEA-004 | P8 |
| WESLEY-IDEA-005 | P4 |
| WESLEY-IDEA-006 | P5 |
| WESLEY-IDEA-007 | P6 |
| WESLEY-IDEA-008 | P8 |
| WESLEY-IDEA-009 | P8 |
| WESLEY-IDEA-010 | P5 |
| WESLEY-IDEA-011 | P3 |
| WESLEY-IDEA-012 | P4 |
| WESLEY-IDEA-013 | P8 |
| WESLEY-IDEA-014 | P8 |
| WESLEY-IDEA-015 | P8 |
| WESLEY-IDEA-016 | P8 |
| WESLEY-IDEA-017 | P7 |
| WORF-SEC-001 | P9 |
| WORF-SEC-002 | P9 |
| WORF-SEC-003 | P5 |
| WORF-SEC-004 | P9 |
| WORF-SEC-005 | P9 |
| WORF-SEC-006 | P9 |
| WORF-SEC-007 | P9 |
| WORF-SEC-008 | P9 |

## SECTION 5: Risk Assessment

### P1 — Classification Core and Area Routing

- Risk: Over-tightening predicates can suppress legitimate panels, especially hybrid devices.
- Mitigation: Validate against both homes and keep a short allowlist test set for Blueair, Nest Protect, ScreenLogic, GE Home, EcoFlow, and Rachio.
- Rollback: Revert detector-level predicate changes first, not the entire panel stack.

### P2 — Shared Formatting, Labels, and State Semantics

- Risk: Centralized formatting can unintentionally change every panel at once.
- Mitigation: Gate formatter behavior by unit and device class, keep a raw fallback for nonnumeric values, and test representative entities from each panel family.
- Rollback: Revert the shared formatter hook while keeping standalone panel-specific formatting intact.

### P3 — Telemetry Relevance, Diagnostics Disclosure, and Camera Recovery UX

- Risk: Hiding too much diagnostic data could remove needed troubleshooting information.
- Mitigation: Collapse diagnostics by default instead of deleting them, and expose an explicit expand affordance.
- Rollback: Keep the relevance filter, but temporarily restore always-visible diagnostics if the disclosure UI regresses.

### P4 — Power Naming, Circuit Correctness, and Progressive Disclosure

- Risk: Over-aggressive name normalization can erase meaningful circuit identity.
- Mitigation: Preserve entity-id or channel suffix fallback any time dedupe would otherwise create collisions.
- Rollback: Revert name-humanization only; leave 240V-pair and disclosure fixes in place.

### P5 — Tactical, Alarm, Garage Door, and High-Impact Action Safety

- Risk: Changing security interactions can create accidental lockouts, accidental opens, or privacy regressions.
- Mitigation: Keep room-header alarm badges read-only, require confirmation for high-impact actions, and test with keyboard plus touch.
- Rollback: Disable header-badge interactivity first and fall back to the existing full Tactical panel if shell-level dedupe misbehaves.

### P6 — Media Consolidation and Communication-System States

- Risk: Consolidation logic may hide a player the user expects to see independently.
- Mitigation: Keep one clear hero player, preserve direct secondary row access, and only collapse when siblings are genuinely idle/unavailable.
- Rollback: Re-enable one-panel-per-player while preserving volume warning colors and other low-risk improvements.

### P7 — Weather, Irrigation, and Universal Offline Recovery Context

- Risk: Cached last-known data can appear authoritative when the sensor is actually stale.
- Mitigation: Always label cached readings as last known and suppress LAST ACTIVE for outages shorter than five minutes.
- Rollback: Remove cached-reading display first and keep only gray offline skeleton states.

### P8 — Shell Polish, Accessibility, Motion, and Lower-Risk UX Ideas

- Risk: Motion and shell effects can bloat scope and destabilize performance on kiosks or tablets.
- Mitigation: Treat View Transitions, boot sequence, haptics, and decorative shell effects as feature-detected enhancements behind strict reduced-motion behavior.
- Rollback: Disable the optional shell enhancements while retaining accessibility fixes and climate-range correctness.

### P9 — Security Hardening and Explicit No-Code Dispositions

- Risk: Dependency updates can break the bundle; schema tightening can reject blueprints users previously relied on.
- Mitigation: Update tooling selectively, verify webpack build immediately, and make validation errors explicit and actionable.
- Rollback: Revert dependency upgrades independently from the backend validation changes.

Make it so.