"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { isAddressComplete, type ShippingAddress } from "@/lib/address"
import { useSessionAddress } from "@/lib/use-address"
import { deviceSignature, type DeviceLine } from "./devices"
import {
  DEFAULT_LOOKUP_MODE,
  LOOKUP_MODE_PARAM,
  LOOKUP_MODE_STORAGE_KEY,
  addressLocation,
  clearStoredLocation,
  locationLabel,
  locationSignature,
  lookupParamAction,
  postalFrom,
  resolveLookupMode,
  zipLocation,
  type LookupLocation,
  type LookupMode,
  type PostalAddress,
} from "./location"
import type { IncentiveView } from "./model"
import { lookupDelay, sharedRequest } from "./request"

export type QuoteState =
  | { status: "idle" }
  | { status: "loading"; locality: string }
  | { status: "ready"; view: IncentiveView }
  | { status: "error"; message: string; retryable: boolean }

interface IncentivesApi {
  /** The shipping address as typed. A draft: editing it never runs a lookup. */
  address: ShippingAddress
  setAddress: (a: ShippingAddress) => void
  /** Merge fields into the latest address rather than a captured copy. */
  mergeAddress: (patch: Partial<ShippingAddress>) => void
  setField: (field: keyof ShippingAddress, value: string) => void
  addressReady: boolean
  addressComplete: boolean
  /** How the site asks for a location: ZIP only (default) or full address. */
  lookupMode: LookupMode
  /** The committed location for the current mode. Lookups key on this alone. */
  location: LookupLocation | null
  /** Commit a full address from a submitted form. */
  commitAddress: (a: Partial<PostalAddress>) => boolean
  /** Commit a ZIP in ZIP mode. */
  commitZip: (zip: string) => boolean
  /** Session cache, keyed by location + device set. Program data changes, so it
   *  never outlives the tab and is emptied whenever the location moves. */
  cache: Map<string, IncentiveView>
  /** One in-flight request per signature, shared by every surface asking. */
  inflight: Map<string, Promise<QuoteBody>>
}

/** The quote route's response body, as the browser reads it. */
type QuoteBody = {
  ok?: boolean
  view?: IncentiveView
  error?: { message?: string; retryable?: boolean }
} | null

const IncentivesContext = createContext<IncentivesApi | null>(null)

interface Committed {
  address: LookupLocation | null
  zip: LookupLocation | null
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* private mode; the in-memory value still applies */
  }
}

/**
 * The hidden demo toggle. `?lookup=zip` or `?lookup=address` pins the mode in
 * this browser, `?lookup=default` clears it, and the param is then stripped so
 * an audience never sees it. Otherwise the stored choice, then
 * NEXT_PUBLIC_LOOKUP_MODE, then ZIP.
 */
function readLookupMode(): LookupMode {
  try {
    const url = new URL(window.location.href)
    const action = lookupParamAction(url.searchParams.get(LOOKUP_MODE_PARAM))
    if (action.kind !== "none") {
      if (action.kind === "set") writeStorage(LOOKUP_MODE_STORAGE_KEY, action.mode)
      if (action.kind === "clear") writeStorage(LOOKUP_MODE_STORAGE_KEY, null)
      // Stripped even when ignored, so an audience never sees the toggle.
      url.searchParams.delete(LOOKUP_MODE_PARAM)
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
    }
  } catch {
    /* fall through to the stored or default mode */
  }
  return resolveLookupMode(readStorage(LOOKUP_MODE_STORAGE_KEY), process.env.NEXT_PUBLIC_LOOKUP_MODE)
}

export function IncentivesProvider({ children }: { children: React.ReactNode }) {
  const { address, setAddress, setField, mergeAddress, hydrated: addressHydrated } = useSessionAddress()
  // Stable for the provider's life. Held in state rather than a ref so render
  // never reads ref.current.
  const [cache] = useState(() => new Map<string, IncentiveView>())
  const [inflight] = useState(() => new Map<string, Promise<QuoteBody>>())
  const lastLocation = useRef<string | null>(null)

  const [lookup, setLookup] = useState<{ mode: LookupMode; committed: Committed; hydrated: boolean }>({
    mode: DEFAULT_LOOKUP_MODE,
    committed: { address: null, zip: null },
    hydrated: false,
  })
  const { mode: lookupMode, committed, hydrated: lookupHydrated } = lookup
  const setCommitted = useCallback(
    (update: (c: Committed) => Committed) =>
      setLookup((l) => ({ ...l, committed: update(l.committed) })),
    [],
  )

  // Hydrate the mode once. The committed location is never read back: every
  // page load starts with an empty entry, and anything an older build stored is
  // removed here. Within one page session it lives in this state and carries
  // across client navigation.
  useEffect(() => {
    try {
      clearStoredLocation(localStorage)
    } catch {
      /* storage blocked: nothing to clear */
    }
    setLookup({ mode: readLookupMode(), committed: { address: null, zip: null }, hydrated: true })
  }, [])

  const commitAddress = useCallback(
    (a: Partial<PostalAddress>) => {
      const loc = addressLocation(a)
      if (!loc) return false
      setCommitted((c) => ({ ...c, address: loc }))
      // The committed address is also where the order ships. Merged into the
      // latest state, so contact fields are never overwritten.
      mergeAddress(postalFrom(a))
      return true
    },
    [mergeAddress, setCommitted],
  )

  const commitZip = useCallback((zip: string) => {
    const loc = zipLocation(zip)
    if (!loc) return false
    setCommitted((c) => ({ ...c, zip: loc }))
    return true
  }, [setCommitted])

  const location = lookupMode === "zip" ? committed.zip : committed.address
  const locSig = locationSignature(location)

  // A new location invalidates every cached result: they are location-specific,
  // and a stale one rendered under a new address is the worst failure here.
  //
  // Deliberately does NOT touch any request token. Child effects run before
  // parent effects, so a consumer has already claimed its token by the time
  // this runs; bumping here would drop the first lookup after every commit.
  useEffect(() => {
    if (lastLocation.current !== null && lastLocation.current !== locSig) {
      cache.clear()
    }
    lastLocation.current = locSig
  }, [locSig, cache])

  const value = useMemo<IncentivesApi>(
    () => ({
      address,
      setAddress,
      mergeAddress,
      setField,
      addressReady: addressHydrated && lookupHydrated,
      addressComplete: isAddressComplete(address),
      lookupMode,
      location,
      commitAddress,
      commitZip,
      cache,
      inflight,
    }),
    [
      address,
      setAddress,
      mergeAddress,
      setField,
      addressHydrated,
      lookupHydrated,
      lookupMode,
      location,
      commitAddress,
      commitZip,
      cache,
      inflight,
    ],
  )

  return <IncentivesContext.Provider value={value}>{children}</IncentivesContext.Provider>
}

