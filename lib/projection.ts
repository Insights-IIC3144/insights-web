type Granularity = "daily" | "weekly" | "monthly" | "yearly";

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

function advanceDate(dateStr: string, granularity: Granularity): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
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
  return date.toISOString().split("T")[0];
}

export function inferGranularity(labels: string[]): Granularity {
  if (labels.length < 2) return "monthly";
  const a = new Date(labels[0] + "T00:00:00Z").getTime();
  const b = new Date(labels[1] + "T00:00:00Z").getTime();
  const days = (b - a) / 86_400_000;
  if (days <= 2) return "daily";
  if (days <= 8) return "weekly";
  if (days <= 32) return "monthly";
  return "yearly";
}

export function projectLinear(
  labels: string[],
  values: number[],
  granularity: string,
  periods?: number
): { label: string; value: number }[] {
  if (values.length < 2) return [];
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
