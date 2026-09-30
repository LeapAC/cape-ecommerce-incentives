import type { Metadata } from "next"
import { CATEGORIES, PRODUCTS } from "@/lib/catalog"
import { PageBanner } from "@/components/page-banner"
import { ShopGrid } from "@/components/shop-grid"

export const metadata: Metadata = {
  title: "Everything",
  description: "EV chargers, the accessories that make them tidy, and the electricians who put them on the wall.",
}

export default function ShopPage() {
  return (
    <>
      <PageBanner
        eyebrow="The whole shelf"
        title="Everything we make."
        blurb={`${PRODUCTS.length} things, ${CATEGORIES.length} categories, one idea: the car should be full every morning without you thinking about it.`}
      />
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:py-20">
        <ShopGrid products={PRODUCTS} />
      </div>
    </>
  )
}
