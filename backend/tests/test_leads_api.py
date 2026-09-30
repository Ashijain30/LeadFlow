from unittest.mock import MagicMock
import time
import pytest
from fastapi import HTTPException, status
from app.services.priority_service import calculate_lead_priority
import app.services.ai_service as ai_service


class DummyGeminiResponse:
    def __init__(self, text: str):
        self.text = text


def test_health_endpoints(client):
    """Verify both /health and /api/health return 200 OK."""
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "ok"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "ok"


def test_create_lead_success(client):
    """Verify creating a lead persists data and automatically scores priority without calling Gemini."""
    payload = {
        "name": "Karan Malhotra",
        "location": "Bengaluru, Indiranagar",
        "property_requirement": "3 BHK Penthouse",
        "budget": "₹3.5 Cr – ₹4.0 Cr",
        "buying_timeline": "Immediate / Ready to move",
        "customer_message": "Looking for ready penthouse in Indiranagar. Can visit this Saturday.",
    }

    response = client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Karan Malhotra"
    assert data["priority"] == "HOT"
    assert data["priority_reason"] is not None


def test_create_lead_validation_error(client):
    """Verify creating a lead with missing required fields returns 422."""
    bad_payload = {
        "name": "",  # Empty name violates min_length=1
        "location": "Delhi",
    }
    response = client.post("/api/leads", json=bad_payload)
    assert response.status_code == 422


def test_list_leads_and_filtering(client, monkeypatch):
    """Verify listing leads and filtering by priority and search term."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    lead1 = {
        "name": "Devika Roy",
        "location": "Kolkata, Salt Lake",
        "property_requirement": "2 BHK",
        "budget": "₹60L",
        "buying_timeline": "Within 1 month",
        "customer_message": "Urgent booking needed this week.",
    }
    lead2 = {
        "name": "Rohan Mehra",
        "location": "Pune, Wakad",
        "property_requirement": "1 BHK",
        "budget": "₹35L",
        "buying_timeline": "More than 6 months",
        "customer_message": "Just exploring options for future investment.",
    }

    client.post("/api/leads", json=lead1)
    client.post("/api/leads", json=lead2)

    # List all
    all_res = client.get("/api/leads")
    assert all_res.status_code == 200
    all_leads = all_res.json()
    assert len(all_leads) == 2

    # Filter priority HOT
    hot_res = client.get("/api/leads?priority=HOT")
    assert hot_res.status_code == 200
    assert len(hot_res.json()) == 1
    assert hot_res.json()[0]["name"] == "Devika Roy"

    # Search by keyword
    search_res = client.get("/api/leads?search=Wakad")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["name"] == "Rohan Mehra"


def test_get_lead_by_id_and_not_found(client, monkeypatch):
    """Verify retrieving lead by ID and handling missing leads with 404."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    payload = {
        "name": "Aarav Patel",
        "location": "Ahmedabad",
        "property_requirement": "4 BHK Villa",
        "budget": "₹2.5 Cr",
        "buying_timeline": "Within 2–3 months",
        "customer_message": "Looking for independent villa near SG Highway.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]

    res = client.get(f"/api/leads/{lead_id}")
    assert res.status_code == 200
    assert res.json()["name"] == "Aarav Patel"

    missing_res = client.get("/api/leads/999999")
    assert missing_res.status_code == 404


def test_update_lead_and_priority_recalculation(client, monkeypatch):
    """Verify updating a lead changes details and triggers priority update when relevant."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    payload = {
        "name": "Manish Gupta",
        "location": "Noida",
        "property_requirement": "Looking around",
        "budget": "Undecided",
        "buying_timeline": "More than 6 months",
        "customer_message": "Just checking rates, not in a rush.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]
    assert created["priority"] == "COLD"

    # Update timeline to immediate
    update_payload = {
        "buying_timeline": "Immediate / Ready to move",
        "customer_message": "Need immediate possession this Saturday!",
    }
    update_res = client.put(f"/api/leads/{lead_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["buying_timeline"] == "Immediate / Ready to move"
    assert updated_data["priority"] == "HOT"


def test_delete_lead(client, monkeypatch):
    """Verify deleting a lead removes it permanently."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    payload = {
        "name": "Temporary Lead",
        "location": "Chennai",
        "property_requirement": "Plot",
        "budget": "₹1 Cr",
        "buying_timeline": "Within 1 month",
        "customer_message": "Delete test.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]

    del_res = client.delete(f"/api/leads/{lead_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/leads/{lead_id}")
    assert get_res.status_code == 404


