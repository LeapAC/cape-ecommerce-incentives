"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { EMPTY_ADDRESS, type ShippingAddress } from "./address"

const subscribeNever = () => () => {}

/**
 * The shipping address draft, held in memory for this page session only.
 *
 * It carries across client navigation, so an address entered on a product page
 * prefills checkout. It is never written to storage: a reload starts empty, so
 * a demo can show the entry from scratch every time.
 *
 * `hydrated` flips after mount, so fields stay disabled until React owns them
 * and a value typed before hydration is never lost.
 */
export function useSessionAddress() {
  const [address, setAddressState] = useState<ShippingAddress>(EMPTY_ADDRESS)
  // False on the server and during hydration, true once the client owns the tree.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false)

  const setAddress = useCallback((next: ShippingAddress) => {
    setAddressState(next)
  }, [])

  const setField = useCallback((field: keyof ShippingAddress, value: string) => {
    setAddressState((prev) => ({ ...prev, [field]: value }))
  }, [])

  /** Merge fields into the latest address, never a captured copy. */
  const mergeAddress = useCallback((patch: Partial<ShippingAddress>) => {
    setAddressState((prev) => ({ ...prev, ...patch }))
  }, [])

  return { address, setAddress, setField, mergeAddress, hydrated }
}
