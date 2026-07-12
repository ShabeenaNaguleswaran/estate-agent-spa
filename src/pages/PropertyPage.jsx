import { useParams, Link } from 'react-router-dom';

import properties from '../data/properties.json';
import FavouriteButton from '../components/favourites/FavouriteButton.jsx';
import ImageGallery from '../components/property/ImageGallery.jsx';
import PropertyTabs from '../components/property/PropertyTabs.jsx';
import { formatPrice, formatDate, formatBedrooms } from '../utils/format.js';
import NotFound from './NotFound.jsx';
import './pages.css';

/**
 * Individual property page.
 * Header, gallery, and the three required tab panels: long description,
 * floor plan and Google Map.
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

        <FavouriteButton
          propertyId={property.id}
          label={property.location}
          size="lg"
        />
      </header>

      <ImageGallery
        images={property.images}
        alt={`${property.type} at ${property.location}`}
      />

      <PropertyTabs property={property} />
    </div>
  );
}

export default PropertyPage;