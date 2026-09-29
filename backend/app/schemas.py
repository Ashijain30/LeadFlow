from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class AIAnalysisSchema(BaseModel):
    """Structured AI analysis format produced by Gemini."""

    summary: str = Field(description="2-sentence executive summary of the lead")
    intent: str = Field(description="Primary buying intent (e.g., Immediate end-user, Long-term investment)")
    key_requirements: List[str] = Field(description="Bullet points of verified buyer requirements")
    objections: List[str] = Field(description="Identified or potential objections and buyer concerns")
    recommended_next_action: str = Field(description="Immediate tactical next action for salesperson")
    suggested_response: str = Field(description="Ready-to-send drafted response to the customer")


class LeadBase(BaseModel):
    """Base lead fields shared across creation and responses."""

    name: str = Field(..., min_length=1, max_length=120, description="Customer full name")
    location: str = Field(..., min_length=1, max_length=120, description="City or preferred locality")
    property_requirement: str = Field(..., min_length=1, max_length=255, description="Property specifications")
    budget: str = Field(..., min_length=1, max_length=100, description="Target budget range")
    buying_timeline: str = Field(..., min_length=1, max_length=100, description="Customer purchase horizon")
    customer_message: str = Field(..., min_length=1, description="Raw inbound inquiry message")


class LeadCreate(LeadBase):
    """Payload for creating a new lead."""
    pass


class LeadUpdate(BaseModel):
    """Payload for updating an existing lead."""

    name: Optional[str] = Field(None, min_length=1, max_length=120)
    location: Optional[str] = Field(None, min_length=1, max_length=120)
    property_requirement: Optional[str] = Field(None, min_length=1, max_length=255)
    budget: Optional[str] = Field(None, min_length=1, max_length=100)
    buying_timeline: Optional[str] = Field(None, min_length=1, max_length=100)
    customer_message: Optional[str] = Field(None, min_length=1)
    priority: Optional[str] = None
    priority_reason: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None


class FollowUpScheduleRequest(BaseModel):
    """Payload to schedule or update next follow-up."""

    next_follow_up_at: Optional[datetime] = Field(None, description="Scheduled follow-up datetime")
    last_contacted_at: Optional[datetime] = Field(None, description="Timestamp when lead was contacted")


class LeadResponse(LeadBase):
    """Complete lead representation returned by API."""

    id: int
    priority: str
    priority_reason: Optional[str] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadChatRequest(BaseModel):
    """Salesperson question regarding a specific lead."""

    message: str = Field(..., min_length=1, description="Salesperson's question or coaching request")
    history: Optional[List[Dict[str, str]]] = Field(
        default=None, description="Optional previous message exchanges [{sender, text}]"
    )


class LeadChatResponse(BaseModel):
    """AI Assistant response grounded in lead context."""

    response: str
    lead_id: int


class FollowUpRequest(BaseModel):
    """Parameters for AI follow-up message generation."""

    channel: str = Field(default="WhatsApp", description="WhatsApp, Email, or Call Script")
    tone: str = Field(default="Professional", description="Professional, Friendly, Assertive, or Urgent")
    instruction: Optional[str] = Field(default=None, description="Optional custom instruction")


class FollowUpResponse(BaseModel):
    """AI generated follow-up content."""

    content: str
    channel: str
    tone: str
    lead_id: int
