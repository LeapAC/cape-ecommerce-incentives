import type { CustomerDeviceRef } from "@/lib/leap/types"

/** Leap accepts 1 to 50 device entries per lookup. */
export const MAX_DEVICES = 50

/** What the browser sends us: a product and how many of it. */
export interface DeviceLine {
  slug: string
  deviceId: string
  quantity: number
}

/**
 * Read device lines from an untrusted request body. Returns null when the shape
 * is wrong, so the route can answer 400 instead of throwing. Lines with no
 * device id are kept and skipped later, which is how unmapped products behave.
 */
export function parseDeviceLines(raw: unknown): DeviceLine[] | null {
  if (raw === undefined) return []
  if (!Array.isArray(raw)) return null
  const lines: DeviceLine[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") return null
    const { slug, deviceId, quantity } = item as Record<string, unknown>
    if (typeof slug !== "string" || typeof deviceId !== "string") return null
    if (quantity !== undefined && (typeof quantity !== "number" || !Number.isFinite(quantity))) {
      return null
    }
    lines.push({ slug, deviceId, quantity: typeof quantity === "number" ? quantity : 1 })
  }
  return lines
}

/**
 * One entry per unit. Two of the same charger is two entries, or the totals come
 * back for a single unit and the shopper is quoted half of what they qualify for.
 *
 * `partner_device_reference` must match ^[A-Za-z0-9_-]+$ and be unique within
 * the request. Product slugs are already kebab-case, so slug-N is safe; it is
 * still sanitised here rather than trusted, and truncated to the 64-char limit.
 */
export function toCustomerDevices(lines: DeviceLine[]): CustomerDeviceRef[] {
  const devices: CustomerDeviceRef[] = []

  for (const line of lines) {
    if (!line.deviceId) continue
    const base = line.slug.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 56) || "item"
    const qty = Math.max(1, Math.min(line.quantity || 1, MAX_DEVICES))

    for (let n = 1; n <= qty; n++) {
      if (devices.length >= MAX_DEVICES) return devices
      devices.push({
        device_id: line.deviceId,
        partner_device_reference: `${base}-${n}`,
      })
    }
  }

  return devices
}

/**
 * A stable signature for the device set. The lookup re-runs when this or the
 * address changes, rather than on mount or on every render, so a quantity
 * change refreshes the numbers and a re-render does not.
 */
export function deviceSignature(lines: DeviceLine[]): string {
  return lines
    .filter((l) => l.deviceId)
    .map((l) => `${l.deviceId}:${Math.max(1, l.quantity || 1)}`)
    .sort()
    .join(",")
}
