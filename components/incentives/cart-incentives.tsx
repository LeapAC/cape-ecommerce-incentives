"use client"

import { useMemo } from "react"
import { useCart } from "@/lib/cart"
import { money } from "@/lib/format"
import { useIncentiveQuote } from "@/lib/incentives/context"
import type { DeviceLine } from "@/lib/incentives/devices"
import { Bolt } from "@/components/icons"

/** Cart lines that map to a Leap catalog device, one entry per unit. */
export function useCartDeviceLines(): DeviceLine[] {
  const { lines } = useCart()
  return useMemo(
    () =>
      lines
        .filter((l) => l.incentive?.leapDeviceId)
        .map((l) => ({
          slug: l.slug,
          deviceId: l.incentive!.leapDeviceId,
          quantity: l.quantity,
        })),
    [lines],
  )
}

/**
 * Placement 2 of 3, in the cart: reinforcement.
 *
 * A single line, because the cart is not where anyone reads a program list. The
 * quantity is part of the lookup signature, so editing it re-runs the quote.
 */
export function CartIncentiveLine() {
  const { drawerOpen } = useCart()
  const deviceLines = useCartDeviceLines()
  // The drawer is mounted on every page. Only look up while it is actually
  // open, so browsing does not fire a duplicate lookup per page view.
  const { state } = useIncentiveQuote(deviceLines, { enabled: drawerOpen })

  if (state.status !== "ready" || !state.view.hasOffer) return null
  const { installTotal, ongoingTotal } = state.view

  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
      style={{ background: "var(--shell-sunk)", border: "1px solid var(--line)" }}
    >
      <Bolt className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--sun)" }} />
      <p className="text-ink-soft text-xs leading-snug">
        {installTotal > 0 && (
          <>
            <span className="text-ink font-semibold">{money(installTotal)}</span> back after
            install
          </>
        )}
        {installTotal > 0 && ongoingTotal > 0 && ", plus "}
        {ongoingTotal > 0 && (
          <>
            <span className="text-ink font-semibold">{money(ongoingTotal)}/yr</span> from VPP
          </>
        )}
        {state.view.utilityName && <> via {state.view.utilityName}</>}. Estimated for your address.
      </p>
    </div>
  )
}
