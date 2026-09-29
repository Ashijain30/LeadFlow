# Masal AI — Complete Technical Documentation

---

## 1. Project Overview
Masal AI is an AI-powered B2B real-estate lead prioritization and sales-assistant platform. It is engineered specifically for real-estate sales representatives and brokers who manage inbound property inquiries across multiple acquisition channels (portals, website forms, WhatsApp messages). The application accelerates the sales cycle by automatically extracting structured buyer intelligence, transparently scoring lead priority, offering lead-grounded conversational coaching, and generating customized multi-channel follow-up communications.

---

## 2. Problem Statement
Real estate sales teams face three primary operational bottlenecks:
1. **Unstructured & Fragmented Inquiries**: Messages arrive in varying formats without standardized data, forcing sales reps to manually decipher customer needs.
2. **Prioritization Paralysis**: Sales reps often waste time chasing lukewarm window-shoppers while high-urgency, ready-to-buy customers go cold due to delayed response times.
3. **Inconsistent & Generic Outreach**: Drafting tailored WhatsApp messages, formal emails, or phone scripts for dozens of leads is time-consuming, resulting in generic templates that fail to convert.

Masal AI eliminates these inefficiencies by combining deterministic multi-signal prioritization with generative AI intelligence grounded strictly in the lead's profile.

---

## 3. Product Features
* **Structured Lead Intake**: Form with validation capturing Name, Locality, Property Requirement, Budget, Purchase Timeline, and raw Inbound Customer Message.
* **Autonomous AI Lead Analysis**: Extracts Executive Summary, Buying Intent, Key Requirements, Buyer Objections & Concerns, Recommended Next Tactical Action, and Suggested First Response.
* **Transparent Multi-Factor Prioritization (`HOT`, `WARM`, `COLD`)**: Rule-based explainable scoring using timeline urgency, budget specificity, and engagement signals.
* **Lead-Specific Conversational Co-Pilot**: Interactive chat interface enabling the salesperson to ask tactical questions ("What should I emphasize on the call?", "Make my reply more assertive") strictly grounded in the selected customer's profile.
* **AI Follow-up Studio**: Dynamic communication generator across **WhatsApp**, **Email**, and **Call Scripts** with customizable tones (**Professional**, **Friendly**, **Assertive**, **Urgent**) and 1-click clipboard copying.
* **Unified Sales Dashboard**: Pipeline summary cards, instant search, priority filtering, and disk persistence.

---

## 4. Complete Architecture

```
                                USER / SALESPERSON
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │     React + Vite Frontend     │
                       │   (Port 5173 - Client SPA)    │
                       └───────────────┬───────────────┘
                                       │ HTTP / REST (JSON)
                                       │ (Vite Proxy: /api -> :8000)
                                       ▼
                       ┌───────────────────────────────┐
                       │        FastAPI Backend        │
                       │   (Uvicorn ASGI - Port 8000)  │
                       ├───────────────────────────────┤
                       │  • Routers (/api/leads)       │
                       │  • Pydantic Input/Output Vld  │
                       │  • CORS & Lifespan Hooks      │
                       └───────────────┬───────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
      ┌───────────────────────────┐         ┌───────────────────────────┐
      │      SQLite Database      │         │     Google Gemini API     │
      │   (SQLAlchemy 2.0 ORM)    │         │  (google-genai SDK 2.25)  │
      │   File: backend/leads.db  │         │   Model: gemini-2.5-flash │
      └───────────────────────────┘         └───────────────────────────┘
```

---

## 5. Technology Stack

* **Frontend**: React 18, Vite 6, JavaScript (JSX), CSS3, Lucide React (Icons).
* **Backend**: Python 3.12, FastAPI 0.115+, Uvicorn 0.54 (ASGI Server).
* **Database & ORM**: SQLite 3, SQLAlchemy 2.1 ORM.
* **Data Contracts & Validation**: Pydantic 2.13, Pydantic Settings 2.15.
* **Artificial Intelligence**: Google Gemini API via official `google-genai` SDK.
* **Testing & Quality Assurance**: pytest 9.1, FastAPI TestClient, in-memory SQLite isolation.

---

## 6. Project Structure

