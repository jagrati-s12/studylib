const mongoose = require('mongoose');

const digitalNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  title: { type: String, default: 'Digital Note', trim: true },
  content: { type: mongoose.Schema.Types.Mixed, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('DigitalNote', digitalNoteSchema);
