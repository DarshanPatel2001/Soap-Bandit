from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from SERVICES.pubchem_service import fetch_ingredient_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Soap Knowledge API is Live"}

@app.get("/api/ingredient/{name}")
async def get_ingredient(name: str):
    data = fetch_ingredient_data(name)
    
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
        
    return data