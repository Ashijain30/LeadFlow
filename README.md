# LeadFlow — AI-Powered Real Estate Sales Copilot

An intelligent, full-stack AI application designed to help real-estate sales representatives understand, prioritize, and act on inbound property leads.

---

## 1. Project Overview

Real estate sales professionals receive dozens of unstructured inquiries across WhatsApp, property portals (99acres, MagicBricks), and landing pages. Many leads are window-shoppers, while high-intent buyers slip through the cracks due to delayed follow-ups.

**LeadFlow** solves this by:
1. **Capturing inbound leads** with structured criteria (Budget, Timeline, Locality, Specifications, Raw Customer Message).
2. **Generating AI sales intelligence** using Google Gemini (Structured Executive Summary, Buying Intent, Key Requirements, Objections/Concerns, Tactical Next Action, and Suggested Response).
3. **Transparent Lead Prioritization** (`HOT`, `WARM`, `COLD`) using an explainable, multi-factor scoring mechanism based on purchase urgency, budget specificity, and engagement signals.
4. **AI Priority Queue ("Next Actions")**: Dynamically surfaces the top 3 leads needing immediate salesperson action based on scheduled follow-ups, urgency, and priority tier.
5. **Smart Follow-up Scheduling & Contact Tracking**: In-app scheduling ("Today 5 PM", "Tomorrow 11 AM", "In 2 Days", Custom) with 1-click contact logging (`lastContactedAt`, `nextFollowUpAt`).
6. **Lead-Specific Conversational Co-Pilot**: An interactive sales assistant grounded exclusively in the selected lead's facts and objections.
7. **AI Follow-up Generator**: Instant custom messaging across **WhatsApp**, **Email**, and **Call Scripts** in 4 tailored tones (**Professional**, **Friendly**, **Assertive**, **Urgent**).

---

## 2. Architecture & Security

```
┌─────────────────────────────────────────────────────────┐
│                     React + Vite UI                     │
│  (Dashboard, Lead Details, Lead Chat, Follow-up Studio) │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     FastAPI Backend                     │
│         (Routers, Pydantic Schemas, Controllers)        │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│       SQLite Database       │   │      Google Gemini API      │
│      (SQLAlchemy ORM)       │   │    (via google-genai SDK)   │
└─────────────────────────────┘   └─────────────────────────────┘
```

### Security First Principle
* **Server-Side AI Access**: The Gemini API key remains strictly on the backend (`backend/.env`). It is **never** bundled or referenced in frontend JavaScript.
* **Input & Output Validation**: All inbound payloads and LLM outputs are validated against strict Pydantic schemas before persistence or presentation.
* **Safe Rendering**: All AI-generated text is rendered via standard React text nodes to prevent XSS (Cross-Site Scripting).
* **Database Security**: All queries are executed through SQLAlchemy ORM parameterization, mitigating SQL injection risks.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript (JSX), CSS3, Lucide React Icons |
| **Backend** | Python 3.12, FastAPI, Uvicorn (ASGI server) |
| **Data Validation** | Pydantic v2, Pydantic Settings |
| **Database** | SQLite, SQLAlchemy 2.0 ORM |
| **AI Integration** | Google Gemini (`gemini-2.5-flash`), official `google-genai` SDK |
| **Testing** | pytest, FastAPI TestClient, in-memory SQLite isolation |

---

## 4. Project Directory Structure

