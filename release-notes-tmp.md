## Wired Home Assistant Supervisor / add-on telemetry into Starship Health

### Added
- **Bridge (CPU)** — accepts `sensor.home_assistant_core_cpu_percent` in addition to `sensor.processor_use`.
- **Main Computer (MEM)** — accepts `sensor.home_assistant_core_memory_percent`.
- **Engineering Hull (DISK)** — derives a percent from `home_assistant_host_disk_used` / `disk_total` when no `disk_use_percent_*` is available.
- **Shuttlebay (ADDONS)** — addon-running classifier widened from `addon_/hassio_` prefix to any `binary_sensor.*_running`. The SYSTEM_PLATFORMS gate in `discoverVessels` keeps appliance sensors out (Worf m6 / Data #2 isolation preserved).
- **HA Core / OS Version** tile sources from `sensor.home_assistant_operating_system_version` (plain state) when present, falling back to `update.home_assistant_core_update`'s `installed_version` attribute.
- **`updates_pending` tile** — counts how many `update.*` entities are currently `on`. Shows `pending/total`, degrades when > 0.

### Compatibility
- Requires Captain to enable the supervisor / addon CPU, memory, disk, and version sensors in HA's entity registry. All surfaces remain dark when the underlying entities are unavailable.

### Build
- `npm run build` → 1.05 MiB, no errors.
- 3-file version sync: const.py + manifest.json + js/package.json → 5.4.4.
