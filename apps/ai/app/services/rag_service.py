import json
import os
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Dict, Any, Tuple
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.vectorstores import FAISS
from app.config import settings
from app.prompts import SYSTEM_PROMPT, ENTITY_EXTRACTION_PROMPT

# Sử dụng gpt-4o-mini để tối ưu chi phí và tốc độ
llm = ChatOpenAI(temperature=0.2, openai_api_key=settings.OPENAI_API_KEY, model="gpt-4o-mini")
embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY, model="text-embedding-3-small")

# Load Vector Store once
vector_store = None
if os.path.exists("data/faiss_index"):
    vector_store = FAISS.load_local("data/faiss_index", embeddings, allow_dangerous_deserialization=True)

# --- TOOLS DEFINITION ---

async def check_voucher(db: AsyncSession, code: str) -> str:
    """Kiểm tra mã giảm giá"""
    sql = "SELECT * FROM vouchers WHERE code = :code AND status = 1 AND expiry_date >= NOW()"
    result = await db.execute(text(sql), {"code": code.upper()})
    v = result.mappings().first()
    if not v:
        return "Mã giảm giá không tồn tại hoặc đã hết hạn."
    
    val = f"{v['discount_value']}%" if v['discount_type'] == 'percentage' else f"{v['discount_value']} VND"
    return f"Mã {code.upper()} hợp lệ! Bạn được giảm {val}. Điều kiện: Đơn hàng tối thiểu {v['min_order_value']:,.0f} VND."

async def get_destination_knowledge(db: AsyncSession, name: str) -> str:
    """Lấy kiến thức sâu về địa điểm (Ưu tiên DB, nếu không có dùng LLM fallback)"""
    sql = """
        SELECT l.name, dd.best_time, dd.cuisine, dd.highlights 
        FROM locations l
        LEFT JOIN destinations_detail dd ON l.location_id = dd.location_id
        WHERE l.name ILIKE :name
    """
    result = await db.execute(text(sql), {"name": f"%{name}%"})
    row = result.mappings().first()
    
    if row and row['cuisine']:
        return f"Thông tin về {row['name']}: \n- Thời điểm đẹp nhất: {row['best_time']}\n- Đặc sản nên thử: {row['cuisine']}\n- Điểm nổi bật: {row['highlights']}"
    
    fallback_prompt = f"Bạn là chuyên gia du lịch. Hãy cung cấp thông tin ngắn gọn về {name} gồm: Thời điểm đi đẹp nhất, đặc sản phải thử và các cảnh đẹp nổi bật."
    res = await llm.ainvoke([HumanMessage(content=fallback_prompt)])
    return f"Kiến thức du lịch về {name}: \n{res.content}"

async def calculate_tour_price(db: AsyncSession, tour_id: int, adults: int, children: int = 0, infants: int = 0) -> str:
    """Tính toán chính xác giá tour dựa trên bảng giá chi tiết"""
    # Lấy lịch trình gần nhất của tour
    sql_schedule = "SELECT tour_schedule_id, code FROM tour_schedules WHERE tour_id = :id AND status = 1 AND start_date >= NOW() ORDER BY start_date ASC LIMIT 1"
    res_s = await db.execute(text(sql_schedule), {"id": tour_id})
    s = res_s.mappings().first()
    if not s:
        return "Hiện tại tour này không có lịch khởi hành khả dụng để tính giá."
    
    sid = s['tour_schedule_id']
    # Lấy giá chi tiết cho từng passenger_type
    sql_prices = "SELECT passenger_type, price FROM tour_schedule_prices WHERE tour_schedule_id = :sid"
    res_p = await db.execute(text(sql_prices), {"sid": sid})
    price_rows = res_p.mappings().all()
    
    price_map = {row['passenger_type']: float(row['price']) for row in price_rows}
    
    # Giá mặc định nếu không tìm thấy trong price_map
    adult_p = price_map.get('ADULT', 0)
    child_p = price_map.get('CHILD', adult_p * 0.8)
    infant_p = price_map.get('INFANT', adult_p * 0.3)
    
    total = (adults * adult_p) + (children * child_p) + (infants * infant_p)
    
    details = f"- Người lớn: {adults} x {adult_p:,.0f}\n"
    if children > 0: details += f"- Trẻ em: {children} x {child_p:,.0f}\n"
    if infants > 0: details += f"- Em bé: {infants} x {infant_p:,.0f}\n"
    
    return f"Tổng chi phí dự kiến cho tour (Mã {s['code']}) là: **{total:,.0f} VND**\nChi tiết:\n{details}"

# --- CORE RAG LOGIC ---

async def extract_intent_and_entities(query: str) -> Dict[str, Any]:
    """Phân tích câu hỏi để trích xuất thực thể"""
    try:
        response = await llm.ainvoke([HumanMessage(content=ENTITY_EXTRACTION_PROMPT.format(query=query))])
        content = response.content.strip().replace("```json", "").replace("```", "")
        return json.loads(content)
    except:
        return {"destination": None, "max_budget": None, "duration_days": None, "transport": None, "adults": 1, "children": 0, "infants": 0}

