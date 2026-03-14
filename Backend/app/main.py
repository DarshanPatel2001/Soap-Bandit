from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Soap Knowledge API running"}