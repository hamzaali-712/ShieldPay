import { Anthropic } from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Init AI keys
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

let anthropic: Anthropic | null = null;
let groq: Groq | null = null;

if (ANTHROPIC_API_KEY) {
  try {
    anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    console.log('[AI] Anthropic Claude client initialized.');
  } catch (err: any) {
    console.error('[AI] Failed to init Anthropic client:', err.message);
  }
}

if (GROQ_API_KEY) {
  try {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    console.log('[AI] Groq client initialized.');
  } catch (err: any) {
    console.error('[AI] Failed to init Groq client:', err.message);
  }
}

/**
 * Executes a structured AI completions request.
 * Tries Anthropic first; falls back to Groq. Enforces JSON output and validates against a Zod schema.
 * Retries once if validation fails.
 */
export async function getStructuredAICompletion<T>(
  systemPrompt: string,
  userMessage: string,
  schema: z.ZodType<T>,
  modelOption: 'sonnet' | 'haiku' = 'sonnet'
): Promise<T> {
  let attempt = 1;
  let customUserMsg = userMessage;

  while (attempt <= 2) {
    try {
      let rawText = '';

      if (anthropic) {
        // Claude model selection
        const model = modelOption === 'sonnet' ? 'claude-3-5-sonnet-20241022' : 'claude-3-5-haiku-20241022';
        
        // Build payload
        const response = await anthropic.messages.create({
          model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: customUserMsg }],
        });

        // Claude content block response extraction
        if (response.content && response.content[0] && response.content[0].type === 'text') {
          rawText = response.content[0].text;
        } else {
          throw new Error('AI returned non-text content');
        }
      } else if (groq) {
        // Groq llama model fallback
        const model = modelOption === 'sonnet' ? 'llama-3.3-70b-versatile' : 'llama3-8b-8192';
        
        const response = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: customUserMsg }
          ],
          response_format: { type: 'json_object' }
        });

        rawText = response.choices[0].message.content || '';
      } else {
        throw new Error('No AI service provider (Anthropic or Groq) is configured in environment.');
      }

      // Clean up potential markdown formatting block wrapper (e.g. ```json ... ```)
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```')) {
        // Strip leading markdown
        cleanedText = cleanedText.replace(/^```(json)?\s*/gi, '');
        // Strip trailing markdown
        cleanedText = cleanedText.replace(/\s*```$/gi, '');
      }

      const parsed = JSON.parse(cleanedText);
      const validated = schema.parse(parsed);
      return validated;

    } catch (parseOrValidationError: any) {
      console.warn(`[AI] Attempt ${attempt} failed validation:`, parseOrValidationError.message);
      
      if (attempt === 1) {
        attempt++;
        // Add repair instructions to user prompt for the retry attempt
        customUserMsg = `${userMessage}\n\n[REPAIR ERROR] Your prior response of JSON caused a validation/parsing error: ${parseOrValidationError.message}. Please correct your output to fit the target schema perfectly without code markdown wrap blocks. JSON structure only.`;
      } else {
        throw new Error(`AI generated response failed validation on second attempt: ${parseOrValidationError.message}`);
      }
    }
  }
  
  throw new Error('AI execution loop failure.');
}
