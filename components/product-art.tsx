import type { ArtKey } from "@/lib/catalog"

/**
 * Product plates.
 *
 * Flat poster graphics in the mark's own two colours rather than photography:
 * the catalog is fictional, and drawn art stays honest about that while still
 * looking art-directed. Everything recolours with the theme.
 */

const INK = "var(--ink)"
const SUN = "var(--sun)"
const CREAM = "var(--shell)"
const SEA = "var(--sea)"

function Plate({
  children,
  sun = { x: 274, y: 128, r: 78 },
}: {
  children: React.ReactNode
  sun?: { x: number; y: number; r: number }
}) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <rect width="400" height="400" fill="var(--shell-sunk)" />
      <circle cx={sun.x} cy={sun.y} r={sun.r} fill={SUN} opacity="0.9" />
      <path
        d="M-20 332c62-18 124-18 186 0s124 18 254-4"
        stroke={SEA}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
      <path
        d="M-20 360c72-20 144-20 216 0s122 16 224-6"
        stroke={SEA}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {children}
    </svg>
  )
}

const ART: Record<ArtKey, React.ReactNode> = {
  "wall-charger": (
    <>
      <rect x="146" y="92" width="108" height="176" rx="28" fill={INK} />
      <rect x="164" y="114" width="72" height="46" rx="11" fill={CREAM} opacity="0.9" />
      <circle cx="200" cy="200" r="19" fill="none" stroke={SUN} strokeWidth="7" />
      <rect x="178" y="240" width="44" height="9" rx="4.5" fill={CREAM} opacity="0.3" />
      <path
        d="M200 268c0 30-48 26-48 56 0 22 28 26 44 14"
        stroke={INK}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="182" y="322" width="36" height="28" rx="10" fill={INK} />
    </>
  ),

  "portable-charger": (
    <>
      <rect x="118" y="172" width="156" height="74" rx="22" fill={INK} />
      <rect x="138" y="192" width="62" height="34" rx="9" fill={CREAM} opacity="0.88" />
      <circle cx="242" cy="209" r="13" fill={SUN} />
      <rect x="90" y="188" width="30" height="42" rx="9" fill={INK} />
      <rect x="72" y="196" width="20" height="8" rx="4" fill={INK} />
      <rect x="72" y="214" width="20" height="8" rx="4" fill={INK} />
      <path
        d="M274 209c38 4 40 48 16 64-22 14-56 2-56-22"
        stroke={INK}
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="216" y="238" width="32" height="26" rx="9" fill={INK} />
    </>
  ),

  "finned-charger": (
    <>
      <rect x="136" y="82" width="114" height="192" rx="26" fill={INK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="250" y={100 + i * 36} width="28" height="24" rx="7" fill={INK} opacity="0.72" />
      ))}
      <rect x="154" y="104" width="78" height="52" rx="11" fill={CREAM} opacity="0.9" />
      <path d="M198 186l-16 30h18l-6 26 24-36h-18l6-20z" fill={SUN} />
      <path
        d="M193 274c0 36-54 30-54 62"
        stroke={INK}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="120" y="330" width="38" height="28" rx="10" fill={INK} />
    </>
  ),

  "duo-pedestal": (
    <>
      <rect x="174" y="118" width="52" height="182" rx="10" fill={INK} />
      <rect x="146" y="80" width="108" height="74" rx="18" fill={INK} />
      <rect x="164" y="98" width="72" height="36" rx="9" fill={CREAM} opacity="0.88" />
      <rect x="122" y="164" width="32" height="42" rx="11" fill={INK} />
      <rect x="246" y="164" width="32" height="42" rx="11" fill={INK} />
      <path
        d="M136 206c-26 20-30 54-10 74"
        stroke={INK}
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M264 206c26 20 30 54 10 74"
        stroke={INK}
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="138" y="298" width="124" height="18" rx="7" fill={INK} />
      <circle cx="200" cy="170" r="9" fill={SUN} />
    </>
  ),

  /* Wall unit with a NACS handle in the holster and the J1772 adapter hung
     beside it, so the plate says "both plugs" without a caption. */
  "universal-charger": (
    <>
      <rect x="140" y="88" width="104" height="184" rx="40" fill={INK} />
      <rect x="160" y="112" width="64" height="8" rx="4" fill={CREAM} opacity="0.3" />
      <circle cx="192" cy="168" r="22" fill={CREAM} opacity="0.9" />
      <circle cx="192" cy="168" r="9" fill={SUN} />
      <rect x="172" y="212" width="40" height="30" rx="12" fill={CREAM} opacity="0.22" />
      <path
        d="M192 272c0 34 56 30 56 62"
        stroke={INK}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="230" y="326" width="36" height="26" rx="11" fill={INK} />
      <rect x="264" y="196" width="30" height="44" rx="12" fill={INK} opacity="0.78" />
      <circle cx="279" cy="210" r="5" fill={SUN} />
    </>
  ),

  cable: (
    <>
      <circle cx="192" cy="196" r="76" fill="none" stroke={INK} strokeWidth="21" />
      <circle cx="192" cy="196" r="46" fill="none" stroke={INK} strokeWidth="19" opacity="0.72" />
      <path d="M246 250l34 34" stroke={INK} strokeWidth="19" strokeLinecap="round" fill="none" />
      <rect x="268" y="272" width="48" height="38" rx="13" fill={INK} transform="rotate(-45 292 291)" />
      <circle cx="192" cy="196" r="14" fill={SUN} />
    </>
  ),

  mount: (
    <>
      <rect x="160" y="182" width="80" height="46" rx="11" fill={INK} />
      <path d="M160 206c-32-24-62-14-62 8s30 32 62 12z" fill={INK} />
      <path d="M240 206c32-24 62-14 62 8s-30 32-62 12z" fill={INK} />
      <rect x="146" y="232" width="108" height="18" rx="7" fill={INK} opacity="0.72" />
      <circle cx="200" cy="205" r="10" fill={SUN} />
    </>
  ),

  /* Driveway pedestal: a slim post, a charger head, and the dusk light. */
  post: (
    <>
      <rect x="182" y="132" width="36" height="172" rx="8" fill={INK} />
      <path d="M176 132a24 24 0 0 1 48 0z" fill={SUN} />
      <rect x="170" y="124" width="60" height="12" rx="6" fill={INK} />
      <rect x="156" y="166" width="88" height="96" rx="20" fill={INK} />
      <rect x="172" y="184" width="56" height="30" rx="8" fill={CREAM} opacity="0.88" />
      <circle cx="200" cy="238" r="8" fill={SUN} />
      <rect x="146" y="300" width="108" height="16" rx="6" fill={INK} />
      <path
        d="M244 222c30-8 48 8 44 30s-26 30-48 20"
        stroke={INK}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  /* Load manager: a small box with a readout, two clamps on the mains. */
  "load-meter": (
    <>
      <rect x="150" y="104" width="100" height="132" rx="18" fill={INK} />
      <rect x="166" y="122" width="68" height="40" rx="8" fill={CREAM} opacity="0.88" />
      <path d="M174 150l14-12 12 8 16-16 12 10" stroke={SUN} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="200" cy="200" r="15" fill="none" stroke={SUN} strokeWidth="6" />
      <path d="M178 236c-6 30-34 38-34 68" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M222 236c6 30 34 38 34 68" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M126 304a18 18 0 1 0 36 0" stroke={INK} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M238 304a18 18 0 1 0 36 0" stroke={INK} strokeWidth="12" fill="none" strokeLinecap="round" />
    </>
  ),

  /* Install: a house front with the charger already on the wall. */
  install: (
    <>
      <path d="M96 196 200 112l104 84v112H96Z" fill={INK} />
      <path d="M82 202 200 106l118 96" stroke={INK} strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="124" y="226" width="62" height="82" rx="6" fill={CREAM} opacity="0.22" />
      <rect x="222" y="214" width="48" height="66" rx="14" fill={CREAM} opacity="0.9" />
      <path d="M248 228l-10 18h12l-4 16 14-22h-12l4-12z" fill={SUN} />
      <path d="M246 280c0 18-16 22-16 28" stroke={CREAM} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  ),

  /* Site visit: the panel door open, breakers in two columns, one lit. */
  "site-visit": (
    <>
      <rect x="138" y="96" width="124" height="200" rx="14" fill={INK} />
      <path d="M138 110 96 124v158l42 14Z" fill={INK} opacity="0.6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="156" y={118 + i * 32} width="38" height="18" rx="5" fill={CREAM} opacity={i === 2 ? 0.9 : 0.3} />
          <rect x="206" y={118 + i * 32} width="38" height="18" rx="5" fill={CREAM} opacity="0.3" />
        </g>
      ))}
      <circle cx="175" cy="191" r="5" fill={SUN} />
      <rect x="182" y="300" width="36" height="22" rx="7" fill={INK} opacity="0.72" />
    </>
  ),
}

export function ProductArt({ art, className }: { art: ArtKey; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Plate>{ART[art]}</Plate>
    </div>
  )
}
