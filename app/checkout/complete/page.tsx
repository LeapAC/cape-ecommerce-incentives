"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { formatAddress } from "@/lib/address"
import { money, moneyExact } from "@/lib/format"
import { lastOrderId, loadOrder, type Order } from "@/lib/order"
import { TopIsWater } from "@/lib/water-top"
import { Horizon, WaveEdge } from "@/components/ocean/horizon"
import { ArrowRight, Bolt, Check, Truck } from "@/components/icons"

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Complete />
    </Suspense>
  )
}

function Complete() {
  const params = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = params.get("order") ?? lastOrderId()
    setOrder(id ? loadOrder(id) : null)
    setReady(true)
  }, [params])

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-28">
        <TopIsWater />
        <Horizon horizon={68} trim />
        <div className="on-water relative mx-auto max-w-[88rem] px-5 sm:px-8">
          <p className="rise rise-1 label muted-water flex items-center gap-2">
            <Check className="h-4 w-4" />
            Order placed
          </p>
          <h1 className="rise rise-2 display mt-5 max-w-[16ch] text-[clamp(2.4rem,6.5vw,4.8rem)]">
            That's it. Go outside.
          </h1>
          {order && (
            <p className="rise rise-3 muted-water mt-6 text-lg">
              Order <span className="tabular font-semibold">{order.id}</span> · confirmation sent to{" "}
              {order.address.email || "your email"}
            </p>
          )}
        </div>
        <div className="absolute inset-x-0 -bottom-px z-20">
          <WaveEdge fill="var(--paper)" />
        </div>
      </section>

      <div className="mx-auto grid max-w-[88rem] gap-x-16 gap-y-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <div className="space-y-10">
          <section>
            <h2 className="display text-[1.8rem]">What happens next</h2>
            <ol className="mt-6 space-y-5">
              <Step n="1" title="We pick and pack">
                Everything in stock leaves the warehouse within two business days.
              </Step>
              <Step n="2" title="You get tracking">
                One email, one link, no account required.
              </Step>
              <Step n="3" title="Install, if you booked it">
                A licensed electrician calls within three days to schedule.
              </Step>
              {order?.leap?.connect_url && (
                <Step n="4" title="Claim your rebates">
                  Once the charger is in, confirm your details with Leap. Most programs need the
                  install date and a photo, and it takes a few minutes.
                </Step>
              )}
            </ol>
          </section>

          {order?.leap && <ClaimHandoff leap={order.leap} />}
        </div>

        <aside>
          {ready && order ? (
            <div className="card p-6">
              <h2 className="display text-[1.6rem]">Your order</h2>

              <ul className="mt-5 divide-y">
                {order.lines.map((l) => (
                  <li key={l.slug} className="flex gap-4 py-3.5 text-sm">
                    <span className="tabular text-muted w-6">{l.quantity}×</span>
                    <span className="flex-1">{l.name}</span>
                    <span className="tabular">{moneyExact(l.unitPrice * l.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tabular">{moneyExact(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="tabular">
                    {order.shipping === 0 ? "Free" : moneyExact(order.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Tax</dt>
                  <dd className="tabular">{moneyExact(order.tax)}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <dt>Paid</dt>
                  <dd className="tabular">{moneyExact(order.total)}</dd>
                </div>
              </dl>

              <div className="text-muted mt-5 flex gap-3 border-t pt-5 text-sm">
                <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {order.address.name}
                  <br />
                  {formatAddress(order.address)}
                </span>
              </div>
            </div>
          ) : ready ? (
            <div className="card p-6">
              <p className="text-muted text-sm">
                No order details on this device. Your confirmation email has everything.
              </p>
            </div>
          ) : null}

          <Link href="/shop" className="btn btn-ghost mt-6 w-full">
            Keep looking
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </>
  )
}

/**
 * The post-purchase handoff.
 *
 * cape promised this money while the shopper was still deciding, so the
 * confirmation page has to say plainly how they get it. The customer files the
 * claim themselves; cape hands over the deep link Leap returned and never
 * builds its own URL. Leap emails them separately, so there is no duplicate
 * confirmation here.
 *
 * The claim only completes after installation, which is the real reason this is
 * a saved link rather than a "finish now" button.
 */
function ClaimHandoff({ leap }: { leap: NonNullable<Order["leap"]> }) {
  const back = leap.installAmount ?? 0
  const perYear = leap.ongoingAmount ?? 0
  if (!leap.connect_url && back === 0 && perYear === 0) return null

  return (
    <section
      className="rounded-2xl p-6"
      style={{ background: "var(--shell-sunk)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-center gap-2.5">
        <Bolt className="h-4 w-4 shrink-0" style={{ color: "var(--sun)" }} />
        <h2 className="label">Your rebates</h2>
      </div>

      {(back > 0 || perYear > 0) && (
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
          {back > 0 && (
            <div>
              <p className="tabular display text-[2.3rem] leading-none">{money(back)}</p>
              <p className="text-ink-soft mt-1.5 text-sm">back after install</p>
            </div>
          )}
          {perYear > 0 && (
            <div>
              <p className="tabular serif text-[1.3rem] leading-none">
                +{money(perYear)}
                <span className="text-muted text-[0.8rem]"> /yr</span>
              </p>
              <p className="label-sm text-muted mt-1.5">from VPP</p>
            </div>
          )}
        </div>
      )}

      <p className="text-ink-soft mt-5 max-w-[58ch] text-sm leading-relaxed">
        You file these{leap.utilityName ? ` with ${leap.utilityName}` : ""}, through Leap. We have
        already passed over everything we know about your order, so what is left is the install
        date and anything the program asks to see. Leap will email you and track each claim through
        to payment.
      </p>

      {leap.connect_url ? (
        <>
          <a
            href={leap.connect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-pop mt-5"
          >
            Start your claim
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-muted mt-3 text-xs leading-snug">
            Bookmark this: the claim can only be completed once your charger is installed. If the
            link is not ready yet, give it a minute and reload.
          </p>
        </>
      ) : (
        <p className="text-muted mt-5 text-xs leading-snug">
          We are still setting up your claim. Leap will email you a link shortly.
        </p>
      )}

      <p className="text-muted mt-4 border-t pt-4 text-xs">
        Reference <span className="tabular font-semibold">{leap.reference_id}</span>
      </p>
    </section>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span
        className="label-sm flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        {n}
      </span>
      <div>
        <h3 className="serif text-[1.1rem]">{title}</h3>
        <p className="text-ink-soft mt-1 text-sm leading-snug">{children}</p>
      </div>
    </li>
  )
}
