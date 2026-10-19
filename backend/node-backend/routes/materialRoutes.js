const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for security
const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.webp', '.mp4'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported. Supported types: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});

router.use(protect);

// Helper to format material
const formatMaterial = (mat) => {
  const obj = mat.toObject ? mat.toObject() : mat;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    topic_id: obj.topicId ? obj.topicId.toString() : obj.topic_id,
    folder_id: obj.folderId ? obj.folderId.toString() : (obj.folder_id ?? null),
    material_type: obj.materialType || obj.material_type,
    storage_key: obj.storageKey || obj.storage_key,
    file_size_bytes: obj.fileSizeBytes || obj.file_size_bytes,
    mime_type: obj.mimeType || obj.mime_type,
    created_at: obj.createdAt || obj.created_at,
    updated_at: obj.updatedAt || obj.updated_at
  };
};

// GET materials for a topic
router.get('/topic/:topicId', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.json({ success: true, materials: [] });
    }

    const materials = await Material.find({
      topicId: new mongoose.Types.ObjectId(topicId),
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({ success: true, materials: materials.map(formatMaterial) });
  } catch (error) {
    next(error);
  }
});

// POST upload material
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const { topicId, folderId, title } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      // Remove temporary uploaded file if topicId invalid
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, error: 'Valid topic ID is required' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    let materialType = 'other';
    if (ext === 'pdf') materialType = 'pdf';
    else if (['doc', 'docx', 'ppt', 'pptx'].includes(ext)) materialType = 'doc';
    else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) materialType = 'image';
    else if (['mp4', 'webm'].includes(ext)) materialType = 'video';

    const material = await Material.create({
      userId: req.user.id,
      topicId: new mongoose.Types.ObjectId(topicId),
      folderId: folderId && mongoose.Types.ObjectId.isValid(folderId) ? new mongoose.Types.ObjectId(folderId) : null,
      materialType,
      title: title || req.file.originalname,
      storageKey: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size
    });

    res.status(201).json({ success: true, material: formatMaterial(material) });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
});

// DELETE material
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid material ID' });
    }

    const material = await Material.findOne({ _id: id, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Attempt to unlink physical file
    const filePath = path.join(uploadDir, material.storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }

    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
