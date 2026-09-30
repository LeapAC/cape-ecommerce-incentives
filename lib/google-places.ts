"use client"

import { componentsToPostal, type PlaceAddressComponent } from "./places-address"
import type { PostalAddress } from "./incentives/location"

/**
 * Google Places Autocomplete, loaded only when a browser key is configured.
 *
 * Uses the Place Autocomplete Data API (`AutocompleteSuggestion`) rather than
 * the drop-in widget, so the suggestion list is ours and matches the store.
 * The key is public by design: it is a browser key and must be restricted by
 * HTTP referrer in the Google Cloud console.
 */

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
export const placesEnabled = MAPS_KEY.length > 0

/* Just enough of the Maps types to type what we call. */
interface PlacePrediction {
  placeId: string
  text: { toString(): string }
  mainText?: { toString(): string } | null
  secondaryText?: { toString(): string } | null
  toPlace(): {
    fetchFields(opts: { fields: string[] }): Promise<unknown>
    addressComponents?: PlaceAddressComponent[] | null
  }
}

interface PlacesLibrary {
  AutocompleteSessionToken: new () => unknown
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(request: Record<string, unknown>): Promise<{
      suggestions: { placePrediction: PlacePrediction | null }[]
    }>
  }
}

interface MapsGlobal {
  maps?: { importLibrary?: (name: string) => Promise<unknown> }
}

declare global {
  interface Window {
    google?: MapsGlobal
    __capeMapsReady?: () => void
  }
}

let loading: Promise<PlacesLibrary> | null = null

/** Loads the Maps JS API once per page, then the places library. */
export function loadPlaces(): Promise<PlacesLibrary> {
  if (!placesEnabled) return Promise.reject(new Error("No Google Maps key"))
  if (loading) return loading

  loading = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.importLibrary) return resolve()
    window.__capeMapsReady = () => resolve()
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      MAPS_KEY,
    )}&libraries=places&loading=async&callback=__capeMapsReady`
    script.async = true
    script.onerror = () => reject(new Error("Google Maps failed to load"))
    document.head.appendChild(script)
  })
    .then(() => window.google!.maps!.importLibrary!("places") as Promise<PlacesLibrary>)
    .catch((err) => {
      // Let a later mount try again rather than caching the failure forever.
      loading = null
      throw err
    })

  return loading
}

export interface AddressSuggestion {
  id: string
  main: string
  secondary: string
  prediction: PlacePrediction
}

/** Address-shaped types. Omitting them would also suggest businesses and parks. */
const ADDRESS_TYPES = ["street_address", "premise", "subpremise"]

export async function fetchSuggestions(
  input: string,
  sessionToken: unknown,
): Promise<AddressSuggestion[]> {
  const places = await loadPlaces()
  const base = { input, sessionToken, includedRegionCodes: ["us"], language: "en-US", region: "us" }

  let result
  try {
    result = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      ...base,
      includedPrimaryTypes: ADDRESS_TYPES,
    })
  } catch {
    // A project whose key rejects the type filter still gets US suggestions.
    result = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(base)
  }

  return result.suggestions.flatMap((s) => {
    const p = s.placePrediction
    if (!p) return []
    return [
      {
        id: p.placeId,
        main: p.mainText?.toString() ?? p.text.toString(),
        secondary: p.secondaryText?.toString() ?? "",
        prediction: p,
      },
    ]
  })
}

export async function newSessionToken(): Promise<unknown> {
  const places = await loadPlaces()
  return new places.AutocompleteSessionToken()
}

/** Resolve a picked suggestion to the Leap address fields. */
export async function resolveSuggestion(s: AddressSuggestion): Promise<PostalAddress> {
  const place = s.prediction.toPlace()
  await place.fetchFields({ fields: ["addressComponents"] })
  return componentsToPostal(place.addressComponents ?? [])
}
