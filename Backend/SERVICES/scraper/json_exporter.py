import json
import os
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

_CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "scraper_cache")


def export(ingredient_name: str, record: dict) -> None:
    safe_name = ingredient_name.lower().replace(" ", "_")
    cache_dir = os.path.abspath(_CACHE_DIR)

    try:
        os.makedirs(cache_dir, exist_ok=True)
        filepath = os.path.join(cache_dir, f"{safe_name}.json")
        payload = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "ingredient": record,
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        logger.info("Exported cache: %s", filepath)
    except OSError as e:
        logger.error("Failed to write cache for %s: %s", ingredient_name, e)
