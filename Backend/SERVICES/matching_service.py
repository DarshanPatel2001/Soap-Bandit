import json
import logging
import os

from SERVICES.soap_rating_service import get_hardness_profile

logger = logging.getLogger(__name__)

_ENRICHED_FILE = os.path.join(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data")),
    "soaps_enriched.json",
)

# Hardness categories that expect "soft" or "both" water compatibility
_SOFT_CATEGORIES = {"Soft", "Moderately Hard"}
# Hardness categories that expect "hard" or "both" water compatibility
_HARD_CATEGORIES = {"Hard", "Very Hard"}


def _load_soaps() -> list:
    try:
        if not os.path.exists(_ENRICHED_FILE):
            logger.warning("soaps_enriched.json not found at %s", _ENRICHED_FILE)
            return []
        with open(_ENRICHED_FILE, encoding="utf-8") as f:
            data = json.load(f)
        soaps = data.get("soaps", [])
        if not soaps:
            logger.warning("soaps_enriched.json is empty")
        return soaps
    except Exception as e:
        logger.exception("Failed to load soaps_enriched.json: %s", e)
        return []


def _check_water_compatibility(hardness_category: str, soap_water_compat: str) -> bool:
    if hardness_category in _SOFT_CATEGORIES:
        return soap_water_compat in ("soft", "both")
    if hardness_category in _HARD_CATEGORIES:
        return soap_water_compat in ("hard", "both")
    return False


def _score_soap(soap: dict, user_profile: dict, hardness_category: str | None) -> dict:
    properties = soap.get("properties", {})
    ingredients = soap.get("ingredients", [])
    ingredient_names_lower = [ing.get("name", "").lower() for ing in ingredients]

    skin_type = user_profile.get("skin_type", "").lower()
    avoid = user_profile.get("avoid_ingredients", [])
    prefer = user_profile.get("prefer_ingredients", [])

    score = 0
    reasons = []

    # --- Skin type match (40pts) ---
    skin_match = skin_type in properties.get("skin_suitability", [])
    if skin_match:
        score += 40
        reasons.append(f"Suitable for {skin_type} skin")

    # --- No avoided ingredients (30pts) ---
    avoid_lower = [a.lower() for a in avoid]
    has_avoided = any(
        av in name for av in avoid_lower for name in ingredient_names_lower
    )
    if not has_avoided:
        score += 30
        reasons.append("Contains none of your avoided ingredients")

    # --- Preferred ingredients (20pts) ---
    if not prefer:
        score += 20
    else:
        prefer_lower = [p.lower() for p in prefer]
        found_preferred = [
            p for p in prefer_lower
            if any(p in name for name in ingredient_names_lower)
        ]
        score += int((len(found_preferred) / len(prefer_lower)) * 20)
        if found_preferred:
            reasons.append(
                f"Contains {', '.join(found_preferred)} which you prefer"
            )

    # --- Water compatibility (10pts) ---
    water_match = False
    if hardness_category:
        soap_water = properties.get("water_compatibility", "both")
        water_match = _check_water_compatibility(hardness_category, soap_water)
        if water_match:
            score += 10
            reasons.append(
                f"Works well with {hardness_category} water in your area"
            )

    if not reasons:
        reasons.append("General match based on available data")

    return {
        "match_score": score,
        "soap": {
            "id": soap.get("id", ""),
            "name": soap.get("name", ""),
            "brand": soap.get("brand", ""),
            "buy_link": soap.get("buy_link", ""),
        },
        "properties": properties,
        "reasons": reasons,
        "gooeyness_score": properties.get("gooeyness_score", 5.0),
        "gooeyness_label": properties.get("gooeyness_label", "Average"),
    }


def match_soaps(user_profile: dict) -> list:
    try:
        soaps = _load_soaps()
        if not soaps:
            return []

        # Get water hardness once for the zip code
        hardness_category = None
        zip_code = user_profile.get("zip_code", "")
        if zip_code:
            try:
                profile = get_hardness_profile(zip_code)
                if "error" not in profile:
                    hardness_category = profile.get("hardness_category")
            except Exception as e:
                logger.warning("Water hardness lookup failed for %s: %s", zip_code, e)

        # Score all soaps
        scored = []
        for soap in soaps:
            try:
                result = _score_soap(soap, user_profile, hardness_category)
                scored.append(result)
            except Exception as e:
                logger.warning("Failed to score soap %s: %s", soap.get("id", "?"), e)

        # Sort descending by score, take top 5, add rank
        scored.sort(key=lambda x: x["match_score"], reverse=True)
        top = scored[:5]
        for i, item in enumerate(top, start=1):
            item["rank"] = i

        return top

    except Exception as e:
        logger.exception("match_soaps failed: %s", e)
        return []


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    profile1 = {
        "zip_code": "37201",
        "skin_type": "dry",
        "avoid_ingredients": ["sulfate"],
        "prefer_ingredients": ["glycerin", "aloe"],
    }

    profile2 = {
        "zip_code": "10001",
        "skin_type": "sensitive",
        "avoid_ingredients": [],
        "prefer_ingredients": [],
    }

    print("=" * 60)
    print("PROFILE 1: dry skin, avoid sulfates, prefer glycerin+aloe")
    print("=" * 60)
    results1 = match_soaps(profile1)
    for r in results1:
        print(f"  #{r['rank']} | Score: {r['match_score']} | {r['soap']['name']}")
        print(f"       Reasons: {r['reasons']}")
    print()

    print("=" * 60)
    print("PROFILE 2: sensitive skin, no preferences")
    print("=" * 60)
    results2 = match_soaps(profile2)
    for r in results2:
        print(f"  #{r['rank']} | Score: {r['match_score']} | {r['soap']['name']}")
        print(f"       Reasons: {r['reasons']}")
