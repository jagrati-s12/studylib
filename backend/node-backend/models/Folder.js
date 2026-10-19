const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  name: { type: String, required: true, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Folder', folderSchema);
