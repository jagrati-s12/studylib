const express = require('express');
const Schedule = require('../models/Schedule');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, title, date, time, description } = req.body;
    let schedule;

    if (id && id.length === 24) {
      schedule = await Schedule.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { title, date, time, description },
        { new: true, upsert: true }
      );
    } else {
      schedule = await Schedule.create({
        userId: req.user.id,
        title,
        date,
        time,
        description: description || ''
      });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.user.id });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule item not found' });
    }
    await schedule.deleteOne();
    res.json({ success: true, message: 'Schedule item removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
