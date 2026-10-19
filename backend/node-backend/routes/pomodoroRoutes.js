const express = require('express');
const PomodoroStat = require('../models/PomodoroStat');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    let stats = await PomodoroStat.findOne({ userId: req.user.id }).sort({ _id: -1 });
    if (!stats) {
      stats = await PomodoroStat.create({
        userId: req.user.id,
        sessionsCompleted: 4,
        totalStudyMinutes: 100
      });
    }
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stats', async (req, res) => {
  try {
    const { sessionsCompleted, totalStudyMinutes } = req.body;
    const stats = await PomodoroStat.create({
      userId: req.user.id,
      sessionsCompleted: sessionsCompleted || 0,
      totalStudyMinutes: totalStudyMinutes || 0
    });
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
