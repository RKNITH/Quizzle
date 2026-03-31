import mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  startDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    difficulty: String,
    topic: String,
  }],
  userAnswers: [{
    answer: String,
    isCorrect: Boolean,
    timeTaken: Number,
    xpEarned: Number,
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const QuizAttempt = mongoose.models?.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
export default QuizAttempt;
