import mongoose from 'mongoose';

const PerformanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  totalAttempts: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  avgResponseTime: { type: Number, default: 0 },
  totalResponseTime: { type: Number, default: 0 },
  weakAreas: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

PerformanceSchema.index({ userId: 1, topic: 1 }, { unique: true });

const Performance = mongoose.models?.Performance || mongoose.model('Performance', PerformanceSchema);
export default Performance;
