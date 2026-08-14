/**
 * Wave geometry.
 *
 * Every path spans 2400 units and repeats exactly at 1200, so a layer rendered
 * at 200% width can translate by -50% forever without a visible seam.
 * `period` must divide 1200.
 */
export function tidePath(period: number, amplitude: number, baseline: number, height = 240): string {
  const total = 2400
  // 4/3 of the amplitude puts the cubic's apex on the intended peak.
  const k = (amplitude * 4) / 3
  const h = period / 2

  let d = `M0 ${baseline}`
  for (let x = 0; x < total; x += period) {
    d += ` C${x + h / 3} ${baseline - k} ${x + (2 * h) / 3} ${baseline - k} ${x + h} ${baseline}`
    d += ` C${x + h + h / 3} ${baseline + k} ${x + h + (2 * h) / 3} ${baseline + k} ${x + period} ${baseline}`
  }
  return `${d} L${total} ${height} L0 ${height} Z`
}

export interface WaveLayer {
  period: number
  amplitude: number
  baseline: number
  fill: string
  opacity: number
  /** Seconds for one full drift cycle. Slower reads as further away. */
  duration: number
  reverse?: boolean
  /** Distance from the bottom of the container, as a CSS length. */
  bottom: string
  height: string
}

/** Four layers of swell for the hero: far and pale, near and dark. */
export const HERO_SWELL: WaveLayer[] = [
  {
    period: 1200,
    amplitude: 14,
    baseline: 60,
    fill: "var(--sky-mid)",
    opacity: 0.5,
    duration: 61,
    bottom: "26%",
    height: "13rem",
  },
  {
    period: 600,
    amplitude: 20,
    baseline: 70,
    fill: "var(--sea)",
    opacity: 0.62,
    duration: 43,
    reverse: true,
    bottom: "14%",
    height: "14rem",
  },
  {
    period: 400,
    amplitude: 26,
    baseline: 84,
    fill: "var(--sea)",
    opacity: 0.85,
    duration: 29,
    bottom: "4%",
    height: "15rem",
  },
  {
    period: 300,
    amplitude: 22,
    baseline: 96,
    fill: "var(--deep)",
    opacity: 1,
    duration: 19,
    reverse: true,
    bottom: "-4%",
    height: "16rem",
  },
]

/** Two shallow layers for section footers and dividers. */
export const TRIM_SWELL: WaveLayer[] = [
  {
    period: 600,
    amplitude: 16,
    baseline: 74,
    fill: "var(--sea)",
    opacity: 0.4,
    duration: 47,
    bottom: "0",
    height: "7rem",
  },
  {
    period: 400,
    amplitude: 20,
    baseline: 88,
    fill: "var(--deep)",
    opacity: 1,
    duration: 31,
    reverse: true,
    bottom: "-1.5rem",
    height: "8rem",
  },
]
