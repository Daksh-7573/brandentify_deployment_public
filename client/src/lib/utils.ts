import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as MMM yyyy (e.g., "Jan 2023")
 * @param date Date string or Date object
 * @returns Formatted date string or empty string if no date provided
 */
export function formatDate(date?: string | Date) {
  if (!date) return "";
  return format(new Date(date), "MMM yyyy");
}
