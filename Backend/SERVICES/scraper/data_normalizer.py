from datetime import datetime, timezone

VALID_STATUSES = {"permitted", "restricted", "prohibited", "unknown"}

SCHEMA_KEYS = [
    "inci_name",
    "source_db",
    "safety_score",
    "safety_concerns",
    "regulatory_status",
    "regulatory_region",
    "function",
    "origin",
    "last_updated",
    "raw_url",
]


def normalize(raw: dict, source: str) -> dict:
    data = dict(raw)

    if "source_db" not in data or not data["source_db"]:
        data["source_db"] = source

    if not data.get("inci_name"):
        raise ValueError("Missing required field: inci_name")
    if not data.get("source_db"):
        raise ValueError("Missing required field: source_db")
    if not data.get("regulatory_status"):
        raise ValueError("Missing required field: regulatory_status")

    data["inci_name"] = str(data["inci_name"]).upper().strip()

    status = str(data["regulatory_status"]).lower().strip()
    data["regulatory_status"] = status if status in VALID_STATUSES else "unknown"

    if "last_updated" not in data or not data["last_updated"]:
        data["last_updated"] = datetime.now(timezone.utc).isoformat()

    result = {
        "inci_name": data.get("inci_name"),
        "source_db": data.get("source_db"),
        "safety_score": data.get("safety_score", None),
        "safety_concerns": data.get("safety_concerns") or [],
        "regulatory_status": data.get("regulatory_status"),
        "regulatory_region": data.get("regulatory_region", None),
        "function": data.get("function", None),
        "origin": data.get("origin", None),
        "last_updated": data.get("last_updated"),
        "raw_url": data.get("raw_url", None),
    }

    return result
