SHIELDPAY
Version 2.0  —  SaaS Banking Intelligence Platform
Product Requirements Document  |  Technical Requirements Document

| Field | Value |
| --- | --- |
| Document Version | v2.0 — SaaS Expansion Edition |
| Author | Hamza Ali |
| Track | Artificial Intelligence in Banking |
| Institution | COMSATS University Islamabad, Wah Campus |
| Date | June 2026 |
| Predecessor | ShieldPay v1.0 — Hackathon MVP |
| Target Release | Post-Hackathon SaaS Launch |
| Status | PLANNING — Roadmap Locked |

V1 → V2 EVOLUTION OVERVIEW

| Dimension | V1 (Hackathon MVP) | V2 (SaaS Platform) |
| --- | --- | --- |
| Core Focus | 3-feature fraud detection prototype | Full-spectrum AI banking intelligence suite |
| User Target | Pakistani university students | Students + SMEs + UBL branch staff |
| AI Integration | Single Claude API call per request | Multi-agent pipeline: Orchestrator + Specialists |
| Modules | 3 (Scan, Validate, Learn) | 8 (Full banking lifecycle coverage) |
| Auth | None — stateless demo | JWT + OAuth2 + UBL SSO integration |
| Database | Supabase (anonymized telemetry) | Supabase + Redis cache + vector embeddings |
| Deployment | Vercel + Railway (free tier) | Multi-region Vercel Enterprise + Railway Pro |
| Monetization | None | Freemium + Bank API white-label SaaS tier |
| Compliance | Demo-level security | SBP-aligned PCI-DSS prep + audit logging |

PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

# 1.1  V2 Product Vision & Strategic Expansion

ShieldPay V2 transforms the hackathon MVP into a comprehensive AI-powered banking intelligence SaaS platform. Where V1 provided reactive scam detection for individual students, V2 introduces proactive financial orchestration across eight distinct banking modules — covering the complete lifecycle of digital banking for Pakistan's Gen Z population, student entrepreneurs, and eventually UBL's internal branch operations.
The V2 architecture introduces a Multi-Agent AI Pipeline that assigns specialized Claude agents to each banking domain: a Fraud Orchestrator, a Credit Risk Analyst, a Compliance Monitor, a Financial Coach, and a Document Intelligence Engine. Each agent maintains domain-specific context while sharing a central risk knowledge graph built from Pakistan's emerging threat landscape.

## 1.2  Expanded User Personas


### Primary Persona — Gen Z Student (Retained from V1)


| Attribute | V2 Enhancement |
| --- | --- |
| Name / Profile | Ali Raza, 21 — CS undergraduate, FAST NUCES Lahore |
| New V2 Pain Point | Needs a unified financial dashboard: track allowance, freelance income, IBFT history, and fraud attempts in one view |
| V2 Value Delivery | Personalized AI Financial Advisor module with spending pattern analysis and peer-comparison benchmarks |


### Secondary Persona — Student Entrepreneur / Freelancer


| Attribute | Detail |
| --- | --- |
| Name / Profile | Sara Khan, 23 — Final-year BBA, manages a Shopify store + Fiverr gigs |
| Banking Behavior | Receives USD wire transfers via Payoneer, converts to PKR via Sadapay, invoices clients manually on WhatsApp |
| Pain Points | No automated invoice fraud detection; cannot verify international client credibility; mistakenly paid fake escrow services |
| V2 Value Delivery | AI Invoice Validator + International Transfer Risk Scorer + Fake Escrow Detector |


### Tertiary Persona — UBL Branch Staff (B2B SaaS)


| Attribute | Detail |
| --- | --- |
| Name / Profile | Kamran Malik, 34 — UBL Relationship Manager, Gulshan-e-Iqbal branch, Karachi |
| Daily Workflow | Manually reviews SME loan applications, KYC documents, and suspicious transaction escalations |
| Pain Points | Drowning in document review; no AI-assisted KYC flagging; decisions based on gut feeling without data support |
| V2 Value Delivery | AI Document Intelligence Engine for automated KYC review + SME Credit Risk Scoring dashboard |


# 1.3  Eight Core Modules — V2 Functional Scope

ShieldPay V2 expands from 3 MVP modules to 8 fully-integrated banking intelligence modules. Each module is an independent React component with a dedicated Express route group, its own Claude agent system prompt, and isolated Supabase table schema.

### MODULE 1: AI Scam & Threat Analyzer (V1 Enhanced)

