import { useState } from 'react';
import PropTypes from 'prop-types';

const PreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [zip, setZip] = useState('');
  const [skinType, setSkinType] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ zip, skinType });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal onboarding-modal">
        <button className="modal-close" onClick={onClose}>
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
            soap performs.
            <strong> Hard water</strong> can strip oils, while{' '}
            <strong>Soft water</strong> can leave a film. We use your location
            and skin type to calculate the best moisture-to-cleansing ratio for
            you.
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
                placeholder="e.g. 37774"
                className="search-input"
                required
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  marginBottom: '2rem',
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

            <button
              type="button"
              className="breadcrumb-link"
              onClick={onClose}
              style={{
                display: 'block',
                margin: '1rem auto',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              I&apos;ll explore on my own first
            </button>
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
