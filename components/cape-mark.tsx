/**
 * The cape mark: a curling wave with the sun setting inside the barrel.
 *
 * Drawn in SVG so it recolours with the theme and stays crisp at 24 px.
 * If you have the original vector, drop it in and keep the same two fills:
 * `--mark-wave` for the wave and `--mark-sun` for the disc.
 */

interface MarkProps {
  className?: string
  /** "brand" is navy on cream; "inverse" is cream on water. */
  tone?: "brand" | "inverse"
  title?: string
}

export function CapeMark({ className, tone = "brand", title = "cape" }: MarkProps) {
  const wave = tone === "inverse" ? "var(--hero-ink)" : "var(--ink)"
  const sun = "var(--sun)"

  return (
    <svg
      viewBox="0 0 260 172"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* sun, sitting on the horizon inside the curl */}
      <path d="M154 113a34 34 0 0 1 68 0Z" fill={sun} />

      {/* the crest: thin at the left tip, pitching over to the right */}
      <path
        d="M14 130C44 64 92 28 140 32c46 4 82 32 78 62-3 22-24 30-36 18-10-10-4-26 10-26-14-24-46-32-74-20-34 14-74 38-104 64Z"
        fill={wave}
      />

      {/* the back of the wave sweeping out to the right */}
      <path
        d="M30 150c36-28 76-24 112-10 34 13 64 12 90-6-18 24-54 32-90 20-38-13-76-12-112-4Z"
        fill={wave}
      />
    </svg>
  )
}

export function CapeLogo({
  className,
  tone = "brand",
}: {
  className?: string
  tone?: "brand" | "inverse"
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <CapeMark tone={tone} className="h-7 w-auto shrink-0" title="" />
      <span
        className="display text-[1.7rem] leading-none tracking-[-0.045em]"
        style={{ color: tone === "inverse" ? "var(--hero-ink)" : "var(--ink)" }}
      >
        cape
      </span>
    </span>
  )
}
