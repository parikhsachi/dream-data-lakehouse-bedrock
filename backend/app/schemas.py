# backend/app/schemas.py
# schemas for Dream entries and related data structures separated from Bedrock integration logic
from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import BaseModel


class DreamCreate(BaseModel):
    mood: Optional[int] = None    
    sleep_quality: Optional[int] = None 
    context_note: Optional[str] = None

    mbti: Optional[str] = None

    spotify_url: Optional[str] = None
    letterboxd_url: Optional[str] = None
    goodreads_url: Optional[str] = None

    listening_to: Optional[str] = None
    watching: Optional[str] = None
    reading: Optional[str] = None

    title: Optional[str] = None
    narrative: str


class PsychoMetadata(BaseModel):
    day_residues: Optional[List[str]] = None
    wish_fulfillment_type: Optional[str] = None
    key_signifiers: Optional[List[str]] = None
    subject_position: Optional[str] = None
    register_feel: Optional[str] = None


class Dream(DreamCreate):
    id: str
    created_at: datetime


class DreamRenderResponse(BaseModel):
    dream: Dream
    style_profile: Dict[str, Any]
    movie_script: str
    psychoanalysis: str
    psycho_metadata: Optional[PsychoMetadata] = None
    video_url: Optional[str] = None 

