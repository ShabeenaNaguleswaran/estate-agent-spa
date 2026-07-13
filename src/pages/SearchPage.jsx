import { useState } from 'react';

import properties from '../data/properties.json';
import { filterProperties } from '../utils/filterProperties.js';
import Hero from '../components/hero/Hero.jsx';
import SearchForm from '../components/search/SearchForm.jsx';
import ResultsList from '../components/results/ResultsList.jsx';
import FavouritesRail from '../components/favourites/FavouritesRail.jsx';
import './pages.css';

/**
 * Search page.
 *
 * Owns the search criteria and runs the pure filterProperties() function
 * against the dataset. SearchForm reports criteria upward; ResultsList renders
 * whatever it is given. Neither performs any filtering.
 */
function SearchPage() {
  // null = no search run yet; show the full listing.
  const [criteria, setCriteria] = useState(null);

  const results = criteria ? filterProperties(properties, criteria) : properties;
  const hasSearched = criteria !== null;

  return (
    <>
      {/* Full-bleed: the hero owns its own container and background. */}
      <Hero />

      <div className="container page">
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
    </>
  );
}

export default SearchPage;