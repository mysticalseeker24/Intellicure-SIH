# Project Abstract — NAMASTE ↔ ICD-11 Lightweight Terminology Micro‑service

**Project title:** NAMASTE↔ICD-11 Lightweight FHIR Terminology Micro‑service with EmbeddingGemma reasoning, FAISS search, and ElevenLabs TTS/STT for prototype EMR integration

**Prepared for:** Smart India Hackathon / Prototype Development

**Date:** 2025-09-18

---

## Executive summary

This project builds a lightweight, standards‑compliant terminology micro‑service and EMR assistant that lets clinicians and patients record, search, and translate between India’s NAMASTE (AYUSH) disorder terminologies and WHO ICD‑11 (Traditional Medicine Module 2 — TM2 — and Biomedicine) codes. The service is implemented as a FHIR R4‑aware FastAPI backend coupled with a Vite + React + TypeScript frontend (patient & hospital views). Core intelligence is provided by a fine‑tuned **EmbeddingGemma** semantic embedding model (compact, multilingual) and **FAISS** for ultra‑fast semantic retrieval. ElevenLabs cloud APIs provide speech capabilities (STT transcription and TTS audio output). The prototype focuses on *lightweight* operation and low latency so it can be run on laptops and later adapted to mobile‑centric deployments.


## Problem statement & motivation

India’s Ayush sector is rapidly moving from paper to digital health records. NAMASTE provides standardized terminologies for Ayurveda, Siddha and Unani, while WHO’s ICD‑11 (TM2 + Biomed) provides a global interoperable disease coding framework. Harmonising NAMASTE with ICD‑11 in EMRs:

- enables accurate, dual/double coding (AYUSH + Biomed) for clinical documentation and insurance claims,
- enables morbidity analytics for the Ministry of Ayush and public health stakeholders,
- facilitates cross‑system retrieval (e.g., clinicians searching by symptoms, ICD code or NAMASTE term), and
- preserves legal & privacy requirements through ABHA/NDHM‑style authentication, consent and audit trails.

This project provides a minimal and practical implementation that demonstrates these capabilities with FHIR‑compliant artifacts, ConceptMap translations, fast semantic search and curated mapping support.


## Objectives

1. Ingest and normalise NAMASTE terminology (CSV/XLSX) and expose it as a FHIR `CodeSystem`.
2. Create and maintain `ConceptMap` resources linking NAMASTE ↔ ICD‑11 (TM2 & Biomed) with equivalence and provenance metadata.
3. Provide a REST auto‑complete and translation endpoint for EMR UIs, returning NAMASTE and ICD candidates and mapping confidences.
4. Implement a translation operation (NAMASTE ↔ TM2) that follows FHIR `ConceptMap` and $translate semantics, with ML fallback.
5. Accept FHIR Bundles (ProblemList / Condition) with double codings, enforce OAuth2 (ABHA mock for prototype), and record `Provenance` and `AuditEvent` entries to satisfy India’s EHR 2016 requirements.
6. Use a fine‑tuned EmbeddingGemma model with FAISS to provide semantic mapping, autocomplete, and curator‑assist features.
7. Integrate ElevenLabs for cloud STT (speech‑to‑text) and TTS (text‑to‑speech) to provide voice‑enabled UX for patients and clinicians.
8. Deliver a minimal, documented, containerised prototype with frontend demos (Patient / Hospital), ingestion scripts and reproducible model training recipe.


## Scope & deliverables (prototype)

- A FastAPI backend exposing FHIR‑aware endpoints: CodeSystem/ConceptMap read, `$translate` operation, autocomplete, mapping suggestion, FHIR Bundle ingest, admin & index management, and ElevenLabs TTS/STT wrappers.
- A Vite + React + TypeScript frontend with two roles: **Patient** (ABHA display, dialog widget for voice/text queries) and **Hospital (Doctor/Admin)** (patient search by ABHA, history viewer, problem list editor, mapping curator UI).
- Data artifacts: processed NAMASTE CSV, a mock patient dataset (ABHA IDs + history), FHIR CodeSystem JSON and ConceptMap JSON examples, and a FAISS index saved locally.
- Machine learning: fine‑tuning scripts for EmbeddingGemma (contrastive / triplet training), embedding precomputation, and FAISS index build scripts.
- Speech integration: ElevenLabs API adapters for STT & TTS.
- Documentation: README, OpenAPI spec, deployment instructions (Docker), and a short demo video.


## High‑level technical architecture

**Clients:** Browser (mobile‑responsive web), with audio capture and playback.

