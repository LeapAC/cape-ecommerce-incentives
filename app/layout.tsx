import type { Metadata } from "next"
import { Archivo, Fraunces } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart"
import { ThemeProvider, themeBootScript } from "@/lib/theme"
import { WaterTopProvider } from "@/lib/water-top"
import { IncentivesProvider } from "@/lib/incentives/context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "cape — electric craft and shore power",
    template: "%s · cape",
  },
  description:
    "Chargers, electric foils, and quiet boats for the long afternoon. A demonstration storefront.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${archivo.variable}`}
    >
      <head>
        {/* Applies the saved coast before first paint so the theme never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <CartProvider>
            <IncentivesProvider>
            <WaterTopProvider>
              <div className="grain-fixed" aria-hidden />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <CartDrawer />
            </WaterTopProvider>
            </IncentivesProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
