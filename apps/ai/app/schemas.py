from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None


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
    recommended_tours: list[RecommendedTour] = Field(default_factory=list)