```
masalAI_assignment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Centralized Pydantic BaseSettings
│   │   ├── database.py           # SQLite engine, SessionLocal, get_db
│   │   ├── models.py             # Lead SQLAlchemy database model
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── main.py               # FastAPI app, lifespan, CORS, health
│   │   ├── routers/
│   │   │   └── leads.py          # CRUD, Analysis, Chat, Follow-up routes
│   │   └── services/
│   │       ├── lead_service.py   # Database query and CRUD logic
│   │       ├── priority_service.py # Explainable scoring algorithm
│   │       └── ai_service.py     # Gemini SDK client & prompts
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py           # In-memory DB fixture & TestClient
│   │   ├── test_health.py        # Health endpoint test
│   │   └── test_leads_api.py     # 11 tests covering CRUD, AI, Chat, Scoring
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   ├── LeadCard.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddLead.jsx
│   │   │   ├── LeadDetails.jsx
│   │   │   ├── LeadChat.jsx
│   │   │   └── FollowUpGenerator.jsx
│   │   ├── services/
│   │   │   └── api.js            # Normalized REST client
│   │   ├── data/
│   │   │   └── mockLeads.js      # Seed fallback data
│   │   ├── App.jsx               # Application root & view controller
│   │   ├── App.css               # B2B SaaS styles
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Procfile
├── .gitignore
├── README.md
└── MASAL_AI_DOCUMENTATION.md
```

---

# Phase 1 — Project Architecture & Setup

## Objective
Establish the foundational developer environment, version control rules, backend skeleton, and frontend build tooling with zero technical debt or hardcoded secrets.

## What Was Implemented
* Initialized Git repository with comprehensive `.gitignore` rules.
* Created a dedicated Python virtual environment in `backend/venv/` with Python 3.12.
* Installed core backend dependencies: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `google-genai`, `sqlalchemy`, `pytest`, `httpx`.
* Established centralized configuration via `pydantic-settings` (`backend/app/config.py`).
* Created `backend/app/main.py` with CORS middleware and `GET /api/health`.
* Initialized React + Vite frontend with `lucide-react` icons.

## Files Created/Modified
* `.gitignore`, `backend/requirements.txt`, `backend/.env.example`, `backend/.env`
* `backend/app/__init__.py`, `backend/app/config.py`, `backend/app/main.py`
* `backend/tests/__init__.py`, `backend/tests/test_health.py`
* `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/App.jsx`, `frontend/src/main.jsx`

## How It Works
Uvicorn runs the FastAPI application on port 8000. FastAPI configures CORS to accept incoming requests from `http://localhost:5173`. Vite serves the React development application on port 5173 and proxies `/api` requests to port 8000.

## Technical Decisions
* **Virtual Environment Location**: Placed in `backend/venv/` to isolate Python dependencies without polluting the root repository.
* **Pydantic Settings**: Used `BaseSettings` with multi-path `.env` resolution (`.env`, `backend/.env`) to avoid fragile `os.getenv` strings.

## Testing & Verification
* Backend health check test passed: `pytest backend/tests/test_health.py` (1 passed in 0.38s).
* Frontend build verified: `npm run build --prefix frontend` (succeeded in 354ms).
* Git ignore verified: `git check-ignore -v backend/.env backend/venv/` confirmed ignored.

---

# Phase 2 — Frontend UI Structure (Mock Data)

## Objective
Construct the complete salesperson-facing interface across 5 distinct screens using reusable components, clean responsive layouts, and realistic Indian real estate mock data.

## What Was Implemented
* **Dashboard**: 4 Metric summary cards, real-time search, priority tab filtering, and lead cards grid.
* **Add Lead Form**: Clean input controls with client-side required field validation.
* **Lead Details**: Overview fact cards and a 6-part AI intelligence grid with 1-click clipboard copy.
* **Lead Chat UI**: Context banner showing lead requirement, quick prompt chips, message bubbles, and natural typing delay.
* **AI Follow-up Studio**: Channel selector (WhatsApp, Email, Call Script), tone selector (Professional, Friendly, Assertive, Urgent), formatted preview, and copy feedback.

## Files Created/Modified
* `frontend/src/data/mockLeads.js`
* `frontend/src/components/Header.jsx`, `PriorityBadge.jsx`, `SummaryCards.jsx`, `LeadCard.jsx`, `EmptyState.jsx`
* `frontend/src/pages/Dashboard.jsx`, `AddLead.jsx`, `LeadDetails.jsx`, `LeadChat.jsx`, `FollowUpGenerator.jsx`
* `frontend/src/App.jsx`, `frontend/src/App.css`

