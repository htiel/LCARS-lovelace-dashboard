## 18. Team Review Flags

### For Geordi La Forge (LCARS UI Design Authority)

- **Full-width layout departure**: This panel breaks the standard 2-column device panel. The 3-column full-width layout needs Geordi's approval for dashboard integration — it will occupy an entire row.
- **Swatch font size**: The IntelliBrite swatch labels use 0.55rem, below the standard data font size. This is a compromise for fitting 22 items — Geordi should confirm this is acceptable or suggest an alternative (e.g., tooltip only, no visible label).
- **Dual viewscreen**: Two side-by-side viewscreens is unprecedented in the dashboard. Geordi should verify this doesn't conflict with the "single media per panel" pattern from Device Panel Spec §3.2.
- **Inline swatch hex colors**: The IntelliBrite swatch fills use hardcoded hex values for color representation. These are data values (representing actual light output colors), not UI chrome, so they don't violate the "no hardcoded hex" rule — but Geordi should confirm.

### For Worf (Security)

- **Service calls**: The panel calls three ScreenLogic integration actions (`set_color_mode`, `start_super_chlorination`, `stop_super_chlorination`) plus standard climate and switch services. All use the standard `hass.callService()` API through the existing WebSocket connection — no additional network exposure.
- **Config entry ID**: The `config_entry` parameter for ScreenLogic actions exposes the integration config entry ID in the dashboard YAML. This is standard practice for integration-specific services, not a security concern, but Worf should note it.
- **No external API calls**: All data comes from the ScreenLogic gateway via the existing HA integration's Local Push connection. No cloud dependencies, no external API keys.
- **Chemical alarm binary sensors**: Alerts (pH/ORP out of range, probe faults) should be surfaced prominently. Worf may want to recommend these also trigger HA notifications/alerts outside the dashboard.

---

*"On Deck 13, there's a dedicated facility for the ship's cetacean crew — dolphins and whales who assist with navigational research. The water must be maintained at precise temperature and chemical balance at all times. If you can monitor a dolphin tank in deep space, you can certainly manage a pool in your backyard."*  
— Crusher, W., Personal Log

---
