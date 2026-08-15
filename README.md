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

cape calls the Leap Incentives Gateway to show shoppers the rebates and VPP earnings they qualify for at their address, next to the price, while they are still deciding.

### How the call is made

The partner key is a credential and never reaches the browser:

```
browser → POST /api/incentives/quote → Leap /beta/incentives/lookups
```

`lib/leap/client.ts` opens with `import "server-only"`, so the build fails if it is ever pulled into a client bundle. The route sets `dynamic = "force-dynamic"`, the upstream call sets `cache: "no-store"`, and both are bounded by a 10 second `AbortController`.

### Reading the response

`lib/incentives/model.ts` is the only place the raw envelope is touched. Every surface renders from its output, so they cannot drift.

Three things it gets right that are easy to get wrong:

- **A program in `program_details` is not an offer.** SMUD returns its Charge@Home program with every tier `FAILED` and zero amounts when the device is off the approved-product list. Gating on array length renders "$0 back" as if it were money. `hasOffer` is gated on actual amounts.
- **The three amounts are kept apart.** `install_amount` is one-time after purchase and is the headline. `ongoing_amount` is per year and is never added into a one-time total. `upfront_amount` is a point-of-sale discount and is the only one that touches what is due today. It currently always returns 0, and is wired through anyway.
- **A single program can pay in two ways.** Xcel's Charging Perks Pilot pays $50 at install and $150 per year. Tiers are grouped by `payment_type` and the program appears in both groups, so the timing shown next to each amount is true.

### Requirement handling

Inside each tier, every device result carries a status:

- `COMPLETED` is satisfied and never shown.
- `IGNORED` is not knowable until after the sale: install date, permit, new-equipment flag, program agreements. These become a collapsed "things you'll confirm when you claim" list, deduped by requirement and framed as upcoming rather than as problems.
- `FAILED` means the device does not qualify for that tier. A program with no paying tier goes into a collapsed list with its reason. Failures coded `APL-…` (approved-product list) or `DEV-…` (device class) are marked device-specific, because those are recoverable by choosing a different charger, which is worth telling the shopper.

Codes are treated as structured hints with a safe fallback, never as an enumerated list.

### Two reference_id lifetimes

- **Browsing** on the product page and in the cart mints a throwaway `cape-preview-<uuid>` per lookup with `create_application: false`.
- **Placing an order** derives a durable `cape-<orderId>`, sends `create_application: true`, and persists the returned `connect_url` alongside it on the order. Leap pins the address to a reference_id on first use, so a new address always gets a new one.

### The handoff

The customer files their own claim. The confirmation page shows the `connect_url` Leap returned, never one cape builds, and only when it came back non-empty. cape passes through what it already knows about the order, so what is left for the shopper is the install date and whatever the program asks to see. Leap emails the customer and tracks each claim to payment, so cape sends no rebate email of its own.

A failed lookup never blocks the page, the cart, or the order.

### Device mapping

`lib/catalog.ts` carries `leapDeviceId` plus a readable `deviceLabel` on each charger. Ids come from the production device catalog and are **minted per environment**, so they will 422 against staging. A product with no mapping is skipped rather than looked up, which is the right outcome for foils, craft, and kit.

### Checking it works

These addresses exercise the different states against live programs:

| Address | What it shows |
|---|---|
| 1437 Bannock St, Denver, CO 80202 | $550 after install plus $200/yr across three Xcel programs |
| 1201 J St, Sacramento, CA 95814 | No offer, with the not-on-the-approved-list reason |
| 1 City Hall Sq, Boston, MA 02201 | No programs in NSTAR territory |
