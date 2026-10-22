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

// Helper to format topic for frontend compatibility
const formatTopic = (topic, materialCount = 0) => {
  const obj = topic.toObject ? topic.toObject() : topic;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    subject_id: obj.subjectId ? obj.subjectId.toString() : obj.subject_id,
    serial_number: obj.serialNumber ?? obj.serial_number,
    parent_topic_id: obj.parentTopicId ? obj.parentTopicId.toString() : (obj.parent_topic_id ?? null),
    material_count: materialCount,
    updated_at: obj.updatedAt || obj.updated_at,
    created_at: obj.createdAt || obj.created_at,
    due_date: obj.dueDate || obj.due_date
  };
};

// GET all topics for user
router.get('/', async (req, res, next) => {
  try {
    const topics = await Topic.find({ userId: req.user.id }).sort({ serialNumber: 1, createdAt: 1 });
    
    // Aggregate material count per topic
    const topicIds = topics.map(t => t._id);
    const counts = await Material.aggregate([
      { $match: { topicId: { $in: topicIds }, userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const formatted = topics.map(t => formatTopic(t, countMap[t._id.toString()] || 0));
    res.json({ success: true, topics: formatted });
  } catch (error) {
    next(error);
  }
});

// GET topics by subjectId
router.get('/subject/:subjectId', async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.json({ success: true, topics: [] });
    }

    const topics = await Topic.find({ 
      subjectId: new mongoose.Types.ObjectId(subjectId), 
      userId: req.user.id 
    }).sort({ serialNumber: 1, createdAt: 1 });

    const topicIds = topics.map(t => t._id);
    const counts = await Material.aggregate([
      { $match: { topicId: { $in: topicIds }, userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const formatted = topics.map(t => formatTopic(t, countMap[t._id.toString()] || 0));
    res.json({ success: true, topics: formatted });
  } catch (error) {
    next(error);
  }
});

// GET single topic
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    }

    const topic = await Topic.findOne({ _id: id, userId: req.user.id });
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    const count = await Material.countDocuments({ topicId: topic._id, userId: req.user.id });
    res.json({ success: true, topic: formatTopic(topic, count) });
  } catch (error) {
    next(error);
  }
});

// POST create topic
router.post('/', async (req, res, next) => {
  try {
    const {
      subjectId,
      subject_id,
      title,
      serialNumber,
      serial_number,
      status,
      progress,
      checklist,
      tags,
      note,
      dueDate,
      due_date,
      parentTopicId,
      parent_topic_id
    } = req.body;

    const actualSubjectId = subjectId || subject_id;
    if (!actualSubjectId || !mongoose.Types.ObjectId.isValid(actualSubjectId)) {
      return res.status(400).json({ success: false, error: 'Valid subject ID is required' });
    }

    // Verify subject belongs to authenticated user (prevent BOLA/IDOR)
    const subject = await Subject.findOne({ _id: actualSubjectId, userId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found or unauthorized' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Topic title is required' });
    }

    let actualSerial = serialNumber !== undefined ? serialNumber : serial_number;
    if (actualSerial === undefined) {
      const highestTopic = await Topic.findOne({ subjectId: actualSubjectId, userId: req.user.id })
        .sort({ serialNumber: -1 });
      actualSerial = highestTopic ? (highestTopic.serialNumber + 1) : 1;
    }

    const rawParentId = parentTopicId || parent_topic_id;
    let validatedParentId = null;
    if (rawParentId && mongoose.Types.ObjectId.isValid(rawParentId)) {
      const parentTopic = await Topic.findOne({ _id: rawParentId, userId: req.user.id });
      if (parentTopic) {
        validatedParentId = parentTopic._id;
      }
    }

    const topic = await Topic.create({
      userId: req.user.id,
      subjectId: actualSubjectId,
      title: title.trim().slice(0, 255),
      serialNumber: Math.max(0, parseInt(actualSerial, 10) || 1),
      status: typeof status === 'string' ? status.slice(0, 50) : 'not_started',
      progress: progress !== undefined ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : (status === 'completed' || status === 'done' ? 100 : 0),
      checklist: Array.isArray(checklist) ? checklist.slice(0, 100) : [],
      tags: Array.isArray(tags) ? tags.map(t => String(t).slice(0, 50)).slice(0, 20) : [],
      note: typeof note === 'string' ? note.slice(0, 10000) : '',
      dueDate: dueDate || due_date || null,
      parentTopicId: validatedParentId
    });

    res.status(201).json({ success: true, topic: formatTopic(topic, 0) });
  } catch (error) {
    next(error);
  }
});

// PUT update topic
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    }

    const {
      title,
      serialNumber,
      serial_number,
      status,
      progress,
      checklist,
      tags,
      note,
      dueDate,
      due_date,
      parentTopicId,
      parent_topic_id
    } = req.body;

    const updateData = {};
    if (title !== undefined && typeof title === 'string') updateData.title = title.trim().slice(0, 255);
    if (serialNumber !== undefined || serial_number !== undefined) {
      const s = serialNumber !== undefined ? serialNumber : serial_number;
      updateData.serialNumber = Math.max(0, parseInt(s, 10) || 1);
    }
    if (status !== undefined && typeof status === 'string') updateData.status = status.slice(0, 50);
    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    }
    if (checklist !== undefined && Array.isArray(checklist)) updateData.checklist = checklist.slice(0, 100);
    if (tags !== undefined && Array.isArray(tags)) updateData.tags = tags.map(t => String(t).slice(0, 50)).slice(0, 20);
    if (note !== undefined && typeof note === 'string') updateData.note = note.slice(0, 10000);
    if (dueDate !== undefined || due_date !== undefined) {
      updateData.dueDate = dueDate !== undefined ? dueDate : due_date;
    }
    if (parentTopicId !== undefined || parent_topic_id !== undefined) {
      const pid = parentTopicId !== undefined ? parentTopicId : parent_topic_id;
      if (pid && mongoose.Types.ObjectId.isValid(pid) && String(pid) !== String(id)) {
        const parentTopic = await Topic.findOne({ _id: pid, userId: req.user.id });
        updateData.parentTopicId = parentTopic ? parentTopic._id : null;
      } else {
        updateData.parentTopicId = null;
      }
    }

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found or unauthorized' });
    }

    const count = await Material.countDocuments({ topicId: topic._id, userId: req.user.id });
    res.json({ success: true, topic: formatTopic(topic, count) });
  } catch (error) {
    next(error);
  }
});

// DELETE topic and associated study items
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    }

    const topic = await Topic.findOne({ _id: id, userId: req.user.id });
    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    await Promise.all([
      topic.deleteOne(),
      Material.deleteMany({ topicId: topic._id }),
      Folder.deleteMany({ topicId: topic._id }),
      DigitalNote.deleteMany({ topicId: topic._id }),
      WorkspaceSettings.deleteMany({ topicId: topic._id })
    ]);

    res.json({ success: true, message: 'Topic removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
