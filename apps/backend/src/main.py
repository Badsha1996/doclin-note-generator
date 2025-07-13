from fastapi import FastAPI
from .auth.infrastructure import database_setup
app = FastAPI()

@app.get("/")
def home():
    return {"hello": "world"}