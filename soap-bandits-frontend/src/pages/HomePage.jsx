import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import PreferencesModal from '../_modals/PreferencesModal';
import './HomePage.css';

const API_BASE_URL = 'http://localhost:8000';

const DEFAULT_FILTER_GROUPS = [
  {
    key: 'skin',
    label: 'Skin Type',
    options: [],
  },
  {
    key: 'source',
    label: 'Source',
    options: [],
  },
  {
    key: 'phLevel',
    label: 'pH Level',
    options: [],
  },
  {
    key: 'gooFactor',
    label: 'Goo Factor',
    options: [],
  },
  {
    key: 'longevity',
    label: 'Longevity',
    options: [],
  },
];

// ── HELPER: MAP NUMERIC PH TO FILTER LABELS ──────────────────────────────────
const getPhLabel = (ph) => {
  const val = parseFloat(ph);
  if (val <= 8.5) return 'Low (≤8.5)';
  if (val <= 9.0) return 'Medium (8.6–9.0)';
  return 'High (9.1+)';
};

// ── SUB-COMPONENT: SOAP CARD ──────────────────────────────────────────────────
const SoapCard = ({ match, onCardClick, isPersonalized }) => {
  const soap = match?.soap || {};
  const score = match?.match_score;
  const reasons = match?.reasons || [];

  const shortDesc =
    soap.desc && soap.desc.length > 100
      ? soap.desc.slice(0, 100) + '…'
      : soap.desc || 'No description available.';

  const productImg =
    soap.image_url ||
    soap.img ||
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80';

  return (
    <div className="card" onClick={() => onCardClick(soap)}>
      <div
        className="card-img"
        style={{
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={productImg}
          alt={soap.name || 'Soap'}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '1rem',
            position: 'relative',
            zIndex: 1,
          }}
        />
        <span className="card-tag tag-artisan" style={{ zIndex: 2 }}>
          {soap.brand?.toUpperCase() || 'VERIFIED'}
        </span>

        {isPersonalized && score && (
          <div
            className="ph-badge"
            style={{ background: '#e7b45c', zIndex: 2 }}
          >
            <span className="ph-label" style={{ color: '#283745' }}>
              Match
            </span>
            <span className="ph-value" style={{ color: '#283745' }}>
              {score}%
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        <p
          className="card-company"
          style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}
        >
          {soap.brand}
        </p>
        <h2 className="card-name">{soap.name}</h2>
        <p className="card-desc">{shortDesc}</p>
      </div>

      <div
        className="stats"
        style={{
          borderTop: '1px solid #f1f5f9',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div className="stat">
          <span className="stat-label">pH Level</span>
          <span className="stat-value">{soap.ph_level || '9.0'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Skin</span>
          <span className="stat-value">
            {Array.isArray(soap.skin_suitability)
              ? soap.skin_suitability.join(' / ') || 'All'
              : soap.skin_suitability || 'All'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Gooeyness</span>
          <span className="stat-value" style={{ fontSize: '0.7rem' }}>
            {soap.gooeyness_label || 'Average'}
          </span>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="ingredients-section" style={{ paddingTop: '12px' }}>
          <p className="ing-label">
            {isPersonalized ? 'Scientific Reason' : 'Product Highlights'}
          </p>
          <div className="ing-pills">
            {reasons.slice(0, 2).map((r, i) => (
              <span
                key={`${soap.id}-reason-${i}`}
                className="ing-pill"
                style={{ background: '#f1f5f9', color: '#475569' }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card-footer" style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="btn-add"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(soap);
          }}
        >
          View Info
        </button>
      </div>
    </div>
  );
};

// ── MAIN HOMEPAGE COMPONENT ───────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waterData, setWaterData] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPrefs, setUserPrefs] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [filterGroups, setFilterGroups] = useState(DEFAULT_FILTER_GROUPS);
  const [activeFilters, setActiveFilters] = useState({
    skin: [],
    source: [],
    phLevel: [],
    gooFactor: [],
    longevity: [],
  });
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Fetch available filters from backend
  const fetchFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/filters`);
      const data = await response.json();
      if (data.filters) {
        setFilterGroups([
          {
            key: 'skin',
            label: 'Skin Type',
            options: data.filters.skin || [],
          },
          {
            key: 'source',
            label: 'Source',
            options: data.filters.source || [],
          },
          {
            key: 'phLevel',
            label: 'pH Level',
            options: data.filters.phLevel || [],
          },
          {
            key: 'gooFactor',
            label: 'Goo Factor',
            options: data.filters.gooFactor || [],
          },
          {
            key: 'longevity',
            label: 'Longevity',
            options: data.filters.longevity || [],
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  // API Call Wrapper
  const fetchSoaps = useCallback(async (prefs) => {
    setLoading(true);
    const normalizedSkin = (prefs?.skinType || 'Normal')
      .toLowerCase()
      .split(' / ')[0];
    const zipCode = prefs?.zip || '37201';

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zip_code: zipCode,
          skin_type: normalizedSkin,
          avoid_ingredients: [],
          prefer_ingredients: [],
        }),
      });
      const data = await response.json();
      const results = data.top_matches || [];
      const water = { city: data.user_location, hardness: data.water_hardness };

      setRecommendations(results);
      setWaterData(water);

      if (prefs) {
        sessionStorage.setItem('lastResults', JSON.stringify(results));
        sessionStorage.setItem('waterData', JSON.stringify(water));
      }
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialization
  useEffect(() => {
    fetchFilters();

    const savedPrefs = sessionStorage.getItem('userPrefs');
    const savedSoaps = sessionStorage.getItem('lastResults');
    const savedWater = sessionStorage.getItem('waterData');

    if (savedPrefs && savedPrefs !== 'null') {
      const parsedPrefs = JSON.parse(savedPrefs);
      setUserPrefs(parsedPrefs);
      if (savedSoaps) setRecommendations(JSON.parse(savedSoaps));
      if (savedWater) setWaterData(JSON.parse(savedWater));
    } else {
      setShowPreferences(true);
      fetchSoaps(null);
    }
  }, [fetchSoaps, fetchFilters]);

  const handleSavePrefs = async (prefs) => {
    if (!prefs) {
      sessionStorage.removeItem('userPrefs');
      sessionStorage.removeItem('lastResults');
      sessionStorage.removeItem('waterData');
      setUserPrefs(null);
      fetchSoaps(null);
      return;
    }
    setUserPrefs(prefs);
    sessionStorage.setItem('userPrefs', JSON.stringify(prefs));
    fetchSoaps(prefs);
  };

  // ── FILTER & SORT ENGINE ──
  const sortedResults = useMemo(() => {
    let filtered = recommendations.filter((match) => {
      const s = match.soap;
      if (!s) return false;

      const searchStr = locationInput.toLowerCase();
      if (
        locationInput.trim() &&
        !s.brand?.toLowerCase().includes(searchStr) &&
        !s.name?.toLowerCase().includes(searchStr)
      )
        return false;

      // SKIN FILTER
      if (activeFilters.skin.length > 0) {
        const hasMatch = activeFilters.skin.some((f) => {
          const normF = f.split(' / ')[0].toLowerCase();
          const suitArray = Array.isArray(s.skin_suitability)
            ? s.skin_suitability.map((x) => x.toLowerCase())
            : [s.skin_suitability?.toLowerCase() || 'all'];
          return suitArray.some(
            (suit) => suit.includes(normF) || suit === 'all'
          );
        });
        if (!hasMatch) return false;
      }

      // SOURCE FILTER
      if (
        activeFilters.source.length > 0 &&
        !activeFilters.source.includes(s.source || 'Natural')
      )
        return false;

      // PH LEVEL FILTER
      if (activeFilters.phLevel.length > 0) {
        const soapPhLabel = getPhLabel(s.ph_level || '9.0');
        if (!activeFilters.phLevel.includes(soapPhLabel)) return false;
      }

      // GOOEYNESS FILTER (Case-Insensitive Fix)
      if (activeFilters.gooFactor.length > 0) {
        const soapGoo = (s.gooeyness_label || 'Average').toLowerCase().trim();
        const isMatch = activeFilters.gooFactor.some(
          (f) => f.toLowerCase().trim() === soapGoo
        );
        if (!isMatch) return false;
      }

      // LONGEVITY FILTER
      if (activeFilters.longevity.length > 0) {
        const properties = s.properties || {};
        const soapLongevity = (properties.longevity || 'medium')
          .toLowerCase()
          .trim();
        const isMatch = activeFilters.longevity.some(
          (f) => f.toLowerCase().trim() === soapLongevity
        );
        if (!isMatch) return false;
      }

      return true;
    });

    return filtered;
  }, [recommendations, locationInput, activeFilters]);

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
      longevity: [],
    });
  };

  return (
    <div className="homepage-wrapper">
      <nav className="nav-bar u-flex u-items-center u-justify-between header-border">
        <div className="logo-text u-flex u-items-center">
          Super Soap Search{' '}
          <span className="logo-attribution">
            Brought to you by SoapStandle®
          </span>
        </div>
        <div className="u-flex u-items-center" style={{ gap: '1.5rem' }}>
          <button
            type="button"
            className="filter-btn"
            onClick={() => setShowPreferences(true)}
            style={{
              fontSize: '0.7rem',
              padding: '0.3rem 0.8rem',
              margin: 0,
              backgroundColor: '#ffffff',
              color: '#e7b45c',
              border: '1px solid #e7b45c',
              fontWeight: '700',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            {userPrefs ? `Profile: ${userPrefs.skinType}` : 'Personalize Hub'}
          </button>
          <div className="breadcrumb-container" style={{ margin: 0 }}>
            <span className="breadcrumb-active">Home</span>
            <span className="breadcrumb-separator">›</span>
            <Link to="/search" className="breadcrumb-parent">
              Soap Search
            </Link>
            <span className="breadcrumb-separator">›</span>
            <Link to="/submit" className="breadcrumb-parent">
              Artisan Page
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero-header hero-centered">
        <p className="hero-eyebrow">
          {waterData
            ? `LOCAL WATER: ${waterData.hardness?.toUpperCase()}`
            : 'NO MORE GOOEY, SLIPPERY BAR SOAP'}
        </p>
        <h1 className="h1-large">Find the Best Soap for You</h1>
      </header>

      <div className="top-filter-bar u-flex u-justify-between">
        <div className="location-input-wrap">
          <span className="location-icon">🔆</span>
          <input
            className="location-input"
            type="text"
            placeholder="Search by Brand or Soap Name"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
        </div>
        <div className="top-filter-bar-right u-flex" style={{ gap: '10px' }}>
          <button
            type="button"
            className={`all-filters-btn ${Object.values(activeFilters).flat().length > 0 ? 'has-active' : ''}`}
            onClick={clearAll}
          >
            <span className="all-filters-icon">≡</span> All Filters
          </button>
          {!filtersLoading &&
            filterGroups.map((group) => (
              <DropdownFilter
                key={group.key}
                label={group.label}
                options={group.options}
                selected={activeFilters[group.key]}
                onToggle={(val) => toggleFilter(group.key, val)}
              />
            ))}
        </div>
      </div>

      <div
        className="results-sort-bar u-flex u-justify-between u-items-center"
        style={{ padding: '0 2.5rem', marginBottom: '1.5rem' }}
      >
        <span
          className="results-label"
          style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}
        >
          {sortedResults.length}{' '}
          {userPrefs ? 'Personalized Match' : 'Total Result'}
          {sortedResults.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="grid-section">
        {loading ? (
          <div className="no-results">
            <p style={{ color: '#e7b45c' }}>Analyzing scientific data...</p>
          </div>
        ) : sortedResults.length > 0 ? (
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
        ) : (
          <div className="no-results">
            <p>No soaps found matching these filters.</p>
          </div>
        )}
      </div>

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePrefs}
      />
      <footer className="technical-footer">
        <p className="footer-oversight">
          Technical Oversight provided by JD Graffam
        </p>
      </footer>
    </div>
  );
};

// Dropdown Helper
const DropdownFilter = ({ label, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="dropdown-filter" ref={ref}>
      <button
        type="button"
        className={`dropdown-trigger ${open || selected.length > 0 ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}{' '}
        {selected.length > 0 && (
          <span className="dropdown-count">{selected.length}</span>
        )}
        <span className="dropdown-arrow">▾</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          {options.map((opt) => (
            <label
              key={opt}
              className="toggle-row"
              onClick={() => onToggle(opt)}
            >
              <span className="toggle-label">{opt}</span>
              <div
                className={`toggle-switch ${selected.includes(opt) ? 'on' : ''}`}
              >
                <div className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

SoapCard.propTypes = {
  match: PropTypes.object.isRequired,
  onCardClick: PropTypes.func.isRequired,
  isPersonalized: PropTypes.bool.isRequired,
};
DropdownFilter.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selected: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default HomePage;
