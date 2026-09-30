/**
 * Where an incentives lookup is run from, and how the site asks for it.
 *
 * Pure types and helpers, safe on server and client, with type-only imports so
 * `node --test` can load this file directly.
 *
 * A lookup never keys on what the shopper is typing. It keys on a committed
 * location: a picked autocomplete suggestion, or a form the shopper submitted.
 * Typing into a field changes a draft, and a draft never reaches Leap.
 */

import type { ShippingAddress } from "../address"

/** How the site asks for a location. Full address is the default. */
export type LookupMode = "address" | "zip"

export interface PostalAddress {
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  zip_code: string
  country_code: string
}

export type LookupLocation =
  | ({ kind: "address" } & PostalAddress)
  | { kind: "zip"; zip_code: string; country_code: string }

export const LOOKUP_MODE_STORAGE_KEY = "cape-lookup-mode"
export const LOOKUP_MODE_PARAM = "lookup"

/**
 * `?lookup=zip` or `?lookup=address` sets the mode for this browser;
 * `?lookup=default` clears the override and falls back to the env default.
 * Anything else is ignored rather than guessed at.
 */
export function parseLookupMode(value: string | null | undefined): LookupMode | null {
  const v = value?.trim().toLowerCase()
  if (v === "zip") return "zip"
  if (v === "address") return "address"
  return null
}

export type LookupParamAction =
  | { kind: "none" }
  | { kind: "set"; mode: LookupMode }
  | { kind: "clear" }
  | { kind: "ignore" }

/**
 * What a `?lookup=` value does to the stored override. Only `default` clears
 * it; a typo such as `zipp` is ignored and the saved choice stays.
 */
export function lookupParamAction(param: string | null): LookupParamAction {
  if (param === null) return { kind: "none" }
  const mode = parseLookupMode(param)
  if (mode) return { kind: "set", mode }
  if (param.trim().toLowerCase() === "default") return { kind: "clear" }
  return { kind: "ignore" }
}

/** Resolve the effective mode: stored override, then env default, then address. */
export function resolveLookupMode(
  stored: string | null | undefined,
  envDefault: string | null | undefined,
): LookupMode {
  return parseLookupMode(stored) ?? parseLookupMode(envDefault) ?? "address"
}

export function isValidZip(zip: string | null | undefined): boolean {
  return /^\d{5}$/.test(zip?.trim() ?? "")
}

/** Every field a full-address lookup needs. address_line_2 stays optional. */
export function isPostalComplete(a: Partial<PostalAddress> | null | undefined): boolean {
  if (!a) return false
  return (
    Boolean(a.address_line_1?.trim()) &&
    Boolean(a.city?.trim()) &&
    Boolean(a.state?.trim()) &&
    isValidZip(a.zip_code)
  )
}

/** The postal half of a shipping address. */
export function postalFrom(a: Partial<ShippingAddress | PostalAddress>): PostalAddress {
  return {
    address_line_1: a.address_line_1?.trim() ?? "",
    address_line_2: a.address_line_2?.trim() ?? "",
    city: a.city?.trim() ?? "",
    state: a.state?.trim().toUpperCase() ?? "",
    zip_code: a.zip_code?.trim() ?? "",
    country_code: (a.country_code?.trim() || "US").toUpperCase(),
  }
}

/**
 * Lay a picked Places address over the form's latest state. Only fields the
 * pick actually filled are taken, so a unit typed into address_line_2 while
 * the pick was resolving survives a suggestion that has no unit.
 */
export function mergePicked<T extends Partial<PostalAddress>>(latest: T, picked: PostalAddress): T {
  const next = { ...latest }
  for (const key of Object.keys(picked) as (keyof PostalAddress)[]) {
    if (picked[key]) (next as Partial<PostalAddress>)[key] = picked[key]
  }
  return next
}

/** A committable address location, or null while it is still incomplete. */
export function addressLocation(a: Partial<ShippingAddress | PostalAddress>): LookupLocation | null {
  const postal = postalFrom(a)
  return isPostalComplete(postal) ? { kind: "address", ...postal } : null
}

export function zipLocation(zip: string): LookupLocation | null {
  const z = zip.trim()
  return isValidZip(z) ? { kind: "zip", zip_code: z, country_code: "US" } : null
}

/** A stable signature, so a lookup re-runs only when the location really moved. */
export function locationSignature(loc: LookupLocation | null): string {
  if (!loc) return ""
  if (loc.kind === "zip") return `zip|${loc.zip_code}|${loc.country_code}`
  return [
    "address",
    loc.address_line_1,
    loc.address_line_2,
    loc.city,
    loc.state,
    loc.zip_code,
    loc.country_code,
  ]
    .map((v) => v.trim().toLowerCase())
    .join("|")
}

/** "Atlanta, GA" or "ZIP 30303", for copy that names where we are checking. */
export function locationLabel(loc: LookupLocation | null): string {
  if (!loc) return ""
  if (loc.kind === "zip") return `ZIP ${loc.zip_code}`
  return [loc.city, loc.state].filter(Boolean).join(", ")
}

/** One line for the collapsed summary. */
export function locationLine(loc: LookupLocation): string {
  if (loc.kind === "zip") return `ZIP ${loc.zip_code}`
  const street = [loc.address_line_1, loc.address_line_2].filter(Boolean).join(" ")
  return [street, loc.city, [loc.state, loc.zip_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ")
}

/**
 * Read a stored location back, rejecting anything malformed. Storage is
 * user-controlled, so a bad entry becomes "nothing committed" rather than a
 * lookup against half an address.
 */
export function parseStoredLocation(raw: unknown): LookupLocation | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "")
  if (r.kind === "zip") return zipLocation(str("zip_code"))
  if (r.kind === "address") {
    return addressLocation({
      address_line_1: str("address_line_1"),
      address_line_2: str("address_line_2"),
      city: str("city"),
      state: str("state"),
      zip_code: str("zip_code"),
      country_code: str("country_code"),
    })
  }
  return null
}

/**
 * The address block sent to Leap. A ZIP-only lookup sends the ZIP and country
 * and nothing else: production resolves it to the ZIP centroid.
 */
export function toLeapAddress(loc: LookupLocation):
  | {
      address_line_1: string
      address_line_2?: string
      city: string
      state: string
      zip_code: string
      country_code: string
    }
  | { zip_code: string; country_code: string } {
  if (loc.kind === "zip") return { zip_code: loc.zip_code, country_code: loc.country_code }
  return {
    address_line_1: loc.address_line_1,
    address_line_2: loc.address_line_2 || undefined,
    city: loc.city,
    state: loc.state,
    zip_code: loc.zip_code,
    country_code: loc.country_code,
  }
}
