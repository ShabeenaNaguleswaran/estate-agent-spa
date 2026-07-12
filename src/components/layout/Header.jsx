import './Header.css';

/**
 * Site header. Sticky, hairline-bottom, no shadow.
 * The mono eyebrow beside the wordmark establishes the "spec sheet"
 * typographic system from the very first thing the user reads.
 */
function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#/" className="header__brand" aria-label="Meridian — home">
          <span className="header__mark">MERIDIAN</span>
          <span className="header__rule" aria-hidden="true" />
          <span className="header__eyebrow data">PROPERTY SEARCH</span>
        </a>

        <nav className="header__nav" aria-label="Primary">
          <a href="#/" className="header__link">Search</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;