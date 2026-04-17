## 0. Problem Statement

The current implementation creates **one `_renderPowerPanel(group)` call per power device** in an area. Each device becomes a separate right-column panel with its own header, frame, sections, and vertical footprint.

**Evidence** (from Admiral's mockups):

- **Office area**: A single "Dog Heating Pad" smart plug gets an entire "POWER SYSTEMS" panel in the right column — just for one toggle + 6W readout.
- **Server Room area**: 2 power strips + 6 Emporia Vue circuits = **8 separate "POWER SYSTEMS" panels**, each with full frame chrome, stacked in a 2-column grid. This consumes ~4 screens of vertical scroll.

**Root cause** in code: `_renderAreaContent()` iterates `byDevice` groups, classifies each as `PANEL_TYPE_POWER`, and pushes each into `panelDevices[]`. The template then maps over `panelDevices` calling `_renderDevicePanel()` → `_renderPowerPanel(group)` once per device.

**Required outcome**: All power devices in an area are aggregated into **one consolidated power panel**, rendered in the **left content flow** (bottom of the normal device stack), not in the right panel column.

---
