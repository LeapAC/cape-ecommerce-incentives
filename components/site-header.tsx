"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CATEGORIES } from "@/lib/catalog"
import { useCart } from "@/lib/cart"
import { useWaterTop } from "@/lib/water-top"
import { CapeLogo } from "./cape-mark"
import { ThemeSwitch } from "./theme-switch"
import { Bag, Close, Menu } from "./icons"

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { count, openDrawer, hydrated } = useCart()
  const pathname = usePathname()
  const pageOpensOnWater = useWaterTop()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  // Float in cream only while actually over a dark hero; otherwise use ink,
  // which stays readable on paper before the page has been scrolled.
  const onWater = !scrolled && pageOpensOnWater
  const solid = scrolled

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: solid ? "color-mix(in oklab, var(--paper) 88%, transparent)" : "transparent",
          backdropFilter: solid ? "blur(14px) saturate(1.3)" : undefined,
          borderBottom: solid ? "1px solid var(--line)" : "1px solid transparent",
          color: onWater ? "var(--hero-ink)" : "var(--ink)",
        }}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="cape, home" className="shrink-0">
            <CapeLogo tone={onWater ? "inverse" : "brand"} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {CATEGORIES.map((c) => {
              const href = `/shop/${c.id}`
              const active = pathname === href
              return (
                <Link
                  key={c.id}
                  href={href}
                  className="label relative rounded-full px-3.5 py-2.5 transition-opacity duration-200 hover:opacity-100"
                  style={{ opacity: active ? 1 : 0.68 }}
                >
                  {c.name}
                  {active && (
                    <span
                      className="absolute inset-x-3.5 bottom-1 h-px"
                      style={{ background: "var(--pop)" }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeSwitch onWater={onWater} />
            </div>

            <button
              type="button"
              onClick={openDrawer}
              className="relative flex h-11 items-center gap-2 rounded-full px-4 transition-colors duration-300"
              style={{
                border: `1px solid color-mix(in oklab, currentColor 30%, transparent)`,
              }}
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <Bag className="h-[1.15rem] w-[1.15rem]" />
              <span className="label-sm tabular w-3 text-center">{hydrated ? count : ""}</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              style={{ border: `1px solid color-mix(in oklab, currentColor 30%, transparent)` }}
              aria-label="Open menu"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className="fixed inset-0 z-[60] lg:hidden"
        style={{
          pointerEvents: menuOpen ? "auto" : "none",
          opacity: menuOpen ? 1 : 0,
          transition: "opacity 0.35s var(--ease-swell)",
          background: "var(--deep)",
        }}
        aria-hidden={!menuOpen}
      >
        <div className="grain absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 60% at 50% 100%, color-mix(in oklab, var(--sea) 70%, transparent) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="on-water relative flex h-full flex-col px-6 pt-6">
          <div className="flex items-center">
            <CapeLogo tone="inverse" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25"
              aria-label="Close menu"
            >
              <Close />
            </button>
          </div>

          <nav className="mt-14 flex flex-col gap-1">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.id}
                href={`/shop/${c.id}`}
                className="border-b border-white/12 py-5"
                style={{
                  transform: menuOpen ? "none" : "translateY(1rem)",
                  opacity: menuOpen ? 1 : 0,
                  transition: `all 0.5s var(--ease-swell) ${0.06 * i + 0.08}s`,
                }}
              >
                <span className="display block text-[2.4rem] leading-none">{c.name}</span>
                <span className="muted-water mt-2 block text-sm">{c.tagline}</span>
              </Link>
            ))}
            <Link href="/shop" className="border-b border-white/12 py-5">
              <span className="display block text-[2.4rem] leading-none">Everything</span>
            </Link>
          </nav>

          <div className="mt-auto flex items-center justify-between py-8">
            <ThemeSwitch onWater />
            <span className="label-sm muted-water">Free shipping over $250</span>
          </div>
        </div>
      </div>
    </>
  )
}
