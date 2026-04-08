from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
import json
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.recommendation_schemas import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    RecommendationScoreBreakdown,
)


@dataclass
class UserPreferenceProfile:
    avg_budget: Optional[float] = None
    avg_duration: Optional[float] = None
    top_departure: Optional[str] = None
    top_destinations: List[str] = field(default_factory=list)
    travel_scope: Optional[str] = None
    preferred_styles: List[str] = field(default_factory=list)
    preferred_themes: List[str] = field(default_factory=list)
    budget_band: Optional[str] = None
    preferred_duration_band: Optional[str] = None
    preferred_group_type: Optional[str] = None
    preferred_departure: Optional[str] = None
    adventure_level: Optional[str] = None
    allow_behavior_tracking: bool = True
    allow_chat_signals: bool = True


def _normalize_text(value: Optional[str]) -> str:
    return (value or "").strip().lower()


def _closeness_score(left: Optional[float], right: Optional[float], scale: float) -> float:
    if left is None or right is None or scale <= 0:
        return 0.0
    distance = abs(left - right)
    return max(0.0, 1.0 - min(distance / scale, 1.0))


def _keyword_flags(text_value: str) -> Dict[str, bool]:
    content = _normalize_text(text_value)
    return {
        "family": any(token in content for token in ["gia đình", "trẻ em", "nhẹ nhàng", "nghỉ dưỡng"]),
        "couple": any(token in content for token in ["cặp đôi", "lãng mạn", "resort", "honeymoon"]),
        "adventure": any(token in content for token in ["khám phá", "trek", "leo", "adventure"]),
        "photo": any(token in content for token in ["check-in", "sống ảo", "chụp ảnh", "view đẹp"]),
        "relax": any(token in content for token in ["nghỉ dưỡng", "resort", "thư giãn", "biển"]),
    }


def _infer_group_match(candidate_text: str, group_type: Optional[str]) -> float:
    if not group_type:
        return 0.0
    flags = _keyword_flags(candidate_text)
    group_key = _normalize_text(group_type)
    if group_key in {"family", "gia đình"} and flags["family"]:
        return 1.0
    if group_key in {"couple", "cap doi", "cặp đôi"} and flags["couple"]:
        return 1.0
    if group_key in {"friends", "nhóm bạn"} and flags["adventure"]:
        return 0.7
    return 0.0


def _infer_style_match(candidate_text: str, travel_style: Optional[str]) -> float:
    if not travel_style:
        return 0.0
    flags = _keyword_flags(candidate_text)
    style_key = _normalize_text(travel_style)
    mapping = {
        "nghỉ dưỡng": "relax",
        "relax": "relax",
        "khám phá": "adventure",
        "adventure": "adventure",
        "checkin": "photo",
        "check-in": "photo",
        "chụp ảnh": "photo",
    }
    target = mapping.get(style_key)
    if target and flags.get(target):
        return 1.0
    return 0.0


async def _load_reference_tour(db: AsyncSession, tour_id: int) -> Optional[Dict[str, Any]]:
    sql = """
        SELECT
            t.tour_id,
            t.code,
            t.name,
            t.summary,
            t.description,
            t.duration_days,
            t.duration_nights,
            t.tour_type,
            dep.name AS departure_location_name,
            dest.name AS destination_name,
            ts.price AS upcoming_price
        FROM tours t
        LEFT JOIN locations dep ON dep.location_id = t.departure_location
        LEFT JOIN LATERAL (
            SELECT location_id
            FROM tour_destinations
            WHERE tour_id = t.tour_id
            ORDER BY visit_order DESC
            LIMIT 1
        ) td ON true
        LEFT JOIN locations dest ON dest.location_id = td.location_id
        LEFT JOIN LATERAL (
            SELECT price
            FROM tour_schedules
            WHERE tour_id = t.tour_id
              AND status = 1
              AND start_date >= CURRENT_DATE
              AND quota > booked_count
            ORDER BY start_date ASC
            LIMIT 1
        ) ts ON true
        WHERE t.tour_id = :tour_id
          AND t.status = 1
        LIMIT 1
    """
    result = await db.execute(text(sql), {"tour_id": tour_id})
    row = result.mappings().first()
    return dict(row) if row else None


