## 15. Team Review Flags

- **Geordi La Forge**: Review frame color assignment (`--lcars-african-violet` for media/entertainment) and verify it doesn't clash with existing panel color map. Confirm viewscreen corner bracket pattern reuse. Validate idle state design meets LCARS aesthetic standards.
- **Worf**: Review `entity_picture` URL handling — album art URLs come from the HA backend and are proxied through `/api/media_player_proxy/`. No external URLs should be rendered directly. Verify that the source selector popup doesn't introduce XSS risk from `source_list` values (all values must be text-only, rendered as textContent not innerHTML).

---

*"What if we piped the audio visualization data from the media player into the viewscreen border? Imagine the frame pulsing gently with the beat — like the warp core thrumming with power. I could prototype it with the Web Audio API and CSS custom properties... but I should probably check with Geordi first."*  
— Wesley Crusher, Deck 10

---
