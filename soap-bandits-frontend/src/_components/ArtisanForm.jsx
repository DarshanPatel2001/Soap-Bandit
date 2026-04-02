import { useState } from 'react';
import './ArtisanForm.css';

const ArtisanForm = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMockSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="form-wrapper">
        <div
          className="pillar-card"
          style={{ textAlign: 'center', padding: '4rem' }}
        >
          <h3 style={{ fontSize: '1.5rem' }}>Submission Received</h3>
          <p>
            Your technical specs and contact info have been sent for review.
          </p>
          <div
            style={{
              margin: '2rem 0',
              padding: '1rem',
              border: '1px solid var(--soap-gold)',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Status:{' '}
              <span style={{ color: 'var(--soap-gold)', fontWeight: 'bold' }}>
                Pending Technical Audit
              </span>
            </span>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="cta-button"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Submit Another Bar
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="form-wrapper" id="brandForm">
      <form className="artisan-form" onSubmit={handleMockSubmit}>
        {/* Section 1: Contact Information */}
        <div className="pillar-card form-card">
          <h3>Maker Contact Details</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="First and Last Name"
              className="input-field"
              required
            />
          </div>
          <div className="u-grid u-grid-md-3" style={{ gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="maker@example.com"
                className="input-field"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="(555) 555-5555"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identity */}
        <div className="pillar-card form-card">
          <h3>Brand & Product Identity</h3>
          <div className="u-grid u-grid-md-3" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                placeholder="e.g., Smoky Mountain Soaps"
                className="input-field"
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g., Lavender Calm Bar"
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Value Metrics*/}
        <div className="pillar-card form-card">
          <h3>Size & Value (MSRP)</h3>
          <div className="u-flex" style={{ gap: '2rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Weight (oz)</label>
              <input
                type="number"
                step="0.1"
                placeholder="4.5"
                className="input-field"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>MSRP ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="8.00"
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Scientific Data*/}
        <div className="pillar-card form-card">
          <h3>Scientific Grounding</h3>
          <div className="form-group">
            <label>Full Ingredient List (INCI Preferred)</label>
            <textarea
              placeholder="Sodium Cocoate, Water, Glycerin..."
              className="input-field"
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>Known Allergens or Irritants</label>
            <textarea
              placeholder="e.g., Linalool, Limonene..."
              className="input-field"
              rows="2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="search-button"
          style={{ width: '100%', borderRadius: '4px' }}
        >
          SUBMIT FOR TECHNICAL REVIEW
        </button>
      </form>
    </section>
  );
};

export default ArtisanForm;