## Testing & Verification
* `npm run build --prefix frontend` passed cleanly in 1.04s transforming 1584 modules.

---

# Phase 3 & 4 — Backend API, SQLite Database & Lead CRUD

## Objective
Replace temporary client-side memory with persistent relational storage in SQLite using SQLAlchemy ORM, and expose standard RESTful endpoints with Pydantic request/response validation.

## What Was Implemented
* Database configuration (`backend/app/database.py`) with thread-safe SQLite engine and request-scoped `get_db` session dependency.
* `Lead` SQLAlchemy model (`backend/app/models.py`) storing all required lead fields, priority, priority reason, and JSON-encoded AI analysis.
* Pydantic schemas (`backend/app/schemas.py`) enforcing types and field constraints.
* Lead service layer (`backend/app/services/lead_service.py`) with CRUD operations and idempotent database seeding on startup.
* Leads router (`backend/app/routers/leads.py`):
  * `GET /api/leads` (list with search and priority query filters)
  * `POST /api/leads` (status 201)
  * `GET /api/leads/{id}` (single lead with 404 handling)
  * `PUT /api/leads/{id}` (update with 404 handling)
  * `DELETE /api/leads/{id}` (status 204 with 404 handling)

## How It Works
Incoming JSON is validated by Pydantic against `LeadCreate`. The service layer computes priority and saves the model to SQLite via SQLAlchemy. The committed record is converted into `LeadResponse` and serialized back to the client.

## Technical Decisions
* **JSON Column for AI Analysis**: Storing the 6 structured AI items inside a native SQLite JSON column preserves flexibility without requiring an over-engineered multi-table relational schema.
* **Idempotent Seeding**: During FastAPI `lifespan` startup, `seed_default_leads_if_empty()` only seeds records if `db.query(Lead).count() == 0`, avoiding duplicate leads on every server restart.

## Testing & Verification
* Created isolated in-memory test database fixture in `backend/tests/conftest.py`.
* Verified real persistence across server restarts using a multi-session script (`Created lead -> Disposed Engine -> Reloaded lead from disk`).

---

# Phase 5 & 6 — Real Gemini AI Integration & Structured Analysis

## Objective
Connect the backend to the Google Gemini API using the official `google-genai` SDK to produce structured, schema-validated lead intelligence grounded strictly in the customer's input.

## What Was Implemented
* AI Service (`backend/app/services/ai_service.py`) using `genai.Client(api_key=settings.gemini_api_key)`.
* Structured output extraction using Pydantic `AIAnalysisSchema`:
  1. `summary` (Executive summary)
  2. `intent` (Purchase intention)
  3. `key_requirements` (Verified list)
  4. `objections` (Identified risks/concerns)
  5. `recommended_next_action` (Immediate next step)
  6. `suggested_response` (Ready-to-send reply)
* Robust error handling and fallback: If the API key is not configured or an external network error occurs, the service gracefully switches to a high-quality contextual rule analyzer without crashing or corrupting lead state.

## Technical Decisions
* **Native Pydantic Response Schema**: Used `response_schema=AIAnalysisSchema` and `response_mime_type="application/json"` in `types.GenerateContentConfig` to instruct Gemini to produce strict JSON matching our Pydantic schema, eliminating fragile regex parsing.
* **Zero Real AI Calls in Automated Tests**: All unit tests run against local mocks/fallbacks, preventing flaky network failures or quota exhaustion in CI/CD pipelines.

---

# Phase 7 — Explainable Priority Scoring

## Objective
Implement an explainable, multi-signal scoring model that categorizes leads into `HOT`, `WARM`, and `COLD` with human-readable rationale.

## What Was Implemented
* `backend/app/services/priority_service.py` evaluates 4 transparent dimensions:
  1. **Timeline Urgency (0–40 pts)**: Ready to move / < 1 month (+40), 2–3 months (+25), 4–6 months (+15), > 6 months (+5).
  2. **Budget Specificity (0–25 pts)**: Stated currency/range (+25), number only (+15), unconfirmed (+5).
  3. **Requirement Definition (0–15 pts)**: Concrete unit type (+15), general (+8).
  4. **Engagement Signals (0–20 pts)**: Action keywords like "visit this weekend" (+20) vs hesitation keywords like "just exploring" (0).
* **Thresholds**: $\ge 70 \rightarrow \text{HOT}$, $40–69 \rightarrow \text{WARM}$, $< 40 \rightarrow \text{COLD}$.
* Generates an explainable `priority_reason` stored in SQLite and displayed on lead cards.

