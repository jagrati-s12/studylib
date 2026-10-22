const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, title, date, time, description } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Schedule title is required' });
    }

    const sanitizedTitle = title.trim().slice(0, 255);
    const sanitizedDate = typeof date === 'string' ? date.trim().slice(0, 50) : '';
    const sanitizedTime = typeof time === 'string' ? time.trim().slice(0, 50) : '';
    const sanitizedDesc = typeof description === 'string' ? description.slice(0, 1000) : '';

    let schedule;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid schedule ID format' });
      }

      schedule = await Schedule.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        {
          title: sanitizedTitle,
          date: sanitizedDate,
          time: sanitizedTime,
          description: sanitizedDesc
        },
        { new: true, runValidators: true }
      );

      if (!schedule) {
        return res.status(404).json({ success: false, error: 'Schedule item not found or unauthorized' });
      }
    } else {
      schedule = await Schedule.create({
        userId: req.user.id,
        title: sanitizedTitle,
        date: sanitizedDate,
        time: sanitizedTime,
        description: sanitizedDesc
      });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid schedule ID format' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.user.id });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule item not found or unauthorized' });
    }
    await schedule.deleteOne();
    res.json({ success: true, message: 'Schedule item removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
