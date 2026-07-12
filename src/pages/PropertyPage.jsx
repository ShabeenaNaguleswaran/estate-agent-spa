import { useParams, Link } from 'react-router-dom';

import properties from '../data/properties.json';
import FavouriteButton from '../components/favourites/FavouriteButton.jsx';
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

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return <NotFound />;
  }

  return (
    <div className="container page">
      <Link to="/" className="page__back">← Back to search</Link>

      <header className="page__header page__header--property">
        <div>
          <p className="label">{property.type} · {property.postcode}</p>
          <h1 className="page__title">{property.location}</h1>
          <p className="page__price data">{formatPrice(property.price)}</p>
          <p className="page__meta">
            {formatBedrooms(property.bedrooms)} · {property.tenure} · Added{' '}
            <span className="data">{formatDate(property.dateAdded)}</span>
          </p>
        </div>

        {/*
          The same FavouriteButton component as the result cards, in its large
          variant. One implementation, two mount points — so there is exactly
          one code path by which a property can be added to the shortlist.
        */}
        <FavouriteButton
          propertyId={property.id}
          label={property.location}
          size="lg"
        />
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