import { HashRouter, Routes, Route } from 'react-router-dom';

import { FavouritesProvider } from './context/FavouritesContext.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PropertyPage from './pages/PropertyPage.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Application shell and route table.
 *
 * HashRouter (not BrowserRouter) because GitHub Pages is a static host with
 * no rewrite rules — a deep link like /property/prop3 would 404 on refresh,
 * and the usual 404.html workaround needs an inline script that would weaken
 * the Content Security Policy.
 *
 * FavouritesProvider sits inside the router but outside Routes, so the
 * shortlist is shared between the search page and the property page and
 * survives navigation between them.
 */
function App() {
  return (
    <HashRouter>
      <FavouritesProvider>
        <Header />

        <main id="main">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/property/:id" element={<PropertyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </FavouritesProvider>
    </HashRouter>
  );
}

export default App;