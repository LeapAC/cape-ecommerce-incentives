/**
 * Who may create a Leap application through /api/incentives/quote.
 *
 * `mode: "checkout"` sends `create_application: true`, which writes a real
 * application in production. Only cape's own Place order may do that, so the
 * route accepts it only from a same-origin request carrying a reference in the
 * exact format checkout mints. This is not authentication: a determined caller
 * can forge both. It stops stray and cross-site requests from creating
 * applications, without adding a secret to a demo site.
 *
 * Pure, with no imports, so `node --test` loads it directly.
 */

/** Order ids are `CP-` plus six characters from lib/order.ts's alphabet. */
export const ORDER_REFERENCE = /^cape-CP-[A-HJ-NP-Z2-9]{6}$/

export function isOrderReference(value: unknown): value is string {
  return typeof value === "string" && ORDER_REFERENCE.test(value)
}

/**
 * True when the request's Origin names the host that served it. A browser
 * always sends Origin on a POST from fetch, so a missing one is rejected.
 * `host` is the forwarded host where a proxy sets one, else the Host header.
 */
export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false
  try {
    return new URL(origin).host.toLowerCase() === host.trim().toLowerCase()
  } catch {
    return false
  }
}

export type CheckoutCheck = { ok: true; referenceId: string } | { ok: false; message: string }

export function checkCheckoutRequest(input: {
  origin: string | null
  host: string | null
  referenceId: unknown
}): CheckoutCheck {
  if (!isSameOrigin(input.origin, input.host)) {
    return { ok: false, message: "Order lookups are only accepted from this store's checkout." }
  }
  if (!isOrderReference(input.referenceId)) {
    return { ok: false, message: "An order lookup needs this store's order reference." }
  }
  return { ok: true, referenceId: input.referenceId }
}
