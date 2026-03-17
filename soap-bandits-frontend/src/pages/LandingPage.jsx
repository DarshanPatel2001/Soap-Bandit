import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation - Uses new nav-bar and navigation classes */}
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        {/* Logo - style prop for standard gold highlight from image_1.png */}
        <div
          className="logo"
          style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}
        >
          SOAP<span style={{ color: 'var(--soap-gold)' }}>STANDLE</span> HUB
        </div>

        {/* Nav Links - clean and simple with direct link names */}
        <div className="nav-links u-flex">
          <a href="#science">Science</a>
          <a href="#sustainability">Sustainability</a>
          <a href="#directory">Artisans</a>
        </div>
      </nav>

      {/* Hero Section - Prominent header with the "Wikipedia" heading */}
      <header className="hero-header">
        {/* Heading text styled with standard gold italic highlight from image_1.png */}
        <h1 className="hero-title">
          The{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--soap-gold)' }}>
            Wikipedia
          </span>{' '}
          of Bar Soap
        </h1>
        {/* Supporting subtitle text and citation */}
        <p className="hero-subtitle">
          A technically grounded authority integrating science, sustainability,
          and retail intelligence.
        </p>

        {/* Search Bar - Standard input and button combination from image_1.png */}
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

      {/* Content Pillars Section - Card layout with key content areas */}
      <section className="pillars-container">
        {/* Uses grid to match the original layout from image_1.png */}
        <div className="pillars-grid u-grid u-grid-md-3">
          {/* Individually styled card with top gold border and content */}
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

      {/* Expert Verification - technical text and citation at bottom from image_1.png */}
      <footer className="technical-footer">
        {/* style prop for standard gold technical highlight text from image_1.png */}
        <span>
          Technical Oversight provided by{' '}
          <span style={{ color: 'var(--soap-gold)' }}>JD Graffam</span>
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
