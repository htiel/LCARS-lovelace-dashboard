## 20. Implementation Notes

### File Location

```
custom_components/lcars_dashboard/js/src/lcars-internal-sensors-grid.js
```

### Dependencies

- `lit-element` v2 / `lit-html` v1 (existing project dependency)
- No additional npm packages required
- Sparkline generation is self-contained (no charting library)
- Uses `hass.callWS()` and `hass.callApi()` — standard HA frontend API

### Testing Scenarios

| Scenario                        | Expected Behavior                                  |
|---------------------------------|----------------------------------------------------|
| Normal: all 14 meters online    | Full grid, 2 floor groups, color-coded tiles       |
| 1 meter offline                 | Gray tile at end of floor group, "OFFLINE" overlay |
| All meters offline              | All gray, summary shows "0 SENSORS ONLINE"         |
| No SwitchBot meters in HA       | Empty state with diagnostic message                |
| New meter added to HA           | Auto-discovered on next card refresh               |
| Battery drops below 20%         | Red pulsing dot appears on tile                    |
| Temperature crosses threshold   | Smooth 1s border color transition                  |
| Appliance meters enabled        | Dashed-border tiles, excluded from averages        |
| Humidity > 70%                  | Humidity text turns tomato, aria-label updated     |
| Mobile viewport                 | Single-column list, sparklines hidden              |
| Reduced motion preference       | No animations, static battery dot, instant colors  |

---
