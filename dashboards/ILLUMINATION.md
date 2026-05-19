# Illumination Dashboard

> Area-level lighting control spanning full width.

[← Back to README](../README.md) · [Spec: LCARS-ILLUMINATION-DASHBOARD-SPEC.md](../specs/LCARS-ILLUMINATION-DASHBOARD-SPEC.md)

<p align="center">
  <a href="../examples/screenshots/illumination.png"><img src="../examples/screenshots/illumination.png" alt="Illumination dashboard screenshot" width="640"></a>
</p>

## Sidebar Metadata

| Field | Value |
|-------|-------|
| Default sidebar title | **Illumination** |
| Frame color | sunflower |
| Sidebar filters | ALL / LIGHTS / CIRCUITS |
| Enabled by default | No (enable via integration options) |

## What It Shows

Multi-column responsive grid (2–3 lights per row). Full-width brightness bars with color temperature awareness (warm amber to cool white).

- **Effect strip**: 2-column LCARS pill grid for Nanoleaf / Govee / smart light effects — active effect shown in bar value
- **Color presets**: 6 LCARS palette pills (Warm, Cool, Red, Green, Blue, Purple) for HS/RGB color lights
- **Toggle-only lights**: ON/OFF without slider when brightness isn't supported
- **Scene activation strip** and **lighting circuit toggles**
- **Drag-and-drop reorder** in edit mode with FLIP animation

## Entity Detection

- Insteon dimmers/relays (SwitchLinc / LampLinc / ToggleLinc — platform-level detection)
- Infrastructure LED exclusion (UniFi, ESPHome status)
- Device-level dedup

## Integrations

- Any `light` domain entities
- Nanoleaf (Shapes, Canvas)
- Govee (Strip, Bulb)
- Lighting switches (auto-detected by name heuristic)
- Home Assistant scenes