**Backend (FastAPI):**
- Authentication/authorization: OAuth2/JWT (mock ABHA tokens for prototype; clear hooks for real ABDM integration).
- FHIR handlers: parse/validate FHIR R4 Bundles, export CodeSystem & ConceptMap resources, implement `$translate` semantics and `bundle/ingest` endpoint that records Provenance/AuditEvent.
- ML & retrieval: EmbeddingGemma inference service, embedding precomputation for NAMASTE & ICD corpora, FAISS index for nearest‑neighbor retrieval.
- STT/TTS adapter: ElevenLabs integration for transcription and audio generation.
- Persistence: SQLite for patient records, ConceptMap metadata, audits; FAISS files + NumPy arrays (embeddings) on disk.

**Frontend (Vite + React + TypeScript):**
- Patient page: display ABHA, interactive dialog with mic & playback, show mapping suggestions and allow user feedback/accept.
- Hospital/Doctor page: patient search, history viewer, problem list editor (double coding), curator UI for mapping approvals.

**Model & Vector store:**
- Fine‑tuned EmbeddingGemma for semantic retrieval (server‑side inference initially).
- FAISS local index (HNSW or IndexFlatIP for prototypes) containing ICD features.

**Deployment:**
- Docker containers for backend & frontend; prototype runs locally on laptop. FAISS indices and model artifacts stored on local disk. The system is designed to be portable to small cloud VMs or mobile devices (if model is exported & quantized).


## Data pipeline & data model

1. **Source ingestion:** CSV/XLSX named NAMASTE dataset (code, term, script, transliteration, english gloss, definition, synonyms, ayush_system), optionally with prepopulated ICD mapping columns.
2. **Preprocessing:** cleaning, transliteration normalization, deduplication, creation of `embedding_text` fields that combine `term | script | english | description | synonyms` for robust multilingual embedding.
3. **Mapping candidates:** use exact/synonym/fuzzy matching heuristics followed by EmbeddingGemma k‑NN search on ICD index to produce top‑k mapping candidates and confidence scores.
4. **Curation:** low‑confidence or ambiguous candidates are routed to curator UI (doctor/admin) for manual labeling and provenance capture.
5. **Persistence:** final mappings are saved as FHIR `ConceptMap` resources and the problemlist entries are saved as FHIR `Condition` with dual codings.


## ML design & training plan

**Model:** EmbeddingGemma (fine‑tuned).

**Training data:** positive NAMASTE ↔ ICD pairs obtained from curated mappings in the dataset; augment with synonyms, transliteration variants and heuristically generated negatives.

**Loss & approach:**
- For pairwise training: MultipleNegativesRankingLoss or ContrastiveLoss.
- For triplet training: TripletLoss (anchor = NAMASTE, positive = mapped ICD, negative = sampled ICD).

**Hyperparameters (starter):** batch size 32–64, learning rate 2e‑5, epochs 2–5, warmup steps 10% total steps, use mixed precision where available.

**Output:** a finetuned model artifact that produces normalized embeddings (512 or 768 dims), then used to embed the entire ICD corpus and NAMASTE terms for production. Use MRL truncation if needed to reduce dimension.


## Search & mapping heuristics

- **Exact match** on normalized labels and synonyms → `equivalent` candidate.
- **Fuzzy string match** (Levenshtein / trigram) → high‑priority candidates.
- **Embedding KNN** via FAISS for semantic retrieval (primary ML component).
- **Equivalence rules**: convert similarity score to `equivalent`, `relatedto`, `narrower`, `broader` at calibrated thresholds; keep provenance and confidence with each mapping.


## FHIR integration details

- Generate a FHIR R4 `CodeSystem` for NAMASTE and store as JSON resources.
- Mappings exposed as FHIR `ConceptMap` resources. Each `ConceptMap` group element uses `equivalence` and `comment` fields to represent mapping detail and provenance.
- **Bundle ingest:** Accept FHIR Bundle (type `transaction`/`document`) containing `Condition` resources whose `code.coding` array contains both NAMASTE and ICD codings; validate and persist, and create `Provenance` and `AuditEvent` resources to satisfy India EHR audit rules.
- Implement a `ConceptMap/$translate` operation that finds mapping via ConceptMap first and falls back to ML suggestions (embedding/FAISS) if ConceptMap has no entry.


## API surface (high level)

A minimal list of API endpoints includes authentication, patient & hospital flows, STT/TTS proxying, embedding & search, mapping suggestion, FHIR bundle ingest, and admin operations (CSV ingest, finetune trigger, index build). A comprehensive set of ~22 endpoints is planned (auth, patient CRUD, stt/tts, embed, search, map, fhir endpoints, admin). Detailed OpenAPI will be provided as part of the deliverables.


## Speech integration (ElevenLabs)

