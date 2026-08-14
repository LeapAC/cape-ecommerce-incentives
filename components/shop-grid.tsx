"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CATEGORIES, type Product } from "@/lib/catalog"
import { ProductCard } from "./product-card"

type Sort = "featured" | "price-asc" | "price-desc" | "rating"

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low" },
  { id: "price-desc", label: "Price, high" },
  { id: "rating", label: "Best rated" },
]

export function ShopGrid({
  products,
  /** Omit the category chips on a single-category page. */
  showFilters = true,
  activeCategory,
}: {
  products: Product[]
  showFilters?: boolean
  activeCategory?: string
}) {
  const [sort, setSort] = useState<Sort>("featured")

  const sorted = useMemo(() => {
    const list = [...products]
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price)
      case "price-desc":
        return list.sort((a, b) => b.price - a.price)
      case "rating":
        return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      default:
        return list
    }
  }, [products, sort])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b pb-5">
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <Chip href="/shop" active={!activeCategory}>
              Everything
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} href={`/shop/${c.id}`} active={activeCategory === c.id}>
                {c.name}
              </Chip>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="label-sm text-muted hidden sm:inline">
            {sorted.length} {sorted.length === 1 ? "item" : "items"}
          </span>
          <label className="label-sm text-muted" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="label-sm cursor-pointer rounded-full border bg-transparent px-3.5 py-2.5"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  )
}

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="label-sm rounded-full border px-3.5 py-2.5 transition-colors duration-300"
      style={{
        background: active ? "var(--ink)" : "transparent",
        color: active ? "var(--paper)" : "inherit",
        borderColor: active ? "var(--ink)" : "var(--line)",
      }}
    >
      {children}
    </Link>
  )
}
