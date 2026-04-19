export const API_BASE_URL = 'http://localhost:8000';

export const SKIN_TYPES = [
  'All Types',
  'Oily / Acne',
  'Sensitive',
  'Dry / Normal',
  'Dry / Mature',
];
export const COMMON_AVOID = [
  'Sulfates',
  'Parabens',
  'Fragrance',
  'Phthalates',
  'Aloe',
  'Coconut Oil',
  'Palm Oil',
];

export const getPhLabel = (ph) => {
  const val = parseFloat(ph);
  if (val <= 8.5) return 'Low (≤8.5)';
  if (val <= 9.0) return 'Medium (8.6–9.0)';
  return 'High (9.1+)';
};

export const getScoreColor = (score, hasAllergen) => {
  if (hasAllergen) return '#e53e3e'; // Danger Red
  if (score >= 90) return '#48bb78'; // Success Green
  if (score >= 75) return '#ecc94b'; // Warning Gold
  return '#f56565'; // Soft Red
};
