import './Footer.css';

/**
 * Footer. Deliberately plain — the shortlist rail is where the visual
 * weight of this site sits, so the footer stays quiet.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__mark">MERIDIAN</span>
        <span className="footer__meta data">
          {year} · 5COSC026W ADVANCED CLIENT-SIDE WEB DEVELOPMENT
        </span>
      </div>
    </footer>
  );
}

export default Footer;