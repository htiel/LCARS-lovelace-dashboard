/**
 * LCARS Helpers — Shared utility functions for accessing HA internals
 * Extracted from compiled bundle's card-tools patterns
 */

/**
 * LCARS Logger — structured console logging with component prefixes.
 * Respects a global debug flag: set window.__LCARS_DEBUG = true in
 * browser console to enable verbose debug output.
 */
export const lcarsLog = {
  _prefix: (tag) => `%c[LCARS ${tag}]`,
  _style: 'color: #f1b864; font-weight: bold',
  debug: (tag, ...args) => {
    if (window.__LCARS_DEBUG) console.debug(lcarsLog._prefix(tag), lcarsLog._style, ...args);
  },
  info: (tag, ...args) => console.info(lcarsLog._prefix(tag), lcarsLog._style, ...args),
  warn: (tag, ...args) => console.warn(lcarsLog._prefix(tag), lcarsLog._style, ...args),
  error: (tag, ...args) => console.error(lcarsLog._prefix(tag), lcarsLog._style, ...args),
};

/**
 * Private event bus for LCARS inter-component communication.
 * Uses a dedicated EventTarget instead of window to prevent
 * event injection from other cards or extensions.
 */
export const lcarsEventBus = new EventTarget();

/**
 * Get the hass object from the DOM
 */
export function getHass() {
  const hcMain = document.querySelector('hc-main');
  if (hcMain) return hcMain.hass;
  const ha = document.querySelector('home-assistant');
  if (ha) return ha.hass;
  return undefined;
}

/**
 * Register an element to receive hass updates
 */
export function provideHass(element) {
  const hcMain = document.querySelector('hc-main');
  if (hcMain) return hcMain.provideHass(element);
  const ha = document.querySelector('home-assistant');
  if (ha) return ha.provideHass(element);
  return undefined;
}

/**
 * Get the current Lovelace view element
 */
export function getLovelace() {
  let root = document.querySelector('hc-main');
  if (root) {
    root = root?.shadowRoot?.querySelector('hc-lovelace')?.shadowRoot;
    return root?.querySelector('hui-view') || root?.querySelector('hui-panel-view');
  }
  root = document.querySelector('home-assistant');
  root = root?.shadowRoot?.querySelector('home-assistant-main')?.shadowRoot;
  root = root?.querySelector('app-drawer-layout partial-panel-resolver');
  root = root?.shadowRoot || root;
  root = root?.querySelector('ha-panel-lovelace')?.shadowRoot;
  root = root?.querySelector('hui-root')?.shadowRoot;
  root = root?.querySelector('ha-app-layout')?.querySelector('#view');
  return root?.firstElementChild;
}

/**
 * Fire a custom event on the HA root
 */
export function fireEvent(type, detail = {}, target = null) {
  const event = new Event(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
  });
  event.detail = detail;
  if (target) {
    target.dispatchEvent(event);
  } else {
    const root = getLovelace();
    if (root) root.dispatchEvent(event);
  }
}

/**
 * Navigate within HA
 */
export function navigate(path, replace = false) {
  if (replace) {
    history.replaceState(null, '', path);
  } else {
    history.pushState(null, '', path);
  }
  fireEvent('location-changed', { replace }, window);
}

/**
 * Open a more-info dialog for an entity
 */
export function showMoreInfo(entityId) {
  const root = document.querySelector('hc-main') || document.querySelector('home-assistant');
  fireEvent('hass-more-info', { entityId }, root);
}

/**
 * Ensure Lovelace helpers are loaded (for createCardElement)
 */
export async function ensureLovelaceLoaded() {
  if (customElements.get('hui-view')) return true;
  await customElements.whenDefined('partial-panel-resolver');
  const el = document.createElement('partial-panel-resolver');
  el.hass = { panels: [{ url_path: 'tmp', component_name: 'lovelace' }] };
  el._updateRoutes();
  await el.routerOptions.routes.tmp.load();
  if (!customElements.get('ha-panel-lovelace')) return false;
  const panel = document.createElement('ha-panel-lovelace');
  panel.hass = getHass();
  if (panel.hass === undefined) {
    await new Promise((resolve) => {
      window.addEventListener('connection-status', () => resolve(), { once: true });
    });
    panel.hass = getHass();
  }
  panel.panel = { config: { mode: null } };
  panel._fetchConfig();
  return true;
}

/**
 * Create a Lovelace card element from config.
 * Works with modern HA (2024.8+) where window.loadCardHelpers was removed.
 */
export async function createCardElement(cardConfig) {
  // Try modern approach: direct custom element creation
  const tag = cardConfig.type?.startsWith('custom:')
    ? cardConfig.type.slice(7)
    : `hui-${cardConfig.type}-card`;

  // Ensure the element is defined
  if (!customElements.get(tag)) {
    await ensureLovelaceLoaded();
    // Wait a bit for dynamic imports
    await new Promise((r) => setTimeout(r, 100));
  }

  // Try window.loadCardHelpers first (older HA)
  if (typeof window.loadCardHelpers === 'function') {
    try {
      const helpers = await window.loadCardHelpers();
      const card = await helpers.createCardElement(cardConfig);
      return card;
    } catch (_) { /* fall through */ }
  }

  // Modern fallback: create the element directly
  const el = document.createElement(tag);
  if (el.setConfig) {
    el.setConfig(cardConfig);
  }
  return el;
}