async def _build_user_profile(db: AsyncSession, user_id: Optional[int]) -> UserPreferenceProfile:
    if not user_id:
        return UserPreferenceProfile()

    profile_result = await db.execute(
        text(
            """
            SELECT
                travel_scope,
                preferred_styles,
                preferred_themes,
                budget_band,
                preferred_duration_band,
                preferred_group_type,
                preferred_departure,
                adventure_level,
                allow_behavior_tracking,
                allow_chat_signals
            FROM recommendation_profiles
            WHERE user_id = :user_id
            LIMIT 1
            """
        ),
        {"user_id": user_id},
    )
    profile_row = profile_result.mappings().first()

    sql = """
        SELECT
            b.total_amount,
            t.duration_days,
            dep.name AS departure_location_name,
            dest.name AS destination_name
        FROM bookings b
        INNER JOIN tour_schedules ts ON ts.tour_schedule_id = b.tour_schedule_id
        INNER JOIN tours t ON t.tour_id = ts.tour_id
        LEFT JOIN locations dep ON dep.location_id = t.departure_location
        LEFT JOIN LATERAL (
            SELECT location_id
            FROM tour_destinations
            WHERE tour_id = t.tour_id
            ORDER BY visit_order DESC
            LIMIT 1
        ) td ON true
        LEFT JOIN locations dest ON dest.location_id = td.location_id
        WHERE b.user_id = :user_id
        ORDER BY b.created_at DESC
        LIMIT 12
    """
    result = await db.execute(text(sql), {"user_id": user_id})
    rows = [dict(row) for row in result.mappings().all()]
    if not rows:
        return UserPreferenceProfile()

    budgets = [float(row["total_amount"]) for row in rows if row.get("total_amount") is not None]
    durations = [float(row["duration_days"]) for row in rows if row.get("duration_days") is not None]
    departures = [_normalize_text(row.get("departure_location_name")) for row in rows if row.get("departure_location_name")]
    destinations = [_normalize_text(row.get("destination_name")) for row in rows if row.get("destination_name")]

    departure_counter = Counter(departures)
    destination_counter = Counter(destinations)

    event_destinations: List[str] = []
    if not profile_row or profile_row.get("allow_behavior_tracking", True):
        event_result = await db.execute(
            text(
                """
                SELECT destination, metadata_json
                FROM recommendation_events
                WHERE user_id = :user_id
                  AND event_type IN ('tour_view', 'tour_click', 'chat_intent')
                ORDER BY created_at DESC
                LIMIT 40
                """
            ),
            {"user_id": user_id},
        )
        for row in event_result.mappings().all():
            if row.get("destination"):
                event_destinations.append(_normalize_text(row["destination"]))

    return UserPreferenceProfile(
        avg_budget=(sum(budgets) / len(budgets)) if budgets else None,
        avg_duration=(sum(durations) / len(durations)) if durations else None,
        top_departure=departure_counter.most_common(1)[0][0] if departure_counter else None,
        top_destinations=[
            name
            for name, _count in (destination_counter + Counter(event_destinations)).most_common(4)
        ],
        travel_scope=profile_row.get("travel_scope") if profile_row else None,
        preferred_styles=(
            json.loads(profile_row["preferred_styles"])
            if profile_row and profile_row.get("preferred_styles")
            else []
        ),
        preferred_themes=(
            json.loads(profile_row["preferred_themes"])
            if profile_row and profile_row.get("preferred_themes")
            else []
        ),
        budget_band=profile_row.get("budget_band") if profile_row else None,
        preferred_duration_band=profile_row.get("preferred_duration_band")
        if profile_row
        else None,
        preferred_group_type=profile_row.get("preferred_group_type") if profile_row else None,
        preferred_departure=profile_row.get("preferred_departure") if profile_row else None,
        adventure_level=profile_row.get("adventure_level") if profile_row else None,
        allow_behavior_tracking=profile_row.get("allow_behavior_tracking", True)
        if profile_row
        else True,
        allow_chat_signals=profile_row.get("allow_chat_signals", True) if profile_row else True,
    )


