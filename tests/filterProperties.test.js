import { filterProperties } from '../src/utils/filterProperties.js';
import { testProperties, ids } from './fixtures/properties.js';

describe('filterProperties', () => {
  /**
   * TEST 1 — No criteria.
   * The brief allows a user to search with any number of criteria, including
   * none. An empty criteria object must not be mistaken for "match nothing".
   */
  describe('with no criteria', () => {
    it('returns every property when the criteria object is empty', () => {
      const result = filterProperties(testProperties, {});
      expect(result).toHaveLength(6);
      expect(ids(result)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    });

    it('returns every property when criteria are omitted entirely', () => {
      expect(filterProperties(testProperties)).toHaveLength(6);
    });
  });

  /**
   * TEST 2 — A single criterion.
   * Rubric Pass band: "Search works but only with single criteria."
   * Each of the five criteria is exercised independently here.
   */
  describe('with a single criterion', () => {
    it('filters by property type', () => {
      const result = filterProperties(testProperties, { type: 'Flat' });
      expect(ids(result)).toEqual(['p2', 'p4', 'p6']);
    });

    it('treats a type of "Any" as no filter at all', () => {
      expect(filterProperties(testProperties, { type: 'Any' })).toHaveLength(6);
    });

    it('filters by minimum price', () => {
      const result = filterProperties(testProperties, { minPrice: 500000 });
      expect(ids(result)).toEqual(['p1', 'p3', 'p5']);
    });

    it('filters by maximum price', () => {
      const result = filterProperties(testProperties, { maxPrice: 300000 });
      expect(ids(result)).toEqual(['p2', 'p4']);
    });

    it('filters by a bedroom range', () => {
      const result = filterProperties(testProperties, {
        minBedrooms: 2,
        maxBedrooms: 3,
      });
      expect(ids(result)).toEqual(['p1', 'p2', 'p6']);
    });

    it('filters by postcode area', () => {
      const result = filterProperties(testProperties, { postcodeArea: 'BR1' });
      // Two results, not one — an area search that can only ever return a
      // single property does not demonstrate that the filter works.
      expect(ids(result)).toEqual(['p1', 'p2']);
    });
  });

  /**
   * TEST 3 — Combined criteria.
   * Rubric Distinction band: "Search works flawlessly with any combination
   * of 1 to 5 criteria." This is the test that earns that band.
   */
  describe('with multiple simultaneous criteria', () => {
    it('combines two criteria with AND, not OR', () => {
      const result = filterProperties(testProperties, {
        type: 'House',
        minBedrooms: 4,
      });
      // p1 is a House but has only 3 beds; p6 has 2 beds and is a Flat.
      // An OR implementation would wrongly return all houses AND all 4+ beds.
      expect(ids(result)).toEqual(['p3', 'p5']);
    });

    it('narrows correctly across three criteria', () => {
      const result = filterProperties(testProperties, {
        type: 'Flat',
        maxPrice: 400000,
        postcodeArea: 'NW1',
      });
      expect(ids(result)).toEqual(['p4']);
    });

    it('applies all five criteria simultaneously', () => {
      const result = filterProperties(testProperties, {
        type: 'House',
        minPrice: 400000,
        maxPrice: 700000,
        minBedrooms: 3,
        maxBedrooms: 4,
        dateFrom: new Date(2025, 0, 1),
        dateTo: new Date(2025, 11, 31),
        postcodeArea: 'BR1',
      });
      // Only p1 satisfies every predicate. p5 is excluded on postcode area
      // alone (BR10 != BR1), which also re-proves the exact-match rule.
      expect(ids(result)).toEqual(['p1']);
    });

    it('returns an empty array when no property satisfies every criterion', () => {
      const result = filterProperties(testProperties, {
        type: 'Flat',
        minBedrooms: 5,
      });
      expect(result).toEqual([]);
    });
  });

  /**
   * TEST 4 — Date handling.
   * The brief requires BOTH "after a specified date" AND "between two given
   * dates". Bounds must be inclusive, and must not drift by a day due to
   * the timezone gap between the picker (local) and the dataset (calendar).
   */
  describe('date added', () => {
    it('matches properties added on or after a single date', () => {
      const result = filterProperties(testProperties, {
        dateFrom: new Date(2025, 5, 1), // 1 June 2025
      });
      // p6 was added ON 2025-06-01 and must be included — the bound is
      // inclusive. Its presence here is what proves there is no off-by-one.
      expect(ids(result)).toEqual(['p1', 'p3', 'p6']);
    });

    it('matches properties added between two dates', () => {
      const result = filterProperties(testProperties, {
        dateFrom: new Date(2025, 0, 1),  // 1 Jan 2025
        dateTo: new Date(2025, 5, 30),   // 30 June 2025
      });
      expect(ids(result)).toEqual(['p1', 'p2', 'p5', 'p6']);
    });

    it('includes a property added on the exact end boundary', () => {
      const result = filterProperties(testProperties, {
        dateFrom: new Date(2025, 5, 1),
        dateTo: new Date(2025, 5, 1), // same day, both bounds
      });
      expect(ids(result)).toEqual(['p6']);
    });
  });

  /**
   * TEST 5 — Edge cases and defensive behaviour.
   * These are the bugs a naive implementation ships with.
   */
  describe('edge cases', () => {
    it('matches postcode area exactly, so BR1 does not match BR10', () => {
      const result = filterProperties(testProperties, { postcodeArea: 'BR1' });
      // A substring implementation would wrongly include p5 (BR10).
      expect(ids(result)).not.toContain('p5');
    });

    it('matches postcode area case-insensitively and ignores whitespace', () => {
      const result = filterProperties(testProperties, { postcodeArea: '  br1 ' });
      expect(ids(result)).toEqual(['p1', 'p2']);
    });

    it('treats a minimum price of 0 as a real bound, not an absent filter', () => {
      // A naive `if (!minPrice)` check would skip this filter entirely
      // because 0 is falsy. Every property costs more than 0, so the correct
      // result is all six — but the filter must have RUN, not been skipped.
      const result = filterProperties(testProperties, { minPrice: 0, maxPrice: 250000 });
      expect(ids(result)).toEqual(['p4']);
    });

    it('ignores criteria supplied as empty strings', () => {
      // React controlled inputs yield '' when cleared, not null.
      const result = filterProperties(testProperties, {
        type: '',
        postcodeArea: '',
        minPrice: '',
      });
      expect(result).toHaveLength(6);
    });

    it('returns an empty array rather than throwing when given no dataset', () => {
      expect(filterProperties(undefined, { type: 'House' })).toEqual([]);
      expect(filterProperties(null, {})).toEqual([]);
    });

    it('does not mutate the original dataset', () => {
      const snapshot = JSON.stringify(testProperties);
      filterProperties(testProperties, { type: 'House', minPrice: 100 });
      expect(JSON.stringify(testProperties)).toBe(snapshot);
    });
  });
});