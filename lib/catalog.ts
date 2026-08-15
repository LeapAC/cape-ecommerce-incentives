/**
 * cape — product catalog.
 *
 * Demo data. Everything here is fictional, but the shapes are deliberate:
 * `incentive` carries the attributes a real rebate/incentive API asks for
 * (manufacturer, model number, amperage, networked, ENERGY STAR), so the
 * integration at /api/incentives/quote has something honest to send.
 */

export type CategoryId = "shore-power" | "foils" | "craft" | "kit"

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
  compareAt?: number
  /** Craft is reserved with a deposit rather than bought outright. */
  deposit?: number
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
  | "duo-pedestal"
  | "dock-pedestal"
  | "efoil"
  | "efoil-big"
  | "jetboard"
  | "catamaran"
  | "runabout"
  | "cable"
  | "mount"
  | "drysack"
  | "cap"
  | "boardsock"

export const CATEGORIES: Category[] = [
  {
    id: "shore-power",
    name: "Shore Power",
    tagline: "Chargers for the car, the dock, the fleet",
    blurb:
      "Everything that puts electrons back where you left them. Wall units, pedestals, and one dockside post that will outlive the dock.",
    accent: "sea",
  },
  {
    id: "foils",
    name: "Foils",
    tagline: "Electric boards that leave the water alone",
    blurb:
      "Carbon boards, quiet motors, no wake and no argument with the harbourmaster. Flat days are back on the calendar.",
    accent: "pop",
  },
  {
    id: "craft",
    name: "Craft",
    tagline: "Two hulls, one hull, zero noise",
    blurb:
      "A day cat and a runabout, both electric, both built for long lunches at anchor. Reserved with a deposit, built to order.",
    accent: "coral",
  },
  {
    id: "kit",
    name: "Kit",
    tagline: "Cables, mounts, and things that dry fast",
    blurb: "The unglamorous half of a good afternoon. Salt-rated, sun-faded on purpose.",
    accent: "sun",
  },
]

