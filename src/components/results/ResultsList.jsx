import PropertyCard from './PropertyCard.jsx';
import './ResultsList.css';

/**
 * The results grid.
 *
 * Owns the grid layout and the empty state; delegates each result to a
 * PropertyCard. Kept as a separate component from SearchPage so that the
 * page is responsible for *what* to show and this is responsible for *how*.
 *
 * @param {Object} props
 * @param {Array<Object>} props.properties - the filtered results
 * @param {boolean}       props.hasSearched - whether a search has been run,
 *   so the empty state can give the right advice
 */
function ResultsList({ properties, hasSearched }) {
  if (properties.length === 0) {
    return (
      // An empty screen is an invitation to act, not an apology.
      <div className="results__empty">
        <p className="results__empty-title">No properties match those criteria</p>
        <p className="results__empty-body">
          {hasSearched
            ? 'Try widening your price range, or clearing the postcode area.'
            : 'There are no properties listed at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="results" aria-label="Search results">
      {properties.map((property) => (
        <li key={property.id} className="results__item">
          <PropertyCard property={property} />
        </li>
      ))}
    </ul>
  );
}

export default ResultsList;