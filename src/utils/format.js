/**
 * Display formatters.
 * Pure functions — no React, no side effects, no DOM. Kept separate from
 * components so they can be unit tested in isolation.
 */

/**
 * Formats a numeric price into UK currency with no decimal places.
 * 750000 -> "£750,000"
 *
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return '—';

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats an ISO date string into a compact uppercase form that suits the
 * monospace "spec sheet" treatment.
 * "2025-09-12" -> "12 SEP 2025"
 *
 * @param {string} isoDate - e.g. "2025-09-12"
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .toUpperCase()
    .replace(/,/g, '');
}

/**
 * Pluralises the bedroom count.
 * 1 -> "1 bedroom" ; 3 -> "3 bedrooms"
 *
 * @param {number} count
 * @returns {string}
 */
export function formatBedrooms(count) {
  if (typeof count !== 'number' || Number.isNaN(count)) return '—';
  return `${count} ${count === 1 ? 'bedroom' : 'bedrooms'}`;
}