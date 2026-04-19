import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import './InfoPage.css';

const API_BASE_URL = 'http://localhost:8000';

// Helper function to generate consistent pastel color from soap ID
const getColorFromId = (id) => {
  const colors = [
    '#FFE5D9',
    '#D9E5FF',
    '#E5FFD9',
    '#FFE5FF',
    '#FFFFE5',
    '#FFD9E5',
    '#E5FFFF',
    '#FFE5CC',
    '#E5CCF2',
    '#CCF2E5',
    '#F2CCE5',
    '#E5F2CC',
    '#CCE5F2',
    '#F2E5CC',
    '#F2CCCC',
  ];

  let hash = 0;
  if (!id) return colors[0];

  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash;
  }

  return colors[Math.abs(hash) % colors.length];
};

const InfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const soap = location.state?.soap;
  const [enrichedData, setEnrichedData] = useState(null);

  // Fetch enriched soap data (ingredients, etc.)
  useEffect(() => {
    if (!soap?.id) return;

    const fetchEnrichedData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/recommendations/soap/${soap.id}`
        );
        const data = await response.json();
        // Some backends wrap the response in a "soap" key
        setEnrichedData(data?.soap || data);
      } catch (err) {
        console.error('Failed to fetch enriched data:', err);
      }
    };

    fetchEnrichedData();
  }, [soap?.id]);

  // ── DATA RECOVERY: RAW FORMULATION ──
  const finalIngredientsRaw = useMemo(() => {
    // 1. Try the string from the latest API fetch
    if (enrichedData?.ingredients_raw) return enrichedData.ingredients_raw;
    // 2. Try the string passed from the Home Page
    if (soap?.ingredients_raw) return soap.ingredients_raw;
    // 3. If the string is missing but we have the array, join them together
    if (enrichedData?.ingredients?.length > 0) {
      return enrichedData.ingredients.map((i) => i.name).join(', ');
    }
    return 'Formulation data is currently being processed.';
  }, [enrichedData, soap]);

  // ── RESTORED: INGREDIENT TYPE BREAKDOWN LOGIC ──
  const typeBreakdown = useMemo(() => {
    const ingredients = enrichedData?.ingredients || [];
    if (ingredients.length === 0) return [];

    const categories = {};
    ingredients.forEach((ing) => {
      if (ing.function) {
        const cat = ing.function.split('/')[0].trim();
        categories[cat] = (categories[cat] || 0) + 1;
      }
    });

    const total = Object.values(categories).reduce((a, b) => a + b, 0);

    return Object.entries(categories)
      .map(([cat, count]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5); // Keep top 5
  }, [enrichedData]);

  // Generate consistent pastel color for this soap
  const bgColor = getColorFromId(soap?.id);

  // If no soap data was passed, redirect home
  if (!soap) {
    return (
      <div className="info-page">
        <p style={{ padding: '2rem', textAlign: 'center' }}>
          No product selected.{' '}
          <button className="info-link-btn" onClick={() => navigate('/')}>
            Go back home
          </button>
        </p>
      </div>
    );
  }

  // Ensure we are pulling from the correct metadata source
  const properties = enrichedData?.properties || soap?.properties || {};

  return (
    <div className="info-page">
      {/* ── NAV ── */}
      <nav className="info-nav">
        <div className="info-nav-logo">
          Super Soap Search
          <span className="info-nav-sub">Brought to you by SoapStandle®</span>
        </div>
      </nav>

      {/* ── BREADCRUMB ── */}
      <div className="info-breadcrumb">
        <Link to="/" className="info-breadcrumb-link">
          Soap Search
        </Link>
        <span className="info-breadcrumb-sep">›</span>
        <span className="info-breadcrumb-active">{soap.name}</span>
      </div>

      {/* ── PRODUCT HERO ── */}
      <section className="info-hero">
        <div className="info-hero-left">
          <p className="info-brand">{soap.brand}</p>
          <h1 className="info-title">{soap.name}</h1>
          <p className="info-desc">
            {soap.desc ||
              'A scientific formulation analyzed for compatibility and skin health.'}
          </p>

          <div className="info-tags">
            {properties.skin_suitability && (
              <span className="info-tag">
                {Array.isArray(properties.skin_suitability)
                  ? properties.skin_suitability.join(', ')
                  : properties.skin_suitability}
              </span>
            )}
            {properties.gooeyness_label && (
              <span className="info-tag">{properties.gooeyness_label}</span>
            )}
            <span className="info-tag">Verification: Lab Tested</span>
          </div>

          {/* ── PRODUCT DETAILS INLINE ── */}
          {properties && (
            <div className="info-details-inline">
              <div className="info-details-grid">
                <div className="info-detail-card">
                  <span className="info-detail-label">Gooeyness</span>
                  <span className="info-detail-value">
                    {properties.gooeyness_label || 'Average'}
                  </span>
                </div>
                <div className="info-detail-card">
                  <span className="info-detail-label">Water Compatibility</span>
                  <span className="info-detail-value">
                    {properties.water_compatibility || 'Universal'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="info-hero-right">
          <div className="info-img-card" style={{ backgroundColor: bgColor }}>
            <span className="info-img-featured">Scientific Analysis</span>
            <div style={{ fontSize: '120px', marginBottom: '1rem' }}>🧼</div>
            <p style={{ fontSize: '18px', color: '#666', fontWeight: '500' }}>
              {soap.brand}
            </p>
          </div>
        </div>
      </section>

      {/* ── INGREDIENTS SECTION ── */}
      <section className="info-ingredients-section">
        <h2 className="info-ingredients-title">Ingredients</h2>

        <div className="info-ingredients-container">
          {/* Left Column: Raw Ingredients List */}
          <div className="info-ingredients-column">
            <h3 className="info-column-title">Full Formulation</h3>
            <p className="info-ingredients-raw">{finalIngredientsRaw}</p>

            {/* Ingredient Breakdown */}
            {typeBreakdown.length > 0 && (
              <div
                className="info-ingredient-breakdown"
                style={{ marginTop: '2rem' }}
              >
                <h4 className="info-breakdown-title">Ingredient Types</h4>
                <div className="info-breakdown-list">
                  {typeBreakdown.map((item) => (
                    <div key={item.name} className="info-breakdown-item">
                      <span className="info-breakdown-label">{item.name}</span>
                      <span className="info-breakdown-percent">
                        {item.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Ingredient Functions */}
          <div className="info-ingredients-column">
            <h3 className="info-column-title">What Each Does</h3>
            <div className="info-ingredient-list">
              {enrichedData?.ingredients &&
              enrichedData.ingredients.length > 0 ? (
                enrichedData.ingredients.map((ing, idx) => (
                  <div key={idx} className="info-ingredient-item">
                    <span className="info-ingredient-name">{ing.name}</span>
                    {ing.function && (
                      <span className="info-ingredient-function">
                        {ing.function}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Functional analysis is loading...
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHERE TO BUY ── */}
      <section className="info-retailers-section">
        <h2 className="info-retailers-title">Available Online</h2>
        <div className="amazon-banner">
          <div className="amazon-banner-left">
            <span className="amazon-badge">ONLINE RETAILER</span>
            <h3 className="amazon-name">amazon</h3>
            <p className="amazon-sub">
              Fast &amp; reliable delivery straight to your door
            </p>
          </div>
          <div className="amazon-banner-divider" />
          <div className="amazon-banner-right">
            <a
              className="amazon-purchase-btn"
              href={
                soap.buy_link ||
                `https://www.amazon.com/s?k=${encodeURIComponent(
                  soap.name + ' ' + soap.brand
                )}`
              }
              target="_blank"
              rel="noreferrer"
            >
              Purchase on Amazon ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="info-cta-banner">
        <p className="info-cta-text">Are you a SoapStandle® Fan?</p>
        <Link to="/submit" className="info-cta-btn">
          VISIT US →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="info-footer">
        <p className="info-footer-copy">
          © Super Soap Search — Technical Oversight by JD Graffam
        </p>
      </footer>
    </div>
  );
};

export default InfoPage;
