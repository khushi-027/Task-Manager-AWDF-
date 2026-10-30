import { callGroqAPI } from '../services/groqService.js';

// In-memory rate limiting map: key = `${userId}:${normalizedTitle}`, value = timestamp
const rateLimitCache = new Map();

// Clean up entries older than 5 minutes periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitCache.entries()) {
    if (now - timestamp > 300000) {
      rateLimitCache.delete(key);
    }
  }
}, 60000);

// @desc    Generate AI-powered task description
// @route   POST /api/ai/generate-description
// @access  Private
export const generateTaskDescription = async (req, res) => {
  try {
    const { title, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A task title is required to generate an AI description.',
      });
    }

    const userId = req.user?._id || 'anon';
    const normalizedTitle = title.trim().toLowerCase();
    const rateKey = `${userId}:${normalizedTitle}`;
    const lastRequestTime = rateLimitCache.get(rateKey);
    const now = Date.now();

    // Enforce 1 generation per task title per user per minute
    if (lastRequestTime && now - lastRequestTime < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastRequestTime)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Rate limit: Please wait ${waitSeconds}s before re-generating description for this task title.`,
      });
    }

    rateLimitCache.set(rateKey, now);

    const result = await callGroqAPI(title.trim(), priority || 'Medium');

    return res.json({
      success: true,
      description: result.description,
      provider: result.provider,
      model: result.model,
      disclaimer: 'AI-generated suggestion. Review and edit before saving.',
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate task description. You can still write one manually.',
      error: error.message,
    });
  }
};
