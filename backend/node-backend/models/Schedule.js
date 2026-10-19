const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
