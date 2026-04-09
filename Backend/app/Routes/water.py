from fastapi import APIRouter, Query
from SERVICES.soap_rating_service import get_hardness_profile, rate_soap_by_zip

router = APIRouter()


@router.get("/hardness")
def water_hardness(zip_code: str = Query(..., description="5-digit US ZIP code")):
    return get_hardness_profile(zip_code)


@router.get("/soap-rating")
def soap_rating(zip_code: str = Query(..., description="5-digit US ZIP code"),
                soap_name: str = "Generic Soap Bar"):
    return rate_soap_by_zip(zip_code, soap_name)
