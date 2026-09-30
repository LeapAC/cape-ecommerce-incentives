import { test } from "node:test"
import assert from "node:assert/strict"
import { toIncentiveView } from "../lib/incentives/model.ts"
import type { EligibilityResult, EligibleProgram } from "../lib/leap/types.ts"

function program(p: Partial<EligibleProgram> & { name: string }): EligibleProgram {
  return { tiers: [], ...p }
}

function result(programs: EligibleProgram[], summary: Partial<EligibilityResult["incentive_summary"]>) {
  return {
    reference_id: "cape-preview-test",
    customer_classification: "RESIDENTIAL",
    customer_devices: [],
    incentive_summary: { upfront_amount: 0, install_amount: 0, ongoing_amount: 0, ...summary },
    utilities: { primary: { eiaid: "1", name: "Xcel Energy" }, possible_utilities: [] },
    program_details: programs,
  } as EligibilityResult
}

test("a program whose every tier failed is not an offer", () => {
  const view = toIncentiveView(
    result(
      [
        program({
          name: "Charge@Home",
          install_amount: 0,
          tiers: [
            {
              tier_name: "Base",
              payment_type: "INSTALL",
              incentive_amount: 0,
              device_results: [
                {
                  partner_device_reference: "mistral-48-1",
                  customer_device_id: "x",
                  status: "FAILED",
                  eligibility_details: [
                    { requirement: "On the approved list", status: "FAILED", code: "APL-001", reason: "Not listed" },
                  ],
                },
              ],
            },
          ],
        }),
      ],
      {},
    ),
  )
  assert.equal(view.hasOffer, false)
  assert.equal(view.unavailable.length, 1)
  assert.equal(view.unavailable[0].deviceSpecific, true)
})

test("one-time and yearly totals stay apart, and a two-way program shows in both groups", () => {
  const view = toIncentiveView(
    result(
      [
        program({ name: "Charging Perks", install_amount: 50, ongoing_amount: 150 }),
        program({ name: "Home-Wiring Rebate", install_amount: 500 }),
        program({ name: "Optimize Your Charge", ongoing_amount: 50 }),
      ],
      { install_amount: 550, ongoing_amount: 200 },
    ),
  )
  assert.equal(view.hasOffer, true)
  assert.equal(view.installTotal, 550)
  assert.equal(view.ongoingTotal, 200)
  assert.deepEqual(
    view.groups.map((g) => [g.when, g.total, g.programs.map((p) => p.name)]),
    [
      ["install", 550, ["Home-Wiring Rebate", "Charging Perks"]],
      ["ongoing", 200, ["Charging Perks", "Optimize Your Charge"]],
    ],
  )
})
