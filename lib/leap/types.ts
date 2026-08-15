/**
 * Types for the Leap Incentives partner lookup API.
 *
 * Mirrors `POST /beta/incentives/lookups`. Field names come from the published
 * OpenAPI spec at docs.incentives.leap.energy. Response fields cape does not
 * consume are typed loosely on purpose rather than guessed at.
 */

export type CustomerClassification =
  | "RESIDENTIAL"
  | "MULTIFAMILY"
  | "MANUFACTURED_HOME"
  | "COMMERCIAL"

export type PaymentType = "UPFRONT" | "INSTALL" | "ONGOING"

/**
 * Per-check outcome inside a tier.
 *
 * - COMPLETED: satisfied.
 * - FAILED: this device does not qualify for this tier.
 * - IGNORED: not knowable yet, because the input does not exist until after the
 *   sale (install date, permit approval, new-equipment flag, agreements).
 *
 * Not a closed enum in the spec, so treat unknown values as FAILED-equivalent
 * only where safety demands it; everywhere else fall through to "unknown".
 */
export type CheckStatus = "COMPLETED" | "FAILED" | "IGNORED" | (string & {})

/** Request address block. All fields except `address_line_2` are required. */
export interface LeapAddress {
  address_line_1: string
  address_line_2?: string | null
  city: string
  /** Two-letter US state abbreviation. */
  state: string
  zip_code: string
  /** ISO-3166 alpha-2. Defaults to "US" server side. */
  country_code?: string
}

/** One installation of a catalog device. Two of the same unit is two entries. */
export interface CustomerDeviceRef {
  /** Catalog device UUID. Minted per environment, so staging ids 422 on prod. */
  device_id: string
  /** 1 to 64 chars matching ^[A-Za-z0-9_-]+$, unique within the request. */
  partner_device_reference?: string
  /** Per-installation attributes keyed by requirement key. */
  details?: Record<string, string>
}

export interface EligibilityRequest {
  reference_id: string
  address: LeapAddress
  customer_devices: CustomerDeviceRef[]
  customer_classification: CustomerClassification
  /** Only true at checkout. connect_url is a working link only when this is true. */
  create_application?: boolean
  /** Optional utility override, bypasses geocoding. */
  eiaid?: string
  customer_details?: Record<string, string>
}

export interface EligibilityCheck {
  /** Human-readable requirement, e.g. "Installed on or after 2021-12-08". */
  requirement: string
  status: CheckStatus
  /** Structured but not enumerated, e.g. APL-001, CD-ID-001, AGR-SMUD-TC-001. */
  code: string
  reason: string
  source_program_identifier?: string | null
}

export interface DeviceTierResult {
  partner_device_reference: string
  customer_device_id: string
  status: CheckStatus
  eligibility_details: EligibilityCheck[]
}

export interface MatchedTier {
  tier_name: string
  payment_type: PaymentType
  incentive_amount: number
  device_results: DeviceTierResult[]
}

/**
 * A program returned in `program_details`. Presence does NOT mean the customer
 * qualifies: a program whose every tier failed still comes back, with zero
 * amounts. Eligibility is decided per tier, per device.
 */
export interface EligibleProgram {
  name: string
  operator_name?: string | null
  device_category?: string | null
  display_name?: string | null
  description?: string | null
  logo_url?: string | null
  terms_url?: string | null
  is_partner_offer?: boolean
  program_identifier?: string | null
  covered_programs?: unknown
  included_leap_program_ids?: string[]
  upfront_amount?: number
  install_amount?: number
  ongoing_amount?: number
  tiers: MatchedTier[]
}

export interface IncentiveSummary {
  /** Point-of-sale discount. Currently always 0; wired through for later. */
  upfront_amount: number
  /** One-time money paid after purchase and install. */
  install_amount: number
  /** Recurring money, dollars per year. */
  ongoing_amount: number
}

export interface IncentiveUtility {
  eiaid: string
  name: string
  state?: string
}

export interface UtilityMatch {
  primary: IncentiveUtility | null
  possible_utilities: IncentiveUtility[]
}

export interface CustomerDeviceRefEcho {
  device_id: string
  partner_device_reference: string
  customer_device_id: string
}

export interface EligibilityResult {
  reference_id: string
  customer_classification: CustomerClassification
  customer_devices: CustomerDeviceRefEcho[]
  /** OMITTED entirely when nothing is eligible. Absent, not null, not empty. */
  connect_url?: string
  incentive_summary: IncentiveSummary
  utilities: UtilityMatch
  program_details: EligibleProgram[]
  geocoding?: {
    latitude: number
    longitude: number
    formatted_address: string
  }
}

/** Error envelope. Only `error.message` is guaranteed. */
export interface LeapErrorResponse {
  error?: {
    message?: string
    details?: { error_code?: string; reason?: string }[]
  }
  message?: string
}
