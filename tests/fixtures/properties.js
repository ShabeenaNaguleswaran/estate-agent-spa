/**
 * Test fixture for filterProperties.
 *
 * Deliberately NOT the real properties.json. The unit under test is the
 * filter algorithm, not the seed data — coupling the two would mean every
 * edit to a listing breaks unrelated tests.
 *
 * Each property here exists to exercise a specific edge case; see the
 * comment above each one.
 */
export const testProperties = [
  {
    // Baseline house. Sits inside every "typical" range.
    id: 'p1',
    type: 'House',
    bedrooms: 3,
    price: 500000,
    dateAdded: '2025-06-15',
    postcodeArea: 'BR1',
  },
  {
    // Same postcode area as p1 — proves an area search can return >1 result.
    id: 'p2',
    type: 'Flat',
    bedrooms: 2,
    price: 300000,
    dateAdded: '2025-01-10',
    postcodeArea: 'BR1',
  },
  {
    // Upper bound: highest price and most bedrooms in the fixture.
    id: 'p3',
    type: 'House',
    bedrooms: 5,
    price: 900000,
    dateAdded: '2025-09-01',
    postcodeArea: 'NW1',
  },
  {
    // Lower bound: cheapest, fewest bedrooms, earliest date.
    id: 'p4',
    type: 'Flat',
    bedrooms: 1,
    price: 200000,
    dateAdded: '2024-12-01',
    postcodeArea: 'NW1',
  },
  {
    // BR10 is a DIFFERENT area to BR1. Exists purely to catch a substring
    // match bug: `'BR10'.includes('BR1')` is true, but these are not the
    // same postcode area.
    id: 'p5',
    type: 'House',
    bedrooms: 4,
    price: 650000,
    dateAdded: '2025-03-20',
    postcodeArea: 'BR10',
  },
  {
    // Boundary date. Used to assert that date range bounds are INCLUSIVE.
    id: 'p6',
    type: 'Flat',
    bedrooms: 2,
    price: 450000,
    dateAdded: '2025-06-01',
    postcodeArea: 'E14',
  },
];

/**
 * Helper: reduces a result array to its ids, so assertions read as
 * expect(ids(result)).toEqual(['p1', 'p3']) rather than a wall of objects.
 *
 * @param {Array<Object>} results
 * @returns {Array<string>}
 */
export const ids = (results) => results.map((p) => p.id);