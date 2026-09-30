import { NextResponse } from "next/server"
import { LeapApiError, lookupIncentives } from "@/lib/leap/client"
import { parseStoredLocation, toLeapAddress, type LookupLocation } from "@/lib/incentives/location"
import { emptyView, toIncentiveView, type IncentiveView } from "@/lib/incentives/model"
import { toCustomerDevices, type DeviceLine } from "@/lib/incentives/devices"
import { checkCheckoutRequest } from "@/lib/incentives/checkout-guard"

/**
 * The only thing the browser talks to. The partner key lives here and on the
 * server module this imports, never in a bundle.
 *
 * Incentive results are per-address and program data changes, so this must never
 * be served from a static or CDN cache.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

interface QuoteRequest {
  /** A committed location: a full address, or a ZIP in ZIP mode. */
  location: LookupLocation
  devices: DeviceLine[]
  /**
   * "preview" is a throwaway browsing lookup: a fresh reference_id each time and
   * no application. "checkout" is durable: the caller supplies a reference_id
   * derived from the order and an application is created, which is what makes
   * connect_url a working link.
   */
  mode?: "preview" | "checkout"
  referenceId?: string
}

export type QuoteResponse =
  | { ok: true; view: IncentiveView }
  | { ok: false; error: { message: string; retryable: boolean; retryAfter?: number } }

/** Coverage gaps are a normal outcome, not a failure. */
const NO_TERRITORY =
  "We could not find a utility serving this address, so there are no programs to check against it."
const BAD_ADDRESS =
  "We could not locate that address. Check the street number and city, then try again."

function fail(
  message: string,
  status: number,
  retryable: boolean,
  retryAfter?: number,
): NextResponse<QuoteResponse> {
  return NextResponse.json(
    { ok: false, error: { message, retryable, retryAfter } },
    { status, headers: { "Cache-Control": "no-store" } },
  )
}

function ok(view: IncentiveView): NextResponse<QuoteResponse> {
  return NextResponse.json({ ok: true, view }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: Request): Promise<NextResponse<QuoteResponse>> {
  let body: QuoteRequest
  try {
    body = (await request.json()) as QuoteRequest
  } catch {
    return fail("Malformed request body.", 400, false)
  }

  // Validate before calling Leap. A malformed or half-filled location is the
  // caller's bug, never something to forward.
  const location = parseStoredLocation(body.location)
  if (!location) {
    return fail("A full address or a five-digit ZIP is required.", 400, false)
  }

  const checkout = body.mode === "checkout"
  let orderReference: string | null = null
  if (checkout) {
    // Creating an application writes to production, so only cape's own Place
    // order may ask for it: same origin, and a reference checkout minted.
    const check = checkCheckoutRequest({
      origin: request.headers.get("origin"),
      host: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
      referenceId: body.referenceId,
    })
    if (!check.ok) return fail(check.message, 400, false)
    orderReference = check.referenceId

    // An application is pinned to its address, so it is only ever created
    // from a full shipping address, never from a ZIP centroid.
    if (location.kind !== "address") {
      return fail("An order lookup needs the full shipping address.", 400, false)
    }
  }

  const devices = toCustomerDevices(body.devices ?? [])
  if (devices.length === 0) {
    // Nothing in the basket maps to a catalog device. Not an error: this is the
    // correct outcome for accessories and install services, which have no Leap
    // mapping.
    return ok(emptyView(body.referenceId ?? "none"))
  }

  const referenceId = orderReference ?? `cape-preview-${crypto.randomUUID()}`

  try {
    const result = await lookupIncentives({
      reference_id: referenceId,
      address: toLeapAddress(location),
      customer_devices: devices,
      customer_classification: "RESIDENTIAL",
      create_application: orderReference !== null,
    })

    return ok(toIncentiveView(result))
  } catch (err) {
    if (!(err instanceof LeapApiError)) {
      console.error("[incentives] unexpected failure", err)
      return fail("Could not check incentives right now.", 500, true)
    }

    // Address-coverage outcomes become a successful empty result. The browser
    // then has one less branch and cannot render a coverage gap as a failure.
    if (err.status === 404) {
      return ok(emptyView(referenceId, NO_TERRITORY))
    }
    if (err.status === 422 && /geocod/i.test(err.code + err.message)) {
      return ok(emptyView(referenceId, BAD_ADDRESS))
    }

    // Everything else is logged with its opaque code and given a safe message.
    console.error(
      `[incentives] lookup failed status=${err.status} code=${err.code} ref=${referenceId}: ${err.message}`,
    )

    if (err.status === 401 || err.status === 403) {
      // A configuration problem on our side. Never surfaced to the shopper.
      return fail("Incentive lookups are unavailable right now.", 503, false)
    }
    if (err.status === 422 || err.status === 400) {
      // Our request was wrong, most likely a bad device mapping. Retrying the
      // same input cannot help.
      return fail("We could not check incentives for this item.", 422, false)
    }
    if (err.status === 429) {
      return fail("Too many lookups just now. Try again shortly.", 429, true, err.retryAfter)
    }

    return fail("Could not reach the incentives service.", 502, true)
  }
}
