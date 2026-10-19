const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#3b82f6' },
  icon: { type: String, default: 'BookOpen' },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
