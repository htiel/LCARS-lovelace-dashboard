## 9. Device-Specific Adaptations

### Apple TV

| Aspect                  | Apple TV Behavior                                  |
|-------------------------|----------------------------------------------------|
| Artwork                 | High-res album art via `entity_picture`             |
| Sources                 | App list (Netflix, Disney+, etc.) via `source_list` |
| Grouping                | Not typically grouped (video device)                |
| Remote                  | Has a `remote.*` entity — can send commands         |
| Progress                | Full position/duration for video content            |
| Media type              | `video`, `music`, `app` — may vary                  |
| Power                   | Supports turn_on/turn_off                           |

For Apple TV, when `media_content_type` is `video` or `movie`, the viewscreen aspect ratio should widen:

```css
.lcars-media-panel[data-content-type="video"] .media-viewscreen,
.lcars-media-panel[data-content-type="movie"] .media-viewscreen,
.lcars-media-panel[data-content-type="tvshow"] .media-viewscreen {
  aspect-ratio: 16 / 9;
}
```

### HomePod / HomePod Mini

| Aspect                  | HomePod Behavior                                   |
|-------------------------|----------------------------------------------------|
| Artwork                 | Album art when playing Apple Music                  |
| Sources                 | Limited (AirPlay primarily)                         |
| Grouping                | AirPlay 2 multi-room — `group_members` populated   |
| Volume                  | Full volume control, important for speakers         |
| TTS                     | Can receive text-to-speech (future feature)         |
| Progress                | May lack position data for some sources             |

### Sonos

| Aspect                  | Sonos Behavior                                     |
|-------------------------|----------------------------------------------------|
| Artwork                 | Album art for most music services                   |
| Sources                 | Line-in, TV, music services via `source_list`       |
| Grouping                | Sonos native grouping — `group_members` populated   |
| Volume                  | Per-speaker volume even when grouped                |
| Sound modes             | Night mode, speech enhancement via `sound_mode_list`|
| Favorites               | Sonos favorites accessible via `browse_media`       |
| Progress                | Full position/duration                              |

For Sonos when `sound_mode_list` is available, add a sound mode selector to the metadata column:

```javascript
/**
 * Check if this entity has sound mode support.
 */
function hasSoundModes(stateObj) {
  return hasFeature(
    stateObj?.attributes?.supported_features || 0,
    MEDIA_FEATURES.SELECT_SOUND_MODE
  ) && (stateObj?.attributes?.sound_mode_list?.length || 0) > 0;
}
```

---
