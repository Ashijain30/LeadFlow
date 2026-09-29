import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.config import get_settings
from app.schemas import AIAnalysisSchema

logger = logging.getLogger(__name__)
settings = get_settings()


def is_api_key_configured() -> bool:
    """Check if a genuine Gemini API key is configured."""
    key = settings.gemini_api_key
    if not key or key.strip() in [
        "your_gemini_api_key_here",
        "test_key_for_local_dev",
        "placeholder",
    ]:
        return False
    return True


def get_gemini_client() -> Optional[genai.Client]:
    """Instantiate and return the GenAI client if key is available."""
    if not is_api_key_configured():
        return None
    try:
        return genai.Client(api_key=settings.gemini_api_key)
    except Exception as e:
        logger.error("Failed to initialize GenAI client: %s", e)
        return None


def fallback_lead_analysis(lead_data: Dict[str, Any]) -> AIAnalysisSchema:
    """Generate high-quality contextual lead analysis when Gemini API is unavailable."""
    name = lead_data.get("name", "Customer")
    req = lead_data.get("property_requirement", "property")
    loc = lead_data.get("location", "the city")
    budget = lead_data.get("budget", "unspecified budget")
    timeline = lead_data.get("buying_timeline", "flexible timeline")
    msg = lead_data.get("customer_message", "")

    summary = (
        f"{name} is actively seeking a {req} in {loc} within {budget}. "
        f"Purchase timeframe is '{timeline}' with an inbound note expressing interest."
    )

    intent = (
        "Immediate end-user purchase"
        if any(w in timeline.lower() for w in ["immediate", "1 month", "ready"])
        else "Planned end-user home upgrade"
    )

    key_requirements = [
        f"Unit Type: {req}",
        f"Target Locality: {loc}",
        f"Stated Budget: {budget}",
        f"Move-in Horizon: {timeline}",
    ]

    objections = [
        "Clarity on total all-inclusive cost, maintenance, and registration fees",
        "Verification of RERA completion status and site visit availability",
    ]
    if "price" in msg.lower() or "rate" in msg.lower():
        objections.append("High price sensitivity / rate negotiation expectation")

    recommended_next_action = (
        f"Call {name} within 2 hours to confirm a private site visit and send 2 verified project options over WhatsApp."
    )

    suggested_response = (
        f"Hi {name}, thank you for reaching out! We have two excellent verified options for {req} in {loc} "
        f"that match your budget of {budget}. Would you be free for a 5-minute call today to discuss details?"
    )

    return AIAnalysisSchema(
        summary=summary,
        intent=intent,
        key_requirements=key_requirements,
        objections=objections,
        recommended_next_action=recommended_next_action,
        suggested_response=suggested_response,
    )


