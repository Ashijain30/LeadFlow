import pytest
from app.services.priority_service import calculate_lead_priority


def test_health_endpoints(client):
    """Verify both /health and /api/health return 200 OK."""
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "ok"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "ok"


def test_create_lead_success(client):
    """Verify creating a lead persists data and automatically scores priority."""
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
    assert data["ai_analysis"] is not None
    assert "summary" in data["ai_analysis"]
    assert "suggested_response" in data["ai_analysis"]


def test_create_lead_validation_error(client):
    """Verify creating a lead with missing required fields returns 422."""
    bad_payload = {
        "name": "",  # Empty name violates min_length=1
        "location": "Delhi",
    }
    response = client.post("/api/leads", json=bad_payload)
    assert response.status_code == 422


def test_list_leads_and_filtering(client):
    """Verify listing leads and filtering by priority and search term."""
    # Create two leads
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


def test_get_lead_by_id_and_not_found(client):
    """Verify retrieving lead by ID and handling missing leads with 404."""
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


def test_update_lead_and_priority_recalculation(client):
    """Verify updating a lead changes details and triggers priority update when relevant."""
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


def test_delete_lead(client):
    """Verify deleting a lead removes it permanently."""
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


def test_reanalyze_lead_endpoint(client):
    """Verify POST /api/leads/{id}/analyze updates lead AI analysis."""
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
    assert "ai_analysis" in reanalyze_res.json()


def test_lead_chat_endpoint(client):
    """Verify POST /api/leads/{id}/chat produces lead-grounded responses."""
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

    chat_payload = {"message": "What should I emphasize on the call?"}
    chat_res = client.post(f"/api/leads/{lead_id}/chat", json=chat_payload)
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["lead_id"] == lead_id
    assert "Pooja Hegde" in data["response"] or "call" in data["response"].lower()


def test_lead_followup_endpoint(client):
    """Verify POST /api/leads/{id}/follow-up produces customized communications."""
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

    # Test WhatsApp + Friendly
    wa_res = client.post(
        f"/api/leads/{lead_id}/follow-up",
        json={"channel": "WhatsApp", "tone": "Friendly"},
    )
    assert wa_res.status_code == 200
    wa_data = wa_res.json()
    assert "Naveen Rao" in wa_data["content"]
    assert "2 BHK" in wa_data["content"]

    # Test Email + Professional
    email_res = client.post(
        f"/api/leads/{lead_id}/follow-up",
        json={"channel": "Email", "tone": "Professional"},
    )
    assert email_res.status_code == 200
    email_data = email_res.json()
    assert "Subject:" in email_data["content"]


def test_priority_scoring_function():
    """Directly verify priority scoring calculations and threshold signals."""
    # Hot case
    p1, r1 = calculate_lead_priority(
        buying_timeline="Immediate / Ready to move",
        budget="₹90L",
        property_requirement="2 BHK",
        customer_message="Can visit this Saturday with family.",
    )
    assert p1 == "HOT"
    assert "immediate timeline" in r1.lower()

    # Cold case
    p2, r2 = calculate_lead_priority(
        buying_timeline="More than 6 months",
        budget="Not sure",
        property_requirement="Looking around",
        customer_message="Just exploring, not in a rush to buy.",
    )
    assert p2 == "COLD"
    assert "exploratory" in r2.lower()
