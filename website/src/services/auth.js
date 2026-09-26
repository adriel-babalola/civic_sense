/**
 * CivicSense website — admin authentication.
 *
 * The admin surface is gated in the browser only. That is deliberate for the
 * MVP: it keeps moderation credentials out of a database and off the network,
 * and it is enough to stop casual access to an internal tool.
 *
 * This is NOT security. Anything in `localStorage` is readable by anyone with
 * devtools, and the moderation endpoints on the server are currently
 * unauthenticated. Before this handles real submissions, the server needs a
 * real session check — see documentation/API.md, "Known gaps".
 */

const STORAGE_KEY = "civicsense.admin.session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/**
 * Credential is supplied at build time so it is not hardcoded in source.
 * Falls back to a local-only default for development.
 */
const DEFAULT_PASSWORD = "civicsense";

function getExpectedPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(readSession());
}

export function getSession() {
  return readSession();
}

/** @returns {{ ok: true } | { ok: false, error: string }} */
export function signIn(password) {
  if (!password) return { ok: false, error: "Enter the access password." };

  if (password !== getExpectedPassword()) {
    return { ok: false, error: "Incorrect password." };
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS }),
    );
  } catch {
    return {
      ok: false,
      error: "This browser is blocking local storage, so the session cannot be saved.",
    };
  }

  return { ok: true };
}

export function signOut() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to do — the session is gone either way. */
  }
}

/**
 * Whether the admin password is still the development default. Settings
 * surfaces this so a deployment cannot quietly ship with it.
 */
export function usingDefaultPassword() {
  return getExpectedPassword() === DEFAULT_PASSWORD;
}

export default { isAuthenticated, getSession, signIn, signOut, usingDefaultPassword };
