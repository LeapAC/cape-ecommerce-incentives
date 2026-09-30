import { test } from "node:test"
import assert from "node:assert/strict"
import { parseDeviceLines, toCustomerDevices } from "../lib/incentives/devices.ts"

test("malformed device lists are rejected, not thrown on", () => {
  for (const raw of [null, "mistral-48", 3, { slug: "x" }, [null], [{ slug: 1, deviceId: "d" }], [{ slug: "x", deviceId: "d", quantity: "2" }]]) {
    assert.equal(parseDeviceLines(raw), null, JSON.stringify(raw))
  }
})

test("a missing list is empty, and quantity defaults to one", () => {
  assert.deepEqual(parseDeviceLines(undefined), [])
  assert.deepEqual(parseDeviceLines([{ slug: "mistral-48", deviceId: "abc" }]), [
    { slug: "mistral-48", deviceId: "abc", quantity: 1 },
  ])
})

test("two of one charger is two entries", () => {
  const lines = parseDeviceLines([{ slug: "mistral-48", deviceId: "abc", quantity: 2 }])!
  assert.deepEqual(
    toCustomerDevices(lines).map((d) => d.partner_device_reference),
    ["mistral-48-1", "mistral-48-2"],
  )
})
