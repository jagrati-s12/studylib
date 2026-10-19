const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:5001';

// Timeout and retry configuration for robust AI microservice communication
const AI_TIMEOUT_MS = 15000;

router.post('/chat', async (req, res, next) => {
  try {
    const { prompt, notesContext } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400);
      throw new Error('Valid prompt string is required');
    }

    // Sanitize and bound payload size
    const sanitizedPrompt = prompt.trim().substring(0, 4000);
    const sanitizedContext = Array.isArray(notesContext)
      ? notesContext.slice(0, 20).map(n => ({
          title: String(n.title || '').substring(0, 200),
          content: String(n.content || '').substring(0, 1000)
        }))
      : [];

    let attempt = 0;
    let aiResponse = null;
    let lastError = null;

    while (attempt < 2) {
      attempt++;
      try {
        aiResponse = await axios.post(
          `${PYTHON_AI_URL}/api/ai/chat`,
          { prompt: sanitizedPrompt, notesContext: sanitizedContext },
          { timeout: AI_TIMEOUT_MS }
        );
        break;
      } catch (err) {
        lastError = err;
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          // Client error from Python service, do not retry
          break;
        }
      }
    }

    if (!aiResponse) {
      throw new Error(lastError ? lastError.message : 'AI microservice unreachable');
    }

    res.json(aiResponse.data);
  } catch (error) {
    next(error);
  }
});

router.post('/analytics-insights', async (req, res, next) => {
  try {
    const { stats } = req.body;
    const sanitizedStats = stats && typeof stats === 'object' ? stats : {};

    const response = await axios.post(
      `${PYTHON_AI_URL}/api/ai/analytics-insights`,
      { stats: sanitizedStats },
      { timeout: AI_TIMEOUT_MS }
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
