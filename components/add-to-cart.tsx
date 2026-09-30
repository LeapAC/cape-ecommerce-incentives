"use client"

import { useState } from "react"
import { fullName, type Product } from "@/lib/catalog"
import { useCart, type CartLine } from "@/lib/cart"
import { money } from "@/lib/format"
import { Check, Minus, Plus } from "./icons"

function toLine(p: Product): Omit<CartLine, "quantity"> {
  return {
    slug: p.slug,
    name: fullName(p),
    price: p.price,
    category: p.category,
    art: p.art,
    incentive: p.incentive,
  }
}

/** Full-width button with a quantity stepper, for the product page. */
export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handle = () => {
    add(toLine(product), qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex h-12 items-center rounded-full border px-1">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Fewer"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="tabular w-8 text-center text-sm font-semibold">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(50, q + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="More"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={handle} className="btn btn-pop flex-1">
        {added ? (
          <>
            <Check className="h-4 w-4" /> In the cart
          </>
        ) : product.service ? (
          <>Book · {money(product.price * qty)}</>
        ) : (
          <>Add to cart · {money(product.price * qty)}</>
        )}
      </button>
    </div>
  )
}

/** Compact add button for grid cards. */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        add(toLine(product))
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1600)
      }}
      className="label-sm flex h-9 items-center gap-1.5 rounded-full px-3.5 transition-all duration-300"
      style={{ background: "var(--pop)", color: "var(--pop-ink)" }}
      aria-label={`Add ${fullName(product)} to cart`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" /> Added
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" /> {product.service ? "Book" : "Add"}
        </>
      )}
    </button>
  )
}
