import express, { Request, Response } from 'express';
import { getStructuredAICompletion } from '../ai_client.js';
import { dbInterface } from '../db.js';
import crypto from 'crypto';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const router = express.Router();

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

const BOT_SYSTEM_PROMPT = `
You are ShieldBot, the friendly AI guardian of ShieldPay. Your mission is to help Pakistani university students stay safe from scams and manage their finances better.
Keep your answers concise, helpful, and use a friendly, trust-building tone. 
If someone asks about a specific message, tell them to use the "Scan Content" tab. 
If they ask about a bank transfer, tell them to use the "Validate Transfer" tab.
Use Pakistani context where relevant.
`;

router.post('/message', async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
  const userId = req.user?.id || null;

  try {
    const validated = chatRequestSchema.parse(req.body);
    const { message, sessionId, history } = validated;

    const sessionUUID = sessionId || crypto.randomUUID();

    // 1. Audit Log: log chat message
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'CHAT_ASSISTANT',
      resource: `session:${sessionUUID}`,
      ip_hash: ipHash,
      result: 'PENDING'
    });

    const activeHistory = history || [];
    
    // Call Groq / Anthropic for simple assistant chat
    let reply = '';
    const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

    if (ANTHROPIC_API_KEY) {
      // Call Anthropic Claude
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      const apiResponse = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 600,
        system: BOT_SYSTEM_PROMPT,
        messages: [
          ...activeHistory.map(h => ({ role: h.role === 'system' ? 'user' : (h.role as 'user' | 'assistant'), content: h.content })),
          { role: 'user', content: message }
        ]
      });
      if (apiResponse.content && apiResponse.content[0] && apiResponse.content[0].type === 'text') {
        reply = apiResponse.content[0].text;
      }
    } else if (GROQ_API_KEY) {
      // Call Groq
      const groq = new Groq({ apiKey: GROQ_API_KEY });
      const apiResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: BOT_SYSTEM_PROMPT },
          ...activeHistory.map(h => ({ role: h.role as 'user' | 'assistant' | 'system', content: h.content })),
          { role: 'user', content: message }
        ],
        max_tokens: 500
      });
      reply = apiResponse.choices[0].message.content || 'I encountered an issue parsing the response.';
    } else {
      reply = "I'm currently offline (API key not set). Please configure ANTHROPIC_API_KEY or GROQ_API_KEY on the server!";
    }

    // 2. Persist the session history in database
    const updatedHistory = [
      ...activeHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    ];

    try {
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL
      await dbInterface.sessions.save(sessionUUID, userId, 'chat_assistant', updatedHistory, expirationDate);
    } catch (dbErr: any) {
      console.warn('[DB] Failed to save chat session:', dbErr.message);
    }

    // Update Audit Log: SUCCESS
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'CHAT_ASSISTANT',
      resource: `session:${sessionUUID}`,
      ip_hash: ipHash,
      result: 'SUCCESS'
    });

    res.json({
      status: 'success',
      reply,
      sessionId: sessionUUID
    });

  } catch (error: any) {
    // Update Audit Log: FAILED
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'CHAT_ASSISTANT',
      resource: 'session',
      ip_hash: ipHash,
      result: `FAILED: ${error.message || 'unknown'}`
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message
      });
      return;
    }

    console.error('[CHAT] API message failure:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'I had a bit of a glitch. Try again!'
    });
  }
});

export default router;
