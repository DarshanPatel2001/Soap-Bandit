import logging
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from . import request_handler

logger = logging.getLogger(__name__)

_EWG_BASE = "https://www.ewg.org"
_SEARCH_URL = "https://www.ewg.org/skindeep/search/?search={query}"

_BLOCKED_SIGNALS = [
    "just a moment",
    "checking your browser",
    "enable javascript",
    "access denied",
    "cloudflare",
]


def _is_blocked(response) -> bool:
    if response.status_code in (403, 503):
        return True
    text_lower = response.text.lower()
    return any(signal in text_lower for signal in _BLOCKED_SIGNALS)


def _make_fallback(ingredient_name: str, reason: str) -> dict:
    return {
        "inci_name": ingredient_name.upper(),
        "source_db": "ewg",
        "safety_score": None,
        "safety_concerns": [reason],
        "regulatory_status": "unknown",
        "regulatory_region": "US",
        "function": None,
        "origin": None,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "raw_url": _SEARCH_URL.format(query=ingredient_name),
    }


def _parse_score(soup) -> int | None:
    el = soup.select_one("[data-score]")
    if el:
        try:
            return int(el["data-score"])
        except (ValueError, TypeError):
            pass

    for selector in [".score-num", ".hazard-score", ".ingredient-score", ".ewg-score"]:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True)
            try:
                return int(text.split()[0])
            except (ValueError, IndexError):
                pass

    return None


def _parse_concerns(soup) -> list:
    concerns = []
    for selector in [".concern-tag", ".ingredient-concern", "ul.concerns li", ".hazard-tag"]:
        tags = soup.select(selector)
        for tag in tags:
            text = tag.get_text(strip=True).lower()
            if text and text not in concerns:
                concerns.append(text)
    return concerns


def scrape(ingredient_name: str) -> dict:
    search_url = _SEARCH_URL.format(query=ingredient_name.replace(" ", "+"))

    try:
        response = request_handler.get(search_url)
    except Exception as e:
        logger.error("EWG request failed for %s: %s", ingredient_name, e)
        return _make_fallback(ingredient_name, "request_failed")

    if _is_blocked(response):
        logger.warning("EWG blocked for %s", ingredient_name)
        return _make_fallback(ingredient_name, "blocked_by_ewg")

    soup = BeautifulSoup(response.text, "lxml")

    link_el = soup.select_one("a[href*='/skindeep/ingredients/']")
    if not link_el:
        logger.info("EWG: ingredient not found: %s", ingredient_name)
        return _make_fallback(ingredient_name, "not_found")

    href = link_el.get("href", "")
    detail_url = href if href.startswith("http") else _EWG_BASE + href

    try:
        detail_response = request_handler.get(detail_url)
    except Exception as e:
        logger.error("EWG detail request failed for %s: %s", ingredient_name, e)
        return _make_fallback(ingredient_name, "request_failed")

    if _is_blocked(detail_response):
        logger.warning("EWG detail page blocked for %s", ingredient_name)
        return _make_fallback(ingredient_name, "blocked_by_ewg")

    detail_soup = BeautifulSoup(detail_response.text, "lxml")
    score = _parse_score(detail_soup)
    concerns = _parse_concerns(detail_soup)

    return {
        "inci_name": ingredient_name.upper(),
        "source_db": "ewg",
        "safety_score": score,
        "safety_concerns": concerns,
        "regulatory_status": "unknown",
        "regulatory_region": "US",
        "function": None,
        "origin": None,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "raw_url": detail_url,
    }
