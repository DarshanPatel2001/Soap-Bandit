from SERVICES.pubchem_service import fetch_ingredient_data
from SERVICES.ingredient_extra_service import fetch_ingredient_extra

def get_full_ingredient_profile(ingredient_name: str):
    pubchem_data = fetch_ingredient_data(ingredient_name)
    extra_data = fetch_ingredient_extra(ingredient_name)

    return {
        "ingredient": ingredient_name,
        "basic_info": pubchem_data,
        "cosmetic_info": extra_data
    }