async def retrieve_tours_hybrid(db: AsyncSession, query: str, entities: Dict[str, Any]) -> List[Dict]:
    """Truy vấn lai (Hybrid Search)"""
    sql = """
        SELECT DISTINCT ON (t.tour_id) 
               t.tour_id, t.name, ts.price, t.duration_days, t.description,
               ts.start_date, ti.image_url, l.name as destination_name
        FROM tours t
        INNER JOIN tour_schedules ts ON t.tour_id = ts.tour_id
        LEFT JOIN tour_images ti ON t.tour_id = ti.tour_id AND ti.is_cover = 1
        LEFT JOIN tour_destinations td ON t.tour_id = td.tour_id AND td.visit_order = 1
        LEFT JOIN locations l ON td.location_id = l.location_id
        WHERE t.status = 1 
          AND ts.status = 1
          AND ts.start_date >= CURRENT_DATE
          AND ts.quota > ts.booked_count
    """
    params = {}
    if entities.get("duration_days"):
        sql += " AND t.duration_days <= :days"
        params["days"] = entities["duration_days"]
    if entities.get("max_budget"):
        sql += " AND ts.price <= :budget"
        params["budget"] = entities["max_budget"]

    sql += " ORDER BY t.tour_id, ts.start_date ASC"
    result = await db.execute(text(sql), params)
    sql_tours = {row["tour_id"]: dict(row) for row in result.mappings().all()}

    semantic_tour_ids = []
    if vector_store:
        docs = vector_store.similarity_search(query, k=10)
        semantic_tour_ids = [doc.metadata["tour_id"] for doc in docs]

    final_tours = []
    seen_ids = set()
    for tid in semantic_tour_ids:
        if tid in sql_tours:
            final_tours.append(sql_tours[tid])
            seen_ids.add(tid)
    
    for tid, tour in sql_tours.items():
        if tid not in seen_ids:
            if entities.get("destination"):
                dest = entities["destination"].lower()
                if dest in tour['name'].lower() or (tour.get('destination_name') and dest in tour['destination_name'].lower()):
                    final_tours.append(tour)
            else:
                final_tours.append(tour)

    for t in final_tours:
        if t.get("start_date") and isinstance(t["start_date"], datetime):
            t["start_date"] = t["start_date"].strftime("%d/%m/%Y")

    return final_tours[:5]

async def run_advanced_rag(db: AsyncSession, query: str, history: List[Dict]) -> Tuple[str, List[Dict]]:
    # 1. Hiểu câu hỏi
    entities = await extract_intent_and_entities(query)
    
    # 2. Hybrid Retrieval (Tours)
    tours = await retrieve_tours_hybrid(db, query, entities)
    
    # 3. Dynamic Knowledge
    extra_knowledge = ""
    target_dest = entities.get("destination")
    if not target_dest and tours:
        target_dest = tours[0].get("destination_name")
    
    if target_dest:
        extra_knowledge = await get_destination_knowledge(db, target_dest)

    # 4. Calculator & Voucher Tools
    # Nếu khách hỏi về giá hoặc số lượng người
    if any(k in query.lower() for k in ["giá", "nhiêu", "tiền", "người", "trẻ em", "bé"]):
        if tours:
            # Lấy số lượng người từ entities (giả định LLM trích xuất được)
            a = entities.get("adults", 1)
            c = entities.get("children", 0)
            i = entities.get("infants", 0)
            # Nếu LLM không trích xuất được nhưng có từ khóa, thử đoán từ query
            if a == 1 and "2 người" in query: a = 2
            
            calc_res = await calculate_tour_price(db, tours[0]["tour_id"], a, c, i)
            extra_knowledge += f"\n\n{calc_res}"

    if "voucher" in query.lower() or "mã" in query.lower():
        words = query.split()
        for w in words:
            clean_w = w.strip(".,!?\"'").upper()
            if len(clean_w) >= 5:
                v_res = await check_voucher(db, clean_w)
                if "hợp lệ" in v_res:
                    extra_knowledge += f"\n\n{v_res}"

    # 5. Context
    context_data = []
    for t in tours:
        context_data.append({
            "id": t["tour_id"],
            "tên": t["name"],
            "giá niêm yết": f"{t['price']} VND",
            "khởi hành": t.get("start_date"),
            "thời gian": f"{t['duration_days']} ngày"
        })
    
    context = json.dumps(context_data, ensure_ascii=False)
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in history[-5:]])
    
    # 6. Final Prompt
    final_system_prompt = SYSTEM_PROMPT + f"\n\nKIẾN THỨC & CÔNG CỤ HỖ TRỢ:\n{extra_knowledge}\n\nHãy sử dụng dữ liệu từ công cụ tính toán để báo giá chính xác nhất cho khách."
    
    messages = [
        SystemMessage(content=final_system_prompt.format(context=context, history=history_text)),
        HumanMessage(content=query)
    ]
    
    response = await llm.ainvoke(messages)
    return response.content, tours
