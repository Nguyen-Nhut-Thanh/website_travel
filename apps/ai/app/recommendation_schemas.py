from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendationRequest(BaseModel):
    tour_id: Optional[int] = None
    user_id: Optional[int] = None
    destination: Optional[str] = None
    departure_location: Optional[str] = None
    budget_max: Optional[float] = None
    duration_days: Optional[int] = None
    preferred_month: Optional[int] = Field(default=None, ge=1, le=12)
    group_type: Optional[str] = None
    travel_style: Optional[str] = None
    limit: int = Field(default=8, ge=1, le=24)
    exclude_tour_ids: List[int] = Field(default_factory=list)


class RecommendationScoreBreakdown(BaseModel):
    final_score: float
    content_score: float
    knowledge_score: float
    business_score: float


class RecommendationItem(BaseModel):
    tour_id: int
    name: str
    code: Optional[str] = None
    price: float
    duration_days: int
    duration_nights: int
    departure_location: Optional[str] = None
    destination: Optional[str] = None
    image_url: Optional[str] = None
    reasons: List[str] = Field(default_factory=list)
    score_breakdown: RecommendationScoreBreakdown


class RecommendationResponse(BaseModel):
    strategy: str = "hybrid_content_knowledge"
    total_candidates: int
    recommendations: List[RecommendationItem]
