import type { Metadata } from "next"
import { PRODUCTS } from "@/lib/catalog"
import { PageBanner } from "@/components/page-banner"
import { ShopGrid } from "@/components/shop-grid"

export const metadata: Metadata = {
  title: "Everything",
  description: "Chargers, electric foils, quiet boats, and the kit that keeps them running.",
}

export default function ShopPage() {
  return (
    <>
      <PageBanner
        eyebrow="The whole shelf"
        title="Everything we make."
        blurb="Fifteen things, four categories, one idea: the afternoon is better when nothing is shouting."
      />
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:py-20">
        <ShopGrid products={PRODUCTS} />
      </div>
    </>
  )
}
