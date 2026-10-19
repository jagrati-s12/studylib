const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:5001';

router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/api/ai/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI microservice connection failed: ' + error.message });
  }
});

router.post('/analytics-insights', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/api/ai/analytics-insights`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI microservice connection failed: ' + error.message });
  }
});

module.exports = router;
