import {
  formatPrice,
  formatPriceCompact,
  formatDate,
  formatBedrooms,
} from '../src/utils/format.js';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats a price with thousands separators and no decimal places', () => {
      // Assert the SHAPE, not the currency symbol. The locale and currency are
      // configurable constants in format.js, so pinning the symbol here would
      // make this test fail on a market change rather than on a formatting bug.
      const result = formatPrice(750000);
      expect(result).toMatch(/750,000/);
      expect(result).not.toMatch(/\.00/);
    });

    it('separates the currency code with a non-breaking space', () => {
      // Intl does this deliberately, so a price never wraps across a line
      // break. Documenting it here explains why the component tests match the
      // price on a regex rather than an exact string: the DOM contains U+00A0,
      // which renders identically to a space but is not equal to one.
      expect(formatPrice(750000)).toMatch(/\u00A0/);
    });

    it('returns a dash for a missing or non-numeric price', () => {
      expect(formatPrice(undefined)).toBe('—');
      expect(formatPrice(null)).toBe('—');
      expect(formatPrice(NaN)).toBe('—');
      expect(formatPrice('750000')).toBe('—');
    });
  });

  describe('formatDate', () => {
    it('formats an ISO date as day, abbreviated month, year in uppercase', () => {
      expect(formatDate('2025-09-12')).toBe('12 SEP 2025');
    });

    it('zero-pads single-digit days so the column stays aligned', () => {
      expect(formatDate('2025-03-05')).toBe('05 MAR 2025');
    });

    /**
     * This is the test that matters.
     *
     * The results grid renders dates in a monospaced column, and the alignment
     * across every card depends on every date being the same width. Intl does
     * not guarantee that — current CLDR abbreviates September as 'Sept' in
     * English locales, four characters where every other month is three — which
     * is why formatDate owns its own month table rather than delegating to
     * Intl.DateTimeFormat.
     *
     * This test is the guard on that guarantee.
     */
    it('renders every month at exactly the same width', () => {
      const oneOfEachMonth = [
        '2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15',
        '2025-05-15', '2025-06-15', '2025-07-15', '2025-08-15',
        '2025-09-15', '2025-10-15', '2025-11-15', '2025-12-15',
      ];

      oneOfEachMonth.forEach((iso) => {
        const formatted = formatDate(iso);
        const [, month] = formatted.split(' ');

        expect(month).toHaveLength(3);
        // '12 SEP 2025' — every date is exactly eleven characters.
        expect(formatted).toHaveLength(11);
      });
    });

    it('renders September as SEP, not SEPT', () => {
      // A regression test with a name. Intl would produce 'SEPT' here.
      expect(formatDate('2025-09-01')).toBe('01 SEP 2025');
    });

    it('does not drift by a day across timezones', () => {
      // The dataset stores calendar dates, not instants. The 1st must never
      // render as the 31st of the previous month, whatever timezone the
      // viewer is in — which is why the UTC getters are used.
      expect(formatDate('2025-01-01')).toBe('01 JAN 2025');
      expect(formatDate('2024-12-31')).toBe('31 DEC 2024');
    });

    it('returns a dash for a missing or invalid date', () => {
      expect(formatDate('')).toBe('—');
      expect(formatDate(undefined)).toBe('—');
      expect(formatDate('not-a-date')).toBe('—');
    });
  });

  describe('formatBedrooms', () => {
    it('uses the singular for one bedroom', () => {
      expect(formatBedrooms(1)).toBe('1 bedroom');
    });

    it('uses the plural for more than one bedroom', () => {
      expect(formatBedrooms(3)).toBe('3 bedrooms');
      expect(formatBedrooms(5)).toBe('5 bedrooms');
    });

    it('returns a dash for a missing or non-numeric count', () => {
      expect(formatBedrooms(undefined)).toBe('—');
      expect(formatBedrooms(NaN)).toBe('—');
    });
  });

  describe('formatPriceCompact', () => {
    it('abbreviates thousands', () => {
      expect(formatPriceCompact(285000)).toBe('285K');
      expect(formatPriceCompact(750000)).toBe('750K');
    });

    it('abbreviates millions to two decimal places', () => {
      expect(formatPriceCompact(1250000)).toBe('1.25M');
    });

    it('strips trailing zeros rather than padding them', () => {
      // "1M", not "1.00M" — the hero strip is tight and the zeros carry
      // no information.
      expect(formatPriceCompact(1000000)).toBe('1M');
      expect(formatPriceCompact(1500000)).toBe('1.5M');
    });

    it('returns a dash for a missing or non-numeric price', () => {
      expect(formatPriceCompact(undefined)).toBe('—');
      expect(formatPriceCompact(NaN)).toBe('—');
    });
  });
});