"use client"

import { useCallback, useEffect, useState } from "react"
import { EMPTY_ADDRESS, type ShippingAddress } from "./address"

export const ADDRESS_STORAGE_KEY = "cape-address"

/**
 * Address persisted client-side for the session, so one entered on a product
 * page prefills checkout.
 */
export function useStoredAddress() {
  const [address, setAddressState] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_STORAGE_KEY)
      if (raw) setAddressState({ ...EMPTY_ADDRESS, ...(JSON.parse(raw) as ShippingAddress) })
    } catch {
      /* fall back to empty */
    }
    setHydrated(true)
  }, [])

  const persist = (next: ShippingAddress) => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* nothing useful to do here */
    }
    return next
  }

  const setAddress = useCallback((next: ShippingAddress) => {
    setAddressState(persist(next))
  }, [])

  const setField = useCallback((field: keyof ShippingAddress, value: string) => {
    setAddressState((prev) => persist({ ...prev, [field]: value }))
  }, [])

  /** Merge fields into the latest address, never a captured copy. */
  const mergeAddress = useCallback((patch: Partial<ShippingAddress>) => {
    setAddressState((prev) => persist({ ...prev, ...patch }))
  }, [])

  return { address, setAddress, setField, mergeAddress, hydrated }
}
