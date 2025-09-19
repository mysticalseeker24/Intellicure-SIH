# backend/app/main.py
import os
import json
import time
import base64
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session, select
from .db import init_db, get_engine, create_db_and_tables
from .models import Patient, ConditionRecord, ConceptMapRecord, AuditEvent
from .ml_utils import EmbeddingService
from .faiss_utils import FaissService, fallback_search_icd
from .elevenlabs import elevenlabs_stt, elevenlabs_tts
from .fhir_utils import validate_fhir_bundle
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(title="IntelliCure - NAMASTE Terminology Microservice")

# CORS - allow frontend dev origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and services
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data/namaste_app.db")
MODEL_DIR = os.environ.get("FINETUNED_MODEL_DIR", "./models/gemma_finetuned")
FAISS_INDEX_PATH = os.environ.get("FAISS_INDEX_PATH", "./data/faiss_icd_hnsw.idx")
FAISS_META_PATH = os.environ.get("FAISS_META_PATH", "./data/icd_meta.npy")
ICD_CORPUS_CSV = os.environ.get("ICD_CORPUS_CSV", "./data/icd_corpus.csv")
ELEVEN_KEY = os.environ.get("ELEVEN_API_KEY", "")

engine = get_engine(DATABASE_URL)
create_db_and_tables(engine)

# instantiate ML / FAISS wrappers (these will try to load model/index if present)
embed_svc = EmbeddingService(model_dir=MODEL_DIR)
faiss_svc = FaissService(index_path=FAISS_INDEX_PATH, meta_path=FAISS_META_PATH, icd_csv=ICD_CORPUS_CSV)

# Simple ping
@app.get("/admin/status")
def status():
    return {
        "ok": True,
        "model_loaded": embed_svc.model_loaded,
        "faiss_loaded": faiss_svc.index_loaded,
        "icd_count": faiss_svc.n_items,
        "time": time.time()
    }

# Enhanced login endpoint with role support
@app.post("/api/login")
def login(user: Dict[str, str]):
    # Prototype: accept any username/password and return a fake token with role
    username = user.get("username", "test")
    password = user.get("password", "")
    role = user.get("role", "doctor")  # Default to doctor for backward compatibility
    
    # Mock user validation - in real implementation, validate against database
    # For prototype, determine role based on username patterns or explicit role selection
    if role == "patient" or username.endswith("@patient.com"):
        user_role = "patient"
        user_name = f"Patient {username.split('@')[0] if '@' in username else username}"
    elif role == "doctor" or username.endswith("@hospital.com"):
        user_role = "doctor" 
        user_name = f"Dr. {username.split('@')[0] if '@' in username else username}"
    else:
        user_role = "doctor"  # Default fallback
        user_name = f"Dr. {username.split('@')[0] if '@' in username else username}"
    
    token = f"demo-token-for-{username}"
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "username": username,
        "role": user_role,
        "name": user_name,
        "user_id": f"user_{username.replace('@', '_').replace('.', '_')}"
    }

# STT endpoint - accepts audio, returns transcript (uses ElevenLabs)
@app.post("/api/stt")
async def stt(file: UploadFile = File(...)):
    """
    Speech-to-Text endpoint using ElevenLabs API.
    Accepts audio file and returns transcript.
    """
    if not ELEVEN_KEY:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        contents = await file.read()
        logger.info(f"Processing audio file: {file.filename}, size: {len(contents)} bytes")
        
        transcript = elevenlabs_stt(audio_bytes=contents, api_key=ELEVEN_KEY)
        logger.info(f"STT successful: {transcript}")
        
        return {"transcript": transcript}
    except Exception as e:
        logger.exception("STT failed")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")

# TTS endpoint - returns audio bytes
class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None

@app.post("/api/tts")
def tts(req: TTSRequest):
    """
    Text-to-Speech endpoint using ElevenLabs API.
    Accepts text and returns base64-encoded audio.
    """
    if not ELEVEN_KEY:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
    
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        logger.info(f"Processing TTS request: {req.text[:50]}...")
        
        audio_bytes = elevenlabs_tts(text=req.text, api_key=ELEVEN_KEY, voice=req.voice)
        logger.info(f"TTS successful, generated {len(audio_bytes)} bytes")
        
        # Convert to base64 for JSON response
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {"audio_base64": audio_base64}
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

