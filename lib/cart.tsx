"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { getProduct, type ArtKey, type IncentiveAttributes } from "./catalog"

export interface CartLine {
  slug: string
  name: string
  /** Unit price charged today. */
  price: number
  category: string
  art: ArtKey
  quantity: number
  /** Passed through to the incentives quote so the API can price per line. */
  incentive?: IncentiveAttributes
}

interface CartState {
  lines: CartLine[]
}

type CartAction =
  | { type: "add"; line: Omit<CartLine, "quantity">; quantity?: number }
  | { type: "remove"; slug: string }
  | { type: "setQuantity"; slug: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] }

const STORAGE_KEY = "cape-cart"

/**
 * Drops saved lines for products the catalog no longer carries, and refreshes
 * the incentive mapping from the catalog so a stale device id is never sent.
 */
function currentLines(saved: CartLine[]): CartLine[] {
  if (!Array.isArray(saved)) return []
  return saved.flatMap((line) => {
    const product = getProduct(line.slug)
    if (!product) return []
    return [{ ...line, art: product.art, incentive: product.incentive }]
  })
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const qty = action.quantity ?? 1
      const existing = state.lines.find((l) => l.slug === action.line.slug)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.slug === action.line.slug ? { ...l, quantity: l.quantity + qty } : l,
          ),
        }
      }
      return { lines: [...state.lines, { ...action.line, quantity: qty }] }
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.slug !== action.slug) }
    case "setQuantity":
      return {
        lines: state.lines
          .map((l) => (l.slug === action.slug ? { ...l, quantity: Math.max(0, action.quantity) } : l))
          .filter((l) => l.quantity > 0),
      }
    case "clear":
      return { lines: [] }
    case "hydrate":
      return { lines: action.lines }
    default:
      return state
  }
}

interface CartApi {
  lines: CartLine[]
  count: number
  subtotal: number
  hydrated: boolean
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void
  remove: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  clear: () => void
  /** Drawer visibility lives here so any add-to-cart button can pop it open. */
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] })
  const [hydrated, setHydrated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: "hydrate", lines: currentLines(JSON.parse(raw) as CartLine[]) })
    } catch {
      /* corrupt or unavailable storage just means an empty cart */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines))
    } catch {
      /* nothing useful to do here */
    }
  }, [state.lines])

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    dispatch({ type: "add", line, quantity })
    setDrawerOpen(true)
  }, [])

  const remove = useCallback((slug: string) => dispatch({ type: "remove", slug }), [])
  const setQuantity = useCallback(
    (slug: string, quantity: number) => dispatch({ type: "setQuantity", slug, quantity }),
    [],
  )
  const clear = useCallback(() => dispatch({ type: "clear" }), [])

  const value = useMemo<CartApi>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0)
    const subtotal = state.lines.reduce((n, l) => n + l.price * l.quantity, 0)
    return {
      lines: state.lines,
      count,
      subtotal,
      hydrated,
      add,
      remove,
      setQuantity,
      clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }
  }, [state.lines, hydrated, drawerOpen, add, remove, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
