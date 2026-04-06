import pytest
from Backend.SERVICES.scraper.data_normalizer import normalize

VALID_RAW = {
    "inci_name": "glycerin",
    "source_db": "ewg",
    "safety_score": 2,
    "safety_concerns": ["allergy"],
    "regulatory_status": "permitted",
    "regulatory_region": "US",
    "function": None,
    "origin": None,
    "last_updated": "2025-01-01T00:00:00+00:00",
    "raw_url": "https://example.com",
}


def test_valid_record_passes():
    result = normalize(VALID_RAW, "ewg")
    assert result["inci_name"] == "GLYCERIN"
    assert result["source_db"] == "ewg"
    assert result["regulatory_status"] == "permitted"


def test_inci_name_uppercased():
    result = normalize(VALID_RAW, "ewg")
    assert result["inci_name"] == result["inci_name"].upper()


def test_missing_inci_name_raises():
    raw = dict(VALID_RAW)
    del raw["inci_name"]
    with pytest.raises(ValueError, match="inci_name"):
        normalize(raw, "ewg")


def test_empty_inci_name_raises():
    raw = {**VALID_RAW, "inci_name": ""}
    with pytest.raises(ValueError, match="inci_name"):
        normalize(raw, "ewg")


def test_missing_regulatory_status_raises():
    raw = dict(VALID_RAW)
    del raw["regulatory_status"]
    with pytest.raises(ValueError, match="regulatory_status"):
        normalize(raw, "ewg")


def test_missing_optional_fields_default_to_none():
    raw = {
        "inci_name": "glycerin",
        "regulatory_status": "permitted",
    }
    result = normalize(raw, "ewg")
    assert result["safety_score"] is None
    assert result["function"] is None
    assert result["origin"] is None
    assert result["raw_url"] is None


def test_missing_optional_list_defaults_to_empty():
    raw = {
        "inci_name": "glycerin",
        "regulatory_status": "permitted",
    }
    result = normalize(raw, "ewg")
    assert result["safety_concerns"] == []


def test_invalid_regulatory_status_coerced_to_unknown():
    raw = {**VALID_RAW, "regulatory_status": "maybe_safe"}
    result = normalize(raw, "ewg")
    assert result["regulatory_status"] == "unknown"


def test_all_schema_keys_present():
    expected_keys = {
        "inci_name", "source_db", "safety_score", "safety_concerns",
        "regulatory_status", "regulatory_region", "function", "origin",
        "last_updated", "raw_url",
    }
    result = normalize(VALID_RAW, "ewg")
    assert set(result.keys()) == expected_keys


def test_source_db_injected_from_arg_when_missing():
    raw = {k: v for k, v in VALID_RAW.items() if k != "source_db"}
    result = normalize(raw, "cosing")
    assert result["source_db"] == "cosing"
