from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from SERVICES.pubchem_service import fetch_ingredient_data
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
    return {"message": "Soap Knowledge API is Live and Rating Service is Active"}

# Route 1: The "Wikipedia" Ingredient Search
@app.get("/api/ingredient/{name}")
async def get_ingredient(name: str):
    data = fetch_ingredient_data(name)
    
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
        
    return data

# Route 2: The Soap Rating Service
@app.get("/soap-rating")
def soap_rating(zip_code: str, soap_name: str = "Generic Soap Bar"):
    # This likely uses your environmental data logic
    return rate_soap_by_zip(zip_code, soap_name)