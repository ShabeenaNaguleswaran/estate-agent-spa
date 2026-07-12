/**
 * Property search.
 *
 * Design: every search criterion is modelled as an independent predicate.
 * A property matches if it satisfies EVERY criterion the user has actually
 * supplied. A criterion left blank is not treated as a filter — it is
 * skipped entirely.
 *
 * This means searching with one criterion and searching with all five run
 * through exactly the same code path; the only difference is how many
 * predicates are active. There is no special-casing per combination, which
 * is what makes any of the 31 possible combinations of the five criteria
 * behave correctly.
 *
 * Pure: no React, no DOM, no side effects. Depends only on its arguments,
 * which is what allows it to be unit tested in isolation.
 */

/**
 * @typedef {Object} SearchCriteria
 * @property {string}      [type]        - "House" | "Flat" | "Any"
 * @property {number|null} [minPrice]
 * @property {number|null} [maxPrice]
 * @property {number|null} [minBedrooms]
 * @property {number|null} [maxBedrooms]
 * @property {Date|null}   [dateFrom]    - added on or after this date
 * @property {Date|null}   [dateTo]      - added on or before this date
 * @property {string}      [postcodeArea] - outward code, e.g. "BR1"
 */

/**
 * True when the criterion has not been supplied by the user.
 * Treats null, undefined and empty string as "not set". Note that 0 is a
 * legitimate value (e.g. a minimum price of 0), so it must NOT be treated
 * as absent — this is why a plain falsy check would be a bug here.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isUnset(value) {
  return value === null || value === undefined || value === '';
}

/**
 * Parses an ISO date string ("2025-09-12") to a UTC timestamp.
 * Comparing timestamps rather than Date objects avoids timezone drift:
 * the dataset stores calendar dates, not instants.
 *
 * @param {string} isoDate
 * @returns {number} milliseconds since epoch, or NaN if unparseable
 */
function toTimestamp(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).getTime();
}

/**
 * Normalises a Date from the date picker to a UTC timestamp at midnight,
 * so that a property added on the boundary date is included in the range.
 *
 * @param {Date} date
 * @param {'start'|'end'} edge
 * @returns {number}
 */
function boundaryTimestamp(date, edge) {
  const d = new Date(date);
  // Use the picker's LOCAL calendar date, then rebuild it as a UTC instant.
  // Without this, a user in UTC+5:30 picking "12 Sep" would generate an
  // instant that lands on 11 Sep UTC and silently exclude a valid property.
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  // The end of a day is the last millisecond of it.
  return edge === 'end' ? utc + 86_399_999 : utc;
}

/* ------------------------------------------------------------------ */
/* Predicates — one per search criterion                              */
/* ------------------------------------------------------------------ */

/** Property type. "Any" (or unset) matches everything. */
function matchesType(property, type) {
  if (isUnset(type) || type === 'Any') return true;
  return property.type.toLowerCase() === String(type).toLowerCase();
}

/** Price range. Either bound may be omitted independently. */
function matchesPrice(property, minPrice, maxPrice) {
  if (!isUnset(minPrice) && property.price < Number(minPrice)) return false;
  if (!isUnset(maxPrice) && property.price > Number(maxPrice)) return false;
  return true;
}

/** Bedroom range. Either bound may be omitted independently. */
function matchesBedrooms(property, minBedrooms, maxBedrooms) {
  if (!isUnset(minBedrooms) && property.bedrooms < Number(minBedrooms)) return false;
  if (!isUnset(maxBedrooms) && property.bedrooms > Number(maxBedrooms)) return false;
  return true;
}

/**
 * Date added. Satisfies both requirements in the brief:
 *   - "after a specified date"      -> supply dateFrom only
 *   - "between two given dates"     -> supply dateFrom and dateTo
 * Both bounds are inclusive.
 */
function matchesDate(property, dateFrom, dateTo) {
  const added = toTimestamp(property.dateAdded);
  if (Number.isNaN(added)) return false;

  if (!isUnset(dateFrom) && added < boundaryTimestamp(dateFrom, 'start')) return false;
  if (!isUnset(dateTo) && added > boundaryTimestamp(dateTo, 'end')) return false;
  return true;
}

/**
 * Postcode area — the outward code only, e.g. "BR1", "NW1".
 * Matched case-insensitively and trimmed, because users type "br1 " and
 * still expect a result. Exact match, not substring: "BR1" must not also
 * match "BR10", which is a different area.
 */
function matchesPostcodeArea(property, postcodeArea) {
  if (isUnset(postcodeArea)) return true;
  return (
    property.postcodeArea.trim().toLowerCase() ===
    String(postcodeArea).trim().toLowerCase()
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Filters properties against the supplied search criteria.
 *
 * Any criterion left blank is ignored, so this supports every combination
 * of one to five simultaneous criteria without branching per combination.
 * Passing an empty criteria object returns all properties.
 *
 * @param {Array<Object>} properties - the dataset
 * @param {SearchCriteria} [criteria] - user-supplied search values
 * @returns {Array<Object>} properties matching ALL supplied criteria
 */
export function filterProperties(properties, criteria = {}) {
  // Defensive: a malformed dataset should return nothing, not crash the page.
  if (!Array.isArray(properties)) return [];

  const {
    type,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    dateFrom,
    dateTo,
    postcodeArea,
  } = criteria;

  return properties.filter(
    (property) =>
      matchesType(property, type) &&
      matchesPrice(property, minPrice, maxPrice) &&
      matchesBedrooms(property, minBedrooms, maxBedrooms) &&
      matchesDate(property, dateFrom, dateTo) &&
      matchesPostcodeArea(property, postcodeArea)
  );
}

export default filterProperties;