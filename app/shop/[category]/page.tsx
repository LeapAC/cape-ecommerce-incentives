import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CATEGORIES, getCategory, productsIn, type CategoryId } from "@/lib/catalog"
import { PageBanner } from "@/components/page-banner"
import { ShopGrid } from "@/components/shop-grid"

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }))
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params
  const found = getCategory(category)
  if (!found) return {}
  return { title: found.name, description: found.blurb }
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params
  const found = getCategory(category)
  if (!found) notFound()

  const products = productsIn(found.id as CategoryId)

  return (
    <>
      <PageBanner eyebrow={found.tagline} title={found.name} blurb={found.blurb} />
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 lg:py-20">
        <ShopGrid products={products} activeCategory={found.id} />
      </div>
    </>
  )
}
