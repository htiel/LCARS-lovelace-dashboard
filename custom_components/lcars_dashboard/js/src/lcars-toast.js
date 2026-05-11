/**
 * lcars-toast.js — Minimal accessible toast for WS error feedback (#216).
 *
 * Exports `showErrorToast(err, fallback)` which maps backend WS error codes
 * from `_safe_json_loads` and friends to LCARS-styled, screen-reader-friendly
 * messages. Toasts are appended to a body-level container with
 * `role="alert" aria-live="assertive"` so screen readers announce them
 * without stealing focus.
 *
 * Audio cue is intentionally optional: callers that want the
 * `negativeAcknowledge` cue should play it themselves so silent contexts
 * (page just loaded, audio muted) do not double-announce.
 */

const ERROR_COPY = {
  invalid_format: 'Request was missing required data.',
  payload_too_large: 'That change is too large to save.',
  invalid_json: 'The dashboard could not parse that data.',
  payload_too_deep: 'That configuration is nested too deeply.',
  invalid_card: 'Card data is missing a type.',
  invalid_card_type: 'Card type is invalid.',
  invalid_yaml: 'Blueprint YAML is malformed.',
  invalid_blueprint: 'Blueprint is incomplete or invalid.',
};

const CONTAINER_ID = 'lcars-toast-container';
const DEFAULT_TIMEOUT_MS = 8000;

function ensureContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = CONTAINER_ID;
  // Per-toast ARIA so adding a new toast does not re-announce earlier ones (Geordi #5).
  // Container is a positioning wrapper only.
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    pointerEvents: 'none',
  });
  document.body.appendChild(el);
  return el;
}

function buildToast(message, onDismiss) {
  const t = document.createElement('div');
  t.setAttribute('class', 'lcars-toast');
  // Per-toast live region: role=alert implies assertive; aria-atomic keeps the
  // announcement bounded to this toast only (WCAG 4.1.3).
  t.setAttribute('role', 'alert');
  t.setAttribute('aria-atomic', 'true');
  Object.assign(t.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--lcars-tomato, #ff5555)',
    color: 'var(--lcars-black, #000)',
    fontFamily: 'var(--lcars-font, "Antonio", sans-serif)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0.625rem 1rem',
    borderRadius: 'var(--lcars-btn-radius, 1rem) 0 0 var(--lcars-btn-radius, 1rem)',
    minWidth: '14rem',
    maxWidth: '24rem',
    pointerEvents: 'auto',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  });

  const text = document.createElement('span');
  text.style.flex = '1';
  text.textContent = message;
  t.appendChild(text);

  // Close button — satisfies WCAG 2.2.1 (Timing Adjustable) by giving every user a
  // way to dismiss the toast independent of the auto-timer.
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = '×';
  Object.assign(close.style, {
    background: 'transparent',
    color: 'inherit',
    border: '0',
    cursor: 'pointer',
    fontSize: '1.25rem',
    lineHeight: '1',
    padding: '0 0.25rem',
    minWidth: '1.5rem',
    minHeight: '1.5rem',
  });
  close.addEventListener('click', () => onDismiss());
  t.appendChild(close);

  return t;
}

export function mapErrorCode(code, fallback) {
  if (code && Object.prototype.hasOwnProperty.call(ERROR_COPY, code)) {
    return ERROR_COPY[code];
  }
  return fallback || 'The dashboard could not complete that request.';
}

/**
 * Display an LCARS toast for a WS error.
 * @param {unknown} err - The error thrown by hass.callWS (typically has `.code` and `.message`).
 * @param {string} [fallback] - Optional fallback copy if the error has no recognized code.
 */
export function showErrorToast(err, fallback) {
  // hass.callWS rejects with {code, message} objects; tolerate plain Error too.
  const code = err && typeof err === 'object' ? err.code : undefined;
  const detail = err && typeof err === 'object' ? err.message : String(err);
  const message = mapErrorCode(code, fallback || detail);
  const container = ensureContainer();

  let timer = null;
  const dismiss = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (toast.parentNode === container) container.removeChild(toast);
  };
  const toast = buildToast(message, dismiss);
  container.appendChild(toast);

  // Pause auto-dismiss while pointer or focus is on the toast (WCAG 2.2.1 — pause/extend).
  const start = () => { timer = setTimeout(dismiss, DEFAULT_TIMEOUT_MS); };
  const stop = () => { if (timer) { clearTimeout(timer); timer = null; } };
  toast.addEventListener('mouseenter', stop);
  toast.addEventListener('mouseleave', start);
  toast.addEventListener('focusin', stop);
  toast.addEventListener('focusout', start);
  start();
}
