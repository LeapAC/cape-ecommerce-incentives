/**
 * cape's display model for incentive results.
 *
 * The raw envelope is normalized here, once, and every surface renders from
 * this. If the product page, cart, and checkout each read the API response
 * directly they will drift.
 *
 * Two things the API makes easy to get wrong, both handled here:
 *
 * 1. A program appearing in `program_details` does NOT mean the customer
 *    qualifies. SMUD returns its Charge@Home program with every tier FAILED and
 *    zero amounts when the device is not on the approved-product list. Gating on
 *    `program_details.length > 0` renders "$0 back" as if it were an offer.
 * 2. The three amounts arrive at different times and one of them repeats every
 *    year. They are never blended into a single savings number.
 */

import type {
  EligibilityCheck,
  EligibilityResult,
  EligibleProgram,
  PaymentType,
} from "@/lib/leap/types"

/** When the money reaches the customer. */
export type Payout = "install" | "ongoing" | "upfront"

export const PAYOUT_BY_PAYMENT: Record<PaymentType, Payout> = {
  UPFRONT: "upfront",
  INSTALL: "install",
  ONGOING: "ongoing",
}

export interface ProgramRow {
  name: string
  operator: string | null
  amount: number
  termsUrl: string | null
  isPartnerOffer: boolean
}

export interface PayoutGroup {
  when: Payout
  total: number
  programs: ProgramRow[]
}

/**
 * Something the customer will have to do or confirm during the claim. Derived
 * from IGNORED checks, which are not rejections: they are inputs that do not
 * exist until after the sale.
 */
export interface ClaimStep {
  requirement: string
  kind: "agreement" | "record" | "condition"
  programName: string
}

/** A program that came back but yields nothing at this address for this device. */
export interface UnavailableProgram {
  name: string
  reason: string
  /**
   * True when the only thing blocking it is this particular device: the wrong
   * class, or absent from the program's approved-product list. That is
   * recoverable by choosing a different charger, so it is worth showing.
   */
  deviceSpecific: boolean
}

export interface IncentiveView {
  /** True when there is real money to show. Not the same as "programs came back". */
  hasOffer: boolean
  /** True only when Leap returned a usable Connect link. */
  canApply: boolean

  /** One-time, paid after purchase and install. The headline. */
  installTotal: number
  /** Recurring, dollars per year. Always labelled per year, never added in. */
  ongoingTotal: number
  /** Point-of-sale discount, reduces what is due today. Currently always 0. */
  upfrontTotal: number

  /** One entry per way the customer gets paid, one-time before ongoing. */
  groups: PayoutGroup[]
  claimSteps: ClaimStep[]
  unavailable: UnavailableProgram[]

  utilityName: string | null
  connectUrl: string | null
  referenceId: string
  /** Set when the address is outside any served territory. */
  notice: string | null
}

const PAYOUT_ORDER: Payout[] = ["install", "upfront", "ongoing"]

/**
 * A tier is achievable when no device failed it. Devices whose only open items
 * are IGNORED still count: those are post-sale facts, not rejections.
 */
function isAchievable(tier: EligibleProgram["tiers"][number]): boolean {
  return (tier.device_results ?? []).every((d) => d.status !== "FAILED")
}

function programAmount(program: EligibleProgram, when: Payout): number {
  const raw =
    when === "install"
      ? program.install_amount
      : when === "ongoing"
        ? program.ongoing_amount
        : program.upfront_amount
  return typeof raw === "number" && raw > 0 ? raw : 0
}

/**
 * Classify a pending requirement by its code prefix. The codes are structured
 * (`AGR-…` agreements, `CD-…` post-sale customer data) but not an enumerated
 * list, so an unrecognised prefix falls back to the neutral "condition" rather
 * than being dropped or mislabelled.
 */
function classify(check: EligibilityCheck): ClaimStep["kind"] {
  const code = check.code ?? ""
  if (code.startsWith("AGR-")) return "agreement"
  if (code.startsWith("CD-")) return "record"
  return "condition"
}

/**
 * Is this failure about the device itself? `APL-…` means the unit is not on the
 * program's approved-product list and `DEV-…` means the wrong device class.
 * Both are recoverable by buying something else, which is worth telling the
 * shopper. Everything else (territory, classification, rebate caps) is not.
 */
