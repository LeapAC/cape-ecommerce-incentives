/**
 * cape: product catalog.
 *
 * Demo data. Everything here is fictional, but the shapes are deliberate:
 * `incentive` carries the attributes a real rebate/incentive API asks for
 * (manufacturer, model number, amperage, networked, ENERGY STAR), so the
 * integration at /api/incentives/quote has something honest to send.
 *
 * Only chargers carry an `incentive` block. Accessories and install services
 * have no Leap catalog device, so they are skipped rather than looked up.
 */

export type CategoryId = "chargers" | "accessories" | "install"

export interface Category {
  id: CategoryId
  name: string
  /** Short line used on nav and rails. */
  tagline: string
  /** Long line used on the category header. */
  blurb: string
  accent: "sea" | "coral" | "pop" | "sun"
}

export interface IncentiveAttributes {
  /** What the incentive engine should classify this as. */
  productType: "ev_charger" | "ev_charger_commercial"
  manufacturer: string
  modelNumber: string
  amperage: number
  kilowatts: number
  networked: boolean
  energyStar: boolean
  /** Whether install is typically required to claim post-purchase rebates. */
  installRequired: boolean
  /**
   * Leap catalog device UUID, mapped by hand and committed.
   *
   * Device ids are minted per environment, so these are production ids and will
   * 422 against staging. Never guess one: a wrong UUID is a 422, and a valid
   * UUID for the wrong device silently returns someone else's rebate. A product
   * with no mapping is skipped rather than looked up.
   */
  leapDeviceId: string
  /**
   * The real catalog device this fictional product maps to. Kept visible so the
   * mapping is auditable rather than a bare UUID nobody can check.
   */
  deviceLabel: string
}

export interface Product {
  slug: string
  name: string
  /** Display suffix, e.g. "48" in "Mistral 48". Kept separate for typesetting. */
  designator?: string
  category: CategoryId
  price: number
  /** A booked visit rather than a boxed item: no shipping line, no stock. */
  service?: boolean
  badge?: string
  tagline: string
  blurb: string
  story: string[]
  features: string[]
  specs: Record<string, string>
  art: ArtKey
  rating: number
  reviews: number
  inStock: boolean
  incentive?: IncentiveAttributes
}

export type ArtKey =
  | "wall-charger"
  | "portable-charger"
  | "finned-charger"
  | "universal-charger"
  | "duo-pedestal"
  | "cable"
  | "mount"
  | "post"
  | "load-meter"
  | "install"
  | "site-visit"

export const CATEGORIES: Category[] = [
  {
    id: "chargers",
    name: "Chargers",
    tagline: "Level 2 for the garage, the driveway, the lot",
    blurb:
      "Five chargers, each named for a wind that crosses our coast. Wall units, one that travels, and a dual-port pedestal for the small lot out back.",
    accent: "sea",
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "Cables, mounts, and a smarter circuit",
    blurb:
      "The parts that make a charger tidy and keep your panel happy. Cold-flex cable, a cast mount, a driveway post, and a load manager that skips the panel upgrade.",
    accent: "sun",
  },
  {
    id: "install",
    name: "Install",
    tagline: "Licensed electricians, booked at checkout",
    blurb:
      "One visit, permit filed, charger on the wall. Book the install with the charger, or start with a site visit if your panel is older than you are.",
    accent: "coral",
  },
]