---

# Phase 8 & 9 — Lead Chat & AI Follow-Up Generator Endpoints

## Objective
Provide endpoints for lead-specific conversational coaching and multi-channel follow-up drafting.

## What Was Implemented
* `POST /api/leads/{id}/chat`: Extracts lead context and passes it into Gemini with system instructions to act as a Real Estate Sales Coach.
* `POST /api/leads/{id}/follow-up`: Generates tailored messages for **WhatsApp** (short, conversational), **Email** (subject + formal body), and **Call Script** (opening, discovery, closing) across **Professional**, **Friendly**, **Assertive**, and **Urgent** tones.

---

# Phase 10 & 11 — Frontend Integration & UI Polish

## Objective
Connect React to the FastAPI backend, replace mock persistence with real API requests, and provide enterprise-grade UX polish.

## What Was Implemented
* Created centralized API adapter in `frontend/src/services/api.js` with field normalization (`normalizeLead`).
* Connected Dashboard to `GET /api/leads`.
* Connected Add Lead form to `POST /api/leads`.
* Connected Lead Details to `GET /api/leads/{id}`, `POST /api/leads/{id}/analyze`, and `DELETE /api/leads/{id}` (with confirmation banner).
* Connected Chat to `POST /api/leads/{id}/chat`.
* Connected Follow-up Studio to `POST /api/leads/{id}/follow-up`.
* Added loading spinners, button disabling during requests, clipboard copy visual confirmation, and priority rationale badges.

---

# Phase 12 — Testing & Verification

## Objective
Verify all backend and frontend layers through automated test suites and production build checks.

## Actual Test Execution Results
```
backend/tests/test_health.py .                                           [  8%]
backend/tests/test_leads_api.py ...........                              [100%]
======================== 12 passed, 1 warning in 0.10s =========================
```
* **Frontend Build**: `npm run build --prefix frontend` succeeded in 1.04s generating `dist/assets/index-roYP1KCr.js` (204.89 kB).

---

# Phase 13 — Security Review

## Security Controls Verified
1. **Server-Side API Key Storage**: Gemini key is stored only in `backend/.env`. Verified zero occurrences of API keys in frontend assets.
2. **Git Hygiene**: `.gitignore` strictly ignores `.env`, `venv/`, `node_modules/`, `dist/`, and `*.db`.
3. **Safe Rendering**: All AI outputs render as plain React text nodes, preventing XSS injection.
4. **SQL Injection Mitigation**: All database operations use SQLAlchemy ORM parameterization.
5. **CORS Hardening**: Explicit origin whitelisting (`http://localhost:5173`).

---

# Phase 14 — Deployment Preparation

## Production Configuration
* Created `Procfile` for ASGI hosting: `web: uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}`.
* Supported `VITE_API_URL` environment variable in `frontend/src/services/api.js` for standalone cloud hosting (e.g., Vercel / Netlify frontend pointing to Render / Railway backend).
* **Database Note**: For free-tier cloud platforms with ephemeral disks, `DATABASE_URL` in `backend/.env` can be pointed directly to a managed PostgreSQL database (e.g. Neon) without changing any application code due to SQLAlchemy abstraction.

---

## Complete Request Flows

### 1. Create Lead Flow
```
User Submits Form (React)
  ──▶ POST /api/leads
  ──▶ Pydantic Validation (LeadCreate)
  ──▶ Priority Scoring Service (calculate_lead_priority)
  ──▶ Gemini AI Analysis (analyze_lead_with_ai)
  ──▶ SQLAlchemy ORM -> SQLite INSERT (db.commit())
  ──▶ LeadResponse returned -> Dashboard updates
```

### 2. Lead Chat Flow
```
Salesperson sends question ("What should I emphasize?")
  ──▶ POST /api/leads/{id}/chat
  ──▶ Fetch Lead from SQLite
  ──▶ Construct grounded prompt (Lead facts + AI objections)
  ──▶ Gemini Client (generate_content)
  ──▶ Sales guidance response returned -> UI renders bubble
```

### 3. Follow-Up Generation Flow
```
Salesperson selects Channel (WhatsApp) & Tone (Urgent)
  ──▶ POST /api/leads/{id}/follow-up
  ──▶ Fetch Lead from SQLite
  ──▶ Gemini formats message tailored to channel constraints
  ──▶ Formatted text returned -> 1-click Copy button
```

