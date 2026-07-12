/**
 * Favourites state machine.
 *
 * Pure: given the same state and action, always returns the same next state.
 * No React, no DOM, no localStorage — those are the provider's concern.
 * This separation is what allows the duplicate-prevention rule to be unit
 * tested without mounting a component.
 *
 * State shape: an array of property IDs, e.g. ['prop1', 'prop3'].
 * IDs rather than full property objects, because the property data already
 * lives in the bundle; storing it twice creates two sources of truth.
 */

export const ACTIONS = {
  ADD: 'favourites/add',
  REMOVE: 'favourites/remove',
  CLEAR: 'favourites/clear',
  HYDRATE: 'favourites/hydrate',
};

/** The initial state: an empty shortlist. */
export const initialFavourites = [];

/**
 * @param {string[]} state  - current list of favourited property IDs
 * @param {{type: string, payload?: *}} action
 * @returns {string[]} the next state
 */
export function favouritesReducer(state, action) {
  switch (action.type) {
    /**
     * Add a property to the shortlist.
     *
     * This is the ONLY code path that can add a favourite. Both the heart
     * button and the drag-and-drop target dispatch this same action, so the
     * duplicate guard below cannot be bypassed or accidentally duplicated
     * in two places where the implementations could drift apart.
     */
    case ACTIONS.ADD: {
      const id = action.payload;

      // Reject anything that is not a usable id, rather than pushing
      // undefined into the list and rendering a broken row later.
      if (typeof id !== 'string' || id === '') return state;

      // Duplicate prevention. Returning the SAME state reference (not a new
      // array with identical contents) means React can bail out of the
      // re-render entirely — a redundant add is genuinely free.
      if (state.includes(id)) return state;

      return [...state, id];
    }

    /** Remove one property. Dispatched by both the delete button and drag-out. */
    case ACTIONS.REMOVE: {
      const id = action.payload;

      // Removing something that isn't there is a no-op, not an error.
      if (!state.includes(id)) return state;

      return state.filter((favouriteId) => favouriteId !== id);
    }

    /** Empty the shortlist. */
    case ACTIONS.CLEAR: {
      // Already empty — return the same reference so no re-render occurs.
      if (state.length === 0) return state;
      return [];
    }

    /**
     * Replace state wholesale from persisted storage on first mount.
     * The payload is untrusted (it comes from localStorage, which the user
     * can edit in devtools), so it is validated here rather than assumed.
     */
    case ACTIONS.HYDRATE: {
      if (!Array.isArray(action.payload)) return state;

      // Keep only well-formed unique string ids.
      const valid = action.payload.filter(
        (id) => typeof id === 'string' && id !== ''
      );
      return [...new Set(valid)];
    }

    default:
      return state;
  }
}

export default favouritesReducer;