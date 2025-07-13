from fastapi import FastAPI
from .auth.infrastructure import database
app = FastAPI()

@app.get("/")
def home():
    return {"hello": "world"}