# backend/app/main.py
import os
import json
from uuid import uuid4
from datetime import datetime
from typing import Dict

import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import DreamCreate, Dream, DreamRenderResponse
from .inference_service import run_dream_inference

# --- FastAPI + CORS setup ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- S3 data lake setup ---

DATA_BUCKET = os.getenv("DATA_BUCKET", "dream-film-lake-dev-sachi")
s3_client = boto3.client("s3", region_name="us-west-2")

# in-memory store for now
dreams_db: Dict[str, Dream] = {}


def write_dream_to_s3(dream: Dream) -> None:
    created = dream.created_at
    key = f"raw/dream_journal_events/{created:%Y/%m/%d}/{dream.id}.json"

    body = json.dumps(dream.model_dump(), default=str)

    s3_client.put_object(
        Bucket=DATA_BUCKET,
        Key=key,
        Body=body.encode("utf-8"),
        ContentType="application/json",
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/dreams", response_model=Dream)
def create_dream(payload: DreamCreate):
    dream_id = str(uuid4())
    dream = Dream(
        id=dream_id,
        created_at=datetime.utcnow(),
        **payload.model_dump(),
    )
    dreams_db[dream_id] = dream

    try:
        write_dream_to_s3(dream)
    except Exception as e:
        print(f"Failed to write dream {dream_id} to S3: {e}")

    return dream


@app.get("/dreams", response_model=list[Dream])
def list_dreams():
    # simple list for now
    return list(dreams_db.values())


@app.get("/dreams/{dream_id}", response_model=Dream)
def get_dream(dream_id: str):
    dream = dreams_db.get(dream_id)
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    return dream


@app.post("/dreams/{dream_id}/render", response_model=DreamRenderResponse)
def render_dream(dream_id: str):
    dream = dreams_db.get(dream_id)
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    return run_dream_inference(dream)
