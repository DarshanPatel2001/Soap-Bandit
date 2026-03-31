import { Link } from 'react-router-dom';
import ArtisanForm from '../_components/ArtisanForm';
import './LandingPage.css';

const ArtisanPage = () => {
  return (
    <div className="landing-container">
      {/* --- MATCHING NAV BAR --- */}
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">
          SOAP<span style={{ color: 'var(--ss-gold)' }}>STANDLE</span> HUB
        </div>
        <div className="u-flex" style={{ gap: '2rem' }}>
          <Link to="/" className="nav-link">
            Back to Hub
          </Link>
        </div>
      </nav>

      {/* --- BREADCRUMBS --- */}
      <div className="hero-header" style={{ paddingBottom: '0' }}>
        <div className="breadcrumb-container">
          <Link to="/" className="breadcrumb-parent">
            Soap Search
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">Artisan Verification</span>
        </div>

        <h1 className="h1">Artisan Feature Request</h1>
        <p className="hero-subtitle" style={{ marginBottom: '1rem' }}>
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
        {/* The form lives here - styling for the form itself should be in its own component CSS */}
        <ArtisanForm />
      </main>

      {/* --- MATCHING FOOTER --- */}
      <footer className="technical-footer">
        <p className="footer-oversight">
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
          © 2026 Super Soap Search — Part of the SoapStandle Hub.
        </p>
      </footer>
    </div>
  );
};

export default ArtisanPage;
