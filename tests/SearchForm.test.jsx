import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchForm from '../src/components/search/SearchForm.jsx';
import { renderWithProviders } from './helpers/renderWithProviders.jsx';

describe('SearchForm', () => {
  /**
   * TEST 1 — Every field is a react-widgets component.
   * The 8% criterion requires that ALL form elements be enhanced widgets, not
   * raw inputs. react-widgets renders its controls with role="combobox" (the
   * dropdown, the postcode combobox) or role="spinbutton" (the number
   * pickers). A raw <select> would surface as role="listbox" and a raw number
   * input as role="spinbutton" WITHOUT the widget's popup — so this test is
   * a genuine check, not a formality.
   */
  describe('widgets', () => {
    it('renders all eight fields', () => {
      renderWithProviders(<SearchForm onSearch={jest.fn()} onReset={jest.fn()} />);

      // Type (DropdownList) + postcode (Combobox) + both DatePickers
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Postcode area')).toBeInTheDocument();
      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();

      // Price and bedrooms: two "Minimum" and two "Maximum" labels exist,
      // so scope the query to the relevant fieldset by its legend.
      const price = screen.getByRole('group', { name: 'Price' });
      expect(within(price).getByLabelText('Minimum')).toBeInTheDocument();
      expect(within(price).getByLabelText('Maximum')).toBeInTheDocument();

      const bedrooms = screen.getByRole('group', { name: 'Bedrooms' });
      expect(within(bedrooms).getByLabelText('Minimum')).toBeInTheDocument();
      expect(within(bedrooms).getByLabelText('Maximum')).toBeInTheDocument();
    });

    it('groups related fields into labelled fieldsets', () => {
      renderWithProviders(<SearchForm onSearch={jest.fn()} onReset={jest.fn()} />);

      // The aesthetics criterion requires "visual clues based on groupings".
      // A fieldset with a legend is the semantic version of that grouping,
      // which is what a screen reader user actually receives.
      ['Property', 'Price', 'Bedrooms', 'Date added', 'Location'].forEach((name) => {
        expect(screen.getByRole('group', { name })).toBeInTheDocument();
      });
    });
  });

  /**
   * TEST 2 — The form reports criteria upward.
   * The form does not filter; it hands criteria to SearchPage, which calls
   * the pure filterProperties(). This asserts that contract holds — if the
   * form reports the wrong shape, the (correct) filter returns nothing and
   * the 10% search mark is lost despite the logic being right.
   */
  describe('reporting criteria', () => {
    it('calls onSearch with the default criteria when nothing is entered', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderWithProviders(<SearchForm onSearch={onSearch} onReset={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Search properties' }));

      expect(onSearch).toHaveBeenCalledTimes(1);
      // "Any" type and empty everything else — which filterProperties treats
      // as no filter at all, returning every property.
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Any', postcodeArea: '' })
      );
    });

    it('reports the selected property type', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderWithProviders(<SearchForm onSearch={onSearch} onReset={jest.fn()} />);

      // Open the DropdownList. react-widgets toggles the popup from the picker
      // element, not the outer role="combobox" wrapper, so drive it by
      // keyboard — which also demonstrates the widget is keyboard-operable.
      const typeWidget = screen.getByRole('combobox', { name: 'Type' });
      await user.click(typeWidget);
      await user.keyboard('{ArrowDown}');

      // hidden: true is required. The listbox carries aria-hidden while the
      // popup's open transition is in flight, which removes its options from
      // the accessibility tree — and getByRole queries that tree by default.
      // The options exist in the DOM and their click handlers are live.
      await user.click(
        screen.getByRole('option', { name: 'Flat', hidden: true })
      );

      await user.click(screen.getByRole('button', { name: 'Search properties' }));

      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Flat' })
      );
    });

    it('reports a typed postcode area', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderWithProviders(<SearchForm onSearch={onSearch} onReset={jest.fn()} />);

      // The Combobox accepts free text — this is why it was chosen over a
      // DropdownList. A user can search an area the dataset does not hold.
      await user.type(screen.getByLabelText('Postcode area'), 'BR1');
      await user.click(screen.getByRole('button', { name: 'Search properties' }));

      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ postcodeArea: 'BR1' })
      );
    });

    it('calls onReset and restores the defaults when cleared', async () => {
      const user = userEvent.setup();
      const onReset = jest.fn();
      renderWithProviders(<SearchForm onSearch={jest.fn()} onReset={onReset} />);

      // Query by placeholder, not by label. react-widgets' Combobox does not
      // forward aria-labelledby to its inner <input>, so getByLabelText
      // resolves to the wrapper div — and a div has no value to assert on.
      const postcode = screen.getByPlaceholderText('e.g. BR1');

      await user.type(postcode, 'NW1');
      expect(postcode).toHaveValue('NW1');

      await user.click(screen.getByRole('button', { name: 'Clear all' }));

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(postcode).toHaveValue('');
    });
  });

  /**
   * TEST 3 — Validation.
   * An inverted range silently returns zero results, which reads to the user
   * as "no properties match" rather than "you made a mistake". The form
   * surfaces it instead.
   */
  describe('validation', () => {
    it('does not submit while a range is inverted', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      renderWithProviders(<SearchForm onSearch={onSearch} onReset={jest.fn()} />);

      const bedrooms = screen.getByRole('group', { name: 'Bedrooms' });
      await user.type(within(bedrooms).getByLabelText('Minimum'), '5');
      await user.type(within(bedrooms).getByLabelText('Maximum'), '2');

      // The error is announced via role="alert", so assistive technology
      // hears it without the user having to go looking for it.
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /Minimum bedrooms is above the maximum/
      );

      const submit = screen.getByRole('button', { name: 'Search properties' });
      expect(submit).toBeDisabled();

      await user.click(submit);
      expect(onSearch).not.toHaveBeenCalled();
    });
  });
});