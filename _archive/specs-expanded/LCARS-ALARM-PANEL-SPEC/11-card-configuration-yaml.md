## 10. Card Configuration (YAML)

```yaml
type: custom:lcars-alarm-panel
entity: alarm_control_panel.simplisafe
name: SIMPLISAFE                                # Optional — overrides friendly_name
# Countdown timers (not exposed by all integrations)
exit_delay: 60                                  # seconds — arming countdown (clamped to 1–300)
entry_delay: 30                                 # seconds — pending countdown (clamped to 1–300)
# Zone sensors (auto-discovered from device, or explicit list)
zones:
  - binary_sensor.simplisafe_front_door
  - binary_sensor.simplisafe_back_door
  - binary_sensor.simplisafe_hallway_motion
  - binary_sensor.simplisafe_glass_break
# States shown in mode strip (auto-discovered from supported_features, or explicit)
states:
  - armed_home
  - armed_away
# Theme overrides (optional)
theme_overrides:
  disarmed_color: var(--lcars-ice)
  armed_color: var(--lcars-butterscotch)
  triggered_color: var(--lcars-tomato)
```

---
