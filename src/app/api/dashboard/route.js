import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Performance from '@/models/Performance';
import { xpForNextLevel, xpForCurrentLevel } from '@/lib/gamification';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const allAttempts = await QuizAttempt.find({ userId: user._id, completed: true }).lean();
    const totalQuestions = allAttempts.reduce((s, a) => s + a.totalQuestions, 0);
    const totalCorrect = allAttempts.reduce((s, a) => s + a.score, 0);
    const totalTime = allAttempts.reduce((s, a) => s + a.totalTime, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const avgTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

    const performance = await Performance.find({ userId: user._id }).lean();
    const weakTopics = performance.filter(p => p.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);

    const recentAttempts = await QuizAttempt.find({ userId: user._id, completed: true })
      .sort({ createdAt: -1 }).limit(5).lean();

    const currentLevelXP = xpForCurrentLevel(user.level);
    const nextLevelXP = xpForNextLevel(user.level);
    const xpProgress = nextLevelXP > currentLevelXP
      ? Math.round(((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
      : 100;

    return NextResponse.json({
      user: { ...user, _id: user._id.toString() },
      stats: {
        totalQuizzes: allAttempts.length,
        overallAccuracy,
        avgResponseTime: avgTime,
        totalQuestionsAnswered: totalQuestions,
        xpProgress,
        currentLevelXP,
        nextLevelXP,
      },
      weakTopics: weakTopics.slice(0, 3).map(p => ({ ...p, _id: p._id.toString(), userId: p.userId.toString() })),
      recentAttempts: recentAttempts.map(a => ({ ...a, _id: a._id.toString(), userId: a.userId.toString() })),
      performance: performance.map(p => ({ ...p, _id: p._id.toString(), userId: p.userId.toString() })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
