const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
  materialType: { 
    type: String, 
    enum: ['pdf', 'doc', 'image', 'video', 'link', 'note', 'other'], 
    default: 'pdf' 
  },
  title: { type: String, required: true, trim: true },
  storageKey: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, default: '' },
  fileSizeBytes: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
