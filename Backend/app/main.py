from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from SERVICES.ingredient_combined_service import get_full_ingredient_profile
from SERVICES.soap_rating_service import rate_soap_by_zip

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SoapStandle Hub API: Science & Rating Services Active"}

@app.get("/api/ingredient/full/{name}")
async def get_full_ingredient(name: str):
    profile = get_full_ingredient_profile(name)

    if "error" in profile["basic_info"] and "error" in profile["cosmetic_info"]:
        raise HTTPException(status_code=404, detail="Ingredient data could not be retrieved from scientific sources.")
        
    return profile

@app.get("/api/soap-rating")
def soap_rating(
    zip_code: str, 
    soap_name: str = "Generic Soap Bar",
    manual_hardness: Optional[str] = Query(None, description="Optional manual override: Soft, Moderately Hard, Hard, Very Hard")
):
    if manual_hardness:
        # A simple helper to map manual categories to ratings
        ratings_map = {
            "Soft": "Excellent",
            "Moderately Hard": "Good",
            "Hard": "Fair",
            "Very Hard": "Poor"
        }
        
        return {
            "soap_name": soap_name,
            "zip_code": zip_code,
            "hardness_category": manual_hardness,
            "soap_rating": ratings_map.get(manual_hardness, "Unknown"),
            "reason": f"Manual Override: Rating based on user-defined {manual_hardness} water profile.",
            "is_manual": True
        }

    result = rate_soap_by_zip(zip_code, soap_name)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result