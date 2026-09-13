from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.api_router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CORTEXLAB: Interactive Research Laboratory for Machine Learning, RAG, and LLM Telemetry."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "CORTEXLAB Research Engine",
        "version": settings.VERSION,
        "database": "supabase-pgvector"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to CORTEXLAB API",
        "docs": "/docs",
        "modules": [
            "/api/v1/inference",
            "/api/v1/rag",
            "/api/v1/embeddings",
            "/api/v1/tokenize",
            "/api/v1/attention",
            "/api/v1/benchmarks",
            "/api/v1/experiments",
            "/api/v1/datasets"
        ]
    }
