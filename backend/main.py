# backend/main.py
"""
Main FastAPI application entrypoint.
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import sermon_routes, live_routes
from backend.api.routes import translation_routes, analytics_routes

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown — force stop ASR thread immediately
    logger.info("[MAIN] Lifespan shutdown: stopping ASR...")
    try:
        # Signal live_routes to stop
        live_routes._shutdown_flag.set()
        # Stop the whisper listener
        from ml_pipeline.speech_recognition.whisper_listener import stop_listener
        stop_listener()
        logger.info("[MAIN] ASR stopped.")
    except Exception as e:
        logger.warning(f"[MAIN] ASR stop error (ignorable): {e}")


app = FastAPI(
    title="AI Masjid Sermon Translation API",
    version="1.0.0",
    description="Backend service for sermon translation and vetting workflow.",
    lifespan=lifespan
)

# ✅ Allow local file and localhost WebSocket origins
origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",  # if using Live Server extension in VSCode
    "http://localhost:5500",
    "*"  # <-- You can keep this during dev, tighten later for production
]

# Optional: Allow local frontend or dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3001",
        "*"  # Allow all origins during development
    ],
    allow_credentials=False,  # no cookies needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers (remove duplicate prefixes)
app.include_router(sermon_routes.router, tags=["Sermon"])
app.include_router(translation_routes.router, tags=["Translation"])
app.include_router(live_routes.router, prefix="/live", tags=["Live Streaming"])
app.include_router(analytics_routes.router, tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "AI Sermon Translation System API running"}
