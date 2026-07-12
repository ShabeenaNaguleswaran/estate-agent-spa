import { useState } from 'react';

import properties from '../data/properties.json';
import { filterProperties } from '../utils/filterProperties.js';
import SearchForm from '../components/search/SearchForm.jsx';
import ResultsList from '../components/results/ResultsList.jsx';
import FavouritesRail from '../components/favourites/FavouritesRail.jsx';
import './pages.css';

/**
 * Search page.
 *
 * Owns the search criteria and runs the pure filterProperties() function
 * against the dataset. Below the form, the results grid and the shortlist
 * rail sit side by side; the rail is the "display your favourite property
 * list on the search page" requirement.
 */
function SearchPage() {
  const [criteria, setCriteria] = useState(null);

  const results = criteria ? filterProperties(properties, criteria) : properties;
  const hasSearched = criteria !== null;

  return (
    <div className="container page">
      <header className="page__header">
        <p className="label">{properties.length} properties on the market</p>
        <h1 className="page__title">Find your next home</h1>
      </header>

      <SearchForm onSearch={setCriteria} onReset={() => setCriteria(null)} />

      <div className="search-layout">
        <div className="search-layout__results">
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

          <ResultsList properties={results} hasSearched={hasSearched} />
        </div>

        <FavouritesRail />
      </div>
    </div>
  );
}

export default SearchPage;