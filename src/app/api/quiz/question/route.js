import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateMathQuestion } from '@/lib/gemini';
import { z } from 'zod';

const schema = z.object({
  topic: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  usedQuestions: z.array(z.string()).optional(),
});

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { topic, difficulty, usedQuestions } = schema.parse(body);

    const question = await generateMathQuestion(topic, difficulty, usedQuestions || []);
    return NextResponse.json(question);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Quiz question error:', err);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
