/**
 * Client authentication and session management for CivicSense Admin.
 *
 * Keeps admin credentials isolated in localStorage under 'cs_admin_token'
 * and attaches standard Bearer authorization headers to API calls.
 */

const TOKEN_KEY = "cs_admin_token";
const USER_KEY = "cs_admin_user";

/** Retrieve currently stored admin JWT token. */
export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/** Retrieve cached admin user object. */
export function getAdminUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Check if there is an active local session token. */
export function isAdminAuthenticated() {
  return Boolean(getAdminToken());
}

/** Store token and user details after successful login. */
export function setAdminSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error("[Admin Auth] Failed to save session to localStorage:", err);
  }
}

/** Clear active session on logout. */
export function clearAdminSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error("[Admin Auth] Failed to clear session:", err);
  }
}

/** Get Authorization header object for authenticated fetch calls. */
export function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Authenticate against /api/admin/auth/login.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, admin?: object, error?: string }>}
 */
export async function loginAdmin(email, password) {
  try {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || (response.status === 429
          ? "Too many login attempts. Please wait 15 minutes before trying again."
          : "Invalid email or password."),
      };
    }

    setAdminSession(data.token, data.admin);
    return {
      success: true,
      admin: data.admin,
      token: data.token,
    };
  } catch (err) {
    // During local development, if backend server on port 3000 is not running,
    // allow a seamless dev sandbox session so the admin UI can be tested without friction.
    if (import.meta.env.DEV) {
      const demoToken = "cs_dev_token_" + Date.now();
      const demoAdmin = {
        id: "dev-admin-1",
        email: email || "admin@civicsense.ng",
        name: "Operations Admin",
        role: "superadmin",
      };
      setAdminSession(demoToken, demoAdmin);
      return {
        success: true,
        admin: demoAdmin,
        token: demoToken,
      };
    }

    return {
      success: false,
      error: "Unable to reach the authentication server. Please ensure the backend is running.",
    };
  }
}

/**
 * Verify active session against /api/admin/auth/me.
 * Clears session if server returns 401.
 */
export async function verifyAdminSession() {
  const token = getAdminToken();
  if (!token) return { valid: false };

  try {
    const response = await fetch("/api/admin/auth/me", {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      clearAdminSession();
      return { valid: false };
    }

    const data = await response.json();
    return { valid: true, admin: data.admin };
  } catch {
    // If server is temporarily unreachable, do not abruptly log out if token exists
    return { valid: true, admin: getAdminUser(), offline: true };
  }
}

/**
 * Sign out and notify the backend.
 */
export async function logoutAdmin() {
  try {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      headers: getAuthHeader(),
    });
  } catch {
    // Fail silently on network errors during logout
  } finally {
    clearAdminSession();
  }
}
