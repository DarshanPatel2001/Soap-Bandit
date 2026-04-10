from fastapi import APIRouter
from SERVICES.ingredient_combined_service import get_full_ingredient_profile
from SERVICES.scraper import get_ingredient_safety
#boiler here
router = APIRouter()

#ingreditn_name/full
@router.get("/{name}/full")
def get_full_ingredient(name: str):
    return get_full_ingredient_profile(name)

#safty stuff
@router.get("/{name}/safety")
def ingredient_safety(name: str):
    return get_ingredient_safety(name)