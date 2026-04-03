import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as ai_router
from app.api.recommendation_routes import router as recommendation_router
from app.config import settings

app = FastAPI(title="Travel AI Service - Nhựt Thanh Travel")

def get_allowed_origins() -> list[str]:
    if settings.CORS_ORIGINS:
        return [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

    return [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "https://nhutthanh.id.vn",
        "https://www.nhutthanh.id.vn",
        "https://api.nhutthanh.id.vn",
        "https://ai.nhutthanh.id.vn",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn bộ định tuyến API
app.include_router(ai_router, prefix="/api")
app.include_router(recommendation_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Travel AI Service is running"}

if __name__ == "__main__":
    # Khi chạy qua Proxy/Tunnel, cần sử dụng proxy_headers=True
    print(f"Starting Travel AI Service on {settings.HOST}:{settings.PORT} (Proxy mode: ON)")
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True,
        proxy_headers=True,      # Quan trọng khi dùng qua Tunnel/Nginx
        forwarded_allow_ips="*"  # Cho phép nhận headers từ các Proxy
    )
