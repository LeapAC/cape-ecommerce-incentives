import { test } from "node:test"
import assert from "node:assert/strict"
import { canPlaceOrder, leapSnapshot } from "../lib/checkout-rules.ts"

const SHOPPER = {
  name: "Demo Shopper",
  email: "demo@example.com",
  address_line_1: "55 Trinity Ave SW",
  address_line_2: "",
  city: "Atlanta",
  state: "GA",
  zip_code: "30303",
  country_code: "US",
}

test("Place order needs a five-digit ZIP, not just a non-empty one", () => {
  assert.ok(canPlaceOrder(1, SHOPPER))
  assert.equal(canPlaceOrder(1, { ...SHOPPER, zip_code: "303" }), false)
  assert.equal(canPlaceOrder(1, { ...SHOPPER, zip_code: "3030a" }), false)
  assert.equal(canPlaceOrder(1, { ...SHOPPER, email: " " }), false)
  assert.equal(canPlaceOrder(0, SHOPPER), false)
})

test("a failed order lookup records the reference and no amounts", () => {
  for (const response of [
    null,
    { ok: false, error: { message: "A full address or a five-digit ZIP is required." } },
    { ok: true },
    "oops",
  ]) {
    assert.deepEqual(leapSnapshot("cape-CP-ABCDEF", response), { reference_id: "cape-CP-ABCDEF" })
  }
})

test("a settled order lookup records its own amounts and link", () => {
  assert.deepEqual(
    leapSnapshot("cape-CP-ABCDEF", {
      ok: true,
      view: { connectUrl: "https://connect.example/x", installTotal: 200, ongoingTotal: 0, utilityName: "Georgia Power Co" },
    }),
    {
      reference_id: "cape-CP-ABCDEF",
      connect_url: "https://connect.example/x",
      installAmount: 200,
      ongoingAmount: 0,
      utilityName: "Georgia Power Co",
    },
  )
  assert.equal(leapSnapshot("cape-CP-ABCDEF", { ok: true, view: { connectUrl: "" } }).connect_url, undefined)
})
