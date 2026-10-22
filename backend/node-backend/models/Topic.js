const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  serialNumber: { type: Number, default: 1 },
  title: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['todo', 'not_started', 'in_progress', 'completed', 'done'],
    default: 'todo'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  checklist: [checklistItemSchema],
  tags: [{ type: String, trim: true }],
  note: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  parentTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);