def test_reanalyze_lead_endpoint(client, monkeypatch):
    """Verify POST /api/leads/{id}/analyze updates lead AI analysis via Gemini."""
    mock_json = """{
        "summary": "Siddharth Joshi is looking for a 3 BHK luxury flat in C-Scheme.",
        "intent": "High intent buyer",
        "key_requirements": ["3 BHK Luxury Flat", "C-Scheme", "₹1.2 Cr"],
        "objections": ["Parking verification"],
        "recommended_next_action": "Coordinate site visit.",
        "suggested_response": "Hi Siddharth, we have 2 vetted luxury flats in C-Scheme."
    }"""
    monkeypatch.setattr(
        ai_service,
        "_generate_with_gemini",
        lambda contents, config=None: DummyGeminiResponse(mock_json),
    )

    payload = {
        "name": "Siddharth Joshi",
        "location": "Jaipur",
        "property_requirement": "3 BHK Luxury Flat",
        "budget": "₹1.2 Cr",
        "buying_timeline": "Within 1 month",
        "customer_message": "Need luxury flat near C-Scheme.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]

    reanalyze_res = client.post(f"/api/leads/{lead_id}/analyze")
    assert reanalyze_res.status_code == 200
    data = reanalyze_res.json()
    assert "ai_analysis" in data
    assert "C-Scheme" in data["ai_analysis"]["summary"]


def test_lead_chat_passes_salesperson_question_to_gemini(client, monkeypatch):
    """Verify POST /api/leads/{id}/chat passes the exact salesperson message to Gemini and returns dynamic responses."""
    calls = []

    def mock_gemini_generate(contents, config=None):
        calls.append({"contents": contents, "config": config})
        if "assertive" in contents.lower():
            return DummyGeminiResponse("Here is a direct assertive pitch for Pooja Hegde: Lock in Sunday 10 AM.")
        elif "emphasize" in contents.lower():
            return DummyGeminiResponse("Emphasize the luxury finish and Sunday morning walkthrough availability.")
        elif "budget is too high" in contents.lower():
            return DummyGeminiResponse("Validate the ₹3.0 Cr investment and show the transparent itemized cost sheet.")
        elif "executive summary" in contents.lower() or "senior real estate" in contents.lower():
            return DummyGeminiResponse("""{
                "summary": "Pooja Hegde is an urgent buyer in Jubilee Hills.",
                "intent": "Immediate purchase",
                "key_requirements": ["3 BHK", "Jubilee Hills"],
                "objections": ["Documentation"],
                "recommended_next_action": "Call today",
                "suggested_response": "Hi Pooja"
            }""")
        return DummyGeminiResponse("Default lead guidance.")

    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_gemini_generate)

    payload = {
        "name": "Pooja Hegde",
        "location": "Hyderabad",
        "property_requirement": "3 BHK in Jubilee Hills",
        "budget": "₹3.0 Cr",
        "buying_timeline": "Within 1 month",
        "customer_message": "Can visit on Sunday morning.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]
    calls.clear()

    # Request 1: What should I emphasize?
    chat_res1 = client.post(
        f"/api/leads/{lead_id}/chat",
        json={"message": "What should I emphasize on the call?"},
    )
    assert chat_res1.status_code == 200
    data1 = chat_res1.json()
    assert "luxury finish" in data1["response"].lower() or "emphasize" in data1["response"].lower()
    assert "What should I emphasize on the call?" in calls[0]["contents"]
    assert "Pooja Hegde" in calls[0]["contents"]

    # Request 2: Make my response more assertive
    chat_res2 = client.post(
        f"/api/leads/{lead_id}/chat",
        json={
            "message": "Make my response more assertive.",
            "history": [
                {"sender": "user", "text": "What should I emphasize on the call?"},
                {"sender": "assistant", "text": data1["response"]},
            ],
        },
    )
    assert chat_res2.status_code == 200
    data2 = chat_res2.json()
    assert "assertive" in data2["response"].lower()
    assert "Make my response more assertive." in calls[1]["contents"]
    assert "PREVIOUS CONVERSATION HISTORY" in calls[1]["contents"]

    # Request 3: The buyer says the budget is too high. How should I respond?
    chat_res3 = client.post(
        f"/api/leads/{lead_id}/chat",
        json={
            "message": "The buyer says the budget is too high. How should I respond?",
            "history": [
                {"sender": "user", "text": "Make my response more assertive."},
                {"sender": "assistant", "text": data2["response"]},
            ],
        },
    )
    assert chat_res3.status_code == 200
    data3 = chat_res3.json()
    assert "The buyer says the budget is too high. How should I respond?" in calls[2]["contents"]

    # Confirm different questions produced different Gemini requests
    assert calls[0]["contents"] != calls[1]["contents"] != calls[2]["contents"]
    assert len(calls) == 3


def test_phase12_different_questions_reach_gemini(client, monkeypatch):
    """Phase 12: Verify that two different questions ('hi' and 'any other?') reach Gemini as distinct prompts."""
    captured_contents = []

    def mock_gemini_generate(contents, config=None):
        captured_contents.append(contents)
        if "any other?" in contents:
            return DummyGeminiResponse("Alternative strategy: Propose an off-market commercial floor plate with 9% rental yield.")
        return DummyGeminiResponse("Hello! Let's prepare a commercial lease yield comparison for Vikram Reddy.")

    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_gemini_generate)

    # Use Vikram Reddy lead
    payload = {
        "name": "Vikram Reddy",
        "location": "Hyderabad",
        "property_requirement": "Commercial office space in Gachibowli",
        "budget": "₹1.2 Cr – ₹1.5 Cr",
        "buying_timeline": "Next 6–12 months",
        "customer_message": "Just exploring commercial rental yield options in Gachibowli.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]
    captured_contents.clear()

    # Question 1: "hi"
    res1 = client.post(f"/api/leads/{lead_id}/chat", json={"message": "hi", "history": []})
    assert res1.status_code == 200
    data1 = res1.json()

    # Question 2: "any other?"
    res2 = client.post(
        f"/api/leads/{lead_id}/chat",
        json={
            "message": "any other?",
            "history": [
                {"sender": "user", "text": "hi"},
                {"sender": "assistant", "text": data1["response"]},
            ],
        },
    )
    assert res2.status_code == 200
    data2 = res2.json()

    # Assertions required by Phase 12:
    assert len(captured_contents) == 2
    first_question = captured_contents[0]
    second_question = captured_contents[1]

    assert first_question != second_question
    assert "SALESPERSON'S LATEST MESSAGE: hi" in first_question
    assert "SALESPERSON'S LATEST MESSAGE: any other?" in second_question
    assert "Vikram Reddy" in first_question
    assert "Vikram Reddy" in second_question
    assert data1["response"] != data2["response"]


def test_lead_chat_gemini_unavailable_raises_503(client, monkeypatch):
    """Verify POST /api/leads/{id}/chat returns HTTP 503 when Gemini is unavailable, without returning fake static text."""
    def mock_fail(contents, config=None):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service is temporarily unavailable due to high demand. Please try again in a few moments.",
        )

    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_fail)

    payload = {
        "name": "Pooja Hegde",
        "location": "Hyderabad",
        "property_requirement": "3 BHK in Jubilee Hills",
        "budget": "₹3.0 Cr",
        "buying_timeline": "Within 1 month",
        "customer_message": "Can visit on Sunday morning.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]

    res = client.post(
        f"/api/leads/{lead_id}/chat",
        json={"message": "What should I emphasize on the call?"},
    )
    assert res.status_code == 503
    assert "temporarily unavailable" in res.json()["detail"].lower()


def test_lead_followup_endpoint_mocked(client, monkeypatch):
    """Verify POST /api/leads/{id}/follow-up passes channel and tone to Gemini."""
    followup_calls = []

    def mock_gemini_followup(contents, config=None):
        followup_calls.append(contents)
        if "executive summary" in contents.lower() or "senior real estate" in contents.lower():
            return DummyGeminiResponse("""{
                "summary": "Naveen Rao is ready to book 2 BHK in Bengaluru.",
                "intent": "Immediate purchase",
                "key_requirements": ["2 BHK", "Bengaluru"],
                "objections": [],
                "recommended_next_action": "Send options",
                "suggested_response": "Hi Naveen"
            }""")
        return DummyGeminiResponse("Hi Naveen! Found 2 BHK options for ₹80L in Bengaluru. Ready to view?")

    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_gemini_followup)

    payload = {
        "name": "Naveen Rao",
        "location": "Bengaluru",
        "property_requirement": "2 BHK",
        "budget": "₹80L",
        "buying_timeline": "Immediate",
        "customer_message": "Ready to book.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]
    followup_calls.clear()

    # Test WhatsApp + Friendly
    wa_res = client.post(
        f"/api/leads/{lead_id}/follow-up",
        json={"channel": "WhatsApp", "tone": "Friendly"},
    )
    assert wa_res.status_code == 200
    wa_data = wa_res.json()
    assert "Naveen" in wa_data["content"]
    assert "WhatsApp" in followup_calls[0]
    assert "Friendly" in followup_calls[0]
    assert "Naveen Rao" in followup_calls[0]


def test_lead_followup_gemini_unavailable_raises_503(client, monkeypatch):
    """Verify POST /api/leads/{id}/follow-up returns HTTP 503 when Gemini fails."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    payload = {
        "name": "Naveen Rao",
        "location": "Bengaluru",
        "property_requirement": "2 BHK",
        "budget": "₹80L",
        "buying_timeline": "Immediate",
        "customer_message": "Ready to book.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]

    def mock_fail(contents, config=None):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service is temporarily unavailable.",
        )

    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: True)
    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_fail)

    res = client.post(
        f"/api/leads/{lead_id}/follow-up",
        json={"channel": "WhatsApp", "tone": "Friendly"},
    )
    assert res.status_code == 503


def test_priority_scoring_function():
    """Directly verify priority scoring calculations and threshold signals."""
    p1, r1 = calculate_lead_priority(
        buying_timeline="Immediate / Ready to move",
        budget="₹90L",
        property_requirement="2 BHK",
        customer_message="Can visit this Saturday with family.",
    )
    assert p1 == "HOT"
    assert "immediate timeline" in r1.lower()

    p2, r2 = calculate_lead_priority(
        buying_timeline="More than 6 months",
        budget="Not sure",
        property_requirement="Looking around",
        customer_message="Just exploring, not in a rush to buy.",
    )
    assert p2 == "COLD"
    assert "exploratory" in r2.lower()


def test_schedule_lead_followup_endpoint(client, monkeypatch):
    """Verify PUT /api/leads/{id}/schedule updates next_follow_up_at and last_contacted_at."""
    monkeypatch.setattr(ai_service, "is_api_key_configured", lambda: False)

    payload = {
        "name": "Anil Kapoor",
        "location": "Mumbai",
        "property_requirement": "4 BHK",
        "budget": "₹6 Cr",
        "buying_timeline": "Immediate",
        "customer_message": "Call me tomorrow 11 AM.",
    }
    created = client.post("/api/leads", json=payload).json()
    lead_id = created["id"]
    assert created["next_follow_up_at"] is None

    sched_res = client.put(
        f"/api/leads/{lead_id}/schedule",
        json={"next_follow_up_at": "2026-10-01T11:00:00Z", "last_contacted_at": "2026-09-30T10:00:00Z"},
    )
    assert sched_res.status_code == 200
    data = sched_res.json()
    assert data["next_follow_up_at"] is not None
    assert data["last_contacted_at"] is not None


def test_startup_does_not_call_gemini(monkeypatch):
    """Verify that FastAPI lifespan startup and initial database seeding make 0 Gemini calls."""
    from fastapi.testclient import TestClient
    from app.main import app
    from google.genai.errors import ServerError

    gemini_calls = []

    def mock_generate(*args, **kwargs):
        gemini_calls.append((args, kwargs))
        raise RuntimeError("Gemini was called during startup! Startup must make 0 Gemini calls.")

    monkeypatch.setattr(ai_service, "_generate_with_gemini", mock_generate)

    # Trigger full lifespan startup via TestClient
    with TestClient(app) as tc:
        resp = tc.get("/health")
        assert resp.status_code == 200

    # Ensure zero Gemini calls occurred during startup/seeding
    assert len(gemini_calls) == 0


def test_gemini_503_retry_and_exponential_backoff(monkeypatch):
    """Verify that _generate_with_gemini handles 503 with exponential backoff and succeeds on retry."""
    from google.genai.errors import ServerError

    mock_client = MagicMock()
    attempts = []
    sleeps = []

    def fake_generate_content(*args, **kwargs):
        attempts.append(len(attempts) + 1)
        if len(attempts) < 3:
            raise ServerError("503 UNAVAILABLE - Model experiencing high demand")
        return DummyGeminiResponse('{"result": "success"}')

    mock_client.models.generate_content = fake_generate_content
    monkeypatch.setattr(ai_service, "get_gemini_client", lambda: mock_client)
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))

    res = ai_service._generate_with_gemini(contents="test prompt")
    assert res.text == '{"result": "success"}'
    assert len(attempts) == 3
    # Check exponential backoff delays (1s, 2s)
    assert sleeps == [1, 2]


def test_gemini_503_retry_exhaustion_raises_503_http_exception(monkeypatch):
    """Verify that when 503 retries are exhausted, a clean 503 HTTPException is raised without exposing keys."""
    from google.genai.errors import ServerError

    mock_client = MagicMock()
    attempts = []
    monkeypatch.setattr(time, "sleep", lambda s: None)

    def fake_generate_content(*args, **kwargs):
        attempts.append(1)
        raise ServerError("503 UNAVAILABLE - High demand")

    mock_client.models.generate_content = fake_generate_content
    monkeypatch.setattr(ai_service, "get_gemini_client", lambda: mock_client)

    with pytest.raises(HTTPException) as exc_info:
        ai_service._generate_with_gemini(contents="test prompt")

    assert exc_info.value.status_code == 503
    assert "Gemini is temporarily unavailable. Please try again shortly." in exc_info.value.detail
    assert len(attempts) == 3

