const API_BASE_URL = 'http://localhost:8000';

export const soapApi = {
  // POST /recommendations
  getRecommendations: async (profile) => {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zip_code: profile.zip,
        skin_type: profile.skinType.toLowerCase().split(' / ')[0], // Converts "Oily / Acne" to "oily"
        avoid_ingredients: profile.avoid || [],
        prefer_ingredients: profile.prefer || [],
      }),
    });
    return response.json();
  },

  // GET /recommendations/soap/{id}
  getSoapDetails: async (id) => {
    const response = await fetch(`${API_BASE_URL}/recommendations/soap/${id}`);
    return response.json();
  },

  // GET /water/hardness
  getWaterHardness: async (zip) => {
    const response = await fetch(
      `${API_BASE_URL}/water/hardness?zip_code=${zip}`
    );
    return response.json();
  },
};
