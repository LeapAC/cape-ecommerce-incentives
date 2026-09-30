import { test } from "node:test"
import assert from "node:assert/strict"
import {
  addressLocation,
  isValidZip,
  locationLabel,
  locationSignature,
  lookupParamAction,
  mergePicked,
  parseLookupMode,
  parseStoredLocation,
  resolveLookupMode,
  toLeapAddress,
  zipLocation,
} from "../lib/incentives/location.ts"

const ATLANTA = {
  address_line_1: "55 Trinity Ave SW",
  address_line_2: "",
  city: "Atlanta",
  state: "GA",
  zip_code: "30303",
  country_code: "US",
}

test("the lookup param accepts zip and address, ignores anything else", () => {
  assert.equal(parseLookupMode("zip"), "zip")
  assert.equal(parseLookupMode(" ZIP "), "zip")
  assert.equal(parseLookupMode("address"), "address")
  assert.equal(parseLookupMode("default"), null)
  assert.equal(parseLookupMode("zipcode"), null)
  assert.equal(parseLookupMode(null), null)
})

test("mode resolves stored override, then env default, then full address", () => {
  assert.equal(resolveLookupMode("zip", "address"), "zip")
  assert.equal(resolveLookupMode(null, "zip"), "zip")
  assert.equal(resolveLookupMode("junk", "junk"), "address")
  assert.equal(resolveLookupMode(undefined, undefined), "address")
})

test("a ZIP is exactly five digits", () => {
  assert.ok(isValidZip("30303"))
  assert.ok(!isValidZip("3030"))
  assert.ok(!isValidZip("30303-1234"))
  assert.ok(!isValidZip("3030a"))
  assert.equal(zipLocation("303"), null)
})

test("a half-typed address cannot become a lookup location", () => {
  assert.equal(addressLocation({ ...ATLANTA, address_line_1: "" }), null)
  assert.equal(addressLocation({ ...ATLANTA, city: "  " }), null)
  assert.equal(addressLocation({ ...ATLANTA, zip_code: "303" }), null)
  assert.deepEqual(addressLocation(ATLANTA), { kind: "address", ...ATLANTA })
})

test("the signature ignores case and padding but not a changed street", () => {
  const a = addressLocation(ATLANTA)
  const b = addressLocation({ ...ATLANTA, city: " atlanta ", state: "ga" })
  const c = addressLocation({ ...ATLANTA, address_line_1: "56 Trinity Ave SW" })
  assert.equal(locationSignature(a), locationSignature(b))
  assert.notEqual(locationSignature(a), locationSignature(c))
  assert.notEqual(locationSignature(a), locationSignature(zipLocation("30303")))
  assert.equal(locationSignature(null), "")
})

test("stored locations are validated, not trusted", () => {
  assert.equal(parseStoredLocation(null), null)
  assert.equal(parseStoredLocation("30303"), null)
  assert.equal(parseStoredLocation({ kind: "zip", zip_code: 30303 }), null)
  assert.equal(parseStoredLocation({ kind: "address", address_line_1: "55 Trinity Ave SW" }), null)
  assert.deepEqual(parseStoredLocation({ kind: "zip", zip_code: "30303" }), {
    kind: "zip",
    zip_code: "30303",
    country_code: "US",
  })
  assert.deepEqual(parseStoredLocation({ kind: "address", ...ATLANTA }), { kind: "address", ...ATLANTA })
})

test("a ZIP lookup sends only the ZIP and country to Leap", () => {
  assert.deepEqual(toLeapAddress(zipLocation("30303")!), { zip_code: "30303", country_code: "US" })
  const full = toLeapAddress(addressLocation(ATLANTA)!)
  assert.equal("address_line_1" in full && full.address_line_1, "55 Trinity Ave SW")
  assert.equal("address_line_2" in full ? full.address_line_2 : "absent", undefined)
})

test("labels name where the lookup ran", () => {
  assert.equal(locationLabel(addressLocation(ATLANTA)), "Atlanta, GA")
  assert.equal(locationLabel(zipLocation("80202")), "ZIP 80202")
})

const PREVIOUS = {
  name: "Typed During Pick",
  email: "typed@example.com",
  address_line_1: "1437 Bannock St",
  address_line_2: "Unit 4",
  city: "Denver",
  state: "CO",
  zip_code: "80202",
  country_code: "US",
}

test("a pick keeps the latest contact fields and replaces the address", () => {
  const merged = mergePicked(PREVIOUS, ATLANTA)
  assert.equal(merged.name, "Typed During Pick")
  assert.equal(merged.email, "typed@example.com")
  assert.deepEqual(postalOf(merged), ATLANTA)
  assert.equal(PREVIOUS.address_line_1, "1437 Bannock St", "input is not mutated")
})

test("a pick with no unit clears the previous address's unit", () => {
  const merged = mergePicked(PREVIOUS, { ...ATLANTA, address_line_2: "" })
  assert.equal(merged.address_line_2, "")
})

test("a pick with no ZIP clears the previous ZIP instead of keeping it", () => {
  const merged = mergePicked(PREVIOUS, { ...ATLANTA, zip_code: "" })
  assert.equal(merged.zip_code, "")
  assert.equal(addressLocation(merged), null, "an address with no ZIP cannot commit")
})

function postalOf(a: typeof PREVIOUS) {
  return {
    address_line_1: a.address_line_1,
    address_line_2: a.address_line_2,
    city: a.city,
    state: a.state,
    zip_code: a.zip_code,
    country_code: a.country_code,
  }
}

test("only ?lookup=default clears the saved mode; a typo leaves it alone", () => {
  assert.deepEqual(lookupParamAction(null), { kind: "none" })
  assert.deepEqual(lookupParamAction("zip"), { kind: "set", mode: "zip" })
  assert.deepEqual(lookupParamAction("address"), { kind: "set", mode: "address" })
  assert.deepEqual(lookupParamAction("default"), { kind: "clear" })
  assert.deepEqual(lookupParamAction("zipp"), { kind: "ignore" })
  assert.deepEqual(lookupParamAction(""), { kind: "ignore" })
})
