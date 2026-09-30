import { test } from "node:test"
import assert from "node:assert/strict"
import { checkCheckoutRequest, isOrderReference, isSameOrigin } from "../lib/incentives/checkout-guard.ts"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

test("accepts every reference checkout can mint", () => {
  for (let i = 0; i < 200; i++) {
    let tail = ""
    for (let j = 0; j < 6; j++) tail += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    assert.ok(isOrderReference(`cape-CP-${tail}`), tail)
  }
})

test("rejects made-up, preview, and near-miss references", () => {
  for (const ref of [
    "anything",
    "cape-preview-3f1c",
    "cape-CP-ABC12",
    "cape-CP-ABC1234",
    "cape-CP-ABCDE1", // 1 is not in the alphabet
    "cape-CP-ABCDEO", // nor is O
    "cape-cp-ABCDEF",
    " cape-CP-ABCDEF",
    undefined,
    42,
  ]) {
    assert.equal(isOrderReference(ref), false, String(ref))
  }
})

test("same origin compares the Origin host with the serving host", () => {
  assert.ok(isSameOrigin("https://cape.example.vercel.app", "cape.example.vercel.app"))
  assert.ok(isSameOrigin("http://localhost:3311", "localhost:3311"))
  assert.equal(isSameOrigin("https://evil.example", "cape.example.vercel.app"), false)
  assert.equal(isSameOrigin("http://localhost:3000", "localhost:3311"), false)
  assert.equal(isSameOrigin(null, "cape.example.vercel.app"), false)
  assert.equal(isSameOrigin("null", "cape.example.vercel.app"), false)
  assert.equal(isSameOrigin("https://cape.example.vercel.app", null), false)
})

test("a forged checkout request is refused before any lookup", () => {
  const host = "cape.example.vercel.app"
  assert.equal(checkCheckoutRequest({ origin: null, host, referenceId: "cape-CP-ABCDEF" }).ok, false)
  assert.equal(
    checkCheckoutRequest({ origin: `https://${host}`, host, referenceId: "made-up" }).ok,
    false,
  )
  assert.deepEqual(checkCheckoutRequest({ origin: `https://${host}`, host, referenceId: "cape-CP-ABCDEF" }), {
    ok: true,
    referenceId: "cape-CP-ABCDEF",
  })
})
