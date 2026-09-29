from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadChatRequest,
    LeadChatResponse,
    FollowUpRequest,
    FollowUpResponse,
    FollowUpScheduleRequest,
)
from app.services import lead_service, ai_service

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("", response_model=List[LeadResponse])
def list_leads(
    search: Optional[str] = Query(None, description="Search term for name, location, requirement, message"),
    priority: Optional[str] = Query(None, description="Filter by priority: ALL, HOT, WARM, COLD"),
    db: Session = Depends(get_db),
):
    """Retrieve all leads with optional search and priority filtering."""
    return lead_service.get_leads(db, search=search, priority=priority)


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    """Create a new lead with automatic priority scoring and initial AI analysis."""
    return lead_service.create_lead(db, lead_in, run_ai=True)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a single lead by ID."""
    lead = lead_service.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_in: LeadUpdate, db: Session = Depends(get_db)):
    """Update lead details and re-evaluate priority if necessary."""
    updated = lead_service.update_lead(db, lead_id, lead_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )
    return updated


@router.put("/{lead_id}/schedule", response_model=LeadResponse)
def schedule_lead_followup(
    lead_id: int,
    schedule_in: FollowUpScheduleRequest,
    db: Session = Depends(get_db),
):
    """Schedule next follow-up and/or update contact timestamp."""
    update_data = LeadUpdate(
        next_follow_up_at=schedule_in.next_follow_up_at,
        last_contacted_at=schedule_in.last_contacted_at,
    )
    updated = lead_service.update_lead(db, lead_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )
    return updated


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead permanently."""
    success = lead_service.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )
    return None


@router.post("/{lead_id}/analyze", response_model=LeadResponse)
def analyze_lead(lead_id: int, db: Session = Depends(get_db)):
    """Re-run AI analysis on an existing lead."""
    lead = lead_service.reanalyze_lead(db, lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )
    return lead


@router.post("/{lead_id}/chat", response_model=LeadChatResponse)
def chat_with_lead(
    lead_id: int,
    chat_in: LeadChatRequest,
    db: Session = Depends(get_db),
):
    """Provide lead-grounded conversational sales assistance."""
    lead = lead_service.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )

    lead_data = {
        "name": lead.name,
        "location": lead.location,
        "property_requirement": lead.property_requirement,
        "budget": lead.budget,
        "buying_timeline": lead.buying_timeline,
        "customer_message": lead.customer_message,
        "priority": lead.priority,
        "priority_reason": lead.priority_reason,
        "ai_analysis": lead.ai_analysis,
    }

    ai_reply = ai_service.chat_with_lead_ai(
        lead_data=lead_data,
        question=chat_in.message,
        history=chat_in.history,
    )

    return LeadChatResponse(response=ai_reply, lead_id=lead_id)


@router.post("/{lead_id}/follow-up", response_model=FollowUpResponse)
def generate_followup(
    lead_id: int,
    followup_in: FollowUpRequest,
    db: Session = Depends(get_db),
):
    """Generate channel- and tone-tailored follow-up communications."""
    lead = lead_service.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID {lead_id} not found",
        )

    lead_data = {
        "name": lead.name,
        "location": lead.location,
        "property_requirement": lead.property_requirement,
        "budget": lead.budget,
        "buying_timeline": lead.buying_timeline,
        "customer_message": lead.customer_message,
        "priority": lead.priority,
    }

    content = ai_service.generate_followup_ai(
        lead_data=lead_data,
        channel=followup_in.channel,
        tone=followup_in.tone,
        instruction=followup_in.instruction,
    )

    return FollowUpResponse(
        content=content,
        channel=followup_in.channel,
        tone=followup_in.tone,
        lead_id=lead_id,
    )
