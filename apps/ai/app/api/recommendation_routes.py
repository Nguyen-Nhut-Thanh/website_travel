from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.recommendation_schemas import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import recommend_tours


router = APIRouter()


@router.post("/recommendations/hybrid", response_model=RecommendationResponse)
async def hybrid_recommendations(
    request: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
):
    return await recommend_tours(db, request)