---

## Database Schema (`leads` table)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `name` | String(120) | Not Null | Customer's full name |
| `location` | String(120) | Not Null | Target city or locality |
| `property_requirement` | String(255) | Not Null | e.g. 2 BHK near Whitefield |
| `budget` | String(100) | Not Null | e.g. ₹85L – ₹95L |
| `buying_timeline` | String(100) | Not Null | e.g. Within 1 month |
| `customer_message` | Text | Not Null | Inbound inquiry message |
| `priority` | String(20) | Not Null, Default 'WARM' | `HOT`, `WARM`, or `COLD` |
| `priority_reason` | Text | Nullable | Human-readable scoring explanation |
| `ai_analysis` | JSON | Nullable | Stored 6-part AI analysis object |
| `created_at` | DateTime | Not Null, UTC | Record creation timestamp |
| `updated_at` | DateTime | Not Null, UTC | Last modification timestamp |

---

## 3-Minute Technical Demo Flow

1. **Overview & Dashboard (0:00 - 0:45)**:
   * Show dashboard metric tiles (Total, Hot, Warm, Cold).
   * Demonstrate real-time searching by city ("Bengaluru") or keyword.
   * Demonstrate 1-click priority filter tabs.
2. **Add Lead & Instant AI Analysis (0:45 - 1:30)**:
   * Click "Add New Lead", input a customer looking for a 3BHK in Gurgaon with immediate timeline.
   * Save lead: Show instant assignment of **HOT** priority and explain the transparent scoring reason.
   * Open Lead Details: Walk through the 6-part AI analysis grid (Summary, Intent, Requirements, Objections, Recommended Action, Suggested Response).
3. **Conversational Co-Pilot (1:30 - 2:15)**:
   * Click "Open AI Chat".
   * Click the suggested prompt: *"What should I emphasize on the call?"*.
   * Point out how the answer explicitly references the customer's budget and timeline rather than generic advice.
4. **Follow-Up Generator (2:15 - 3:00)**:
   * Click "Generate Follow-up".
   * Toggle between **WhatsApp (Friendly)** and **Email (Assertive)**.
   * Show how the format adjusts from concise chat with emojis to structured email with subject line.
   * Click "Copy Text" and demonstrate instant clipboard ready feedback.

---

## Technical Interview Preparation (Q&A)

### React & Frontend
**Q: Why use `useMemo` for search and filtering instead of storing `filteredLeads` in state?**
> *"Storing derived data in separate state causes synchronization bugs. With `useMemo`, `filteredLeads` is calculated purely as a function of `leads`, `searchQuery`, and `priorityFilter`, recalculating only when those dependencies change."*

**Q: How does the API adapter pattern in `frontend/src/services/api.js` help maintainability?**
> *"Components should not know HTTP details like status codes, JSON serialization, or endpoint paths. The API service encapsulates network calls and normalizes backend snake_case into predictable properties, decoupling UI components from backend schema changes."*

### FastAPI & Python
**Q: Why is FastAPI better suited for this AI application than Flask?**
> *"FastAPI has native async support for non-blocking I/O during external LLM API calls, integrates Pydantic for automated request/response validation, and generates interactive OpenAPI Swagger docs out of the box."*

**Q: How does the `get_db` generator function manage database connections safely?**
> *"It uses Python's `yield` pattern within a FastAPI dependency. When a request starts, a session is created and yielded. Once the response completes, the `finally` block executes `db.close()`, guaranteeing no database connection leaks."*

### AI & Gemini Integration
**Q: Why use structured JSON output (`response_schema`) rather than prompt instructions alone?**
> *"Prompt instructions alone can drift or return conversational markdown preambles like 'Here is your JSON:'. Setting `response_schema=AIAnalysisSchema` forces the model's decoding logits to conform to the Pydantic schema, guaranteeing valid JSON every time."*

**Q: Why must the Gemini API key remain strictly server-side?**
> *"Frontend code is delivered to and executed in the client browser. Any user can inspect network traffic or client source code to extract the API key, leading to quota theft and financial liability."*

### Priority & System Design
**Q: Why choose deterministic rule-based priority scoring over an LLM opinion?**
> *"LLM prompts can produce non-deterministic scores and hallucinated reasoning. A transparent rule-based model using weighted signals (timeline, budget clarity, intent) is explainable, auditable by salespeople, repeatable, and requires zero API cost."*
