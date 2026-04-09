import { useLocation, useNavigate, Link } from 'react-router-dom';
import './InfoPage.css';

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
