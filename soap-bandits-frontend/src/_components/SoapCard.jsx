import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getScoreColor } from '../utils/soapHelpers';

const SoapCard = ({ match, onCardClick, isPersonalized }) => {
  const soap = match?.soap || {};
  const score = match?.match_score || 0;
  const metadata = match?.properties || soap?.properties || {};
  const reasons = useMemo(() => match?.reasons || [], [match?.reasons]);

  const hasAllergen = useMemo(() => {
    const userPrefs = JSON.parse(sessionStorage.getItem('userPrefs') || 'null');
    const userAvoids = userPrefs?.avoidIngredients || [];
    if (!isPersonalized || userAvoids.length === 0) return false;
    return reasons.some((reason) => {
      const lowerReason = reason.toLowerCase();
      if (lowerReason.includes('0 avoided') || lowerReason.includes('none'))
        return false;
      return lowerReason.includes('avoid');
    });
  }, [reasons, isPersonalized]);

  const scoreColor = getScoreColor(score, hasAllergen);
  const productImg =
    soap.image_url ||
    soap.img ||
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80';

  const skinLabel = useMemo(() => {
    const rawSkin = metadata.skin_suitability || soap.skin_suitability;
    if (Array.isArray(rawSkin))
      return rawSkin
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(', ');
    return rawSkin || 'All Skin Types';
  }, [metadata.skin_suitability, soap.skin_suitability]);

  const gooeyLabel =
    metadata.gooeyness_label || soap.gooeyness_label || 'Average';

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
        {isPersonalized && match.match_score !== null && (
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
          <span className="stat-value">{skinLabel}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Gooeyness</span>
          <span className="stat-value">{gooeyLabel}</span>
        </div>
      </div>

      <div className="ingredients-section">
        <p
          className="ing-label"
          style={{ color: hasAllergen ? '#e53e3e' : 'inherit' }}
        >
          {hasAllergen
            ? '⚠️ Allergen Alert'
            : isPersonalized
              ? 'Scientific Match'
              : 'Ingredient Profile'}
        </p>
        <div className="ing-pills">
          {reasons.length > 0 ? (
            reasons.slice(0, 2).map((r, i) => (
              <span
                key={i}
                className={`ing-pill ${hasAllergen && r.toLowerCase().includes('avoid') ? 'pill-danger' : ''}`}
              >
                {r}
              </span>
            ))
          ) : (
            <span className="ing-pill">Archive Analysis</span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <button
          type="button"
          className={`btn-add ${hasAllergen ? 'btn-danger' : ''}`}
        >
          View Science
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
