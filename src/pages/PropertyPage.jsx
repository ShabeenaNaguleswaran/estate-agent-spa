import { useParams, Link } from 'react-router-dom';

import properties from '../data/properties.json';
import { formatPrice, formatDate, formatBedrooms } from '../utils/format.js';
import { assetUrl } from '../utils/assets.js';
import NotFound from './NotFound.jsx';
import './pages.css';

/**
 * Individual property page.
 * The gallery (Commit 14) and react-tabs panel (Commit 15) replace the
 * placeholder blocks below.
 */
function PropertyPage() {
  const { id } = useParams();

  // Look up the property by the :id route param. If someone hand-edits the
  // URL to a non-existent id, fall through to the 404 view rather than
  // crashing on `property.price` of undefined.
  const property = properties.find((p) => p.id === id);

  if (!property) {
    return <NotFound />;
  }

  return (
    <div className="container page">
      <Link to="/" className="page__back">← Back to search</Link>

      <header className="page__header">
        <p className="label">{property.type} · {property.postcode}</p>
        <h1 className="page__title">{property.location}</h1>
        <p className="page__price data">{formatPrice(property.price)}</p>
        <p className="page__meta">
          {formatBedrooms(property.bedrooms)} · {property.tenure} · Added{' '}
          <span className="data">{formatDate(property.dateAdded)}</span>
        </p>
      </header>

      {/* Gallery placeholder — replaced in Commit 14 */}
      <img
        className="page__hero"
        src={assetUrl(property.mainImage)}
        alt={`${property.type} at ${property.location}`}
      />

      {/* Tabs placeholder — replaced in Commit 15 */}
      <p className="page__body">{property.shortDescription}</p>
    </div>
  );
}

export default PropertyPage;