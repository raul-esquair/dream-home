/** "$550,000" — whole dollars, en-US grouping. */
export function currency(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** 6.375 -> "6.375", 6.5 -> "6.5", 6 -> "6" (trailing zeros trimmed). */
export function trimRate(n: number): string {
  return String(parseFloat(n.toFixed(3)));
}

/**
 * Monthly principal & interest. Not a loan commitment — taxes, insurance,
 * PMI and HOA are deliberately excluded (see README, "Loan calculator").
 */
export function monthlyPayment(price: number, downPct: number, rate: number, term: number): number {
  const loan = price * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = term * 12;
  return r > 0 ? (loan * r) / (1 - Math.pow(1 + r, -n)) : loan / n;
}
