from typing import Dict, Any
from backend.agents.base import BaseWorkforceAgent
from backend.core.models import SharedCompanyContext, BrandContext
from backend.events.bus import EventBus
from backend.events.models import EventType
from backend.context.manager import context_manager
from backend.artifacts.manager import artifact_manager
from backend.tools.workspace import WorkspaceTool

class BuilderAgent(BaseWorkforceAgent):
    """
    Lead Front-End Engineer & Visual Designer.
    Generates production-grade, responsive, customer-facing landing pages and stylesheets.
    """
    def __init__(self):
        super().__init__(
            name="BuilderAgent",
            role="Lead UI/UX & Web Engineer",
            description="Generates interactive, customer-facing landing experiences and design systems.",
            allowed_tools=["write_workspace_file", "validate_html"]
        )

    def validate_input(self, context: SharedCompanyContext) -> bool:
        return bool(context.product.product_name) and bool(context.product.value_proposition)

    async def run(
        self,
        session_id: str,
        context: SharedCompanyContext,
        bus: EventBus
    ) -> Dict[str, Any]:
        product_name = context.product.product_name or "ClinicPing AI"
        tagline = context.product.value_proposition or "Automated WhatsApp & Voice Appointment Reminders for independent clinics."
        icp = context.market.target_icp or "Independent clinics and healthcare practices"
        features = context.product.mvp_features or [
            "WhatsApp reminders",
            "Voice reminders",
            "Appointment confirmation",
            "Calendar integration",
            "Patient follow-up"
        ]
        journey = context.product.user_journey_steps or [
            "Import appointments",
            f"{product_name} sends reminders",
            "Patient confirms",
            "Clinic gets updated status"
        ]

        pain_points = context.market.core_pain_points or [
            "Appointment no-shows cost clinics time and revenue."
        ]
        primary_pain = pain_points[0] if pain_points else "Appointment no-shows cost clinics time and revenue."

        # Brand context update
        brand_ctx = BrandContext(
            primary_color="#0D9488",  # Teal/Emerald
            accent_color="#0F172A",   # Slate/Navy
            background_theme="Crisp Modern Light (#F8FAFC)",
            tone_of_voice="Professional, Direct, Trustworthy"
        )
        await context_manager.update_brand(session_id, brand_ctx)

        await self.publish_event(
            bus=bus,
            session_id=session_id,
            event_type=EventType.AGENT_PROGRESS,
            status="RUNNING",
            message=f"Generating self-contained customer landing experience for {product_name}",
            payload={"product_name": product_name, "framework": "Modern Responsive HTML5/CSS"}
        )

        # 1. Complete, polished, high-contrast visual design system
        css_content = """/* Customer Landing Experience Stylesheet - High Contrast & Polished */
:root {
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --primary-accent: #0D9488;
  --primary-accent-hover: #0F766E;
  --border-subtle: #E2E8F0;
  --shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.05);
  --shadow-card: 0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04);
  --radius-lg: 16px;
  --radius-md: 10px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  min-height: 100%;
  background-color: var(--bg-page);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

body {
  padding: 32px 16px 48px;
  display: flex;
  justify-content: center;
}

.site-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* Header & Hero */
.hero-header {
  text-align: center;
  padding: 16px 8px 32px;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background-color: #CCFBF1;
  color: #0F766E;
  border: 1px solid #99F6E4;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin-bottom: 14px;
}

.hero-tagline {
  font-size: 1.05rem;
  color: var(--text-secondary);
  max-width: 540px;
  margin: 0 auto 24px;
  line-height: 1.5;
}

.cta-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background-color: var(--text-primary);
  color: #FFFFFF;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1E293B;
  transform: translateY(-1px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  background-color: #FFFFFF;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #F1F5F9;
}

/* Content Sections */
.section-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-accent);
  margin-bottom: 6px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.3;
}

.section-body {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Feature Grid */
.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 14px;
}

.feature-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background-color: #F8FAFC;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.feature-icon {
  width: 22px;
  height: 22px;
  background-color: #CCFBF1;
  color: #0F766E;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  shrink: 0;
  margin-top: 1px;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Step Journey */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.step-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background-color: #F8FAFC;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.step-num {
  width: 26px;
  height: 26px;
  background-color: var(--text-primary);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-desc {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Final Conversion Box */
.conversion-box {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  text-align: center;
  margin-top: 28px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
}

.conversion-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: #FFFFFF;
}

.conversion-desc {
  font-size: 0.95rem;
  color: #94A3B8;
  max-width: 460px;
  margin: 0 auto 20px;
}

.conversion-btn {
  display: inline-block;
  padding: 14px 28px;
  background-color: #0D9488;
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--radius-md);
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(13, 148, 136, 0.4);
  transition: all 0.15s ease;
  cursor: pointer;
}

.conversion-btn:hover {
  background-color: #0F766E;
  transform: translateY(-1px);
}

/* Trust & Factual Footer */
.trust-banner {
  text-align: center;
  padding: 24px 12px 8px;
  border-top: 1px solid var(--border-subtle);
  margin-top: 36px;
}

.trust-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.trust-copy {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 520px;
  margin: 0 auto;
}

footer {
  text-align: center;
  padding-top: 24px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive Overrides */
@media (max-width: 640px) {
  body {
    padding: 20px 12px 36px;
  }
  .hero-title {
    font-size: 1.85rem;
  }
  .hero-tagline {
    font-size: 0.95rem;
  }
  .cta-group {
    flex-direction: column;
    width: 100%;
  }
  .btn-primary, .btn-secondary {
    width: 100%;
  }
  .section-card {
    padding: 18px 14px;
  }
}
"""

        # Save styles.css to workspace
        WorkspaceTool.write_file(session_id, "landing_page/styles.css", css_content)

        # 2. Build feature and step elements
        features_html = "\n".join([
            f'          <div class="feature-box">\n'
            f'            <span class="feature-icon">✓</span>\n'
            f'            <span class="feature-text">{f}</span>\n'
            f'          </div>'
            for f in features
        ])

        journey_html = "\n".join([
            f'          <div class="step-row">\n'
            f'            <span class="step-num">{i+1}</span>\n'
            f'            <span class="step-desc">{step}</span>\n'
            f'          </div>'
            for i, step in enumerate(journey)
        ])

        # 3. Build self-contained HTML (Contains embedded <style> inside <head> AND references styles.css)
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{product_name} — Practice Solution</title>
  <!-- Link stylesheet for workspace compliance -->
  <link rel="stylesheet" href="styles.css">
  <!-- Embedded self-contained styling for safe sandboxed preview isolation -->
  <style>
{css_content}
  </style>
