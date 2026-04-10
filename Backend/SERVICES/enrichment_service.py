import json
import logging
import os
from datetime import datetime, timezone, timedelta

from SERVICES.scraper.scraper_service import get_ingredient_safety
from SERVICES.ingredient_combined_service import get_full_ingredient_profile
from SERVICES.soap_properties_service import get_soap_properties

logger = logging.getLogger(__name__)

_CACHE_MAX_AGE = timedelta(days=30)

_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
_SOAPS_FILE = os.path.join(_BASE_DIR, "soaps.json")
_ENRICHED_FILE = os.path.join(_BASE_DIR, "soaps_enriched.json")


def needs_refresh() -> bool:
    try:
        if not os.path.exists(_ENRICHED_FILE):
            return True
        with open(_ENRICHED_FILE, encoding="utf-8") as f:
            data = json.load(f)
        enriched_at = datetime.fromisoformat(data["enriched_at"])
        if enriched_at.tzinfo is None:
            enriched_at = enriched_at.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - enriched_at
        return age >= _CACHE_MAX_AGE
    except Exception as e:
        logger.warning("Could not determine enrichment freshness: %s", e)
        return True


def _enrich_ingredient(name: str) -> dict:
    record = {
        "name": name,
        "function": None,
        "safety_score": None,
        "safety_concerns": [],
        "source": None,
        "regulatory_status": "unknown",
    }

    try:
        safety = get_ingredient_safety(name)
        if "error" not in safety:
            record["safety_score"] = safety.get("safety_score")
            record["safety_concerns"] = safety.get("safety_concerns", [])
            record["regulatory_status"] = safety.get("regulatory_status", "unknown")
        else:
            logger.warning("Safety lookup returned error for '%s': %s", name, safety["error"])
    except Exception as e:
        logger.warning("Safety lookup failed for '%s': %s", name, e)

    SCRAPER_FALLBACK_CONCERNS = {"scrape_failed", "not_found"}
    record["safety_concerns"] = [
        c for c in record["safety_concerns"]
        if c not in SCRAPER_FALLBACK_CONCERNS
    ]

    try:
        profile = get_full_ingredient_profile(name)
        cosmetic_info = profile.get("cosmetic_info", {})
        if "error" not in cosmetic_info:
            functions = cosmetic_info.get("functions", [])
            record["function"] = functions[0] if functions else None
            record["source"] = cosmetic_info.get("source")
        else:
            logger.warning("Profile lookup returned error for '%s': %s", name, cosmetic_info["error"])
    except Exception as e:
        logger.warning("Profile lookup failed for '%s': %s", name, e)

    return record


def _enrich_soap(soap: dict) -> dict | None:
    try:
        soap_id = soap.get("id", "unknown")
        logger.info("Enriching soap: %s", soap.get("name", soap_id))

        raw = soap.get("ingredients_raw", "")
        ingredient_names = [s.strip() for s in raw.split(",") if s.strip()]

        enriched_ingredients = []
        for name in ingredient_names:
            enriched_ingredients.append(_enrich_ingredient(name))

        enriched_soap = {
            "id": soap_id,
            "name": soap.get("name"),
            "ingredients": enriched_ingredients,
        }
        properties = get_soap_properties(enriched_soap)

        return {
            "id": soap_id,
            "name": soap.get("name"),
            "brand": soap.get("brand"),
            "buy_link": soap.get("buy_link"),
            "ingredients_raw": raw,
            "ingredients": enriched_ingredients,
            "properties": properties,
        }
    except Exception as e:
        logger.error("Failed to enrich soap '%s': %s", soap.get("name", "unknown"), e)
        return None


def run_enrichment_if_stale() -> None:
    try:
        if not needs_refresh():
            logger.info("Enriched data is fresh, skipping")
            return

        logger.info("Starting enrichment of soaps.json")

        try:
            with open(_SOAPS_FILE, encoding="utf-8") as f:
                soaps = json.load(f)
        except FileNotFoundError:
            logger.error("soaps.json not found at %s", _SOAPS_FILE)
            return
        except json.JSONDecodeError as e:
            logger.error("soaps.json is invalid JSON: %s", e)
            return

        enriched_soaps = []
        for soap in soaps:
            result = _enrich_soap(soap)
            if result is not None:
                enriched_soaps.append(result)

        output = {
            "enriched_at": datetime.now(timezone.utc).isoformat(),
            "soaps": enriched_soaps,
        }

        try:
            with open(_ENRICHED_FILE, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2)
        except Exception as e:
            logger.error("Failed to write soaps_enriched.json: %s", e)
            return

        logger.info("Enrichment complete — %d soaps processed", len(enriched_soaps))

    except Exception as e:
        logger.error("Unexpected error during enrichment: %s", e)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    run_enrichment_if_stale()

    if os.path.exists(_ENRICHED_FILE):
        with open(_ENRICHED_FILE, encoding="utf-8") as f:
            data = json.load(f)
        print(f"\n=== Enrichment Summary ===")
        print(f"enriched_at: {data['enriched_at']}")
        print(f"soaps processed: {len(data['soaps'])}")
        for soap in data["soaps"]:
            props = soap.get("properties", {})
            print(f"\n  {soap['name']}")
            print(f"    ingredients: {len(soap['ingredients'])}")
            print(f"    safety score: {props.get('overall_safety_score')}")
            print(f"    skin suitability: {props.get('skin_suitability')}")
            print(f"    gooeyness: {props.get('gooeyness_score')} ({props.get('gooeyness_label')})")
            print(f"    longevity: {props.get('longevity')}")
