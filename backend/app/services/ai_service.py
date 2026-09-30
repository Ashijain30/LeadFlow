import json
import logging
import time
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from google.genai.errors import ServerError, APIError
from fastapi import HTTPException, status
from app.config import get_settings
from app.schemas import AIAnalysisSchema

logger = logging.getLogger(__name__)
settings = get_settings()


def _sanitize_error(error: Optional[Exception]) -> str:
    """Return error message with sensitive API key tokens redacted."""
    if not error:
        return "Unknown error"
    msg = str(error)
    key = settings.gemini_api_key
    if key and len(key) > 8:
        msg = msg.replace(key, "[REDACTED_API_KEY]")
    return msg


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
    """Instantiate and return the GenAI client if key is configured."""
    if not is_api_key_configured():
        return None
    try:
        return genai.Client(api_key=settings.gemini_api_key)
    except Exception as e:
        logger.error("Failed to initialize GenAI client: %s", _sanitize_error(e))
        return None


def _generate_with_gemini(
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    max_retries: int = 3,
) -> types.GenerateContentResponse:
    """Execute Gemini generate_content using configured GEMINI_MODEL with exponential backoff on 503.

    Retries only the configured model (gemini-3.8-flash) up to max_retries (1s, 2s, 4s).
    Does NOT hammer multiple models.
    Raises HTTPException 503 if retries fail.
    Never exposes API keys in logs or errors.
    """
    client = get_gemini_client()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service is not configured. Please provide a valid GEMINI_API_KEY in backend/.env.",
        )

    model_name = settings.gemini_model or "gemini-3.8-flash"
    last_error: Optional[Exception] = None

    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
            if response and response.text:
                return response
        except (ServerError, APIError) as e:
            last_error = e
            clean_msg = _sanitize_error(e)
            logger.warning(
                "Gemini model '%s' attempt %d/%d failed: %s",
                model_name,
                attempt,
                max_retries,
                clean_msg,
            )
            if attempt < max_retries:
                backoff = 2 ** (attempt - 1)  # 1s, 2s
                time.sleep(backoff)
            continue
        except Exception as e:
            last_error = e
            clean_msg = _sanitize_error(e)
            logger.error("Gemini generation error: %s", clean_msg)
            if attempt < max_retries:
                backoff = 2 ** (attempt - 1)
                time.sleep(backoff)
            continue

    sanitized = _sanitize_error(last_error)
    logger.error("Gemini generation failed after %d retries: %s", max_retries, sanitized)
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Gemini is temporarily unavailable. Please try again shortly.",
    )


def fallback_lead_analysis(lead_data: Dict[str, Any]) -> AIAnalysisSchema:
    """Generate structured baseline lead analysis deterministically without calling Gemini."""
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
    """Execute structured lead analysis using Gemini 3.8 Flash.

    Uses configured GEMINI_MODEL with Pydantic structured output.
    Raises HTTPException 503 if Gemini is unavailable.
    """
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

    cfg = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AIAnalysisSchema,
        thinking_config=types.ThinkingConfig(thinking_level="low"),
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )

    response = _generate_with_gemini(contents=prompt, config=cfg)
    data = json.loads(response.text)
    validated = AIAnalysisSchema.model_validate(data)
    return validated.model_dump()


def chat_with_lead_ai(
    lead_data: Dict[str, Any], question: str, history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Provide lead-grounded conversational answers to assist the salesperson.

    Passes the salesperson's actual message + conversation history + lead profile
    directly to Gemini.
    Never returns hardcoded or fake static responses.
    Raises HTTPException 503 if Gemini is unavailable.
    """
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

    system_prompt = (
        "You are an expert Real Estate Sales Coach and Co-Pilot. "
        "You are assisting a salesperson with a specific inbound lead. "
        "Answer questions strictly grounded in this lead's context, budget, timeline, and objections. "
        "Give practical, concise, and direct sales advice."
    )

    conv_history_str = ""
    if history:
        conv_history_str = "PREVIOUS CONVERSATION HISTORY:\n" + "\n".join(
            [f"{item.get('sender', 'user').capitalize()}: {item.get('text', '')}" for item in history]
        ) + "\n\n"

    user_content = f"{lead_context}\n\n{conv_history_str}SALESPERSON'S LATEST MESSAGE: {question}"

    cfg = types.GenerateContentConfig(
        system_instruction=system_prompt,
        thinking_config=types.ThinkingConfig(thinking_level="low"),
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )

    logger.info(
        "GEMINI CHAT INPUT:\nlead = %s\nlatest_question = %s\nhistory_length = %d",
        lead_data.get("name", "Unknown"),
        question,
        len(history) if history else 0,
    )

    response = _generate_with_gemini(contents=user_content, config=cfg)
    return response.text.strip()


def generate_followup_ai(
    lead_data: Dict[str, Any], channel: str, tone: str, instruction: Optional[str] = None
) -> str:
    """Generate channel- and tone-tailored follow-up communication using Gemini.

    Never returns hardcoded or fake static responses.
    Raises HTTPException 503 if Gemini is unavailable.
    """
    name = lead_data.get("name", "Customer")
    req = lead_data.get("property_requirement", "property")
    loc = lead_data.get("location", "the city")
    budget = lead_data.get("budget", "stated budget")
    timeline = lead_data.get("buying_timeline", "soon")

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

    cfg = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="low"),
        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
    )

    logger.info(
        "GEMINI FOLLOWUP INPUT:\nlead = %s\nchannel = %s\ntone = %s",
        name,
        channel,
        tone,
    )

    response = _generate_with_gemini(contents=prompt, config=cfg)
    return response.text.strip()
