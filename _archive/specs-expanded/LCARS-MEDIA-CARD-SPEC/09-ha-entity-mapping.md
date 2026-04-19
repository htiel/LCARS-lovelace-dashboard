## 8. HA Entity Mapping

### Target Devices (from the Admiral's HA Instance)

| Device             | Integration    | Key Features                             | Entity Pattern                           |
|--------------------|----------------|------------------------------------------|------------------------------------------|
| Apple TV           | `apple_tv`     | Play/pause, source, artwork, remote      | `media_player.apple_tv_*`                |
| HomePod            | `apple_tv`     | AirPlay, TTS, volume, grouping           | `media_player.homepod_*`                 |
| HomePod Mini       | `apple_tv`     | AirPlay, TTS, volume, grouping           | `media_player.homepod_mini_*`            |
| Sonos              | `sonos`        | Grouping, favorites, queue, volume       | `media_player.sonos_*`                   |
| Generic            | various        | Basic play/pause, volume                 | `media_player.*`                         |

### Entity Attribute Mapping

| Panel Element         | HA Attribute                           | Fallback                  |
|-----------------------|----------------------------------------|---------------------------|
| Track title           | `media_title`                          | "UNKNOWN TRACK"           |
| Artist                | `media_artist`                         | —                         |
| Album                 | `media_album_name`                     | —                         |
| Album art URL         | `entity_picture`                       | Idle placeholder          |
| Media type            | `media_content_type`                   | —                         |
| Source                | `source`                               | —                         |
| Source list            | `source_list`                          | []                        |
| Volume                | `volume_level` (0.0–1.0)              | 0                         |
| Muted                 | `is_volume_muted`                      | false                     |
| Shuffle               | `shuffle`                              | false                     |
| Repeat                | `repeat` (`off`/`all`/`one`)           | `off`                     |
| Position              | `media_position`                       | 0                         |
| Duration              | `media_duration`                       | 0                         |
| Position updated at   | `media_position_updated_at`            | —                         |
| Group members         | `group_members`                        | []                        |
| App name              | `app_name`                             | —                         |
| Sound mode            | `sound_mode`                           | —                         |
| Sound mode list       | `sound_mode_list`                      | []                        |
| Supported features    | `supported_features` (bitmask)         | 0                         |

### Entity Classification Logic

```javascript
/**
 * Classify entities for the media panel.
 * Returns { player, sensors, controls, remotes }.
 */
function classifyMediaEntities(entities) {
  const result = {
    player: null,         // Primary media_player entity
    sensors: [],          // Sensor entities (e.g., connected clients)
    controls: [],         // Switch/select/number entities
    remotes: [],          // Remote entities (Apple TV remote)
  };

  for (const e of entities) {
    const domain = e.entity_id.split('.')[0];
    const cat = e.entity_category || '';

    if (cat === 'diagnostic' || cat === 'config') continue;

    if (domain === 'media_player') {
      result.player = result.player || e;
      continue;
    }

    if (domain === 'remote') {
      result.remotes.push(e);
      continue;
    }

    if (domain === 'sensor' || domain === 'binary_sensor') {
      result.sensors.push(e);
      continue;
    }

    if (domain === 'switch' || domain === 'select' || domain === 'number'
        || domain === 'button') {
      result.controls.push(e);
      continue;
    }
  }

  return result;
}
```

### HA Service Calls

```javascript
/**
 * Service call map for media transport actions.
 */
const MEDIA_ACTIONS = {
  play:          { domain: 'media_player', service: 'media_play' },
  pause:         { domain: 'media_player', service: 'media_pause' },
  stop:          { domain: 'media_player', service: 'media_stop' },
  next_track:    { domain: 'media_player', service: 'media_next_track' },
  previous_track:{ domain: 'media_player', service: 'media_previous_track' },
  volume_set:    { domain: 'media_player', service: 'volume_set' },
  volume_mute:   { domain: 'media_player', service: 'volume_mute' },
  shuffle_set:   { domain: 'media_player', service: 'shuffle_set' },
  repeat_set:    { domain: 'media_player', service: 'repeat_set' },
  select_source: { domain: 'media_player', service: 'select_source' },
  turn_on:       { domain: 'media_player', service: 'turn_on' },
  turn_off:      { domain: 'media_player', service: 'turn_off' },
};

/**
 * Call a media player service.
 */
function callMediaService(hass, entityId, action, data = {}) {
  const def = MEDIA_ACTIONS[action];
  if (!def) return;
  hass.callService(def.domain, def.service, {
    entity_id: entityId,
    ...data,
  });
}
```

---
