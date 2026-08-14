"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { formatAddress } from "@/lib/address"
import { moneyExact } from "@/lib/format"
import { lastOrderId, loadOrder, type Order } from "@/lib/order"
import { TopIsWater } from "@/lib/water-top"
import { Horizon, WaveEdge } from "@/components/ocean/horizon"
import { ArrowRight, Check, Truck } from "@/components/icons"

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
            </ol>

            {/*
              Leap incentives handoff.
              The connect_url returned at checkout belongs here as a clear next
              step, alongside a line naming who files the claim. Renders once
              the integration lands and order.leap is populated.
            */}
          </section>
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
