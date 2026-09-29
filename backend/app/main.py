from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base, SessionLocal
from app.routers import leads
from app.services.lead_service import seed_default_leads_if_empty

settings = get_settings()


from sqlalchemy import text


def ensure_db_schema():
    """Ensure tables exist and add new nullable columns safely if migrating existing SQLite DB."""
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            cursor = conn.execute(text("PRAGMA table_info(leads)"))
            columns = [row[1] for row in cursor.fetchall()]
            if columns:  # table exists
                if "last_contacted_at" not in columns:
                    conn.execute(text("ALTER TABLE leads ADD COLUMN last_contacted_at DATETIME"))
                if "next_follow_up_at" not in columns:
                    conn.execute(text("ALTER TABLE leads ADD COLUMN next_follow_up_at DATETIME"))
                conn.commit()
    except Exception as e:
        # Pass silently for non-SQLite or if columns already exist
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: create tables, run safe column migrations, and seed initial leads idempotently."""
    ensure_db_schema()
    # Seed default sample leads if database is fresh
    db = SessionLocal()
    try:
        seed_default_leads_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Masal AI Real Estate Lead Prioritization & Assistant",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(leads.router)


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "ok"}
