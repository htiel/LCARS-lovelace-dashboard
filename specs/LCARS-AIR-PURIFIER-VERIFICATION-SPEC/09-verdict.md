## 8. Verdict

### Compatibility: ✅ COMPATIBLE — No code changes required

The existing atmoscrubber panel handles BlueAir devices **out of the box** because:

1. **Detection** is entity-driven (device classes + domain), not integration-specific
2. **Controls** use the standard `fan` domain service calls (`fan.toggle`, `fan.set_preset_mode`)
3. **Preset modes** render dynamically from entity attributes — no hardcoded mode names
4. **PM2.5 → AQI fallback** is already implemented for the Awair (sensor-only) path
5. **Sensor column** renders any entity with a recognized `device_class` — more sensors = richer panel

### Recommended Follow-ups (Priority Order)

| Priority | Change | Effort | Benefit |
|----------|--------|--------|---------|
| LOW      | Add `light` to environment controls routing (§3.3) | 1 line | BlueAir LED control appears in panel |
| LOW      | Implement CO₂ threshold coloring (§4.2) | 7 lines | Better CO₂ alert visibility (benefits all integrations) |
| LOW      | EPA-accurate PM2.5→AQI conversion (§4.1) | 15 lines | More accurate cylinder color at high PM2.5 |
| SKIP     | Filter expired binary sensor alert (§4.3) | ~20 lines | Marginal — filter % at 0 is sufficient |

### No Type-2A Variant Needed

The Type-2 atmoscrubber handles the BlueAir atmospheric processor as-is. The entity-driven architecture (entity partitioning by device_class and domain, dynamic preset rendering, PM2.5 fallback for AQI) means the panel is already integration-agnostic. BlueAir is actually a *better* data source than VeSync — more sensors, proper device classes, and standard `fan` domain patterns.

*"The best-designed systems are the ones that don't need modification when you plug in new hardware. That's not luck — that's good engineering."*  
— La Forge, Environmental Systems Control

---
