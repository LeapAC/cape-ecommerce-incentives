import Link from "next/link"
import { CATEGORIES, PRODUCTS, getProduct, productsIn } from "@/lib/catalog"
import { money } from "@/lib/format"
import { TopIsWater } from "@/lib/water-top"
import { Horizon, WaveEdge } from "@/components/ocean/horizon"
import { WaveField } from "@/components/ocean/wave-field"
import { TRIM_SWELL } from "@/components/ocean/waves"
import { ProductArt } from "@/components/product-art"
import { ProductCard } from "@/components/product-card"
import { Reveal } from "@/components/reveal"
import { ArrowRight, Bolt, Shield, Truck } from "@/components/icons"

const MARQUEE = [
  "Full by seven",
  "48 amps",
  "Off-peak by default",
  "Sun's still up",
  "Free shipping over $250",
  "Built on the coast",
  "Five-year warranty",
  "Rebates checked at your address",
]

const PROMISES = [
  { icon: Truck, title: "Free over $250", body: "Two to five days, anywhere in the lower 48." },
  {
    icon: Bolt,
    title: "Install handled",
    body: "Licensed electricians in 41 states, booked at checkout.",
  },
  {
    icon: Shield,
    title: "Five years",
    body: "On every charger, including the cable and the connector.",
  },
]

export default function HomePage() {
  const chargers = productsIn("chargers").slice(0, 4)
  const accessories = productsIn("accessories")
  const install = getProduct("home-install")!

  return (
    <>
      {/* ─────────────────────────────  hero  ───────────────────────────── */}
      <section className="relative flex min-h-[46rem] items-end overflow-hidden pt-32 pb-40 lg:min-h-[52rem]">
        <TopIsWater />
        <Horizon horizon={56} />

        <div className="on-water relative mx-auto w-full max-w-[88rem] px-5 sm:px-8">
          <p className="rise rise-1 label muted-water">Chargers · Accessories · Install</p>

          <h1 className="rise rise-2 display mt-6 max-w-[13ch] text-[clamp(3.2rem,10.5vw,8.5rem)]">
            Plug in at dusk. Leave full.
          </h1>

          <p className="rise rise-3 muted-water mt-7 max-w-[46ch] text-lg leading-relaxed">
            Home EV chargers named for the winds that cross our coast, and the cables, posts, and
            electricians that go with them. Your utility may pay for part of it.
          </p>

          <div className="rise rise-4 mt-9 flex flex-wrap gap-3">
            <Link href="/shop/chargers" className="btn btn-pop">
              Shop chargers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop/install" className="btn btn-ghost">
              Book an install
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 -bottom-px z-20">
          <WaveEdge fill="var(--paper)" />
        </div>
      </section>

      {/* ───────────────────────────  marquee  ──────────────────────────── */}
      <div
        className="overflow-hidden py-3.5"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {MARQUEE.map((item) => (
                <span key={item} className="label flex items-center px-7 whitespace-nowrap">
                  {item}
                  <span className="ml-7 opacity-40">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────  categories  ────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end gap-6">
            <h2 className="display max-w-[12ch] text-[clamp(2.4rem,5.5vw,4.4rem)]">
              Three things we do
            </h2>
            <p className="text-ink-soft mb-2 ml-auto max-w-[34ch] text-base">
              Five chargers, the accessories that make them tidy, and licensed electricians to put
              them on the wall.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const lead = productsIn(c.id)[0]
            return (
              <Reveal key={c.id} delay={i * 90}>
                {/* offset alternate columns so the row reads as swell, not a rack */}
                <Link
                  href={`/shop/${c.id}`}
                  className="group block"
                  style={{ marginTop: `${(i % 2) * 2.5}rem` }}
                >
                  <div className="card deckle aspect-[3/4] transition-transform duration-500 group-hover:-translate-y-2">
                    <ProductArt art={lead.art} className="h-full w-full" />
                  </div>
                  <div className="mt-5 flex items-baseline gap-3">
                    <h3 className="display text-[1.9rem]">{c.name}</h3>
                    <ArrowRight className="text-muted mb-1 ml-auto h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                  </div>
                  <p className="text-ink-soft mt-1.5 text-sm leading-snug">{c.tagline}</p>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ────────────────────────  featured chargers  ───────────────────── */}
      <section style={{ background: "var(--paper-warm)" }} className="chart-lines">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <p className="label text-muted">Chargers</p>
            <div className="mt-5 flex flex-wrap items-end gap-6">
              <h2 className="display max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.4rem)]">
                Start with the one that fits your panel.
              </h2>
              <Link href="/shop/chargers" className="btn btn-ghost btn-sm mb-2 ml-auto">
                All chargers
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {chargers.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-20 grid gap-8 border-t pt-12 sm:grid-cols-3">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <Icon className="text-muted mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="serif text-[1.1rem]">{title}</h3>
                    <p className="text-ink-soft mt-1 text-sm leading-snug">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────  install band  ───────────────────────── */}
      <section className="on-water relative overflow-hidden" style={{ background: "var(--deep)" }}>
        <div className="grain absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 80% at 78% 30%, color-mix(in oklab, var(--sea) 70%, transparent) 0%, transparent 70%)",
            }}
          />
        </div>
        <WaveField layers={TRIM_SWELL} className="h-48 opacity-45" />

        <div className="relative mx-auto grid max-w-[88rem] items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-36">
          <Reveal>
            <p className="label muted-water">Install · Booked at checkout</p>
            <h2 className="display mt-6 max-w-[13ch] text-[clamp(2.6rem,6vw,5rem)]">
              One visit. Permit filed. Car charging.
            </h2>
            <p className="muted-water mt-7 max-w-[44ch] text-lg leading-relaxed">
              A licensed electrician calls within three days to schedule, runs the circuit, and
              handles the inspection. If your utility asks for proof of install, the paperwork is
              already in your inbox.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href={`/products/${install.slug}`} className="btn btn-pop">
                Book an install
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="label-sm muted-water">From {money(install.price)} · 41 states</span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="deckle bobbing overflow-hidden rounded-2xl border border-white/10">
              <ProductArt art="install" className="aspect-[4/3] w-full" />
            </div>
          </Reveal>
        </div>

        <WaveEdge fill="var(--paper)" className="relative" />
      </section>

      {/* ────────────────────────  accessories rail  ────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <p className="label text-muted">Accessories</p>
              <h2 className="display mt-5 max-w-[14ch] text-[clamp(2.4rem,5.5vw,4.4rem)]">
                The small parts that keep it tidy.
              </h2>
            </div>
            <Link href="/shop/accessories" className="btn btn-ghost btn-sm mb-2 ml-auto">
              All accessories
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {accessories.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ────────────────────────────  closer  ──────────────────────────── */}
      <section className="relative flex min-h-[30rem] items-center overflow-hidden">
        <Horizon horizon={52} trim />
        <div className="on-water relative mx-auto w-full max-w-[88rem] px-5 py-24 text-center sm:px-8">
          <Reveal>
            <h2 className="display mx-auto max-w-[16ch] text-[clamp(2.4rem,6vw,5rem)]">
              {PRODUCTS.length} things, one idea: leave full every morning.
            </h2>
            <Link href="/shop" className="btn btn-pop mt-9">
              Shop everything
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
