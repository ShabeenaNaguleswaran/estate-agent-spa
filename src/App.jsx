import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

/**
 * Application shell.
 * Routing is added in the next commit — for now this renders the layout
 * frame and a token specimen so the design system can be verified visually.
 */
function App() {
  return (
    <>
      <Header />

      <main className="container" style={{ paddingBlock: 'var(--space-7)' }}>
        <p className="label">Design system</p>
        <h1 style={{ marginBottom: 'var(--space-5)' }}>Type and colour specimen</h1>

        <p style={{ maxWidth: '60ch', color: 'var(--slate)' }}>
          Structural type is set in Archivo. Every number in the application —
          price, bedrooms, postcode, date — is set in IBM Plex Mono with tabular
          figures, so that lists of properties align like a survey record.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          <div>
            <p className="label">Price</p>
            <p className="data" style={{ fontSize: 'var(--text-xl)' }}>£750,000</p>
          </div>
          <div>
            <p className="label">Bedrooms</p>
            <p className="data" style={{ fontSize: 'var(--text-xl)' }}>3</p>
          </div>
          <div>
            <p className="label">Postcode</p>
            <p className="data" style={{ fontSize: 'var(--text-xl)' }}>BR1 3PL</p>
          </div>
          <div>
            <p className="label">Added</p>
            <p className="data" style={{ fontSize: 'var(--text-xl)' }}>12 SEP 2025</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;