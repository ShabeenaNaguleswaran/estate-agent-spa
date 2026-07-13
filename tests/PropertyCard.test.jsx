import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PropertyCard from '../src/components/results/PropertyCard.jsx';
import { renderWithProviders } from './helpers/renderWithProviders.jsx';

/** A single property. Local to this file — the card only ever renders one. */
const property = {
  id: 'prop1',
  type: 'House',
  bedrooms: 3,
  price: 750000,
  tenure: 'Freehold',
  dateAdded: '2025-09-12',
  postcodeArea: 'BR1',
  postcode: 'BR1 3PL',
  location: 'Widmore Road, Bromley',
  shortDescription: 'A bright three-bedroom semi-detached house.',
  mainImage: 'images/properties/prop1/01.jpg',
};

describe('PropertyCard', () => {
  /* localStorage persists between tests in jsdom, so a favourite added in one
     test would leak into the next and quietly invalidate it. */
  beforeEach(() => {
    window.localStorage.clear();
  });

  /**
   * TEST 1 — The card renders what the specification requires.
   * The brief names three elements explicitly: picture, short description,
   * and price.
   *
   * Note on matching: every assertion against formatted output uses a regex on
   * the significant part rather than an exact string. Intl.NumberFormat and
   * Intl.DateTimeFormat insert NON-BREAKING spaces (U+00A0) into their output,
   * which render identically to ordinary spaces but are not equal to them, and
   * which Testing Library's default normaliser does not convert. An exact match
   * therefore fails for a reason that has nothing to do with the component. The
   * formatters' exact output is asserted in format.test.js, where it belongs.
   */
  describe('content', () => {
    it('renders the three elements the specification requires', () => {
      renderWithProviders(<PropertyCard property={property} />);

      // Picture — found by its alt text, which is how a screen reader would
      // find it. Querying by alt rather than by role asserts the alt text is
      // actually meaningful, not merely present.
      expect(
        screen.getByAltText('House at Widmore Road, Bromley')
      ).toBeInTheDocument();

      // Short description
      expect(
        screen.getByText('A bright three-bedroom semi-detached house.')
      ).toBeInTheDocument();

      // Price — the thousands separators prove the card renders the FORMATTED
      // price rather than the raw number 750000, which is what is being tested.
      expect(screen.getByText(/750,000/)).toBeInTheDocument();
    });

    it('renders the spec strip with formatted values', () => {
      renderWithProviders(<PropertyCard property={property} />);

      // `{bedrooms} BED` renders as two adjacent text nodes, so match across
      // the whitespace rather than requiring a single node.
      expect(screen.getByText(/3\s+BED/)).toBeInTheDocument();
      expect(screen.getByText('FREEHOLD')).toBeInTheDocument();
      expect(screen.getByText(/12 SEP 2025/)).toBeInTheDocument();
    });

    it('links to the correct property page', () => {
      renderWithProviders(<PropertyCard property={property} />);

      const link = screen.getByRole('link', {
        name: /House at Widmore Road, Bromley, .*750,000/,
      });
      expect(link).toHaveAttribute('href', '/property/prop1');
    });
  });

  /**
   * TEST 2 — Favouriting, through the UI.
   * The reducer tests prove the logic. These prove the BUTTON is wired to it.
   * A correct reducer behind a broken button scores nothing.
   */
  describe('favouriting', () => {
    it('starts with the property not on the shortlist', () => {
      renderWithProviders(<PropertyCard property={property} />);

      const button = screen.getByRole('button', {
        name: /Add Widmore Road, Bromley to your shortlist/,
      });
      // aria-pressed IS the state, so assert on the state, not on a class name.
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('adds the property to the shortlist when the button is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertyCard property={property} />);

      await user.click(
        screen.getByRole('button', { name: /Add Widmore Road, Bromley/ })
      );

      // The accessible name flips from "Add ... to" to "Remove ... from".
      // Finding the button by its NEW name IS the assertion: if the state did
      // not change, this query finds nothing and the test fails.
      const button = screen.getByRole('button', {
        name: /Remove Widmore Road, Bromley from your shortlist/,
      });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('removes the property when the button is pressed again', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertyCard property={property} />);

      await user.click(screen.getByRole('button', { name: /Add Widmore Road/ }));
      await user.click(screen.getByRole('button', { name: /Remove Widmore Road/ }));

      expect(
        screen.getByRole('button', { name: /Add Widmore Road/ })
      ).toHaveAttribute('aria-pressed', 'false');
    });

    /**
     * The duplicate-prevention test, asserted through the interface.
     *
     * The reducer test proves ADD rejects a duplicate. This proves the user
     * cannot reach a state where the same property appears twice, by driving
     * the actual button a marker would click at the viva.
     */
    it('cannot add the same property twice via the button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertyCard property={property} />);

      await user.click(screen.getByRole('button', { name: /Add Widmore Road/ }));

      // The button is now a REMOVE control. There is no longer any "add"
      // affordance in the DOM — which is the point: the interface makes a
      // second add unreachable, and the reducer would reject it regardless.
      expect(
        screen.queryByRole('button', { name: /Add Widmore Road/ })
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /Remove Widmore Road/ })
      ).toBeInTheDocument();
    });

    it('persists the shortlist to localStorage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PropertyCard property={property} />);

      await user.click(screen.getByRole('button', { name: /Add Widmore Road/ }));

      const stored = JSON.parse(
        window.localStorage.getItem('meridian:favourites')
      );
      expect(stored).toEqual(['prop1']);
    });
  });

  /**
   * TEST 3 — Drag and drop.
   * jsdom does not perform a real drag, but the card's drag CONTRACT — what it
   * declares draggable, and what it does not — is static markup and is exactly
   * where the common bugs live.
   */
  describe('drag and drop', () => {
    it('is draggable', () => {
      renderWithProviders(<PropertyCard property={property} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('marks the anchor and image as not draggable', () => {
      renderWithProviders(<PropertyCard property={property} />);

      // Anchors and images are natively draggable. If they are not disabled,
      // grabbing a card drags its href or its image file instead of the
      // property payload, and the shortlist rail receives nothing it can use.
      expect(
        screen.getByRole('link', { name: /Widmore Road/ })
      ).toHaveAttribute('draggable', 'false');

      expect(
        screen.getByAltText('House at Widmore Road, Bromley')
      ).toHaveAttribute('draggable', 'false');
    });
  });
});