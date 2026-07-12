import { useState } from 'react';

import { assetUrl } from '../../utils/assets.js';

/**
 * Floor plan viewer.
 *
 * A floor plan scaled to fit a tab panel is illegible — the room dimensions
 * printed on it are the whole point and they render at a few pixels tall.
 * A zoom toggle switches between fit-to-width and full size, with the
 * container scrolling in both axes when zoomed.
 *
 * @param {Object} props
 * @param {string} props.floorPlan - relative path to the floor plan image
 * @param {string} props.location  - for the alt text
 */
function FloorPlan({ floorPlan, location }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!floorPlan) {
    return (
      <p className="tabs__unavailable">
        A floor plan is not available for this property.
      </p>
    );
  }

  return (
    <div className="floorplan">
      <div className="floorplan__toolbar">
        <p className="label">Floor plan</p>

        <button
          type="button"
          className="floorplan__zoom"
          onClick={() => setIsZoomed((zoomed) => !zoomed)}
          aria-pressed={isZoomed}
        >
          {isZoomed ? 'Fit to width' : 'Zoom in'}
        </button>
      </div>

      <div className={`floorplan__viewport ${isZoomed ? 'floorplan__viewport--zoomed' : ''}`}>
        <img
          className="floorplan__image"
          src={assetUrl(floorPlan)}
          alt={`Floor plan for the property at ${location}`}
          loading="lazy"
          draggable={false}
        />
      </div>

      <p className="floorplan__note">
        Dimensions are approximate and provided as a guide only.
      </p>
    </div>
  );
}

export default FloorPlan;