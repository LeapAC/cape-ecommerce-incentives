# cape

A demonstration storefront selling EV chargers, electric foils, and quiet boats. Built as the container for a Leap Incentives Gateway integration.

Nothing here ships. The catalog, prices, reviews, and orders are fictional. The parts that matter are real: a working cart, a checkout that collects a full shipping address, and an order record with somewhere to put a rebate reference.

## Running it

```bash
npm install
npm run dev
```

The store runs at `http://localhost:3000`. Pass `-p 3311` to move it.

## Environment

Copy `.env.example` to `.env.local` and fill in the values. `LEAP_API_KEY` is a partner credential: it is read only in server code, it is never prefixed with `NEXT_PUBLIC_`, and `.env*` is gitignored.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4. No UI library, no state library, no animation library. Cart and address state live in React context backed by `localStorage`.

## Layout

| Path | What it is |
|---|---|
| `app/page.tsx` | Home |
| `app/shop/page.tsx` | All products |
| `app/shop/[category]/page.tsx` | One category |
| `app/products/[slug]/page.tsx` | Product detail |
| `app/checkout/page.tsx` | Checkout |
| `app/checkout/complete/page.tsx` | Order confirmation |
| `lib/catalog.ts` | Products, categories, and per-product incentive attributes |
| `lib/cart.tsx` | Cart context, `localStorage` backed |
| `lib/address.ts` | Address types and validators, safe on server and client |
| `lib/use-address.ts` | Address persistence hook |
| `lib/order.ts` | Order record, totals, and order storage |
| `lib/theme.tsx` | Coast switch |
| `lib/water-top.tsx` | Tells the header whether the page opens on a dark band |
| `components/ocean/` | Sky, sun, glitter, and drifting swell |
| `components/product-art.tsx` | Drawn product plates, one per product |

## Two coasts

The store ships two palettes off one layout, switchable in the header and persisted per visitor.

- **Pacific**: dusk offshore. Deep navy-teal, cream, amber sun.
- **Riviera**: noon at Cap d'Antibes. Cobalt, cream, terracotta.

Both derive every token from the three colours in the logo. Themes are CSS custom properties on `:root` and `[data-theme="riviera"]`, applied before first paint by an inline script so the choice never flashes.

## Design notes

- Type is Fraunces for display and Archivo for everything else, both variable, loaded through `next/font`.
- Products are drawn as flat SVG plates rather than photographed, because the catalog is fictional and drawn art stays honest about that. Every plate recolours with the theme.
- The hero sun, the swell, and the reveals all stop under `prefers-reduced-motion`.

## Incentives integration

Three placements are marked with comments and currently render nothing:

- `app/products/[slug]/page.tsx` — under the price
- `app/checkout/page.tsx` — in the order summary, above Due today
- `app/checkout/complete/page.tsx` — the post-purchase handoff

`lib/catalog.ts` carries an `incentive` block per product with the attributes a lookup needs: manufacturer, model number, amperage, kilowatts, networked, ENERGY STAR. Products without one are not eligible and are skipped.

`lib/order.ts` has an `Order.leap` slot for `reference_id` and `connect_url`, so a rebate can be reconciled to an order after the fact.
