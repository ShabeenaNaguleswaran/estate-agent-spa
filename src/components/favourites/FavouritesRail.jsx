import { useState } from 'react';

import properties from '../../data/properties.json';
import { useFavourites } from '../../context/useFavourites.js';
import FavouriteItem from './FavouriteItem.jsx';
import { DRAG_SOURCE, decodeDragPayload } from '../../utils/dragTypes.js';
import './FavouritesRail.css';

/**
 * The shortlist rail — the favourites list displayed on the search page.
 *
 * Acts as a drop target for property cards dragged in from the results grid,
 * which is the second of the two required ways to add a favourite (the
 * button being the first). Both dispatch the same ADD action, so the
 * reducer's duplicate guard covers both without either knowing about it.
 *
 * Drag events, and why each one is here:
 *   dragOver  - MUST call preventDefault(). The default action of dragover is
 *               to REJECT the drop, so without this the drop event never
 *               fires at all. This is the single most common HTML5 DnD bug.
 *   dragEnter - raises a counter, so the drop zone stays lit while the cursor
 *               passes over child elements inside the rail
 *   dragLeave - lowers that counter
 *   drop      - reads the payload and dispatches
 */
function FavouritesRail() {
  const { favourites, count, addFavourite, clearFavourites } = useFavourites();

  /*
    A boolean here would flicker. dragenter/dragleave fire for every child
    element the cursor crosses, so moving over an item inside the rail fires
    a dragleave for the rail itself. Counting enters minus leaves keeps the
    zone lit for as long as the cursor is genuinely inside it.
  */
  const [dragDepth, setDragDepth] = useState(0);
  const isDropActive = dragDepth > 0;

  /* Resolve ids to full property objects. The shortlist stores ids only, so
     there is a single source of truth for property data. */
  const favouriteProperties = favourites
    .map((id) => properties.find((property) => property.id === id))
    .filter(Boolean);   // guards against a stale id in localStorage

  const handleDragOver = (event) => {
    // Without this line, drop never fires. See the note above.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setDragDepth((depth) => depth + 1);
  };

  const handleDragLeave = () => {
    setDragDepth((depth) => Math.max(0, depth - 1));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragDepth(0);

    const payload = decodeDragPayload(event);

    // Not one of ours — a file, a URL, a text selection. Ignore it silently.
    if (!payload) return;

    // A favourite dragged around inside the rail is not a new add. Without
    // this guard, dropping an item back on the rail would be a redundant
    // dispatch (harmless, thanks to the reducer, but meaningless).
    if (payload.source === DRAG_SOURCE.RAIL) return;

    // The reducer rejects the duplicate if this property is already listed.
    // The rail does not check first — it does not need to, and duplicating
    // the check here is exactly how the two paths would drift apart.
    addFavourite(payload.propertyId);
  };

  return (
    <aside
      className={`rail ${isDropActive ? 'rail--drop-active' : ''}`}
      aria-label="Your shortlist"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="rail__header">
        <div className="rail__heading">
          <h2 className="rail__title">Shortlist</h2>
          {/* Mono count, zero-padded — reads as a running tally, not a badge */}
          <span className="rail__count data">
            {String(count).padStart(2, '0')}
          </span>
        </div>

        {count > 0 && (
          <button
            type="button"
            className="rail__clear"
            onClick={clearFavourites}
          >
            Clear all
          </button>
        )}
      </header>

      {count === 0 ? (
        /*
          Empty state doubles as the drop zone. The dashed border is the same
          grammar used by the empty results state: dashed means "something
          goes here". It is also the only instruction the user gets that
          dragging is possible, so it says so explicitly.
        */
        <div className="rail__empty">
          <svg className="rail__empty-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 20.5 3.8 12.3a5 5 0 0 1 7.1-7.1l1.1 1.1 1.1-1.1a5 5 0 1 1 7.1 7.1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <p className="rail__empty-title">Nothing shortlisted yet</p>
          <p className="rail__empty-body">
            Drag a property here, or press the heart on any card.
          </p>
        </div>
      ) : (
        <>
          <ul className="rail__list">
            {favouriteProperties.map((property) => (
              <FavouriteItem key={property.id} property={property} />
            ))}
          </ul>

          {/* With items present, the drop zone becomes a slim strip below
              them, so dragging in a property is still possible without
              having to aim at the gaps between rows. */}
          <div className="rail__dropzone" aria-hidden="true">
            <span>Drop to add</span>
          </div>
        </>
      )}
    </aside>
  );
}

export default FavouritesRail;