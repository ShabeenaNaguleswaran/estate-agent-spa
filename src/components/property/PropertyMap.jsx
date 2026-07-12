import './PropertyMap.css';

/**
 * Google Map embed.
 *
 * Uses the keyless classic embed URL rather than the Maps Embed API. The
 * Embed API requires an API key, which on a public repository would mean
 * committing a credential to source control and shipping it in the client
 * bundle — an exposed secret, and precisely the kind of thing the security
 * criterion is asking about.
 *
 * The trade-off is a single frame-src directive in the Content Security
 * Policy (see SECURITY.md). That is the only third-party origin the policy
 * permits, and the iframe is sandboxed so the embedded document cannot
 * script this page or navigate it away.
 *
 * @param {Object} props
 * @param {{lat: number, lng: number}} props.coordinates
 * @param {string} props.location - human-readable address, for the a11y title
 */
function PropertyMap({ coordinates, location }) {
  const { lat, lng } = coordinates ?? {};

  // A property without coordinates should render an explanation, not a
  // broken iframe pointing at undefined.
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return (
      <p className="map__unavailable">
        A map is not available for this property.
      </p>
    );
  }

  // z=15 is street-level without losing the surrounding context.
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="map">
      <iframe
        className="map__frame"
        src={src}
        /* A title is required on every iframe: it is what a screen reader
           announces in place of the frame's contents. */
        title={`Map showing the location of ${location}`}
        loading="lazy"
        /*
          Sandbox restricts what the embedded document may do. Google Maps
          needs scripts and same-origin to function; everything else — form
          submission, top-level navigation, popups, plugins — is withheld.
          Omitting `sandbox` entirely would grant the frame all of them.
        */
        sandbox="allow-scripts allow-same-origin"
        /* Stops the embedded page reading which page linked to it. */
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default PropertyMap;