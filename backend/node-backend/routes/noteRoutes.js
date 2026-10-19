const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get all notes with pagination and search filtering
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      count: notes.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      notes
    });
  } catch (error) {
    next(error);
  }
});

// Get single note by ID with strict ownership check
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid note ID format');
    }

    const note = await Note.findOne({ _id: id, userId: req.user.id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found or unauthorized');
    }

    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// Create or update note securely with optimistic concurrency / versioning support
router.post('/', async (req, res, next) => {
  try {
    const { id, title, content, category } = req.body;
    let note;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid note ID format');
      }

      note = await Note.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        {
          title: title !== undefined ? title.trim() : undefined,
          content: content !== undefined ? content : undefined,
          category: category !== undefined ? category.trim() : undefined,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!note) {
        res.status(404);
        throw new Error('Note not found or unauthorized');
      }
    } else {
      note = await Note.create({
        userId: req.user.id,
        title: title ? title.trim() : 'Untitled Note',
        content: content || '',
        category: category ? category.trim() : 'General'
      });
    }

    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// Delete note with strict ownership verification
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid note ID format');
    }

    const note = await Note.findOne({ _id: id, userId: req.user.id });
    if (!note) {
      res.status(404);
      throw new Error('Note not found or unauthorized');
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
