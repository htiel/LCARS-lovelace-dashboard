## 8. Audio Grammar

LCARS has a formalized audio language. Each sound has a specific semantic meaning.

| Event                      | Sound                        | Trigger                                    |
|----------------------------|------------------------------|--------------------------------------------|
| Button press               | `TactileInputAcknowledge`    | Any button tap/click                       |
| View navigation            | `TactileInputAlternateAcknowledge` | Nav button → view change (like pressing Enter) |
| Action denied/disabled     | `TactileInputNegativeAcknowledge`  | Tap on disabled button or unauthorized action  |
| Popup open                 | `TactileInputAcknowledge`    | Modal appearing                            |
| Error notification         | `Alert`                      | Error toast / warning notification         |
| Critical system alert      | `RedAlert`                   | HA system-level failure                    |
| Dashboard loaded           | `Ready`                      | Initial page load complete                 |

### Implementation Approach

```javascript
// Audio files stored as small base64 WAV or loaded from /local/lcars-audio/
const LCARS_AUDIO = {
  acknowledge: new Audio('/local/lcars-audio/input_ok.mp3'),
  alternateAcknowledge: new Audio('/local/lcars-audio/input_enter.mp3'),
  negativeAcknowledge: new Audio('/local/lcars-audio/input_deny.mp3'),
  alert: new Audio('/local/lcars-audio/alert.mp3'),
  redAlert: new Audio('/local/lcars-audio/red_alert.mp3'),
  ready: new Audio('/local/lcars-audio/ready.mp3'),
};

// Play with catch — browsers may block autoplay
function lcarsSound(name) {
  const audio = LCARS_AUDIO[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});  // Silently fail if autoplay blocked
  }
}
```

**Note**: Audio should respect `prefers-reduced-motion` — if reduced motion is preferred, disable non-critical sounds (keep only `Alert` and `RedAlert`).

---
