# backend/app/models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    abha_id: str
    name: Optional[str] = None
    dob: Optional[str] = None
    meta: Optional[str] = None  # JSON string for demo

class ConditionRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    patient_reference: Optional[str] = None  # e.g. "Patient/ABHA-1234"
    namaste_code: Optional[str] = None
    namaste_display: Optional[str] = None
    icd_code: Optional[str] = None
    icd_display: Optional[str] = None
    provenance: Optional[str] = None

class ConceptMapRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_system: str
    source_code: str
    target_system: str
    target_code: str
    equivalence: Optional[str] = None
    confidence: Optional[float] = None
    curator: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None  # Small JSON string
