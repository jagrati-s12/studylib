const express = require('express');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Material = require('../models/Material');
const Folder = require('../models/Folder');
const DigitalNote = require('../models/DigitalNote');
const WorkspaceSettings = require('../models/WorkspaceSettings');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Helper to format subject for frontend compatibility
const formatSubject = (subject, topicCount = 0) => {
  const obj = subject.toObject ? subject.toObject() : subject;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    user_id: obj.userId,
    topic_count: topicCount,
    sort_order: obj.sortOrder ?? 0,
    created_at: obj.createdAt,
    updated_at: obj.updatedAt
  };
};

// GET all subjects for current user
router.get('/', async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ sortOrder: 1, createdAt: 1 });
    
    // Count topics for each subject
    const subjectIds = subjects.map(s => s._id);
    const counts = await Topic.aggregate([
      { $match: { subjectId: { $in: subjectIds }, userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$subjectId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const formatted = subjects.map(s => formatSubject(s, countMap[s._id.toString()] || 0));
    res.json({ success: true, subjects: formatted });
  } catch (error) {
    next(error);
  }
});

// GET single subject
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subject ID' });
    }

    const subject = await Subject.findOne({ _id: id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const count = await Topic.countDocuments({ subjectId: subject._id, userId: req.user.id });
    res.json({ success: true, subject: formatSubject(subject, count) });
  } catch (error) {
    next(error);
  }
});

// POST create subject
router.post('/', async (req, res, next) => {
  try {
    const { name, color, icon, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Subject name is required' });
    }

    const currentCount = await Subject.countDocuments({ userId: req.user.id });
    const subject = await Subject.create({
      userId: req.user.id,
      name: name.trim(),
      color: color || '#3b82f6',
      icon: icon || 'BookOpen',
      sortOrder: sortOrder !== undefined ? sortOrder : currentCount
    });

    res.status(201).json({ success: true, subject: formatSubject(subject, 0) });
  } catch (error) {
    next(error);
  }
});

// PUT update subject
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subject ID' });
    }

    const { name, color, icon, sortOrder } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const subject = await Subject.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const count = await Topic.countDocuments({ subjectId: subject._id, userId: req.user.id });
    res.json({ success: true, subject: formatSubject(subject, count) });
  } catch (error) {
    next(error);
  }
});

// DELETE subject and cascade delete topics & associated study data
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid subject ID' });
    }

    const subject = await Subject.findOne({ _id: id, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Find topics to cascade delete their materials/notes
    const topics = await Topic.find({ subjectId: subject._id, userId: req.user.id });
    const topicIds = topics.map(t => t._id);

    await Promise.all([
      subject.deleteOne(),
      Topic.deleteMany({ _id: { $in: topicIds } }),
      Material.deleteMany({ topicId: { $in: topicIds } }),
      Folder.deleteMany({ topicId: { $in: topicIds } }),
      DigitalNote.deleteMany({ topicId: { $in: topicIds } }),
      WorkspaceSettings.deleteMany({ topicId: { $in: topicIds } })
    ]);

    res.json({ success: true, message: 'Subject and associated contents removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
