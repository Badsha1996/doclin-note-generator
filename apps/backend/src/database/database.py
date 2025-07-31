from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from ..config.config import settings


# setting up the environment for DB connect thihi :smile:
engine = create_engine(settings.DATABASE_URL) 
SessionLocal= sessionmaker(autocommit=False, autoflush=False, bind=engine) 
Base = declarative_base()

def get_DB():
    DB = SessionLocal()
    with DB: yield DB
