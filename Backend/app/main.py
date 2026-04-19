from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from SERVICES.enrichment_service import run_enrichment_if_stale
from app.Routes.soap import router as soap_router
from app.Routes.ingredients import router as ingredients_router
from app.Routes.water import router as water_router
from app.Routes.recommendations import router as recommendations_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run enrichment on startup
    run_enrichment_if_stale()
    scheduler = BackgroundScheduler()
    # Check for stale data every 30 days
    scheduler.add_job(run_enrichment_if_stale, "interval", days=30)
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#AROUTES here
app.include_router(soap_router, prefix="/soap")
app.include_router(ingredients_router, prefix="/ingredients")
app.include_router(water_router, prefix="/water")
app.include_router(recommendations_router, prefix="/recommendations")

@app.get("/")
def home():
    return {"message": "Soap Knowledge API currently running"}