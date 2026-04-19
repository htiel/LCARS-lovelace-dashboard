## 0. Design Philosophy

The Irrigation Panel is modeled after the Enterprise-D **Arboretum's automated irrigation substations** — Deck 17, where the ship's botanical garden maintains hundreds of plant species from dozens of worlds, each with unique water requirements. The arboretum's LCARS console displays a grid of growing zones, each tagged with its hydration status, soil composition, and irrigation schedule. A botanist glances at the panel and knows: which zones are being watered right now, when the next cycle runs, and whether weather conditions have triggered a skip.

On a starship, water is a carefully managed resource. On a homeowner's property, it's the same — water distribution across multiple zones, each with different soil, slope, shade, and nozzle characteristics. The panel reflects this as a **sector grid** — a compact list of zones, each a row showing status and controls, plus a summary header with schedule and rain-skip intelligence.

This is a **simple, utilitarian panel**. Unlike pool chemistry (dozens of sensors, dual climate entities, lighting modes) or media (transport controls, artwork), irrigation is fundamentally: zones on/off, schedule info, rain delay. The design reflects that simplicity.

Per Roddenberry: **the ship takes care of you**. Rachio's Weather Intelligence handles skip logic automatically. The panel shows the operator what's happening and lets them intervene — start a zone manually, stop a running zone, toggle standby — without complexity.

Per Bracer Jack: **empty space is beautiful**. The zone grid breathes. Each row is a single line of status. No progress bars, no 3D pipes, no water droplet animations. The active zone gets an animated fill bar for time remaining — everything else is static text on black.

---
