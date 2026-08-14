import { tidePath, type WaveLayer } from "./waves"

/**
 * A stack of drifting swell layers. Purely decorative, so it is hidden from
 * assistive tech and freezes entirely under prefers-reduced-motion.
 */
export function WaveField({ layers, className }: { layers: WaveLayer[]; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${className ?? ""}`} aria-hidden>
      {layers.map((layer, i) => (
        <div
          key={i}
          className="wave-layer"
          style={{
            bottom: layer.bottom,
            height: layer.height,
            animationDuration: `${layer.duration}s`,
            animationDirection: layer.reverse ? "reverse" : "normal",
          }}
        >
          <svg viewBox="0 0 2400 240" preserveAspectRatio="none" className="h-full w-full">
            <path
              d={tidePath(layer.period, layer.amplitude, layer.baseline)}
              fill={layer.fill}
              opacity={layer.opacity}
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
