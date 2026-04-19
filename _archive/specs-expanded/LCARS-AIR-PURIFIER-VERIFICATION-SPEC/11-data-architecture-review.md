## Data — Architecture Review

**Reviewer**: Data (Project Architect & Performance Engineer)  
**Date**: Stardate 2026.04.13  
**Assessment**: SOUND

### Component Architecture
- This is not a new component — it is a verification report confirming the existing atmoscrubber panel's compatibility with BlueAir devices. The architectural analysis is thorough and correct. The entity-driven detection heuristic (`aqSignals >= 2 && hasFan → PANEL_TYPE_ENVIRONMENT`) is validated against the BlueAir entity inventory. No false-positive or false-negative detection paths exist.
- The gap analysis (§3) correctly identifies 6 potential issues and properly assesses their severity. The filter life `device_class: battery` misrouting (§3.1) is a real upstream quirk — the recommended regex-based workaround (`/filter|wick/i.test(entry.entity.entity_id)`) is pragmatic but fragile. I concur with the "wait for upstream fix" recommendation.
- The `light` domain routing gap (§3.3) is a legitimate finding. Adding `light` to the environment controls partition is a 1-line change with low regression risk, since `_handleToggle()` uses `homeassistant.toggle` which supports the `light` domain.

### Performance Considerations
- No new code is introduced. Zero bundle impact.
- The BlueAir device exposes more sensors than VeSync (7 vs 1 primary AQ sensor), which results in a taller sensor column and 4 sparklines instead of 1. The additional sparkline history fetches (4 × `fetchSensorHistory()`) add 4 more `callApi('GET', 'history/period/...')` calls every 5 minutes. At ~50ms per call, this adds ~200ms of async I/O cost per refresh cycle. Negligible in practice.

### HA Integration Patterns
- The BlueAir integration (`ha_blueair`) uses standard HA entity patterns: `fan` domain for control, `SensorDeviceClass.*` for air quality, `switch` for child lock and germ shield. All align with the atmoscrubber's entity partition logic. No integration-specific service calls are needed — `fan.toggle`, `fan.set_preset_mode`, `switch.toggle` are all standard HA services. This is the ideal integration pattern.
- The PM2.5 → AQI fallback (`pm25Val * 4`) is acknowledged as a linear approximation. The spec correctly notes divergence at higher concentrations. The EPA piecewise conversion (§4.1) is 15 lines, well-validated, and would improve accuracy. However, for indoor air quality monitoring with PM2.5 typically in the 0-50 µg/m³ range, the linear approximation error is < 4 AQI points. Implement only if users report misleading colors.

### Code Quality & Reusability
- The verification methodology is exemplary. Testing every feature against both integrations, documenting expected behavior, and providing a testing checklist (§7) demonstrates engineering rigor. This is the model for future integration compatibility reports.
- The CO₂ threshold coloring recommendation (§4.2) is a 7-line addition that benefits any device with a CO₂ sensor (BlueAir, SwitchBot WoTHPc). This should be implemented — it was specced in the original atmoscrubber doc but remains unimplemented.

### Recommendations
1. **P1**: Implement CO₂ threshold coloring (§4.2). 7 lines of code, benefits multiple integrations, already specced.
2. **P2**: Add `light` to environment controls routing (§3.3). 1 line of code. Validate with Geordi that `light` entities in the environment panel control column don't create false positives for other device types.
3. **P3**: Defer EPA-accurate PM2.5→AQI conversion (§4.1) unless users report alarmist colors. The current approximation is sufficient for typical indoor readings.
4. **SKIP**: Filter expired binary sensor alert (§4.3). Concur with spec's assessment — filter % at 0 is sufficient. The 20-line complexity is not justified.

---
