const express = require('express');
const PomodoroStat = require('../models/PomodoroStat');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', async (req, res, next) => {
  try {
    let stats = await PomodoroStat.findOne({ userId: req.user.id }).sort({ _id: -1 });
    if (!stats) {
      stats = {
        userId: req.user.id,
        sessionsCompleted: 0,
        totalStudyMinutes: 0
      };
    }
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
});

router.post('/stats', async (req, res, next) => {
  try {
    const { sessionsCompleted, totalStudyMinutes } = req.body;
    const sanitizedSessions = Math.min(1000, Math.max(0, parseInt(sessionsCompleted, 10) || 0));
    const sanitizedMinutes = Math.min(100000, Math.max(0, parseInt(totalStudyMinutes, 10) || 0));

    const stats = await PomodoroStat.create({
      userId: req.user.id,
      sessionsCompleted: sanitizedSessions,
      totalStudyMinutes: sanitizedMinutes
    });
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