- Backend forwards recorded audio from the browser to ElevenLabs STT endpoint to obtain a transcript; backend passes transcript to the embedding pipeline.
- Responses and short explanations are synthesized by ElevenLabs TTS on the backend and returned to the client for playback.
- ElevenLabs APIs require an API key (stored in server environment variables) and network connectivity; if offline operation is desired in future, integration with a local STT/TTS model (e.g., Whisper / VITS) is possible as an extension.


## Security, privacy & ABHA considerations

- Prototype uses mock ABHA tokens and a small local SQLite store with mock patient records (no real PHI). For real deployment: only accept ABHA/NDHM tokens and validate via ABDM endpoints, encrypt data at rest, implement RBAC for doctor vs patient roles, and record `AuditEvent` entries for all reads/writes per EHR standards.
- Consent handling: record `Consent` resource references for patient data sharing and reflect consent metadata in `Condition.meta` or secured extensions. Follow ISO 22600 model for access rules; record provenance for changes.


## Evaluation & metrics

- **Mapping quality:** Precision@1/3, Recall@k, MRR on a held‑out manually labeled test set (200–500 examples recommended).
- **Search latency:** median k‑NN query latency (target <50ms on laptop for FAISS HNSW prototype).
- **TTS/STT latency & accuracy:** per ElevenLabs SLAs and measured WER for STT transcriptions.
- **Usability:** human curator acceptance rate and time to curated mapping.


## Risks & mitigations

- **Ambiguous mappings:** many NAMASTE terms have no one‑to‑one ICD equivalent. Mitigate with human‑in‑the‑loop curation and conservative equivalence rules.
- **Licensing restrictions (WHO ICD / model weights):** consult and comply with WHO ICD license and EmbeddingGemma model card when redistributing model or ICD content.
- **Privacy & integration complexity with ABHA/ABDM:** prototype uses mock ABHA; full integration requires following ABDM docs for token validation and consent management.
- **ElevenLabs dependency:** TTS/STT requires network & API key; fallback must be planned for offline scenarios.


## Roadmap & milestones (recommended)

**Phase 0 — Setup & data prep (Days 0–3)**
- Finalise NAMASTE CSV and mock patient dataset. Generate processed embedding text files and finetune pairs.

**Phase 1 — Core ML & index (Days 4–10)**
- Finetune EmbeddingGemma on NAMASTE↔ICD pairs; precompute ICD embeddings; build FAISS index.

**Phase 2 — Backend integration (Days 11–17)**
- Implement FastAPI endpoints (embed, search, fhir bundle ingest, admin), ElevenLabs adapters, SQLite persistence.

**Phase 3 — Frontend & demo (Days 18–24)**
- Build React views (Patient & Hospital), wire media capture & playback, test end‑to‑end flows.

**Phase 4 — Testing & polish (Days 25–30)**
- Add curator UI, ABHA mock integration, build demo video, finalize documentation.

Adjust durations by team size and compute access (finetuning needs GPU; a small dataset and 1–2 epochs may suffice for prototype).


## Deliverables

- Source code (GitHub): backend, frontend, ML scripts, Dockerfiles.
- Processed NAMASTE CSV and finetune pairs, sample ICD embeddings and FAISS index.
- FHIR CodeSystem & ConceptMap JSONs (examples).
- OpenAPI spec, architecture diagrams and README.
- Short demo video and user guide for judges.


## Appendix A — Key design choices & rationale

- **EmbeddingGemma** chosen for compact footprint, multilingual capability and MRL truncation that supports small memory budgets.
- **FAISS** selected for local, high‑performance k‑NN and easy debugging for prototype.
- **ElevenLabs** chosen for high‑quality TTS and STT cloud APIs and ease of integration (Creator plan available to the team).
- **FastAPI + SQLite + Vite/React** selected for rapid development, type safety (TypeScript), and lightweight deployment.


## Appendix B — Sample FHIR representation (illustrative)

*Omitted from this abstract — full JSON examples for CodeSystem, ConceptMap, Condition and Provenance will be added to the project repository and documentation.*


## References & source material

- NAMASTE — National AYUSH Morbidity & Standardized Terminologies (Ministry of AYUSH) documentation and published papers.
- WHO ICD‑11 & Traditional Medicine Module (TM2) — ICD API documentation and coding rules.
- EmbeddingGemma model documentation (Google / Hugging Face) and fine‑tuning guides.
- FAISS index and HNSW guides (Facebook AI Research / Meta AI).
- ElevenLabs API documentation (STT & TTS).
- FHIR R4 specification (CodeSystem, ConceptMap, Condition, Provenance, Bundle, $translate operation).

---

*End of abstract.*

