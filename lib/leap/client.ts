import "server-only"

import type { EligibilityRequest, EligibilityResult, LeapErrorResponse } from "./types"

/**
 * Server-only client for the Leap incentives lookup.
 *
 * The partner key is a credential and must never reach the browser. This module
 * is imported only by the route handler under `app/api/**`; the `server-only`
 * import above makes the build fail loudly if it is ever pulled into a client
 * bundle.
 */

const LOOKUP_PATH = "/beta/incentives/lookups"

/**
 * Bound the upstream call. Without this a slow response holds the page in its
 * loading state until the platform timeout and the error state never renders.
 */
const TIMEOUT_MS = 10_000

/** Transient statuses only. Anything else means the request itself is wrong. */
const RETRY_STATUSES = new Set([500, 502, 503, 504])
const MAX_ATTEMPTS = 3

export class LeapApiError extends Error {
  constructor(
    /** Opaque. Logged, never branched on: the published list is not exhaustive. */
    readonly code: string,
    message: string,
    readonly status: number,
    /** Seconds, from Retry-After, when the upstream rate limited us. */
    readonly retryAfter?: number,
  ) {
    super(message)
    this.name = "LeapApiError"
  }
}

function baseUrl(): string {
  const url = process.env.LEAP_API_BASE_URL
  if (!url) {
    throw new LeapApiError(
      "config_error",
      "LEAP_API_BASE_URL is not set. Add it to .env.local (production: https://api.leap.energy).",
      500,
    )
  }
  return url.replace(/\/+$/, "")
}

function apiKey(): string {
  const key = process.env.LEAP_API_KEY
  if (!key) {
    throw new LeapApiError(
      "config_error",
      "LEAP_API_KEY is not set. Add the partner key to .env.local.",
      500,
    )
  }
  return key
}

/** Pull the first useful message out of an error body. */
function parseError(text: string, status: number): { code: string; message: string } {
  let body: LeapErrorResponse = {}
  try {
    body = text ? (JSON.parse(text) as LeapErrorResponse) : {}
  } catch {
    // non-JSON body; fall through to the raw text
  }
  const message =
    body.error?.message ?? body.message ?? text?.trim() ?? `Leap returned ${status}`
  const code = body.error?.details?.[0]?.error_code ?? `http_${status}`
  return { code, message: String(message) }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function attempt(request: EligibilityRequest): Promise<EligibilityResult> {
  // Resolve config first, so a missing env surfaces as config_error rather than
  // a spurious network error from inside the catch below.
  const url = `${baseUrl()}${LOOKUP_PATH}`
  const authorization = `Bearer ${apiKey()}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify(request),
      // Program data changes and results are per-address. Never cache.
      cache: "no-store",
      signal: controller.signal,
    })

    const text = await res.text()

    if (!res.ok) {
      const { code, message } = parseError(text, res.status)
      const retryAfterHeader = res.headers.get("retry-after")
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined
      throw new LeapApiError(
        code,
        message,
        res.status,
        Number.isFinite(retryAfter) ? retryAfter : undefined,
      )
    }

    return JSON.parse(text) as EligibilityResult
  } catch (err) {
    if (err instanceof LeapApiError) throw err
    if (controller.signal.aborted || (err as { name?: string })?.name === "AbortError") {
      throw new LeapApiError("timeout", `Leap lookup timed out after ${TIMEOUT_MS}ms`, 504)
    }
    throw new LeapApiError(
      "network_error",
      err instanceof Error ? err.message : "Network error reaching Leap",
      502,
    )
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Look up incentives, retrying only what is worth retrying.
 *
 * 400, 401, 403, 404, and 422 are never retried: the request itself has to
 * change first. 429 is surfaced with its Retry-After rather than being retried
 * in a tight loop from a page render.
 */
export async function lookupIncentives(
  request: EligibilityRequest,
): Promise<EligibilityResult> {
  let lastError: LeapApiError | undefined

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      return await attempt(request)
    } catch (err) {
      const e = err instanceof LeapApiError ? err : undefined
      if (!e) throw err
      lastError = e

      const retryable = RETRY_STATUSES.has(e.status) || e.code === "timeout" || e.code === "network_error"
      if (!retryable || i === MAX_ATTEMPTS - 1) throw e

      // 400ms, 800ms. Short enough to stay inside a page load.
      await sleep(400 * 2 ** i)
    }
  }

  throw lastError ?? new LeapApiError("unknown", "Leap lookup failed", 500)
}
