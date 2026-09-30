"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/lib/cart"
import { useIncentives, useIncentiveQuote } from "@/lib/incentives/context"
import { canPlaceOrder, leapSnapshot, quoteAppliesToShipTo } from "@/lib/checkout-rules"
import {
  addressLocation,
  locationSignature,
  postalFrom,
  type LookupLocation,
} from "@/lib/incentives/location"
import { IncentivePanel } from "@/components/incentives/incentive-panel"
import { AddressAutocomplete } from "@/components/incentives/address-autocomplete"
import { STATES } from "@/components/incentives/address-form"
import { useCartDeviceLines } from "@/components/incentives/cart-incentives"
import { money, moneyExact } from "@/lib/format"
import {
  newOrderId,
  orderLinesFrom,
  saveOrder,
  totalsFor,
  type Order,
} from "@/lib/order"
import { TopIsWater } from "@/lib/water-top"
import { Horizon, WaveEdge } from "@/components/ocean/horizon"
import { ProductArt } from "@/components/product-art"
import { ArrowRight, Check, Minus, Plus } from "@/components/icons"

export default function CheckoutPage() {
  const { lines, subtotal, setQuantity, clear, hydrated } = useCart()
  const { address, setAddress, setField, addressReady, lookupMode, location, commitAddress } =
    useIncentives()
  const router = useRouter()
  const [placing, setPlacing] = useState(false)

  // Browsing preview: no application is created while the shopper is still
  // deciding. The durable lookup happens once, at order placement.
  //
  // Typing the shipping address edits a draft and never runs a lookup. In
  // address mode the preview moves only when the shopper picks a suggestion or
  // submits the address; in ZIP mode it follows the ZIP in the incentives card.
  const deviceLines = useCartDeviceLines()
  const draftLocation = addressLocation(address)
  const canCheckAddress =
    lookupMode === "address" &&
    deviceLines.length > 0 &&
    draftLocation !== null &&
    locationSignature(draftLocation) !== locationSignature(location)
  const quote = useIncentiveQuote(deviceLines)
  const view = quote.state.status === "ready" ? quote.state.view : null
  // The summary's money must describe the address being ordered. The card
  // below still shows the committed estimate, labelled with where it ran.
  const summaryView = view && quoteAppliesToShipTo(address, location) ? view : null

  const totals = totalsFor(subtotal)
  const upfront = summaryView?.upfrontTotal ?? 0
  const dueToday = Math.max(0, totals.total - upfront)
  const backAfter = summaryView?.installTotal ?? 0
  const perYear = summaryView?.ongoingTotal ?? 0
  const canPlace = canPlaceOrder(lines.length, address)

  const placeOrder = async () => {
    if (!canPlace || placing) return
    setPlacing(true)

    const id = newOrderId()
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      address,
      lines: orderLinesFrom(lines),
      ...totals,
    }

    // The durable lookup: one reference_id derived from the order, held for
    // this shopper at this address, with an application created so connect_url
    // is a working link. A failure here must never block the order, so the
    // result is best-effort and the order is saved either way.
    if (deviceLines.length > 0) {
      const referenceId = `cape-${id}`
      try {
        // Always the full shipping address, in either mode: an application is
        // pinned to the address it was created with.
        const shipTo: LookupLocation = { kind: "address", ...postalFrom(address) }
        const res = await fetch("/api/incentives/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: shipTo, devices: deviceLines, mode: "checkout", referenceId }),
          cache: "no-store",
        })
        order.leap = leapSnapshot(referenceId, await res.json())
      } catch {
        // Keep the reference_id regardless: without it the rebate cannot be
        // reconciled to this order later.
        order.leap = { reference_id: referenceId }
      }
    }

    saveOrder(order)
    clear()
    router.push(`/checkout/complete?order=${order.id}`)
  }

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-24">
        <TopIsWater />
        <Horizon horizon={72} trim />
        <div className="on-water relative mx-auto max-w-[88rem] px-5 sm:px-8">
          <p className="label muted-water">Step two of two</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4rem)]">Checkout</h1>
        </div>
        <div className="absolute inset-x-0 -bottom-px z-20">
          <WaveEdge fill="var(--paper)" />
        </div>
      </section>

      {hydrated && lines.length === 0 ? (
        <EmptyCheckout />
      ) : (
        <div className="mx-auto grid max-w-[88rem] gap-x-16 gap-y-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          {/* ── form ──────────────────────────────────────────────────── */}
          <div className="min-w-0 space-y-12">
            <Section n="1" title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={address.name}
                  onChange={(v) => setField("name", v)}
                  autoComplete="name"
                  disabled={!addressReady}
                />
                <Field
                  label="Email"
                  type="email"
                  value={address.email}
                  onChange={(v) => setField("email", v)}
                  autoComplete="email"
                  disabled={!addressReady}
                />
              </div>
            </Section>

            <Section
              n="2"
              title="Shipping address"
              note="Rebate programs are set by the utility that serves this address, so the full street address matters."
            >
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (canCheckAddress) commitAddress(address)
                }}
              >
                <div>
                  <label className="label-sm text-muted" htmlFor="street-address">
                    Street address
                  </label>
                  <div className="mt-2">
                    <AddressAutocomplete
                      id="street-address"
                      value={address.address_line_1}
                      onChange={(v) => setField("address_line_1", v)}
                      onPick={(picked) => {
                        // A picked suggestion is a committed address in address
                        // mode. In ZIP mode it only fills the shipping form.
                        if (lookupMode !== "address" || !commitAddress(picked)) {
                          setAddress({ ...address, ...picked })
                        }
                      }}
                      autoComplete="address-line1"
                      disabled={!addressReady}
                    />
                  </div>
                </div>
                <Field
                  label="Apartment, unit, suite"
                  optional
                  value={address.address_line_2}
                  onChange={(v) => setField("address_line_2", v)}
                  autoComplete="address-line2"
                  disabled={!addressReady}
                />
                <div className="grid gap-4 sm:grid-cols-[1.4fr_0.7fr_0.9fr]">
                  <Field
                    label="City"
                    value={address.city}
                    onChange={(v) => setField("city", v)}
                    autoComplete="address-level2"
                    disabled={!addressReady}
                  />
                  <div>
                    <label className="label-sm text-muted" htmlFor="state">
                      State
                    </label>
                    <select
                      id="state"
                      className="field mt-2"
                      value={address.state}
                      onChange={(e) => setField("state", e.target.value)}
                      autoComplete="address-level1"
                      disabled={!addressReady}
                    >
                      <option value="">—</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Field
                    label="ZIP"
                    inputMode="numeric"
                    maxLength={5}
                    value={address.zip_code}
                    onChange={(v) => setField("zip_code", v.replace(/\D/g, "").slice(0, 5))}
                    autoComplete="postal-code"
                    disabled={!addressReady}
                  />
                </div>
                {lookupMode === "address" && deviceLines.length > 0 && (
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm justify-self-start"
                    disabled={!canCheckAddress}
                  >
                    Check incentives
                  </button>
                )}
              </form>
            </Section>

            <Section n="3" title="Delivery">
              <div className="space-y-3">
                <Choice
                  title="Standard"
                  body="Two to five business days"
                  price={totals.shipping === 0 ? "Free" : money(totals.shipping)}
                  selected
                />
              </div>
            </Section>

            <Section n="4" title="Payment" note="Demonstration storefront. No card is charged and no card details are stored.">
              <div className="grid gap-4">
                <Field label="Card number" placeholder="4242 4242 4242 4242" value="" onChange={() => {}} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Expiry" placeholder="12 / 29" value="" onChange={() => {}} />
                  <Field label="CVC" placeholder="123" value="" onChange={() => {}} />
                </div>
              </div>
            </Section>
          </div>

          {/* ── summary ───────────────────────────────────────────────── */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6" style={{ overflow: "visible" }}>
              <h2 className="display text-[1.8rem]">Order summary</h2>

              <ul className="mt-6 divide-y">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-4 py-4">
                    <div className="overflow-hidden rounded-lg border">
                      <ProductArt art={line.art} className="h-16 w-16" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="serif text-[1rem] leading-tight">{line.name}</p>
                      <div className="mt-2 flex items-center rounded-full border" style={{ width: "fit-content" }}>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center"
                          aria-label={`Fewer ${line.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="tabular w-5 text-center text-xs">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center"
                          aria-label={`More ${line.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <span className="tabular text-sm font-semibold">
                      {money(line.price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2.5 border-t pt-5 text-sm">
                <Row label="Subtotal" value={moneyExact(totals.subtotal)} />
                <Row
                  label="Shipping"
                  value={totals.shipping === 0 ? "Free" : moneyExact(totals.shipping)}
                />
                <Row label="Estimated tax" value={moneyExact(totals.tax)} />
              </dl>

              {/* Point-of-sale discount is the only incentive that touches what
                  is due today. Everything else arrives after purchase and is
                  kept in its own block below. */}
              {upfront > 0 && (
                <dl className="mt-2.5 text-sm">
                  <Row label="Instant rebate" value={`−${moneyExact(upfront)}`} />
                </dl>
              )}

              <div className="mt-5 flex items-baseline gap-3 border-t pt-5">
                <span className="label">Due today</span>
                <span className="tabular display ml-auto text-[2.1rem]">
                  {moneyExact(dueToday)}
                </span>
              </div>

              {(backAfter > 0 || perYear > 0) && (
                <div
                  className="mt-3 rounded-lg px-3 py-2.5"
                  style={{ background: "var(--shell-sunk)", border: "1px solid var(--line)" }}
                >
                  <p className="label-sm text-muted">After purchase</p>
                  <dl className="mt-2 space-y-1.5 text-[0.8125rem]">
                    {backAfter > 0 && (
                      <Row label="Incentives back after install" value={money(backAfter)} />
                    )}
                    {backAfter > 0 && (
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <dt>Effective cost</dt>
                        <dd className="tabular">{moneyExact(Math.max(0, dueToday - backAfter))}</dd>
                      </div>
                    )}
                    {perYear > 0 && (
                      <Row label="VPP earnings" value={`${money(perYear)} per year`} />
                    )}
                  </dl>
                  <p className="text-muted mt-2 text-[0.6875rem] leading-snug">
                    Paid by {summaryView?.utilityName ?? "your utility"} after your charger is installed,
                    not deducted from today&rsquo;s total. You file the claim through Leap.
                  </p>
                </div>
              )}

              {/* Leap incentives placement 3 of 3: applied. */}
              {deviceLines.length > 0 && (
                <div className="mt-3">
                  <IncentivePanel state={quote.state} retry={quote.retry} compact />
                </div>
              )}

              <button
                type="button"
                onClick={placeOrder}
                disabled={!canPlace || placing}
                className="btn btn-pop mt-6 w-full"
              >
                {placing ? "Placing order…" : "Place order"}
                {!placing && <ArrowRight className="h-4 w-4" />}
              </button>

              {!canPlace && hydrated && (
                <p className="text-muted mt-3 text-center text-xs">
                  Add your name, email, and a full shipping address to continue.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

function EmptyCheckout() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-28 text-center sm:px-8">
      <p className="wonk text-[2rem]">Your cart is empty.</p>
      <p className="text-muted mx-auto mt-4 max-w-[38ch]">
        Hard to check out with nothing in it. The chargers are the sensible place to start.
      </p>
      <Link href="/shop/chargers" className="btn btn-ink mt-8">
        Shop chargers
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span
          className="label-sm flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {n}
        </span>
        <h2 className="display text-[1.7rem]">{title}</h2>
      </div>
      {note && <p className="text-muted mt-3 max-w-[54ch] text-sm leading-snug">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  optional,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-")
  return (
    <div>
      <label className="label-sm text-muted" htmlFor={id}>
        {label}
        {optional && <span className="ml-1.5 opacity-60">optional</span>}
      </label>
      <input
        id={id}
        className="field mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  )
}

function Choice({
  title,
  body,
  price,
  selected,
}: {
  title: string
  body: string
  price: string
  selected?: boolean
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border px-4 py-4"
      style={{
        borderColor: selected ? "var(--ink)" : "var(--line)",
        background: selected ? "var(--shell)" : "transparent",
      }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: selected ? "var(--ink)" : "var(--line-strong)",
          background: selected ? "var(--ink)" : "transparent",
          color: "var(--paper)",
        }}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted text-xs">{body}</p>
      </div>
      <span className="label-sm ml-auto">{price}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  )
}
