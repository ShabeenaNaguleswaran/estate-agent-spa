import { useState } from 'react';
import { Link } from 'react-router-dom';

import FavouriteButton from '../favourites/FavouriteButton.jsx';
import { assetUrl } from '../../utils/assets.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import {
  DRAG_TYPE_PROPERTY,
  DRAG_SOURCE,
  encodeDragPayload,
} from '../../utils/dragTypes.js';
import './PropertyCard.css';

/**
 * A single property in the results grid.
 *
 * Draggable onto the shortlist rail — the second of the two required ways to
 * add a favourite. The card does not check whether the property is already
 * shortlisted before dragging; the reducer rejects the duplicate. Checking
 * here as well is exactly how two code paths drift apart.
 *
 * @param {Object} props
 * @param {Object} props.property - a property from properties.json
 */
function PropertyCard({ property }) {
  const {
    id, type, price, bedrooms, tenure,
    dateAdded, postcodeArea, location,
    shortDescription, mainImage,
  } = property;

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event) => {
    event.dataTransfer.setData(
      DRAG_TYPE_PROPERTY,
      encodeDragPayload(id, DRAG_SOURCE.RESULTS)
    );
    // 'copy': the card stays in the results after being added to the rail.
    event.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  /* dragend fires whether the drop succeeded or was cancelled, so the card's
     visual state is restored either way. Relying on drop alone would leave a
     card stuck at 40% opacity after an aborted drag. */
  const handleDragEnd = () => setIsDragging(false);

  return (
    <article
      className={`card ${isDragging ? 'card--dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      aria-roledescription="Draggable property"
    >
      <Link
        to={`/property/${id}`}
        className="card__link"
        aria-label={`${type} at ${location}, ${formatPrice(price)}`}
        /* Anchors are natively draggable and would hijack the gesture,
           dragging their href as a URL instead of our property payload. */
        draggable={false}
      >
        <div className="card__media">
          <img
            className="card__image"
            src={assetUrl(mainImage)}
            alt={`${type} at ${location}`}
            loading="lazy"
            width="800"
            height="600"
            /* Images are natively draggable too — same problem. */
            draggable={false}
          />
        </div>

        <div className="card__body">
          <p className="card__eyebrow data">{type} · {postcodeArea}</p>
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

      <div className="card__favourite">
        <FavouriteButton propertyId={id} label={location} size="sm" />
      </div>
    </article>
  );
}

export default PropertyCard;