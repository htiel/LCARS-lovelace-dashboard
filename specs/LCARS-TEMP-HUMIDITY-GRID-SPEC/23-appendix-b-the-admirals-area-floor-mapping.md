## Appendix B: The Admiral's Area → Floor Mapping

From `core.area_registry` and `core.floor_registry`:

### Main Floor (`floor_id: "main"`, level: 1)

| Area ID           | Area Name          | Has SwitchBot Meter |
|-------------------|--------------------|---------------------|
| `front_yard`      | Front Yard         | No                  |
| `entrance`        | Entrance           | No                  |
| `garage`          | Garage             | Yes (+ Garage Fridge) |
| `downstairs_hallway` | Downstairs Hallway | No               |
| `server_room`     | Server Room        | No (utility closet?) |
| `kitchen`         | Kitchen            | Yes (Fridge + Freezer only) |
| `living_room`     | Living Room        | Yes                 |
| `dinning_room`    | Dinning Room       | No                  |
| `master_bedroom`  | Master Bedroom     | Yes                 |
| `back_yard`       | Back Yard          | No                  |

### Upstairs (`floor_id: "upstairs"`, level: 2)

| Area ID             | Area Name          | Has SwitchBot Meter |
|---------------------|--------------------|---------------------|
| `game_room`         | Game Room          | No                  |
| `office`            | Office             | Yes                 |
| `boimler_s_room`    | Boimler's Room     | No                  |
| `mariner_s_room`    | Mariner's Room     | No                  |
| `upstairs_bathroom` | Upstairs Bathroom  | No                  |

> **Note**: The Admiral's device registry uses different area_id values than the static reference registry (e.g., `the_office` vs `office`, `boimler` vs a child's room, `rutherford` vs command quarters). The auto-discovery algorithm resolves names from whichever area registry is live, so these mappings are always current.

---
