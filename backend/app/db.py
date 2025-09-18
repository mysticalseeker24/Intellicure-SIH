# backend/app/db.py
from sqlmodel import SQLModel, Session, create_engine
from typing import Optional
import os

def get_engine(database_url: str):
    engine = create_engine(database_url, echo=False, connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {})
    return engine

def create_db_and_tables(engine):
    from .models import Patient, ConditionRecord, ConceptMapRecord, AuditEvent
    SQLModel.metadata.create_all(engine)

def init_db(database_url: str = "sqlite:///./data/namaste_app.db"):
    engine = get_engine(database_url)
    create_db_and_tables(engine)
    return engine
