const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Whole-dollar money for catalog and summary lines. */
export function money(value: number): string {
  return usd.format(value)
}

/** Cent-precise money for anything that has to add up on a receipt. */
export function moneyExact(value: number): string {
  return usdCents.format(value)
}
