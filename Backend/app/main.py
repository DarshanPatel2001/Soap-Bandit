from fastapi import FastAPI
from SERVICES.soap_rating_service import rate_soap_by_zip

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Soap Knowledge API running"}


@app.get("/soap-rating")
def soap_rating(zip_code: str, soap_name: str = "Generic Soap Bar"):
    return rate_soap_by_zip(zip_code, soap_name)