## Appendix B: Entity Pattern Reference

### Emporia Vue (VUE003) Entities Per Device

| Entity Pattern | Domain | Device Class | Unit | Example |
|---------------|--------|-------------|------|---------|
| `sensor.*_totalusage_power_minute_average` | sensor | power | W | `sensor.vue_totalusage_power_minute_average` |
| `sensor.*_totalusage_energy_today` | sensor | energy | kWh | `sensor.vue_totalusage_energy_today` |
| `sensor.*_mainsfromgrid_power_minute_average` | sensor | power | W | `sensor.vue_mainsfromgrid_power_minute_average` |
| `sensor.*_mainsfromgrid_energy_today` | sensor | energy | kWh | — |
| `sensor.*_mainstogrid_power_minute_average` | sensor | power | W | — |
| `sensor.*_mainstogrid_energy_today` | sensor | energy | kWh | — |
| `sensor.*_balance_power_minute_average` | sensor | power | W | — |
| `sensor.*_{circuit_name}_power_minute_average` | sensor | power | W | `sensor.vue_kitchen_lights_power_minute_average` |
| `sensor.*_{circuit_name}_energy_today` | sensor | energy | kWh | — |

### TP-Link Kasa (KP115/KP125M/HS110) Entities Per Device

| Entity Pattern | Domain | Device Class | Unit |
|---------------|--------|-------------|------|
| `switch.*` | switch | — | — |
| `sensor.*_current_consumption` | sensor | power | W |
| `sensor.*_total_consumption` | sensor | energy | kWh |
| `sensor.*_today_s_consumption` | sensor | energy | kWh |
| `sensor.*_voltage` | sensor | voltage | V |
| `sensor.*_current` | sensor | current | A |

### TP-Link Kasa Power Strip (HS300) Entities

Parent device + 6 child devices. Each child has the same entity pattern as KP115 above. Parent device may also expose `sensor.*_total_consumption` for aggregate.

---

*Spec authored by Geordi La Forge, LCARS UI Design Authority. All design decisions reference the canonical LCARS sources documented in the Geordi mode instructions. WCAG compliance verified against WCAG 2.2 (W3C Recommendation, October 2023). Color contrast ratios computed per WCAG relative luminance formula.*

---