# Embed endpoint - return vector (raw list)
class TextIn(BaseModel):
    text: str

@app.post("/api/embed")
def embed_text(inp: TextIn):
    vec = embed_svc.embed([inp.text])[0]
    return {"vector": vec.tolist(), "dim": len(vec)}

# ICD search endpoint (uses FAISS if available, otherwise fallback)
class SearchIn(BaseModel):
    text: str
    k: Optional[int] = 5

@app.post("/api/search/icd")
def search_icd(inp: SearchIn):
    # try to use FAISS with embedding service
    if faiss_svc.index_loaded and embed_svc.model_loaded:
        results = faiss_svc.search_text_with_embedding(inp.text, embed_svc, k=inp.k)
        return {"source": "faiss", "candidates": results}
    else:
        # fallback: use text fuzzy search over ICD corpus
        results = fallback_search_icd(inp.text, faiss_svc.icd_list, k=inp.k)
        return {"source": "fuzzy", "candidates": results}

# FHIR bundle ingest - simple validation and persist Condition(s) with dual coding
@app.post("/fhir/bundle/ingest")
async def ingest_bundle(bundle: Dict[str, Any]):
    # Validate basic FHIR structure (using fhir.resources in fhir_utils)
    try:
        valid = validate_fhir_bundle(bundle)
        # persist Conditions found (very simple)
        saved = []
        with Session(engine) as session:
            entries = bundle.get("entry", [])
            for e in entries:
                res = e.get("resource", {})
                if res.get("resourceType") == "Condition":
                    # extract codes
                    code = res.get("code", {})
                    codings = code.get("coding", [])
                    namaste = None; icd = None
                    for c in codings:
                        sys = c.get("system","")
                        if "namaste" in sys.lower():
                            namaste = c
                        if "icd" in sys.lower() or "who" in sys.lower():
                            icd = c
                    cond = ConditionRecord(
                        patient_reference = res.get("subject", {}).get("reference"),
                        namaste_code = namaste.get("code") if namaste else None,
                        namaste_display = namaste.get("display") if namaste else None,
                        icd_code = icd.get("code") if icd else None,
                        icd_display = icd.get("display") if icd else None,
                    )
                    session.add(cond)
                    session.commit()
                    saved.append({"id": cond.id, "namaste": cond.namaste_code, "icd": cond.icd_code})
            # audit event
            ae = AuditEvent(action="bundle_ingest", user="api", resource=json.dumps(bundle))
            session.add(ae)
            session.commit()
        return {"status":"accepted","saved": saved}
    except Exception as e:
        logger.exception("Bundle ingest failed")
        raise HTTPException(status_code=400, detail=str(e))

# Simple admin endpoint to ingest CSV into ConceptMap records (CSV must be uploaded previously to data/)
@app.post("/admin/ingest/icd_corpus_reload")
def admin_reload_icd():
    # triggers faiss_svc to reload corpus from ICD_CORPUS_CSV
    faiss_svc.load_icd_corpus()
    return {"reloaded": True, "icd_count": faiss_svc.n_items}

# Admin endpoint to rebuild FAISS index (placeholder: calls script)
@app.post("/admin/rebuild_index")
def admin_rebuild_index(background_tasks: BackgroundTasks):
    # This triggers index build in background (the real script is ml/build_faiss_index.py)
    def bg_build():
        logger.info("Admin triggered FAISS build (please run ml/build_faiss_index.py externally in production).")
    background_tasks.add_task(bg_build)
    return {"started": True}

# Basic patient endpoints
@app.get("/api/patient/{abha_id}")
def get_patient(abha_id: str):
    with Session(engine) as session:
        stmt = select(Patient).where(Patient.abha_id == abha_id)
        p = session.exec(stmt).first()
        if not p:
            raise HTTPException(status_code=404, detail="Patient not found")
        return p

@app.get("/api/patient/{abha_id}/history")
def patient_history(abha_id: str):
    with Session(engine) as session:
        stmt = select(ConditionRecord).where(ConditionRecord.patient_reference == f"Patient/{abha_id}")
        r = session.exec(stmt).all()
        return {"history": r}

# Health / debug route
@app.get("/ping")
def ping():
    return {"ok": True, "time": time.time()}
