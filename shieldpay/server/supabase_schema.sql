-- SHIELDPAY V2 — DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- Aligning with SBP digital banking consumer protection and compliance guidelines.

-- Enable pgvector extension for AI threat classification similarity matching
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'STUDENT_PRO', 'SME', 'ENTERPRISE')),
    ubl_account_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ==========================================
-- 2. SESSIONS TABLE (For AI Conversation History)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    conversation_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
    ON public.sessions FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 3. THREAT REPORTS TABLE (crowd-sourced Registry)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.threat_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_hash TEXT UNIQUE NOT NULL,
    classification TEXT CHECK (classification IN ('SAFE', 'LOW_RISK', 'SUSPICIOUS', 'HIGH_RISK', 'CRITICAL')) NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) NOT NULL,
    threat_type TEXT NOT NULL,
    reported_count INTEGER DEFAULT 1 NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;

-- Any user can select/read threat reports, authentication optionally required depending on monetization
CREATE POLICY "Anyone can view verified threat reports"
    ON public.threat_reports FOR SELECT
    USING (true);

-- Authenticated users can insert/report new threats
CREATE POLICY "Authenticated users can submit threat reports"
    ON public.threat_reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 4. THREAT EMBEDDINGS TABLE (pgvector for semantic search)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.threat_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_report_id UUID REFERENCES public.threat_reports(id) ON DELETE CASCADE NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb NOT NULL
);

ALTER TABLE public.threat_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view threat embeddings"
    ON public.threat_embeddings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert threat embeddings"
    ON public.threat_embeddings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 5. TRANSFER VALIDATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transfer_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    iban_hash TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100) NOT NULL,
    behavioral_flags_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transfer_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transfer validations"
    ON public.transfer_validations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own transfer validations"
    ON public.transfer_validations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 6. DOCUMENTS ANALYZED TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.documents_analyzed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    doc_type TEXT NOT NULL,
    authenticity_score INTEGER CHECK (authenticity_score >= 0 AND authenticity_score <= 100) NOT NULL,
    extracted_fields_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    red_flags_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    file_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.documents_analyzed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own analyzed documents"
    ON public.documents_analyzed FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 7. FINANCIAL PROFILES TABLE (Financial Coach data)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    spending_categories_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    monthly_budget NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    savings_goal NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    subscriptions_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own financial profile"
    ON public.financial_profiles FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 8. CREDIT ASSESSMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.credit_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    business_json JSONB NOT NULL,
    credit_score INTEGER CHECK (credit_score >= 0 AND credit_score <= 1000) NOT NULL,
    risk_band TEXT CHECK (risk_band IN ('VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH')) NOT NULL,
    memo_text TEXT NOT NULL,
    improvement_steps_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.credit_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit assessments"
    ON public.credit_assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create credit assessments"
    ON public.credit_assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 9. ACADEMY PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.academy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    modules_completed JSONB DEFAULT '[]'::jsonb NOT NULL,
    xp_total INTEGER DEFAULT 0 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    badges_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    certificates_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own academy progress"
    ON public.academy_progress FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- 10. COMPLIANCE DIGESTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.compliance_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL, -- 'SBP' | 'FBR' | 'SECP'
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    action_required TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.compliance_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compliance digests"
    ON public.compliance_digests FOR SELECT
    USING (true);

-- Only admins/system can modify compliance digests
CREATE POLICY "Admins can insert compliance digests"
    ON public.compliance_digests FOR ALL
    USING (auth.jwt() ->> 'email' LIKE '%@shieldpay.com'); -- arbitrary example admin check

-- ==========================================
-- 11. AUDIT LOG TABLE (Append-Only)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    result TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own audit logs"
    ON public.audit_log FOR SELECT
    USING (auth.uid() = user_id);

-- Allow system/auth to insert audit logs
CREATE POLICY "System can record audit logs"
    ON public.audit_log FOR INSERT
    WITH CHECK (true);

-- SECURE APPEND-ONLY RULES (Block UPDATE and DELETE on audit_log)
CREATE OR REPLACE FUNCTION block_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and deletions are strictly prohibited on the ShieldPay immutable audit log.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_block_audit_log_modification
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION block_audit_log_modification();
