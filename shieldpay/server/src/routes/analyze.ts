import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getStructuredAICompletion } from '../ai_client.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { cacheWrapper } from '../cache.js';
import { dbInterface } from '../db.js';
import crypto from 'crypto';

const router = express.Router();

const contentRequestSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content must not exceed 2000 characters'),
  contentType: z.enum(['sms', 'whatsapp', 'url', 'email', 'other']),
  sessionId: z.string().optional()
});

const contentResponseSchema = z.object({
  classification: z.enum(['SAFE', 'LOW_RISK', 'SUSPICIOUS', 'HIGH_RISK', 'CRITICAL']),
  confidenceScore: z.number().int().min(0).max(100),
  threatType: z.string(),
  redFlags: z.array(z.string()),
  explanation: z.string(),
  recommendedAction: z.string()
});

router.post('/content', async (req: Request, res: Response): Promise<void> => {
  const start = Date.now();
  const ipAddress = req.ip || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
  const userId = req.user?.id || null;

  try {
    const validated = contentRequestSchema.parse(req.body);
    const { content, contentType, sessionId } = validated;

    // Create unique hash for cache and registry lookup
    const contentHash = crypto.createHash('sha256').update(content.trim()).digest('hex');
    const cacheKey = `analyze:content:${contentHash}`;

    // 1. Audit Log: Log incoming analysis request
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'ANALYZE_CONTENT',
      resource: `content:${contentType}`,
      ip_hash: ipHash,
      result: 'PENDING'
    });

    // 2. Fetch from cache or run analyzer
    const result = await cacheWrapper(cacheKey, 3600, async () => {
      // 2a. Check if this is already reported in the Scam Registry database
      const existingReport = await dbInterface.threatReports.getByHash(contentHash);
      if (existingReport) {
        // Increment the report count automatically
        await dbInterface.threatReports.incrementReportCount(contentHash);
        
        return {
          classification: existingReport.classification,
          confidenceScore: existingReport.confidence,
          threatType: existingReport.threat_type,
          redFlags: ['Known scam pattern matched from ShieldPay Scam Registry'],
          explanation: `This content matched a reported scam from our database (threat reported ${existingReport.reported_count} times).`,
          recommendedAction: 'Do not interact with this content. Pattern matched from community scam registry.'
        };
      }

      // 2b. Run AI Analysis
      const aiResponse = await getStructuredAICompletion(
        SYSTEM_PROMPT,
        `Analyze this ${contentType} content: ${content}`,
        contentResponseSchema
      );

      // 2c. Save to community registry if it is flagged dangerous or suspicious
      if (aiResponse.classification !== 'SAFE') {
        try {
          await dbInterface.threatReports.insert({
            content_hash: contentHash,
            classification: aiResponse.classification,
            confidence: aiResponse.confidenceScore,
            threat_type: aiResponse.threatType,
            reported_count: 1,
            verified: false
          });
        } catch (dbErr: any) {
          console.warn('[DB] Failed to insert threat report:', dbErr.message);
        }
      }

      return aiResponse;
    });

    const processingMs = Date.now() - start;

    // Update Audit Log to SUCCESS
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'ANALYZE_CONTENT',
      resource: `content:${contentType}:${result.classification}`,
      ip_hash: ipHash,
      result: 'SUCCESS'
    });

    res.json({
      status: 'success',
      result,
      processingMs
    });

  } catch (error: any) {
    // Update Audit Log to FAILED
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'ANALYZE_CONTENT',
      resource: 'content',
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

    console.error('[ANALYZE] API post-content failure:', error);
    res.status(500).json({
      status: 'error',
      code: 'ANALYZE_ERROR',
      message: error.message || 'Failed to execute scam content analysis.'
    });
  }
});

export default router;
