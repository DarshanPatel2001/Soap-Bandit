import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [zip, setZip] = useState('');
  const [skinType, setSkinType] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem('userPrefs');
      if (saved && saved !== 'null') {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setZip(parsed.zip || '');
            setSkinType(parsed.skinType || '');
          }
        } catch (e) {
          console.error('Failed to parse prefs', e);
        }
      } else {
        setZip('');
        setSkinType('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ zip, skinType });
    onClose();
  };

  const handleClear = () => {
    setZip('');
    setSkinType('');
    sessionStorage.removeItem('userPrefs');
    sessionStorage.removeItem('lastResults');
    sessionStorage.removeItem('waterData');
    onSave(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal onboarding-modal">
        <button type="button" className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-body">
          <div
            className="logo-text u-flex u-items-center"
            style={{ marginBottom: '1rem' }}
          >
            Super Soap Search{' '}
            <span className="logo-attribution">Onboarding</span>
          </div>

          <h2 className="modal-name">Let&apos;s Find Your Perfect Bar</h2>

          <p className="modal-desc">
            Water hardness and skin chemistry are the two biggest factors in how
            soap performs. We use your location and skin type to calculate the
            best moisture-to-cleansing ratio for you.
          </p>

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="form-group">
              <label className="modal-ing-label">Your Skin Type</label>
              <select
                className="search-input"
                required
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  marginBottom: '1.5rem',
                  padding: '0.8rem',
                }}
              >
                <option value="" disabled>
                  Select skin type...
                </option>
                <option value="All Types">All Types</option>
                <option value="Oily / Acne">Oily / Acne</option>
                <option value="Sensitive">Sensitive</option>
                <option value="Dry / Normal">Dry / Normal</option>
                <option value="Dry / Mature">Dry / Mature</option>
              </select>
            </div>

            <div className="form-group">
              <label className="modal-ing-label">Your Zip Code</label>
              <input
                type="text"
                placeholder="e.g. 37201"
                className="search-input"
                required
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  marginBottom: '2rem',
                  padding: '0.8rem',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-add"
              style={{ width: '100%', height: '3.5rem', fontSize: '1rem' }}
            >
              Personalize My Hub
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                className="breadcrumb-link"
                onClick={handleClear}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#e53e3e',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                }}
              >
                Reset & Clear Preferences
              </button>
              <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
              <button
                type="button"
                className="breadcrumb-link"
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                }}
              >
                Keep Exploring
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

PreferencesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PreferencesModal;
