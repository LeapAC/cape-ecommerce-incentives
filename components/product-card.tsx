import Link from "next/link"
import { fullName, type Product } from "@/lib/catalog"
import { money } from "@/lib/format"
import { ProductArt } from "./product-art"
import { QuickAdd } from "./add-to-cart"
import { Star } from "./icons"

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`

  return (
    <article className="group relative">
      <div
        className="card deckle relative aspect-[4/5] transition-transform duration-500 group-hover:-translate-y-1.5"
        style={{ transitionTimingFunction: "var(--ease-swell)" }}
      >
        <ProductArt art={product.art} className="h-full w-full" />

        {/* the plate is a click target, but the heading below is the real link */}
        <Link href={href} className="absolute inset-0 z-10" tabIndex={-1} aria-hidden />

        {product.badge && (
          <span
            className="label-sm absolute top-4 left-4 z-20 rounded-full px-3 py-1.5"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {product.badge}
          </span>
        )}

        <div className="absolute inset-x-4 bottom-4 z-20 flex translate-y-1.5 justify-end opacity-0 transition-all duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <QuickAdd product={product} />
        </div>
      </div>

      <Link href={href} className="mt-4 block">
        <div className="flex items-baseline gap-3">
          <h3 className="serif text-[1.2rem] leading-tight group-hover:underline">
            {fullName(product)}
          </h3>
          <span className="tabular ml-auto shrink-0 text-[0.95rem] font-semibold">
            {money(product.price)}
          </span>
        </div>

        <p className="text-ink-soft mt-1.5 text-sm leading-snug">{product.tagline}</p>

        <div className="text-muted mt-2.5 flex items-center gap-1.5">
          <Star className="h-3 w-3" />
          <span className="tabular text-xs">{product.rating.toFixed(1)}</span>
          <span className="text-xs">·</span>
          <span className="text-xs">{product.reviews.toLocaleString()} reviews</span>
        </div>
      </Link>
    </article>
  )
}
