export const XP_CONFIG = {
  easy: { base: 10, speedBonus: 5, streakMultiplier: 1.5 },
  medium: { base: 20, speedBonus: 10, streakMultiplier: 1.5 },
  hard: { base: 35, speedBonus: 15, streakMultiplier: 2 },
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500,
  9500, 12000, 15000, 18500, 22500, 27000, 32000, 38000, 45000,
];

export function calculateLevel(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpForNextLevel(level) {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function xpForCurrentLevel(level) {
  return LEVEL_THRESHOLDS[level - 1] || 0;
}

export function calculateXP(difficulty, timeTaken, timeLimit, streak) {
  const config = XP_CONFIG[difficulty] || XP_CONFIG.easy;
  let xp = config.base;

  // Speed bonus: if answered in less than 50% of time
  const timeRatio = timeTaken / timeLimit;
  if (timeRatio < 0.5) {
    xp += config.speedBonus;
  } else if (timeRatio < 0.75) {
    xp += Math.floor(config.speedBonus / 2);
  }

  // Streak bonus
  if (streak >= 3) {
    xp = Math.floor(xp * config.streakMultiplier);
  }

  return xp;
}

export const BADGES = {
  SPEED_MASTER: {
    id: 'SPEED_MASTER',
    name: 'Speed Master',
    description: 'Answer 5 questions in under 5 seconds each',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
  },
  ACCURACY_KING: {
    id: 'ACCURACY_KING',
    name: 'Accuracy King',
    description: 'Maintain 90%+ accuracy over 20 questions',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
  },
  STREAK_LEGEND: {
    id: 'STREAK_LEGEND',
    name: 'Streak Legend',
    description: '7-day daily login streak',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
  },
  TOPIC_EXPERT: {
    id: 'TOPIC_EXPERT',
    name: 'Topic Expert',
    description: '100% accuracy on any topic',
    icon: '🏆',
    color: 'from-purple-500 to-pink-500',
  },
  FIRST_QUIZ: {
    id: 'FIRST_QUIZ',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🌟',
    color: 'from-green-500 to-teal-500',
  },
  HARD_MODE: {
    id: 'HARD_MODE',
    name: 'Hard Mode Hero',
    description: 'Answer 10 hard questions correctly',
    icon: '💎',
    color: 'from-indigo-500 to-purple-500',
  },
};

export function checkBadges(user, quizAttempt, performance) {
  const newBadges = [];
  const existingBadges = user.badges || [];

  // First quiz
  if (!existingBadges.includes('FIRST_QUIZ')) {
    newBadges.push('FIRST_QUIZ');
  }

  // Streak Legend
  if (user.streak >= 7 && !existingBadges.includes('STREAK_LEGEND')) {
    newBadges.push('STREAK_LEGEND');
  }

  // Accuracy King - check if overall accuracy >= 90% over 20+ questions
  if (performance && performance.totalAttempts >= 20) {
    const accuracy = (performance.totalCorrect / performance.totalAttempts) * 100;
    if (accuracy >= 90 && !existingBadges.includes('ACCURACY_KING')) {
      newBadges.push('ACCURACY_KING');
    }
  }

  // Speed Master - check if 5 answers in under 5 seconds
  if (quizAttempt) {
    const fastAnswers = quizAttempt.userAnswers?.filter(a => a.timeTaken < 5 && a.isCorrect) || [];
    if (fastAnswers.length >= 5 && !existingBadges.includes('SPEED_MASTER')) {
      newBadges.push('SPEED_MASTER');
    }

    // Hard Mode Hero
    const hardCorrect = quizAttempt.questions?.filter((q, i) =>
      q.difficulty === 'hard' && quizAttempt.userAnswers[i]?.isCorrect
    ) || [];
    if (hardCorrect.length >= 10 && !existingBadges.includes('HARD_MODE')) {
      newBadges.push('HARD_MODE');
    }
  }

  return newBadges;
}

export function adaptDifficulty(currentDifficulty, timeTaken, timeLimit, isCorrect) {
  const timeRatio = timeTaken / timeLimit;
  const levels = ['easy', 'medium', 'hard'];
  const currentIdx = levels.indexOf(currentDifficulty);

  if (isCorrect && timeRatio < 0.5) {
    // Fast and correct → increase difficulty
    return levels[Math.min(currentIdx + 1, 2)];
  } else if (!isCorrect || timeRatio > 0.8) {
    // Wrong or very slow → decrease difficulty
    return levels[Math.max(currentIdx - 1, 0)];
  }
  return currentDifficulty;
}

export const TOPICS = [
  { id: 'arithmetic', name: 'Arithmetic', icon: '➕', color: 'from-blue-500 to-cyan-500', description: 'Basic operations, fractions, decimals' },
  { id: 'algebra', name: 'Algebra', icon: '📐', color: 'from-purple-500 to-pink-500', description: 'Equations, expressions, polynomials' },
  { id: 'geometry', name: 'Geometry', icon: '📏', color: 'from-green-500 to-teal-500', description: 'Shapes, angles, lines, circles' },
  { id: 'mensuration', name: 'Mensuration', icon: '📦', color: 'from-yellow-500 to-orange-500', description: 'Area, perimeter, volume' },
  { id: 'number-systems', name: 'Number Systems', icon: '🔢', color: 'from-red-500 to-pink-500', description: 'HCF, LCM, primes, divisibility' },
  { id: 'percentages', name: 'Percentages', icon: '💯', color: 'from-indigo-500 to-blue-500', description: 'Percent change, applications' },
  { id: 'ratio-proportion', name: 'Ratio & Proportion', icon: '⚖️', color: 'from-cyan-500 to-blue-500', description: 'Ratios, proportions, mixtures' },
  { id: 'time-work', name: 'Time & Work', icon: '⏰', color: 'from-amber-500 to-yellow-500', description: 'Work rates, pipes & cisterns' },
  { id: 'time-speed-distance', name: 'Time, Speed & Distance', icon: '🚀', color: 'from-violet-500 to-purple-500', description: 'Speed problems, relative motion' },
  { id: 'profit-loss', name: 'Profit & Loss', icon: '💰', color: 'from-green-500 to-emerald-500', description: 'Cost price, selling price, discounts' },
  { id: 'simple-compound-interest', name: 'Simple & Compound Interest', icon: '🏦', color: 'from-teal-500 to-cyan-500', description: 'SI, CI calculations' },
  { id: 'trigonometry', name: 'Basic Trigonometry', icon: '📡', color: 'from-rose-500 to-red-500', description: 'Sin, cos, tan, identities' },
  { id: 'data-interpretation', name: 'Data Interpretation', icon: '📊', color: 'from-orange-500 to-red-500', description: 'Tables, charts, graphs' },
];
