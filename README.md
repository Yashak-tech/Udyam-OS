# Udyam OS

## The AI Company Command Center

> **Core Philosophy:** *AI executes. Founder decides.*

---

## 🧭 Overview

**Udyam OS** is a phone-first AI company command center that coordinates a specialized autonomous AI workforce to transform a founder's raw business objective into structured company outputs and a verified, launch-ready venture package.

Rather than acting as a chatbot, website builder, or prompt-to-app generator, Udyam OS serves as an executive operating system for company creation. The founder sets the high-level intent, an autonomous 4-specialist workforce executes sequentially across a shared company context, automated quality control audits all deliverables against 12 objective checks, and the human founder retains ultimate authority via a decisive on-device approval gate before any launch package is sealed.

> **Important Product Distinction:**  
> The customer landing page is **one business artifact** produced by the Builder Agent. Udyam OS is **the operating system** coordinating the company creation lifecycle. Udyam OS is not an app builder, website generator, or Bolt/Lovable clone.

---

## 🔄 The Complete Venture Lifecycle

```text
FOUNDER OBJECTIVE
        ↓
  UDYAM MANAGER (Orchestration Core)
        ↓
  RESEARCH AGENT (Market & Customer Intelligence)
        ↓
  PRODUCT AGENT (MVP Scope & Functional Specs)
        ↓
  BUILDER AGENT (Customer Touchpoint & Landing Experience)
        ↓
  GROWTH AGENT (GTM Strategy & Distribution Channels)
        ↓
SHARED COMPANY CONTEXT (Persistent Single Source of Truth)
        ↓
COMPANY OUTPUTS (Auditable Physical Filesystem Deliverables)
        ↓
QUALITY CONTROL (12-Point Deterministic Verification Engine)
        ↓
FOUNDER APPROVAL (Human Gatekeeper Decision Gate)
        ↓
LAUNCH PACKAGE (Cryptographically Sealed Company Manifest)
        ↓
PHONE / OFFICE KIT (Laptop Desktop Workspace Bridge)
```

---

## 👥 The Autonomous AI Workforce

Udyam OS coordinates four specialized agents with strict domain boundaries and dependencies:

| Specialist | Domain & Responsibility | Key Deliverable |
|---|---|---|
| **Research Agent** | Synthesizes target ICPs, customer pain points, competitor strengths/weaknesses, and market wedges. | `research_brief.md` |
| **Product Agent** | Consumes research context to draft core user journeys, functional requirements, and 4-step MVP scope. | `product_requirements.md` |
| **Builder Agent** | Consumes PRD and brand identity to engineer a responsive, customer-facing touchpoint with high contrast typography and isolated styles. | `landing_page/index.html`<br>`landing_page/styles.css` |
| **Growth Agent** | Consumes all previous outputs to define positioning statements, 3 acquisition channels, and day-1 launch actions. | `launch_strategy.md` |

All four agents communicate strictly through a structured **Shared Company Context**, ensuring that downstream agents build upon verified upstream intelligence rather than hallucinating in isolation.

---

## 🛡️ Governance & Quality Control

### 12-Point Automated Quality Verification
Before any venture can reach the founder for sign-off, the **Verification Engine** executes 12 objective, rules-based audits across deliverables:
1. **Research Brief Presence:** File exists in session workspace.
2. **Research ICP Defined:** Identifies explicit target customer personas.
3. **Research Competitor Analysis:** Verifies competitor evaluation.
4. **PRD Presence:** Verifies requirements document existence.
5. **PRD MVP Scope Defined:** Validates concrete MVP feature specs.
6. **Landing Page HTML Presence:** Verifies HTML deliverable.
7. **Valid HTML5 Structure:** Ensures correct root tags and structure.
8. **Responsive Mobile Viewport:** Checks mobile viewport meta tag.
9. **Styles.css Presence:** Verifies standalone stylesheet existence.
10. **Launch Strategy Presence:** Verifies growth deliverable existence.
11. **GTM Launch Channels Defined:** Confirms acquisition channels.
12. **Cross-Artifact Semantic Consistency:** Ensures product identity and positioning align across all generated documents.

