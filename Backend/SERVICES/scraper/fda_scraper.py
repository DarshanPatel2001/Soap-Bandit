import logging
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from . import request_handler

logger = logging.getLogger(__name__)

_FDA_URL = "https://www.fda.gov/cosmetics/cosmetic-ingredients/prohibited-restricted-ingredients-cosmetics"

_FDA_CACHE: list | None = None


def _parse_status(section_text: str) -> str:
    if "prohibited" in section_text.lower():
        return "prohibited"
    return "restricted"


def scrape() -> list:
    global _FDA_CACHE

    if _FDA_CACHE is not None:
        return _FDA_CACHE

    try:
        response = request_handler.get(_FDA_URL)
        response.raise_for_status()
    except Exception as e:
        logger.error("FDA scrape request failed: %s", e)
        return []

    try:
        soup = BeautifulSoup(response.text, "lxml")
        results = []
        current_status = "restricted"

        for el in soup.find_all(["h2", "h3", "table"]):
            if el.name in ("h2", "h3"):
                current_status = _parse_status(el.get_text())
                continue

            headers_row = el.find("tr")
            if not headers_row:
                continue
            headers = [th.get_text(strip=True).lower() for th in headers_row.find_all(["th", "td"])]

            for row in el.find_all("tr")[1:]:
                cells = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]
                if not cells:
                    continue

                first_cell = cells[0].strip()
                if not first_cell or first_cell.lower() == "ingredient":
                    continue

                inci_name = first_cell.upper()

                results.append({
                    "inci_name": inci_name,
                    "source_db": "fda",
                    "safety_score": None,
                    "safety_concerns": [],
                    "regulatory_status": current_status,
                    "regulatory_region": "US",
                    "function": None,
                    "origin": None,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                    "raw_url": _FDA_URL,
                })

        _FDA_CACHE = results
        return results

    except Exception as e:
        logger.error("FDA parse failed: %s", e)
        return []