Evolutionary upgrade from V1's content scanner. V2 adds multi-turn conversational analysis, real-time URL reputation lookups via integrated threat intelligence feeds, and a crowd-sourced Pakistan Scam Registry database that learns from aggregated anonymized user reports.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-01.1 | MUST HAVE | Multi-modal input: accepts SMS text, URLs, images of screenshots (OCR extraction via Claude Vision API), and audio clips (transcribed via Whisper API) |
| FR-01.2 | MUST HAVE | Threat classification extended to 5 tiers: SAFE / LOW_RISK / SUSPICIOUS / HIGH_RISK / CRITICAL with sub-type taxonomy (16 scam categories) |
| FR-01.3 | MUST HAVE | Pakistan Scam Registry cross-reference: every analyzed content checked against a community-sourced DB of reported Pakistani scam patterns |
| FR-01.4 | SHOULD HAVE | Multi-turn analysis: user can ask follow-up questions about the threat — Claude maintains conversation context across up to 10 turns |
| FR-01.5 | SHOULD HAVE | One-tap community reporting: flagged threats auto-formatted and submitted to ShieldPay's threat registry with user consent |
| FR-01.6 | COULD HAVE | Browser extension companion app that auto-scans URLs as user browses (post-V2 roadmap item) |


### MODULE 2: Smart P2P Transfer Guardian (V1 Enhanced)

V1's transfer validator is upgraded with a real-time behavioral biometrics layer and a simulated UBL Transaction Graph — a network analysis engine that maps relationship patterns between IBANs to detect money mule rings and coordinated fraud clusters.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-02.1 | MUST HAVE | Beneficiary history scoring: AI tracks user's transfer patterns and flags statistical anomalies (new recipient + large amount + urgency = HIGH RISK) |
| FR-02.2 | MUST HAVE | IBAN network graph analysis: detect if recipient IBAN appears in simulated money-mule cluster data (sourced from FIA Cybercrime Wing reports) |
| FR-02.3 | MUST HAVE | Transfer intent classifier: NLP analysis of transfer note detects coercion language ('they threatened me', 'or I lose my job', 'deadline today') |
| FR-02.4 | SHOULD HAVE | Multi-step transfer approval: HIGH RISK transfers trigger a mandatory 3-step confirmation flow with cooling-off period recommendation |
| FR-02.5 | SHOULD HAVE | Batch transfer analyzer: CSV upload for bulk payment validation (SME payroll use case) |


### MODULE 3: AI Financial Coach & Spending Advisor

Brand new V2 module. A personalized conversational financial advisor that analyzes a student's simulated transaction history, identifies spending patterns, detects subscription traps, and delivers UBL-branded micro-nudges in Hinglish to build financial literacy.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-03.1 | MUST HAVE | Spending pattern dashboard: categorize simulated transactions (food, transport, entertainment, education, subscriptions) with AI-generated monthly summary |
| FR-03.2 | MUST HAVE | Subscription trap detector: flag recurring charges from unrecognized merchants or charges exceeding user's set budget thresholds |
| FR-03.3 | MUST HAVE | Conversational AI Coach: GPT-style chat interface where students ask questions ('Mere paas bachat kaisay hogi?') and receive contextual advice in Hinglish English |
| FR-03.4 | SHOULD HAVE | Peer benchmark module: anonymous comparison ('Students at your university spend 23% less on food than you — here are 3 tips') |
| FR-03.5 | SHOULD HAVE | Savings goal tracker with AI milestone coaching and streak rewards |
| FR-03.6 | COULD HAVE | UBL product recommendation engine: AI suggests relevant UBL savings products, student loans, or credit cards based on financial profile |


### MODULE 4: AI Document Intelligence Engine (KYC / Invoice / Contracts)

A high-value B2B module targeting UBL branch staff and student entrepreneurs. Accepts PDF/image uploads of banking documents — KYC forms, invoices, contracts, salary slips — and returns AI-powered analysis: authenticity scoring, data extraction, and red-flag annotations.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-04.1 | MUST HAVE | Document upload interface: drag-and-drop or mobile camera capture for PDF, PNG, JPEG files up to 10MB |
| FR-04.2 | MUST HAVE | Document type classifier: auto-detect document category (CNIC, salary slip, bank statement, invoice, contract, utility bill) |
| FR-04.3 | MUST HAVE | Structured data extraction: pull key fields into JSON (name, CNIC number, dates, amounts, account numbers) using Claude's document analysis capabilities |
| FR-04.4 | MUST HAVE | Authenticity risk scoring: detect tampered documents via metadata inconsistencies, font anomalies, digital artifact patterns — flag HIGH/MEDIUM/LOW authenticity confidence |
| FR-04.5 | SHOULD HAVE | Invoice fraud detector: cross-reference invoice details against known Pakistan vendor registry; flag suspicious payment terms or manipulated bank details |
| FR-04.6 | SHOULD HAVE | Contract clause analyzer: identify predatory clauses in freelance contracts (automatic renewal, penalty clauses, IP ownership traps) |


### MODULE 5: SME Credit Risk Profiler

