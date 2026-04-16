import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SoapCard from '../_components/SoapCard';
import DropdownFilter from '../_components/DropdownFilter';
import {
  SKIN_TYPES,
  COMMON_AVOID,
  getPhLabel,
  API_BASE_URL,
} from '../utils/soapHelpers';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waterData, setWaterData] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState({
    skin: [],
    source: [],
    phLevel: [],
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
    const zip = prefs?.zip || '';
    const avoid = prefs?.avoidIngredients || [];

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zip_code: zip,
          skin_type: skin,
          avoid_ingredients: avoid,
          prefer_ingredients: [],
        }),
      });
      const data = await response.json();
      setRecommendations(data.top_matches || []);

      if (data.water_hardness && data.water_hardness !== 'Unknown') {
        setWaterData({
          hardness: data.water_hardness,
          avgPh: data.avg_water_ph || '8.2',
          label: getPhLabel(data.avg_water_ph || '8.2'),
        });
      } else {
        setWaterData(null);
      }
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoaps(userPrefs);
  }, [userPrefs, fetchSoaps]);

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
    setActiveFilters({
      skin: [],
      source: [],
      phLevel: [],
      gooFactor: [],
      avoid: [],
    });
  };

  const totalActive = Object.values(activeFilters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const sortedResults = useMemo(() => {
    return recommendations
      .filter((match) => {
        const s = match.soap;
        const reasons = match.reasons || [];
        const avoidList = userPrefs?.avoidIngredients || [];

        if (avoidList.length > 0) {
          const allSoapData = JSON.stringify(s).toLowerCase();
          const allReasons = reasons.join(' ').toLowerCase();

          const hasMatch = avoidList.some((avoid) => {
            const term = avoid.toLowerCase().trim();
            if (!term) return false;
            return allSoapData.includes(term) || allReasons.includes(term);
          });

          if (hasMatch) return false;
        }

        const searchStr = locationInput.toLowerCase().trim();
        if (
          searchStr &&
          !s.brand?.toLowerCase().includes(searchStr) &&
          !s.name?.toLowerCase().includes(searchStr)
        )
          return false;

        if (activeFilters.skin.length > 0) {
          const suit = Array.isArray(s.properties?.skin_suitability)
            ? s.properties.skin_suitability.join(' ')
            : String(s.properties?.skin_suitability || 'all');

          if (
            !activeFilters.skin.some((f) =>
              suit.toLowerCase().includes(f.split(' / ')[0].toLowerCase())
            )
          )
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pA = parseFloat((a.soap?.price || '$0').replace('$', ''));
        const pB = parseFloat((b.soap?.price || '$0').replace('$', ''));
        return sortBy === 'low-high'
          ? pA - pB
          : sortBy === 'high-low'
            ? pB - pA
            : 0;
      });
  }, [recommendations, locationInput, activeFilters, sortBy, userPrefs]);

  return (
    <div className="homepage-wrapper">
      <nav className="nav-bar u-flex u-items-center u-justify-between">
        <div className="logo-text">Super Soap Search</div>
        <div className="u-flex u-items-center" style={{ gap: '1.5rem' }}>
          <Link to="/science" className="nav-link">
            Soap Science
          </Link>
          <Link to="/search" className="nav-link">
            Ingredient Archive
          </Link>
          {/* NAVIGATION TO ARTISAN PORTAL */}
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
              ? `WATER: ${waterData.hardness?.toUpperCase()} • PH: ${waterData.avgPh} (${waterData.label})`
              : 'NO MORE GOOEY SOAP'}
          </p>
          <h1 className="h1-large">Precision Soap Pairing</h1>
          <p className="hero-subtitle">
            Matching your skin chemistry with local water data.
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
              value={formAvoid.length > 0 ? formAvoid[0] : ''}
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

      <section
        className="info-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div className="info-item">
            <strong>pH Balance:</strong> High pH can be drying in hard water.
          </div>
          <div className="info-item">
            <strong>Goo Factor:</strong> Measures how fast a bar turns to mush.
          </div>
        </div>
        <div className="info-item">
          <Link
            to="/science"
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Explore the Glossary →
          </Link>
        </div>
      </section>

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
          <button
            type="button"
            className={`all-filters-btn ${totalActive > 0 ? 'has-active' : ''}`}
            onClick={clearAll}
          >
            ≡ All Filters{' '}
            {totalActive > 0 && (
              <span className="all-filters-count">{totalActive}</span>
            )}
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
            options={['Organic', 'Plant-Based', 'Natural']}
            selected={activeFilters.source}
            onToggle={(v) => toggleFilter('source', v)}
          />
          <DropdownFilter
            label="pH"
            options={['Low (≤8.5)', 'Medium (8.6–9.0)', 'High (9.1+)']}
            selected={activeFilters.phLevel}
            onToggle={(v) => toggleFilter('phLevel', v)}
          />
          <DropdownFilter
            label="Goo"
            options={['Very Firm', 'Firm', 'Average', 'Gooey', 'Very Gooey']}
            selected={activeFilters.gooFactor}
            onToggle={(v) => toggleFilter('gooFactor', v)}
          />
        </div>
      </div>

      <div className="results-sort-bar u-flex u-justify-between u-items-center">
        <span className="results-label">
          {sortedResults.length} Personalized Result
          {sortedResults.length !== 1 ? 's' : ''}
        </span>
        <div
          className="sort-wrap u-flex u-items-center"
          style={{ gap: '10px' }}
        >
          <span className="sort-label">Sort:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Best Match</option>
            <option value="low-high">Price: Low-High</option>
            <option value="high-low">Price: High-Low</option>
          </select>
        </div>
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
                isPersonalized={!!userPrefs}
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
