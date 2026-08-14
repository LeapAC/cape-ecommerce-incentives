"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useCart } from "@/lib/cart"
import { money } from "@/lib/format"
import { ProductArt } from "./product-art"
import { ArrowRight, Close, Minus, Plus } from "./icons"

const FREE_SHIPPING_AT = 250

export function CartDrawer() {
  const { lines, subtotal, count, drawerOpen, closeDrawer, setQuantity, remove } = useCart()

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [drawerOpen, closeDrawer])

  const toFree = Math.max(0, FREE_SHIPPING_AT - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)

  return (
    <div
      className="fixed inset-0 z-[70]"
      style={{ pointerEvents: drawerOpen ? "auto" : "none" }}
      aria-hidden={!drawerOpen}
    >
      <button
        type="button"
        onClick={closeDrawer}
        tabIndex={drawerOpen ? 0 : -1}
        aria-label="Close cart"
        className="absolute inset-0 h-full w-full cursor-default"
        style={{
          background: "color-mix(in oklab, var(--deep) 46%, transparent)",
          backdropFilter: drawerOpen ? "blur(3px)" : undefined,
          opacity: drawerOpen ? 1 : 0,
          transition: "opacity 0.4s var(--ease-swell)",
        }}
      />

      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-[27rem] flex-col shadow-2xl"
        style={{
          background: "var(--paper)",
          transform: drawerOpen ? "translateX(0)" : "translateX(102%)",
          transition: "transform 0.52s var(--ease-swell)",
        }}
        role="dialog"
        aria-label="Cart"
      >
        <header className="flex items-center gap-3 border-b px-6 py-5">
          <h2 className="display text-[1.75rem]">Cart</h2>
          <span className="label-sm text-muted mt-1">
            {count} {count === 1 ? "item" : "items"}
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border"
            aria-label="Close cart"
          >
            <Close />
          </button>
        </header>

        {lines.length > 0 && (
          <div className="border-b px-6 py-3.5">
            <div className="flex items-baseline justify-between">
              <span className="label-sm text-ink-soft">
                {toFree > 0 ? `${money(toFree)} to free shipping` : "Shipping is on us"}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progress}%`, background: "var(--pop)" }}
              />
            </div>
          </div>
        )}

        <div className="thin-scroll flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 py-16 text-center">
              <p className="wonk text-[1.6rem] leading-tight">Nothing aboard yet.</p>
              <p className="text-muted max-w-[22ch] text-sm">
                Chargers, boards, and one boat you should probably not buy today.
              </p>
              <Link href="/shop" onClick={closeDrawer} className="btn btn-ink btn-sm mt-1">
                Browse everything
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeDrawer}
                    className="shrink-0 overflow-hidden rounded-xl border"
                  >
                    <ProductArt art={line.art} className="h-20 w-20" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/products/${line.slug}`}
                        onClick={closeDrawer}
                        className="serif text-[1.05rem] leading-snug hover:underline"
                      >
                        {line.name}
                      </Link>
                      <span className="tabular ml-auto text-sm font-semibold">
                        {money(line.price * line.quantity)}
                      </span>
                    </div>

                    {line.isDeposit && (
                      <p className="label-sm text-muted mt-1.5">
                        Deposit · {money(line.listPrice)} total
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full border">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center"
                          aria-label={`Fewer ${line.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="tabular w-6 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center"
                          aria-label={`More ${line.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        className="label-sm text-muted hover:text-ink transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="label">Subtotal</span>
              <span className="tabular display text-[1.9rem]">{money(subtotal)}</span>
            </div>
            <p className="text-muted mt-1.5 text-xs">
              Shipping and tax at checkout. Rebates are applied after your address is confirmed.
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="btn btn-pop mt-4 w-full"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </footer>
        )}
      </aside>
    </div>
  )
}
