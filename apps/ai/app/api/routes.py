import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import chat_collection, get_db
from app.schemas import ChatRequest, ChatResponse, RecommendedTour
from app.services.profile_signal_service import track_recommendation_signal
from app.services.rag_service import extract_intent_and_entities, run_advanced_rag

router = APIRouter()
logger = logging.getLogger(__name__)


async def persist_chat_history(
    request: ChatRequest,
    conversation: dict | None,
    new_messages: list[dict],
) -> None:
    if chat_collection is None:
        return

    try:
        if conversation:
            await chat_collection.update_one(
                {"session_id": request.session_id},
                {
                    "$push": {"messages": {"$each": new_messages}},
                    "$set": {"updated_at": datetime.utcnow()},
                },
            )
            return

        await chat_collection.insert_one(
            {
                "session_id": request.session_id,
                "user_id": request.user_id,
                "messages": new_messages,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )
    except Exception as exc:
        logger.exception(
            "Mongo write failed for session %s: %s", request.session_id, exc
        )


async def track_chat_signal(
    db: AsyncSession,
    request: ChatRequest,
    tours: list[dict],
    entities: dict,
) -> None:
    if not request.user_id:
        return

    try:
        await track_recommendation_signal(
            db,
            user_id=request.user_id,
            event_type="chat_intent",
            source="ai_chat",
            tour_id=tours[0]["tour_id"] if tours else None,
            destination=entities.get("destination"),
            metadata={
                "budget_max": entities.get("max_budget"),
                "duration_days": entities.get("duration_days"),
                "transport": entities.get("transport"),
                "adults": entities.get("adults"),
                "children": entities.get("children"),
                "infants": entities.get("infants"),
            },
        )
    except Exception as exc:
        logger.exception(
            "Recommendation tracking failed for session %s: %s",
            request.session_id,
            exc,
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    conversation = None
    if chat_collection is not None:
        try:
            conversation = await chat_collection.find_one(
                {"session_id": request.session_id}
            )
        except Exception as exc:
            logger.exception(
                "Mongo read failed for session %s: %s", request.session_id, exc
            )

    history = conversation["messages"] if conversation else []
    entities = await extract_intent_and_entities(request.message)
    reply, tours = await run_advanced_rag(db, request.message, history)

    recommended_tours = [
        RecommendedTour(
            tour_id=tour["tour_id"],
            name=tour["name"],
            price=float(tour["price"]),
            duration_days=tour["duration_days"],
            image_url=tour.get("image_url"),
            destination=tour.get("destination_name"),
        )
        for tour in tours
    ]

    new_messages = [
        {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": request.message,
            "created_at": datetime.utcnow(),
        },
        {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": reply,
            "recommended_tours": [
                recommended_tour.model_dump()
                for recommended_tour in recommended_tours
            ],
            "created_at": datetime.utcnow(),
        },
    ]

    await persist_chat_history(request, conversation, new_messages)
    await track_chat_signal(db, request, tours, entities)

    return ChatResponse(reply=reply, recommended_tours=recommended_tours)


@router.get("/conversations/{session_id}/messages")
async def get_messages(session_id: str):
    """Lấy lại lịch sử tin nhắn của một phiên làm việc."""

    if chat_collection is None:
        return []

    try:
        conversation = await chat_collection.find_one({"session_id": session_id})
    except Exception as exc:
        logger.exception("Mongo read failed for session %s: %s", session_id, exc)
        return []

    if not conversation:
        return []

    messages = conversation.get("messages", [])
    for message in messages:
        if "_id" in message:
            del message["_id"]

    return messages


@router.get("/health")
async def health():
    return {"status": "alive", "service": "Travel AI Service"}
