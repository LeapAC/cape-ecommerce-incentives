import { test } from "node:test"
import assert from "node:assert/strict"
import { DEBOUNCE_MS, lookupDelay, sharedRequest } from "../lib/incentives/request.ts"

test("a first lookup and a new location go out at once", () => {
  assert.equal(lookupDelay(null, "zip|30303|US"), 0)
  assert.equal(lookupDelay("zip|80202|US", "zip|30303|US"), 0)
})

test("a device change at the same location is debounced", () => {
  assert.equal(lookupDelay("zip|30303|US", "zip|30303|US"), DEBOUNCE_MS)
})

test("concurrent asks for one signature share one request", async () => {
  const inflight = new Map<string, Promise<number>>()
  let calls = 0
  let release!: (v: number) => void
  const start = () => {
    calls++
    return new Promise<number>((r) => (release = r))
  }
  const a = sharedRequest(inflight, "k", start)
  const b = sharedRequest(inflight, "k", start)
  assert.equal(calls, 1)
  assert.equal(a, b)
  release(7)
  assert.deepEqual(await Promise.all([a, b]), [7, 7])
})

test("different signatures never share", () => {
  const inflight = new Map<string, Promise<string>>()
  let calls = 0
  const start = () => {
    calls++
    return new Promise<string>(() => {})
  }
  sharedRequest(inflight, "zip|30303::a:1", start)
  sharedRequest(inflight, "zip|30303::a:2", start)
  assert.equal(calls, 2)
})

test("a settled request is forgotten, so a retry after a failure sends again", async () => {
  const inflight = new Map<string, Promise<string>>()
  let calls = 0
  const failing = () => {
    calls++
    return Promise.reject(new Error("down"))
  }
  await assert.rejects(sharedRequest(inflight, "k", failing))
  assert.equal(inflight.size, 0)
  await assert.rejects(sharedRequest(inflight, "k", failing))
  assert.equal(calls, 2)

  await sharedRequest(inflight, "ok", () => Promise.resolve("v"))
  // Let the settle handler run.
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(inflight.size, 0)
})
