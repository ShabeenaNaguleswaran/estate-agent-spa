/**
 * Display formatters.
 *
 * Pure functions — no React, no side effects, no DOM. Kept separate from the
 * components so they can be unit tested in isolation, and so the market the
 * application targets can be changed from one place.
 */

/* -- Currency -------------------------------------------------------------- */

/**
 * Currency locale and code. Centralised so the application can be re-based to
 * another market without touching a single component.
 */
const CURRENCY_LOCALE = 'en-LK';
const CURRENCY = 'LKR';

/* -- Dates ----------------------------------------------------------------- */

/**
 * Month abbreviations, fixed at three characters.
 *
 * These are NOT taken from Intl.DateTimeFormat, and that is deliberate.
 *
 * The results grid renders dates in a monospaced column with tabular figures,
 * and the alignment of that column across every card is the point of the whole
 * treatment. It therefore depends on every month abbreviating to exactly the
 * same width — which is a hard requirement of the design, not a preference.
 *
 * Intl does not guarantee that. Current CLDR data abbreviates September as
 * 'Sept' in English locales — four characters, where every other month is
 * three — and the abbreviations vary by locale, by ICU version and by Node
 * build. A layout constraint cannot be delegated to a library that does not
 * promise to honour it.
 *
 * Owning the table costs one line and makes the output deterministic.
 */
const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * Formats a numeric price as currency with no decimal places.
 * 750000 -> "LKR 750,000"
 *
 * Note: Intl separates the currency code from the number with a NON-BREAKING
 * space (U+00A0), not an ordinary space, so that a price never wraps across a
 * line break. Any test asserting on this output must account for that.
 *
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return '—';

  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats an ISO date string into a fixed-width uppercase form suited to the
 * monospaced spec-sheet treatment.
 * "2025-09-12" -> "12 SEP 2025"
 *
 * The UTC getters are required. The dataset stores calendar dates, not
 * instants: new Date("2025-09-12") parses as UTC midnight, so reading it with
 * the local getters would render as the 11th for any viewer behind UTC.
 *
 * @param {string} isoDate - e.g. "2025-09-12"
 * @returns {string} e.g. "12 SEP 2025", always 11 characters
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
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

/**
 * Formats a price in compact form for the market summary.
 * 285000 -> "285K" ; 1250000 -> "1.25M"
 *
 * Hand-rolled rather than using Intl's `notation: 'compact'`, for the same
 * reason formatDate owns its month table: Intl's compact notation rounds
 * aggressively and inconsistently across ICU builds — 1250000 renders as "1.3M"
 * in some, "1.25M" in others. The hero's price range is a factual statement
 * about the dataset, so it should not silently change value depending on which
 * Node built the bundle.
 *
 * @param {number} price
 * @returns {string} e.g. "285K", "1.25M"
 */
export function formatPriceCompact(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return '—';

  if (price >= 1_000_000) {
    // Two decimal places, trailing zeros stripped: 1.25M, not 1.25M / 1.00M
    const millions = (price / 1_000_000).toFixed(2).replace(/\.?0+$/, '');
    return `${millions}M`;
  }

  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}K`;
  }

  return String(price);
}