## 16. Team Review Flags

- **Geordi Review Required**: Zone grid row layout, fill bar visual design, expanded attribute sub-row, standby button placement. All visual design elements need Geordi's sign-off for LCARS compliance before implementation.
- **Worf Review Required**: `hass.callService()` calls for `switch.turn_on` / `switch.turn_off` (zone start/stop and standby toggle) — all state-changing service calls must be reviewed for proper authorization and input validation. Confirm that starting a zone doesn't allow arbitrary duration injection via attributes.

---

*"The arboretum is the most underappreciated system on the ship. It runs itself — water schedules, nutrient delivery, light cycles — all automated. But someone still has to check the panel once in a while to make sure the Andorian orchids aren't drowning the Vulcan succulents."*  
— Keiko O'Brien, Ship's Botanist, USS Enterprise-D

---
