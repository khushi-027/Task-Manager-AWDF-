import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

export const callGroqAPI = async (title, priority = 'Medium') => {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const systemPrompt = `You are a professional project coordinator. Write a concise, actionable, and structured task description for a task management system based on the provided title and priority.
Format should be 2-4 clear sentences or bullet points outlining:
1. Primary Objective
2. Key deliverable / acceptance criteria
Keep it professional, direct, and under 80 words. Do not include markdown codeblocks or preamble.`;

  const userPrompt = `Task Title: "${title}"\nPriority: ${priority}\nGenerate a crisp, actionable description:`;

  // 1. Try Groq API if key is configured
  if (groqApiKey && !groqApiKey.includes('PASTE_YOUR_GROQ_API_KEY_HERE')) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 200,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const generated = response.data?.choices?.[0]?.message?.content?.trim();
      if (generated) {
        return {
          description: generated,
          model: groqModel,
          provider: 'Groq Cloud',
        };
      }
    } catch (groqErr) {
      console.warn('[Groq API Warning]:', groqErr.response?.data || groqErr.message);
      // Fall through to fallback
    }
  }

  // 2. Try Gemini API if GEMINI_API_KEY is available in environment
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      const text = response.text?.trim();
      if (text) {
        return {
          description: text,
          model: 'gemini-2.5-flash',
          provider: 'Google Gemini',
        };
      }
    } catch (geminiErr) {
      console.warn('[Gemini Fallback Warning]:', geminiErr.message);
    }
  }

  // 3. Graceful offline template generator (guarantees manual workflow is never broken)
  const template = `Objective: Complete implementation and review for "${title}".\nKey Deliverables:\n• Finalize implementation and conduct functional testing.\n• Verify alignment with project milestones and mark status upon verification.`;

  return {
    description: template,
    model: 'built-in-template',
    provider: 'Local Assistant (Groq API Key not yet configured in .env)',
  };
};

export default callGroqAPI;
