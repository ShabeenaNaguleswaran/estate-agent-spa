import { Link } from 'react-router-dom';

import { assetUrl } from '../../utils/assets.js';
import { formatPrice, formatDate } from '../../utils/format.js';
import './PropertyCard.css';

/**
 * A single property in the results grid.
 *
 * Contains the three elements the specification requires — picture, short
 * description and price — plus a monospaced "spec strip" of bedrooms,
 * tenure and date added. The strip uses tabular figures so that values
 * align vertically across every card in the grid, which is what lets the
 * results read as a record of properties rather than a list of products.
 *
 * The favourite button is rendered here but is not yet wired up; the
 * favourites reducer and context arrive in Commits 10-12. It is built into
 * the card now because it is part of the card's layout, not an addition to it.
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
      {/* The whole card body is one link to the property page. A single large
          target is easier to hit than a small "view details" link, and it
          keeps the accessible name meaningful. */}
      <Link
        to={`/property/${id}`}
        className="card__link"
        aria-label={`${type} at ${location}, ${formatPrice(price)}`}
      >
        <div className="card__media">
          <img
            className="card__image"
            src={assetUrl(mainImage)}
            /* Alt text describes the property, not the file. A screen reader
               user hearing "image" learns nothing. */
            alt={`${type} at ${location}`}
            /* Below-the-fold cards should not block first paint */
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

        {/* The spec strip. Tabular mono, hairline-separated. */}
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
        Favourite button — sits OUTSIDE the <Link>. Nesting a button inside
        an anchor is invalid HTML and would mean clicking the heart also
        navigates to the property page. It is absolutely positioned over the
        image instead. Wired up in Commit 12.
      */}
      <button
        type="button"
        className="card__favourite"
        aria-label={`Add ${location} to shortlist`}
        aria-pressed={false}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 20.5 3.8 12.3a5 5 0 0 1 7.1-7.1l1.1 1.1 1.1-1.1a5 5 0 1 1 7.1 7.1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </article>
  );
}

export default PropertyCard;