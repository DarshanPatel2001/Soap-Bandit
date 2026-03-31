import json
import logging
import os
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_CACHE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "scraper_cache")
)
_CACHE_MAX_AGE = timedelta(days=7)

_FALLBACK_SCHEMA = {
    "inci_name": None,
    "source_db": "ewg",
    "safety_score": None,
    "safety_concerns": [],
    "regulatory_status": "unknown",
    "regulatory_region": "US",
    "function": None,
    "origin": None,
    "last_updated": None,
    "raw_url": None,
}


def _safe_name(ingredient_name: str) -> str:
    return ingredient_name.lower().replace(" ", "_")


def _load_cache(ingredient_name: str) -> dict | None:
    filepath = os.path.join(_CACHE_DIR, f"{_safe_name(ingredient_name)}.json")
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)
        exported_at = datetime.fromisoformat(data["exported_at"])
        if exported_at.tzinfo is None:
            exported_at = exported_at.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - exported_at
        if age < _CACHE_MAX_AGE:
            logger.info("Cache hit for %s (age: %s)", ingredient_name, age)
            return data["ingredient"]
        logger.info("Cache expired for %s", ingredient_name)
    except Exception as e:
        logger.warning("Cache read error for %s: %s", ingredient_name, e)
    return None


def _make_ewg_fallback(ingredient_name: str) -> dict:
    from datetime import datetime, timezone
    return {
        **_FALLBACK_SCHEMA,
        "inci_name": ingredient_name.upper(),
        "safety_concerns": ["scrape_failed"],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def get_ingredient_safety(ingredient_name: str) -> dict:
    from . import ewg_scraper, fda_scraper, data_normalizer, json_exporter

    cached = _load_cache(ingredient_name)
    if cached is not None:
        return cached

    # EWG
    ewg_normalized = None
    try:
        ewg_raw = ewg_scraper.scrape(ingredient_name)
        ewg_normalized = data_normalizer.normalize(ewg_raw, "ewg")
    except Exception as e:
        logger.error("EWG scrape/normalize failed for %s: %s", ingredient_name, e)
        ewg_normalized = _make_ewg_fallback(ingredient_name)

    # FDA
    fda_normalized = None
    try:
        fda_records = fda_scraper.scrape()
        target = ingredient_name.upper()
        for record in fda_records:
            if record.get("inci_name", "").upper() == target:
                fda_normalized = data_normalizer.normalize(record, "fda")
                break
    except Exception as e:
        logger.error("FDA scrape/normalize failed for %s: %s", ingredient_name, e)

    # Merge
    merged = dict(ewg_normalized)
    if fda_normalized:
        merged["regulatory_status"] = fda_normalized["regulatory_status"]
        merged["regulatory_region"] = fda_normalized["regulatory_region"]
        combined = merged.get("safety_concerns", []) + fda_normalized.get("safety_concerns", [])
        merged["safety_concerns"] = list(dict.fromkeys(combined))

    try:
        json_exporter.export(ingredient_name, merged)
    except Exception as e:
        logger.error("Export failed for %s: %s", ingredient_name, e)

    return merged
