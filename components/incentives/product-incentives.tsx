"use client"

import { useMemo } from "react"
import { useIncentiveQuote } from "@/lib/incentives/context"
import { IncentivePanel } from "./incentive-panel"

/**
 * Placement 1 of 3, on the product page: awareness.
 *
 * Products with no Leap mapping render nothing at all rather than an empty
 * card, which is the right outcome for foils, craft, and kit.
 */
export function ProductIncentives({ slug, deviceId }: { slug: string; deviceId?: string }) {
  const lines = useMemo(
    () => (deviceId ? [{ slug, deviceId, quantity: 1 }] : []),
    [slug, deviceId],
  )
  const { state, retry } = useIncentiveQuote(lines, { enabled: Boolean(deviceId) })

  if (!deviceId) return null
  return <IncentivePanel state={state} retry={retry} />
}
