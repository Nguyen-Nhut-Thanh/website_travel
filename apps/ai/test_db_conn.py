
import asyncio
from sqlalchemy import text
from app.database import engine, SessionLocal

async def test_db():
    print("--- Testing Database Connection ---")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT count(*) FROM tours"))
            count = result.scalar()
            print(f"Total tours in database: {count}")

            if count > 0:
                result = await conn.execute(text("""
                    SELECT t.tour_id, t.name, t.status, l.name as destination
                    FROM tours t
                    LEFT JOIN tour_destinations td ON t.tour_id = td.tour_id
                    LEFT JOIN locations l ON td.location_id = l.location_id
                    LIMIT 5
                """))
                rows = result.mappings().all()
                for row in rows:
                    print(f"ID: {row['tour_id']} | Name: {row['name']} | Status: {row['status']} | Dest: {row['destination']}")
            else:
                print("WARNING: 'tours' table is empty!")
                
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_db())
