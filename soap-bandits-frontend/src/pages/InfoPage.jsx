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
      <section
        style={{
          padding: '2.5rem 2.5rem',
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              marginBottom: '0.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {soap.brand}
          </p>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              color: '#0f172a',
            }}
          >
            {soap.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {soap.properties?.skin_suitability?.length > 0
              ? `Best for ${soap.properties.skin_suitability.join(', ')} skin`
              : 'Suitable for all skin types'}
          </p>
        </div>
        <div style={{ width: '140px', flexShrink: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&q=80"
            alt={soap.name}
            style={{ width: '100%', height: 'auto', borderRadius: '6px' }}
          />
        </div>
      </section>

      {/* ── PRODUCT DETAILS ── */}
      <section style={{ padding: '2rem 2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {soap.ph_level && (
            <div
              style={{
                padding: '1.2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                }}
              >
                pH
              </p>
              <p
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#1e293b',
                }}
              >
                {soap.ph_level}
              </p>
            </div>
          )}
          {soap.properties?.longevity && (
            <div
              style={{
                padding: '1.2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                }}
              >
                Longevity
              </p>
              <p
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  textTransform: 'capitalize',
                }}
              >
                {soap.properties.longevity}
              </p>
            </div>
          )}
          {soap.properties?.gooeyness_label && (
            <div
              style={{
                padding: '1.2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                }}
              >
                Gooeyness
              </p>
              <p
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#1e293b',
                }}
              >
                {soap.properties.gooeyness_label}
              </p>
            </div>
          )}
          {soap.source && (
            <div
              style={{
                padding: '1.2rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                }}
              >
                Source
              </p>
              <p
                style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#1e293b',
                }}
              >
                {soap.source}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── RAW INGREDIENTS ── */}
      {soap.ingredients_raw && (
        <section
          style={{ padding: '2rem 2.5rem', borderTop: '1px solid #e2e8f0' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Raw Ingredients
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {soap.ingredients_raw.split(',').map((ingredient, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0f5f9',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                }}
              >
                {ingredient.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── PURCHASE LINK ── */}
      {soap.buy_link && (
        <section
          style={{
            padding: '2.5rem 2.5rem',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <a
            href={soap.buy_link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              backgroundColor: '#e7b45c',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#d4a04a')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#e7b45c')}
          >
            Find on Amazon ↗
          </a>
        </section>
      )}

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
