import { useState } from 'react';

// react-widgets v5 uses per-component imports so unused widgets are tree-shaken.
import DropdownList from 'react-widgets/DropdownList';
import NumberPicker from 'react-widgets/NumberPicker';
import DatePicker from 'react-widgets/DatePicker';
import Combobox from 'react-widgets/Combobox';

import {
  PROPERTY_TYPES,
  POSTCODE_AREAS,
  BEDROOM_MIN,
  BEDROOM_MAX,
  PRICE_STEP,
  EMPTY_CRITERIA,
} from './searchOptions.js';
import { formatPrice } from '../../utils/format.js';
import './SearchForm.css';

/**
 * Property search form.
 *
 * Every one of the eight inputs is an enhanced react-widgets component —
 * there is no raw <input> or <select> in this form. Widget choice is
 * deliberate per field: a fixed option set gets a DropdownList, numeric
 * ranges get NumberPickers with step increments, dates get a calendar
 * DatePicker rather than a free-text field, and the postcode area gets a
 * Combobox so the user can pick a known area OR type one we don't hold.
 *
 * The form is controlled: `criteria` is the single source of truth and is
 * lifted to SearchPage, which passes it to the pure filterProperties()
 * function. The form itself performs no filtering.
 *
 * @param {Object}   props
 * @param {Function} props.onSearch - called with the criteria object
 * @param {Function} props.onReset  - called when the user clears the form
 */
function SearchForm({ onSearch, onReset }) {
  const [criteria, setCriteria] = useState(EMPTY_CRITERIA);

  /**
   * Updates a single field. Widgets emit the value directly (not an event),
   * so there is no e.target.value here.
   */
  const update = (field, value) => {
    setCriteria((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Inverted ranges are a user error, not a crash. Rather than silently
   * returning zero results and leaving the user confused, we surface it.
   */
  const priceInverted =
    criteria.minPrice != null &&
    criteria.maxPrice != null &&
    criteria.minPrice > criteria.maxPrice;

  const bedroomsInverted =
    criteria.minBedrooms != null &&
    criteria.maxBedrooms != null &&
    criteria.minBedrooms > criteria.maxBedrooms;

  const datesInverted =
    criteria.dateFrom != null &&
    criteria.dateTo != null &&
    criteria.dateFrom > criteria.dateTo;

  const hasErrors = priceInverted || bedroomsInverted || datesInverted;

  const handleSubmit = (event) => {
    // The form is a real <form>, so Enter submits it. Prevent the default
    // page reload — this is a single-page application.
    event.preventDefault();
    if (hasErrors) return;
    onSearch(criteria);
  };

  const handleReset = () => {
    setCriteria(EMPTY_CRITERIA);
    onReset();
  };

  return (
    <form className="search" onSubmit={handleSubmit} noValidate>
      <div className="search__grid">
        {/* -- Property type ------------------------------------------- */}
        <fieldset className="search__group">
          <legend className="label">Property</legend>

          <div className="search__field">
            <label className="search__label" id="type-label">Type</label>
            <DropdownList
              aria-labelledby="type-label"
              data={PROPERTY_TYPES}
              value={criteria.type}
              onChange={(value) => update('type', value)}
            />
          </div>
        </fieldset>

        {/* -- Price --------------------------------------------------- */}
        <fieldset className="search__group">
          <legend className="label">Price</legend>

          <div className="search__pair">
            <div className="search__field">
              <label className="search__label" id="min-price-label">Minimum</label>
              <NumberPicker
                aria-labelledby="min-price-label"
                value={criteria.minPrice}
                onChange={(value) => update('minPrice', value)}
                min={0}
                step={PRICE_STEP}
                placeholder="No minimum"
                format={(value) => (value == null ? '' : formatPrice(value))}
              />
            </div>

            <div className="search__field">
              <label className="search__label" id="max-price-label">Maximum</label>
              <NumberPicker
                aria-labelledby="max-price-label"
                value={criteria.maxPrice}
                onChange={(value) => update('maxPrice', value)}
                min={0}
                step={PRICE_STEP}
                placeholder="No maximum"
                format={(value) => (value == null ? '' : formatPrice(value))}
              />
            </div>
          </div>

          {priceInverted && (
            <p className="search__error" role="alert">
              Minimum price is above the maximum. Swap them to see results.
            </p>
          )}
        </fieldset>

        {/* -- Bedrooms ------------------------------------------------ */}
        <fieldset className="search__group">
          <legend className="label">Bedrooms</legend>

          <div className="search__pair">
            <div className="search__field">
              <label className="search__label" id="min-beds-label">Minimum</label>
              <NumberPicker
                aria-labelledby="min-beds-label"
                value={criteria.minBedrooms}
                onChange={(value) => update('minBedrooms', value)}
                min={BEDROOM_MIN}
                max={BEDROOM_MAX}
                placeholder="Any"
              />
            </div>

            <div className="search__field">
              <label className="search__label" id="max-beds-label">Maximum</label>
              <NumberPicker
                aria-labelledby="max-beds-label"
                value={criteria.maxBedrooms}
                onChange={(value) => update('maxBedrooms', value)}
                min={BEDROOM_MIN}
                max={BEDROOM_MAX}
                placeholder="Any"
              />
            </div>
          </div>

          {bedroomsInverted && (
            <p className="search__error" role="alert">
              Minimum bedrooms is above the maximum.
            </p>
          )}
        </fieldset>

        {/* -- Date added ---------------------------------------------- */}
        <fieldset className="search__group">
          <legend className="label">Date added</legend>

          <div className="search__pair">
            <div className="search__field">
              <label className="search__label" id="date-from-label">From</label>
              <DatePicker
                aria-labelledby="date-from-label"
                value={criteria.dateFrom}
                onChange={(value) => update('dateFrom', value)}
                placeholder="Any date"
                max={new Date()}
              />
            </div>

            <div className="search__field">
              <label className="search__label" id="date-to-label">To</label>
              <DatePicker
                aria-labelledby="date-to-label"
                value={criteria.dateTo}
                onChange={(value) => update('dateTo', value)}
                placeholder="Any date"
                max={new Date()}
              />
            </div>
          </div>

          {datesInverted && (
            <p className="search__error" role="alert">
              The from date is after the to date.
            </p>
          )}

          <p className="search__hint">
            Leave <em>To</em> blank to search everything added after a date.
          </p>
        </fieldset>

        {/* -- Location ------------------------------------------------ */}
        <fieldset className="search__group">
          <legend className="label">Location</legend>

          <div className="search__field">
            <label className="search__label" id="postcode-label">Postcode area</label>
            {/*
              Combobox, not DropdownList: the user should be able to type an
              area we do not currently hold (which correctly returns nothing)
              as well as pick from the areas that exist in the dataset.
            */}
            <Combobox
              aria-labelledby="postcode-label"
              data={POSTCODE_AREAS}
              value={criteria.postcodeArea}
              onChange={(value) => update('postcodeArea', value)}
              placeholder="e.g. BR1"
              hideEmptyPopup
            />
          </div>
        </fieldset>
      </div>

      {/* -- Actions --------------------------------------------------- */}
      <div className="search__actions">
        <button type="submit" className="search__submit" disabled={hasErrors}>
          Search properties
        </button>
        <button type="button" className="search__reset" onClick={handleReset}>
          Clear all
        </button>
      </div>
    </form>
  );
}

export default SearchForm;