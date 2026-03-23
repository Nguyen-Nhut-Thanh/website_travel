from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.schemas import ChatRequest, ChatResponse, RecommendedTour
from app.database import get_db, chat_collection
from app.services.rag_service import extract_intent_and_entities, run_advanced_rag
from app.services.profile_signal_service import track_recommendation_signal

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # 1. Truy vấn lịch sử hội thoại từ MongoDB bằng session_id
    conv = await chat_collection.find_one({"session_id": request.session_id})
    history = conv["messages"] if conv else []
    
    entities = await extract_intent_and_entities(request.message)

    # 2. Xử lý RAG nâng cao để sinh câu trả lời
    reply, tours = await run_advanced_rag(db, request.message, history)
    
    # 3. Định dạng danh sách tour gợi ý gửi về frontend
    recs = [
        RecommendedTour(
            tour_id=t["tour_id"],
            name=t["name"],
            price=float(t["price"]),
            duration_days=t["duration_days"],
            image_url=t.get("image_url"),
            destination=t.get("destination_name")
        ) for t in tours
    ]
    
    # 4. Cấu trúc tin nhắn mới để lưu trữ
    new_msgs = [
        {"id": str(uuid.uuid4()), "role": "user", "content": request.message, "created_at": datetime.utcnow()},
        {
            "id": str(uuid.uuid4()), 
            "role": "assistant", 
            "content": reply, 
            "recommended_tours": [r.model_dump() for r in recs],
            "created_at": datetime.utcnow()
        }
    ]
    
    # 5. Cập nhật hoặc tạo mới hội thoại trong MongoDB
    if conv:
        await chat_collection.update_one(
            {"session_id": request.session_id},
            {
                "$push": {"messages": {"$each": new_msgs}}, 
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    else:
        await chat_collection.insert_one({
            "session_id": request.session_id,
            "user_id": request.user_id,
            "messages": new_msgs,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
    return ChatResponse(reply=reply, recommended_tours=recs)

@router.get("/conversations/{session_id}/messages")
async def get_messages(session_id: str):
    """Lấy lại lịch sử tin nhắn của một phiên làm việc"""
    conv = await chat_collection.find_one({"session_id": session_id})
    if not conv:
        return []
    
    messages = conv.get("messages", [])
    # Xử lý để trả về dữ liệu sạch cho frontend
    for m in messages:
        if "_id" in m: del m["_id"]
    return messages

@router.get("/health")
async def health():
    return {"status": "alive", "service": "Travel AI Service"}
    if request.user_id:
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
