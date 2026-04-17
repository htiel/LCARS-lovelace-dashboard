## 2. Home Assistant Frontend Patterns — Research Findings

**Source**: [home-assistant/frontend](https://github.com/home-assistant/frontend), [HA custom card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/lovelace-custom-card)

### 2.1 HA Core Card Architecture

Every HA Lovelace card follows the same pattern:

```
@customElement("hui-{type}-card")
class Hui{Type}Card extends LitElement implements LovelaceCard {
  hass: HomeAssistant;
  setConfig(config): void;
  getCardSize(): number;
  getGridOptions(): GridOptions;
  render(): TemplateResult;
  static get styles(): CSSResultGroup;
}
```

Key observations from the codebase:
- **One custom element per card type** — no shared base class for cards (they're all independent)
- **Mixins used selectively**: `SubscribeMixin(LitElement)` for cards needing websocket subscriptions, `MobileAwareMixin(LitElement)` for responsive cards, `ConditionalListenerMixin` for visibility
- **Shared styles imported as modules**: `tileCardStyle`, `iconColorCSS` imported and spread into style arrays
- **No card-level lazy loading** — all card types bundled together, registered at module load time

### 2.2 Custom Element Registration Constraints

HA custom cards are registered via:

```js
customElements.define("lcars-climate-panel", LcarsClimatePanel);
```

**Critical constraint**: `customElements.define()` can only be called ONCE per tag name per page. If two bundles try to register the same tag, the second throws. This is fine for us — all panels are in one bundle.

**Multiple elements from one bundle**: Yes, absolutely supported. HA loads one JS file via `add_extra_js_url()`, and that file can call `customElements.define()` as many times as needed. Mushroom registers 20+ card types from a single bundle.

**`window.customCards` registration**: Only needed if the element should appear in HA's card picker dialog. LCARS panels are NOT standalone Lovelace cards — they're sub-components used by `lcars-homepage-card`. They do NOT need `window.customCards` registration.

### 2.3 Mushroom Architecture (Exemplary Multi-Card HACS Project)

**Source**: [piitaya/lovelace-mushroom](https://github.com/piitaya/lovelace-mushroom)

Mushroom is the gold standard for multi-card HACS architecture. Here is its class hierarchy:

```
LitElement
  └── MushroomBaseElement         (hass property, dark-mode, base CSS variables)
        ├── MushroomBaseCard<T,E> (config, setConfig, getCardSize, getGridOptions,
        │                          renderIcon, renderBadge, renderStateInfo, renderPicture)
        │     ├── LightCard       (extends MushroomBaseCard<LightCardConfig, LightEntity>)
        │     ├── FanCard         (extends MushroomBaseCard<FanCardConfig>)
        │     ├── LockCard        (extends MushroomBaseCard<LockCardConfig, LockEntity>)
        │     ├── ClimateCard     ...
        │     └── ... (15 more)
        └── [standalone cards]    (TemplateCard, TitleCard — extend MushroomBaseElement directly)
```

**File structure per card**:
```
cards/
  light-card/
    light-card.ts         (~350 lines: class + render + styles)
    light-card-config.ts  (config type + validation struct)
    light-card-editor.ts  (visual editor)
    const.ts              (card name, domains)
    controls/             (card-specific sub-components)
      light-brightness-control.ts
      light-color-temp-control.ts
```

**CSS pattern** (identical across all cards):
```ts
static get styles(): CSSResultGroup {
  return [
    super.styles,      // from MushroomBaseElement: CSS variables, animations
    cardStyle,         // from utils/card-styles.ts: shared layout CSS
    css`/* card-specific */`
  ];
}
```

**Shared UI sub-components** (each a registered custom element):
- `mushroom-card` — card wrapper with layout handling
- `mushroom-state-item` — icon + info layout
- `mushroom-shape-icon` — icon badge with shape background
- `mushroom-badge-icon` — status badge overlay
- `mushroom-state-info` — primary/secondary text display
- `mushroom-slider` — generic slider control
- `mushroom-button` — action button

**Key insight**: Mushroom's shared components are NOT panel renderers — they're small, focused UI primitives. The card-specific rendering logic lives entirely in the card file. This is the correct granularity.

---
