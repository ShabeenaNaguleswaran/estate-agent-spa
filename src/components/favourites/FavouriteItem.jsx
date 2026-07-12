import { Link } from 'react-router-dom';

import { useFavourites } from '../../context/useFavourites.js';
import { assetUrl } from '../../utils/assets.js';
import { formatPrice } from '../../utils/format.js';
import {
  DRAG_TYPE_PROPERTY,
  DRAG_SOURCE,
  encodeDragPayload,
} from '../../utils/dragTypes.js';
import './FavouriteItem.css';

/**
 * A single row in the shortlist rail.
 *
 * Removable two ways, as the specification requires:
 *   1. the delete button
 *   2. dragging the row out of the rail and dropping it anywhere else
 *
 * Both call the same removeFavourite() action, so the two methods cannot
 * drift apart in behaviour.
 *
 * @param {Object} props
 * @param {Object} props.property - the full property, looked up by id
 */
function FavouriteItem({ property }) {
  const { removeFavourite } = useFavourites();

  const handleDragStart = (event) => {
    event.dataTransfer.setData(
      DRAG_TYPE_PROPERTY,
      // Tagged as coming FROM the rail, so the results grid knows this is a
      // removal and the rail knows not to treat it as a fresh add.
      encodeDragPayload(property.id, DRAG_SOURCE.RAIL)
    );
    // 'move' gives the correct cursor: the item is leaving the rail, not
    // being copied out of it.
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <li
      className="favitem"
      draggable
      onDragStart={handleDragStart}
      /* Tells assistive tech this row is draggable — the drag affordance is
         otherwise invisible to a screen reader. The delete button remains
         the accessible path; drag is an enhancement, never the only way. */
      aria-roledescription="Draggable shortlist item"
    >
      <Link to={`/property/${property.id}`} className="favitem__link">
        <img
          className="favitem__image"
          src={assetUrl(property.mainImage)}
          alt=""
          /* Decorative: the location text beside it already names the
             property, so announcing the image too would be redundant. */
          aria-hidden="true"
          loading="lazy"
        />

        <div className="favitem__body">
          <p className="favitem__title">{property.location}</p>
          <p className="favitem__price data">{formatPrice(property.price)}</p>
          <p className="favitem__spec data">
            {property.bedrooms} BED · {property.postcodeArea}
          </p>
        </div>
      </Link>

      {/* Removal method 2: the button. Outside the link — see PropertyCard. */}
      <button
        type="button"
        className="favitem__remove"
        onClick={() => removeFavourite(property.id)}
        aria-label={`Remove ${property.location} from your shortlist`}
        title="Remove from shortlist"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

export default FavouriteItem;