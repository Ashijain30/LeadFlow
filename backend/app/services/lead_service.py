from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Lead
from app.schemas import LeadCreate, LeadUpdate
from app.services.priority_service import calculate_lead_priority
from app.services.ai_service import analyze_lead_with_ai


def get_leads(
    db: Session, search: Optional[str] = None, priority: Optional[str] = None
) -> List[Lead]:
    """Retrieve leads ordered by latest created, with optional search and priority filtering."""
    query = db.query(Lead)

    if priority and priority.upper() != "ALL":
        query = query.filter(Lead.priority == priority.upper())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.name.ilike(term),
                Lead.location.ilike(term),
                Lead.property_requirement.ilike(term),
                Lead.customer_message.ilike(term),
            )
        )

    return query.order_by(Lead.id.desc()).all()


def get_lead_by_id(db: Session, lead_id: int) -> Optional[Lead]:
    """Retrieve a single lead by ID."""
    return db.query(Lead).filter(Lead.id == lead_id).first()


def create_lead(db: Session, lead_in: LeadCreate, run_ai: bool = False) -> Lead:
    """Create and persist a new lead, computing priority and AI analysis."""
    # 1. Compute transparent priority
    priority, reason = calculate_lead_priority(
        buying_timeline=lead_in.buying_timeline,
        budget=lead_in.budget,
        property_requirement=lead_in.property_requirement,
        customer_message=lead_in.customer_message,
    )

    # 2. Run AI Analysis
    ai_analysis = None
    if run_ai:
        lead_dict = lead_in.model_dump()
        ai_analysis = analyze_lead_with_ai(lead_dict)

    # 3. Create SQLAlchemy model
    db_lead = Lead(
        name=lead_in.name,
        location=lead_in.location,
        property_requirement=lead_in.property_requirement,
        budget=lead_in.budget,
        buying_timeline=lead_in.buying_timeline,
        customer_message=lead_in.customer_message,
        priority=priority,
        priority_reason=reason,
        ai_analysis=ai_analysis,
    )

    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def update_lead(db: Session, lead_id: int, lead_in: LeadUpdate) -> Optional[Lead]:
    """Update existing lead fields."""
    db_lead = get_lead_by_id(db, lead_id)
    if not db_lead:
        return None

    update_dict = lead_in.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(db_lead, field, value)

    # Re-evaluate priority if relevant factors changed and priority not explicitly forced
    if (
        "priority" not in update_dict
        and any(f in update_dict for f in ["buying_timeline", "budget", "customer_message"])
    ):
        priority, reason = calculate_lead_priority(
            buying_timeline=db_lead.buying_timeline,
            budget=db_lead.budget,
            property_requirement=db_lead.property_requirement,
            customer_message=db_lead.customer_message,
        )
        db_lead.priority = priority
        db_lead.priority_reason = reason

    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int) -> bool:
    """Delete a lead by ID. Returns True if deleted, False if not found."""
    db_lead = get_lead_by_id(db, lead_id)
    if not db_lead:
        return False

    db.delete(db_lead)
    db.commit()
    return True


def reanalyze_lead(db: Session, lead_id: int) -> Optional[Lead]:
    """Explicitly trigger AI analysis for a lead."""
    db_lead = get_lead_by_id(db, lead_id)
    if not db_lead:
        return None

    lead_data = {
        "name": db_lead.name,
        "location": db_lead.location,
        "property_requirement": db_lead.property_requirement,
        "budget": db_lead.budget,
        "buying_timeline": db_lead.buying_timeline,
        "customer_message": db_lead.customer_message,
        "priority": db_lead.priority,
    }

    ai_analysis = analyze_lead_with_ai(lead_data)
    db_lead.ai_analysis = ai_analysis
    db.commit()
    db.refresh(db_lead)
    return db_lead


def seed_default_leads_if_empty(db: Session):
    """Seed initial realistic leads if database is empty."""
    if db.query(Lead).count() > 0:
        return

    sample_leads = [
        {
            "name": "Rahul Sharma",
            "location": "Bengaluru",
            "property_requirement": "2 BHK apartment near Whitefield",
            "budget": "₹85L – ₹95L",
            "buying_timeline": "Within 1 month",
            "customer_message": "Looking for a ready-to-move 2 BHK near Whitefield close to ITPB. Can visit this Saturday with my family. Please share available units with parking.",
        },
        {
            "name": "Priya Patel",
            "location": "Mumbai",
            "property_requirement": "3 BHK high-rise in Lower Parel",
            "budget": "₹4.5 Cr – ₹5.5 Cr",
            "buying_timeline": "Within 2 months",
            "customer_message": "Looking to upgrade to a spacious 3 BHK in Lower Parel or Worli. High floor preferred. Budget around 5 Cr. Need quick registration assistance.",
        },
        {
            "name": "Amit Verma",
            "location": "Gurgaon",
            "property_requirement": "3 BHK + Servant room in Golf Course Ext Rd",
            "budget": "₹1.8 Cr – ₹2.2 Cr",
            "buying_timeline": "Within 2–3 months",
            "customer_message": "Shortlisting 3 BHK + Utility options near Golf Course Ext Road. Still evaluating builder track records and waiting for appraisal bonus next month.",
        },
        {
            "name": "Sneha Kulkarni",
            "location": "Pune",
            "property_requirement": "2 BHK in Baner or Balewadi",
            "budget": "₹70L – ₹75L",
            "buying_timeline": "Within 4–6 months",
            "customer_message": "Working in Hinjewadi Phase 1. Looking for an under-construction project in Baner/Balewadi with possession by mid next year. Flexible on floor.",
        },
        {
            "name": "Vikram Reddy",
            "location": "Hyderabad",
            "property_requirement": "Commercial office space in Gachibowli",
            "budget": "₹1.2 Cr – ₹1.5 Cr",
            "buying_timeline": "Next 6–12 months",
            "customer_message": "Just exploring commercial rental yield options in Gachibowli or Financial District. Not in a rush, just want market brochures.",
        },
    ]

    for data in sample_leads:
        create_lead(db, LeadCreate(**data), run_ai=False)
