import { useLocation, useNavigate, Link } from 'react-router-dom';
import './InfoPage.css';

// Mock retailers — in a real app these would come from an API
const MOCK_RETAILERS = [
  {
    type: 'Online',
    name: 'NaturalSoaps.com',
    price: '$22.80',
    featured: false,
  },
  {
    type: 'Retailer Type',
    name: 'GreenLeaf Market',
    price: '$22.80',
    featured: true,
  },
  { type: 'Retailer Type', name: 'EcoStore', price: '$22.80', featured: false },
  {
    type: 'Retailer Type',
    name: 'Whole Foods',
    price: '$22.80',
    featured: false,
  },
  { type: 'Retailer Type', name: 'Target', price: '$22.80', featured: false },
  {
    type: 'Retailer Type',
    name: 'Sprouts Market',
    price: '$22.80',
    featured: false,
  },
];

const InfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const soap = location.state?.soap;

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
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="info-announce-bar">
        <p className="info-announce-text">
          Announcement bar paragraph small text. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit.
        </p>
        <button className="info-announce-close" aria-label="Close">
          ✕
        </button>
      </div>

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
          <p className="info-price-label">
            Published prices from <strong>{soap.price}</strong>
          </p>
          <div className="info-tags">
            {soap.skin && <span className="info-tag">{soap.skin}</span>}
            {soap.scent && <span className="info-tag">{soap.scent}</span>}
            {soap.ph && <span className="info-tag">pH {soap.ph}</span>}
            {soap.weight && <span className="info-tag">{soap.weight}</span>}
          </div>
        </div>
        <div className="info-hero-right">
          <div className="info-img-card">
            <span className="info-img-featured">Featured</span>
            <img src={soap.img} alt={soap.name} className="info-img" />
          </div>
        </div>
      </section>

      {/* ── RETAILERS SECTION ── */}
      <section className="info-retailers-section">
        <h2 className="info-retailers-title">
          Available at these online &amp; in-store retailers
        </h2>
        <div className="info-retailers-grid">
          {MOCK_RETAILERS.map((r, i) => (
            <div key={i} className="info-retailer-card">
              <p className="info-retailer-type">{r.type}</p>
              <p className="info-retailer-name">{r.name}</p>
              <p className="info-retailer-price">Published prices from</p>
              <p className="info-retailer-amount">{r.price}</p>
              <button
                className={`info-purchase-btn ${r.featured ? 'info-purchase-btn--featured' : ''}`}
              >
                PURCHASE ↗
              </button>
            </div>
          ))}
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
