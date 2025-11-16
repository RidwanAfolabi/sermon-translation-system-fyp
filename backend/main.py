# backend/main.py
"""
Main FastAPI application entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import sermon_routes, live_routes
from backend.api.routes import translation_routes  # 👈 this was added

app = FastAPI(
    title="AI Masjid Sermon Translation API",
    version="1.0.0",
    description="Backend service for sermon translation and vetting workflow."
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
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers (remove duplicate prefixes)
app.include_router(sermon_routes.router, tags=["Sermon"])
app.include_router(translation_routes.router, tags=["Translation"])
app.include_router(live_routes.router, tags=["Live Streaming"])  # 👈 this line was added

@app.get("/")
def root():
    return {"message": "AI Sermon Translation System API running"}
