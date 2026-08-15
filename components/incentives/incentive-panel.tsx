"use client"

import { money } from "@/lib/format"
import type { QuoteState } from "@/lib/incentives/context"
import { PAYOUT_LABEL, type IncentiveView, type Payout } from "@/lib/incentives/model"
import { AddressForm } from "./address-form"
import { Bolt, Check, ChevronDown, Info } from "@/components/icons"

/**
 * The incentives card. One component, four states, rendered from the display
 * model so the product page, cart, and checkout cannot drift apart.
 */
export function IncentivePanel({
  state,
  retry,
  /** Compact drops the program breakdown, for the cart and order summary. */
  compact = false,
}: {
  state: QuoteState
  retry: () => void
  compact?: boolean
}) {
  return (
    <section className="card p-5" aria-live="polite">
      <header className="flex items-center gap-2.5">
        <Bolt className="h-4 w-4 shrink-0" style={{ color: "var(--sun)" }} />
        <h3 className="label">Rebates and VPP</h3>
        {state.status === "ready" && state.view.utilityName && (
          <span className="label-sm text-muted ml-auto truncate">
            via {state.view.utilityName}
          </span>
        )}
      </header>

      <div className="mt-4">
        {state.status === "idle" && <Teaser />}
        {state.status === "loading" && <Loading locality={state.locality} />}
        {state.status === "error" && <ErrorState message={state.message} retry={retry} />}
        {state.status === "ready" &&
          (state.view.hasOffer ? (
            <Offer view={state.view} compact={compact} />
          ) : (
            <NoPrograms view={state.view} />
          ))}
      </div>
    </section>
  )
}

/* ── states ──────────────────────────────────────────────────────────────── */

function Teaser() {
  return (
    <div className="grid gap-4">
      <p className="text-ink-soft text-sm leading-snug">
        Rebates and VPP earnings are available on this charger. Add your address to see what you
        qualify for: programs are set by the utility that serves you.
      </p>
      <AddressForm />
    </div>
  )
}

function Loading({ locality }: { locality: string }) {
  return (
    <div className="grid gap-4">
      <p className="text-ink-soft text-sm">
        Checking incentives for {locality || "your address"}…
      </p>
      <div className="grid gap-2.5" aria-hidden>
        <Bar w="55%" h="2.4rem" />
        <Bar w="80%" />
        <Bar w="70%" />
      </div>
    </div>
  )
}

function Bar({ w, h = "0.85rem" }: { w: string; h?: string }) {
  return (
    <div
      className="rounded"
      style={{ width: w, height: h, background: "var(--shell-sunk)", border: "1px solid var(--line)" }}
    />
  )
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="grid gap-3">
      <p className="text-ink-soft flex gap-2.5 text-sm leading-snug">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        {message} You can still complete your order.
      </p>
      <button type="button" onClick={retry} className="btn btn-ghost btn-sm justify-self-start">
        Try again
      </button>
      <AddressForm />
    </div>
  )
}

function NoPrograms({ view }: { view: IncentiveView }) {
  return (
    <div className="grid gap-4">
      <p className="text-ink-soft flex gap-2.5 text-sm leading-snug">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        {view.notice ??
          `No incentive programs are available for this item${
            view.utilityName ? ` in ${view.utilityName} territory` : " at this address"
          }.`}
      </p>

      <Unavailable view={view} />
      <AddressForm />
    </div>
  )
}

/* ── the offer ───────────────────────────────────────────────────────────── */

