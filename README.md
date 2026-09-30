# cape

A demonstration storefront for a home EV charging company: chargers, charging accessories, and installation. Built as the container for a Leap Incentives Gateway integration.

Nothing here ships. The catalog, prices, reviews, and orders are fictional. The parts that matter are real: a working cart, a checkout that collects a full shipping address, and an order record with somewhere to put a rebate reference.

## Running it

```bash
npm install
npm run dev
```

The store runs at `http://localhost:3000`. Pass `-p 3311` to move it.

```bash
npm test
```

Runs the unit tests in `tests/` with Node's built-in test runner. They cover the lookup location model, the checkout guard and order rules, device parsing, and the display rules in the incentives model.

## Environment

Copy `.env.example` to `.env.local` and fill in the values. `LEAP_API_KEY` is a partner credential: it is read only in server code, it is never prefixed with `NEXT_PUBLIC_`, and `.env*` is gitignored.

| Variable | Scope | What it does |
|---|---|---|
| `LEAP_API_KEY` | Server | Partner key for the Leap lookup |
| `LEAP_API_BASE_URL` | Server | Leap API host |
| `NEXT_PUBLIC_LOOKUP_MODE` | Browser, optional | `zip` (default) or `address`. The default lookup mode before any per-browser override |

`NEXT_PUBLIC_LOOKUP_MODE` is inlined at build time, so changing it needs a redeploy. The per-browser toggle below does not.

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
| `lib/incentives/location.ts` | Committed lookup location, lookup mode, and their validators |
| `lib/incentives/context.tsx` | Shipping address draft, committed location, and the lookup hook |
| `components/incentives/` | The incentives card, the cart line, and the address and ZIP entry |
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

`lib/catalog.ts` carries `leapDeviceId` plus a readable `deviceLabel` on each charger. Ids come from the production device catalog (`GET /beta/incentives/devices/search`) and are **minted per environment**, so they will 422 against staging. A product with no mapping is skipped rather than looked up, which is the right outcome for accessories and install services.

### Where lookups run

Every surface reads the same committed location:

- **Product page**: the incentives card under the price, with its own address or ZIP entry.
- **Cart drawer**: one line under the subtotal, only while the drawer is open. It asks for nothing and stays hidden until a location is committed.
- **Checkout**: the compact card and the "After purchase" block in the order summary. The shipping address form commits the lookup address in address mode.
- **Place order**: the durable lookup, always with the full shipping address, because Leap pins an application to the address it was created with.
- **Confirmation**: no lookup. It shows the amounts recorded on the order.

### Address entry commits, it never follows keystrokes

A lookup keys on a committed location, never on a field being typed. Address entry is manual, with separate fields for street, unit, city, state, and ZIP. A location is committed only when the shopper submits the form with Enter or **Check incentives**. Editing the checkout address after that leaves the preview where it was until the shopper commits again, and the button re-enables to say so.

The site loads no Google Maps or Places API, so a public demo cannot run up a bill.

### ZIP mode

ZIP is the default. ZIP mode asks for one five-digit ZIP and sends Leap only `zip_code` and `country_code`, which production resolves to the ZIP centroid. Programs that depend on the exact street can differ from a full-address lookup.

Switch a browser without a redeploy:

| URL | Effect |
|---|---|
| `/?lookup=zip` | ZIP mode in this browser, saved in `localStorage` |
| `/?lookup=address` | Full-address mode in this browser |
| `/?lookup=default` | Clears the override and falls back to `NEXT_PUBLIC_LOOKUP_MODE`, else ZIP |

The param works on any page and is removed from the address bar once read. Each mode keeps its own committed location, so switching back restores the last address or ZIP.

### Checking it works

These addresses exercise the different states against live programs:

| Address | What it shows |
|---|---|
| 1437 Bannock St, Denver, CO 80202 | $550 after install plus $200/yr across three Xcel programs |
| 55 Trinity Ave SW, Atlanta, GA 30303 | $200 after install across two Georgia Power programs |
| ZIP 30303 | The same two Georgia Power programs |
| ZIP 80202 | The same three Xcel programs as the Denver address |
| 1201 J St, Sacramento, CA 95814 | No offer, with the not-on-the-approved-list reason |
| 1 City Hall Sq, Boston, MA 02201 | No programs in NSTAR territory |
