import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pctChange(current: number, prior: number): number {
  return prior !== 0 ? ((current - prior) / prior) * 100 : 0;
}

function decimalPlaces(n: number): number {
  const str = String(n);
  const dot = str.indexOf(".");
  return dot === -1 ? 0 : str.length - dot - 1;
}

export function invertPctChange(current: number, delta: number): number {
  const factor = 1 + delta / 100;
  if (factor === 0) return 0;
  const raw = current / factor;
  const prec = decimalPlaces(current);
  if (prec === 0) return Math.round(raw);
  const m = Math.pow(10, prec);
  return Math.round(raw * m) / m;
}

export function toggleFilter(
  filters: Record<string, string>,
  key: string,
  value: string
): Record<string, string> {
  if (filters[key] === value) {
    const next = { ...filters };
    delete next[key];
    return next;
  }
  return { ...filters, [key]: value };
}
