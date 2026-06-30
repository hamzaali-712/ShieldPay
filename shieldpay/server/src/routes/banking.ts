import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getStructuredAICompletion } from '../ai_client.js';
import { dbInterface } from '../db.js';
import { cacheWrapper } from '../cache.js';
import crypto from 'crypto';

const router = express.Router();

const PAKISTAN_IBAN_REGEX = /^PK\d{2}[A-Z]{4}\d{16}$/;
const BANK_CODES: Record<string, string> = {
  "UNIL": "United Bank Limited (UBL)",
  "MEZN": "Meezan Bank",
  "SCBL": "Standard Chartered Bank Pakistan",
  "HABB": "Habib Bank Limited (HBL)",
  "MUCB": "MCB Bank",
  "ALFH": "Bank Alfalah",
  "NBPA": "National Bank of Pakistan",
  "BKIP": "Bank of Punjab",
  "JSBL": "JS Bank",
  "FAYS": "Faysal Bank",
  "MOCK": "ShieldPay Mock Bank"
};

const transferSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  iban: z.string().toUpperCase().replace(/\s/g, ''),
  amountPKR: z.number().positive('Amount must be positive'),
  transferNote: z.string().optional(),
  sessionId: z.string().optional()
});

const bankingResponseSchema = z.object({
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  riskScore: z.number().int().min(0).max(100),
  behavioralFlags: z.array(z.string()),
  aiSummary: z.string(),
  proceedRecommendation: z.enum(['PROCEED', 'VERIFY_FIRST', 'DO_NOT_PROCEED'])
});

const BANKING_SYSTEM_PROMPT = `
You are ShieldPay's P2P Transaction Risk Engine, trained on Pakistani financial fraud and money mule patterns. Analyze P2P transfer requests for scam identifiers.
Evaluate recipient info, transfer note framing, and amount patterns (be warning: round numbers and urgency indicators).

CRITICAL RULES:
1. Return ONLY a valid JSON object. No markdown, no preamble.
2. riskLevel MUST be exactly one of: LOW, MEDIUM, HIGH
3. riskScore MUST be an integer between 0 and 100
4. behavioralFlags MUST be an array of strings
5. proceedRecommendation MUST be exactly one of: PROCEED, VERIFY_FIRST, DO_NOT_PROCEED

OUTPUT SCHEMA: { riskLevel, riskScore, behavioralFlags[], aiSummary, proceedRecommendation }
`;

router.post('/validate-transfer', async (req: Request, res: Response): Promise<void> => {
  const start = Date.now();
  const ipAddress = req.ip || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');
  const userId = req.user?.id || null;

  try {
    const validated = transferSchema.parse(req.body);
    const { iban, amountPKR, transferNote, recipientName, sessionId } = validated;

    // Validate IBAN formatting
    const ibanValid = PAKISTAN_IBAN_REGEX.test(iban);
    let bankResolved = 'Unknown Bank';
    if (ibanValid) {
      const bankCode = iban.substring(4, 8);
      bankResolved = BANK_CODES[bankCode] || 'Other Bank';
    }

    // Hash IBAN for audit logging
    const ibanHash = crypto.createHash('sha256').update(iban).digest('hex');
    const cacheKey = `banking:validate:${ibanHash}:${amountPKR}:${crypto.createHash('sha256').update(transferNote || '').digest('hex')}`;

    // 1. Audit Log: Log transaction verification intent
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'VALIDATE_TRANSFER',
      resource: `iban:${ibanHash}`,
      ip_hash: ipHash,
      result: 'PENDING'
    });

    // 2. Fetch or compute risk score
    const result = await cacheWrapper(cacheKey, 1800, async () => {
      // Analyze with AI Risk Engine
      const aiResponse = await getStructuredAICompletion(
        BANKING_SYSTEM_PROMPT,
        `Analyze this P2P transfer:
        Recipient: ${recipientName}
        Account/IBAN: ${iban} (Resolved: ${bankResolved}, Valid: ${ibanValid})
        Amount: ${amountPKR} PKR
        Note: ${transferNote || 'No transfer note provided'}`,
        bankingResponseSchema
      );

      return aiResponse;
    });

    // 3. Log validation event in transfer validations database
    try {
      await dbInterface.transferValidations.insert({
        user_id: userId,
        iban_hash: ibanHash,
        risk_level: result.riskLevel,
        risk_score: result.riskScore,
        behavioral_flags_json: result.behavioralFlags
      });
    } catch (dbErr: any) {
      console.warn('[DB] Failed to insert transfer validation:', dbErr.message);
    }

    const processingMs = Date.now() - start;

    // Update Audit Log to SUCCESS
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'VALIDATE_TRANSFER',
      resource: `iban:${ibanHash}:${result.riskLevel}`,
      ip_hash: ipHash,
      result: 'SUCCESS'
    });

    res.json({
      status: 'success',
      result: {
        ibanValid,
        bankResolved,
        ...result
      },
      processingMs
    });

  } catch (error: any) {
    // Update Audit Log to FAILED
    await dbInterface.auditLog.insert({
      user_id: userId,
      action: 'VALIDATE_TRANSFER',
      resource: 'iban',
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

    console.error('[BANKING] API validate-transfer failure:', error);
    res.status(500).json({
      status: 'error',
      code: 'BANKING_ERROR',
      message: error.message || 'Failed to complete transfer validation checks.'
    });
  }
});

export default router;
