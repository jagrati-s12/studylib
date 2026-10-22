const express = require('express');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, todos });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, text, completed, priority, dueDate } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Todo text is required' });
    }

    const sanitizedText = text.trim().slice(0, 500);
    const validPriorities = ['low', 'medium', 'high'];
    const sanitizedPriority = validPriorities.includes(priority) ? priority : 'medium';
    const sanitizedDueDate = typeof dueDate === 'string' ? dueDate.trim().slice(0, 50) : '';

    let todo;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Invalid todo ID format' });
      }

      todo = await Todo.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        {
          text: sanitizedText,
          completed: Boolean(completed),
          priority: sanitizedPriority,
          dueDate: sanitizedDueDate
        },
        { new: true, runValidators: true }
      );

      if (!todo) {
        return res.status(404).json({ success: false, error: 'Todo not found or unauthorized' });
      }
    } else {
      todo = await Todo.create({
        userId: req.user.id,
        text: sanitizedText,
        completed: Boolean(completed),
        priority: sanitizedPriority,
        dueDate: sanitizedDueDate
      });
    }

    res.json({ success: true, todo });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid todo ID format' });
    }

    const todo = await Todo.findOne({ _id: id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found or unauthorized' });
    }
    await todo.deleteOne();
    res.json({ success: true, message: 'Todo removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
