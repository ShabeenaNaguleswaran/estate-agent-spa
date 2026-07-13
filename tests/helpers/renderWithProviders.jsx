import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { FavouritesProvider } from '../../src/context/FavouritesContext.jsx';

/**
 * Renders a component inside the providers it depends on.
 *
 * MemoryRouter rather than HashRouter: the tests run in jsdom, which has no
 * real URL bar to read a hash from. MemoryRouter keeps the history entirely
 * in memory, which is what makes routing testable at all.
 *
 * FavouritesProvider is included because any component containing a
 * FavouriteButton calls useFavourites(), which throws by design when used
 * outside its provider.
 *
 * @param {React.ReactElement} ui
 * @param {Object} [options]
 * @param {string[]} [options.initialEntries] - starting route history
 * @returns the standard RTL render result
 */
export function renderWithProviders(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <FavouritesProvider>{ui}</FavouritesProvider>
    </MemoryRouter>
  );
}

export default renderWithProviders;