import properties from '../../data/properties.json';

/**
 * Option lists for the search form.
 * Derived from the dataset where possible, so adding a property to
 * properties.json automatically surfaces its postcode area as a suggestion
 * without touching this file.
 */

/** Property type options. "Any" is the default and acts as no filter. */
export const PROPERTY_TYPES = ['Any', 'House', 'Flat'];

/**
 * Unique postcode areas present in the dataset, alphabetically sorted.
 * Feeds the Combobox suggestion list — the user may still type an area
 * that does not exist, which correctly returns no results.
 */
export const POSTCODE_AREAS = [
  ...new Set(properties.map((p) => p.postcodeArea)),
].sort();

/** Bounds for the bedroom NumberPickers. */
export const BEDROOM_MIN = 1;
export const BEDROOM_MAX = 10;

/** Step increment for the price NumberPickers. */
export const PRICE_STEP = 25000;

/** The shape of an untouched search form. Also used by the Reset action. */
export const EMPTY_CRITERIA = {
  type: 'Any',
  minPrice: null,
  maxPrice: null,
  minBedrooms: null,
  maxBedrooms: null,
  dateFrom: null,
  dateTo: null,
  postcodeArea: '',
};