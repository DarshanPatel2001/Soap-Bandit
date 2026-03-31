import unittest
from unittest.mock import patch, MagicMock
from Backend.SERVICES.scraper import fda_scraper


def _mock_response(status_code=200, text=""):
    mock = MagicMock()
    mock.status_code = status_code
    mock.text = text
    mock.raise_for_status = MagicMock()
    if status_code >= 400:
        import requests
        mock.raise_for_status.side_effect = requests.HTTPError(f"HTTP {status_code}")
    return mock


FDA_HTML = """
<html><body>
  <h2>Prohibited Ingredients</h2>
  <table>
    <tr><th>Ingredient</th><th>Notes</th></tr>
    <tr><td>LEAD ACETATE</td><td>Banned in cosmetics</td></tr>
    <tr><td>MERCURY COMPOUNDS</td><td>Banned</td></tr>
  </table>
  <h2>Restricted Ingredients</h2>
  <table>
    <tr><th>Ingredient</th><th>Restriction</th></tr>
    <tr><td>FLUORIDE</td><td>Limit 0.15%</td></tr>
  </table>
</body></html>
"""


class TestFDAScraper(unittest.TestCase):

    def setUp(self):
        fda_scraper._FDA_CACHE = None

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_full_scrape_returns_all_rows(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        results = fda_scraper.scrape()
        assert len(results) == 3

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_prohibited_ingredients_have_correct_status(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        results = fda_scraper.scrape()
        prohibited = [r for r in results if r["inci_name"] == "LEAD ACETATE"]
        assert len(prohibited) == 1
        assert prohibited[0]["regulatory_status"] == "prohibited"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_restricted_ingredients_have_correct_status(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        results = fda_scraper.scrape()
        restricted = [r for r in results if r["inci_name"] == "FLUORIDE"]
        assert len(restricted) == 1
        assert restricted[0]["regulatory_status"] == "restricted"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_module_cache_prevents_second_http_call(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        fda_scraper.scrape()
        fda_scraper.scrape()
        assert mock_get.call_count == 1

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_request_exception_returns_empty_list(self, mock_get):
        import requests
        mock_get.side_effect = requests.RequestException("connection refused")
        results = fda_scraper.scrape()
        assert results == []

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_regulatory_region_is_us(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        results = fda_scraper.scrape()
        for r in results:
            assert r["regulatory_region"] == "US"

    @patch("Backend.SERVICES.scraper.request_handler.get")
    def test_all_schema_keys_present(self, mock_get):
        mock_get.return_value = _mock_response(200, FDA_HTML)
        results = fda_scraper.scrape()
        expected_keys = {
            "inci_name", "source_db", "safety_score", "safety_concerns",
            "regulatory_status", "regulatory_region", "function", "origin",
            "last_updated", "raw_url",
        }
        for r in results:
            assert set(r.keys()) == expected_keys


if __name__ == "__main__":
    unittest.main()
