import type { ShippingAddress } from "./address"
import type { CartLine } from "./cart"

export const FREE_SHIPPING_AT = 250
export const FLAT_SHIPPING = 12
export const TAX_RATE = 0.0825

export interface OrderLine {
  slug: string
  name: string
  quantity: number
  unitPrice: number
  isDeposit: boolean
}

export interface Order {
  id: string
  createdAt: string
  address: ShippingAddress
  lines: OrderLine[]
  subtotal: number
  shipping: number
  tax: number
  /** subtotal + shipping + tax, before any point-of-sale incentive. */
  total: number
  /**
   * The incentives snapshot taken when the order was placed.
   *
   * `reference_id` and `connect_url` are the pair needed to reconcile a rebate
   * back to this order later, so the reference is stored even when the lookup
   * failed and there is no link. The amounts are recorded as promised at the
   * time of sale, since programs change and the confirmation page should show
   * what the shopper was actually told.
   */
  leap?: {
    reference_id: string
    connect_url?: string
    installAmount?: number
    ongoingAmount?: number
    utilityName?: string | null
  }
}

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_AT ? 0 : FLAT_SHIPPING
}

export function taxFor(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100
}

export function totalsFor(subtotal: number) {
  const shipping = shippingFor(subtotal)
  const tax = taxFor(subtotal)
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Human-readable and unambiguous: CP-7K2M9Q. */
export function newOrderId(): string {
  let tail = ""
  for (let i = 0; i < 6; i++) {
    tail += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return `CP-${tail}`
}

export function orderLinesFrom(lines: CartLine[]): OrderLine[] {
  return lines.map((l) => ({
    slug: l.slug,
    name: l.name,
    quantity: l.quantity,
    unitPrice: l.price,
    isDeposit: l.isDeposit,
  }))
}

const KEY_PREFIX = "cape-order-"

export function saveOrder(order: Order): void {
  try {
    localStorage.setItem(KEY_PREFIX + order.id, JSON.stringify(order))
    localStorage.setItem("cape-last-order", order.id)
  } catch {
    /* the confirmation page will fall back to its empty state */
  }
}

export function loadOrder(id: string): Order | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id)
    return raw ? (JSON.parse(raw) as Order) : null
  } catch {
    return null
  }
}

export function lastOrderId(): string | null {
  try {
    return localStorage.getItem("cape-last-order")
  } catch {
    return null
  }
}
