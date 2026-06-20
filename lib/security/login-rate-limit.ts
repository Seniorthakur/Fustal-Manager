import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

type LoginAttempt = {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number;
};

const attempts = new Map<string, LoginAttempt>();

function currentState(key: string) {
  const now = Date.now();
  const existing = attempts.get(key);
  if (!existing || now - existing.windowStartedAt > WINDOW_MS) {
    const fresh = { failures: 0, windowStartedAt: now, lockedUntil: 0 };
    attempts.set(key, fresh);
    return fresh;
  }
  return existing;
}

export function isLoginLocked(key: string) {
  const state = currentState(key);
  return state.lockedUntil > Date.now();
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const state = currentState(key);
  state.failures += 1;
  if (state.failures >= MAX_FAILURES) {
    state.lockedUntil = now + LOCK_MS;
    state.failures = 0;
    state.windowStartedAt = now;
  }
  attempts.set(key, state);
}

export function recordLoginSuccess(key: string) {
  attempts.delete(key);
}
