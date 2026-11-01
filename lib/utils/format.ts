/**
 * Formats an amount in paise to Indian Rupee (₹) string.
 * Example: 899000 paise -> "₹8,990"
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Formats date into luxury editorial readable format
 * e.g., "28 October 2026"
 */
export function formatDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDateString;
  }
}

/**
 * Helper to calculate discount percentage
 */
export function calculateDiscountPercentage(pricePaise: number, comparePricePaise?: number | null): number {
  if (!comparePricePaise || comparePricePaise <= pricePaise) return 0;
  return Math.round(((comparePricePaise - pricePaise) / comparePricePaise) * 100);
}
