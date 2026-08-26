from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.api.knowledge_base import router as knowledge_base_router
from backend.utils.config import get_settings
from backend.utils.errors import register_exception_handlers


settings = get_settings()

app = FastAPI(
    title="BidFactory API",
    version="0.1.0",
    description="Backend foundation for BidFactory bid analysis workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(router, prefix="/api")
app.include_router(knowledge_base_router, prefix="/api")


@app.get("/api/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}