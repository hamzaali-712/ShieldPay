import express from 'express';
import Groq from 'groq-sdk';
import { z } from 'zod';

const router = express.Router();

const PAKISTAN_IBAN_REGEX = /^PK\d{2}[A-Z]{4}\d{16}$/;
const BANK_CODES = {
  "UNIL": "United Bank Limited (UBL)",
  "MEZN": "Meezan Bank",
  "SCBL": "Standard Chartered Bank Pakistan",
  "HABB": "Habib Bank Limited (HBL)",
  "MUCB": "MCB Bank",
  "ALFH": "Bank Alfalah",
  "NBPA": "National Bank of Pakistan",
  "BKIP": "Bank of Punjab",
  "JSBL": "JS Bank",
  "FAYS": "Faysal Bank"
};

const transferSchema = z.object({
  recipientName: z.string().min(1),
  iban: z.string().toUpperCase(),
  amountPKR: z.number().positive(),
  transferNote: z.string().optional(),
  sessionId: z.string().optional()
});

const BANKING_SYSTEM_PROMPT = `
You are ShieldPay's Banking Transaction Risk Engine. Analyze P2P transfer requests for fraud patterns.
Return ONLY a valid JSON object.

OUTPUT SCHEMA: { riskLevel, riskScore, behavioralFlags[], aiSummary, proceedRecommendation }
riskLevel: LOW, MEDIUM, HIGH
riskScore: 0-100
proceedRecommendation: PROCEED, VERIFY_FIRST, DO_NOT_PROCEED
`;

router.post('/validate-transfer', async (req, res) => {
  try {
    const validated = transferSchema.parse(req.body);
    const { iban, amountPKR, transferNote, recipientName } = validated;

    const ibanValid = PAKISTAN_IBAN_REGEX.test(iban);
    let bankResolved = "Unknown Bank";
    
    if (ibanValid) {
      const bankCode = iban.substring(4, 8);
      bankResolved = BANK_CODES[bankCode] || "Other Bank";
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // AI Behavioral Analysis using Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: BANKING_SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Analyze this transfer:
          Recipient: ${recipientName}
          Amount: ${amountPKR} PKR
          Bank: ${bankResolved}
          Note: ${transferNote || "No note provided"}
          IBAN Validity: ${ibanValid ? "Valid Format" : "Invalid Format"}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    res.json({
      status: "success",
      result: {
        ibanValid,
        bankResolved,
        ...result
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: error.errors[0].message
      });
    }
    
    console.error("Groq Banking Error:", error);
    res.status(500).json({
      status: "error",
      code: "BANKING_ERROR",
      message: error.message || "Failed to validate transfer."
    });
  }
});

export default router;