Targets student entrepreneurs and small business owners who need rapid informal credit assessments before approaching banks. The AI synthesizes business description, transaction history, and market context to produce a structured creditworthiness report aligned with SBP's SME lending guidelines.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-05.1 | MUST HAVE | Business intake form: collect business type, monthly revenue range, operating months, existing liabilities, and intended loan purpose |
| FR-05.2 | MUST HAVE | AI credit narrative: Claude generates a structured credit memo in the style of a UBL relationship manager's assessment report |
| FR-05.3 | MUST HAVE | Risk band assignment: VERY LOW / LOW / MODERATE / HIGH / VERY HIGH with score (0–1000) modeled on SECP/SBP SME risk frameworks |
| FR-05.4 | SHOULD HAVE | Improvement roadmap: AI identifies 3 specific actions the applicant can take to improve their credit profile within 90 days |
| FR-05.5 | SHOULD HAVE | UBL product match: surface relevant UBL SME financing products (running finance, term loans, Asaan Finance) aligned to the applicant's profile |


### MODULE 6: Real-Time Compliance & Regulatory Monitor

A regulatory intelligence feed that monitors SBP circulars, FBR tax updates, and SECP notifications relevant to young Pakistani digital bankers and entrepreneurs. AI summarizes policy changes in plain language and surfaces actionable compliance checklists.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-06.1 | MUST HAVE | Regulatory feed dashboard: weekly AI-curated digest of SBP, FBR, and SECP updates relevant to student/SME banking profiles |
| FR-06.2 | MUST HAVE | Plain-language translation: every regulatory update accompanied by a Claude-generated 'What this means for you' summary in accessible English |
| FR-06.3 | MUST HAVE | AML/CFT awareness checker: users can describe a proposed transaction and receive a compliance pre-check against Pakistan's AML regulations |
| FR-06.4 | SHOULD HAVE | Deadline tracker: AI extracts compliance deadlines from regulations and adds them to user's reminders (tax filing dates, KYC renewal dates) |
| FR-06.5 | COULD HAVE | AI legal Q&A: conversational interface for general banking legal questions (not professional advice — clearly disclaimed) |


### MODULE 7: Gamified Financial Literacy Academy (V1 Enhanced)

Evolutionary upgrade of V1's education hub into a full learning management system (LMS). V2 introduces structured learning paths, certificates of completion, an AI quiz generator that creates custom questions from any banking topic, and a leaderboard tied to UBL's student loyalty program.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-07.1 | MUST HAVE | 25+ learning modules across 5 tracks: Fraud Awareness, Digital Banking Basics, Investing 101, Tax & Compliance, Entrepreneurship Finance |
| FR-07.2 | MUST HAVE | AI quiz generator: Claude dynamically generates unique MCQ sets from any module topic — no two quiz attempts are identical |
| FR-07.3 | MUST HAVE | Certification system: completion certificates generated as branded PDF with student name, module, score, and UBL co-brand watermark |
| FR-07.4 | MUST HAVE | Progress persistence: full user progress stored in Supabase (modules completed, streak days, badges earned, total XP) |
| FR-07.5 | SHOULD HAVE | National leaderboard: top students by XP displayed — anonymized by default, opt-in for full name display |
| FR-07.6 | SHOULD HAVE | UBL Loyalty Points integration: module completions earn ShieldPoints redeemable for UBL cashback rewards (B2B partnership model) |
| FR-07.7 | COULD HAVE | University integration API: campus portals embed ShieldPay Academy via iframe for formal financial literacy curriculum delivery |


### MODULE 8: AI Banking Assistant (Conversational Interface)

The flagship V2 feature: a full-context, multi-turn AI banking assistant that serves as a unified entry point to all ShieldPay modules. The assistant understands natural language queries in Urdu-English mixed input, routes intent to the appropriate module, and maintains a persistent user financial context across sessions.

