import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
        setEnrichedData(data);
      } catch (err) {
        console.error('Failed to fetch enriched data:', err);
      }
    };

    fetchEnrichedData();
  }, [soap?.id]);

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

  return (
    <div className="info-page">
      {/* ── NAV ── */}
      <nav className="info-nav">
        <div className="info-nav-logo">
          Super Soap Search
          <span className="info-nav-sub">Brought to you by SoapStandle®</span>
        </div>
        <Link to="/submit" className="info-nav-cta">
          ONLINE SOAP COURSE ↗
        </Link>
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
          <p className="info-brand">{soap.company}</p>
          <h1 className="info-title">{soap.name}</h1>
          <p className="info-desc">{soap.desc}</p>
          <div className="info-tags">
            {soap.skin && <span className="info-tag">{soap.skin}</span>}
            {soap.scent && <span className="info-tag">{soap.scent}</span>}
            {soap.ph && <span className="info-tag">pH {soap.ph}</span>}
            {soap.weight && <span className="info-tag">{soap.weight}</span>}
          </div>

          {/* ── PRODUCT DETAILS INLINE ── */}
          {enrichedData?.properties && (
            <div className="info-details-inline">
              <div className="info-details-grid">
                {enrichedData.properties.gooeyness_label && (
                  <div className="info-detail-card">
                    <span className="info-detail-label">Gooeyness</span>
                    <span className="info-detail-value">
                      {enrichedData.properties.gooeyness_label}
                    </span>
                  </div>
                )}
                {enrichedData.properties.skin_suitability && (
                  <div className="info-detail-card">
                    <span className="info-detail-label">Skin Suitability</span>
                    <span className="info-detail-value">
                      {Array.isArray(enrichedData.properties.skin_suitability)
                        ? enrichedData.properties.skin_suitability.join(', ')
                        : enrichedData.properties.skin_suitability}
                    </span>
                  </div>
                )}
                {enrichedData.properties.water_compatibility && (
                  <div className="info-detail-card">
                    <span className="info-detail-label">
                      Water Compatibility
                    </span>
                    <span className="info-detail-value">
                      {enrichedData.properties.water_compatibility}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="info-hero-right">
          <div className="info-img-card" style={{ backgroundColor: bgColor }}>
            <span className="info-img-featured">Featured</span>
            <div style={{ fontSize: '120px', marginBottom: '1rem' }}>🧼</div>
            <p style={{ fontSize: '18px', color: '#666', fontWeight: '500' }}>
              {soap.company}
            </p>
          </div>
        </div>
      </section>
      {/* ── INGREDIENTS SECTION ── */}
      {enrichedData?.ingredients_raw && (
        <section className="info-ingredients-section">
          <h2 className="info-ingredients-title">Ingredients</h2>

          <div className="info-ingredients-container">
            {/* Left Column: Raw Ingredients List */}
            <div className="info-ingredients-column">
              <h3 className="info-column-title">Full List</h3>
              <p className="info-ingredients-raw">
                {enrichedData.ingredients_raw}
              </p>

              {/* Ingredient Breakdown */}
              {enrichedData?.ingredients &&
                enrichedData.ingredients.length > 0 && (
                  <div className="info-ingredient-breakdown">
                    <h4 className="info-breakdown-title">Ingredient Types</h4>
                    {(() => {
                      const categories = {};
                      enrichedData.ingredients.forEach((ing) => {
                        if (ing.function) {
                          const category = ing.function.split('/')[0].trim();
                          categories[category] =
                            (categories[category] || 0) + 1;
                        }
                      });

                      const total = Object.values(categories).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const sorted = Object.entries(categories)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      return (
                        <div className="info-breakdown-list">
                          {sorted.map(([cat, count]) => (
                            <div key={cat} className="info-breakdown-item">
                              <span className="info-breakdown-label">
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </span>
                              <span className="info-breakdown-percent">
                                {Math.round((count / total) * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
            </div>

            {/* Right Column: Ingredient Functions */}
            {enrichedData?.ingredients &&
              enrichedData.ingredients.length > 0 && (
                <div className="info-ingredients-column">
                  <h3 className="info-column-title">What Each Does</h3>
                  <div className="info-ingredient-list">
                    {enrichedData.ingredients.map((ing, idx) => (
                      <div key={idx} className="info-ingredient-item">
                        <span className="info-ingredient-name">{ing.name}</span>
                        {ing.function && (
                          <span className="info-ingredient-function">
                            {ing.function}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}
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
            <p className="amazon-price-label">Published prices from</p>
            <p className="amazon-price-amount">{soap.price}</p>
            <a
              className="amazon-purchase-btn"
              href={`https://www.amazon.com/s?k=${encodeURIComponent(
                soap.name + ' ' + soap.company
              )}`}
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
          © Super Soap Search — Brought to you by SoapStandle®. All rights
          reserved, unless otherwise attributed.{' '}
          <Link to="/" className="info-footer-link">
            Contact
          </Link>
        </p>
        <Link to="/submit" className="info-nav-cta info-footer-cta">
          ONLINE SOAP COURSE ↗
        </Link>
      </footer>
    </div>
  );
};

export default InfoPage;
