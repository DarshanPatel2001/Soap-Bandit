import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div
          className="logo"
          style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
        >
          SOAP<span style={{ color: 'var(--soap-gold)' }}>STANDLE</span> HUB
        </div>

        <div className="nav-links u-flex">
          {/* 2. Replace <a> with <Link> and href with to */}
          <Link to="/home" className="cta-button2">
            HomePage
          </Link>
          <Link to="/submit" className="cta-button">
            Get Featured
          </Link>
        </div>
      </nav>

      {/* Hero Section - Search-focused for the Curious Consumer */}
      <header className="hero-header">
        <h1 className="hero-title">
          The{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--soap-gold)' }}>
            Wikipedia
          </span>{' '}
          of Bar Soap
        </h1>
        <p className="hero-subtitle">
          A technically grounded authority integrating science, sustainability,
          and retail intelligence.
        </p>

        <form className="search-form u-flex">
          <input
            type="text"
            placeholder="Search ingredients, pH, or artisans..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            SEARCH
          </button>
        </form>
      </header>

      {/* Content Pillars Section */}
      <section className="pillars-container">
        <div className="pillars-grid u-grid u-grid-md-3">
          <div className="pillar-card">
            <h3>Formulation Science</h3>
            <p>
              Deep dives into ingredients, skin pH, and dermatological safety.
            </p>
          </div>

          <div className="pillar-card">
            <h3>Sustainability</h3>
            <p>
              Tracking plastic-averse efforts and global sustainability metrics.
            </p>
          </div>

          <div className="pillar-card">
            <h3>Public Health</h3>
            <p>
              Evidence-based handwashing initiatives and global health data.
            </p>
          </div>
        </div>
      </section>

      <footer className="technical-footer">
        <span>
          Technical Oversight provided by{' '}
          <span style={{ color: 'var(--soap-gold)' }}>JD Graffam</span>
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