| FR-ID | Priority | V2 Requirement |
| --- | --- | --- |
| FR-08.1 | MUST HAVE | Natural language routing: understand mixed Urdu-English queries ('Ye message safe hai ya nahi?', 'Mujhe loan chahiye') and route to correct module |
| FR-08.2 | MUST HAVE | Persistent conversation history: maintain up to 50 turns of context per session; option to save conversation threads to user account |
| FR-08.3 | MUST HAVE | Proactive alerts: assistant surfaces relevant warnings based on user activity ('You have 2 pending transfer validations', 'New SBP circular affects your account type') |
| FR-08.4 | SHOULD HAVE | Voice input support: Web Speech API integration for hands-free query input on mobile (critical for accessibility in low-literacy contexts) |
| FR-08.5 | SHOULD HAVE | Context-aware suggestions: after scanning a scam, the assistant proactively offers to check related IBANs or suggests the relevant education module |
| FR-08.6 | COULD HAVE | WhatsApp integration: deliver ShieldPay's AI assistant through UBL's official WhatsApp Business API channel (high-reach in Pakistan's messaging-first culture) |


# 1.4  Non-Functional Requirements — V2 Scale


| Category | V1 Target | V2 Target | Implementation Strategy |
| --- | --- | --- | --- |
| Performance | AI response < 1.5s P95 | AI response < 800ms P95 (streaming); Document analysis < 3s P95 | Streaming tokens + Redis response cache for identical queries + Claude batch API for non-real-time analysis |
| Security | Zero PII storage | SOC2-preparation: encryption at rest + in transit, RBAC, full audit logging, PII tokenization | AES-256 at rest via Supabase Vault; TLS 1.3 in transit; column-level encryption for financial data |
| Scalability | 50 concurrent sessions | 500+ concurrent sessions | Vercel Edge Functions + Railway horizontal scaling + Redis session store + Claude API tier upgrade |
| Availability | 99.9% uptime | 99.95% uptime SLA | Multi-region Vercel deployment + Railway auto-scaling + Supabase HA + Claude API fallback to claude-haiku-4-5 |
| Accessibility | WCAG 2.1 AA basic | WCAG 2.1 AA full compliance + Urdu RTL support | RTL CSS layout support; screen reader testing with NVDA; 4.5:1 color contrast across all UI states |
| Compliance | Demo-level | SBP Digital Banking Regulations 2024 alignment | Consent management system; data residency in Pakistan (Supabase Pakistan region); audit trail per SBP circular BPRD.PD.03/2024 |
| Observability | None | Full APM + error tracking + AI quality monitoring | Sentry error tracking + Datadog APM + custom Claude output quality scoring pipeline |


# 1.5  Monetization Architecture — SaaS Business Model


| Tier | Target Segment | Pricing | Features |
| --- | --- | --- | --- |
| FREE | Individual students | PKR 0/month | Modules 1, 2, 7 (basic). 20 AI queries/month. No account required. |
| STUDENT PRO | University students with UBL account | PKR 199/month | All 8 modules. Unlimited AI queries. Certification system. Financial Coach. Progress persistence. |
| SME | Small business owners & freelancers | PKR 799/month | All modules + Document Intelligence + Credit Profiler + Batch transfer validation + Priority API response. |
| ENTERPRISE / BANK | UBL & partner banks (white-label) | Custom annual contract | Full platform white-labeled under bank brand. Branch Staff dashboard. Compliance Monitor API. Volume pricing. Dedicated support SLA. |

PART 2: TECHNICAL REQUIREMENTS DOCUMENT (TRD)

# 2.1  V2 Multi-Agent AI Architecture

V2 replaces V1's single-prompt AI calls with a structured Multi-Agent Pipeline. Each banking domain is served by a specialized Claude agent with its own system prompt, tool set, and context budget. The Orchestrator Agent routes incoming requests, maintains cross-module user context, and synthesizes multi-agent outputs into coherent responses.

| Agent Name | Model | Specialization | Context Window Allocation |
| --- | --- | --- | --- |
| Orchestrator | claude-sonnet-4-6 | Request routing, intent classification, cross-module context synthesis | Full 200K — maintains user session state |
| Threat Intelligence Agent | claude-sonnet-4-6 | Scam detection, URL analysis, Pakistan threat registry query | 50K — threat pattern library + conversation history |
| Transfer Risk Agent | claude-sonnet-4-6 | IBAN behavioral analysis, network graph risk scoring, coercion detection | 30K — transfer history + behavioral baselines |
| Document Intelligence Agent | claude-sonnet-4-6 | KYC analysis, invoice fraud, contract clause extraction, OCR post-processing | 100K — document content + extraction schemas |
| Financial Coach Agent | claude-sonnet-4-6 | Spending analysis, savings coaching, product recommendations, Hinglish generation | 40K — transaction history + user goals |
| Credit Risk Agent | claude-sonnet-4-6 | SME credit assessment, SBP framework application, risk narrative generation | 30K — business profile + market context |
| Compliance Agent | claude-sonnet-4-6 | SBP/FBR regulation parsing, AML pre-check, plain-language translation | 60K — regulatory corpus + circular archive |
| Quiz Generator Agent | claude-haiku-4-5 | Dynamic MCQ generation, answer validation, difficulty calibration | 10K — module content + question history |


# 2.2  V2 System Architecture

The V2 architecture introduces three new layers beyond V1: an API Gateway with rate limiting and JWT authentication, a Redis Caching Layer for AI response deduplication, and a Vector Database for semantic threat pattern matching.
┌─────────────────────────────────────────────────────────────────┐   │              SHIELDPAY V2 — SYSTEM ARCHITECTURE                │   └─────────────────────────────────────────────────────────────────┘    [CLIENT LAYER]   ┌──────────────────────────────────────────────┐   │  React 18 + Vite + Tailwind CSS              │   │  Axios  ──► JWT Bearer Token on all requests │   │  Vercel Edge CDN  (40+ global PoPs)          │   └──────────────────────────────────────────────┘                        │ HTTPS                        ▼   [API GATEWAY LAYER — Railway]   ┌──────────────────────────────────────────────┐   │  Kong API Gateway                            │   │  ├─ JWT Authentication (Supabase Auth)       │   │  ├─ Rate Limiter (Redis-backed)              │   │  ├─ Request Logger (Datadog)                 │   │  └─ Module Router → /api/v2/{module}         │   └──────────────────────────────────────────────┘                        │                        ▼   [BACKEND LAYER — Node.js Microservices]   ┌──────────────────────────────────────────────┐   │  Express Microservices (one per module)      │   │  ├─ Threat Service (:3001)                   │   │  ├─ Transfer Service (:3002)                 │   │  ├─ Document Service (:3003)                 │   │  ├─ Coach Service (:3004)                    │   │  ├─ Credit Service (:3005)                   │   │  ├─ Compliance Service (:3006)               │   │  ├─ Academy Service (:3007)                  │   │  └─ Assistant Service (:3008)                │   └──────────────────────────────────────────────┘          │                │              │          ▼                ▼              ▼   [REDIS CACHE]   [AI PIPELINE]   [VECTOR DB]   ┌───────────┐  ┌────────────┐  ┌──────────────┐   │ Upstash   │  │ Orchestrat │  │ Supabase     │   │ Redis     │  │ or Agent   │  │ pgvector     │   │           │  │    │       │  │ (threat      │   │ TTL-based │  │ Specialist │  │ embeddings)  │   │ response  │  │ Agents     │  └──────────────┘   │ cache     │  │ (×7)       │   └───────────┘  └────────────┘                       │                       ▼               [Anthropic API]               claude-sonnet-4-6               claude-haiku-4-5                       │                       ▼   [DATA LAYER — Supabase PostgreSQL]   ┌──────────────────────────────────────────────┐   │  users, sessions, threat_reports             │   │  transfer_validations, documents_analyzed    │   │  financial_profiles, credit_assessments      │   │  academy_progress, compliance_digests        │   │  audit_log (append-only, encrypted)          │   └──────────────────────────────────────────────┘

# 2.3  V2 Tech Stack Expansion


| Layer | V1 Stack | V2 Addition | Justification |
| --- | --- | --- | --- |
| Frontend | React 18 + Vite + Tailwind | + React Query, Zustand, Framer Motion | React Query for server state sync; Zustand for lightweight global state; Framer Motion for module transition animations |
| Auth | None | Supabase Auth + JWT + OAuth2 (Google/UBL SSO) | Supabase Auth provides JWTs, RLS policies, and UBL-compatible OAuth2 PKCE flow without a custom auth server |
| API Gateway | Express middleware | Kong OSS API Gateway | Kong handles rate limiting, JWT verification, and request logging at the gateway layer — offloads security from application code |
| AI Orchestration | Direct Anthropic SDK calls | Custom Agent Pipeline (TypeScript) + Tool Use API | Tool Use API enables agents to call internal functions (IBAN DB lookup, vector search, Redis cache) as structured tools |
| Caching | None | Upstash Redis (serverless) | TTL-based AI response caching for identical queries; reduces Claude API costs by estimated 40% in production |
| Vector DB | None | Supabase pgvector | Stores threat pattern embeddings for semantic similarity matching — new scam content matched against 10,000+ known Pakistani scam vectors |
| File Processing | None | Multer + Sharp + pdf-parse | Multer handles multipart uploads; Sharp for image pre-processing before Claude Vision; pdf-parse for text extraction |
| Observability | None | Sentry + Datadog APM + PostHog | Sentry for error tracking; Datadog for API latency monitoring; PostHog for product analytics (which modules drive most value) |
| CI/CD | Manual git push | GitHub Actions pipeline | Automated: lint → test → build → deploy on PR merge. Staging environment auto-deployed on feature branch push |
| Testing | Manual Postman | Vitest + Supertest + Playwright E2E | Unit tests for prompt schemas; API integration tests; full E2E tests for all 8 user flows |


# 2.4  V2 REST API Specification (New Endpoints)


### POST /api/v2/documents/analyze

Accepts document file upload and returns structured analysis including type classification, extracted fields, and authenticity risk score.
// Request: multipart/form-data {   "file": [binary — PDF, PNG, JPEG, max 10MB],   "documentType": "auto | cnic | invoice | salary_slip | bank_statement | contract",   "analysisDepth": "quick | deep",   "sessionId": "string" }  // Success Response (200 OK) {   "status": "success",   "result": {     "detectedType": "invoice",     "authenticityScore": 73,     "authenticityRisk": "MEDIUM",     "extractedFields": {       "vendorName": "Pak Tech Solutions",       "invoiceNumber": "INV-2024-0847",       "amount": 125000,       "currency": "PKR",       "dueDate": "2024-07-15",       "bankAccount": "PK36SCBL0000001123456702"     },     "redFlags": ["Font inconsistency on amount field", "IBAN checksum mismatch"],     "recommendation": "VERIFY_WITH_VENDOR",     "aiSummary": "The invoice shows signs of potential tampering..."   },   "processingMs": 2847 }

### POST /api/v2/assistant/chat

Multi-turn conversational endpoint. Maintains session context across requests. Supports Urdu-English mixed input.
// Request Body {   "message": "Yaar ye message mujhe mila hai, kya ye scam hai?",   "attachedContent": "string (optional) — pasted SMS or URL",   "sessionId": "string — required for context continuity",   "userId": "string (optional) — for logged-in users",   "conversationHistory": [     { "role": "user", "content": "..." },     { "role": "assistant", "content": "..." }   ] }  // Success Response (200 OK) {   "status": "success",   "reply": "Haan yaar, ye DANGEROUS lag raha hai! Is message mein...",   "intent": "scam_analysis",   "moduleRouted": "threat_analyzer",   "suggestedActions": [     { "label": "Analyze Full Message", "action": "open_module", "module": "threat" },     { "label": "Learn About SMS Scams", "action": "open_module", "module": "academy" }   ],   "conversationId": "conv_abc123" }

### POST /api/v2/credit/assess

SME credit risk assessment endpoint. Returns structured credit profile and improvement roadmap.
// Request Body {   "businessName": "string",   "businessType": "retail | services | manufacturing | freelance | ecommerce",   "monthlyRevenueRange": "0-50k | 50k-200k | 200k-500k | 500k+",   "operatingMonths": 18,   "existingLiabilities": 50000,   "loanPurposePKR": 300000,   "loanPurposeDescription": "string",   "sessionId": "string" }  // Success Response (200 OK) {   "status": "success",   "result": {     "creditScore": 642,     "riskBand": "MODERATE",     "creditMemo": "The applicant operates a 18-month-old services business...",     "strengths": ["Consistent revenue history", "Low existing debt ratio"],     "weaknesses": ["No formal business registration", "Seasonal revenue pattern"],     "improvementSteps": [       "Register business with SECP within 60 days (+80 credit points)",       "Open a dedicated business UBL account to formalize cash flows (+50 points)",       "Maintain 3 months of bank statements for the next quarter (+40 points)"     ],     "suggestedUBLProducts": ["Asaan Finance SME", "UBL Business Running Finance"]   } }

# 2.5  V2 Database Schema


| Table Name | Purpose | Key Columns | New in V2 |
| --- | --- | --- | --- |
| users | Authenticated user profiles | id, email, phone, tier, created_at, ubl_account_ref | YES — full auth in V2 |
| sessions | User session tracking for AI context persistence | id, user_id, module, conversation_json, created_at, expires_at | YES |
| threat_reports | Community scam reporting registry (V1: analysis_log enhanced) | id, content_hash, classification, confidence, threat_type, reported_count, verified | ENHANCED |
| threat_embeddings | pgvector table for semantic threat matching | id, threat_report_id, embedding vector(1536), metadata_json | YES |
| transfer_validations | P2P transfer risk assessments | id, user_id, iban_hash, risk_level, risk_score, behavioral_flags_json, created_at | ENHANCED |
| documents_analyzed | Document intelligence results | id, user_id, doc_type, authenticity_score, extracted_fields_json, red_flags_json, file_hash | YES |
| financial_profiles | User spending/income data for Financial Coach | id, user_id, spending_categories_json, monthly_budget, savings_goal, subscriptions_json | YES |
| credit_assessments | SME credit evaluation results | id, user_id, business_json, credit_score, risk_band, memo_text, improvement_steps_json | YES |
| academy_progress | Gamification progress (V1: quiz_scores enhanced) | id, user_id, modules_completed, xp_total, streak_days, badges_json, certificates_json | ENHANCED |
| compliance_digests | SBP/FBR regulation digest cache | id, source, title, summary, action_required, deadline, published_at, embedding vector(1536) | YES |
| audit_log | Append-only security audit trail | id, user_id, action, resource, ip_hash, timestamp, result — NO DELETE PERMISSION | YES |


# 2.6  V2 Prompt Engineering — Multi-Agent System Prompts


### Orchestrator Agent System Prompt

// SHIELDPAY V2 — Orchestrator Agent System Prompt  You are ShieldPay's Central Intelligence Orchestrator — the primary interface between Pakistani banking users and ShieldPay's 7 specialist agents. You understand Urdu-English mixed input fluently.  ROUTING RULES: - Scam/threat/link/SMS analysis → route to: threat_agent - IBAN/transfer/payment concerns → route to: transfer_agent - Document/invoice/contract/KYC → route to: document_agent - Spending/savings/budget advice → route to: coach_agent - Loan/credit/business financing → route to: credit_agent - Regulations/tax/compliance → route to: compliance_agent - Quizzes/learning/education → route to: academy_agent - Ambiguous multi-module queries → handle directly, cite modules  RESPONSE RULES: 1. Always respond in the same language mixture the user used. 2. Never fabricate specific bank policies, IBAN details, or legal advice. 3. For HIGH or CRITICAL risk findings: lead with the risk warning. 4. Maximum response length: 3 short paragraphs + 1 action suggestions array. 5. Include suggestedActions array in every response (2-4 items).  OUTPUT FORMAT: Valid JSON only. { reply: string, intent: string, moduleRouted: string,   suggestedActions: [{label, action, module}] }

### Document Intelligence Agent System Prompt

// SHIELDPAY V2 — Document Intelligence Agent System Prompt  You are ShieldPay's Document Intelligence Engine. You analyze Pakistani banking documents (CNICs, salary slips, bank statements, invoices, contracts) for authenticity, data accuracy, and fraud indicators.  CRITICAL RULES: 1. Return ONLY valid JSON matching the DocumentAnalysisResult schema. 2. authenticityScore: 0 (definitely fake) to 100 (highly authentic). 3. authenticityRisk: VERY_LOW | LOW | MEDIUM | HIGH | CRITICAL 4. For CNIC documents: validate 13-digit format, check issuing date logic. 5. For invoices: cross-check math (line items must sum to total). 6. For bank statements: flag balance inconsistencies, unusual gaps. 7. extractedFields: extract all key data points as structured JSON. 8. redFlags: empty array if none. Never invent red flags. 9. aiSummary: 2-3 sentences. Plain English. Direct and factual.  Pakistan-specific context: - Valid IBAN format: PK + 2 digits + 4 letter bank code + 16 digits - Valid CNIC format: XXXXX-XXXXXXX-X (13 digits with dashes) - Known bank codes: UNIL, SCBL, HABB, MCIB, ALFL, BAHL, JSBL, SMIB

# 2.7  V2 Security Architecture


| Security Domain | V1 Implementation | V2 Implementation | Standard |
| --- | --- | --- | --- |
| Authentication | None (stateless) | Supabase JWT + refresh tokens (15min access / 7day refresh) | OAuth 2.0 PKCE |
| Authorization | None | Row Level Security (RLS) on all Supabase tables — users can only read/write their own data | RBAC / ABAC |
| API Security | X-Internal-Key header | Kong gateway: JWT validation + rate limiting (100 req/min per user) + IP allowlist for admin routes | OWASP API Top 10 |
| Data Encryption | None | AES-256 at rest via Supabase Vault; TLS 1.3 in transit; PII fields (name, phone, CNIC) column-encrypted before storage | PCI-DSS prep |
| Input Validation | Zod schemas | Zod schemas + DOMPurify + file type magic-byte validation + max file size enforcement | OWASP Input Validation |
| Secret Management | Railway env vars | Railway encrypted vault + secret rotation policy (30-day API key rotation) + no secrets in code | Zero-trust secrets |
| Audit Logging | None | Append-only audit_log table: every API call logged with user_id, IP hash, action, timestamp, result. Tamper-evident via hash chaining. | SOC2 Type II prep |
| Dependency Security | Manual review | Dependabot automated PR alerts + npm audit in CI pipeline + SBOM generation | Supply chain security |


# 2.8  CI/CD Pipeline — V2 DevOps Topology

V2 introduces a full GitHub Actions CI/CD pipeline with automated testing, staged deployments, and rollback capabilities. The pipeline enforces quality gates before any code reaches production.
GitHub PR Opened         │         ▼   ┌─────────────────────────────────┐   │  CI Pipeline (GitHub Actions)   │   │  1. Lint (ESLint + Prettier)    │   │  2. Type Check (TypeScript)     │   │  3. Unit Tests (Vitest)         │   │  4. API Integration (Supertest) │   │  5. Build Check (vite build)    │   │  6. Security Scan (npm audit)   │   └─────────────────────────────────┘         │ All checks pass         ▼   PR Merged to main         │         ▼   ┌─────────────────────────────────┐   │  CD Pipeline                    │   │  1. Deploy to Staging           │   │     (Vercel preview + Railway   │   │      staging env)               │   │  2. Run E2E Tests (Playwright)  │   │  3. Performance check           │   │     (Lighthouse CI > 85)        │   │  4. Manual approval gate        │   └─────────────────────────────────┘         │ Approved         ▼   Production Deploy   (Vercel Edge + Railway Pro)   Zero-downtime rolling restart
PART 3: V2 DEVELOPMENT ROADMAP

# 3.1  Sprint Planning Overview

ShieldPay V2 is designed as a 3-sprint post-hackathon development cycle. Each sprint is 2 weeks (10 working days), targeting a solo developer working 6-8 hours daily. The roadmap assumes V1 MVP is complete and deployed.

## Sprint 1 (Weeks 1–2): Auth + Architecture Upgrade


| Day | Focus | Deliverable |
| --- | --- | --- |
| 1–2 | Auth system | Supabase Auth integrated. JWT flow working. Login/signup UI. Protected routes. |
| 3–4 | API Gateway | Kong OSS deployed on Railway. JWT validation. Rate limiting active. All V1 routes migrated. |
| 5–6 | Database migration | V2 schema deployed. RLS policies active. pgvector extension enabled. Audit log table live. |
| 7–8 | Redis integration | Upstash Redis connected. Response caching implemented for Modules 1 & 2. |
| 9–10 | V1 module upgrade | Module 1 (Threat) upgraded: 5-tier classification, community reporting. Module 2: behavioral scoring enhanced. |


## Sprint 2 (Weeks 3–4): New Modules (3, 4, 5)


| Day | Focus | Deliverable |
| --- | --- | --- |
| 1–3 | Module 3: Financial Coach | Spending dashboard UI. Claude Coach agent. Subscription detector. Hinglish response mode. |
| 4–6 | Module 4: Document Intelligence | File upload UI. Claude Vision integration. KYC analyzer. Invoice fraud detector. |
| 7–9 | Module 5: Credit Profiler | Business intake form. Credit memo generator. Risk band assignment. UBL product suggestions. |
| 10 | Sprint 2 integration | Cross-module navigation. Unified user dashboard showing activity across all 5 active modules. |


## Sprint 3 (Weeks 5–6): New Modules (6, 7, 8) + SaaS Layer


| Day | Focus | Deliverable |
| --- | --- | --- |
| 1–2 | Module 6: Compliance Monitor | Regulatory digest API. SBP circular feed integration. AML pre-checker. |
| 3–4 | Module 7: Academy Upgrade | 25 modules content. AI quiz generator. Certification PDF generation. Leaderboard. |
| 5–6 | Module 8: AI Assistant | Multi-turn chat UI. Orchestrator agent. Intent routing to all modules. Urdu-English NLP. |
| 7–8 | SaaS layer | Subscription tiers. Payment via Stripe (USD) + Easypaisa (PKR). Tier enforcement on API routes. |
| 9 | Observability | Sentry deployed. Datadog APM live. PostHog analytics. Lighthouse CI passing. |
| 10 | V2 launch prep | Full E2E test suite. Performance audit. Security audit. Production deploy. Documentation update. |


# 3.2  V1 → V5 Platform Evolution Vision

ShieldPay is conceived as a 5-version journey from a hackathon prototype to Pakistan's leading AI banking intelligence platform. Each version builds on the last with a clearly defined scope boundary.

| Version | Codename | Core Theme | Key Additions | Target Timeline |
| --- | --- | --- | --- | --- |
| V1 | Hackathon MVP | Prove the concept | 3 modules: Scan, Validate Transfer, Education. Single AI call. No auth. Demo only. | Hackathon (72 hours) |
| V2 | SaaS Foundation | Build the platform | 8 modules. Multi-agent AI. Auth. Redis cache. pgvector. Monetization tiers. CI/CD pipeline. | 6 weeks post-hackathon |
| V3 | Bank Integration | Connect to real data | UBL API integration (real account data). Raast payment hooks. WhatsApp Business API chatbot. ML model for local threat patterns. | 3 months post-V2 |
| V4 | Intelligence Network | Crowdsourced defense | Pakistan National Scam Registry (federated DB across partner banks). Real-time threat broadcast. Regulator data feeds (FIA Cybercrime Wing, SBP). | 6 months post-V3 |
| V5 | Ecosystem Platform | Become infrastructure | Open API for third-party fintech builders. ShieldPay SDK. University curriculum API. White-label licensing to 5+ Pakistani banks. SECP-registered fintech license. | 12 months post-V4 |


# 3.3  Winning Criteria Alignment — V2


| Judging Dimension | V1 Score | V2 Score | V2 Evidence |
| --- | --- | --- | --- |
| Track Alignment | 5/5 | 5/5 | All 8 modules deeply integrated with AI in Banking: real Claude multi-agent inference, Pakistan-specific banking context, UBL ecosystem alignment |
| Technical Execution | 4/5 | 5/5 | Full-stack with auth, multi-agent AI pipeline, vector DB, Redis, CI/CD, E2E testing, observability stack — production-grade architecture |
| Problem Relevance | 5/5 | 5/5 | Expands from 2 problem areas to the full spectrum of Pakistani digital banking challenges: fraud, financial literacy, document security, SME credit, compliance |
| Innovation | 4/5 | 5/5 | Pakistan's first multi-agent AI banking intelligence SaaS: Document Intelligence + Credit AI + Urdu-English conversational banking assistant are all unique in market |
| Feasibility | 5/5 | 4/5 | Realistically 6-week build for solo developer; presented as a roadmap not a 72-hour sprint — demonstrates long-term commercial viability beyond hackathon |
| Business Potential | 4/5 | 5/5 | 4-tier SaaS monetization model with clear white-label B2B path to UBL. Addressable market: 8M+ Pakistani university students + 3.8M registered SMEs |

ShieldPay V2 — UBL National Innovation Hackathon 2026
Hamza Ali  |  COMSATS University Islamabad, Wah Campus  |  Software Engineering