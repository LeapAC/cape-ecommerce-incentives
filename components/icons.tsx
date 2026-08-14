/* Hand-rolled icon set. Twelve glyphs is not worth a dependency. */

type IconProps = { className?: string; strokeWidth?: number; style?: React.CSSProperties }

function Svg({
  children,
  className,
  strokeWidth = 1.6,
  style,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      style={style}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const Bag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
)

export const Close = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
)

export const Plus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const Minus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const ChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
)

export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Svg>
)

export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Svg>
)

export const Menu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

export const Star = ({ className, filled = true, style }: IconProps & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinejoin="round"
    className={className ?? "h-3.5 w-3.5"}
    style={style}
    aria-hidden
  >
    <path d="m12 3.6 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.9-5.2 2.9 1-6L3.5 9.9l5.9-.8L12 3.6Z" />
  </svg>
)

export const Bolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />
  </Svg>
)

export const Truck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 7h11v10H2zM13 10h4.5L21 13.5V17h-8" />
    <circle cx="7" cy="18.5" r="1.8" />
    <circle cx="17" cy="18.5" r="1.8" />
  </Svg>
)

export const Shield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6l-7-3Z" />
  </Svg>
)

export const Pencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16.5 4.5 19.5 7.5 8 19H5v-3L16.5 4.5Z" />
  </Svg>
)

export const Anchor = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v13M5 13a7 7 0 0 0 14 0M8 10H4M20 10h-4" />
  </Svg>
)
