import { Link } from 'react-router-dom';
import ArtisanForm from '../_components/ArtisanForm';
import './SearchPage.css';

const ArtisanPage = () => {
  return (
    <div className="landing-container">
      {/* --- BRANDED NAV BAR --- */}
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">
          SUPER <span style={{ color: 'var(--ss-gold)' }}>SOAP</span> SEARCH
        </div>
        <div className="u-flex" style={{ gap: '2rem' }}>
          <Link to="/" className="nav-link">
            Back to Hub
          </Link>
        </div>
      </nav>

      {/* --- BREADCRUMBS & HEADER --- */}
      <div
        className="hero-header"
        style={{ paddingBottom: '0', textAlign: 'center' }}
      >
        <div
          className="breadcrumb-container"
          style={{ justifyContent: 'center', marginBottom: '1rem' }}
        >
          <Link to="/" className="breadcrumb-parent">
            Soap Search
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">Artisan Verification</span>
        </div>

        <h1 className="h1" style={{ textAlign: 'center' }}>
          Artisan Feature Request
        </h1>
        <p
          className="hero-subtitle"
          style={{
            textAlign: 'center',
            margin: '0 auto 1rem auto',
            maxWidth: '600px',
          }}
        >
          Submit your product for technical verification and retail placement.
        </p>
      </div>

      <main
        style={{
          padding: '2rem 0 6rem 0',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <ArtisanForm />
      </main>

      {/* --- BRANDED FOOTER --- */}
      <footer className="technical-footer">
        <p className="footer-oversight" style={{ textAlign: 'center' }}>
          Verification Workflow overseen by{' '}
          <span style={{ color: 'var(--ss-gold)' }}>JD Graffam</span>
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            opacity: 0.6,
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          © 2026 Super Soap Search — Precision Soap Pairing & Ingredient
          Archive.
        </p>
      </footer>
    </div>
  );
};

export default ArtisanPage;
