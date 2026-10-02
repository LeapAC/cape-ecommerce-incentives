import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PRODUCTS, fullName, getCategory, getProduct, related } from "@/lib/catalog"
import { money } from "@/lib/format"
import { ProductArt } from "@/components/product-art"
import { ProductCard } from "@/components/product-card"
import { AddToCart } from "@/components/add-to-cart"
import { ProductIncentives } from "@/components/incentives/product-incentives"
import { Reveal } from "@/components/reveal"
import { ArrowLeft, Check, Star, Truck } from "@/components/icons"

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return { title: fullName(product), description: product.blurb }
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const category = getCategory(product.category)!
  const specEntries = Object.entries(product.specs)
  const highlights = specEntries.slice(0, 3)

  return (
    <>
      <div className="mx-auto max-w-[88rem] px-5 pt-28 sm:px-8 lg:pt-32">
        <Link
          href={`/shop/${product.category}`}
          className="label-sm text-muted hover:text-ink inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {category.name}
        </Link>
      </div>

      <article className="mx-auto grid max-w-[88rem] gap-x-16 gap-y-12 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-14">
        {/* ── plate ─────────────────────────────────────────────────────── */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="card deckle aspect-square">
            <ProductArt art={product.art} className="h-full w-full" />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border" style={{ background: "var(--line)" }}>
            {highlights.map(([k, v]) => (
              <div key={k} className="px-4 py-4" style={{ background: "var(--shell)" }}>
                <dt className="label-sm text-muted">{k}</dt>
                <dd className="serif mt-2 text-[1rem] leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── buy column ────────────────────────────────────────────────── */}
        {/* min-w-0: a long program name must truncate, not widen the column. */}
        <div className="min-w-0">
          <p className="label text-muted">{category.name}</p>

          <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.4rem)]">{fullName(product)}</h1>

          <div className="text-muted mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5" filled={i < Math.round(product.rating)} />
              ))}
            </span>
            <span className="tabular text-sm">{product.rating.toFixed(1)}</span>
            <span className="text-sm">·</span>
            <span className="text-sm">{product.reviews.toLocaleString()} reviews</span>
          </div>

          <p className="text-ink-soft mt-6 text-lg leading-relaxed">{product.blurb}</p>

          <div className="mt-8">
            <span className="tabular display text-[2.6rem]">{money(product.price)}</span>
          </div>

          <div className="mt-7">
            <AddToCart product={product} />
          </div>

          {/* Leap incentives placement 1 of 3: awareness, directly under the price. */}
          {product.incentive?.leapDeviceId && (
            <div className="mt-6">
              <ProductIncentives
                slug={product.slug}
                deviceId={product.incentive.leapDeviceId}
              />
            </div>
          )}

          <p className="text-muted mt-5 flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 shrink-0" />
            {product.service
              ? "Booked after you order · A licensed electrician calls within three days to schedule."
              : `${product.price >= 250 ? "Free shipping" : "Flat $12 shipping"} · In stock, ships in two days`}
          </p>

          <ul className="mt-9 space-y-3 border-t pt-8">
            {product.features.map((f) => (
              <li key={f} className="flex gap-3 text-[0.95rem]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--sun)" }} />
                <span className="text-ink-soft">{f}</span>
              </li>
            ))}
          </ul>

          <details className="group mt-8 border-t pt-6" open>
            <summary className="label cursor-pointer list-none">Specifications</summary>
            <dl className="mt-5 divide-y">
              {specEntries.map(([k, v]) => (
                <div key={k} className="flex gap-6 py-3">
                  <dt className="text-muted w-40 shrink-0 text-sm">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </article>

      {/* ── story ───────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-warm)" }} className="chart-lines mt-10">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
          <Reveal>
            <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[0.8fr_1.2fr]">
              <h2 className="display text-[clamp(2rem,4.5vw,3.4rem)]">Why it exists</h2>
              <div className="space-y-6">
                {product.story.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "serif text-[1.35rem] leading-relaxed"
                        : "text-ink-soft text-[1.05rem] leading-relaxed"
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── related ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <Reveal>
          <h2 className="display text-[clamp(2rem,4.5vw,3.4rem)]">Goes with it</h2>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {related(product, 3).map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
