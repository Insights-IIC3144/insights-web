import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pctChange(current: number, prior: number): number {
  return prior !== 0 ? ((current - prior) / prior) * 100 : 0;
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
