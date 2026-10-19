const express = require('express');
const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const DigitalNote = require('../models/DigitalNote');
const WorkspaceSettings = require('../models/WorkspaceSettings');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// --------------------- FOLDERS ---------------------

// GET folders for topic
router.get('/folders/:topicId', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.json({ success: true, folders: [] });
    }

    let folders = await Folder.find({
      topicId: new mongoose.Types.ObjectId(topicId),
      userId: req.user.id
    }).sort({ createdAt: 1 });

    // If no folders exist yet, auto-create default folders for the topic
    if (folders.length === 0) {
      const defaultNames = ['Lecture Slides', 'Research Papers', 'Cheat Sheets'];
      const created = await Promise.all(
        defaultNames.map(name =>
          Folder.create({
            userId: req.user.id,
            topicId: new mongoose.Types.ObjectId(topicId),
            name
          })
        )
      );
      folders = created;
    }

    const formatted = folders.map(f => {
      const obj = f.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        topic_id: obj.topicId.toString(),
        parent_folder_id: obj.parentFolderId ? obj.parentFolderId.toString() : null
      };
    });

    res.json({ success: true, folders: formatted });
  } catch (error) {
    next(error);
  }
});

// POST create folder
router.post('/folders', async (req, res, next) => {
  try {
    const { topicId, name, parentFolderId } = req.body;
    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, error: 'Valid topic ID is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }

    const folder = await Folder.create({
      userId: req.user.id,
      topicId: new mongoose.Types.ObjectId(topicId),
      parentFolderId: parentFolderId && mongoose.Types.ObjectId.isValid(parentFolderId) ? new mongoose.Types.ObjectId(parentFolderId) : null,
      name: name.trim()
    });

    const obj = folder.toObject();
    res.status(201).json({
      success: true,
      folder: {
        ...obj,
        id: obj._id.toString(),
        topic_id: obj.topicId.toString(),
        parent_folder_id: obj.parentFolderId ? obj.parentFolderId.toString() : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// --------------------- DIGITAL NOTES ---------------------

// GET digital note for topic
router.get('/digital-notes/:topicId', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.json({ success: true, note: null, notes: [] });
    }

    const note = await DigitalNote.findOne({
      topicId: new mongoose.Types.ObjectId(topicId),
      userId: req.user.id
    });

    if (!note) {
      return res.json({ success: true, note: null, notes: [] });
    }

    const obj = note.toObject();
    const formatted = {
      ...obj,
      id: obj._id.toString(),
      topic_id: obj.topicId.toString()
    };

    res.json({ success: true, note: formatted, notes: [formatted] });
  } catch (error) {
    next(error);
  }
});

// POST save digital note
router.post('/digital-notes', async (req, res, next) => {
  try {
    const { topicId, content, title } = req.body;
    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, error: 'Valid topic ID is required' });
    }

    const note = await DigitalNote.findOneAndUpdate(
      { topicId: new mongoose.Types.ObjectId(topicId), userId: req.user.id },
      {
        content: content !== undefined ? content : '',
        title: title ? title.trim() : 'Digital Note'
      },
      { new: true, upsert: true, runValidators: true }
    );

    const obj = note.toObject();
    res.json({
      success: true,
      note: {
        ...obj,
        id: obj._id.toString(),
        topic_id: obj.topicId.toString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// --------------------- WORKSPACE SETTINGS ---------------------

// GET workspace settings for topic
router.get('/workspace/:topicId', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.json({ success: true, settings: null });
    }

    const ws = await WorkspaceSettings.findOne({
      topicId: new mongoose.Types.ObjectId(topicId),
      userId: req.user.id
    });

    if (!ws) {
      return res.json({ success: true, settings: null });
    }

    const obj = ws.toObject();
    res.json({
      success: true,
      settings: {
        ...obj,
        id: obj._id.toString(),
        topic_id: obj.topicId.toString(),
        layout: obj.layout,
        left_material_id: obj.leftMaterialId,
        right_material_id: obj.rightMaterialId,
        left_page: obj.leftPage,
        right_page: obj.rightPage,
        left_zoom: obj.leftZoom,
        right_zoom: obj.rightZoom
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST save workspace settings
router.post('/workspace', async (req, res, next) => {
  try {
    const {
      topicId,
      layout,
      left_material_id,
      right_material_id,
      leftMaterialId,
      rightMaterialId,
      left_page,
      right_page,
      leftPage,
      rightPage,
      left_zoom,
      right_zoom,
      leftZoom,
      rightZoom
    } = req.body;

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, error: 'Valid topic ID is required' });
    }

    const updateData = {};
    if (layout !== undefined) updateData.layout = layout;
    if (leftMaterialId !== undefined || left_material_id !== undefined) {
      updateData.leftMaterialId = leftMaterialId !== undefined ? leftMaterialId : left_material_id;
    }
    if (rightMaterialId !== undefined || right_material_id !== undefined) {
      updateData.rightMaterialId = rightMaterialId !== undefined ? rightMaterialId : right_material_id;
    }
    if (leftPage !== undefined || left_page !== undefined) {
      updateData.leftPage = leftPage !== undefined ? leftPage : left_page;
    }
    if (rightPage !== undefined || right_page !== undefined) {
      updateData.rightPage = rightPage !== undefined ? rightPage : right_page;
    }
    if (leftZoom !== undefined || left_zoom !== undefined) {
      updateData.leftZoom = leftZoom !== undefined ? leftZoom : left_zoom;
    }
    if (rightZoom !== undefined || right_zoom !== undefined) {
      updateData.rightZoom = rightZoom !== undefined ? rightZoom : right_zoom;
    }

    const ws = await WorkspaceSettings.findOneAndUpdate(
      { topicId: new mongoose.Types.ObjectId(topicId), userId: req.user.id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    const obj = ws.toObject();
    res.json({
      success: true,
      settings: {
        ...obj,
        id: obj._id.toString(),
        topic_id: obj.topicId.toString(),
        layout: obj.layout,
        left_material_id: obj.leftMaterialId,
        right_material_id: obj.rightMaterialId,
        left_page: obj.leftPage,
        right_page: obj.rightPage,
        left_zoom: obj.leftZoom,
        right_zoom: obj.rightZoom
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
