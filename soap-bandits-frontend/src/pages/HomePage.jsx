import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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

// ── MODAL COMPONENT ───────────────────────────────────────────────────────────
const SoapModal = ({ soap, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-img">
          <img src={soap.img} alt={soap.name} />
        </div>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-body">
          <p className="modal-company">{soap.company}</p>
          <h2 className="modal-name">{soap.name}</h2>
          <p className="modal-desc">{soap.desc}</p>
          <div className="modal-grid">
            <div className="modal-stat">
              <span className="stat-label">pH Level</span>
              <span className="stat-value">{soap.ph}</span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Weight</span>
              <span className="stat-value">{soap.weight}</span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Skin Type</span>
              <span className="stat-value">{soap.skin}</span>
            </div>
          </div>
          <p className="modal-ing-label">Full Ingredient List</p>
          <p className="modal-ing-list">{soap.ingredients.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};

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
        <button className="btn-add">View Details</button>
      </div>
    </div>
  );
};

// ── HOMEPAGE COMPONENT ────────────────────────────────────────────────────────
const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSoap, setSelectedSoap] = useState(null);

  const filters = ['all', 'vegan', 'organic', 'charcoal', 'artisan'];

  const filteredSoaps =
    activeFilter === 'all'
      ? soaps
      : soaps.filter((soap) => soap.category === activeFilter);

  return (
    <div className="homepage-wrapper">
      {/* ── TOP NAVIGATION (SCREENSHOT MATCH) ── */}
      <nav className="nav-bar u-flex u-items-center u-justify-between header-border">
        <div className="logo-text u-flex u-items-center">
          Super Soap Search
          <span className="logo-attribution">
            Brought to you by SoapStandle®
          </span>
        </div>

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
      </nav>

      {/* ── HERO (SCREENSHOT MATCH) ── */}
      <header className="hero-header hero-centered">
        <p className="hero-eyebrow">NO MORE GOOEY, SLIPPERY BAR SOAP</p>
        <h1 className="h1-large">Find the Best Soap for You</h1>
      </header>

      {/* Category filter controls */}
      <div className="filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid">
        {filteredSoaps.map((soap) => (
          <SoapCard key={soap.name} soap={soap} onCardClick={setSelectedSoap} />
        ))}
      </div>

      {/* Modal */}
      {selectedSoap && (
        <SoapModal soap={selectedSoap} onClose={() => setSelectedSoap(null)} />
      )}

      {/* Footer */}
      <footer className="technical-footer">
        <p className="footer-oversight">
          Technical Oversight provided by JD Graffam
        </p>
      </footer>
    </div>
  );
};

// PropTypes (Identical to previous)
SoapModal.propTypes = {
  soap: PropTypes.shape({
    img: PropTypes.string,
    name: PropTypes.string,
    company: PropTypes.string,
    desc: PropTypes.string,
    ph: PropTypes.string,
    weight: PropTypes.string,
    skin: PropTypes.string,
    ingredients: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func,
};

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
    ingredients: PropTypes.arrayOf(PropTypes.string),
  }),
  onCardClick: PropTypes.func,
};

export default HomePage;
