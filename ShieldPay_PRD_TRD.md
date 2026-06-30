🛡
SHIELDPAY
AI-Powered Scam Detection & Financial Safety Platform
Product Requirements Document  |  Technical Requirements Document
UBL National Innovation Hackathon 2026

| Document Version | v1.0 — Hackathon Edition |
| --- | --- |
| Author | Hamza Ali |
| Track | Artificial Intelligence in Banking |
| Institution | COMSATS University Islamabad, Wah Campus |
| Date | June 2026 |


# PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)


## 1.1  Product Vision & Strategy

ShieldPay is a real-time, AI-driven financial safety guardrail purpose-built for Generation Z banking users in Pakistan. As digital-first banking proliferates across the country — driven by UBL's mobile platform, Raast instant payments, and IBFT transfers — a generation of first-time users is entering the financial ecosystem without the threat-intelligence or fraud-awareness infrastructure to protect themselves.
ShieldPay closes this gap by embedding an AI inference layer directly into the digital banking workflow, transforming passive users into informed, self-defending financial actors. The platform analyzes suspicious content, validates peer-to-peer transfer requests against simulated risk registries, and builds financial literacy through a gamified micro-education engine.

### Strategic Alignment with UBL


| Strategic Pillar | ShieldPay Value Proposition |
| --- | --- |
| Customer Retention | Reduces churn among youth accounts by providing a proactive safety net that reduces fraud-related account closures. |
| Fraud Liability Reduction | AI triage of suspicious payment requests reduces dispute volumes, lowering UBL's operational resolution costs. |
| Youth Market Acquisition | Positions UBL as Pakistan's only bank with an embedded student safety platform — a differentiator in the 18–24 demographic. |
| Regulatory Alignment | Demonstrates proactive compliance with SBP's digital banking consumer protection mandates. |


## 1.2  User Personas & Pain Points


### Primary Persona: The Pakistani Digital-Native Student


| Attribute | Detail |
| --- | --- |
| Name | Ali Raza, 21 — Computer Science undergraduate, FAST NUCES Lahore |
| Banking Behavior | Uses UBL Omni for fee payments, receives Raast transfers from family, freelances on Upwork for USD clients. |
| Digital Exposure | Primarily operates via WhatsApp, Instagram DMs, and Telegram for financial coordination. |
| Threat Literacy | Has no formal financial security training. Cannot distinguish a spoofed JazzCash page from the legitimate one. |
| Risk Behavior | Has clicked on at least one phishing link in the past 12 months per regional survey data. |


### Enumerated Pain Points

Phishing via WhatsApp/SMS: Fake prize messages, fake bank verification links, and spoofed IBAN transfers are distributed through messaging platforms where no browser security warnings appear.
Spoofed Payment Gateways: Cloned UBL/JazzCash checkout pages collect card credentials without transacting. Students cannot visually differentiate these from authentic portals.
Fake Freelance Buyers: On Fiverr and WhatsApp-based gigs, fraudulent clients send 'advance payment confirmation' screenshots to build trust before disappearing with delivered work.
Subscription Trap Exploitation: Students are targeted with 'free trial' offers requiring debit card details; recurring charges are buried in terms students do not read.
Zero Localized Threat Intelligence: Existing global fraud resources do not address Pakistan-specific scam vectors (fake scholarship portals, IBFT manipulation, fake property dealers).

## 1.3  Core Functional Requirements

The following matrix defines the explicit functional scope of ShieldPay's three primary user flows. Each requirement is assigned a unique ID, priority tier, and acceptance criterion.

### FR-01: Scam Link & Content Analyzer


| FR-ID | Priority | Requirement |
| --- | --- | --- |
| FR-01.1 | MUST HAVE | System shall provide a multi-line paste interface accepting raw SMS text, URLs, and WhatsApp message content. |
| FR-01.2 | MUST HAVE | System shall classify submitted content as SAFE / SUSPICIOUS / DANGEROUS with a confidence score (0–100). |
| FR-01.3 | MUST HAVE | System shall return a plain-language explanation of the threat rationale in Hinglish-friendly English. |
| FR-01.4 | SHOULD HAVE | System shall enumerate specific red flags identified in the content (e.g., urgency language, suspicious domain, IBAN mismatch). |
| FR-01.5 | SHOULD HAVE | System shall provide a recommended action (e.g., 'Do not click', 'Report to UBL', 'Safe to proceed'). |