function Offer({ view, compact }: { view: IncentiveView; compact: boolean }) {
  return (
    <div className="grid gap-5">
      {/* Lead with the money, and say when it arrives. */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        {view.installTotal > 0 && (
          <div>
            <p className="tabular display text-[2.7rem] leading-none">
              {money(view.installTotal)}
            </p>
            <p className="text-ink-soft mt-1.5 text-sm">{PAYOUT_LABEL.install.headline}</p>
          </div>
        )}

        {view.ongoingTotal > 0 && (
          <div
            className="rounded-xl px-3.5 py-2.5"
            style={{ background: "var(--shell-sunk)", border: "1px solid var(--line)" }}
          >
            <p className="tabular serif text-[1.35rem] leading-none">
              +{money(view.ongoingTotal)}
              <span className="text-muted text-[0.8rem]"> /yr</span>
            </p>
            <p className="label-sm text-muted mt-1.5">{PAYOUT_LABEL.ongoing.headline}</p>
          </div>
        )}

        {view.upfrontTotal > 0 && (
          <div>
            <p className="tabular serif text-[1.35rem] leading-none">
              −{money(view.upfrontTotal)}
            </p>
            <p className="label-sm text-muted mt-1.5">{PAYOUT_LABEL.upfront.headline}</p>
          </div>
        )}
      </div>

      {!compact && view.groups.length > 0 && (
        <div className="grid gap-3 border-t pt-4">
          <p className="label text-muted">How you get paid</p>
          {view.groups.map((group) => (
            <div key={group.when} className="grid gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold">{PAYOUT_LABEL[group.when].row}</span>
                <span className="tabular ml-auto text-sm font-semibold">
                  {amountFor(group.when, group.total)}
                </span>
              </div>
              <ul className="grid gap-1">
                {group.programs.map((p) => (
                  <li key={p.name} className="text-muted flex items-baseline gap-3 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      {p.name}
                      {p.isPartnerOffer && " · offer"}
                    </span>
                    <span className="tabular shrink-0">{amountFor(group.when, p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!compact && <ClaimSteps view={view} />}
      {!compact && <Unavailable view={view} />}

      <p className="text-muted border-t pt-4 text-xs leading-snug">
        You file the claim, in a few minutes, through Leap after your charger is installed. These
        are estimates for this address and final amounts depend on each program&rsquo;s own review.
      </p>

      <AddressForm />
    </div>
  )
}

function amountFor(when: Payout, amount: number): string {
  if (when === "ongoing") return `${money(amount)}/yr`
  if (when === "upfront") return `−${money(amount)}`
  return money(amount)
}

/* ── nested detail ───────────────────────────────────────────────────────── */

function ClaimSteps({ view }: { view: IncentiveView }) {
  if (view.claimSteps.length === 0) return null

  return (
    <Disclosure
      summary={`${view.claimSteps.length} thing${
        view.claimSteps.length === 1 ? "" : "s"
      } you'll confirm when you claim`}
    >
      <p className="text-muted mb-3 text-xs leading-snug">
        Nothing to do now. These are the details each program asks for once the charger is in.
      </p>
      <ul className="grid gap-2">
        {view.claimSteps.map((step) => (
          <li key={step.requirement} className="text-ink-soft flex gap-2.5 text-xs leading-snug">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--sun)" }} />
            <span>{step.requirement}</span>
          </li>
        ))}
      </ul>
    </Disclosure>
  )
}

function Unavailable({ view }: { view: IncentiveView }) {
  if (view.unavailable.length === 0) return null
  const swappable = view.unavailable.some((u) => u.deviceSpecific)

  return (
    <Disclosure
      summary={`${view.unavailable.length} program${
        view.unavailable.length === 1 ? "" : "s"
      } this charger doesn't qualify for`}
    >
      <ul className="grid gap-2.5">
        {view.unavailable.map((u) => (
          <li key={u.name} className="text-xs leading-snug">
            <p className="font-semibold">{u.name}</p>
            <p className="text-muted mt-0.5">{u.reason}</p>
          </li>
        ))}
      </ul>
      {swappable && (
        <p className="text-muted mt-3 text-xs leading-snug">
          Approved-product lists differ by utility. Another cape charger may qualify at this
          address.
        </p>
      )}
    </Disclosure>
  )
}

function Disclosure({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group border-t pt-4">
      <summary className="label-sm text-muted hover:text-ink flex cursor-pointer list-none items-center gap-2 transition-colors">
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180" />
        {summary}
      </summary>
      <div className="mt-3.5">{children}</div>
    </details>
  )
}
