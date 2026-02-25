import logger from './logger.js';

const QUOTA_LIMIT = 15000; // units per minute
const WINDOW_MS = 60_000;

class QuotaTracker {
  constructor() {
    this.entries = []; // { timestamp, units }
  }

  /** Record units consumed */
  record(units) {
    this.entries.push({ timestamp: Date.now(), units });
    this._prune();
  }

  /** Get units consumed in current window */
  used() {
    this._prune();
    return this.entries.reduce((sum, e) => sum + e.units, 0);
  }

  /** Get remaining units in current window */
  remaining() {
    return Math.max(0, QUOTA_LIMIT - this.used());
  }

  /** How long to wait before `units` are available (ms), 0 if available now */
  waitTime(units) {
    this._prune();
    const used = this.used();
    if (used + units <= QUOTA_LIMIT) return 0;

    // Find when enough entries expire to free up space
    const sorted = [...this.entries].sort((a, b) => a.timestamp - b.timestamp);
    let freed = 0;
    for (const entry of sorted) {
      freed += entry.units;
      if (used - freed + units <= QUOTA_LIMIT) {
        return entry.timestamp + WINDOW_MS - Date.now();
      }
    }
    return WINDOW_MS; // worst case
  }

  /** Wait until `units` quota is available */
  async waitForQuota(units) {
    const wait = this.waitTime(units);
    if (wait > 0) {
      logger.info({ wait, units }, 'Quota throttle: waiting');
      await new Promise((resolve) => setTimeout(resolve, wait + 100));
    }
  }

  _prune() {
    const cutoff = Date.now() - WINDOW_MS;
    this.entries = this.entries.filter((e) => e.timestamp > cutoff);
  }
}

export default new QuotaTracker();