### FR-02: P2P Transfer Validator (Mock UBL Gateway)


| FR-ID | Priority | Requirement |
| --- | --- | --- |
| FR-02.1 | MUST HAVE | System shall render a mock UBL-branded payment form accepting: recipient name, IBAN/account number, amount (PKR), and transfer note. |
| FR-02.2 | MUST HAVE | System shall evaluate IBAN format validity per Pakistani banking standards (PK + 2 check digits + 4-letter bank code + 16-digit account). |
| FR-02.3 | MUST HAVE | System shall return a risk profile: LOW / MEDIUM / HIGH with a risk score and behavioral flags from AI inference. |
| FR-02.4 | SHOULD HAVE | System shall flag anomalous amount patterns (round-number scam amounts, urgent transfer framing) via AI analysis of the transfer note. |


### FR-03: Gamified Student Education Hub


| FR-ID | Priority | Requirement |
| --- | --- | --- |
| FR-03.1 | MUST HAVE | System shall present 5+ interactive card-based micro-learning modules covering Pakistan-specific scam types. |
| FR-03.2 | MUST HAVE | System shall implement a progressive quiz flow with immediate feedback, streak counters, and a completed module badge. |
| FR-03.3 | SHOULD HAVE | System shall maintain a session-level progress state (modules completed, quiz score, streak count) rendered in a persistent sidebar. |


## 1.4  Non-Functional Requirements (NFRs)


| Category | Target | Implementation Strategy |
| --- | --- | --- |
| Performance | AI API response < 1.5s P95 | Streaming response mode enabled on Claude API; frontend renders progressive output tokens. |
| Security | Zero PII storage; API keys never client-exposed | All AI calls proxied through Node.js backend; env vars stored in Railway secrets vault. |
| Responsiveness | Mobile-first; 320px minimum viewport | Tailwind CSS responsive breakpoints: sm (640px), md (768px), lg (1024px). |
| Availability | 99.9% uptime during judging window | Vercel Edge Network CDN + Railway auto-restart on crash. |
| Scalability | Handle 50 concurrent judge/demo sessions | Stateless Express middleware; no session persistence required. |


# PART 2: TECHNICAL REQUIREMENTS DOCUMENT (TRD)


## 2.1  System Architecture Diagram & Request Lifecycle

The following ASCII topology diagram traces the complete request/response lifecycle from the React client through all middleware layers to the AI inference engine and data persistence layer.
┌────────────────────────────────────────────────────────────────┐
│             SHIELDPAY SYSTEM ARCHITECTURE                     │
└────────────────────────────────────────────────────────────────┘
[BROWSER / MOBILE]
┌─────────────────────┐
│  React.js + Vite    │ ── Axios POST ──────────────────────────►
│  Tailwind CSS       │
│  Vercel Edge CDN    │ ◄── JSON Response ────────────────────────
└─────────────────────┘                      │
▼
[RAILWAY — CONTAINERIZED NODE.JS BACKEND]
┌──────────────────────────────────────────┐
│  Express.js REST Middleware               │
│  ├─ Input Sanitizer (DOMPurify + Zod)     │──────────►
│  ├─ Rate Limiter (express-rate-limit)      │     [Anthropic API]
│  ├─ Prompt Orchestrator (system prompt)    │◄──────────
│  └─ Response Validator (JSON schema)       │  claude-sonnet-4-6
└──────────────────────────────────────────┘
│
▼
[SUPABASE — POSTGRESQL + REALTIME]
┌──────────────────────────────────────────┐
│  analysis_log   (anonymized scan events)  │
│  quiz_scores    (session gamification)    │
└──────────────────────────────────────────┘

## 2.2  Tech Stack Specification & Justification


