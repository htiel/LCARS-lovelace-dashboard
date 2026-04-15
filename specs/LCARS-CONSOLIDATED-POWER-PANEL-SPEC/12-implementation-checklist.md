## 11. Implementation Checklist

1. **`_buildPowerCollection(powerGroups)`** — New method (§1.3)
2. **`_renderConsolidatedPowerPanel(collection)`** — New method (§3.1)
3. **`_renderConsolidatedPowerArc(collection)`** — New method (§3.2)
4. **`_renderClickableValue(entityId, displayHtml)`** — New utility method (§5.2)
5. **Modify `_renderAreaContent()`** — Separate `powerGroups` from `panelDevices` (§1.1), append consolidated panel to `normalContent` (§2.1)
6. **Modify `_renderCircuitTile()`** — Add per-metric click targets (§5.3)
7. **Modify `_renderStripChild()`** — Add per-metric click targets (§6.4)
8. **Add CSS** — `.lcars-consolidated-power-panel` styles (§4), clickable value styles (§5.2), responsive breakpoints (§7.2)
9. **Remove sparklines from circuit tiles** — Move to popover-only (§8.2)
10. **Remove `PANEL_TYPE_POWER` case from `_renderDevicePanel()`** — Power no longer routes through right-column dispatch (§10.1)

---
