import json
from typing import Any, Dict, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def track_recommendation_signal(
    db: AsyncSession,
    user_id: Optional[int],
    event_type: str,
    source: str,
    tour_id: Optional[int] = None,
    destination: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    if not user_id:
        return

    await db.execute(
        text(
            """
            INSERT INTO recommendation_events (
                user_id,
                event_type,
                source,
                tour_id,
                destination,
                metadata_json
            )
            VALUES (:user_id, :event_type, :source, :tour_id, :destination, :metadata_json)
            """
        ),
        {
            "user_id": user_id,
            "event_type": event_type,
            "source": source,
            "tour_id": tour_id,
            "destination": destination,
            "metadata_json": json.dumps(metadata or {}, ensure_ascii=False),
        },
    )
    await db.commit()
