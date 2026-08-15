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
import {
  addressSignature,
  isAddressComplete,
  shortLocality,
  type ShippingAddress,
} from "@/lib/address"
import { useStoredAddress } from "@/lib/use-address"
import { deviceSignature, type DeviceLine } from "./devices"
import type { IncentiveView } from "./model"

export type QuoteState =
  | { status: "idle" }
  | { status: "loading"; locality: string }
  | { status: "ready"; view: IncentiveView }
  | { status: "error"; message: string; retryable: boolean }

interface IncentivesApi {
  address: ShippingAddress
  setAddress: (a: ShippingAddress) => void
  setField: (field: keyof ShippingAddress, value: string) => void
  addressReady: boolean
  addressComplete: boolean
  /** Session cache, keyed by address + device set. Program data changes, so it
   *  never outlives the tab and is emptied whenever the address moves. */
  cache: Map<string, IncentiveView>
}

const IncentivesContext = createContext<IncentivesApi | null>(null)

export function IncentivesProvider({ children }: { children: React.ReactNode }) {
  const { address, setAddress, setField, hydrated } = useStoredAddress()
  const cache = useRef(new Map<string, IncentiveView>()).current
  const lastAddress = useRef<string | null>(null)

  const addrSig = addressSignature(address)

  // A new address invalidates every cached result: they are address-specific,
  // and a stale one rendered under a new address is the worst failure here.
  //
  // Deliberately does NOT touch the token. Child effects run before parent
  // effects, so a consumer has already claimed its token by the time this runs;
  // bumping here would invalidate the very request that was just started and
  // every first lookup after an address change would be silently dropped.
  // Superseding is already handled by the consumer: the signature changes, the
  // effect cleanup aborts, and each request compares its own token on return.
  useEffect(() => {
    if (lastAddress.current !== null && lastAddress.current !== addrSig) {
      cache.clear()
    }
    lastAddress.current = addrSig
  }, [addrSig, cache])

  const value = useMemo<IncentivesApi>(
    () => ({
      address,
      setAddress,
      setField,
      addressReady: hydrated,
      addressComplete: isAddressComplete(address),
      cache,
    }),
    [address, setAddress, setField, hydrated, cache],
  )

  return <IncentivesContext.Provider value={value}>{children}</IncentivesContext.Provider>
}

export function useIncentives(): IncentivesApi {
  const ctx = useContext(IncentivesContext)
  if (!ctx) throw new Error("useIncentives must be used inside IncentivesProvider")
  return ctx
}

const DEBOUNCE_MS = 500

/**
 * Runs a lookup for a device set at the shared address.
 *
 * Re-runs on a signature of address plus device set, so a quantity change
 * refreshes the numbers and a re-render does not. Never keys on "no result yet",
 * which would leave the cart stale after an edit.
 */
export function useIncentiveQuote(
  lines: DeviceLine[],
  options: { mode?: "preview" | "checkout"; referenceId?: string; enabled?: boolean } = {},
): { state: QuoteState; retry: () => void } {
  const { address, addressComplete, addressReady, cache } = useIncentives()
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

  const addrSig = addressSignature(address)
  const devSig = deviceSignature(lines)
  const signature = `${addrSig}::${devSig}::${mode}`
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
    if (!addressComplete || !hasDevices) {
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

    setState({ status: "loading", locality: shortLocality(address) })

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/incentives/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
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
  }, [signature, linesJson, enabled, addressReady, addressComplete, hasDevices, nonce])

  return { state, retry }
}