### Authoritative Founder Approval Gate
- **Backend Authority:** The session cannot transition to `LAUNCH_READY` without explicit founder approval via `POST /api/v1/sessions/{id}/approval`.
- **Revision Flow (`REQUEST REVISION`):** If the founder critiques an output, the system transitions to `REVISION_REQUESTED`, re-executes the targeted specialist with feedback, re-audits the deliverables, and returns to `AWAITING_APPROVAL`.
- **Launch Package:** Upon approval, a sealed manifest (`launch_package.json`) is generated containing venture metadata, checksums, and execution timestamps.

---

## 📱 Architecture & Tech Stack

```text
       iQOO Smartphone / Mobile Web Client
           │                     ▲
  (REST Actions)         (WebSocket Telemetry)
           ▼                     │
┌────────────────────────────────────────────────────────┐
│                   UDYAM OS BACKEND                     │
│                                                        │
│  FastAPI Core (0.0.0.0:8000)                           │
│  ├── Udyam Manager (Async Lifecycle State Machine)     │
│  ├── Event Bus (Operational Telemetry Stream)          │
│  ├── Shared Company Context (Pydantic V2 Models)       │
│  ├── Agent Workforce (Research, Product, Builder, GTM) │
│  ├── Verification Engine (12 Deterministic Rules)      │
│  ├── Approval Manager (Founder Decision Gate)          │
│  ├── Workspace Tool (Sandboxed File Operations)        │
│  └── SQLite Repository (Authoritative Persistence)     │
└────────────────────────────────────────────────────────┘
```

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLite, WebSockets.
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons. Designed mobile-first inside a responsive phone viewport shell (`100dvh`, safe-area insets).
- **Communication:** REST APIs for commands and state queries; WebSocket (`/ws/sessions/{id}`) for real-time operational event streaming (strictly sanitized; zero private reasoning or chain-of-thought exposed).

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone & Configure
```bash
git clone https://github.com/Yashak-tech/Udyam-OS.git
cd Udyam-OS

# Copy environment template
cp .env.example .env
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server
npm run dev -- --host 0.0.0.0 --port 5173
```
Open `http://localhost:5173` on your desktop browser (rendered inside a phone shell) or directly on your smartphone connected to the same Wi-Fi network via `http://<YOUR_LOCAL_IP>:5173`.

---

## 🧪 Testing

Run the automated integration and hardening test suite:

```bash
# Run full pytest suite
python -m pytest tests/ -v

# Run live end-to-end integration verification against running server
python tests/verify_phase7.py
```

---

## 📂 Project Structure

```text
Udyam-OS/
├── backend/
│   ├── main.py                  # FastAPI application entrypoint
│   ├── api/                     # REST routes & WebSocket feed
│   ├── agents/                  # 4 Specialized agents + Model provider
│   ├── approvals/               # Founder governance & revision manager
│   ├── core/                    # Config, models, exceptions, constants
│   ├── events/                  # Lightweight in-memory operational event bus
│   ├── orchestrator/            # Udyam Manager state machine
│   ├── storage/                 # SQLite session repository
│   ├── tools/                   # Sandboxed filesystem & search tools
│   └── verification/            # 12-point quality verification engine
├── frontend/
│   ├── src/
│   │   ├── api/                 # REST client & WebSocket manager
│   │   ├── components/          # Phone shell, execution graph, cards
│   │   ├── context/             # Session state & reload persistence
│   │   ├── screens/             # Command, Workforce, Outputs, Launch
│   │   └── utils/               # Authoritative state reconciliation
│   ├── package.json
│   └── vite.config.js
├── docs/                        # Architecture, contracts, and system specs
├── tests/                       # Unit and end-to-end integration tests
├── .env.example                 # Environment configuration template
├── .gitignore                   # Version control exclusion rules
└── README.md                    # System documentation
```

---

## 📄 License

This project is licensed under the Apache 2.0 License.
