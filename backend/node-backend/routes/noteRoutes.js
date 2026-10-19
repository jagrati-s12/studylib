const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update note
router.post('/', async (req, res) => {
  try {
    const { id, title, content, category } = req.body;
    let note;

    if (id) {
      note = await Note.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { title, content, category, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
    } else {
      note = await Note.create({
        userId: req.user.id,
        title: title || 'Untitled Note',
        content: content || '',
        category: category || 'General'
      });
    }

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    await note.deleteOne();
    res.json({ success: true, message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
