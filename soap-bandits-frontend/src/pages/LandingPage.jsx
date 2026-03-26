import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  // State for the search query and the resulting science data
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The function that calls your FastAPI backend
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/ingredient/${query}`
      );
      if (!response.ok) throw new Error('Ingredient not found in PubChem');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/" className="cta-button2">
            HomePage
          </Link>
          <Link to="/submit" className="cta-button">
            Get Featured
          </Link>
        </div>
      </nav>

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

        {/* 4. Connected the form to the handleSearch function */}
        <form className="search-form u-flex" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search ingredients (e.g., Glycerin)..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>

        {/* 5. Display Search Results or Errors */}
        {error && (
          <p style={{ color: 'var(--soap-gold)', marginTop: '1rem' }}>
            {error}
          </p>
        )}

        {result && (
          <div className="pillar-card search-result-card">
            <h3>Scientific Identity: {result.ingredient}</h3>
            <div
              className="u-grid u-grid-md-2"
              style={{ textAlign: 'left', marginTop: '1rem' }}
            >
              <p>
                <strong>IUPAC Name:</strong> {result.iupac_name}
              </p>
              <p>
                <strong>Molecular Formula:</strong> {result.molecular_formula}
              </p>
              <p>
                <strong>Molecular Weight:</strong> {result.molecular_weight}{' '}
                g/mol
              </p>
              <p>
                <strong>PubChem CID:</strong> {result.cid}
              </p>
            </div>
            <div className="synonyms-box">
              <strong>Synonyms:</strong>
              <p>{result.synonyms.join(', ')}</p>
            </div>
          </div>
        )}
      </header>

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
