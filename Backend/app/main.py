from fastapi import FastAPI
from app.routes.packaging import router as packaging_router

app = FastAPI()

app.include_router(packaging_router)