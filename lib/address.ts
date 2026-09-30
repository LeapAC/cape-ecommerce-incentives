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

/**
 * States, DC, and the inhabited territories, which Leap addresses as states.
 */
export const US_TERRITORIES = ["PR", "GU", "VI", "AS", "MP"] as const

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
  ...US_TERRITORIES,
]
