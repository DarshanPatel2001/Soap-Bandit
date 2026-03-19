import unittest
from unittest.mock import patch, MagicMock
from Backend.SERVICES.scraper import ewg_scraper


def _mock_response(status_code=200, text=""):
    mock = MagicMock()
    mock.status_code = status_code
    mock.text = text
    return mock


SEARCH_HTML_WITH_LINK = """
<html><body>
  <a href="/skindeep/ingredients/12345-glycerin/">Glycerin</a>
</body></html>
"""

DETAIL_HTML_WITH_SCORE = """
<html><body>
  <div data-score="2"></div>
  <span class="concern-tag">allergy</span>
  <span class="concern-tag">cancer</span>
</body></html>
"""

CLOUDFLARE_HTML = """
<html><body>Just a moment... Checking your browser</body></html>
"""

SEARCH_HTML_NO_LINK = """
<html><body><p>No results found</p></body></html>
"""


class TestEWGScraper(unittest.TestCase):

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_success_returns_score_and_concerns(self, mock_get):
        mock_get.side_effect = [
            _mock_response(200, SEARCH_HTML_WITH_LINK),
            _mock_response(200, DETAIL_HTML_WITH_SCORE),
        ]
        result = ewg_scraper.scrape("glycerin")
        assert result["inci_name"] == "GLYCERIN"
        assert result["safety_score"] == 2
        assert "allergy" in result["safety_concerns"]
        assert "cancer" in result["safety_concerns"]
        assert result["source_db"] == "ewg"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_blocked_returns_fallback(self, mock_get):
        mock_get.return_value = _mock_response(200, CLOUDFLARE_HTML)
        result = ewg_scraper.scrape("glycerin")
        assert result["safety_score"] is None
        assert "blocked_by_ewg" in result["safety_concerns"]
        assert result["regulatory_status"] == "unknown"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_no_search_results_returns_fallback(self, mock_get):
        mock_get.return_value = _mock_response(200, SEARCH_HTML_NO_LINK)
        result = ewg_scraper.scrape("unknowningredient")
        assert result["safety_score"] is None
        assert "not_found" in result["safety_concerns"]
        assert result["regulatory_status"] == "unknown"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_request_exception_does_not_raise(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException("timeout")
        result = ewg_scraper.scrape("glycerin")
        assert result["safety_score"] is None
        assert "request_failed" in result["safety_concerns"]

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_403_blocked_returns_fallback(self, mock_get):
        mock_get.return_value = _mock_response(403, "Forbidden")
        result = ewg_scraper.scrape("glycerin")
        assert "blocked_by_ewg" in result["safety_concerns"]

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_all_schema_keys_present_on_fallback(self, mock_get):
        mock_get.side_effect = Exception("network down")
        result = ewg_scraper.scrape("glycerin")
        expected_keys = {
            "inci_name", "source_db", "safety_score", "safety_concerns",
            "regulatory_status", "regulatory_region", "function", "origin",
            "last_updated", "raw_url",
        }
        assert set(result.keys()) == expected_keys


if __name__ == "__main__":
    unittest.main()