| Layer | Technology | Architectural Justification |
| --- | --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS | Component-based architecture enables modular feature isolation per flow. Vite HMR reduces build feedback loops to < 200ms. Tailwind JIT eliminates unused CSS, keeping the bundle under 50KB. |
| Backend | Node.js 20 LTS + Express.js | Non-blocking I/O is optimal for a prompt-orchestration workload that is primarily I/O-bound (waiting for AI API responses). Minimal bootstrapping time critical for 72-hour sprint. |
| Database | Supabase (PostgreSQL) | Provides a production-grade relational database, REST API auto-generation, and a real-time subscription layer within a free-tier constraint. No manual DB provisioning required. |
| AI Engine | Anthropic Claude (claude-sonnet-4-6) | Superior instruction-following fidelity for strict JSON schema enforcement. Context window of 200K tokens enables full conversation history in multi-turn analysis workflows. Native tool-use API simplifies structured output extraction. |
| Deployment | Vercel + Railway | Vercel's Edge Network ensures < 50ms TTFB globally for the static React bundle. Railway's GitHub webhook integration automates containerized backend deployments on every git push with zero Dockerfile authoring required. |


## 2.3  REST API Specification


### POST /api/v1/analyze/content

Ingests raw unstructured text (SMS, WhatsApp messages, URLs) and returns a structured threat intelligence report.
Endpoint: POST /api/v1/analyze/content
Content-Type: application/json
Authorization: X-Internal-Key: {server_secret} (not exposed to client)
Request Body:
{
"content": "string (required, max 2000 chars) — raw text to analyze",
"contentType": "sms | whatsapp | url | email | other",
"sessionId": "string (optional) — for telemetry logging"
}
Success Response (200 OK):
{
"status": "success",
"result": {
"classification": "SAFE | SUSPICIOUS | DANGEROUS",
"confidenceScore": 87,
"threatType": "phishing | social_engineering | fake_payment | safe | other",
"redFlags": ["Urgency language detected", "Unverified short URL present"],
"explanation": "This message mimics a UBL account verification alert...",
"recommendedAction": "Do not click the link. Report to UBL at 111-825-888."
},
"processingMs": 1243
}
Error Response (422 Unprocessable Entity):
{
"status": "error",
"code": "INVALID_CONTENT",
"message": "Content field is required and must not exceed 2000 characters."
}

### POST /api/v1/banking/validate-transfer

Accepts a payment transfer payload and returns a risk profile derived from IBAN validation rules and AI behavioral analysis of the transfer context.
Endpoint: POST /api/v1/banking/validate-transfer
Content-Type: application/json
Request Body:
{
"recipientName": "string (required)",
"iban": "string (required) — format: PK36SCBL0000001123456702",
"amountPKR": 15000,
"transferNote": "string (optional) — memo/purpose of transfer",
"sessionId": "string (optional)"
}
Success Response (200 OK):
{
"status": "success",
"result": {
"ibanValid": true,
"bankResolved": "Standard Chartered Bank Pakistan",
"riskLevel": "LOW | MEDIUM | HIGH",
"riskScore": 34,
"behavioralFlags": ["Round-number amount", "Transfer note contains urgency language"],
"aiSummary": "Recipient IBAN format is valid. However, the transfer note...",
"proceedRecommendation": "VERIFY_FIRST | PROCEED | DO_NOT_PROCEED"
}
}

## 2.4  Prompt Engineering Specification

The following system prompt is the exact production string injected into every AI API call via the backend prompt orchestrator. It enforces strict JSON-only output mode, eliminates markdown wrapper blocks, and constrains classification vocabulary to the predefined application schema.

### System Prompt: Content Analyzer

// SHIELDPAY — Content Analysis System Prompt v1.0
You are ShieldPay's Financial Threat Intelligence Engine, trained on
Pakistan-specific banking fraud patterns. Your role is to analyze
digital content (SMS, WhatsApp messages, URLs) for scam indicators.
CRITICAL RULES:
1. Return ONLY a valid JSON object. No markdown, no backticks,
no preamble, no explanation outside the JSON structure.
2. classification MUST be exactly one of: SAFE, SUSPICIOUS, DANGEROUS
3. confidenceScore MUST be an integer between 0 and 100.
4. redFlags MUST be an array of strings. Empty array if none found.
5. Write explanation in plain English a 20-year-old Pakistani
student will immediately understand. Max 3 sentences.
OUTPUT SCHEMA:
{ classification, confidenceScore, threatType, redFlags[],
explanation, recommendedAction }