```
masalAI_assignment/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Typed settings loaded from .env
│   │   ├── database.py           # SQLAlchemy engine & session factory
│   │   ├── models.py             # Lead ORM database model
│   │   ├── schemas.py            # Pydantic schemas (Leads, AI, Chat, Follow-up)
│   │   ├── main.py               # FastAPI entry point, lifespan, CORS
│   │   ├── routers/
│   │   │   └── leads.py          # REST endpoints (/api/leads)
│   │   └── services/
│   │       ├── lead_service.py   # Lead CRUD & database operations
│   │       ├── priority_service.py # Explainable scoring algorithm
│   │       └── ai_service.py     # Gemini SDK integration & prompt logic
│   ├── tests/
│   │   ├── conftest.py           # Test fixtures with in-memory DB isolation
│   │   ├── test_health.py        # Health check tests
│   │   └── test_leads_api.py     # Full CRUD, AI, Chat, and Follow-up tests
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Documented configuration template
│   └── .env                      # Local environment secrets (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/           # Header, LeadCard, PriorityBadge, SummaryCards
│   │   ├── pages/                # Dashboard, AddLead, LeadDetails, LeadChat, FollowUp
│   │   ├── services/             # api.js client
│   │   ├── data/                 # mockLeads.js (fallback seed)
│   │   ├── App.jsx               # Root application component
│   │   ├── App.css               # Clean B2B SaaS responsive styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js            # Vite configuration with /api proxy
├── Procfile                      # Production ASGI command
├── .gitignore                    # Ignores .env, venv, node_modules, *.db, dist
└── README.md
```

---

## 5. Environment Configuration

Copy the example environment configuration into `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```ini
# Google Gemini API Key (obtained from Google AI Studio)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Gemini Model
GEMINI_MODEL=gemini-2.5-flash

# SQLite Database
DATABASE_URL=sqlite:///./leads.db

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

*(Note: If no API key is provided, the application will automatically activate its built-in contextual fallback engine, ensuring all features continue working seamlessly without runtime exceptions).*

---

## 6. Local Setup & Running

### Step 1: Backend Setup
```bash
# Navigate to workspace root
cd masalAI_assignment

# Activate the virtual environment
source backend/venv/bin/activate

# Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/api/health`

### Step 2: Frontend Setup
```bash
# In a new terminal window:
cd masalAI_assignment/frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. Running Tests

Automated backend tests execute against an isolated in-memory SQLite database, guaranteeing zero side-effects on local data.

```bash
# Run backend pytest suite
backend/venv/bin/pytest backend/tests

# Verify frontend production build
npm run build --prefix frontend
```

---

## 8. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/leads` | List leads (supports `?search=` and `?priority=`) |
| `POST` | `/api/leads` | Create a lead with automatic priority scoring & AI analysis |
| `GET` | `/api/leads/{id}` | Retrieve complete lead details |
| `PUT` | `/api/leads/{id}` | Update lead details and recalculate priority |
| `DELETE` | `/api/leads/{id}` | Delete lead permanently |
| `POST` | `/api/leads/{id}/analyze` | Trigger re-analysis using Gemini |
| `PUT` | `/api/leads/{id}/schedule` | Update `last_contacted_at` or `next_follow_up_at` |
| `POST` | `/api/leads/{id}/chat` | Ask salesperson questions grounded in the lead |
| `POST` | `/api/leads/{id}/follow-up` | Generate WhatsApp, Email, or Call Script follow-ups |

---

## 9. Priority Scoring Logic

The application avoids opaque black-box scoring by using an **explainable 100-point multi-factor model**:
* **Timeline Urgency (0–40 pts)**: Ready to move / < 1 month (+40), 2–3 months (+25), 4–6 months (+15), > 6 months (+5).
* **Budget Specificity (0–25 pts)**: Stated currency amount/range (+25), unconfirmed (+5).
* **Requirement Definition (0–15 pts)**: Concrete unit type (BHK/Villa) (+15), general exploration (+8).
* **Engagement Signals (0–20 pts)**: High-intent keywords ("visit this weekend", "token", "ready to move") (+20) vs hesitation keywords ("just browsing", "not in a rush") (0).

**Tiers**:
* **HOT ($\ge$ 70 pts)**: Urgent action required (< 1 month, specific budget, high intent).
* **WARM (40–69 pts)**: Active pipeline (2–3 month horizon, evaluating builders).
* **COLD (< 40 pts)**: Exploratory (> 6 months, vague budget, low urgency).

Every lead stores a human-readable `priority_reason` explaining exactly why the tier was assigned.

---

## 10. AI Usage Disclosure

In compliance with assignment standards, AI coding assistance (Antigravity by Google DeepMind) was utilized during development for rapid scaffolding, test composition, and architectural reviews. All code and system designs follow production-grade engineering principles and were verified through automated tests and local compilation.
