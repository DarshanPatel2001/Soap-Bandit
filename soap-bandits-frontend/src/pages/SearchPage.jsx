// This page may be removed from project
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SearchPage.css';

const LandingPage = () => {
  // --- STATE ---
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [zipQuery, setZipQuery] = useState('');
  const [ratingResult, setRatingResult] = useState(null);

  // 1. Ingredient Search — Hits /ingredients/{name}/full and /safety
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetching both full details and safety hazard score
      const [detailsRes, safetyRes] = await Promise.all([
        fetch(`http://localhost:8000/ingredients/${query}/full`),
        fetch(`http://localhost:8000/ingredients/${query}/safety`),
      ]);

      if (!detailsRes.ok)
        throw new Error('Ingredient not found in scientific archives');

      const detailsData = await detailsRes.json();
      const safetyData = safetyRes.ok ? await safetyRes.json() : null;

      setResult({ ...detailsData, safety: safetyData });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Water Rating — Hits /water/soap-rating
  const handleRatingSearch = async (e) => {
    e.preventDefault();
    if (!zipQuery) return;

    try {
      // Endpoint: GET /water/soap-rating?zip_code=&soap_name=
      const response = await fetch(
        `http://localhost:8000/water/soap-rating?zip_code=${zipQuery}`
      );
      const data = await response.json();
      setRatingResult(data);
    } catch (err) {
      console.error('Rating lookup failed:', err);
    }
  };

  return (
    <div className="landing-container">
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

      <header className="hero-header">
        <div className="breadcrumb-container">
          <Link to="/" className="breadcrumb-parent">
            Soap Search
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">
            {result ? result.ingredient : 'Ingredient Profile'}
          </span>
        </div>

        <h1 className="h1">Super Soap Search</h1>
        <p className="hero-subtitle">Brought to you by SoapStandle®</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search ingredients (e.g. Glycerin)..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {/* --- INGREDIENT RESULT CARD --- */}
        {result && (
          <div className="pillar-card search-result-card">
            <h2 className="result-title">{result.ingredient?.toUpperCase()}</h2>
            <div className="pillars-grid">
              <div>
                <h4 className="card-sub-header">Scientific Identity</h4>
                <p className="result-text">
                  <strong>Formula:</strong>{' '}
                  {result.basic_info?.molecular_formula || 'N/A'}
                </p>
                {result.safety && (
                  <p className="result-text">
                    <strong>Hazard Score:</strong>
                    <span
                      style={{
                        color: result.safety.hazard_score > 5 ? 'red' : 'green',
                        marginLeft: '5px',
                      }}
                    >
                      {result.safety.hazard_score} / 10
                    </span>
                  </p>
                )}
              </div>
              <div>
                <h4 className="card-sub-header">Cosmetic Function</h4>
                <p className="result-text">
                  {result.cosmetic_info?.functions?.join(', ') ||
                    'Functional Agent'}
                </p>
              </div>
              <div>
                <h4 className="card-sub-header">Safety Status</h4>
                <p className="result-text" style={{ fontSize: '0.8rem' }}>
                  {result.safety?.has_concerns
                    ? '⚠️ Significant concerns flagged'
                    : '✅ No major developmental concerns'}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="pillars-container">
        <div className="pillars-inner">
          <div className="pillars-grid">
            {/* Pillar 1: Water Compatibility Tool */}
            <div className="pillar-card">
              <h3 className="h4">Water Compatibility</h3>
              <p className="card-description">
                Check how typical soaps perform in your local water.
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
                <div
                  className="rating-display"
                  style={{
                    marginTop: '1.5rem',
                    borderTop: '1px solid #eee',
                    paddingTop: '1rem',
                  }}
                >
                  <p
                    className="rating-value"
                    style={{ fontWeight: 'bold', color: 'var(--ss-navy)' }}
                  >
                    Rating: {ratingResult.soap_rating}
                  </p>
                  <p
                    className="rating-reason"
                    style={{ fontSize: '0.85rem', color: '#666' }}
                  >
                    {ratingResult.reason}
                  </p>
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: '#999',
                      marginTop: '5px',
                    }}
                  >
                    Water hardness detected: {ratingResult.hardness_category}
                  </p>
                </div>
              )}
            </div>

            <div className="pillar-card">
              <h3 className="h4">Sustainability</h3>
              <p className="card-description">
                Tracking plastic-averse efforts and global sustainability
                metrics.
              </p>
            </div>

            <div className="pillar-card">
              <h3 className="h4">Public Health</h3>
              <p className="card-description">
                Evidence-based handwashing initiatives and global health data.
              </p>
            </div>
          </div>
        </div>
      </section>

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