## 2.5  UI/UX Design Token Specifications

ShieldPay's visual design system is structured around three semantic color states that map directly to threat classifications, providing immediate visceral comprehension without text dependency.

### Color Token System


| State | Token | Hex Value | Application |
| --- | --- | --- | --- |
| SAFE | --color-safe | #00A86B | Result cards, badge fills, CTA 'Proceed' buttons, progress bars on safe classifications. |
| SUSPICIOUS | --color-warn | #D97706 | Warning state banners, 'Verify First' prompts, quiz incorrect-answer highlights. |
| DANGEROUS | --color-danger | #DC2626 | Alert modals, 'Do Not Proceed' banners, high-risk transfer result cards. |
| NEUTRAL | --color-navy | #1B3A6B | Primary navigation, UBL brand alignment, section headers, footer. |


### Layout Architecture

Navigation Bar: Fixed top bar with ShieldPay logo (left) + UBL co-brand mark (right). Height: 64px. Background: --color-navy.
Three-Tab Layout: 'Scan Content' | 'Validate Transfer' | 'Learn & Earn' — tab switching managed via React state (no page reload).
Result Card Component: Full-width card with left-side color accent bar (4px, semantic color token), classification badge, confidence meter, and expandable red-flags accordion.
Mobile Viewport Priority: Single-column stacked layout below 768px breakpoint. Touch target minimum 48x48px per WCAG 2.1 AA.

## 2.6  DevOps & Continuous Deployment Topology


### Frontend — Vercel Edge Deployment

Repository: GitHub monorepo /client directory linked to Vercel project.
Build Command: vite build — outputs to /dist. Build time target < 45 seconds.
Environment Variables: VITE_API_BASE_URL injected at build time via Vercel Environment Settings panel.
Preview Deployments: Every git push to a feature branch auto-generates a preview URL for rapid judge demonstrations.
Edge Network: Static assets cached at 40+ global PoPs — target TTFB < 50ms from Pakistan.

### Backend — Railway Containerized Deployment

Repository: GitHub monorepo /server directory linked to Railway project via GitHub App integration.
Auto-Deploy Trigger: GitHub webhook fires on every push to main branch — Railway builds and redeploys without manual intervention.
Secret Management: ANTHROPIC_API_KEY and SUPABASE_SERVICE_KEY stored in Railway's encrypted environment variable vault.
Health Check: GET /health endpoint returns {status: 'ok', uptime: Ns} — Railway monitors every 30 seconds.
Zero-Downtime Deploys: Railway's rolling restart strategy ensures no request loss during hackathon demo windows.

# PART 3: 72-HOUR EXECUTION MATRIX

The following operational breakdown maps every development milestone to a solo developer's cognitive and execution capacity across three consecutive days. Each phase is color-coded by functional domain and includes a clear Definition of Done to prevent scope creep.

## Day 1 (Hours 0–24): Foundation & AI Core


| Hours | Phase | Milestone & Definition of Done |
| --- | --- | --- |
| 0–2 | Setup | Initialize GitHub monorepo. Scaffold React+Vite frontend and Express backend. Deploy skeleton to Vercel + Railway. Confirm both URLs live. |
| 2–4 | Backend | Install express, cors, dotenv, zod, express-rate-limit. Create /api/v1/analyze/content stub. Return hardcoded mock response. Postman test passes. |
| 4–7 | AI Engine | Integrate Anthropic SDK. Write production system prompt (v1). Wire prompt orchestrator to POST endpoint. Validate strict JSON output mode with 5 test inputs. |
| 7–10 | Frontend | Build Navbar component (navy, logo). Build three-tab layout skeleton. Build Scan Content tab: textarea + submit button + loading spinner. |
| 10–14 | Integration | Connect frontend Scan tab to /api/v1/analyze/content. Render ResultCard with classification badge and color token. Live end-to-end test with 3 real scam SMS samples. |
| 14–17 | Transfer | Build /api/v1/banking/validate-transfer endpoint with IBAN regex validator + AI risk analysis. Postman test suite passes for all 3 IBAN test cases. |
| 17–20 | Frontend | Build Validate Transfer tab: mock UBL-branded form UI. Wire to backend. Render risk profile card with riskLevel color token and behavioral flags list. |
| 20–24 | Buffer | Bug triage session. Fix any API error handling gaps. Add loading/error states to both frontend forms. Commit stable Day 1 checkpoint to main. |