export function useIncentives(): IncentivesApi {
  const ctx = useContext(IncentivesContext)
  if (!ctx) throw new Error("useIncentives must be used inside IncentivesProvider")
  return ctx
}

/**
 * Runs a lookup for a device set at the committed location.
 *
 * Re-runs on a signature of committed location plus device set, so a quantity
 * change or a commit refreshes the numbers, and typing into an address field
 * does not. Never keys on "no result yet", which would leave the cart stale
 * after an edit.
 */
export function useIncentiveQuote(
  lines: DeviceLine[],
  options: { mode?: "preview" | "checkout"; referenceId?: string; enabled?: boolean } = {},
): { state: QuoteState; retry: () => void } {
  const { location, addressReady, cache, inflight } = useIncentives()
  const { mode = "preview", referenceId, enabled = true } = options

  const [state, setState] = useState<QuoteState>({ status: "idle" })
  const [nonce, setNonce] = useState(0)
  /**
   * Per-consumer, deliberately. Several of these hooks are alive at once (the
   * cart drawer is mounted on every page), and a token shared between them means
   * each new request invalidates the others' in-flight responses and nothing
   * ever resolves. Each consumer renders its own view, so each guards its own.
   */
  const token = useRef(0)
  /** The location this hook last sent a lookup for, to decide on debouncing. */
  const lastSent = useRef<string | null>(null)

  const locSig = locationSignature(location)
  const devSig = deviceSignature(lines)
  const signature = `${locSig}::${devSig}::${mode}`
  const hasDevices = devSig.length > 0

  // Serialised so the effect depends on the values, not the array identity.
  const linesJson = JSON.stringify(
    lines.filter((l) => l.deviceId).map((l) => [l.slug, l.deviceId, l.quantity]),
  )

  const retry = useCallback(() => {
    cache.delete(signature)
    setNonce((n) => n + 1)
  }, [cache, signature])

  useEffect(() => {
    if (!enabled || !addressReady) return
    if (!location || !hasDevices) {
      setState({ status: "idle" })
      return
    }

    const cached = cache.get(signature)
    if (cached) {
      setState({ status: "ready", view: cached })
      return
    }

    const myToken = ++token.current
    let cancelled = false

    setState({ status: "loading", locality: locationLabel(location) })

    const body = JSON.stringify({
      location,
      devices: JSON.parse(linesJson).map(([slug, deviceId, quantity]: [string, string, number]) => ({
        slug,
        deviceId,
        quantity,
      })),
      mode,
      referenceId,
    })

    const timer = setTimeout(async () => {
      lastSent.current = locSig
      try {
        // Shared, never aborted by one consumer: another surface may be
        // waiting on the same request. A superseded response is dropped by the
        // token check below instead. The route bounds the upstream call at 10s.
        const result = await sharedRequest(inflight, signature, async () => {
          const res = await fetch("/api/incentives/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            cache: "no-store",
          })
          const json = (await res.json()) as QuoteBody
          if (json?.ok && json.view) cache.set(signature, json.view)
          return json
        })

        // A response from a superseded address must never land.
        if (cancelled || myToken !== token.current) return

        if (result?.ok && result.view) {
          setState({ status: "ready", view: result.view })
        } else {
          setState({
            status: "error",
            message: result?.error?.message ?? "Could not check incentives.",
            retryable: Boolean(result?.error?.retryable),
          })
        }
      } catch {
        if (cancelled || myToken !== token.current) return
        setState({
          status: "error",
          message: "Could not reach the incentives service.",
          retryable: true,
        })
      }
    }, lookupDelay(lastSent.current, locSig))

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, linesJson, enabled, addressReady, hasDevices, nonce])

  return { state, retry }
}
