/**
 * Unified filtering and sorting logic for the Soap Search Hybrid Engine.
 * Focused on Allergens, Skin Type, Gooeyness, and Source.
 */
export const applyHybridFilters = ({
  recommendations,
  allSoaps,
  activeFilters,
  userPrefs,
  locationInput,
  sortBy,
}) => {
  const recommendedIds = new Set(recommendations.map((m) => m.soap?.id));

  // UNIFY: Combine VIP matches and general archive
  const unifiedList = [
    ...recommendations,
    ...allSoaps
      .filter((s) => !recommendedIds.has(s.id))
      .map((s) => ({
        soap: s,
        match_score: null,
        reasons: ['Available in archive'],
      })),
  ];

  return unifiedList
    .filter((match) => {
      const s = match.soap || {};
      const metadata = match.properties || s.properties || {};

      // --- Allergen Deep Scan (Dial Gold Fix) ---
      const avoidList = [
        ...(userPrefs?.avoidIngredients || []),
        ...activeFilters.avoid,
      ];
      if (avoidList.length > 0) {
        const concernIngs = (metadata.concern_ingredients || []).join(' ');
        const masterString =
          `${concernIngs} ${s.ingredients_raw} ${s.name} ${s.brand}`.toLowerCase();

        const hasMatch = avoidList.some((avoid) => {
          const term = avoid.toLowerCase().trim();
          if (!term) return false;
          const singular = term.endsWith('s') ? term.slice(0, -1) : term;
          return (
            masterString.includes(term) ||
            masterString.includes(singular) ||
            masterString.includes('parfum') ||
            masterString.includes('perfume')
          );
        });
        if (hasMatch) return false;
      }

      // --- Search Bar ---
      const searchStr = locationInput.toLowerCase().trim();
      if (
        searchStr &&
        !s.brand?.toLowerCase().includes(searchStr) &&
        !s.name?.toLowerCase().includes(searchStr)
      ) {
        return false;
      }

      // --- Skin Type ---
      if (activeFilters.skin.length > 0) {
        const suit = metadata.skin_suitability || s.skin_suitability || [];
        const suitStr = Array.isArray(suit) ? suit.join(' ') : String(suit);
        if (
          !activeFilters.skin.some((f) =>
            suitStr.toLowerCase().includes(f.toLowerCase().split(' / ')[0])
          )
        ) {
          return false;
        }
      }

      // --- Source Filter ---
      if (activeFilters.source.length > 0) {
        const soapSource = (s.source || 'Standard').toLowerCase();
        if (
          !activeFilters.source.some((f) =>
            soapSource.includes(f.toLowerCase())
          )
        ) {
          return false;
        }
      }

      // --- Goo Factor Filter ---
      if (activeFilters.gooFactor.length > 0) {
        const currentGoo =
          metadata.gooeyness_label || s.gooeyness_label || 'Average';
        if (!activeFilters.gooFactor.includes(currentGoo)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Pin Matches to the top
      if (a.match_score !== null && b.match_score === null) return -1;
      if (a.match_score === null && b.match_score !== null) return 1;

      // Price sorting
      const pA = parseFloat((a.soap?.price || '$0').replace('$', ''));
      const pB = parseFloat((b.soap?.price || '$0').replace('$', ''));
      if (sortBy === 'low-high') return pA - pB;
      if (sortBy === 'high-low') return pB - pA;
      return 0;
    });
};
