import { Link } from 'react-router-dom';

import FavouriteButton from '../favourites/FavouriteButton.jsx';
import { assetUrl } from '../../utils/assets.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import './PropertyCard.css';

/**
 * A single property in the results grid.
 *
 * Contains the three elements the specification requires — picture, short
 * description and price — plus a monospaced spec strip of bedrooms, tenure
 * and date added, using tabular figures so values align vertically across
 * every card in the grid.
 *
 * @param {Object} props
 * @param {Object} props.property - a property from properties.json
 */
function PropertyCard({ property }) {
  const {
    id,
    type,
    price,
    bedrooms,
    tenure,
    dateAdded,
    postcodeArea,
    location,
    shortDescription,
    mainImage,
  } = property;

  return (
    <article className="card">
      <Link
        to={`/property/${id}`}
        className="card__link"
        aria-label={`${type} at ${location}, ${formatPrice(price)}`}
      >
        <div className="card__media">
          <img
            className="card__image"
            src={assetUrl(mainImage)}
            alt={`${type} at ${location}`}
            loading="lazy"
            width="800"
            height="600"
          />
        </div>

        <div className="card__body">
          <p className="card__eyebrow data">
            {type} · {postcodeArea}
          </p>

          <h2 className="card__title">{location}</h2>

          <p className="card__price data">{formatPrice(price)}</p>

          <p className="card__description">{shortDescription}</p>
        </div>

        <dl className="card__spec">
          <div className="card__spec-item">
            <dt className="sr-only">Bedrooms</dt>
            <dd className="data">{bedrooms} BED</dd>
          </div>
          <div className="card__spec-item">
            <dt className="sr-only">Tenure</dt>
            <dd className="data">{tenure.toUpperCase()}</dd>
          </div>
          <div className="card__spec-item">
            <dt className="sr-only">Date added</dt>
            <dd className="data">{formatDate(dateAdded)}</dd>
          </div>
        </dl>
      </Link>

      {/*
        Sits OUTSIDE the <Link>. A <button> nested inside an <a> is invalid
        markup, and clicking the heart would also fire navigation to the
        property page. It is absolutely positioned over the image instead.
      */}
      <div className="card__favourite">
        <FavouriteButton propertyId={id} label={location} size="sm" />
      </div>
    </article>
  );
}

export default PropertyCard;