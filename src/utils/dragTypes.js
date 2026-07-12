/**
 * The drag-and-drop contract between the result cards and the shortlist rail.
 *
 * A custom MIME type, rather than the generic 'text/plain', so that the rail
 * can distinguish a property being dragged from within the application from
 * arbitrary text, a file, or an image dragged in from another browser tab.
 * Anything without this type is ignored.
 */
export const DRAG_TYPE_PROPERTY = 'application/x-meridian-property';

/**
 * Where a drag originated. The rail must accept a card dragged IN from the
 * results, but must not treat a favourite dragged around WITHIN itself as a
 * fresh add — and the results grid must accept a favourite dragged OUT of
 * the rail as a removal.
 */
export const DRAG_SOURCE = {
  RESULTS: 'results',
  RAIL: 'rail',
};

/**
 * Serialises a drag payload for dataTransfer, which can only carry strings.
 *
 * @param {string} propertyId
 * @param {string} source - one of DRAG_SOURCE
 * @returns {string}
 */
export function encodeDragPayload(propertyId, source) {
  return JSON.stringify({ propertyId, source });
}

/**
 * Reads a drag payload back out of a drop event.
 *
 * Returns null rather than throwing when the dropped thing is not one of
 * ours — a user can drop a file, a URL, or a selection of text onto any
 * element on the page, and none of that should crash the shortlist.
 *
 * @param {DragEvent} event
 * @returns {{propertyId: string, source: string} | null}
 */
export function decodeDragPayload(event) {
  try {
    const raw = event.dataTransfer.getData(DRAG_TYPE_PROPERTY);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (typeof payload?.propertyId !== 'string') return null;

    return payload;
  } catch {
    return null;
  }
}