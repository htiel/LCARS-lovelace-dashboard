/**
 * LCARS Dashboard Main JS — Entry point registered by HA
 * Imports shared helpers used by all components
 */
import { getLovelace, getHass, lcarsLog } from './lcars-helpers.js';

lcarsLog.info('Bundle', 'JS bundle loaded at', new Date().toISOString());
