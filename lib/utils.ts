import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pctChange(current: number, prior: number): number {
  return prior !== 0 ? ((current - prior) / prior) * 100 : 0;
}
