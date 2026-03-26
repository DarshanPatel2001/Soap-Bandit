from fastapi import APIRouter
from SERVICES.ingredient_combined_service import get_full_ingredient_profile

router = APIRouter()

@router.get("/ingredient/full/{name}")
def get_full_ingredient(name: str):
    return get_full_ingredient_profile(name)