## 13. Open Questions for Wesley

1. **Doughnut/bar chart option**: The backlog mentions visualization options (bar charts, doughnut charts). Should we include an optional aggregate chart in the summary section? If yes, it would be an inline SVG (no library) keeping with the flat LCARS aesthetic — a segmented ring showing top-5 circuits by consumption.

2. **Power flow animation**: Wesley's reference cards (power-flow-card-plus, sankey-chart) suggest animated flow arrows. Should we include a simplified EPS conduit flow view as an alternative summary visualization? This would be scope creep for v4.15.0 — recommend deferring to v4.16.0 or later.

3. **Configurable thresholds**: The 500/1500/3000W tier boundaries work for US residential. Should we expose these as config options for users with different electrical systems (EU 230V, commercial, etc.)?

4. **ESP32 reflash note**: The backlog mentions Emporia Vue → ESPHome reflash. Should the panel detect ESPHome-flashed Vues and display differently (e.g., show local vs cloud indicator)?

---
