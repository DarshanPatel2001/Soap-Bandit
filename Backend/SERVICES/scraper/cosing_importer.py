import csv
import logging
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_DEFAULT_CSV = os.getenv(
    "COSING_CSV_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "cosing_sample.csv"),
)

_STATUS_MAP = {
    "not restricted": "permitted",
    "permitted": "permitted",
    "restricted": "restricted",
    "prohibited": "prohibited",
}


def import_csv(filepath: str = None) -> list:
    if filepath is None:
        filepath = os.path.abspath(_DEFAULT_CSV)

    from . import data_normalizer

    results = []
    try:
        with open(filepath, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                inci_name = row.get("INCI name", "").strip()
                if not inci_name:
                    continue

                raw_status = row.get("Status", "").strip().lower()
                regulatory_status = _STATUS_MAP.get(raw_status, "unknown")

                raw = {
                    "inci_name": inci_name,
                    "source_db": "cosing",
                    "safety_score": None,
                    "safety_concerns": [],
                    "regulatory_status": regulatory_status,
                    "regulatory_region": "EU",
                    "function": row.get("Function", "").strip() or None,
                    "origin": row.get("Origin", "").strip() or None,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                    "raw_url": "local_csv",
                }

                try:
                    normalized = data_normalizer.normalize(raw, "cosing")
                    results.append(normalized)
                except ValueError as e:
                    logger.warning("Skipping CSV row %s: %s", inci_name, e)

    except OSError as e:
        logger.error("Failed to read CSV %s: %s", filepath, e)

    return results


if __name__ == "__main__":
    import sys
    import json

    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

    from Backend.SERVICES.scraper.cosing_importer import import_csv as _import_csv

    records = _import_csv()
    print(json.dumps(records, indent=2))
    print(f"\nTotal records: {len(records)}")
