/**
 * Shared limits for the contact endpoint.
 *
 * Kept in a separate module: the Worker entrypoint may only export the
 * `default` handler (plus function handlers), so plain values cannot be
 * exported from worker/index.js without breaking the Workers runtime.
 */

export const MAX = Object.freeze({
  name: 120,
  email: 254,
  company: 160,
  budget: 80,
  message: 5000,
});

/** Hard cap for request bodies (32 KB) to avoid parsing oversized payloads. */
export const MAX_BODY_BYTES = 32 * 1024;

export const RATE_LIMIT = Object.freeze({ limit: 5, windowMs: 10 * 60 * 1000 });
