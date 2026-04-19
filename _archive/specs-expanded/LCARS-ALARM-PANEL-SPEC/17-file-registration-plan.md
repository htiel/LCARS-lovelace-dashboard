## 16. File Registration Plan

| Component Tag               | File                         | Purpose                            |
|-----------------------------|------------------------------|------------------------------------|
| `lcars-alarm-panel`         | `lcars-alarm-panel.js`       | Full alarm panel component         |

Extends `LcarsDevicePanelBase`:
- `panelFrameColor` → Dynamic via `getAlarmStateColor(state)`
- `mediaAspectRatio` → `'1 / 1'`
- `_isPrimaryDomain(domain)` → `domain === 'alarm_control_panel'`
- `_renderMedia()` → renders the SVG shield icon / countdown display + mode strip

Contains:
- `AlarmCodeHandler` class (internal, not exported)
- `AlarmCountdown` class (internal, not exported)
- Keypad component rendered inline (not a separate custom element — the keypad is tightly coupled to the alarm panel's state machine and doesn't exist independently)

---
