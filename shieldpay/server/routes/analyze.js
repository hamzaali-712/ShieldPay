import express from 'express';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { z } from 'zod';

const router = express.Router();

const contentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  contentType: z.enum(["sms", "whatsapp", "url", "email", "other"]),
  sessionId: z.string().optional()
});

router.post('/content', async (req, res) => {
  try {
    const validated = contentSchema.parse(req.body);
    const { content, contentType } = validated;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const start = Date.now();
    
    // Call Groq with Llama 3
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this ${contentType} content: ${content}` }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const processingMs = Date.now() - start;

    res.json({
      status: "success",
      result,
      processingMs
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: error.errors[0].message
      });
    }
    
    console.error("Groq Analysis Error:", error);
    res.status(500).json({
      status: "error",
      code: "AI_ERROR",
      message: error.message || "Failed to analyze content with AI."
    });
  }
});

export default router;