function isDeviceSpecific(check: EligibilityCheck): boolean {
  const code = check.code ?? ""
  return code.startsWith("APL-") || code.startsWith("DEV-")
}

export function toIncentiveView(
  result: EligibilityResult,
  notice: string | null = null,
): IncentiveView {
  const summary = result.incentive_summary ?? {
    upfront_amount: 0,
    install_amount: 0,
    ongoing_amount: 0,
  }

  const groups: PayoutGroup[] = []
  const claimSteps: ClaimStep[] = []
  const unavailable: UnavailableProgram[] = []
  const seenStep = new Set<string>()

  for (const when of PAYOUT_ORDER) {
    const rows: ProgramRow[] = []

    for (const program of result.program_details ?? []) {
      const amount = programAmount(program, when)
      if (amount <= 0) continue
      rows.push({
        name: program.display_name?.trim() || program.name,
        operator: program.operator_name ?? null,
        amount,
        termsUrl: program.terms_url ?? null,
        isPartnerOffer: Boolean(program.is_partner_offer),
      })
    }

    if (rows.length === 0) continue
    rows.sort((a, b) => b.amount - a.amount)
    groups.push({ when, total: rows.reduce((n, r) => n + r.amount, 0), programs: rows })
  }

  for (const program of result.program_details ?? []) {
    const label = program.display_name?.trim() || program.name
    const pays = PAYOUT_ORDER.some((w) => programAmount(program, w) > 0)

    if (pays) {
      // Collect what the customer still has to satisfy, from tiers they can
      // actually reach. Deduped across programs, since utilities repeat these.
      for (const tier of program.tiers ?? []) {
        if (!isAchievable(tier)) continue
        for (const device of tier.device_results ?? []) {
          for (const check of device.eligibility_details ?? []) {
            if (check.status !== "IGNORED") continue
            const key = check.requirement.trim().toLowerCase()
            if (seenStep.has(key)) continue
            seenStep.add(key)
            claimSteps.push({
              requirement: check.requirement,
              kind: classify(check),
              programName: label,
            })
          }
        }
      }
      continue
    }

    // Pays nothing. Explain why, using the most actionable failure available.
    const failures: EligibilityCheck[] = []
    for (const tier of program.tiers ?? []) {
      for (const device of tier.device_results ?? []) {
        for (const check of device.eligibility_details ?? []) {
          if (check.status === "FAILED") failures.push(check)
        }
      }
    }
    if (failures.length === 0) continue

    const deviceFailure = failures.find(isDeviceSpecific)
    const chosen = deviceFailure ?? failures[0]
    unavailable.push({
      name: label,
      reason: chosen.reason || chosen.requirement,
      deviceSpecific: Boolean(deviceFailure),
    })
  }

  // Agreements sit at the end: they happen inside Leap's flow, so they are the
  // least useful thing for a shopper to go and find.
  const stepRank = { record: 0, condition: 1, agreement: 2 } as const
  claimSteps.sort((a, b) => stepRank[a.kind] - stepRank[b.kind])

  const installTotal = summary.install_amount ?? 0
  const ongoingTotal = summary.ongoing_amount ?? 0
  const upfrontTotal = summary.upfront_amount ?? 0

  const connectUrl =
    typeof result.connect_url === "string" && result.connect_url.length > 0
      ? result.connect_url
      : null

  return {
    hasOffer: installTotal > 0 || ongoingTotal > 0 || upfrontTotal > 0,
    canApply: connectUrl !== null,
    installTotal,
    ongoingTotal,
    upfrontTotal,
    groups,
    claimSteps,
    unavailable,
    utilityName: result.utilities?.primary?.name ?? null,
    connectUrl,
    referenceId: result.reference_id,
    notice,
  }
}

/** An empty view, for coverage gaps and for surfaces with no address yet. */
export function emptyView(referenceId: string, notice: string | null = null): IncentiveView {
  return {
    hasOffer: false,
    canApply: false,
    installTotal: 0,
    ongoingTotal: 0,
    upfrontTotal: 0,
    groups: [],
    claimSteps: [],
    unavailable: [],
    utilityName: null,
    connectUrl: null,
    referenceId,
    notice,
  }
}

export const PAYOUT_LABEL: Record<Payout, { headline: string; row: string }> = {
  install: { headline: "back after install", row: "Paid after install" },
  upfront: { headline: "off today", row: "Off at checkout" },
  ongoing: { headline: "every year", row: "Paid every year" },
}
