import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;
let sqliteDb: sqlite3.Database | null = null;

// Initialize SQLite database
const sqlitePath = path.resolve(process.cwd(), 'local_database.sqlite');
console.log(`[DB] Local database path: ${sqlitePath}`);

const initSqlite = (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath, (err) => {
      if (err) {
        console.error('[DB] Failed to open SQLite database:', err);
        reject(err);
      } else {
        db.serialize(() => {
          db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            tier TEXT DEFAULT 'FREE',
            ubl_account_ref TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            module TEXT NOT NULL,
            conversation_json TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT NOT NULL
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS threat_reports (
            id TEXT PRIMARY KEY,
            content_hash TEXT UNIQUE NOT NULL,
            classification TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            threat_type TEXT NOT NULL,
            reported_count INTEGER DEFAULT 1,
            verified BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS transfer_validations (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            iban_hash TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            behavioral_flags_json TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS documents_analyzed (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            doc_type TEXT NOT NULL,
            authenticity_score INTEGER NOT NULL,
            extracted_fields_json TEXT DEFAULT '{}',
            red_flags_json TEXT DEFAULT '[]',
            file_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS financial_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            spending_categories_json TEXT DEFAULT '{}',
            monthly_budget REAL DEFAULT 0.00,
            savings_goal REAL DEFAULT 0.00,
            subscriptions_json TEXT DEFAULT '[]',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS credit_assessments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            business_json TEXT NOT NULL,
            credit_score INTEGER NOT NULL,
            risk_band TEXT NOT NULL,
            memo_text TEXT NOT NULL,
            improvement_steps_json TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS academy_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            modules_completed TEXT DEFAULT '[]',
            xp_total INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            badges_json TEXT DEFAULT '[]',
            certificates_json TEXT DEFAULT '[]',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS compliance_digests (
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            action_required TEXT,
            deadline TEXT,
            published_at TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )`);
          db.run(`CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action TEXT NOT NULL,
            resource TEXT NOT NULL,
            ip_hash TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            result TEXT NOT NULL
          )`);
        });
        resolve(db);
      }
    });
  });
};

// Initialize connection logic
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    console.log('[DB] Connecting to Supabase Cloud...');
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('[DB] Supabase client initialized.');
  } catch (error) {
    console.error('[DB] Supabase initialization failed, falling back to local SQLite:', error);
  }
} else {
  console.log('[DB] No Supabase key found in environment variable. Running on local SQLite fallback.');
}

// Helper to run SQLite queries with promises
export const sqliteRun = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if (!sqliteDb) {
      sqliteDb = await initSqlite();
    }
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const sqliteGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if (!sqliteDb) {
      sqliteDb = await initSqlite();
    }
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const sqliteAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    if (!sqliteDb) {
      sqliteDb = await initSqlite();
    }
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Unified Database interface wrapper
export const dbInterface = {
  isCloud: () => !!supabase,

  // Users
  users: {
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error) return data;
      }
      return sqliteGet('SELECT * FROM users WHERE id = ?', [id]);
    },
    upsert: async (user: { id: string; email: string; phone?: string; tier?: string; ubl_account_ref?: string }) => {
      if (supabase) {
        const { data, error } = await supabase.from('users').upsert(user).select().single();
        if (!error) return data;
        console.error('[DB] Supabase users upsert error:', error);
      }
      const existing = await sqliteGet('SELECT id FROM users WHERE id = ?', [user.id]);
      if (existing) {
        await sqliteRun(
          'UPDATE users SET email = ?, phone = ?, tier = ?, ubl_account_ref = ? WHERE id = ?',
          [user.email, user.phone || null, user.tier || 'FREE', user.ubl_account_ref || null, user.id]
        );
      } else {
        await sqliteRun(
          'INSERT INTO users (id, email, phone, tier, ubl_account_ref) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.email, user.phone || null, user.tier || 'FREE', user.ubl_account_ref || null]
        );
      }
      return user;
    }
  },

  // Sessions
  sessions: {
    get: async (id: string) => {
      if (supabase) {
        const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single();
        if (!error) return { ...data, conversation_json: data.conversation_json };
      }
      const row = await sqliteGet('SELECT * FROM sessions WHERE id = ?', [id]);
      if (row) {
        row.conversation_json = JSON.parse(row.conversation_json);
      }
      return row;
    },
    save: async (id: string, userId: string | null, moduleName: string, conversationJson: any, expiresAt: Date) => {
      const expString = expiresAt.toISOString();
      const convString = JSON.stringify(conversationJson);
      if (supabase) {
        const { error } = await supabase.from('sessions').upsert({
          id,
          user_id: userId,
          module: moduleName,
          conversation_json: conversationJson,
          expires_at: expString
        });
        if (!error) return;
        console.error('[DB] Supabase sessions save error:', error);
      }
      const existing = await sqliteGet('SELECT id FROM sessions WHERE id = ?', [id]);
      if (existing) {
        await sqliteRun(
          'UPDATE sessions SET conversation_json = ?, expires_at = ? WHERE id = ?',
          [convString, expString, id]
        );
      } else {
        await sqliteRun(
          'INSERT INTO sessions (id, user_id, module, conversation_json, expires_at) VALUES (?, ?, ?, ?, ?)',
          [id, userId, moduleName, convString, expString]
        );
      }
    }
  },

  // Threat Reports
  threatReports: {
    getByHash: async (hash: string) => {
      if (supabase) {
        const { data, error } = await supabase.from('threat_reports').select('*').eq('content_hash', hash).single();
        if (!error) return data;
      }
      return sqliteGet('SELECT * FROM threat_reports WHERE content_hash = ?', [hash]);
    },
    insert: async (report: { content_hash: string; classification: string; confidence: number; threat_type: string; reported_count?: number; verified?: boolean }) => {
      if (supabase) {
        const { data, error } = await supabase.from('threat_reports').insert(report).select().single();
        if (!error) return data;
        console.error('[DB] Supabase threatReports insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO threat_reports (id, content_hash, classification, confidence, threat_type, reported_count, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, report.content_hash, report.classification, report.confidence, report.threat_type, report.reported_count || 1, report.verified ? 1 : 0]
      );
      return { id, ...report };
    },
    incrementReportCount: async (hash: string) => {
      if (supabase) {
        const { data: existing } = await supabase.from('threat_reports').select('id, reported_count').eq('content_hash', hash).single();
        if (existing) {
          await supabase.from('threat_reports').update({ reported_count: existing.reported_count + 1 }).eq('id', existing.id);
          return;
        }
      }
      await sqliteRun('UPDATE threat_reports SET reported_count = reported_count + 1 WHERE content_hash = ?', [hash]);
    },
    getRecent: async (limit = 10) => {
      if (supabase) {
        const { data } = await supabase.from('threat_reports').select('*').order('created_at', { ascending: false }).limit(limit);
        if (data) return data;
      }
      return sqliteAll('SELECT * FROM threat_reports ORDER BY created_at DESC LIMIT ?', [limit]);
    }
  },

  // Transfer Validations
  transferValidations: {
    insert: async (val: { user_id: string | null; iban_hash: string; risk_level: string; risk_score: number; behavioral_flags_json: any[] }) => {
      const flagsString = JSON.stringify(val.behavioral_flags_json);
      if (supabase) {
        const { data, error } = await supabase.from('transfer_validations').insert({
          user_id: val.user_id,
          iban_hash: val.iban_hash,
          risk_level: val.risk_level,
          risk_score: val.risk_score,
          behavioral_flags_json: val.behavioral_flags_json
        }).select().single();
        if (!error) return data;
        console.error('[DB] Supabase transfer_validations insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO transfer_validations (id, user_id, iban_hash, risk_level, risk_score, behavioral_flags_json) VALUES (?, ?, ?, ?, ?, ?)',
        [id, val.user_id, val.iban_hash, val.risk_level, val.risk_score, flagsString]
      );
      return { id, ...val };
    },
    getByUser: async (userId: string) => {
      if (supabase) {
        const { data } = await supabase.from('transfer_validations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) return data;
      }
      const rows = await sqliteAll('SELECT * FROM transfer_validations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      return rows.map(r => ({ ...r, behavioral_flags_json: JSON.parse(r.behavioral_flags_json) }));
    }
  },

  // Audit Log (Append Only)
  auditLog: {
    insert: async (log: { user_id: string | null; action: string; resource: string; ip_hash: string; result: string }) => {
      if (supabase) {
        const { error } = await supabase.from('audit_log').insert(log);
        if (!error) return;
        // Print detailed trace if fails, but keep going
        console.error('[DB] Supabase audit log insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO audit_log (id, user_id, action, resource, ip_hash, result) VALUES (?, ?, ?, ?, ?, ?)',
        [id, log.user_id, log.action, log.resource, log.ip_hash, log.result]
      );
    },
    getByUser: async (userId: string) => {
      if (supabase) {
        const { data } = await supabase.from('audit_log').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
        if (data) return data;
      }
      return sqliteAll('SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
    }
  },

  // Financial Profiles (Spending Advisor)
  financialProfiles: {
    get: async (userId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from('financial_profiles').select('*').eq('user_id', userId).single();
        if (!error) return data;
      }
      const row = await sqliteGet('SELECT * FROM financial_profiles WHERE user_id = ?', [userId]);
      if (row) {
        row.spending_categories_json = JSON.parse(row.spending_categories_json);
        row.subscriptions_json = JSON.parse(row.subscriptions_json);
      }
      return row;
    },
    upsert: async (profile: { user_id: string; spending_categories_json: any; monthly_budget: number; savings_goal: number; subscriptions_json: any }) => {
      const catsString = JSON.stringify(profile.spending_categories_json);
      const subsString = JSON.stringify(profile.subscriptions_json);
      if (supabase) {
        const { data, error } = await supabase.from('financial_profiles').upsert(profile).select().single();
        if (!error) return data;
        console.error('[DB] Supabase financial_profiles upsert error:', error);
      }
      const existing = await sqliteGet('SELECT id FROM financial_profiles WHERE user_id = ?', [profile.user_id]);
      if (existing) {
        await sqliteRun(
          'UPDATE financial_profiles SET spending_categories_json = ?, monthly_budget = ?, savings_goal = ?, subscriptions_json = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [catsString, profile.monthly_budget, profile.savings_goal, subsString, profile.user_id]
        );
      } else {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await sqliteRun(
          'INSERT INTO financial_profiles (id, user_id, spending_categories_json, monthly_budget, savings_goal, subscriptions_json) VALUES (?, ?, ?, ?, ?, ?)',
          [id, profile.user_id, catsString, profile.monthly_budget, profile.savings_goal, subsString]
        );
      }
      return profile;
    }
  },

  // Academy Progress
  academyProgress: {
    get: async (userId: string) => {
      if (supabase) {
        const { data, error } = await supabase.from('academy_progress').select('*').eq('user_id', userId).single();
        if (!error) return data;
      }
      const row = await sqliteGet('SELECT * FROM academy_progress WHERE user_id = ?', [userId]);
      if (row) {
        row.modules_completed = JSON.parse(row.modules_completed);
        row.badges_json = JSON.parse(row.badges_json);
        row.certificates_json = JSON.parse(row.certificates_json);
      }
      return row;
    },
    upsert: async (prog: { user_id: string; modules_completed: any[]; xp_total: number; streak_days: number; badges_json: any[]; certificates_json: any[] }) => {
      const modsString = JSON.stringify(prog.modules_completed);
      const badgesString = JSON.stringify(prog.badges_json);
      const certsString = JSON.stringify(prog.certificates_json);
      if (supabase) {
        const { data, error } = await supabase.from('academy_progress').upsert(prog).select().single();
        if (!error) return data;
        console.error('[DB] Supabase academy_progress upsert error:', error);
      }
      const existing = await sqliteGet('SELECT id FROM academy_progress WHERE user_id = ?', [prog.user_id]);
      if (existing) {
        await sqliteRun(
          'UPDATE academy_progress SET modules_completed = ?, xp_total = ?, streak_days = ?, badges_json = ?, certificates_json = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [modsString, prog.xp_total, prog.streak_days, badgesString, certsString, prog.user_id]
        );
      } else {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await sqliteRun(
          'INSERT INTO academy_progress (id, user_id, modules_completed, xp_total, streak_days, badges_json, certificates_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, prog.user_id, modsString, prog.xp_total, prog.streak_days, badgesString, certsString]
        );
      }
      return prog;
    },
    getLeaderboard: async (limit = 10) => {
      if (supabase) {
        const { data } = await supabase.from('academy_progress').select('user_id, xp_total, streak_days').order('xp_total', { ascending: false }).limit(limit);
        if (data) return data;
      }
      return sqliteAll('SELECT user_id, xp_total, streak_days FROM academy_progress ORDER BY xp_total DESC LIMIT ?', [limit]);
    }
  },

  // Credit Assessments (SME)
  creditAssessments: {
    insert: async (ass: { user_id: string; business_json: any; credit_score: number; risk_band: string; memo_text: string; improvement_steps_json: any[] }) => {
      const bizString = JSON.stringify(ass.business_json);
      const stepsString = JSON.stringify(ass.improvement_steps_json);
      if (supabase) {
        const { data, error } = await supabase.from('credit_assessments').insert(ass).select().single();
        if (!error) return data;
        console.error('[DB] Supabase credit_assessments insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO credit_assessments (id, user_id, business_json, credit_score, risk_band, memo_text, improvement_steps_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, ass.user_id, bizString, ass.credit_score, ass.risk_band, ass.memo_text, stepsString]
      );
      return { id, ...ass };
    },
    getByUser: async (userId: string) => {
      if (supabase) {
        const { data } = await supabase.from('credit_assessments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) return data;
      }
      const rows = await sqliteAll('SELECT * FROM credit_assessments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      return rows.map(r => ({
        ...r,
        business_json: JSON.parse(r.business_json),
        improvement_steps_json: JSON.parse(r.improvement_steps_json)
      }));
    }
  },

  // Documents Analyzed (Document Intelligence)
  documentsAnalyzed: {
    insert: async (doc: { user_id: string; doc_type: string; authenticity_score: number; extracted_fields_json: any; red_flags_json: any[]; file_hash: string }) => {
      const fieldsString = JSON.stringify(doc.extracted_fields_json);
      const flagsString = JSON.stringify(doc.red_flags_json);
      if (supabase) {
        const { data, error } = await supabase.from('documents_analyzed').insert(doc).select().single();
        if (!error) return data;
        console.error('[DB] Supabase documents_analyzed insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO documents_analyzed (id, user_id, doc_type, authenticity_score, extracted_fields_json, red_flags_json, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, doc.user_id, doc.doc_type, doc.authenticity_score, fieldsString, flagsString, doc.file_hash]
      );
      return { id, ...doc };
    },
    getByUser: async (userId: string) => {
      if (supabase) {
        const { data } = await supabase.from('documents_analyzed').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) return data;
      }
      const rows = await sqliteAll('SELECT * FROM documents_analyzed WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      return rows.map(r => ({
        ...r,
        extracted_fields_json: JSON.parse(r.extracted_fields_json),
        red_flags_json: JSON.parse(r.red_flags_json)
      }));
    }
  },

  // Compliance Digests
  complianceDigests: {
    insert: async (cd: { source: string; title: string; summary: string; action_required?: string; deadline?: string; published_at: string }) => {
      if (supabase) {
        const { data, error } = await supabase.from('compliance_digests').insert(cd).select().single();
        if (!error) return data;
        console.error('[DB] Supabase compliance_digests insert error:', error);
      }
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      await sqliteRun(
        'INSERT INTO compliance_digests (id, source, title, summary, action_required, deadline, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, cd.source, cd.title, cd.summary, cd.action_required || null, cd.deadline || null, cd.published_at]
      );
      return { id, ...cd };
    },
    getAll: async () => {
      if (supabase) {
        const { data } = await supabase.from('compliance_digests').select('*').order('published_at', { ascending: false });
        if (data) return data;
      }
      return sqliteAll('SELECT * FROM compliance_digests ORDER BY published_at DESC');
    }
  }
};
