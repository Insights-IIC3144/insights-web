type Granularity = "daily" | "weekly" | "monthly" | "yearly";
type DateFmt = "YYYY" | "YYYY-MM" | "YYYY-MM-DD";

function leastSquares(ys: number[]): { slope: number; intercept: number } {
  const n = ys.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = ys.reduce((s, y, i) => s + i * y, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: n > 0 ? sumY / n : 0 };
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return { slope: m, intercept: b };
}

function detectFormat(dateStr: string): DateFmt {
  const parts = dateStr.split("-");
  if (parts.length === 1) return "YYYY";
  if (parts.length === 2) return "YYYY-MM";
  return "YYYY-MM-DD";
}

function parseUTC(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(Date.UTC(parts[0], (parts[1] ?? 1) - 1, parts[2] ?? 1));
}

function formatUTC(date: Date, fmt: DateFmt): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  if (fmt === "YYYY") return `${y}`;
  if (fmt === "YYYY-MM") return `${y}-${m}`;
  return `${y}-${m}-${d}`;
}

function advanceDate(dateStr: string, granularity: Granularity): string {
  const fmt = detectFormat(dateStr);
  const date = parseUTC(dateStr);
  switch (granularity) {
    case "daily":
      date.setUTCDate(date.getUTCDate() + 1);
      break;
    case "weekly":
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
    case "yearly":
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
  }
  return formatUTC(date, fmt);
}

export function inferGranularity(labels: string[]): Granularity {
  if (labels.length < 2 || !labels[0]) return "monthly";
  const fmt = detectFormat(labels[0]);
  if (fmt === "YYYY") return "yearly";
  if (fmt === "YYYY-MM") return "monthly";
  const days =
    (parseUTC(labels[1]).getTime() - parseUTC(labels[0]).getTime()) /
    86_400_000;
  if (days <= 2) return "daily";
  if (days <= 8) return "weekly";
  return "monthly";
}

export function projectLinear(
  labels: string[],
  values: number[],
  granularity: string,
  periods?: number
): { label: string; value: number }[] {
  if (values.length < 2 || !labels[labels.length - 1]) return [];
  const n =
    periods ?? Math.min(Math.max(Math.round(values.length * 0.25), 3), 6);
  const { slope, intercept } = leastSquares(values);
  const len = values.length;
  let lastLabel = labels[labels.length - 1];
  return Array.from({ length: n }, (_, i) => {
    lastLabel = advanceDate(lastLabel, granularity as Granularity);
    return { label: lastLabel, value: Math.max(0, intercept + slope * (len + i)) };
  });
}
