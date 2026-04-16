import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getScoreColor } from '../utils/soapHelpers';

const SoapCard = ({ match, onCardClick, isPersonalized }) => {
  const soap = match?.soap || {};
  const score = match?.match_score || 0;

  // FIX: Memoize the reasons array so it doesn't create a new reference on every render
  const reasons = useMemo(() => match?.reasons || [], [match?.reasons]);

  // Determine if there is an actual allergen
  const hasAllergen = useMemo(() => {
    // Moved inside the useMemo to prevent reference changes on every render
    const userPrefs = JSON.parse(sessionStorage.getItem('userPrefs') || 'null');
    const userAvoids = userPrefs?.avoidIngredients || [];

    // If no personalized preferences or no avoided ingredients, it can't be an allergen
    if (!isPersonalized || userAvoids.length === 0) {
      return false;
    }

    // Check if the reasons indicate an avoided ingredient is present
    return reasons.some((reason) => {
      const lowerReason = reason.toLowerCase();

      // Explicitly ignore conversational false positives
      if (lowerReason.includes('0 avoided') || lowerReason.includes('none')) {
        return false;
      }

      // Check for the word "avoid" in the reason
      return lowerReason.includes('avoid');
    });
  }, [reasons, isPersonalized]);

  const scoreColor = getScoreColor(score, hasAllergen);

  const productImg =
    soap.image_url ||
    soap.img ||
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80';

  return (
    <div
      className={`card ${hasAllergen ? 'card-danger' : ''}`}
      onClick={() => onCardClick(soap)}
    >
      <div className="card-img">
        <img src={productImg} alt={soap.name} loading="lazy" />
        {isPersonalized && hasAllergen && (
          <div className="allergen-overlay">ALLERGEN DETECTED</div>
        )}
        <span className="card-tag tag-artisan">
          {soap.brand?.toUpperCase()}
        </span>

        {isPersonalized && (
          <div className="ph-badge" style={{ background: scoreColor }}>
            <span className="ph-label">{hasAllergen ? 'DANGER' : 'Match'}</span>
            <span
              className="ph-value"
              style={{ color: score < 75 || hasAllergen ? '#fff' : 'inherit' }}
            >
              {score}%
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        <p className="card-company">{soap.brand}</p>
        <h2 className="card-name">{soap.name}</h2>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Skin Type</span>
          <span className="stat-value">{soap.skin_suitability || 'All'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Gooeyness</span>
          <span className="stat-value">
            {soap.gooeyness_label || 'Average'}
          </span>
        </div>
      </div>

      <div className="ingredients-section">
        <p
          className="ing-label"
          style={{ color: hasAllergen ? '#e53e3e' : 'inherit' }}
        >
          {hasAllergen ? '⚠️ Allergen Alert' : 'Scientific Match'}
        </p>
        <div className="ing-pills">
          {reasons.slice(0, 2).map((r, i) => {
            // Apply danger styling only to reasons that actually flag an allergen
            const isDangerReason =
              hasAllergen && r.toLowerCase().includes('avoid');

            return (
              <span
                key={i}
                className={`ing-pill ${isDangerReason ? 'pill-danger' : ''}`}
              >
                {r}
              </span>
            );
          })}
        </div>
      </div>

      <div className="card-footer">
        <button
          type="button"
          className={`btn-add ${hasAllergen ? 'btn-danger' : ''}`}
        >
          View Info
        </button>
      </div>
    </div>
  );
};

SoapCard.propTypes = {
  match: PropTypes.object.isRequired,
  onCardClick: PropTypes.func.isRequired,
  isPersonalized: PropTypes.bool.isRequired,
};

export default SoapCard;
