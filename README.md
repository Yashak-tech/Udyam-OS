# Udyam OS — The AI Company Command Center

> **AI executes. Founder decides.**  
> A phone-first AI operating system coordinating an autonomous specialist workforce from initial concept to verified launch package.

---

## 🎯 Overview

**Udyam OS** is an autonomous AI company command center designed for founders. It translates a founder's raw business objective into verified, production-ready deliverables through a structured, multi-agent workforce with mandatory human-in-the-loop governance.

The complete product flow:
```
FOUNDER OBJECTIVE
        ↓
  UDYAM MANAGER
        ↓
    RESEARCH
        ↓
    PRODUCT
        ↓
    BUILDER
        ↓
    GROWTH
        ↓
SHARED COMPANY CONTEXT
        ↓
  COMPANY OUTPUTS
        ↓
 QUALITY CONTROL (12-Point Audit)
        ↓
 FOUNDER APPROVAL (Human Gate)
        ↓
  LAUNCH PACKAGE
        ↓
PHONE / OFFICE KIT
```

---

## 👥 The 4-Agent Workforce

1. **Research Agent (Market Intelligence)**
   - Identifies target customer profiles (ICP), pain points, market wedge, and competitor dynamics.
   - Output: `research_brief.md`
2. **Product Agent (Product Definition)**
   - Consumes market intelligence to define MVP specifications, feature priorities, and user journeys.
   - Output: `product_requirements.md`
3. **Builder Agent (Customer Touchpoint)**
   - Consumes product scope and brand guidelines to generate responsive, high-contrast customer landing experiences.
   - Outputs: `landing_page/index.html` & `landing_page/styles.css`
4. **Growth Agent (GTM & Distribution)**
   - Consumes research and product specs to formulate acquisition channels, day-1 launch tactics, and positioning statements.
   - Output: `launch_strategy.md`

---

## 🛡️ Quality Verification & Governance

- **12-Point Deterministic Quality Control:** Automated rules engine validating file deliverables, HTML5 compliance, responsive viewport meta tags, stylesheet isolation, and cross-document semantic consistency before founder sign-off.
- **Authoritative Approval Gate:** Autonomous execution strictly halts at `AWAITING_APPROVAL`. The launch package cannot be sealed without explicit founder sign-off.
- **Bounded Revision Flow:** Founders can reject or critique outputs, prompting targeted bounded re-execution and re-verification without simulation or data loss.

---

## 🏗️ Architecture

```text
Udyam OS/
├── backend/                  # FastAPI orchestration engine
│   ├── agents/               # 4 Specialized Workforce Agents
│   ├── api/                  # REST & WebSocket Endpoints
│   ├── approvals/            # Founder Governance & Approval Gate
│   ├── artifacts/            # Sandboxed Workspace & Artifact Manager
│   ├── context/              # Shared Company Context Memory
│   ├── core/                 # Pydantic State Machine & Config
│   ├── events/               # Operational Event Bus
│   ├── orchestrator/         # Udyam Manager Workflow Coordinator
│   ├── storage/              # SQLite Persistent Repository
│   └── verification/         # 12-Point Quality Verification Engine
├── frontend/                 # React + Vite Phone-First PWA Shell
│   ├── src/components/       # UI Shell, Execution Graph, Memory Cards
│   ├── src/screens/          # Command, Workforce, Outputs, Launch Screens
│   ├── src/context/          # Session & WebSocket State Provider
│   └── src/api/              # REST & WebSocket Client Layer
├── docs/                     # Architectural Specifications & Data Models
├── tests/                    # End-to-end integration & hardening test suites
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server (port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (port 5173)
npm run dev -- --host 0.0.0.0 --port 5173
```

### 3. Run Automated Tests
```bash
python -m pytest tests/ -v
```

---

## 🔒 Security & Privacy

- Zero chain-of-thought or private model prompts are exposed over the public API or WebSocket telemetry.
- Artifacts are sandboxed within isolated session workspaces.
- Generated HTML landing experiences render in isolated, sandboxed iframes.
- All secrets and API credentials reside strictly in server-side environment variables.
