import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Performance from '@/models/Performance';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const attempts = await QuizAttempt.find({ userId: user._id, completed: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const allAttempts = await QuizAttempt.find({ userId: user._id, completed: true }).lean();
    const totalQuestions = allAttempts.reduce((s, a) => s + a.totalQuestions, 0);
    const totalCorrect = allAttempts.reduce((s, a) => s + a.score, 0);
    const totalTime = allAttempts.reduce((s, a) => s + a.totalTime, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const avgTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

    const performance = await Performance.find({ userId: user._id }).lean();
    const weakTopics = performance
      .filter(p => p.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return NextResponse.json({
      user: { ...user, _id: user._id.toString() },
      stats: {
        totalQuizzes: allAttempts.length,
        overallAccuracy,
        avgResponseTime: avgTime,
        totalQuestionsAnswered: totalQuestions,
      },
      recentAttempts: attempts.map(a => ({ ...a, _id: a._id.toString(), userId: a.userId.toString() })),
      performance: performance.map(p => ({ ...p, _id: p._id.toString(), userId: p.userId.toString() })),
      weakTopics: weakTopics.map(p => ({ ...p, _id: p._id.toString(), userId: p.userId.toString() })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name } = body;
    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { ...(name && { name }) },
      { new: true }
    ).lean();
    return NextResponse.json({ user: { ...user, _id: user._id.toString() } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
