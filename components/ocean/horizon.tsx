import { WaveField } from "./wave-field"
import { HERO_SWELL, TRIM_SWELL } from "./waves"

/* Thin, low, and faint: bands of cloud lit from underneath, not blobs. */
const CLOUD_STREAKS = [
  { left: "2%", top: "62%", width: "30rem", height: "0.45rem", blur: 5, opacity: 0.2 },
  { left: "46%", top: "54%", width: "24rem", height: "0.35rem", blur: 4, opacity: 0.14 },
  { left: "62%", top: "70%", width: "36rem", height: "0.55rem", blur: 6, opacity: 0.24 },
  { left: "18%", top: "78%", width: "22rem", height: "0.4rem", blur: 4, opacity: 0.18 },
]

/**
 * Golden-hour backdrop: sky, sun on the waterline, specular glitter, swell.
 * Fills its positioned parent. Decorative only.
 */
export function Horizon({
  className,
  /** Waterline as a percentage of the container height. */
  horizon = 58,
  /** Fewer, shallower wave layers for short bands. */
  trim = false,
}: {
  className?: string
  horizon?: number
  trim?: boolean
}) {
  // Short bands need a smaller sun, or the disc swamps them.
  const discSize = trim ? "5rem" : "8.5rem"
  const bloomSize = trim ? "30rem" : "52rem"

  return (
    <div className={`grain absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden>
      {/* sky — ends on a hazy band rather than full amber, so the disc reads */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{
          height: `${horizon}%`,
          background:
            "linear-gradient(to bottom, var(--sky-high) 0%, var(--sky-high) 14%, var(--sky-mid) 52%, color-mix(in oklab, var(--sky-low) 62%, var(--sky-mid)) 84%, color-mix(in oklab, var(--sky-low) 72%, var(--sky-mid)) 100%)",
        }}
      >
        {CLOUD_STREAKS.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: c.left,
              top: c.top,
              width: c.width,
              height: c.height,
              opacity: c.opacity,
              filter: `blur(${c.blur}px)`,
              background: "var(--sun)",
            }}
          />
        ))}
      </div>

      {/* atmospheric bloom around the sun */}
      <div
        className="absolute"
        style={{
          left: "52%",
          top: `${horizon}%`,
          width: bloomSize,
          height: bloomSize,
          transform: "translate(-50%, -74%)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--sun) 38%, transparent) 0%, color-mix(in oklab, var(--sun) 10%, transparent) 30%, transparent 58%)",
        }}
      />

      {/* The disc: white-hot core with an amber rim, so it reads as the light
          source rather than disappearing into the amber haze behind it.
          Positioning lives on the wrapper because the `breathe` keyframes
          animate `transform`, which would otherwise clobber the translate. */}
      <div
        className="absolute"
        style={{ left: "52%", top: `${horizon}%`, transform: "translate(-50%, -88%)" }}
      >
        <div
          className="sun-disc rounded-full"
          style={{
            width: discSize,
            height: discSize,
            background:
              "radial-gradient(circle at 50% 46%, #ffffff 0%, #fffcef 38%, #ffeab2 70%, var(--sun) 100%)",
            boxShadow: "0 0 6rem 2rem color-mix(in oklab, var(--sun) 40%, transparent)",
          }}
        />
      </div>

      {/* sea */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: `${horizon}%`,
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--sky-low) 62%, var(--sea)) 0%, var(--sea) 20%, var(--deep) 100%)",
        }}
      />

      {/* specular path running back from the sun */}
      <div
        className="glitter absolute"
        style={{
          left: "52%",
          top: `${horizon}%`,
          width: "22rem",
          height: `${100 - horizon}%`,
          transform: "translateX(-50%)",
          opacity: 0.34,
          mixBlendMode: "screen",
        }}
      />

      <WaveField layers={trim ? TRIM_SWELL : HERO_SWELL} className="h-1/2" />

      {/* vignette, keeps the type legible at the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 40%, color-mix(in oklab, var(--deep) 52%, transparent) 100%)",
        }}
      />
    </div>
  )
}

/**
 * A wave-cut edge between two flat sections. `fill` should be the colour of
 * the section the wave is biting into.
 */
export function WaveEdge({
  fill = "var(--paper)",
  flip = false,
  className,
}: {
  fill?: string
  flip?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 1200 90"
      preserveAspectRatio="none"
      className={`block h-[3.5rem] w-full sm:h-[5rem] ${className ?? ""}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
      aria-hidden
    >
      <path
        d="M0 46C100 12 200 6 300 30c100 24 200 44 300 30 100-14 200-52 300-46 60 4 200 34 300 44V90H0Z"
        fill={fill}
      />
    </svg>
  )
}
