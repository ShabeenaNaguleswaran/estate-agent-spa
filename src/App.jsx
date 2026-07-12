import { HashRouter, Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PropertyPage from './pages/PropertyPage.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Application shell and route table.
 *
 * HashRouter (not BrowserRouter) is a deliberate choice. GitHub Pages is a
 * static host with no server-side rewrite rules, so a path like
 * /property/prop3 would return a 404 on refresh because no such file exists.
 * Hash-based routing keeps the entire route after the '#', which the server
 * never sees — the deployed app therefore supports deep links and refreshes
 * without needing a 404.html redirect hack (which would have required an
 * inline script, weakening the Content Security Policy).
 */
function App() {
  return (
    <HashRouter>
      <Header />

      <main id="main">
        <Routes>
          {/* Search + results + favourites rail */}
          <Route path="/" element={<SearchPage />} />

          {/* Individual property — gallery, tabs, map */}
          <Route path="/property/:id" element={<PropertyPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </HashRouter>
  );
}

export default App;