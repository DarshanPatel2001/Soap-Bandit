import json
import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from SERVICES.matching_service import match_soaps
from SERVICES.soap_rating_service import get_hardness_profile
from SERVICES.gooeyness.gooeyness_service import calculate_gooeyness

router = APIRouter()

_ENRICHED_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "soaps_enriched.json"
)


class RecommendationRequest(BaseModel):
    zip_code: str
    skin_type: str
    avoid_ingredients: list[str] = []
    prefer_ingredients: list[str] = []


@router.post("")
def recommendations(request: RecommendationRequest):
    top_matches = match_soaps(request.model_dump())

    profile = get_hardness_profile(request.zip_code)

    if "error" in profile:
        user_location = "Unknown"
        water_hardness = "Unknown"
    else:
        user_location = profile.get("city", "") + ", " + profile.get("state", "")
        water_hardness = profile.get("hardness_category", "Unknown")

    return {
        "user_location": user_location,
        "water_hardness": water_hardness,
        "top_matches": top_matches,
    }


@router.get("/filters")
def get_filters():
    """Return available filter options based on soap data."""
    if not os.path.exists(_ENRICHED_FILE):
        return JSONResponse(
            status_code=404,
            content={"error": "Enriched soap data not available"},
        )

    with open(_ENRICHED_FILE, encoding="utf-8") as f:
        data = json.load(f)

    soaps = data.get("soaps", [])

    # Extract unique filter values from soaps
    skin_types = set()
    sources = set()
    ph_levels = set()
    gooeyness_levels = set()
    longevity_levels = set()

    for soap in soaps:
        properties = soap.get("properties", {})

        # Skin suitability - can be array or string
        skin_suit = properties.get("skin_suitability") or soap.get("skin_suitability")
        if skin_suit:
            if isinstance(skin_suit, list):
                for s in skin_suit:
                    skin_types.add(s.capitalize())
            else:
                skin_types.add(skin_suit)

        # Source
        source = soap.get("source")
        if source:
            sources.add(source)

        # pH Level - look for ph_level in top level or properties
        ph = properties.get("ph_level") or soap.get("ph_level")
        if ph:
            try:
                ph_val = float(ph)
                if ph_val <= 8.5:
                    ph_levels.add("Low (≤8.5)")
                elif ph_val <= 9.0:
                    ph_levels.add("Medium (8.6–9.0)")
                else:
                    ph_levels.add("High (9.1+)")
            except (ValueError, TypeError):
                pass

        # Gooeyness - look in properties first
        gooey_label = properties.get("gooeyness_label") or soap.get("gooeyness_label")
        if gooey_label:
            gooeyness_levels.add(gooey_label)

        # Longevity - look in properties
        longevity = properties.get("longevity") or soap.get("longevity")
        if longevity:
            longevity_levels.add(longevity.capitalize())

    return {
        "filters": {
            "skin": sorted(list(skin_types)),
            "source": sorted(list(sources)),
            "phLevel": sorted(list(ph_levels)),
            "gooFactor": sorted(list(gooeyness_levels)),
            "longevity": sorted(list(longevity_levels)),
        }
    }


@router.get("/filters")
def get_filters():
    """Return available filter options based on soap data."""
    if not os.path.exists(_ENRICHED_FILE):
        return JSONResponse(
            status_code=404,
            content={"error": "Enriched soap data not available"},
        )

    with open(_ENRICHED_FILE, encoding="utf-8") as f:
        data = json.load(f)

    soaps = data.get("soaps", [])

    # Extract unique filter values from soaps
    skin_types = set()
    sources = set()
    ph_levels = set()
    gooeyness_levels = set()
    longevity_levels = set()

    for soap in soaps:
        properties = soap.get("properties", {})

        # Skin suitability - can be array or string
        skin_suit = properties.get("skin_suitability") or soap.get("skin_suitability")
        if skin_suit:
            if isinstance(skin_suit, list):
                for s in skin_suit:
                    skin_types.add(s.capitalize())
            else:
                skin_types.add(skin_suit)

        # Source
        source = soap.get("source")
        if source:
            sources.add(source)

        # pH Level - look for ph_level in top level or properties
        ph = properties.get("ph_level") or soap.get("ph_level")
        if ph:
            try:
                ph_val = float(ph)
                if ph_val <= 8.5:
                    ph_levels.add("Low (≤8.5)")
                elif ph_val <= 9.0:
                    ph_levels.add("Medium (8.6–9.0)")
                else:
                    ph_levels.add("High (9.1+)")
            except (ValueError, TypeError):
                pass

        # Gooeyness - look in properties first
        gooey_label = properties.get("gooeyness_label") or soap.get("gooeyness_label")
        if gooey_label:
            gooeyness_levels.add(gooey_label)

        # Longevity - look in properties
        longevity = properties.get("longevity") or soap.get("longevity")
        if longevity:
            longevity_levels.add(longevity.capitalize())

    return {
        "filters": {
            "skin": sorted(list(skin_types)),
            "source": sorted(list(sources)),
            "phLevel": sorted(list(ph_levels)),
            "gooFactor": sorted(list(gooeyness_levels)),
            "longevity": sorted(list(longevity_levels)),
        }
    }


@router.get("/soap/{soap_id}")
def soap_detail(soap_id: str):
    if not os.path.exists(_ENRICHED_FILE):
        return JSONResponse(
            status_code=404,
            content={"error": "Enriched soap data not available"},
        )

    with open(_ENRICHED_FILE, encoding="utf-8") as f:
        data = json.load(f)

    soaps = data.get("soaps", [])
    soap = next((s for s in soaps if s.get("id") == soap_id), None)

    if soap is None:
        return JSONResponse(
            status_code=404,
            content={"error": "Soap not found", "id": soap_id},
        )

    ingredient_names = [ing["name"] for ing in soap.get("ingredients", [])]
    gooeyness = calculate_gooeyness(ingredient_names)

    return {
        "id": soap.get("id", ""),
        "name": soap.get("name", ""),
        "brand": soap.get("brand", ""),
        "buy_link": soap.get("buy_link", ""),
        "properties": soap.get("properties", {}),
        "ingredients": soap.get("ingredients", []),
        "gooeyness": gooeyness,
    }
