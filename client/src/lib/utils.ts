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

/**
 * Format a currency value with the appropriate currency symbol
 * @param value The numeric value to format
 * @param currency The currency code (default: "USD")
 * @returns Formatted currency string
 */
export function formatCurrency(value?: number | string | null, currency: string = "USD") {
  if (value === undefined || value === null) return "";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "";
  
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(numValue);
}
