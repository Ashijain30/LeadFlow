from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Lead(Base):
    """SQLAlchemy model representing an inbound real-estate lead."""

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    location = Column(String(120), nullable=False)
    property_requirement = Column(String(255), nullable=False)
    budget = Column(String(100), nullable=False)
    buying_timeline = Column(String(100), nullable=False)
    customer_message = Column(Text, nullable=False)
    priority = Column(String(20), default="WARM", nullable=False)  # HOT, WARM, COLD
    priority_reason = Column(Text, nullable=True)
    ai_analysis = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
