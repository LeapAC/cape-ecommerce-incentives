import Link from "next/link"
import { CATEGORIES } from "@/lib/catalog"
import { CapeLogo } from "./cape-mark"
import { WaveField } from "./ocean/wave-field"
import { TRIM_SWELL } from "./ocean/waves"
import { ArrowRight } from "./icons"

const SUPPORT = [
  { label: "Shipping and returns", href: "/shop" },
  { label: "Installation", href: "/shop/install" },
  { label: "Rebates and incentives", href: "/checkout" },
  { label: "Warranty", href: "/shop" },
]

const COMPANY = [
  { label: "Our story", href: "/" },
  { label: "Commercial", href: "/products/levante-duo" },
  { label: "Press", href: "/" },
  { label: "Careers", href: "/" },
]

export function SiteFooter() {
  return (
    <footer className="on-water relative overflow-hidden" style={{ background: "var(--deep)" }}>
      <div className="grain absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 70% at 20% 0%, color-mix(in oklab, var(--sea) 62%, transparent) 0%, transparent 68%)",
          }}
        />
      </div>
      <WaveField layers={TRIM_SWELL} className="h-40 opacity-40" />

      <div className="relative mx-auto max-w-[88rem] px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <CapeLogo tone="inverse" />
            <p className="display mt-7 max-w-[16ch] text-[2.2rem] leading-[0.95]">
              Plug in at dusk. Leave full.
            </p>
            <form className="mt-8 flex max-w-sm gap-2">
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@somewhere.warm"
                className="field"
                style={{
                  background: "color-mix(in oklab, var(--paper) 8%, transparent)",
                  borderColor: "color-mix(in oklab, var(--hero-ink) 26%, transparent)",
                  color: "var(--hero-ink)",
                }}
              />
              <button type="button" className="btn btn-pop shrink-0 px-5" aria-label="Subscribe">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="muted-water mt-3 text-xs">
              Rate changes, new chargers, and the odd rebate. Roughly monthly.
            </p>
          </div>

          <FooterColumn title="Shop">
            {CATEGORIES.map((c) => (
              <FooterLink key={c.id} href={`/shop/${c.id}`}>
                {c.name}
              </FooterLink>
            ))}
            <FooterLink href="/shop">Everything</FooterLink>
          </FooterColumn>

          <FooterColumn title="Support">
            {SUPPORT.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY.map((l) => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div
          className="mt-16 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: "color-mix(in oklab, var(--hero-ink) 18%, transparent)" }}
        >
          <p className="label-sm muted-water">© {new Date().getFullYear()} cape</p>
          <p className="label-sm muted-water sm:ml-auto">
            A demonstration storefront. Nothing here ships.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label muted-water">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[0.95rem] opacity-85 transition-opacity hover:opacity-100">
        {children}
      </Link>
    </li>
  )
}
