/**
 * Checkout decisions that must hold whatever the page renders. Pure, so
 * `node --test` loads it directly (hence the explicit .ts import).
 */

import type { ShippingAddress } from "./address"
import type { Order } from "./order"
import {
  addressLocation,
  locationSignature,
  type LookupLocation,
  type LookupMode,
} from "./incentives/location.ts"

/**
 * Place order needs contact details and an address the order lookup accepts:
 * street, city, state, and a five-digit ZIP. Anything less fails server-side
 * validation and leaves an order with no application behind it.
 */
export function canPlaceOrder(lineCount: number, a: ShippingAddress): boolean {
  return lineCount > 0 && addressLocation(a) !== null && Boolean(a.name.trim() && a.email.trim())
}

/**
 * What the order records from its own lookup. Amounts come only from that
 * lookup's response. When it failed, the order keeps its reference_id (so the
 * rebate can still be reconciled) and no amounts at all: a preview or
 * ZIP-centroid estimate is not what this order was quoted.
 */
export function leapSnapshot(referenceId: string, response: unknown): NonNullable<Order["leap"]> {
  const body = response as { ok?: unknown; view?: Record<string, unknown> } | null
  const view = body && body.ok === true && body.view && typeof body.view === "object" ? body.view : null
  if (!view) return { reference_id: referenceId }

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0)
  return {
    reference_id: referenceId,
    connect_url: typeof view.connectUrl === "string" && view.connectUrl ? view.connectUrl : undefined,
    installAmount: num(view.installTotal),
    ongoingAmount: num(view.ongoingTotal),
    utilityName: typeof view.utilityName === "string" ? view.utilityName : null,
  }
}

/**
 * Whether the browsing quote was run for the address this order ships to.
 * Only then may it touch the order summary: the instant rebate, "Due today",
 * and the After purchase block. A ZIP-mode quote never qualifies, and neither
 * does one for an address the shopper has edited since committing it.
 */
export function quoteAppliesToShipTo(shipTo: ShippingAddress, quoted: LookupLocation | null): boolean {
  const loc = addressLocation(shipTo)
  return loc !== null && quoted !== null && locationSignature(loc) === locationSignature(quoted)
}

/**
 * Where checkout takes the lookup location from. In address mode the shipping
 * form is the entry, so the incentives card shows only the committed line; a
 * second form there is the duplicate shoppers saw on phones. In ZIP mode the
 * card holds the only ZIP input on the page.
 */
export function checkoutLocationEntry(mode: LookupMode): "form" | "summary" {
  return mode === "address" ? "summary" : "form"
}
