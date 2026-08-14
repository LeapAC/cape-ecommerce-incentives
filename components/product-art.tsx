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

  "dock-pedestal": (
    <>
      <rect x="168" y="152" width="64" height="150" rx="12" fill={INK} />
      <rect x="156" y="134" width="88" height="22" rx="9" fill={INK} />
      <path d="M176 134a24 24 0 0 1 48 0z" fill={SUN} />
      <rect x="180" y="180" width="40" height="34" rx="9" fill={CREAM} opacity="0.88" />
      <rect x="180" y="226" width="40" height="34" rx="9" fill={CREAM} opacity="0.5" />
      <rect x="146" y="300" width="108" height="16" rx="6" fill={INK} />
      <path
        d="M232 196c30-16 56-6 56 12s-24 28-46 18"
        stroke={INK}
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  efoil: (
    <g transform="rotate(-8 200 200)">
      <path d="M92 156c0-16 44-26 108-26s108 10 108 26-44 26-108 26S92 172 92 156Z" fill={INK} />
      <path d="M126 152c0-7 30-12 66-12s60 5 60 12-24 11-60 11-66-4-66-11Z" fill={CREAM} opacity="0.24" />
      <path d="M190 180h20v72h-20z" fill={INK} />
      <path d="M154 248h98v11h-98z" fill={INK} />
      <path d="M116 262c24-17 62-17 84 0-21 12-63 12-84 0Z" fill={INK} />
      <path d="M232 248c14-8 34-8 46 0-12 8-34 8-46 0Z" fill={INK} opacity="0.85" />
      <circle cx="272" cy="152" r="9" fill={SUN} />
    </g>
  ),

  "efoil-big": (
    <g transform="rotate(-6 200 200)">
      <path d="M78 158c0-19 48-31 122-31s122 12 122 31-48 31-122 31S78 177 78 158Z" fill={INK} />
      <path d="M116 154c0-8 34-14 76-14s70 6 70 14-30 13-70 13-76-5-76-13Z" fill={CREAM} opacity="0.24" />
      <path d="M188 188h24v70h-24z" fill={INK} />
      <path d="M146 254h108v12H146z" fill={INK} />
      <path d="M100 268c28-19 72-19 100 0-25 14-75 14-100 0Z" fill={INK} />
      <path d="M236 254c16-9 40-9 54 0-14 9-38 9-54 0Z" fill={INK} opacity="0.85" />
      <circle cx="284" cy="154" r="9" fill={SUN} />
    </g>
  ),

  jetboard: (
    <g transform="rotate(-13 200 200)">
      <path
        d="M62 202c32-36 100-58 156-58 60 0 106 24 106 58s-46 58-106 58c-56 0-124-22-156-58Z"
        fill={INK}
      />
      <path
        d="M132 202c18-18 56-30 92-30 38 0 64 13 64 30s-26 30-64 30c-36 0-74-12-92-30Z"
        fill={CREAM}
        opacity="0.2"
      />
      <circle cx="300" cy="202" r="17" fill={SUN} />
      <path d="M282 236c14 6 26 6 36 0" stroke={CREAM} strokeWidth="6" opacity="0.35" fill="none" />
    </g>
  ),

  /* Profile view. A catamaran drawn head-on reads as furniture, so the far
     hull sits behind the near one and the hardtop gives it a deck line. */
  catamaran: (
    <>
      <path d="M70 268c58-10 190-10 268-6l-8 20c-30 10-208 10-248 0Z" fill={INK} opacity="0.5" />
      <path d="M50 256c70-12 214-12 296-6v22c0 22-28 34-86 34H134c-44 0-70-20-84-50Z" fill={INK} />
      <path d="M130 212h142l18 38H112Z" fill={INK} />
      <path d="M148 222h106l11 20H138Z" fill={CREAM} opacity="0.3" />
      <rect x="120" y="174" width="10" height="38" fill={INK} />
      <rect x="274" y="174" width="10" height="38" fill={INK} />
      <path d="M102 164h206l12 16H90Z" fill={INK} />
      <circle cx="200" cy="276" r="10" fill={SUN} />
    </>
  ),

  runabout: (
    <>
      <path d="M44 250c66-30 176-42 300-36v54c0 24-24 36-76 36H150c-46 0-84-22-106-54Z" fill={INK} />
      <path d="M62 262c58-26 162-36 282-30v13c-120-6-222 4-278 28Z" fill={CREAM} opacity="0.32" />
      <path d="M196 214l16-28h44l8 27Z" fill={CREAM} opacity="0.5" />
      <path d="M276 216h58v10h-58z" fill={CREAM} opacity="0.22" />
      <circle cx="120" cy="240" r="10" fill={SUN} />
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

  drysack: (
    <>
      <path d="M132 178h136v106c0 24-20 38-68 38s-68-14-68-38z" fill={INK} />
      <path d="M126 150h148l-10 28H136z" fill={INK} opacity="0.85" />
      <rect x="142" y="136" width="116" height="18" rx="9" fill={INK} />
      <path d="M148 210c42 13 62 13 104 0" stroke={CREAM} strokeWidth="9" opacity="0.24" fill="none" />
      <path
        d="M268 202c36 12 40 62 4 86"
        stroke={INK}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="200" cy="252" r="12" fill={SUN} />
    </>
  ),

  boardsock: (
    <g transform="rotate(-12 200 200)">
      <path d="M64 200c0-23 26-40 62-40h148c34 0 62 17 62 40s-28 40-62 40H126c-36 0-62-17-62-40Z" fill={INK} />
      <path d="M96 200h208" stroke={CREAM} strokeWidth="9" opacity="0.2" fill="none" />
      <path d="M140 162v76M258 162v76" stroke={CREAM} strokeWidth="7" opacity="0.16" fill="none" />
      <path
        d="M150 240c22 42 100 42 122 0"
        stroke={INK}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="306" cy="200" r="11" fill={SUN} />
    </g>
  ),

  cap: (
    <>
      <path d="M128 218c0-46 32-82 72-82s72 36 72 82z" fill={INK} />
      <path d="M272 202c36 6 56 18 56 30H124c0-10 6-16 16-16h132z" fill={INK} opacity="0.88" />
      <circle cx="200" cy="140" r="8" fill={SUN} />
      <path d="M200 144v74" stroke={CREAM} strokeWidth="5" opacity="0.2" fill="none" />
      <path d="M168 158c-10 20-14 40-14 60" stroke={CREAM} strokeWidth="5" opacity="0.14" fill="none" />
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