export const PRODUCTS: Product[] = [
  // ── Shore Power ────────────────────────────────────────────────────────────
  {
    slug: "mistral-48",
    name: "Mistral",
    designator: "48",
    category: "shore-power",
    price: 899,
    compareAt: 1049,
    badge: "Most installed",
    tagline: "11.5 kW hardwired. The one most people should buy.",
    blurb:
      "Forty-eight amps, hardwired, and quiet enough that you will forget it is running. Full charge overnight on a garage circuit you already have.",
    story: [
      "The mistral is the wind that scrubs the sky clean over Provence. It arrives without warning, moves a great deal of air, and then it is gone. We named our workhorse after it because that is roughly the job.",
      "Forty-eight amps into a hardwired 60 A circuit gives you 11.5 kW, which is around 40 miles of range an hour. Plug in at nine, ignore it, leave at seven. The aluminium body is a single extrusion, anodised rather than painted, so the salt air has nothing to peel.",
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
    category: "shore-power",
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
    category: "shore-power",
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
    slug: "levante-duo",
    name: "Levante",
    designator: "Duo",
    category: "shore-power",
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
  {
    slug: "marin-quay",
    name: "Marin",
    designator: "Quay",
    category: "shore-power",
    price: 1890,
    tagline: "Dockside power for the boat and the car that towed it.",
    blurb:
      "A marine pedestal with 50 A shore power, a J1772 port, and a masthead light that comes on at dusk without being asked.",
    story: [
      "Most of our customers who buy a boat also park a car twenty feet from it. The Marin Quay covers both: 50 A marine shore power on one face, a 48 A J1772 on the other, and a 316 stainless shell that does not care what the tide does.",
      "The light on top is not decoration. It is the only thing you can find at 11 p.m. when the dock lights are out and you are carrying a cooler.",
    ],
    features: [
      "50 A / 125-250 V marine shore power outlet",
      "48 A J1772 port on the reverse face",
      "316 stainless shell, salt-spray tested 2,000 h",
      "Dusk-to-dawn masthead light",
      "GFCI and ELCI protection on both circuits",
    ],
    specs: {
      "Marine output": "50 A / 125-250 V",
      "Vehicle output": "11.5 kW / 48 A",
      Connector: "SAE J1772 + 50 A locking",
      Shell: "316 stainless",
      Protection: "GFCI + ELCI, 30 mA",
      Mounting: "Dock or piling",
      Height: "44 in",
      Warranty: "5 years",
    },
    art: "dock-pedestal",
    rating: 4.9,
    reviews: 88,
    inStock: true,
    incentive: {
      productType: "ev_charger",
      manufacturer: "cape",
      modelNumber: "CP-MRN-Q48",
      amperage: 48,
      kilowatts: 11.5,
      networked: true,
      energyStar: false,
      installRequired: true,
      leapDeviceId: "3b964542-738d-4645-90e6-60347ce9313a",
      deviceLabel: "Tesla Universal Wall Connector (Level 2, networked)",
    },
  },

  // ── Foils ──────────────────────────────────────────────────────────────────
  {
    slug: "ecume-52",
    name: "Écume",
    designator: "5'2\"",
    category: "foils",
    price: 6400,
    badge: "Flies in 8 seconds",
    tagline: "Carbon efoil, 40 minutes up, 24 mph if you insist.",
    blurb:
      "The small one. Loose, quick to lift, and unforgiving in the way that makes you better by Thursday.",
    story: [
      "Écume is French for the foam that a wave leaves behind. It is the last thing you see of this board once it is up on the wing.",
      "Five foot two, 42 litres, full prepreg carbon. It lifts at eight knots and holds a carve like something with an edge. The 1,100 sq cm front wing ships as standard; swap to the 800 if you want to be honest with yourself about how good you are.",
      "The battery is a 2.2 kWh pack that takes 90 minutes on any 15 A outlet, or 40 minutes off a cape wall unit if you are between sessions and the light is still good.",
    ],
    features: [
      "Full prepreg carbon board and mast",
      "2.2 kWh pack, 40 min at cruise",
      "Lifts at 8 knots, tops out at 24 mph",
      "1,100 sq cm front wing included",
      "Silent below 15 mph, near-silent above",
    ],
    specs: {
      Length: "5 ft 2 in",
      Volume: "42 L",
      Weight: "62 lb rigged",
      Battery: "2.2 kWh, swappable",
      "Ride time": "40 min at cruise",
      "Top speed": "24 mph",
      "Charge time": "90 min standard, 40 min fast",
      Warranty: "2 years, 1 year on the pack",
    },
    art: "efoil",
    rating: 4.9,
    reviews: 214,
    inStock: true,
  },
  {
    slug: "houle-60",
    name: "Houle",
    designator: "6'0\"",
    category: "foils",
    price: 6900,
    tagline: "Bigger, mellower, an hour in the air.",
    blurb:
      "The board you hand to a friend who has never done this. Stable on the knees, forgiving on the first flight, still fun on the hundredth.",
    story: [
      "Houle means swell. The 6'0\" runs 68 litres and a wider tail, which translates to a board that gets up early and stays flat while you work out what your back foot is for.",
      "It carries the 3.1 kWh pack, which is an hour of flying and enough left over to get back to the beach against a headwind. Most people buy this one, learn on it, and then never sell it.",
    ],
    features: [
      "68 L, wide tail, stands up under a beginner",
      "3.1 kWh pack, 60 min at cruise",
      "1,600 sq cm high-lift wing included",
      "Soft deck pad, no wax, no traction tape",
      "Beginner speed limiter in the remote",
    ],
    specs: {
      Length: "6 ft 0 in",
      Volume: "68 L",
      Weight: "71 lb rigged",
      Battery: "3.1 kWh, swappable",
      "Ride time": "60 min at cruise",
      "Top speed": "21 mph",
      "Charge time": "2 h standard, 55 min fast",
      Warranty: "2 years, 1 year on the pack",
    },
    art: "efoil-big",
    rating: 4.8,
    reviews: 331,
    inStock: true,
  },
  {
    slug: "ressac",
    name: "Ressac",
    category: "foils",
    price: 4800,
    tagline: "Jet drive, no foil, all shorebreak.",
    blurb:
      "For people who want to surf the days when there is nothing to surf. Sits on the water, not above it, and turns like a board should.",
    story: [
      "Ressac is the water that comes back off a seawall. Fitting, because this is the board for the messy inside section that a foil hates.",
      "Jet drive, no exposed prop, no mast to fall on. You can ride it in two feet of water and hand it to a fourteen-year-old. It is the least serious thing we make and the one that leaves the rack most weekends.",
    ],
    features: [
      "Ducted jet drive, no exposed prop",
      "Rides in 18 in of water",
      "1.9 kWh pack, 35 min hard riding",
      "EVA deck, no wax",
      "Floats and self-rights when you fall",
    ],
    specs: {
      Length: "5 ft 6 in",
      Volume: "58 L",
      Weight: "54 lb",
      Battery: "1.9 kWh, swappable",
      "Ride time": "35 min",
      "Top speed": "32 mph",
      "Charge time": "75 min",
      Warranty: "2 years",
    },
    art: "jetboard",
    rating: 4.6,
    reviews: 402,
    inStock: true,
  },

  // ── Craft ──────────────────────────────────────────────────────────────────
  {
    slug: "calanque-30",
    name: "Calanque",
    designator: "30",
    category: "craft",
    price: 148000,
    deposit: 5000,
    badge: "Built to order",
    tagline: "A 30 ft electric day cat with shade and a swim ladder.",
    blurb:
      "Two hulls, twin 60 kW pods, and a hardtop that keeps eight people out of the sun. Six hours at cruise, silent the whole way.",
    story: [
      "The calanques are the limestone inlets between Marseille and Cassis, which is where this boat was drawn and where it still spends most of its testing. They are narrow, deep, and completely still, and a diesel in one is an act of vandalism.",
      "Twin 60 kW pods on a 210 kWh pack give six hours at 8 knots or ninety minutes at 18. The hardtop carries 3.4 kW of solar, which in July is most of what you need to sit at anchor all day with the fridge running.",
      "Every hull is laid up to order. Deposit reserves a build slot; the balance is due at splash. Current lead time is eleven months.",
    ],
    features: [
      "Twin 60 kW electric pods",
      "210 kWh pack, 6 h at 8 knots",
      "3.4 kW solar hardtop",
      "Seats 12, sleeps 4 in the hulls",
      "Charges from a Marin Quay in 9 hours",
    ],
    specs: {
      Length: "30 ft 2 in",
      Beam: "15 ft 1 in",
      Draft: "2 ft 4 in",
      Propulsion: "2 × 60 kW pods",
      Battery: "210 kWh LFP",
      Range: "48 nm at 8 knots",
      "Top speed": "22 knots",
      "Lead time": "11 months",
    },
    art: "catamaran",
    rating: 5.0,
    reviews: 12,
    inStock: true,
  },
  {
    slug: "rade-22",
    name: "Rade",
    designator: "22",
    category: "craft",
    price: 96000,
    deposit: 5000,
    tagline: "A mahogany runabout that does not wake the harbour.",
    blurb:
      "Twenty-two feet of cold-moulded mahogany over a 120 kW electric drive. Wraparound screen, bench seat, no engine note to shout over.",
    story: [
      "There is a specific kind of boat that made the Côte d'Azur look the way it looks in every photograph from 1962: varnished, low, fast, and loud. We kept three of those four.",
      "Cold-moulded mahogany on an epoxy core, twelve coats of varnish, and a 120 kW drive turning a single prop. It gets to 32 knots and it does it without a single person on the beach looking up.",
      "Deposit reserves a hull. Colour, transom name, and upholstery are chosen at the six-month mark.",
    ],
    features: [
      "Cold-moulded mahogany, 12 coats",
      "120 kW single drive, 32 knots",
      "88 kWh pack, 3 h at cruise",
      "Wraparound screen, bench seat for 6",
      "Charges overnight from a Marin Quay",
    ],
    specs: {
      Length: "22 ft 4 in",
      Beam: "7 ft 6 in",
      Draft: "1 ft 9 in",
      Propulsion: "120 kW single drive",
      Battery: "88 kWh LFP",
      Range: "34 nm at cruise",
      "Top speed": "32 knots",
      "Lead time": "8 months",
    },
    art: "runabout",
    rating: 5.0,
    reviews: 9,
    inStock: true,
  },

  // ── Kit ────────────────────────────────────────────────────────────────────
  {
    slug: "line-25",
    name: "Line",
    designator: "25",
    category: "kit",
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
    category: "kit",
    price: 89,
    tagline: "Cast aluminium. Holds a cable like a dock cleat.",
    blurb:
      "A wall hanger shaped like the thing it was named after, cast in aluminium and finished the same anodised grey as the chargers.",
    story: [
      "Cable on the floor is how cable gets run over. The Cleat Mount takes a full 25 ft coil, mounts to studs or masonry, and looks like it belongs on a dock rather than in a hardware aisle.",
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
    slug: "dry-sack-30",
    name: "Dry Sack",
    designator: "30 L",
    category: "kit",
    price: 110,
    tagline: "Roll top, welded seams, faded on purpose.",
    blurb: "Thirty litres of dry, in a sailcloth that goes chalky in the sun and looks better for it.",
    story: [
      "Recycled sailcloth, welded seams, a roll top that actually seals, and a shoulder strap that can be shortened one-handed while you are holding something else.",
      "The colour is not fast. That is the point. By the end of a season it will be a paler version of whatever you bought, and it will look like it belongs to you.",
    ],
    features: [
      "30 L, fully welded seams",
      "Recycled sailcloth, sun-faded finish",
      "One-handed strap adjust",
      "Floats when sealed, even loaded",
    ],
    specs: {
      Volume: "30 L",
      Material: "Recycled polyester sailcloth",
      Closure: "Roll top, 3 folds",
      Weight: "1.4 lb",
      Warranty: "5 years",
    },
    art: "drysack",
    rating: 4.6,
    reviews: 507,
    inStock: true,
  },
  {
    slug: "board-sock",
    name: "Board Sock",
    category: "kit",
    price: 185,
    tagline: "Padded, vented, sized for a foil.",
    blurb:
      "A travel bag cut for a board with a mast attached, with a separate sleeve for the wings so nothing scores the carbon.",
    story: [
      "Foil boards do not fit in surfboard bags, which is a thing you learn once, expensively. This one is cut with a mast channel and a padded wing sleeve, and it vents so a wet board does not cook in a hot car.",
    ],
    features: [
      "Cut for a board with mast attached",
      "Padded wing sleeve",
      "Reflective outer, vented base",
      "Backpack straps stow flat",
    ],
    specs: {
      Fits: "Up to 6 ft 2 in",
      Padding: "10 mm closed cell",
      Material: "600D recycled poly, reflective",
      Weight: "5.2 lb",
      Warranty: "3 years",
    },
    art: "boardsock",
    rating: 4.7,
    reviews: 163,
    inStock: true,
  },
  {
    slug: "sunfade-cap",
    name: "Sunfade Cap",
    category: "kit",
    price: 38,
    tagline: "Five panels, one season, permanent salt line.",
    blurb: "Washed cotton twill, unstructured, with a brim that has already given up on being flat.",
    story: [
      "We make one hat. It is unstructured cotton twill in a dye that will not survive July, which is the correct outcome. The brim is soft enough to fold into a pocket and stay folded.",
    ],
    features: ["Washed cotton twill, unstructured", "Soft folding brim", "Adjustable brass slide", "One size"],
    specs: {
      Material: "Washed cotton twill",
      Fit: "Unstructured, one size",
      Closure: "Brass slide",
      Care: "Cold wash, dry in the sun",
    },
    art: "cap",
    rating: 4.9,
    reviews: 1042,
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

/** What you actually pay today: a deposit for build-to-order craft. */
export function checkoutPrice(p: Product): number {
  return p.deposit ?? p.price
}
