from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    message: str

class RecommendedTour(BaseModel):
    tour_id: int
    name: str
    price: float
    duration_days: int
    image_url: Optional[str] = None
    destination: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    recommended_tours: List[RecommendedTour] = []
