const express = require('express');
const Todo = require('../models/Todo');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.json({ success: true, todos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, text, completed, priority, dueDate } = req.body;
    let todo;

    if (id && id.length === 24) {
      todo = await Todo.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { text, completed, priority, dueDate },
        { new: true, upsert: true }
      );
    } else {
      todo = await Todo.create({
        userId: req.user.id,
        text,
        completed: completed || false,
        priority: priority || 'medium',
        dueDate: dueDate || ''
      });
    }

    res.json({ success: true, todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    await todo.deleteOne();
    res.json({ success: true, message: 'Todo removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