def analyze_lead_with_ai(lead_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute structured lead analysis using real Gemini API or robust fallback."""
    client = get_gemini_client()

    if not client:
        logger.info("Gemini API key not active or absent. Using contextual analyzer.")
        return fallback_lead_analysis(lead_data).model_dump()

    prompt = f"""
You are a senior real estate sales analyst. Analyze the following inbound real estate lead.
Extract actionable sales intelligence specifically grounded in the provided details.

CUSTOMER DETAILS:
- Full Name: {lead_data.get('name')}
- Location: {lead_data.get('location')}
- Property Requirement: {lead_data.get('property_requirement')}
- Budget: {lead_data.get('budget')}
- Buying Timeline: {lead_data.get('buying_timeline')}
- Inbound Customer Message: "{lead_data.get('customer_message')}"

Produce a structured JSON response containing:
1. summary (concise 2-sentence executive summary)
2. intent (customer's buying intent)
3. key_requirements (list of verified specific requirements)
4. objections (list of realistic buyer concerns or objections to proactively solve)
5. recommended_next_action (high-priority immediate action for the salesperson)
6. suggested_response (ready-to-send personalized message to customer)
"""
    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                response_mime_type="application/json",
                response_schema=AIAnalysisSchema,
            ),
        )
        if response and response.text:
            data = json.loads(response.text)
            # Validate through Pydantic
            validated = AIAnalysisSchema.model_validate(data)
            return validated.model_dump()
    except Exception as e:
        logger.warning("Gemini lead analysis call failed: %s. Falling back to deterministic analysis.", e)

    return fallback_lead_analysis(lead_data).model_dump()


def chat_with_lead_ai(
    lead_data: Dict[str, Any], question: str, history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Provide lead-grounded conversational answers to assist the salesperson."""
    client = get_gemini_client()

    lead_context = (
        f"LEAD PROFILE:\n"
        f"- Name: {lead_data.get('name')}\n"
        f"- Locality: {lead_data.get('location')}\n"
        f"- Requirement: {lead_data.get('property_requirement')}\n"
        f"- Budget: {lead_data.get('budget')}\n"
        f"- Timeline: {lead_data.get('buying_timeline')}\n"
        f"- Customer Message: '{lead_data.get('customer_message')}'\n"
        f"- Priority: {lead_data.get('priority')} ({lead_data.get('priority_reason')})\n"
    )

    ai_analysis = lead_data.get("ai_analysis") or {}
    if ai_analysis:
        lead_context += (
            f"- AI Summary: {ai_analysis.get('summary')}\n"
            f"- Objections: {', '.join(ai_analysis.get('objections', []))}\n"
            f"- Recommended Action: {ai_analysis.get('recommended_next_action')}\n"
        )

    if client:
        system_prompt = (
            "You are an expert Real Estate Sales Coach and Co-Pilot. "
            "You are assisting a salesperson with a specific inbound lead. "
            "Answer questions strictly grounded in this lead's context, budget, timeline, and objections. "
            "Give practical, concise, and direct sales advice."
        )

        user_content = f"{lead_context}\n\nSALESPERSON'S QUESTION: {question}"

        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.4,
                ),
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning("Gemini chat call failed: %s. Using contextual reply.", e)

    # Fallback contextual reply
    q = question.lower()
    name = lead_data.get("name", "Customer")
    req = lead_data.get("property_requirement", "property")
    loc = lead_data.get("location", "the area")
    budget = lead_data.get("budget", "stated budget")
    timeline = lead_data.get("buying_timeline", "")

    if "emphasize" in q or "call" in q:
        return (
            f"On your call with {name}, emphasize:\n"
            f"1. Exact match for {req} within their {budget} range.\n"
            f"2. Availability of units fitting their '{timeline}' timeline.\n"
            f"3. Offer a scheduled in-person visit slot for this weekend rather than a vague callback."
        )
    elif "concern" in q or "objection" in q:
        objs = ai_analysis.get("objections", ["Pricing clarity", "Legal verification"])
        return (
            f"Based on {name}'s requirements, address these proactively:\n"
            + "\n".join([f"• {o}" for o in objs])
            + "\n\nTip: Assure them on approved documentation before asking for a site visit."
        )
    elif "assertive" in q:
        return (
            f'Assertive pitch for {name}:\n'
            f'"Hi {name}, verified inventory for {req} in {loc} within {budget} is limited and moves quickly. '
            f'Since you are planning to purchase within {timeline}, I have reserved two site visit slots for Saturday at 11 AM and 3 PM. '
            f'Which time works best to lock in your visit?"'
        )
    else:
        return (
            f"For {name} looking for {req} in {loc} ({budget}):\n"
            f"Focus on their stated timeline of '{timeline}'. Share 2 curated brochures, follow up via phone, "
            f"and propose a concrete site visit slot."
        )


def generate_followup_ai(
    lead_data: Dict[str, Any], channel: str, tone: str, instruction: Optional[str] = None
) -> str:
    """Generate channel- and tone-tailored follow-up communication."""
    client = get_gemini_client()

    name = lead_data.get("name", "Customer")
    req = lead_data.get("property_requirement", "property")
    loc = lead_data.get("location", "the city")
    budget = lead_data.get("budget", "stated budget")
    timeline = lead_data.get("buying_timeline", "soon")

    if client:
        prompt = f"""
You are a top-performing real estate salesperson. Generate a personalized follow-up message for:
- Customer Name: {name}
- Requirement: {req}
- Location: {loc}
- Budget: {budget}
- Timeline: {timeline}

Channel: {channel} (WhatsApp, Email, or Call Script)
Tone: {tone} (Professional, Friendly, Assertive, or Urgent)
Additional Instructions: {instruction or 'None'}

Formatting Rules:
- If WhatsApp: Keep it concise, natural, conversational, with appropriate emojis.
- If Email: Include Subject line, professional greeting, body paragraph, call to action, and sign-off.
- If Call Script: Provide a structured conversational script with Opening, Context, Objection Handling, and Firm Close.
- Reference their exact requirement ({req}), location ({loc}), and budget ({budget}) naturally.
"""
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.5),
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning("Gemini follow-up generation failed: %s. Using contextual generator.", e)

    # Fallback tailored follow-up
    ch = channel.lower()
    t = tone.lower()

    if "whatsapp" in ch:
        if "friendly" in t:
            return (
                f"Hey {name}! 👋 Hope you're having a good week.\n\n"
                f"I found two great options for a {req} in {loc} that sit comfortably inside your {budget} budget. "
                f"They match your plan to move {timeline}!\n\n"
                f"Can I share the photos and floor plans with you here? Cheers!"
            )
        elif "assertive" in t:
            return (
                f"Hi {name}, following up on your search for a {req} in {loc}.\n\n"
                f"Ready inventory in your {budget} bracket has high demand this month. "
                f"I can hold an inspection appointment for you this weekend before general public viewings. "
                f"Please let me know if Saturday at 11 AM or Sunday at 3 PM works best for you."
            )
        elif "urgent" in t:
            return (
                f"Urgent update for {name}: Two premium {req} units in {loc} matching your {budget} budget "
                f"just became available. Given your '{timeline}' timeline, I strongly advise viewing them today. "
                f"Can I give you a quick call in 10 minutes?"
            )
        else:  # Professional
            return (
                f"Dear {name}, thank you for your inquiry regarding {req} in {loc}.\n\n"
                f"We have curated verified options aligned with your budget of {budget} and '{timeline}' timeline. "
                f"Please let me know if I may send the project dossiers for your review."
            )

    elif "email" in ch:
        if "friendly" in t:
            return (
                f"Subject: Great options for your {req} in {loc}! 🏡\n\n"
                f"Hi {name},\n\n"
                f"Hope you are having a wonderful week!\n\n"
                f"I reviewed your requirement for a {req} in {loc}. We have two verified developments "
                f"matching your {budget} budget with move-in options aligned with your '{timeline}' horizon.\n\n"
                f"I have attached the floor plans and pricing breakdowns. Please feel free to reply with any questions!\n\n"
                f"Warm regards,\nMasal AI Real Estate Team"
            )
        elif "assertive" in t:
            return (
                f"Subject: Recommended Properties: {req} in {loc} [Action Required]\n\n"
                f"Dear {name},\n\n"
                f"High-quality inventory for {req} in {loc} within {budget} is limited. "
                f"To ensure you secure a prime unit within your '{timeline}' timeline, I recommend scheduling a 15-minute briefing.\n\n"
                f"Please confirm whether tomorrow at 11:00 AM or 3:00 PM works for your calendar.\n\n"
                f"Best regards,\nSales Team | Masal AI"
            )
        elif "urgent" in t:
            return (
                f"Subject: Priority Alert: Limited allocation for {req} in {loc}\n\n"
                f"Dear {name},\n\n"
                f"We are writing with an urgent update regarding your search for a {req} in {loc}. "
                f"Current developer pricing for units within your {budget} bracket expires at the end of the week. "
                f"Given your plan to purchase {timeline}, acting now will protect your preferred pricing.\n\n"
                f"Please reply immediately or call me to reserve priority inspection access.\n\n"
                f"Sincerely,\nMasal AI Advisory"
            )
        else:  # Professional
            return (
                f"Subject: Curated Property Portfolio: {req} in {loc}\n\n"
                f"Dear {name},\n\n"
                f"Thank you for contacting us regarding your requirement for a {req} in {loc} within {budget}.\n\n"
                f"We have finalized a shortlisting of verified projects tailored to your purchase horizon of '{timeline}'. "
                f"Each property holds verified RERA approvals and bank financing clearance.\n\n"
                f"Attached please find the comprehensive project dossier. We look forward to coordinating a private site inspection.\n\n"
                f"Sincerely,\nMasal AI Real Estate Advisory"
            )

    else:  # Call Script
        return (
            f"[CALL SCRIPT — {tone.upper()} TONE]\n"
            f"Lead: {name} | Requirement: {req} | Location: {loc} | Budget: {budget}\n\n"
            f"1. GREETING:\n"
            f'"Hello {name}, this is [Your Name] from Masal AI Realty following up on your inquiry for a {req} in {loc}."\n\n'
            f"2. CONTEXT & VALUE:\n"
            f'"We have 2 verified options matching your {budget} bracket with possession aligned to your {timeline} timeline."\n\n'
            f"3. DISCOVERY:\n"
            f'"You mentioned in your message: \'{lead_data.get("customer_message", "")}\'. Are there specific layout or parking preferences you want prioritized?"\n\n'
            f"4. CLOSING / NEXT STEP:\n"
            f'"I can arrange a priority site visit for you this Saturday. Does morning or afternoon suit your schedule better?"'
        )
