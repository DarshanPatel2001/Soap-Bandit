import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import PreferencesModal from '../_modals/PreferencesModal';
import './HomePage.css';

// ── DATA ──────────────────────────────────────────────────────────────────────
const soaps = [
  {
    name: 'Lavender Fields',
    company: 'Terra Naturals',
    category: 'vegan',
    tag: 'Vegan',
    tagClass: 'tag-vegan',
    price: '$12.50',
    ph: '9.2',
    weight: '120g',
    skin: 'All Types',
    scent: 'Floral',
    source: 'Plant-Based',
    phLevel: 'High (9.1+)',
    gooFactor: 'Very Firm',
    longevity: '4–6 weeks',
    desc: 'A gentle bar hand-crafted with pure lavender essential oil and colloidal oatmeal. Soothes stressed skin and leaves a delicate lingering fragrance.',
    ingredients: [
      'Sodium Olivate',
      'Aqua',
      'Lavandula Angustifolia Oil',
      'Avena Sativa',
      'Glycerin',
      'Citric Acid',
      'Linalool',
    ],
    img: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee7694?w=600&q=80',
  },
  {
    name: 'Midnight Charcoal',
    company: 'Black Ember Co.',
    category: 'charcoal',
    tag: 'Charcoal',
    tagClass: 'tag-charcoal',
    price: '$14.00',
    ph: '8.5',
    weight: '100g',
    skin: 'Oily / Acne',
    scent: 'Earthy',
    source: 'Natural',
    phLevel: 'Medium (8.6–9.0)',
    gooFactor: 'Firm',
    longevity: '3–4 weeks',
    desc: 'Activated bamboo charcoal draws out impurities and excess oil. Tea tree oil provides natural antibacterial defense for a clarifying deep cleanse.',
    ingredients: [
      'Sodium Cocoate',
      'Activated Charcoal',
      'Melaleuca Alternifolia Oil',
      'Shea Butter',
      'Glycerin',
      'Vitamin E',
      'Aqua',
    ],
    img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  },
  {
    name: 'Rose & Kaolin',
    company: 'Bloom Atelier',
    category: 'organic',
    tag: 'Organic',
    tagClass: 'tag-organic',
    price: '$15.75',
    ph: '9.5',
    weight: '115g',
    skin: 'Sensitive',
    scent: 'Rosy',
    source: 'Organic',
    phLevel: 'High (9.1+)',
    gooFactor: 'Average',
    longevity: '6+ weeks',
    desc: 'Velvety kaolin clay blended with Bulgarian rose otto and rosehip seed oil. Exceptionally gentle — perfect for reactive and mature skin types.',
    ingredients: [
      'Sodium Olivate',
      'Kaolin Clay',
      'Rosa Damascena Oil',
      'Rosa Canina Seed Oil',
      'Glycerin',
      'Geraniol',
      'Citronellol',
    ],
    img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
  },
  {
    name: 'Forest Resin',
    company: 'Woodsfolk Apothecary',
    category: 'artisan',
    tag: 'Artisan',
    tagClass: 'tag-artisan',
    price: '$16.00',
    ph: '8.8',
    weight: '130g',
    skin: 'Dry / Normal',
    scent: 'Woody',
    source: 'Natural',
    phLevel: 'Medium (8.6–9.0)',
    gooFactor: 'Very Gooey',
    longevity: '4–6 weeks',
    desc: 'A rugged yet luxurious bar infused with pine tar, cedarwood, and frankincense resin. Deeply conditioning with a primal, forest-floor scent.',
    ingredients: [
      'Sodium Palmate',
      'Pine Tar',
      'Cedrus Atlantica Oil',
      'Boswellia Sacra Resin',
      'Castor Oil',
      'Glycerin',
      'Tocopherol',
    ],
    img: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
  },
  {
    name: 'Citrus Bloom',
    company: 'Terra Naturals',
    category: 'vegan',
    tag: 'Vegan',
    tagClass: 'tag-vegan',
    price: '$11.00',
    ph: '9.0',
    weight: '110g',
    skin: 'All Types',
    scent: 'Citrus',
    source: 'Plant-Based',
    phLevel: 'Medium (8.6–9.0)',
    gooFactor: 'Firm',
    longevity: '3–4 weeks',
    desc: 'Cold-process bar bursting with sweet orange, lemon zest, and calendula petals. A cheerful morning bar that energizes and brightens your routine.',
    ingredients: [
      'Sodium Cocoate',
      'Citrus Sinensis Oil',
      'Citrus Limon Peel',
      'Calendula Officinalis Extract',
      'Glycerin',
      'Aqua',
      'Limonene',
    ],
    img: 'https://images.unsplash.com/photo-1583864697784-a0efc8379f70?w=600&q=80',
  },
  {
    name: 'Raw Honey & Oat',
    company: 'Bloom Atelier',
    category: 'organic',
    tag: 'Organic',
    tagClass: 'tag-organic',
    price: '$13.50',
    ph: '9.1',
    weight: '125g',
    skin: 'Dry / Mature',
    scent: 'Sweet',
    source: 'Organic',
    phLevel: 'High (9.1+)',
    gooFactor: 'Gooey',
    longevity: '6+ weeks',
    desc: 'Raw wildflower honey and colloidal oatmeal unite in this supremely moisturizing bar. Gently exfoliates while locking in natural moisture for soft, supple skin.',
    ingredients: [
      'Sodium Olivate',
      'Mel (Honey)',
      'Avena Sativa Kernel Flour',
      'Beeswax',
      'Tocopheryl Acetate',
      'Glycerin',
      'Aqua',
    ],
    img: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
  },
];

