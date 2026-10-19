const mongoose = require('mongoose');

const workspaceSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  layout: { 
    type: String, 
    enum: ['single', 'split-horizontal', 'split-vertical'], 
    default: 'single' 
  },
  leftMaterialId: { type: String, default: null },
  rightMaterialId: { type: String, default: null },
  leftPage: { type: Number, default: 1 },
  rightPage: { type: Number, default: 1 },
  leftZoom: { type: Number, default: 100 },
  rightZoom: { type: Number, default: 100 }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkspaceSettings', workspaceSettingsSchema);
