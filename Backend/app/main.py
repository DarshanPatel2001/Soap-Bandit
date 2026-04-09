from fastapi import FastAPI, HTTPException
from SERVICES.soap_rating_service import rate_soap_by_zip
from SERVICES.scraper import get_ingredient_safety
from app.Routes.soap import router as soap_router

app = FastAPI()
app.include_router(soap_router, prefix="/soap")

@app.get("/")
def home():
    return {"message": "Soap Knowledge API running"}

@app.get("/soap-rating")
def soap_rating(zip_code: str, soap_name: str = "Generic Soap Bar"):
    return rate_soap_by_zip(zip_code, soap_name)

@app.get("/ingredients/{name}/safety")
def ingredient_safety(name: str):
    return get_ingredient_safety(name)