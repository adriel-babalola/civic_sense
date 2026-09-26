/**
 * CivicSense website — API client.
 *
 * Every network call in the app goes through this module. It owns three
 * concerns so no component has to think about them:
 *   1. unwrapping the `{ success, data, error }` envelope the server returns
 *   2. turning non-2xx and transport failures into a thrown `ApiError`
 *   3. timeouts, so a stalled upstream surfaces as an error the UI can render
 */

import { API } from "../config/config";

const DEFAULT_TIMEOUT_MS = 20_000;
/** The fact-check pipeline fans out to three retrievers plus an LLM call. */
const FACTCHECK_TIMEOUT_MS = 45_000;

export class ApiError extends Error {
  constructor(message, { status = 0, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

async function request(path, { method = "GET", body, signal, timeout } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout ?? DEFAULT_TIMEOUT_MS);

  // Honour a caller-supplied signal alongside our own timeout.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await fetch(path, {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new ApiError(
        payload?.error || `Request failed (${response.status})`,
        { status: response.status },
      );
    }

    // The server omits the `data` envelope on a few routes — `/api/health`
    // returns its fields at the top level. Unwrap only when there is something
    // to unwrap, so health does not silently become `null`.
    if (payload && typeof payload === "object" && "data" in payload) return payload.data;
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError") {
      throw new ApiError("The server took too long to respond. Try again.", {
        status: 0,
        cause: error,
      });
    }
    throw new ApiError(
      "Cannot reach the CivicSense server. Check your connection.",
      { status: 0, cause: error },
    );
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------------------
 * Health and sources
 * ------------------------------------------------------------------------ */

/** Runtime status: uptime, database reachability, scraper health. */
export function getHealth(signal) {
  return request(API.health, { signal, timeout: 8000 });
}

/** The RSS registry the scraper ingests. Static, safe to cache. */
export function getSources(signal) {
  return request(API.sources, { signal, timeout: 8000 });
}

/* ---------------------------------------------------------------------------
 * Fact-checking
 * ------------------------------------------------------------------------ */

/**
 * Run a fact-check. Accepts a text claim, an image, or both.
 * `image` is a File; `imageUrl` is a remote URL. Mutually exclusive with
 * `image` — the server prefers the upload.
 */
export function runFactCheck({ claim, caption, image, imageUrl, signal } = {}) {
  if (image) {
    const form = new FormData();
    if (claim) form.append("claim", claim);
    if (caption) form.append("caption", caption);
    form.append("image", image);
    return request(API.factcheck, {
      method: "POST",
      body: form,
      signal,
      timeout: FACTCHECK_TIMEOUT_MS,
    });
  }

  return request(API.factcheck, {
    method: "POST",
    body: { claim: claim || "", ...(caption ? { caption } : {}), ...(imageUrl ? { imageUrl } : {}) },
    signal,
    timeout: FACTCHECK_TIMEOUT_MS,
  });
}

/** The 50 most recent fact-checks, newest first. */
export function getFactChecks(signal) {
  return request(API.factchecks, { signal });
}

/* ---------------------------------------------------------------------------
 * Incidents
 * ------------------------------------------------------------------------ */

/**
 * Approved incidents plus the curated seed set. The server does the filtering
 * for `status` only, so state/type/date narrowing happens client-side — see
 * hooks/useIncidents.js.
 */
export function getIncidents(signal) {
  return request(API.incidents, { signal });
}

/* ---------------------------------------------------------------------------
 * Reports
 * ------------------------------------------------------------------------ */

/** Submit an anonymous incident report. Returns the stored document. */
export function submitReport({ type, description, state, lga, evidence }, signal) {
  return request(API.reports, { method: "POST", body: { type, description, state, lga, evidence }, signal });
}

/** All reports, optionally filtered by `pending` | `approved` | `rejected`. */
export function getReports(status, signal) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`${API.reports}${query}`, { signal });
}

export function approveReport(id, signal) {
  return request(`${API.reports}/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
    signal,
  });
}

export function rejectReport(id, signal) {
  return request(`${API.reports}/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    signal,
  });
}

export default {
  getHealth,
  getSources,
  runFactCheck,
  getFactChecks,
  getIncidents,
  submitReport,
  getReports,
  approveReport,
  rejectReport,
};