const FILTER_GROUPS = [
  {
    key: 'skin',
    label: 'Skin Type',
    options: [
      'All Types',
      'Oily / Acne',
      'Sensitive',
      'Dry / Normal',
      'Dry / Mature',
    ],
  },
  {
    key: 'source',
    label: 'Source',
    options: ['Organic', 'Plant-Based', 'Natural'],
  },
  {
    key: 'phLevel',
    label: 'pH Level',
    options: ['Low (≤8.5)', 'Medium (8.6–9.0)', 'High (9.1+)'],
  },
  {
    key: 'gooFactor',
    label: 'Goo Factor',
    options: ['Very Firm', 'Firm', 'Average', 'Gooey', 'Very Gooey'],
  },
];

// ── CARD COMPONENT ────────────────────────────────────────────────────────────
const SoapCard = ({ soap, onCardClick }) => {
  const shortDesc =
    soap.desc.length > 100 ? soap.desc.slice(0, 100) + '…' : soap.desc;
  return (
    <div className="card" onClick={() => onCardClick(soap)}>
      <div className="card-img">
        <img src={soap.img} alt={soap.name} loading="lazy" />
        <span className={`card-tag ${soap.tagClass}`}>{soap.tag}</span>
        <div className="ph-badge">
          <span className="ph-label">pH</span>
          <span className="ph-value">{soap.ph}</span>
        </div>
      </div>
      <div className="card-body">
        <p className="card-company">{soap.company}</p>
        <h2 className="card-name">{soap.name}</h2>
        <p className="card-desc">{shortDesc}</p>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">Weight</span>
          <span className="stat-value">{soap.weight}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Skin</span>
          <span className="stat-value">{soap.skin.split('/')[0].trim()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Scent</span>
          <span className="stat-value">{soap.scent}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Longevity</span>
          <span className="stat-value">{soap.longevity}</span>
        </div>
      </div>
      <div className="ingredients-section">
        <p className="ing-label">Key Ingredients</p>
        <div className="ing-pills">
          {soap.ingredients.slice(0, 4).map((ing) => (
            <span key={ing} className="ing-pill">
              {ing}
            </span>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <span className="card-price">{soap.price}</span>
        <button
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

// ── DROPDOWN FILTER ───────────────────────────────────────────────────────────
const DropdownFilter = ({ label, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = selected.length;

  return (
    <div className="dropdown-filter" ref={ref}>
      <button
        className={`dropdown-trigger ${open || activeCount > 0 ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        {activeCount > 0 && (
          <span className="dropdown-count">{activeCount}</span>
        )}
        <span className="dropdown-arrow">▾</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          {options.map((opt) => {
            const isOn = selected.includes(opt);
            return (
              <label
                key={opt}
                className="toggle-row"
                onClick={() => onToggle(opt)}
              >
                <span className="toggle-label">{opt}</span>
                <div className={`toggle-switch ${isOn ? 'on' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── HOMEPAGE COMPONENT ────────────────────────────────────────────────────────
const HomePage = () => {
  // --- COMBINED STATE ---
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPrefs, setUserPrefs] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState({
    skin: [],
    source: [],
    phLevel: [],
    gooFactor: [],
  });

  const navigate = useNavigate();

  // --- MODAL LOGIC (Auto-open on land) ---
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('soapPreferencesSeen');
    if (!hasSeenModal) {
      setShowPreferences(true);
      sessionStorage.setItem('soapPreferencesSeen', 'true');
    }
  }, []);

  const handleSavePrefs = (prefs) => {
    setUserPrefs(prefs);
    // Logic can be added here to pre-set activeFilters.skin based on prefs.skinType
    console.log('Preferences saved:', prefs);
  };

  // --- FILTER HANDLERS ---
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
    });
  };

  const totalActive = Object.values(activeFilters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // --- FILTERING & SORTING LOGIC ---
  const filteredSoaps = soaps.filter((soap) => {
    if (
      locationInput.trim() &&
      !soap.company.toLowerCase().includes(locationInput.toLowerCase()) &&
      !soap.name.toLowerCase().includes(locationInput.toLowerCase())
    )
      return false;
    if (
      activeFilters.skin.length > 0 &&
      !activeFilters.skin.includes(soap.skin)
    )
      return false;
    if (
      activeFilters.source.length > 0 &&
      !activeFilters.source.includes(soap.source)
    )
      return false;
    if (
      activeFilters.phLevel.length > 0 &&
      !activeFilters.phLevel.includes(soap.phLevel)
    )
      return false;
    if (
      activeFilters.gooFactor.length > 0 &&
      !activeFilters.gooFactor.includes(soap.gooFactor)
    )
      return false;
    return true;
  });

  const sortedSoaps = [...filteredSoaps].sort((a, b) => {
    const priceA = parseFloat(a.price.replace('$', ''));
    const priceB = parseFloat(b.price.replace('$', ''));
    if (sortBy === 'low-high') return priceA - priceB;
    if (sortBy === 'high-low') return priceB - priceA;
    return 0;
  });

  const handleCardClick = (soap) => {
    navigate('/product', { state: { soap } });
  };

  return (
    <div className="homepage-wrapper">
      {/* ── TOP NAVIGATION ── */}
      <nav className="nav-bar u-flex u-items-center u-justify-between header-border">
        <div className="logo-text u-flex u-items-center">
          Super Soap Search
          <span className="logo-attribution">
            Brought to you by SoapStandle®
          </span>
        </div>

        <div className="u-flex u-items-center" style={{ gap: '1.5rem' }}>
          {/* Personalization Button from Modal Logic */}
          <button
            className="filter-btn"
            onClick={() => setShowPreferences(true)}
            style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', margin: 0 }}
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

      {/* ── HERO ── */}
      <header className="hero-header hero-centered">
        <p className="hero-eyebrow">NO MORE GOOEY, SLIPPERY BAR SOAP</p>
        <h1 className="h1-large">Find the Best Soap for You</h1>
      </header>

      {/* ── FILTER BAR ── */}
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
            className={`all-filters-btn ${totalActive > 0 ? 'has-active' : ''}`}
            onClick={clearAll}
          >
            <span className="all-filters-icon">≡</span>
            All Filters
            {totalActive > 0 && (
              <span className="all-filters-count">{totalActive}</span>
            )}
          </button>

          {FILTER_GROUPS.map((group) => (
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

      {/* ── RESULTS / SORT BAR ── */}
      <div className="results-sort-bar">
        <span className="results-label">
          {sortedSoaps.length} result{sortedSoaps.length !== 1 ? 's' : ''}
        </span>
        <div className="sort-wrap">
          <span className="sort-label">Sort by:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ── CARD GRID ── */}
      <div className="grid-section">
        {sortedSoaps.length > 0 ? (
          <div className="grid">
            {sortedSoaps.map((soap) => (
              <SoapCard
                key={soap.name}
                soap={soap}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No soaps match your current filters.</p>
            <button className="clear-btn-large" onClick={clearAll}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Preferences Modal Component */}
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

// --- PROPTYPES ---
SoapCard.propTypes = {
  soap: PropTypes.shape({
    img: PropTypes.string,
    name: PropTypes.string,
    company: PropTypes.string,
    desc: PropTypes.string,
    ph: PropTypes.string,
    weight: PropTypes.string,
    skin: PropTypes.string,
    scent: PropTypes.string,
    tag: PropTypes.string,
    tagClass: PropTypes.string,
    price: PropTypes.string,
    longevity: PropTypes.string,
    source: PropTypes.string,
    phLevel: PropTypes.string,
    gooFactor: PropTypes.string,
    ingredients: PropTypes.arrayOf(PropTypes.string),
  }),
  onCardClick: PropTypes.func,
};

DropdownFilter.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.arrayOf(PropTypes.string),
  onToggle: PropTypes.func,
};

export default HomePage;
