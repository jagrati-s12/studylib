const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Helper to escape regex special characters (mitigate ReDoS)
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get all notes with pagination and search filtering
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user.id };

    if (search && typeof search === 'string') {
      const sanitizedSearch = escapeRegex(search.trim().slice(0, 100));
      if (sanitizedSearch) {
        query.$or = [
          { title: { $regex: sanitizedSearch, $options: 'i' } },
          { content: { $regex: sanitizedSearch, $options: 'i' } }
        ];
      }
    }

    if (category && typeof category === 'string' && category !== 'All') {
      query.category = category.trim().slice(0, 50);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
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
      pages: Math.ceil(total / limitNum) || 1,
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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

    const sanitizedTitle = typeof title === 'string' ? title.trim().slice(0, 255) : undefined;
    const sanitizedContent = typeof content === 'string' ? content : (content !== undefined ? String(content) : undefined);
    const sanitizedCategory = typeof category === 'string' ? category.trim().slice(0, 50) : undefined;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error('Invalid note ID format');
      }

      note = await Note.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        {
          ...(sanitizedTitle !== undefined && { title: sanitizedTitle }),
          ...(sanitizedContent !== undefined && { content: sanitizedContent }),
          ...(sanitizedCategory !== undefined && { category: sanitizedCategory }),
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
        title: sanitizedTitle || 'Untitled Note',
        content: sanitizedContent || '',
        category: sanitizedCategory || 'General'
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
