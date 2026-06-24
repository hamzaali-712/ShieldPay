import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

const BOT_SYSTEM_PROMPT = `
You are ShieldBot, the friendly AI guardian of ShieldPay. Your mission is to help Pakistani university students stay safe from scams and manage their finances better.
Keep your answers concise, helpful, and use a friendly, trust-building tone. 
If someone asks about a specific message, tell them to use the "Scan Content" tab. 
If they ask about a bank transfer, tell them to use the "Validate Transfer" tab.
Use Pakistani context where relevant.
`;

router.post('/message', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
      return res.status(400).json({
        status: "error",
        message: "I'm currently offline (API key not set). Please tell my owner to add a Groq key!"
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: BOT_SYSTEM_PROMPT },
        ...(history || []),
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    res.json({
      status: "success",
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      status: "error",
      message: "I had a bit of a glitch. Try again!"
    });
  }
});

export default router;
