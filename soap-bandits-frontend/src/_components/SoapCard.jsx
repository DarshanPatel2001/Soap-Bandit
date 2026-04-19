import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getScoreColor } from '../utils/soapHelpers';

// ── HELPER: Generate consistent pastel color from soap ID ──
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

const SoapCard = ({ match, onCardClick, isPersonalized }) => {
  const soap = match?.soap || {};
  const score = match?.match_score || 0;
  const metadata = match?.properties || soap?.properties || {};
  const reasons = useMemo(() => match?.reasons || [], [match?.reasons]);

  const bgColor = useMemo(() => getColorFromId(soap.id), [soap.id]);

  // Since filters remove allergens, we assume every soap reaching this point is safe.
  const scoreColor = getScoreColor(score, false);

  const skinLabel = useMemo(() => {
    const rawSkin = metadata.skin_suitability || soap.skin_suitability;
    if (Array.isArray(rawSkin))
      return rawSkin
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(', ');
    return rawSkin || 'All Skin Types';
  }, [metadata.skin_suitability, soap.skin_suitability]);

  return (
    <div className="card" onClick={() => onCardClick(soap)}>
      {/* ── IMAGE AREA ── */}
      <div
        className="card-img"
        style={{
          backgroundColor: bgColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
        }}
      >
        <div style={{ fontSize: '60px', marginBottom: '0.5rem' }}>🧼</div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {soap.brand}
        </div>

        {/* Personalized Match Badge */}
        {isPersonalized && match.match_score !== null && (
          <div className="ph-badge" style={{ background: scoreColor }}>
            <span className="ph-label">Match</span>
            <span
              className="ph-value"
              style={{ color: score < 75 ? '#fff' : '#283745' }}
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
          <span className="stat-value">
            {metadata.gooeyness_label || soap.gooeyness_label || 'Average'}
          </span>
        </div>
      </div>

      <div className="ingredients-section">
        <p className="ing-label">
          {isPersonalized ? 'Scientific Match' : 'Ingredient Profile'}
        </p>
        <div className="ing-pills">
          {reasons.length > 0 ? (
            reasons.slice(0, 2).map((r, i) => (
              <span key={i} className="ing-pill">
                {r}
              </span>
            ))
          ) : (
            <span className="ing-pill">Archive Data</span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <button type="button" className="btn-add">
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
