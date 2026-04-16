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


@router.get("/soaps/all")
def all_soaps():
    if not os.path.exists(_ENRICHED_FILE):
        return JSONResponse(
            status_code=404,
            content={"error": "Enriched soap data not available"},
        )

    with open(_ENRICHED_FILE, encoding="utf-8") as f:
        data = json.load(f)

    soaps = data.get("soaps", [])
    return [
        {
            "id": s.get("id", ""),
            "name": s.get("name", ""),
            "brand": s.get("brand", ""),
            "buy_link": s.get("buy_link", ""),
            "properties": s.get("properties", {}),
            "ingredients": s.get("ingredients", []),
        }
        for s in soaps
    ]


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
