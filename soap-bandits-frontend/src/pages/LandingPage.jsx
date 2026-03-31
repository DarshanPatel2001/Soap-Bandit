import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  // --- INGREDIENT SEARCH STATE ---
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- WATER RATING STATE ---
  const [zipQuery, setZipQuery] = useState('');
  const [ratingResult, setRatingResult] = useState(null);
  const [manualHardness, setManualHardness] = useState('');

  // 1. Ingredient Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/ingredient/full/${query}`
      );
      if (!response.ok)
        throw new Error('Ingredient not found in scientific archives');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Water Rating Logic
  const handleRatingSearch = async (e) => {
    e.preventDefault();
    if (!zipQuery && !manualHardness) return;

    try {
      let url = `http://localhost:8000/api/soap-rating?zip_code=${zipQuery}`;
      if (manualHardness) url += `&manual_hardness=${manualHardness}`;

      const response = await fetch(url);
      const data = await response.json();
      setRatingResult(data);
    } catch (err) {
      console.error('Rating lookup failed:', err);
    }
  };

  return (
    <div className="landing-container">
      {/* --- NAVIGATION BAR --- */}
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">
          SOAP<span style={{ color: 'var(--ss-gold)' }}>STANDLE</span> HUB
        </div>
        <div className="u-flex" style={{ gap: '2rem' }}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/submit" className="nav-link-featured">
            Featured ↗
          </Link>
        </div>
      </nav>

      {/* --- HERO HEADER SECTION (CENTERED) --- */}
      <header className="hero-header">
        {/* Centered Breadcrumbs */}
        <div className="breadcrumb-container">
          <Link to="/" className="breadcrumb-parent">
            Soap Search
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">
            {result ? result.ingredient : 'Product Title'}
          </span>
        </div>

        <h1 className="h1">Super Soap Search</h1>
        <p className="hero-subtitle">Brought to you by SoapStandle®</p>

        {/* Search form (Centered block) */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search ingredients..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {/* Search Result Card (Centered) */}
        {result && (
          <div className="pillar-card search-result-card">
            <h2 className="result-title">{result.ingredient.toUpperCase()}</h2>
            <div className="pillars-grid">
              <div>
                <h4 className="card-sub-header">Scientific Identity</h4>
                <p className="result-text">
                  <strong>Formula:</strong>{' '}
                  {result.basic_info.molecular_formula}
                </p>
                <p className="result-text">
                  <strong>Weight:</strong> {result.basic_info.molecular_weight}{' '}
                  g/mol
                </p>
              </div>
              <div>
                <h4 className="card-sub-header">Cosmetic Function</h4>
                <p className="result-text">
                  {result.cosmetic_info.functions?.join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="card-sub-header">Product Source</h4>
                <p className="result-text">{result.cosmetic_info.source}</p>
                <p className="inci-label">
                  INCI: {result.cosmetic_info.inci_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- PILLARS SECTION (3-COLUMN HORIZONTAL GRID) --- */}
      <section className="pillars-container">
        <div className="pillars-inner">
          <div className="pillars-grid">
            {/* Pillar 1: Water Compatibility Tool */}
            <div className="pillar-card">
              <p className="card-tag">Analytics</p>
              <h3 className="h4">Water Compatibility</h3>
              <p className="card-description">
                Check your region&apos;s hardness to see how your soap will
                perform.
              </p>

              <form onSubmit={handleRatingSearch} style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Zip Code"
                  className="search-input"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  value={zipQuery}
                  onChange={(e) => setZipQuery(e.target.value)}
                />

                <select
                  className="search-input"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.875rem',
                  }}
                  value={manualHardness}
                  onChange={(e) => setManualHardness(e.target.value)}
                >
                  <option value="">Auto-detect (USGS)</option>
                  <option value="Soft">Manual: Soft</option>
                  <option value="Moderately Hard">Manual: Medium</option>
                  <option value="Hard">Manual: Hard</option>
                  <option value="Very Hard">Manual: Very Hard</option>
                </select>

                <button
                  type="submit"
                  className="search-button"
                  style={{
                    width: '100%',
                    borderRadius: '4px',
                    height: '3.5rem',
                  }}
                >
                  CHECK RATING
                </button>
              </form>

              {ratingResult && (
                <div className="rating-display">
                  <p className="rating-value">{ratingResult.soap_rating}</p>
                  <p className="rating-reason">{ratingResult.reason}</p>
                </div>
              )}
            </div>

            {/* Pillar 2: Sustainability */}
            <div className="pillar-card">
              <p className="card-tag">Metrics</p>
              <h3 className="h4">Sustainability</h3>
              <p className="card-description">
                Tracking plastic-averse efforts and global sustainability
                metrics.
              </p>
            </div>

            {/* Pillar 3: Public Health */}
            <div className="pillar-card">
              <p className="card-tag">Impact</p>
              <h3 className="h4">Public Health</h3>
              <p className="card-description">
                Evidence-based handwashing initiatives and global health data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="technical-footer">
        <p className="footer-oversight">
          Technical Oversight provided by JD Graffam
        </p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1rem' }}>
          © 2026 Super Soap Search — Part of the SoapStandle Hub.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
