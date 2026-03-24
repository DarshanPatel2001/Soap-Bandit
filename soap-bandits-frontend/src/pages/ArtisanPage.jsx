import ArtisanForm from '../_components/ArtisanForm';
import './LandingPage.css';

const ArtisanPage = () => {
  return (
    <div className="landing-container">
      {/* Reusable Nav Bar */}
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div
          className="logo"
          style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
        >
          SOAP<span style={{ color: 'var(--soap-gold)' }}>STANDLE</span> HUB
        </div>
        <div className="nav-links u-flex">
          <a href="/" className="cta-button2">
            Back to Hub
          </a>
        </div>
      </nav>

      <main style={{ padding: '4rem 0' }}>
        <ArtisanForm />
      </main>

      <footer className="technical-footer">
        <span>
          Verification Workflow overseen by{' '}
          <span style={{ color: 'var(--soap-gold)' }}>JD Graffam</span>
        </span>
      </footer>
    </div>
  );
};

export default ArtisanPage;
