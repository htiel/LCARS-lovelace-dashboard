## 20. Team Review Flags

- **Geordi Review Required**: Temperature arc SVG design, dynamic frame color shifting, dual-setpoint layout, mode button strip layout. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required**: `hass.callService()` calls for `set_temperature`, `set_hvac_mode`, `set_fan_mode`, `set_preset_mode` — all state-changing service calls must be reviewed for proper authorization and input validation. Setpoint clamping logic (§5.2) should be verified to prevent out-of-range values.

---

*"Environmental Control is one of those systems you never think about — until it stops working. A good panel is the same way. It gives you what you need, instantly, and gets out of the way."*  
— La Forge, Environmental Substations, Deck 12

---
