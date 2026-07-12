import { useState } from 'react';

import properties from '../data/properties.json';
import { filterProperties } from '../utils/filterProperties.js';
import { formatPrice, formatDate } from '../utils/format.js';
import SearchForm from '../components/search/SearchForm.jsx';
import './pages.css';

/**
 * Search page.
 *
 * Owns the search criteria state and runs the pure filterProperties()
 * function against the dataset. The form is a controlled child that reports
 * criteria upward; it performs no filtering itself. Keeping the algorithm
 * out of the component is what allows it to be unit tested in isolation.
 *
 * The results grid replaces the stub list in the next commit, and the
 * favourites rail is added alongside it in Commit 13.
 */
function SearchPage() {
  // null = the user has not searched yet; show everything.
  const [criteria, setCriteria] = useState(null);

  const results = criteria
    ? filterProperties(properties, criteria)
    : properties;

  const hasSearched = criteria !== null;

  return (
    <div className="container page">
      <header className="page__header">
        <p className="label">{properties.length} properties on the market</p>
        <h1 className="page__title">Find your next home</h1>
      </header>

      <SearchForm
        onSearch={setCriteria}
        onReset={() => setCriteria(null)}
      />

      {/* Result count strip — mono, so it reads as a data readout */}
      <div className="results__count">
        <span className="data">
          {results.length} {results.length === 1 ? 'property' : 'properties'}
        </span>
        <span className="results__count-context">
          {hasSearched
            ? `matching your search of ${properties.length}`
            : 'currently listed'}
        </span>
      </div>

      {results.length === 0 ? (
        // Empty states are an invitation to act, not an apology.
        <div className="results__empty">
          <p className="results__empty-title">No properties match those criteria</p>
          <p className="page__body">
            Try widening your price range, or clearing the postcode area.
          </p>
        </div>
      ) : (
        // Stub list — replaced by the PropertyCard grid in Commit 9.
        <ul className="page__stub-list">
          {results.map((property) => (
            <li key={property.id} className="page__stub">
              <span className="page__stub-loc">{property.location}</span>
              <span className="data">{formatPrice(property.price)}</span>
              <span className="data">{property.bedrooms} BED</span>
              <span className="data">{property.postcodeArea}</span>
              <span className="data">{formatDate(property.dateAdded)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchPage;