import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SoapCard from '../_components/SoapCard';
import DropdownFilter from '../_components/DropdownFilter';
import { applyHybridFilters } from '../utils/filterLogic';
import { SKIN_TYPES, COMMON_AVOID, API_BASE_URL } from '../utils/soapHelpers';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  // DATA STATES
  const [recommendations, setRecommendations] = useState([]);
  const [allSoaps, setAllSoaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waterData, setWaterData] = useState(null);

  // UI STATES
  const [locationInput, setLocationInput] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState({
    skin: [],
    source: [],
    gooFactor: [],
    avoid: [],
  });

  const [userPrefs, setUserPrefs] = useState(() => {
    const saved = sessionStorage.getItem('userPrefs');
    return saved ? JSON.parse(saved) : null;
  });

  const [formZip, setFormZip] = useState(userPrefs?.zip || '');
  const [formSkin, setFormSkin] = useState(userPrefs?.skinType || '');
  const [formAvoid, setFormAvoid] = useState(userPrefs?.avoidIngredients || []);

  const fetchSoaps = useCallback(async (prefs) => {
    setLoading(true);
    const skin = prefs?.skinType
      ? prefs.skinType.toLowerCase().split(' / ')[0]
      : '';
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zip_code: prefs?.zip || '',
          skin_type: skin,
          avoid_ingredients: prefs?.avoidIngredients || [],
          prefer_ingredients: [],
        }),
      });
      const data = await response.json();
      setRecommendations(data.top_matches || []);

      if (data.water_hardness && data.water_hardness !== 'Unknown') {
        setWaterData({ hardness: data.water_hardness });
      }
    } catch (err) {
      console.error('Match Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArchive = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/soaps/all`);
      const data = await response.json();
      setAllSoaps(data || []);
    } catch (err) {
      console.error('Archive Error:', err);
    }
  }, []);

  useEffect(() => {
    fetchArchive();
    if (userPrefs) fetchSoaps(userPrefs);
  }, [userPrefs, fetchSoaps, fetchArchive]);

  const handlePersonalize = (e) => {
    e.preventDefault();
    const prefs = {
      zip: formZip,
      skinType: formSkin,
      avoidIngredients: formAvoid,
    };
    setUserPrefs(prefs);
    sessionStorage.setItem('userPrefs', JSON.stringify(prefs));
  };

  const clearPrefs = () => {
    sessionStorage.removeItem('userPrefs');
    setUserPrefs(null);
    setRecommendations([]);
    setFormZip('');
    setFormSkin('');
    setFormAvoid([]);
  };

  const toggleFilter = (group, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  };

  const clearAll = () => {
    setLocationInput('');
    setActiveFilters({ skin: [], source: [], gooFactor: [], avoid: [] });
  };

  const sortedResults = useMemo(() => {
    return applyHybridFilters({
      recommendations,
      allSoaps,
      activeFilters,
      userPrefs,
      locationInput,
      sortBy,
    });
  }, [
    recommendations,
    allSoaps,
    locationInput,
    activeFilters,
    sortBy,
    userPrefs,
  ]);

  return (
    <div className="homepage-wrapper">
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">
          SUPER <span style={{ color: 'var(--ss-gold)' }}>SOAP</span> SEARCH
        </div>
        <div className="u-flex u-items-center" style={{ gap: '1.5rem' }}>
          <Link to="/science" className="nav-link">
            Soap Science
          </Link>
          <Link to="/search" className="nav-link">
            Ingredient Archive
          </Link>
          <Link to="/submit" className="nav-link-featured">
            Artisan Portal ↗
          </Link>
          {userPrefs && (
            <button type="button" className="clear-link" onClick={clearPrefs}>
              Reset Profile
            </button>
          )}
        </div>
      </nav>

      <header className="hero-header hero-split">
        <div className="hero-content">
          <p className="hero-eyebrow">
            {waterData
              ? `LOCAL WATER: ${waterData.hardness?.toUpperCase()}`
              : 'PRECISION SKINCARE'}
          </p>
          <h1 className="h1-large">Precision Soap Pairing</h1>
          <p className="hero-subtitle">
            Matching your unique skin chemistry with local water analysis.
          </p>
        </div>
        <div className="hero-form-box">
          <h3>{userPrefs ? 'Update Chemistry' : 'Find Your Match'}</h3>
          <form onSubmit={handlePersonalize}>
            <label className="form-label-small">Skin Type</label>
            <select
              required
              value={formSkin}
              onChange={(e) => setFormSkin(e.target.value)}
            >
              <option value="" disabled>
                Select Skin Type
              </option>
              {SKIN_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <label className="form-label-small">Allergens to Avoid</label>
            <select
              value={formAvoid[0] || ''}
              onChange={(e) => setFormAvoid([e.target.value])}
            >
              <option value="" disabled>
                Select Ingredients
              </option>
              {COMMON_AVOID.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <label className="form-label-small" style={{ marginTop: '1rem' }}>
              Zip Code
            </label>
            <input
              type="text"
              placeholder="Zip Code"
              value={formZip}
              onChange={(e) => setFormZip(e.target.value)}
            />
            <button type="submit" className="btn-add" style={{ width: '100%' }}>
              RECALCULATE
            </button>
          </form>
        </div>
      </header>

      <div className="top-filter-bar">
        <div className="location-input-wrap">
          <span className="location-icon">🔆</span>
          <input
            className="location-input"
            type="text"
            placeholder="Filter by Name or Brand"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>
        <div className="top-filter-bar-right">
          <button type="button" className="all-filters-btn" onClick={clearAll}>
            ≡ All Filters
          </button>
          <DropdownFilter
            label="Skin"
            options={SKIN_TYPES}
            selected={activeFilters.skin}
            onToggle={(v) => toggleFilter('skin', v)}
          />
          <DropdownFilter
            label="Avoid"
            options={COMMON_AVOID}
            selected={activeFilters.avoid}
            onToggle={(v) => toggleFilter('avoid', v)}
          />
          <DropdownFilter
            label="Source"
            options={['Plant-based', 'Natural', 'Synthetic']}
            selected={activeFilters.source}
            onToggle={(v) => toggleFilter('source', v)}
          />
          <DropdownFilter
            label="Goo"
            options={['Very Firm', 'Firm', 'Average', 'Gooey', 'Very Gooey']}
            selected={activeFilters.gooFactor}
            onToggle={(v) => toggleFilter('gooFactor', v)}
          />
        </div>
      </div>

      <div
        className="results-sort-bar u-flex u-justify-between u-items-center"
        style={{ padding: '1rem 2.5rem' }}
      >
        <div className="u-flex u-items-center">
          <span className="results-label">
            {sortedResults.length} Results {userPrefs ? '(Personalized)' : ''}
          </span>
          <div className="tooltip-wrap">
            <div className="info-icon">i</div>
            <span className="tooltip-text">
              <strong>Scientific Match:</strong> Ranking based on your skin type
              and preferred ingredients vs. your local water hardness.
            </span>
          </div>
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Recommended</option>
          <option value="low-high">Price: Low-High</option>
          <option value="high-low">Price: High-Low</option>
        </select>
      </div>

      <div className="grid-section">
        {loading ? (
          <div className="no-results">
            <p>Analyzing matches...</p>
          </div>
        ) : (
          <div className="grid">
            {sortedResults.map((m) => (
              <SoapCard
                key={m.soap?.id || Math.random()}
                match={m}
                onCardClick={(s) =>
                  navigate('/product', { state: { soap: s } })
                }
                isPersonalized={m.match_score !== null}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="technical-footer">
        <p>Technical Oversight by JD Graffam</p>
      </footer>
    </div>
  );
};

export default HomePage;