## Day 2 (Hours 24–48): Education Hub & Polish


| Hours | Phase | Milestone & Definition of Done |
| --- | --- | --- |
| 24–28 | Content | Write content for 5 scam education modules: (1) Fake Prize SMS, (2) WhatsApp Freelance Scam, (3) Spoofed Payment Gateway, (4) Fake Scholarship Portal, (5) Advance Fee Fraud. |
| 28–33 | Education | Build Learn & Earn tab: FlashCard component (front: scam scenario, back: red flags + verdict). Implement card flip animation with Tailwind transitions. |
| 33–37 | Gamification | Implement quiz flow: 3-question MCQ per module. Score tracking via React state. Streak counter component. Module completion badge with emerald green fill. |
| 37–40 | Database | Configure Supabase project. Create analysis_log and quiz_scores tables. Wire backend POST endpoints to insert anonymized telemetry rows. |
| 40–44 | Mobile UI | Audit all three tabs at 375px (iPhone SE) viewport. Fix overflow issues, increase touch targets, adjust font sizes. Verify Lighthouse mobile score > 80. |
| 44–48 | Buffer | Full end-to-end walkthrough of all 3 features. Document any known bugs. Commit stable Day 2 checkpoint. Prepare demo script outline. |


## Day 3 (Hours 48–72): Demo Readiness & Hardening


| Hours | Phase | Milestone & Definition of Done |
| --- | --- | --- |
| 48–52 | UX Polish | Add skeleton loading screens to replace spinners. Implement toast notification system for API errors. Add copy-to-clipboard on result cards. |
| 52–56 | Demo Data | Prepare 5 curated demo inputs: 2 dangerous scam SMS, 1 suspicious URL, 1 high-risk IBAN transfer, 1 safe payment. Test each produces compelling output. |
| 56–60 | Landing | Build minimal landing/home screen with ShieldPay value proposition, 3-feature summary cards, and direct CTAs to each feature tab. |
| 60–64 | Hardening | Input sanitization audit. Rate limit testing (verify 429 responses). Verify no API keys exposed in browser network tab. CORS lockdown to Vercel domain. |
| 64–68 | Demo Prep | Rehearse 3-minute live demo: Scan a real-looking scam SMS → validate a suspicious IBAN → complete one education module quiz. Time it. |
| 68–72 | Submission | Final GitHub commit. Verify Vercel and Railway deployments are live. Record 2-minute demo video as backup. Complete hackathon submission form. |


## Winning Criteria Alignment Summary


| Judging Dimension | Maturity Level | Evidence |
| --- | --- | --- |
| Track Alignment | Level 5 / 5 | Directly implements AI in Banking with real Claude API inference on live banking content. |
| Technical Execution | Level 4 / 5 | Full-stack: React frontend, Express backend, Supabase DB, Anthropic API, deployed on Vercel + Railway. |
| Problem Relevance | Level 5 / 5 | Targets both selected problem areas: fraud/scam detection and student/youth banking — with Pakistan-specific context. |
| Innovation | Level 4 / 5 | No existing digital banking product in Pakistan offers a student-facing real-time AI scam triage layer. |
| Feasibility | Level 5 / 5 | 100% buildable solo in 72 hours. No ML training, no dataset preparation, no DevOps complexity. |
| Business Potential | Level 4 / 5 | White-label integration path into UBL mobile app's existing student account tier. |

ShieldPay — UBL National Innovation Hackathon 2026
Hamza Ali  |  COMSATS University Islamabad, Wah Campus  |  Software Engineering