async def _load_candidate_tours(
    db: AsyncSession,
    request: RecommendationRequest,
    reference_tour: Optional[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    sql = """
        SELECT
            t.tour_id,
            t.code,
            t.name,
            t.summary,
            t.description,
            t.duration_days,
            t.duration_nights,
            t.tour_type,
            dep.name AS departure_location_name,
            dest.name AS destination_name,
            ts.tour_schedule_id,
            ts.price,
            ts.start_date,
            ts.quota,
            ts.booked_count,
            CASE
                WHEN fd.deal_id IS NOT NULL
                     AND fd.status = 1
                     AND fd.start_date <= NOW()
                     AND fd.end_date >= NOW()
                THEN 1 ELSE 0
            END AS has_flash_deal,
            ti.image_url
        FROM tours t
        INNER JOIN LATERAL (
            SELECT *
            FROM tour_schedules
            WHERE tour_id = t.tour_id
              AND status = 1
              AND start_date >= CURRENT_DATE
              AND quota > booked_count
            ORDER BY start_date ASC
            LIMIT 1
        ) ts ON true
        LEFT JOIN flash_deals fd ON fd.tour_schedule_id = ts.tour_schedule_id
        LEFT JOIN locations dep ON dep.location_id = t.departure_location
        LEFT JOIN LATERAL (
            SELECT location_id
            FROM tour_destinations
            WHERE tour_id = t.tour_id
            ORDER BY visit_order DESC
            LIMIT 1
        ) td ON true
        LEFT JOIN locations dest ON dest.location_id = td.location_id
        LEFT JOIN tour_images ti
            ON ti.tour_id = t.tour_id
           AND ti.is_cover = 1
        WHERE t.status = 1
    """
    params: Dict[str, Any] = {}

    if request.tour_id:
        sql += " AND t.tour_id != :current_tour_id"
        params["current_tour_id"] = request.tour_id

    budget_anchor = request.budget_max or (float(reference_tour["upcoming_price"]) if reference_tour and reference_tour.get("upcoming_price") else None)
    if budget_anchor:
        sql += " AND ts.price <= :max_price"
        params["max_price"] = budget_anchor * 1.5

    duration_anchor = request.duration_days or (int(reference_tour["duration_days"]) if reference_tour and reference_tour.get("duration_days") else None)
    if duration_anchor:
        sql += " AND t.duration_days BETWEEN :min_days AND :max_days"
        params["min_days"] = max(1, duration_anchor - 2)
        params["max_days"] = duration_anchor + 3

    departure_anchor = request.departure_location or (reference_tour.get("departure_location_name") if reference_tour else None)
    if departure_anchor:
        sql += " AND dep.name ILIKE :departure_location"
        params["departure_location"] = f"%{departure_anchor}%"

    destination_anchor = request.destination or (reference_tour.get("destination_name") if reference_tour else None)
    if destination_anchor:
        sql += " AND dest.name ILIKE :destination_name"
        params["destination_name"] = f"%{destination_anchor}%"

    sql += " ORDER BY ts.start_date ASC LIMIT 200"
    result = await db.execute(text(sql), params)
    rows = [dict(row) for row in result.mappings().all()]
    if not request.exclude_tour_ids:
        return rows
    exclude_ids = set(request.exclude_tour_ids)
    return [row for row in rows if int(row["tour_id"]) not in exclude_ids]


def _score_content(
    candidate: Dict[str, Any],
    request: RecommendationRequest,
    reference_tour: Optional[Dict[str, Any]],
) -> tuple[float, List[str]]:
    score = 0.0
    reasons: List[str] = []

    ref_destination = _normalize_text(request.destination or (reference_tour or {}).get("destination_name"))
    ref_departure = _normalize_text(request.departure_location or (reference_tour or {}).get("departure_location_name"))
    ref_type = _normalize_text((reference_tour or {}).get("tour_type"))
    ref_duration = request.duration_days or (reference_tour or {}).get("duration_days")
    ref_price = request.budget_max or (reference_tour or {}).get("upcoming_price")

    candidate_destination = _normalize_text(candidate.get("destination_name"))
    candidate_departure = _normalize_text(candidate.get("departure_location_name"))
    candidate_type = _normalize_text(candidate.get("tour_type"))
    candidate_duration = candidate.get("duration_days")
    candidate_price = float(candidate.get("price") or 0)

    if ref_destination and candidate_destination and ref_destination == candidate_destination:
        score += 0.32
        reasons.append("Cùng điểm đến")

    if ref_departure and candidate_departure and ref_departure == candidate_departure:
        score += 0.14
        reasons.append("Cùng điểm khởi hành")

    if ref_type and candidate_type and ref_type == candidate_type:
        score += 0.10

    if ref_duration:
        duration_score = _closeness_score(float(ref_duration), float(candidate_duration or 0), 4)
        score += duration_score * 0.20
        if duration_score >= 0.75:
            reasons.append("Thời lượng gần giống")

    if ref_price:
        price_score = _closeness_score(float(ref_price), candidate_price, max(float(ref_price) * 0.6, 1))
        score += price_score * 0.24
        if price_score >= 0.75:
            reasons.append("Mức giá gần với nhu cầu")

    return min(score, 1.0), reasons


def _score_knowledge(
    candidate: Dict[str, Any],
    request: RecommendationRequest,
    user_profile: UserPreferenceProfile,
) -> tuple[float, List[str]]:
    score = 0.0
    reasons: List[str] = []

    quota = int(candidate.get("quota") or 0)
    booked = int(candidate.get("booked_count") or 0)
    remaining = max(quota - booked, 0)
    fill_ratio = (remaining / quota) if quota > 0 else 0
    score += min(fill_ratio, 1.0) * 0.18
    if remaining > 0:
        reasons.append("Còn chỗ khả dụng")

    if candidate.get("has_flash_deal"):
        score += 0.16
        reasons.append("Đang có ưu đãi giờ chót")

    candidate_text = " ".join(
        str(part or "")
        for part in [
            candidate.get("name"),
            candidate.get("summary"),
            candidate.get("description"),
            candidate.get("destination_name"),
        ]
    )

    group_match = _infer_group_match(candidate_text, request.group_type)
    if group_match > 0:
        score += group_match * 0.18
        reasons.append("Phù hợp nhóm đi")

    style_match = _infer_style_match(candidate_text, request.travel_style)
    if style_match > 0:
        score += style_match * 0.14
        reasons.append("Đúng phong cách chuyến đi")

    candidate_departure = _normalize_text(candidate.get("departure_location_name"))
    if user_profile.top_departure and candidate_departure == user_profile.top_departure:
        score += 0.12
        reasons.append("Hợp thói quen khởi hành")
    elif user_profile.preferred_departure and candidate_departure == _normalize_text(user_profile.preferred_departure):
        score += 0.14
        reasons.append("Khớp điểm khởi hành ưu tiên")

    candidate_destination = _normalize_text(candidate.get("destination_name"))
    if candidate_destination and candidate_destination in user_profile.top_destinations:
        score += 0.12
        reasons.append("Gần với lịch sử điểm đến đã chọn")

    candidate_type = _normalize_text(candidate.get("tour_type"))
    if user_profile.travel_scope:
        scope = _normalize_text(user_profile.travel_scope)
        if scope == "mixed":
            score += 0.03
        elif scope == "domestic" and candidate_type == "domestic":
            score += 0.10
            reasons.append("Đúng phạm vi du lịch ưa thích")
        elif scope in {"outbound", "international"} and candidate_type == "outbound":
            score += 0.10
            reasons.append("Đúng phạm vi du lịch ưa thích")

    candidate_text_lower = _normalize_text(candidate_text)
    for style in user_profile.preferred_styles:
        if _infer_style_match(candidate_text_lower, style) > 0:
            score += 0.06
            reasons.append("Khớp phong cách đã chọn")
            break

    for theme in user_profile.preferred_themes:
        if _normalize_text(theme) in candidate_text_lower:
            score += 0.05
            reasons.append("Khớp chủ đề yêu thích")
            break

    if user_profile.preferred_group_type and _infer_group_match(candidate_text_lower, user_profile.preferred_group_type) > 0:
        score += 0.08
        reasons.append("Khớp nhóm đi ưu tiên")

    if user_profile.avg_budget is not None:
        budget_fit = _closeness_score(float(user_profile.avg_budget), float(candidate.get("price") or 0), max(user_profile.avg_budget * 0.7, 1))
        score += budget_fit * 0.10

    if user_profile.budget_band:
        price = float(candidate.get("price") or 0)
        budget_band = _normalize_text(user_profile.budget_band)
        if budget_band == "duoi-5tr" and price <= 5_000_000:
            score += 0.08
        elif budget_band == "5-10tr" and 5_000_000 <= price <= 10_000_000:
            score += 0.08
        elif budget_band == "10-20tr" and 10_000_000 <= price <= 20_000_000:
            score += 0.08
        elif budget_band == "tren-20tr" and price >= 20_000_000:
            score += 0.08

    if user_profile.avg_duration is not None:
        duration_fit = _closeness_score(float(user_profile.avg_duration), float(candidate.get("duration_days") or 0), 4)
        score += duration_fit * 0.10

    if user_profile.preferred_duration_band:
        duration = int(candidate.get("duration_days") or 0)
        duration_band = _normalize_text(user_profile.preferred_duration_band)
        if duration_band == "ngan-ngay" and duration <= 3:
            score += 0.06
        elif duration_band == "trung-binh" and 4 <= duration <= 5:
            score += 0.06
        elif duration_band == "dai-ngay" and duration >= 6:
            score += 0.06

    return min(score, 1.0), reasons


def _score_business(candidate: Dict[str, Any]) -> tuple[float, List[str]]:
    score = 0.0
    reasons: List[str] = []
    remaining = max(int(candidate.get("quota") or 0) - int(candidate.get("booked_count") or 0), 0)

    if remaining <= 5:
        score += 0.06
        reasons.append("Sắp hết chỗ")

    if candidate.get("start_date") is not None:
        score += 0.04

    return min(score, 0.1), reasons


def _score_time_context(
    candidate: Dict[str, Any],
    preferred_month: Optional[int],
) -> tuple[float, List[str]]:
    if preferred_month is None:
        return 0.0, []

    start_date = candidate.get("start_date")
    if start_date is None:
        return 0.0, []

    candidate_month = getattr(start_date, "month", None)
    if candidate_month is None:
        return 0.0, []

    if candidate_month == preferred_month:
        return 0.12, ["Khởi hành đúng tháng mong muốn"]

    month_gap = abs(candidate_month - preferred_month)
    month_gap = min(month_gap, 12 - month_gap)
    if month_gap == 1:
        return 0.06, ["Khởi hành gần tháng mong muốn"]

    return 0.0, []


async def recommend_tours(
    db: AsyncSession,
    request: RecommendationRequest,
) -> RecommendationResponse:
    reference_tour = await _load_reference_tour(db, request.tour_id) if request.tour_id else None
    user_profile = await _build_user_profile(db, request.user_id)
    candidates = await _load_candidate_tours(db, request, reference_tour)

    ranked_items: List[RecommendationItem] = []
    seen_tour_ids = set()

    for candidate in candidates:
        if candidate["tour_id"] in seen_tour_ids:
            continue
        seen_tour_ids.add(candidate["tour_id"])

        content_score, content_reasons = _score_content(candidate, request, reference_tour)
        knowledge_score, knowledge_reasons = _score_knowledge(candidate, request, user_profile)
        business_score, business_reasons = _score_business(candidate)
        time_score, time_reasons = _score_time_context(candidate, request.preferred_month)

        final_score = (
            content_score * 0.42
            + knowledge_score * 0.36
            + business_score * 0.12
            + time_score * 0.10
        )
        reasons = list(
            dict.fromkeys(
                content_reasons + knowledge_reasons + business_reasons + time_reasons
            )
        )

        ranked_items.append(
            RecommendationItem(
                tour_id=int(candidate["tour_id"]),
                name=str(candidate["name"]),
                code=candidate.get("code"),
                price=float(candidate.get("price") or 0),
                duration_days=int(candidate.get("duration_days") or 0),
                duration_nights=int(candidate.get("duration_nights") or 0),
                departure_location=candidate.get("departure_location_name"),
                destination=candidate.get("destination_name"),
                image_url=candidate.get("image_url"),
                reasons=reasons[:4],
                score_breakdown=RecommendationScoreBreakdown(
                    final_score=round(final_score, 4),
                    content_score=round(content_score, 4),
                    knowledge_score=round(knowledge_score + time_score, 4),
                    business_score=round(business_score, 4),
                ),
            )
        )

    ranked_items.sort(
        key=lambda item: (
            item.score_breakdown.final_score,
            item.score_breakdown.knowledge_score,
            item.score_breakdown.content_score,
        ),
        reverse=True,
    )

    return RecommendationResponse(
        total_candidates=len(candidates),
        recommendations=ranked_items[: request.limit],
    )
