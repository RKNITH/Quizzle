import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = process.env.MODEL_NAME || 'gemini-flash-latest';
const MAX_OUTPUT_TOKENS = parseInt(process.env.MAX_OUTPUT_TOKENS) || 8192;

const MATH_TOPICS = [
  'Arithmetic', 'Algebra', 'Geometry', 'Mensuration',
  'Number Systems', 'Percentages', 'Ratio & Proportion',
  'Time & Work', 'Time, Speed & Distance', 'Profit & Loss',
  'Simple & Compound Interest', 'Basic Trigonometry', 'Data Interpretation',
];

const DIFFICULTY_DESCRIPTIONS = {
  easy: 'basic, straightforward problems suitable for beginners, Class 5-7 level',
  medium: 'moderate complexity problems, Class 8-9 level with 2-3 steps',
  hard: 'challenging, multi-step problems, Class 10 level competitive exam style',
};

export async function generateMathQuestion(topic, difficulty, usedQuestions = []) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME, maxOutputTokens: MAX_OUTPUT_TOKENS });

  const usedQuestionsStr = usedQuestions.length > 0
    ? `Do NOT repeat these questions or similar ones: ${usedQuestions.slice(-5).join(' | ')}`
    : '';

  const prompt = `Generate a unique multiple choice question for competitive mathematics exam preparation.

Topic: ${topic}
Difficulty: ${difficulty} (${DIFFICULTY_DESCRIPTIONS[difficulty]})
${usedQuestionsStr}

Requirements:
- The question must be clearly worded and unambiguous
- Provide exactly 4 options labeled A, B, C, D
- Only one option should be correct
- Include a clear step-by-step explanation
- Make the question original and engaging

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "question": "The complete question text here",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "correctAnswer": "A",
  "explanation": "Step-by-step solution explanation here",
  "difficulty": "${difficulty}",
  "topic": "${topic}"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response - remove markdown code blocks if present
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.question || !parsed.options || !parsed.correctAnswer || !parsed.explanation) {
      throw new Error('Invalid question structure from Gemini');
    }

    // Normalize correctAnswer to just the letter
    parsed.correctAnswer = parsed.correctAnswer.charAt(0).toUpperCase();

    return parsed;
  } catch (error) {
    console.error('Gemini error:', error);
    // Fallback question
    return getFallbackQuestion(topic, difficulty);
  }
}

function getFallbackQuestion(topic, difficulty) {
  const fallbacks = {
    Arithmetic: {
      question: 'What is 15% of 240?',
      options: ['A. 32', 'B. 36', 'C. 38', 'D. 40'],
      correctAnswer: 'B',
      explanation: '15% of 240 = (15/100) × 240 = 0.15 × 240 = 36',
      difficulty,
      topic,
    },
    Algebra: {
      question: 'If 2x + 5 = 17, what is the value of x?',
      options: ['A. 5', 'B. 6', 'C. 7', 'D. 8'],
      correctAnswer: 'B',
      explanation: '2x + 5 = 17 → 2x = 12 → x = 6',
      difficulty,
      topic,
    },
  };
  return fallbacks[topic] || fallbacks.Arithmetic;
}

export { MATH_TOPICS };
