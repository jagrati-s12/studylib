const mongoose = require('mongoose');

const pomodoroStatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  sessionsCompleted: { type: Number, default: 0 },
  totalStudyMinutes: { type: Number, default: 0 }
});

module.exports = mongoose.model('PomodoroStat', pomodoroStatSchema);
