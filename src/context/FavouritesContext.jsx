import { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';

import {
  favouritesReducer,
  initialFavourites,
  ACTIONS,
} from './favouritesReducer.js';

/** Key under which the shortlist is persisted. Namespaced to avoid collisions. */
const STORAGE_KEY = 'meridian:favourites';

export const FavouritesContext = createContext(null);

/**
 * Provides the favourites shortlist to the whole application.
 *
 * All impure concerns live here — localStorage access, effects, error
 * handling — while the state transitions themselves stay in the pure
 * reducer. That boundary is deliberate: it is what makes the duplicate
 * prevention rule unit-testable without a browser environment.
 *
 * Persistence is a convenience, not a requirement of the brief. It is
 * wrapped in try/catch because localStorage throws in private browsing on
 * some Safari versions, and a full-page crash over a saved shortlist would
 * be an unreasonable trade.
 */
export function FavouritesProvider({ children }) {
  const [favourites, dispatch] = useReducer(favouritesReducer, initialFavourites);

  /* -- Load once on mount ------------------------------------------------ */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      // The reducer validates the payload — we do not trust whatever is in
      // localStorage, since the user can edit it freely in devtools.
      dispatch({ type: ACTIONS.HYDRATE, payload: JSON.parse(stored) });
    } catch {
      // Corrupt JSON or storage unavailable. Start with an empty shortlist
      // rather than taking the whole page down.
    }
  }, []);

  /* -- Persist on every change ------------------------------------------- */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // Storage full or blocked. The in-memory shortlist still works for
      // this session, which is all the specification actually requires.
    }
  }, [favourites]);

  /* -- Actions ------------------------------------------------------------ */
  // useCallback so these identities are stable across renders, which stops
  // every PropertyCard re-rendering whenever an unrelated favourite changes.
  const addFavourite = useCallback((id) => {
    dispatch({ type: ACTIONS.ADD, payload: id });
  }, []);

  const removeFavourite = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE, payload: id });
  }, []);

  const clearFavourites = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
  }, []);

  const isFavourite = useCallback(
    (id) => favourites.includes(id),
    [favourites]
  );

  const value = useMemo(
    () => ({
      favourites,
      count: favourites.length,
      addFavourite,
      removeFavourite,
      clearFavourites,
      isFavourite,
    }),
    [favourites, addFavourite, removeFavourite, clearFavourites, isFavourite]
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export default FavouritesProvider;