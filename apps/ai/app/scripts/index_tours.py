
import asyncio
import os
from sqlalchemy import text
from app.database import engine
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import settings
from dotenv import load_dotenv

# Load env variables manually if needed
load_dotenv()

async def index_tours():
    print("--- Starting Tour Indexing (Vector Store) ---")
    
    # 1. Fetch tours from DB
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT tour_id, name, summary, description 
            FROM tours 
            WHERE status = 1
        """))
        rows = result.mappings().all()
    
    if not rows:
        print("No tours found to index.")
        return

    # 2. Prepare documents
    texts = []
    metadatas = []
    
    for row in rows:
        # Combine fields for better semantic search
        content = f"Tên tour: {row['name']}. Tóm tắt: {row['summary'] or ''}. Mô tả: {row['description'] or ''}"
        texts.append(content)
        metadatas.append({"tour_id": row["tour_id"], "name": row["name"]})

    # 3. Create Embeddings and Store
    print(f"Indexing {len(texts)} tours...")
    embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY, model="text-embedding-3-small")
    
    vector_store = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
    
    # 4. Save locally
    os.makedirs("data", exist_ok=True)
    vector_store.save_local("data/faiss_index")
    print("Indexing complete! Saved to data/faiss_index")

if __name__ == "__main__":
    asyncio.run(index_tours())
