import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    await connectDB();

    const users = await User.find({})
      .select('name xp level streak badges createdAt')
      .sort({ xp: -1, streak: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    // Get accuracy for each user
    const usersWithStats = await Promise.all(users.map(async (user, idx) => {
      const attempts = await QuizAttempt.find({ userId: user._id, completed: true })
        .select('accuracy score totalQuestions');
      const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      return {
        ...user,
        _id: user._id.toString(),
        rank: skip + idx + 1,
        accuracy,
        quizzesTaken: attempts.length,
      };
    }));

    return NextResponse.json({
      users: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