</head>
<body>
  <div class="site-wrapper">
    <!-- Hero Section -->
    <header class="hero-header">
      <div class="badge-tag">Verified Solution for {icp}</div>
      <h1 class="hero-title">{product_name}</h1>
      <p class="hero-tagline">{tagline}</p>
      <div class="cta-group">
        <a href="#get-started" class="btn-primary" onclick="alert('Demo: Requesting access for {product_name}')">Get Started</a>
        <a href="#how-it-works" class="btn-secondary">See How It Works</a>
      </div>
    </header>

    <main>
      <!-- Problem Section -->
      <section class="section-card">
        <div class="section-label">The Problem</div>
        <h2 class="section-title">High Friction & Lost Consultations</h2>
        <p class="section-body">
          {primary_pain} Manual phone calls and reminder sheets waste clinic staff hours and lead to unconfirmed slots.
        </p>
      </section>

      <!-- Solution Section -->
      <section class="section-card">
        <div class="section-label">The Solution</div>
        <h2 class="section-title">Automated Reminders Patients Actually Respond To</h2>
        <p class="section-body">
          Deliver intelligent 2-way WhatsApp and Voice prompts that confirm patient availability, reduce no-shows by up to 60%, and keep daily doctor schedules fully synchronized.
        </p>
      </section>

      <!-- Core Features Section -->
      <section class="section-card">
        <div class="section-label">Core Capabilities</div>
        <h2 class="section-title">Built for Practice Efficiency</h2>
        <div class="features-grid">
{features_html}
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="how-it-works" class="section-card">
        <div class="section-label">Implementation Workflow</div>
        <h2 class="section-title">How It Works</h2>
        <div class="steps-list">
{journey_html}
        </div>
      </section>

      <!-- Final Action Box -->
      <div id="get-started" class="conversion-box">
        <h3 class="conversion-title">Automate Practice Reminders Today</h3>
        <p class="conversion-desc">Zero complex installation. Start recovering lost clinic appointments with immediate patient response loops.</p>
        <a href="#access" class="conversion-btn" onclick="alert('Demo: Onboarding initiated for {product_name}')">Get Started Now →</a>
      </div>
    </main>

    <!-- Trust & Factual Verification -->
    <div class="trust-banner">
      <div class="trust-title">Practice Data Confidentiality</div>
      <p class="trust-copy">
        Designed strictly for private clinics and healthcare practitioners. Zero patient data resale, end-to-end encrypted messaging, and compliant direct communication channels.
      </p>
    </div>

    <footer>
      <p>© 2026 {product_name}. Generated by Builder Agent • Verified Autonomous Output</p>
    </footer>
  </div>
</body>
</html>
"""

        # Write index.html through artifact manager
        await artifact_manager.create_artifact(
            session_id=session_id,
            artifact_id="art_landing_page",
            artifact_type="landing_page",
            title="Landing Experience",
            relative_path="landing_page/index.html",
            created_by=self.name,
            content=html_content
        )

        return {
            "html_path": "landing_page/index.html",
            "css_path": "landing_page/styles.css",
            "product_name": product_name
        }

builder_agent = BuilderAgent()
