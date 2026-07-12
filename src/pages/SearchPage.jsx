import properties from '../data/properties.json';
import { formatPrice, formatDate } from '../utils/format.js';
import './pages.css';

/**
 * Search page.
 * Currently renders the unfiltered property list — the search form
 * (Commit 8), results grid (Commit 9) and favourites rail (Commit 13)
 * are layered on top of this shell.
 */
function SearchPage() {
  return (
    <div className="container page">
      <p className="label">7 properties on the market</p>
      <h1 className="page__title">Find your next home</h1>

      <ul className="page__stub-list">
        {properties.map((property) => (
          <li key={property.id} className="page__stub">
            <span className="page__stub-loc">{property.location}</span>
            <span className="data">{formatPrice(property.price)}</span>
            <span className="data">{property.bedrooms} BED</span>
            <span className="data">{property.postcodeArea}</span>
            <span className="data">{formatDate(property.dateAdded)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchPage;