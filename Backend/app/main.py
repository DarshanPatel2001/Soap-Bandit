from fastapi import FastAPI
from app.Routes.soap import router as soap_router
from app.Routes.ingredients import router as ingredients_router
from app.Routes.water import router as water_router

app = FastAPI()

app.include_router(soap_router, prefix="/soap")
app.include_router(ingredients_router, prefix="/ingredients")
app.include_router(water_router, prefix="/water")


@app.get("/")
def home():
    return {"message": "Soap Knowledge API running"}