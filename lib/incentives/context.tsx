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
import { ADDRESS_STORAGE_KEY, useStoredAddress } from "@/lib/use-address"
import { deviceSignature, type DeviceLine } from "./devices"
import {
  LOOKUP_MODE_PARAM,
  LOOKUP_MODE_STORAGE_KEY,
  addressLocation,
  locationLabel,
  locationSignature,
  parseLookupMode,
  parseStoredLocation,
  postalFrom,
  resolveLookupMode,
  zipLocation,
  type LookupLocation,
  type LookupMode,
  type PostalAddress,
} from "./location"
import type { IncentiveView } from "./model"

export type QuoteState =
  | { status: "idle" }
  | { status: "loading"; locality: string }
  | { status: "ready"; view: IncentiveView }
  | { status: "error"; message: string; retryable: boolean }

interface IncentivesApi {
  /** The shipping address as typed. A draft: editing it never runs a lookup. */
  address: ShippingAddress
  setAddress: (a: ShippingAddress) => void
  /** Merge fields into the latest address, for callbacks that ran an await. */
  mergeAddress: (patch: Partial<ShippingAddress>) => void
  /** The latest address, not the one captured when a callback was created. */
  currentAddress: () => ShippingAddress
  setField: (field: keyof ShippingAddress, value: string) => void
  addressReady: boolean
  addressComplete: boolean
  /** How the site asks for a location: full address (default) or ZIP only. */
  lookupMode: LookupMode
  /** The committed location for the current mode. Lookups key on this alone. */
  location: LookupLocation | null
  /** Commit a full address: a picked suggestion or a submitted form. */
  commitAddress: (a: Partial<PostalAddress>) => boolean
  /** Commit a ZIP in ZIP mode. */
  commitZip: (zip: string) => boolean
  /** Session cache, keyed by location + device set. Program data changes, so it
   *  never outlives the tab and is emptied whenever the location moves. */
  cache: Map<string, IncentiveView>
}

const IncentivesContext = createContext<IncentivesApi | null>(null)

const LOCATION_STORAGE_KEY = "cape-lookup-location"

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
 * NEXT_PUBLIC_LOOKUP_MODE, then full address.
 */
function readLookupMode(): LookupMode {
  try {
    const url = new URL(window.location.href)
    const param = url.searchParams.get(LOOKUP_MODE_PARAM)
    if (param !== null) {
      const chosen = parseLookupMode(param)
      writeStorage(LOOKUP_MODE_STORAGE_KEY, chosen)
      url.searchParams.delete(LOOKUP_MODE_PARAM)
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
    }
  } catch {
    /* fall through to the stored or default mode */
  }
  return resolveLookupMode(readStorage(LOOKUP_MODE_STORAGE_KEY), process.env.NEXT_PUBLIC_LOOKUP_MODE)
}

function readCommitted(): Committed {
  const none: Committed = { address: null, zip: null }
  try {
    const raw = readStorage(LOCATION_STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<Record<keyof Committed, unknown>>
      return { address: parseStoredLocation(parsed?.address), zip: parseStoredLocation(parsed?.zip) }
    }
    // Sessions from before commit-on-submit kept one live address. Adopt it
    // once as committed, so an address someone already entered keeps working.
    const legacy = readStorage(ADDRESS_STORAGE_KEY)
    return legacy ? { ...none, address: addressLocation(JSON.parse(legacy)) } : none
  } catch {
    return none
  }
}

export function IncentivesProvider({ children }: { children: React.ReactNode }) {
  const { address, setAddress, setField, mergeAddress, currentAddress, hydrated: addressHydrated } =
    useStoredAddress()
  const cache = useRef(new Map<string, IncentiveView>()).current
  const lastLocation = useRef<string | null>(null)

  const [lookup, setLookup] = useState<{ mode: LookupMode; committed: Committed; hydrated: boolean }>({
    mode: "address",
    committed: { address: null, zip: null },
    hydrated: false,
  })
  const { mode: lookupMode, committed, hydrated: lookupHydrated } = lookup
  const setCommitted = useCallback(
    (update: (c: Committed) => Committed) =>
      setLookup((l) => ({ ...l, committed: update(l.committed) })),
    [],
  )

  // Hydrate once from storage, in a single update.
  useEffect(() => {
    setLookup({ mode: readLookupMode(), committed: readCommitted(), hydrated: true })
  }, [])

  useEffect(() => {
    if (!lookupHydrated) return
    writeStorage(LOCATION_STORAGE_KEY, JSON.stringify(committed))
  }, [committed, lookupHydrated])

  const commitAddress = useCallback(
    (a: Partial<PostalAddress>) => {
      const loc = addressLocation(a)
      if (!loc) return false
      setCommitted((c) => ({ ...c, address: loc }))
      // The committed address is also where the order ships. Merged into the
      // latest state, so name and email typed during a pick are kept.
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
      currentAddress,
      setField,
      addressReady: addressHydrated && lookupHydrated,
      addressComplete: isAddressComplete(address),
      lookupMode,
      location,
      commitAddress,
      commitZip,
      cache,
    }),
    [
      address,
      setAddress,
      mergeAddress,
      currentAddress,
      setField,
      addressHydrated,
      lookupHydrated,
      lookupMode,
      location,
      commitAddress,
      commitZip,
      cache,
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
 * Coalesces rapid quantity clicks into one lookup. Address entry is already
 * gated on commit, so this is not what stops per-keystroke lookups.
 */
const DEBOUNCE_MS = 300

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
  const { location, addressReady, cache } = useIncentives()
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
    const controller = new AbortController()
    let cancelled = false

    setState({ status: "loading", locality: locationLabel(location) })

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/incentives/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location,
            devices: JSON.parse(linesJson).map(
              ([slug, deviceId, quantity]: [string, string, number]) => ({
                slug,
                deviceId,
                quantity,
              }),
            ),
            mode,
            referenceId,
          }),
          signal: controller.signal,
          cache: "no-store",
        })

        const body = await res.json()
        // A response from a superseded address must never land.
        if (cancelled || myToken !== token.current) return

        if (body?.ok) {
          cache.set(signature, body.view)
          setState({ status: "ready", view: body.view })
        } else {
          setState({
            status: "error",
            message: body?.error?.message ?? "Could not check incentives.",
            retryable: Boolean(body?.error?.retryable),
          })
        }
      } catch (err) {
        if (cancelled || (err as { name?: string })?.name === "AbortError") return
        if (myToken !== token.current) return
        setState({
          status: "error",
          message: "Could not reach the incentives service.",
          retryable: true,
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, linesJson, enabled, addressReady, hasDevices, nonce])

  return { state, retry }
}
