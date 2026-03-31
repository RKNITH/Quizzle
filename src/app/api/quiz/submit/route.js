import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Performance from '@/models/Performance';
import { calculateLevel, checkBadges } from '@/lib/gamification';

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { topic, questions, userAnswers, totalTime } = body;

    await connectDB();

    const score = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((score / questions.length) * 100);
    const totalXP = userAnswers.reduce((sum, a) => sum + (a.xpEarned || 0), 0);

    // Save quiz attempt
    const attempt = await QuizAttempt.create({
      userId: session.user.id,
      topic,
      questions,
      userAnswers,
      score,
      totalQuestions: questions.length,
      totalTime,
      xpEarned: totalXP,
      accuracy,
      completed: true,
    });

    // Update user XP and level
    const user = await User.findById(session.user.id);
    user.xp = (user.xp || 0) + totalXP;
    user.level = calculateLevel(user.xp);

    // Update performance stats
    const avgTime = userAnswers.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / userAnswers.length;

    let perf = await Performance.findOne({ userId: session.user.id, topic });
    if (!perf) {
      perf = new Performance({ userId: session.user.id, topic, totalAttempts: 0, totalCorrect: 0, totalResponseTime: 0 });
    }
    perf.totalAttempts += questions.length;
    perf.totalCorrect += score;
    perf.accuracy = Math.round((perf.totalCorrect / perf.totalAttempts) * 100);
    perf.totalResponseTime = (perf.totalResponseTime || 0) + (avgTime * questions.length);
    perf.avgResponseTime = Math.round(perf.totalResponseTime / perf.totalAttempts);
    perf.lastUpdated = new Date();
    await perf.save();

    // Check for new badges
    const newBadges = checkBadges(user, attempt, perf);
    if (newBadges.length > 0) {
      user.badges = [...(user.badges || []), ...newBadges];
    }
    await user.save();

    return NextResponse.json({
      attemptId: attempt._id.toString(),
      score,
      accuracy,
      xpEarned: totalXP,
      newBadges,
      newLevel: user.level,
      totalXP: user.xp,
    });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