export const PRODUCTS: Product[] = [
  // ── Chargers ───────────────────────────────────────────────────────────────
  {
    slug: "mistral-48",
    name: "Mistral",
    designator: "48",
    category: "chargers",
    price: 899,
    badge: "Most installed",
    tagline: "11.5 kW hardwired. The one most people should buy.",
    blurb:
      "Forty-eight amps, hardwired, and quiet enough that you will forget it is running. Full charge overnight on a garage circuit you already have.",
    story: [
      "The mistral is the wind that scrubs the sky clean over Provence. It arrives without warning, moves a great deal of air, and then it is gone. We named our workhorse after it because that is roughly the job.",
      "Forty-eight amps into a hardwired 60 A circuit gives you 11.5 kW, which is around 40 miles of range an hour. Plug in at nine, ignore it, leave at seven. The aluminium body is a single extrusion, anodised rather than painted, so the weather has nothing to peel.",
      "It schedules itself against your utility's off-peak window, holds the charge below 80 percent unless you tell it otherwise, and reports back over Wi-Fi without asking you to install anything you will regret.",
    ],
    features: [
      "48 A continuous, hardwired to a 60 A circuit",
      "Single-extrusion anodised aluminium body",
      "25 ft cold-flex cable, rated to −40 °F",
      "Off-peak scheduling with utility rate lookup",
      "NEMA 4X outdoor rated, no enclosure needed",
    ],
    specs: {
      "Power output": "11.5 kW / 48 A",
      Connector: "SAE J1772",
      "Cable length": "25 ft",
      Enclosure: "NEMA 4X",
      Connectivity: "Wi-Fi 6, Bluetooth LE",
      Mounting: "Wall, hardwired",
      Dimensions: "13.6 × 8.1 × 4.4 in",
      Warranty: "5 years",
    },
    art: "wall-charger",
    rating: 4.9,
    reviews: 1284,
    inStock: true,
    incentive: {
      productType: "ev_charger",
      manufacturer: "cape",
      modelNumber: "CP-MST-48H",
      amperage: 48,
      kilowatts: 11.5,
      networked: true,
      energyStar: true,
      installRequired: true,
      leapDeviceId: "fdb72f89-8548-4d86-8196-c18394b6af52",
      deviceLabel: "Wallbox Pulsar Plus (Level 2, networked, ENERGY STAR)",
    },
  },
  {
    slug: "zephyr-32",
    name: "Zephyr",
    designator: "32",
    category: "chargers",
    price: 549,
    tagline: "7.7 kW on a plug. Comes with you.",
    blurb:
      "A plug-in charger light enough to live in the frunk. Thirty-two amps off a NEMA 14-50, and a travel case that fits under a seat.",
    story: [
      "Not everyone wants an electrician. The Zephyr plugs into the same outlet as an electric range, pulls 32 amps, and weighs less than a full growler.",
      "It ships with a wall dock so it can be the charger at home, and a canvas case so it can be the charger at the rental, the in-laws, and the parking spot behind the taco place with the good outlet.",
    ],
    features: [
      "32 A on a NEMA 14-50 plug, no electrician required",
      "Wall dock included, cable manages itself",
      "Waxed canvas travel case",
      "20 ft cable",
      "Adapter kit sold separately for 6-50 and TT-30",
    ],
    specs: {
      "Power output": "7.7 kW / 32 A",
      Connector: "SAE J1772",
      Plug: "NEMA 14-50",
      "Cable length": "20 ft",
      Enclosure: "NEMA 4",
      Connectivity: "Wi-Fi, Bluetooth LE",
      Weight: "8.2 lb",
      Warranty: "3 years",
    },
    art: "portable-charger",
    rating: 4.7,
    reviews: 903,
    inStock: true,
    incentive: {
      productType: "ev_charger",
      manufacturer: "cape",
      modelNumber: "CP-ZPH-32P",
      amperage: 32,
      kilowatts: 7.7,
      networked: true,
      energyStar: true,
      installRequired: false,
      leapDeviceId: "711ce5f1-231d-4994-9fe4-c3e6002f629d",
      deviceLabel: "ChargePoint Home Flex (Level 2, plug-in or hardwired)",
    },
  },
  {
    slug: "tramontane-80",
    name: "Tramontane",
    designator: "80",
    category: "chargers",
    price: 1449,
    badge: "Fastest at home",
    tagline: "19.2 kW. For the truck, and the second truck.",
    blurb:
      "Eighty amps of hardwired output with a passive-finned back that never spins a fan. Built for households that put real miles on real batteries.",
    story: [
      "Eighty amps is more charger than most homes need, which is exactly why it exists. If you run a long-range truck, a van, and something with a trailer hitch, the Tramontane refills all of it between dinner and dawn.",
      "The back is a finned heat sink rather than a fan, so there is nothing to clog with pollen and nothing to whine at 2 a.m. Load management is built in: point it at a second cape unit and the pair will share a circuit without tripping anything.",
    ],
    features: [
      "80 A continuous on a 100 A circuit",
      "Passive finned heat sink, zero moving parts",
      "Shares a circuit with a second cape unit",
      "30 ft cold-flex cable",
      "Sub-metering export for utility programs",
    ],
    specs: {
      "Power output": "19.2 kW / 80 A",
      Connector: "SAE J1772",
      "Cable length": "30 ft",
      Enclosure: "NEMA 4X",
      Connectivity: "Wi-Fi 6, Ethernet, Bluetooth LE",
      Mounting: "Wall, hardwired",
      Dimensions: "16.2 × 9.4 × 5.8 in",
      Warranty: "5 years",
    },
    art: "finned-charger",
    rating: 4.8,
    reviews: 341,
    inStock: true,
    incentive: {
      productType: "ev_charger",
      manufacturer: "cape",
      modelNumber: "CP-TRM-80H",
      amperage: 80,
      kilowatts: 19.2,
      networked: true,
      energyStar: true,
      installRequired: true,
      leapDeviceId: "b1203ad6-b8f0-486b-a378-aa122d440ba0",
      deviceLabel: "Wallbox Pulsar Pro (Level 2, networked, ENERGY STAR)",
    },
  },
  {
    slug: "marin-48",
    name: "Marin",
    designator: "48",
    category: "chargers",
    price: 649,
    badge: "Charges any EV",
    tagline: "NACS native, J1772 built in. One charger for both.",
    blurb:
      "A 48 A wall unit with a NACS connector and a J1772 adapter that lives in the holster. Buy it once and stop caring which plug the next car uses.",
    story: [
      "The marin is the damp wind that comes in off the sea and settles over the Languedoc for a few days at a time. It is not dramatic. It turns up, it stays, and everything works around it.",
      "Most driveways now hold one of each connector. The Marin charges a NACS car directly and a J1772 car through a latching adapter that clips into the holster, so nobody has to remember where it went.",
      "It is the least expensive hardwired unit we make and the one we suggest to anyone who is not sure what they will drive in five years.",
    ],
    features: [
      "48 A continuous on a 60 A circuit",
      "NACS connector with latching J1772 adapter",
      "Adapter stows in the holster",
      "24 ft cable",
      "Power sharing across up to six units",
    ],
    specs: {
      "Power output": "11.5 kW / 48 A",
      Connector: "NACS, J1772 via adapter",
      "Cable length": "24 ft",
      Enclosure: "NEMA 3R",
      Connectivity: "Wi-Fi",
      Mounting: "Wall, hardwired",
      Dimensions: "15.3 × 6.1 × 5.1 in",
      Warranty: "4 years",
    },
    art: "universal-charger",
    rating: 4.8,
    reviews: 612,
    inStock: true,
    incentive: {
      productType: "ev_charger",
      manufacturer: "cape",
      modelNumber: "CP-MRN-48U",
      amperage: 48,
      kilowatts: 11.5,
      networked: true,
      energyStar: false,
      installRequired: true,
      leapDeviceId: "3b964542-738d-4645-90e6-60347ce9313a",
      deviceLabel: "Tesla Universal Wall Connector (Level 2, networked)",
    },
  },
  {
    slug: "levante-duo",
    name: "Levante",
    designator: "Duo",
    category: "chargers",
    price: 2290,
    badge: "Commercial",
    tagline: "Two ports, one pedestal, shared load.",
    blurb:
      "A dual-port pedestal for small lots, hotels, and the kind of restaurant where people stay for three hours. Payments and access control included.",
    story: [
      "Two 48 A ports on one pedestal, sharing a single 80 A feed. When one car is plugged in it takes everything; when two are, the split is automatic and neither driver notices.",
      "It takes tap-to-pay, RFID, or nothing at all if you would rather charging be part of the welcome. Session data exports as CSV or straight into whatever the accountant prefers.",
    ],
    features: [
      "2 × 48 A ports with automatic load sharing",
      "Tap-to-pay, RFID, and open-access modes",
      "OCPP 2.0.1, works with existing networks",
      "Concrete or surface mount, both included",
      "Session export to CSV and webhook",
    ],
    specs: {
      "Power output": "2 × 11.5 kW / 48 A",
      Connector: "2 × SAE J1772",
      "Cable length": "18 ft each",
      Enclosure: "NEMA 4X, IK10 impact",
      Connectivity: "Ethernet, LTE, Wi-Fi",
      Mounting: "Pedestal",
      Height: "51 in",
      Warranty: "5 years, 3 years parts on site",
    },
    art: "duo-pedestal",
    rating: 4.8,
    reviews: 176,
    inStock: true,
    incentive: {
      productType: "ev_charger_commercial",
      manufacturer: "cape",
      modelNumber: "CP-LVT-D48",
      amperage: 96,
      kilowatts: 23,
      networked: true,
      energyStar: true,
      installRequired: true,
      leapDeviceId: "20fe2bc2-91fe-40dc-b626-21852a9dd936",
      deviceLabel: "ChargePoint CT4000 (Level 2 dual-port commercial)",
    },
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    slug: "line-25",
    name: "Line",
    designator: "25",
    category: "accessories",
    price: 149,
    tagline: "25 ft of cable that stays soft in February.",
    blurb: "Cold-flex J1772 extension, rated to −40 °F, with a jacket that does not go to memory.",
    story: [
      "Most charging cable turns into a garden hose in January. This one does not, because the jacket is TPE rather than PVC and the strand count is high enough to bend properly.",
      "Twenty-five feet, 50 A rated, with a moulded strain relief at both ends. It coils flat on a Cleat Mount and stays that way.",
    ],
    features: [
      "50 A rated, cold-flex to −40 °F",
      "TPE jacket, no memory coil",
      "Moulded strain relief both ends",
      "Fits every cape unit and most others",
    ],
    specs: {
      Length: "25 ft",
      Rating: "50 A / 250 V",
      Connector: "SAE J1772",
      Jacket: "TPE, UV stable",
      Weight: "9.1 lb",
      Warranty: "3 years",
    },
    art: "cable",
    rating: 4.7,
    reviews: 618,
    inStock: true,
  },
  {
    slug: "cleat-mount",
    name: "Cleat Mount",
    category: "accessories",
    price: 89,
    tagline: "Cast aluminium. Holds a cable like a dock cleat.",
    blurb:
      "A wall hanger shaped like the thing it was named after, cast in aluminium and finished the same anodised grey as the chargers.",
    story: [
      "Cable on the floor is how cable gets run over. The Cleat Mount takes a full 25 ft coil, mounts to studs or masonry, and looks like it belongs on the garage wall rather than in a hardware aisle.",
    ],
    features: [
      "Cast aluminium, anodised",
      "Holds a full 25 ft coil",
      "Stud and masonry hardware included",
      "Doubles as a connector holster",
    ],
    specs: {
      Material: "Cast 6061 aluminium",
      Finish: "Type II anodised",
      Load: "40 lb",
      Dimensions: "7.5 × 4.2 × 3.9 in",
      Warranty: "Lifetime",
    },
    art: "mount",
    rating: 4.8,
    reviews: 244,
    inStock: true,
  },
  {
    slug: "headland-post",
    name: "Headland Post",
    category: "accessories",
    price: 429,
    tagline: "A driveway pedestal for any cape wall unit.",
    blurb:
      "Powder-coated steel post with a conduit channel, a cable hook, and a light that comes on at dusk. For the house where the garage is full of everything except a car.",
    story: [
      "Not every charger gets a wall. The Headland Post puts one at the end of the driveway, at the kerb, or beside a carport, with the feed run up through the base so nothing is exposed.",
      "The light on top is not decoration. It is the only thing you can find at 11 p.m. when the porch light is off and you are carrying the groceries.",
    ],
    features: [
      "Fits Mistral, Tramontane, and Marin",
      "Internal conduit channel, 1 in",
      "Dusk-to-dawn cap light",
      "Cable hook and connector holster",
      "Concrete anchor kit included",
    ],
    specs: {
      Material: "Powder-coated steel",
      Height: "48 in",
      Base: "10 × 10 in, four-bolt",
      Conduit: "1 in internal",
      Light: "2 W LED, photocell",
      Warranty: "5 years",
    },
    art: "post",
    rating: 4.7,
    reviews: 131,
    inStock: true,
  },
  {
    slug: "ebb-load-manager",
    name: "Ebb",
    designator: "Load Manager",
    category: "accessories",
    price: 299,
    badge: "Skip the panel upgrade",
    tagline: "Backs the charger off when the house needs the power.",
    blurb:
      "Two clamps on your mains and a small box beside the panel. When the dryer, the oven, and the heat pump all run at once, the charger slows down instead of the breaker tripping.",
    story: [
      "A lot of older homes have a 100 A service and a quote for a panel upgrade that costs more than the car's first year of fuel. Most of the time that panel is nowhere near full.",
      "Ebb watches the whole-home load a few times a second and tells any cape charger how much headroom is left. Overnight the charger gets everything; at six in the evening it takes what is spare.",
    ],
    features: [
      "Two 200 A split-core clamps",
      "Works with every cape charger",
      "Adjusts charge rate in under two seconds",
      "Whole-home usage in the cape app",
      "Installs in the panel in about an hour",
    ],
    specs: {
      Sensors: "2 × 200 A split-core CT",
      Response: "Under 2 s",
      Connectivity: "Wi-Fi, local link to charger",
      Mounting: "Beside the panel",
      Dimensions: "5.1 × 3.4 × 1.6 in",
      Warranty: "3 years",
    },
    art: "load-meter",
    rating: 4.6,
    reviews: 288,
    inStock: true,
  },

  // ── Install ────────────────────────────────────────────────────────────────
  {
    slug: "home-install",
    name: "Home install",
    designator: "Standard",
    category: "install",
    price: 799,
    service: true,
    badge: "Permit included",
    tagline: "A licensed electrician, up to 30 ft from the panel.",
    blurb:
      "One visit to mount the charger, run the circuit, and file the permit. Most installs are done in an afternoon, and the inspection is on us.",
    story: [
      "The charger is the part you choose. The install is where people get stuck: finding an electrician, the permit, the inspection, the second visit when the inspector wants a label moved.",
      "We book all of it. A licensed electrician calls within three days to schedule, arrives with the breaker and the wire, and leaves when the car is charging. If the utility asks for proof of install, the paperwork is already in your inbox.",
    ],
    features: [
      "Licensed, insured electrician",
      "Up to 30 ft of circuit from the panel",
      "Breaker, wire, and conduit included",
      "Permit and inspection handled",
      "One-year workmanship guarantee",
    ],
    specs: {
      Coverage: "41 states",
      "Circuit run": "Up to 30 ft",
      Includes: "Breaker, wire, conduit, permit",
      Scheduling: "Call within three days",
      Guarantee: "1 year workmanship",
    },
    art: "install",
    rating: 4.9,
    reviews: 2107,
    inStock: true,
  },
  {
    slug: "site-visit",
    name: "Site visit",
    category: "install",
    price: 149,
    service: true,
    tagline: "An electrician checks the panel and quotes the job.",
    blurb:
      "For long runs, detached garages, and panels that are older than you are. The fee comes off the install if you go ahead.",
    story: [
      "Some installs are not standard: a charger at the far end of a driveway, a panel with no spare slots, a garage that is its own building. A site visit gets an electrician in front of it before anyone orders parts.",
      "You get a fixed quote, a load calculation, and a straight answer on whether you need a panel upgrade or an Ebb. If you book the install, the visit is credited.",
    ],
    features: [
      "Panel and load calculation",
      "Fixed quote for the install",
      "Credited against the install",
      "Tells you whether Ebb avoids an upgrade",
    ],
    specs: {
      Coverage: "41 states",
      Duration: "About 45 min",
      Includes: "Load calculation, written quote",
      Credit: "Full fee, against install",
    },
    art: "site-visit",
    rating: 4.8,
    reviews: 463,
    inStock: true,
  },
]

// ── lookups ──────────────────────────────────────────────────────────────────

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function productsIn(category: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === category)
}

export function related(product: Product, count = 3): Product[] {
  const sameCategory = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug)
  const rest = PRODUCTS.filter((p) => p.category !== product.category && p.slug !== product.slug)
  return [...sameCategory, ...rest].slice(0, count)
}

/** Full display name, e.g. "Mistral 48". */
export function fullName(p: Product): string {
  return p.designator ? `${p.name} ${p.designator}` : p.name
}
