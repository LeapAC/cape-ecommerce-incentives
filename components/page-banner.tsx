import { TopIsWater } from "@/lib/water-top"
import { Horizon, WaveEdge } from "./ocean/horizon"

export function PageBanner({
  eyebrow,
  title,
  blurb,
  children,
}: {
  eyebrow?: string
  title: string
  blurb?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden pt-36 pb-28 sm:pt-40 sm:pb-32">
      <TopIsWater />
      <Horizon horizon={64} trim />

      <div className="on-water relative mx-auto max-w-[88rem] px-5 sm:px-8">
        {eyebrow && <p className="rise rise-1 label muted-water">{eyebrow}</p>}
        <h1 className="rise rise-2 display mt-5 max-w-[15ch] text-[clamp(2.6rem,7vw,5.4rem)]">
          {title}
        </h1>
        {blurb && (
          <p className="rise rise-3 muted-water mt-6 max-w-[52ch] text-lg leading-relaxed">
            {blurb}
          </p>
        )}
        {children && <div className="rise rise-4 mt-8">{children}</div>}
      </div>

      <div className="absolute inset-x-0 -bottom-px z-20">
        <WaveEdge fill="var(--paper)" />
      </div>
    </section>
  )
}
