import json
import logging

from SERVICES.gooeyness.gooeyness_service import calculate_gooeyness

logger = logging.getLogger(__name__)

HARDENER_NAMES = {
    "sodium palmate", "sodium tallowate", "sodium stearate",
    "stearic acid", "palmitic acid",
}
HUMECTANT_NAMES = {"glycerin", "sorbitol", "propylene glycol", "honey"}
DRY_SKIN_KEYWORDS = {"glycerin", "sorbitol", "honey", "shea", "aloe"}
OILY_SKIN_KEYWORDS = {"salicylic", "tea tree", "charcoal", "clay"}
SCRAPER_FALLBACK_CONCERNS = {"scrape_failed", "not_found"}
HIGH_CONCERN = {
    "cancer", "developmental toxicity",
    "endocrine disruption", "immunotoxicity",
}


def get_soap_properties(soap: dict) -> dict:
    result = {
        "overall_safety_score": None,
        "has_concerns": False,
        "concern_ingredients": [],
        "skin_suitability": [],
        "water_compatibility": "both",
        "gooeyness_score": 5.0,
        "gooeyness_label": "Average",
        "longevity": "low",
    }

    try:
        ingredients = soap.get("ingredients", []) if soap else []
        if not ingredients:
            return result

        # --- overall_safety_score ---
        scores = [
            ing.get("safety_score")
            for ing in ingredients
            if ing.get("safety_score") is not None
            and isinstance(ing.get("safety_score"), (int, float))
        ]
        overall_safety = round(sum(scores) / len(scores), 1) if scores else None
        result["overall_safety_score"] = overall_safety

        # --- has_concerns + concern_ingredients ---
        concern_ingredients = []
        for ing in ingredients:
            real_concerns = [
                c for c in (ing.get("safety_concerns") or [])
                if c not in SCRAPER_FALLBACK_CONCERNS
                and c in HIGH_CONCERN
            ]
            if real_concerns:
                concern_ingredients.append(ing.get("name", ""))
        result["has_concerns"] = len(concern_ingredients) > 0
        result["concern_ingredients"] = concern_ingredients

        # --- skin_suitability ---
        names_lower = [ing.get("name", "").lower() for ing in ingredients]
        suitability = set()

        if any(kw in name for name in names_lower for kw in DRY_SKIN_KEYWORDS):
            suitability.add("dry")

        has_sls = any("sodium lauryl sulfate" in name for name in names_lower)
        if not has_sls:
            suitability.add("sensitive")

        if any(kw in name for name in names_lower for kw in OILY_SKIN_KEYWORDS):
            suitability.add("oily")

        if not result["has_concerns"]:
            suitability.add("normal")

        result["skin_suitability"] = sorted(suitability)

        # --- water_compatibility ---
        hardener_count = sum(
            1 for name in names_lower
            if any(h in name for h in HARDENER_NAMES)
        )
        humectant_count = sum(
            1 for name in names_lower
            if any(h in name for h in HUMECTANT_NAMES)
        )
        if hardener_count > 0:
            result["water_compatibility"] = "hard"
        elif humectant_count > hardener_count:
            result["water_compatibility"] = "soft"
        else:
            result["water_compatibility"] = "both"

        # --- longevity ---
        longevity_set = set()
        for i, ing in enumerate(ingredients):
            name_lower = names_lower[i]
            func = ing.get("function", "") or ""
            name_is_hardener = any(h in name_lower for h in HARDENER_NAMES)
            func_is_hardener = "hardener" in func.lower()
            if name_is_hardener or func_is_hardener:
                longevity_set.add(i)
        hardener_total = len(longevity_set)
        if hardener_total >= 2:
            result["longevity"] = "high"
        elif hardener_total == 1:
            result["longevity"] = "medium"
        else:
            result["longevity"] = "low"

        # --- gooeyness ---
        ingredient_names = [ing.get("name", "") for ing in ingredients]
        gooey = calculate_gooeyness(ingredient_names)
        result["gooeyness_score"] = gooey["gooeyness_score"]
        result["gooeyness_label"] = gooey["label"]

    except Exception as e:
        logger.exception("Error computing soap properties: %s", e)

    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)

    mock_soap_1 = {
        "id": "test-soap-1",
        "name": "Test Humectant Soap",
        "ingredients": [
            {"name": "glycerin", "function": "humectant", "safety_score": 1, "safety_concerns": [], "source": "plant-derived"},
            {"name": "sorbitol", "function": "humectant", "safety_score": 1, "safety_concerns": [], "source": "plant-derived"},
            {"name": "aqua", "function": "solvent", "safety_score": 1, "safety_concerns": [], "source": "mineral"},
        ],
    }

    mock_soap_2 = {
        "id": "test-soap-2",
        "name": "Test Hardener Soap",
        "ingredients": [
            {"name": "sodium palmate", "function": "cleansing", "safety_score": 3, "safety_concerns": ["environmental"], "source": "synthetic"},
            {"name": "sodium tallowate", "function": "cleansing", "safety_score": 4, "safety_concerns": [], "source": "animal-derived"},
            {"name": "stearic acid", "function": "hardener", "safety_score": 1, "safety_concerns": [], "source": "synthetic"},
        ],
    }

    print("=== Mock Soap 1 (Humectant-heavy) ===")
    result1 = get_soap_properties(mock_soap_1)
    print(json.dumps(result1, indent=2))

    print("\n=== Mock Soap 2 (Hardener-heavy) ===")
    result2 = get_soap_properties(mock_soap_2)
    print(json.dumps(result2, indent=2))
