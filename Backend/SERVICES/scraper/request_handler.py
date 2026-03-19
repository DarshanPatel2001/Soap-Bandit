import os
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SCRAPER_DELAY = float(os.getenv("SCRAPER_DELAY", "2"))
MAX_RETRIES = 3

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
]

_session = requests.Session()
_ua_index = 0


def get(url: str) -> requests.Response:
    global _ua_index

    user_agent = _USER_AGENTS[_ua_index % len(_USER_AGENTS)]
    _ua_index += 1

    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    last_exc = None
    for attempt in range(MAX_RETRIES):
        try:
            response = _session.get(url, headers=headers, timeout=15)
            if response.status_code in (429,) or response.status_code >= 500:
                wait = 2 ** attempt
                logger.warning("HTTP %s from %s, retrying in %ss", response.status_code, url, wait)
                time.sleep(wait)
                continue
            time.sleep(SCRAPER_DELAY)
            return response
        except requests.RequestException as e:
            last_exc = e
            wait = 2 ** attempt
            logger.warning("Request error on attempt %d: %s, retrying in %ss", attempt + 1, e, wait)
            time.sleep(wait)

    if last_exc:
        raise last_exc
    raise requests.HTTPError(f"All retries exhausted for {url}")
