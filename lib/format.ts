export const fmtMoney = (n: number, opts?: { compact?: boolean }) =>
  opts?.compact
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1, style: "currency", currency: "USD" }).format(n)
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const fmtPct = (n: number, d = 1) => `${n.toFixed(d)}%`;
