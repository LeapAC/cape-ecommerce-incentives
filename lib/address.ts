/**
 * Shipping address — pure types and helpers, safe on both server and client.
 * The React hook lives in `use-address.ts` so server code can validate an
 * address without pulling in a client module.
 *
 * The postal fields use the same snake_case names the Leap lookup expects, so
 * the address object forwards to our own endpoint without a translation layer.
 * `name` and `email` are ours and are not part of that payload.
 */

export interface ShippingAddress {
  name: string
  email: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  zip_code: string
  country_code: string
}

export const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  email: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  zip_code: "",
  country_code: "US",
}

/** Everything a lookup needs. address_line_2 stays optional. */
export const REQUIRED_ADDRESS_FIELDS = [
  "address_line_1",
  "city",
  "state",
  "zip_code",
] as const satisfies readonly (keyof ShippingAddress)[]

export function missingAddressFields(a: Partial<ShippingAddress>): string[] {
  return REQUIRED_ADDRESS_FIELDS.filter((f) => !a[f]?.trim())
}

export function isAddressComplete(a: Partial<ShippingAddress>): boolean {
  return missingAddressFields(a).length === 0
}

/** One line, for the collapsed summary: "456 Main St, Bend, OR 97701". */
export function formatAddress(a: ShippingAddress): string {
  const street = [a.address_line_1, a.address_line_2].filter(Boolean).join(" ")
  return [street, a.city, [a.state, a.zip_code].filter(Boolean).join(" ")].filter(Boolean).join(", ")
}

/** "Bend, OR" — for copy that names where we are checking. */
export function shortLocality(a: ShippingAddress): string {
  return [a.city, a.state].filter(Boolean).join(", ")
}

/** A stable signature for (address) so callers can tell when it really changed. */
export function addressSignature(a: ShippingAddress): string {
  return [
    a.address_line_1,
    a.address_line_2,
    a.city,
    a.state,
    a.zip_code,
    a.country_code || "US",
  ]
    .map((v) => v.trim().toLowerCase())
    .join("|")
}
