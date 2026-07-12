import { useContext } from 'react';
import { FavouritesContext } from './FavouritesContext.jsx';

/**
 * Access the favourites shortlist.
 *
 * Throwing when used outside the provider turns a silent bug — every value
 * reading as undefined, with a crash three components deeper — into an
 * immediate, named error at the point of misuse.
 *
 * @returns {{
 *   favourites: string[],
 *   count: number,
 *   addFavourite: (id: string) => void,
 *   removeFavourite: (id: string) => void,
 *   clearFavourites: () => void,
 *   isFavourite: (id: string) => boolean,
 * }}
 */
export function useFavourites() {
  const context = useContext(FavouritesContext);

  if (context === null) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }

  return context;
}

export default useFavourites;