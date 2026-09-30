/**
 * Maps Google Places address components onto the snake_case fields the Leap
 * lookup takes. Pure, with type-only imports, so it runs under `node --test`.
 *
 * Components come from `Place.fetchFields({ fields: ["addressComponents"] })`
 * in the Places library of the Maps JavaScript API, each with `longText`,
 * `shortText`, and `types`.
 */

import type { PostalAddress } from "./incentives/location"

export interface PlaceAddressComponent {
  longText: string | null
  shortText: string | null
  types: string[]
}

function find(components: PlaceAddressComponent[], ...types: string[]) {
  for (const type of types) {
    const hit = components.find((c) => c.types.includes(type))
    if (hit) return hit
  }
  return undefined
}

const long = (c?: PlaceAddressComponent) => c?.longText?.trim() ?? ""
const short = (c?: PlaceAddressComponent) => c?.shortText?.trim() || long(c)

export function componentsToPostal(components: PlaceAddressComponent[]): PostalAddress {
  const number = long(find(components, "street_number"))
  // Short form of the route reads as people write it: "Trinity Ave SW".
  const route = short(find(components, "route"))
  const unit = long(find(components, "subpremise"))
  // Not every place has a locality. New York boroughs, for one, arrive as a
  // sublocality, and some rural addresses only carry a postal town.
  const city = long(
    find(components, "locality", "postal_town", "sublocality_level_1", "sublocality", "neighborhood"),
  )
  const state = short(find(components, "administrative_area_level_1")).toUpperCase()
  const zip = long(find(components, "postal_code")).slice(0, 5)
  const country = short(find(components, "country")).toUpperCase() || "US"

  return {
    address_line_1: [number, route].filter(Boolean).join(" "),
    address_line_2: unit ? (/^\d/.test(unit) ? `#${unit}` : unit) : "",
    city,
    state,
    zip_code: zip,
    country_code: country,
  }
}
