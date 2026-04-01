'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { adaptDifficulty, calculateXP } from '@/lib/gamification';

const TIME_LIMITS = { easy: 30, medium: 45, hard: 60 };
const TOTAL_QUESTIONS = 10;

function playSound(type) {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'timeout') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) { /* ignore audio errors */ }
}

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topic = searchParams.get('topic') || 'Arithmetic';
  const initDifficulty = searchParams.get('difficulty') || 'medium';

  const [phase, setPhase] = useState('loading');
  const [question, setQuestion] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(initDifficulty);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[initDifficulty]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const hasTimedOutRef = useRef(false);

  const phaseRef = useRef(phase);
  const questionRef = useRef(question);
  const currentDifficultyRef = useRef(currentDifficulty);
  const questionsRef = useRef(questions);
  const userAnswersRef = useRef(userAnswers);
  const totalXPEarnedRef = useRef(totalXPEarned);
  const streakRef = useRef(streak);

  phaseRef.current = phase;
  questionRef.current = question;
  currentDifficultyRef.current = currentDifficulty;
  questionsRef.current = questions;
  userAnswersRef.current = userAnswers;
  totalXPEarnedRef.current = totalXPEarned;
  streakRef.current = streak;

  const finishQuiz = useCallback(async (finalQuestions, finalAnswers, finalXP) => {
    setPhase('finished');
    setSubmitting(true);
    try {
      const totalTime = finalAnswers.reduce((s, a) => s + (a.timeTaken || 0), 0);
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, questions: finalQuestions, userAnswers: finalAnswers, totalTime }),
      });
      const data = await res.json();
      if (res.ok) {
        const params = new URLSearchParams({
          score: data.score,
          total: finalQuestions.length,
          xp: data.xpEarned,
          accuracy: data.accuracy,
          badges: JSON.stringify(data.newBadges || []),
          topic,
        });
        router.push(`/results?${params.toString()}`);
      } else {
        toast.error('Failed to save results');
        setSubmitting(false);
        setPhase('finished');
      }
    } catch {
      toast.error('Failed to save results');
      setSubmitting(false);
    }
  }, [topic, router]);

  const fetchQuestion = useCallback(async (difficulty, usedQs) => {
    setPhase('loading');
    hasTimedOutRef.current = false;
    try {
      const res = await fetch('/api/quiz/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          usedQuestions: usedQs.slice(-5).map(q => q.question),
        }),
      });
      const q = await res.json();
      if (!res.ok) throw new Error(q.error || 'Failed');
      setQuestion(q);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_LIMITS[difficulty]);
      questionStartTimeRef.current = Date.now();
      setPhase('question');
    } catch (err) {
      toast.error('Failed to load question. Retrying...');
      setTimeout(() => fetchQuestion(difficulty, usedQs), 2000);
    }
  }, [topic]);

  useEffect(() => {
    fetchQuestion(initDifficulty, []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    clearInterval(timerRef.current);
    if (phase !== 'question') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasTimedOutRef.current) {
            hasTimedOutRef.current = true;
            if (soundEnabled) playSound('timeout');

            const timeTaken = TIME_LIMITS[currentDifficultyRef.current];
            const newAnswer = { answer: null, isCorrect: false, timeTaken, xpEarned: 0 };
            const newAnswers = [...userAnswersRef.current, newAnswer];
            const newQuestions = [...questionsRef.current, questionRef.current];
            const nextDiff = adaptDifficulty(currentDifficultyRef.current, timeTaken, TIME_LIMITS[currentDifficultyRef.current], false);

            setUserAnswers(newAnswers);
            setQuestions(newQuestions);
            setStreak(0);
            setSelectedAnswer(null);
            setIsCorrect(false);
            setCurrentDifficulty(nextDiff);
            setQuestionNumber(n => n + 1);
            setPhase('feedback');

            if (newAnswers.length >= TOTAL_QUESTIONS) {
              setTimeout(() => finishQuiz(newQuestions, newAnswers, totalXPEarnedRef.current), 2000);
            } else {
              setTimeout(() => fetchQuestion(nextDiff, newQuestions), 2500);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, soundEnabled, fetchQuestion, finishQuiz]);

  const handleAnswer = (option) => {
    if (phase !== 'question' || selectedAnswer) return;
    clearInterval(timerRef.current);

    const timeTaken = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const letter = option.charAt(0).toUpperCase();
    const correct = letter === question.correctAnswer;
    const timeLimit = TIME_LIMITS[currentDifficulty];
    const newStreak = correct ? streak + 1 : 0;
    const xpEarned = correct ? calculateXP(currentDifficulty, timeTaken, timeLimit, newStreak) : 0;

    if (soundEnabled) playSound(correct ? 'correct' : 'wrong');

    const newAnswer = { answer: letter, isCorrect: correct, timeTaken, xpEarned };
    const newAnswers = [...userAnswers, newAnswer];
    const newQuestions = [...questions, question];
    const newTotalXP = totalXPEarned + xpEarned;
    const nextDiff = adaptDifficulty(currentDifficulty, timeTaken, timeLimit, correct);

    setSelectedAnswer(letter);
    setIsCorrect(correct);
    setStreak(newStreak);
    setUserAnswers(newAnswers);
    setQuestions(newQuestions);
    setTotalXPEarned(newTotalXP);
    setCurrentDifficulty(nextDiff);
    setQuestionNumber(n => n + 1);
    setPhase('feedback');

    if (newAnswers.length >= TOTAL_QUESTIONS) {
      setTimeout(() => finishQuiz(newQuestions, newAnswers, newTotalXP), 2500);
    } else {
      setTimeout(() => fetchQuestion(nextDiff, newQuestions), 2500);
    }
  };

  const timerPct = (timeLeft / TIME_LIMITS[currentDifficulty]) * 100;
  const timerColor = timeLeft > TIME_LIMITS[currentDifficulty] * 0.5
    ? '#10b981' : timeLeft > TIME_LIMITS[currentDifficulty] * 0.25
      ? '#f59e0b' : '#ef4444';
  const timerTextColor = timeLeft > TIME_LIMITS[currentDifficulty] * 0.5
    ? 'text-green-400' : timeLeft > TIME_LIMITS[currentDifficulty] * 0.25
      ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  const diffColors = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Question {Math.min(questionNumber + 1, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}</span>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400">⚡ {totalXPEarned} XP</span>
              {streak >= 2 && <span className="text-orange-400">🔥 {streak}x</span>}
              <span className={diffColors[currentDifficulty] || 'text-slate-400'}>
                {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
              </span>
              <button onClick={() => setSoundEnabled(s => !s)} className="text-slate-500 hover:text-slate-300 transition">
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </div>

        {phase === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Generating your question with AI...</p>
            <p className="text-xs text-slate-600 mt-1">{topic} · {currentDifficulty}</p>
          </motion.div>
        )}

        {(phase === 'question' || phase === 'feedback') && question && (
          <AnimatePresence mode="wait">
            <motion.div key={questionNumber} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {phase === 'question' && (
                <div className="glass-card p-3 flex items-center gap-3">
                  <span className={`text-2xl font-bold w-10 text-center tabular-nums ${timerTextColor}`}>{timeLeft}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
                  </div>
                  <span className="text-xs text-slate-500">sec</span>
                </div>
              )}

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${question.difficulty === 'easy' ? 'border-green-500/30 text-green-400 bg-green-500/10'
                      : question.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                        : 'border-red-500/30 text-red-400 bg-red-500/10'
                    }`}>{question.difficulty}</span>
                  <span className="text-xs text-slate-500">{question.topic}</span>
                </div>
                <p className="text-lg md:text-xl font-medium leading-relaxed">{question.question}</p>
              </div>

              <div className="grid gap-3">
                {(question.options || []).map((option, i) => {
                  const letter = option.charAt(0).toUpperCase();
                  let extraClass = '';
                  if (phase === 'feedback') {
                    if (letter === question.correctAnswer) extraClass = ' correct';
                    else if (letter === selectedAnswer && !isCorrect) extraClass = ' incorrect';
                    else extraClass = ' opacity-40';
                  }
                  return (
                    <motion.button key={i}
                      whileHover={phase === 'question' ? { scale: 1.01 } : {}}
                      whileTap={phase === 'question' ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={phase !== 'question'}
                      className={`option-btn glass-card p-4 text-left border-2 border-white/10 flex items-start gap-3 w-full${extraClass}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">{letter}</span>
                      <span className="text-sm leading-relaxed pt-0.5">{option.slice(3)}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {phase === 'feedback' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`glass-card p-5 border-2 ${isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{isCorrect ? '✅' : selectedAnswer ? '❌' : '⏱️'}</span>
                      <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect
                          ? `Correct! +${userAnswers[userAnswers.length - 1]?.xpEarned || 0} XP`
                          : selectedAnswer ? 'Incorrect!' : "Time's up!"}
                      </span>
                      {streak >= 2 && isCorrect && <span className="text-orange-400 text-sm ml-auto">🔥 {streak}x streak!</span>}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-slate-400">Explanation: </span>{question.explanation}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Next question loading...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}

        {phase === 'finished' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">Quiz Complete! 🎉</p>
            <p className="text-slate-400">{submitting ? 'Saving your results...' : 'Redirecting to results...'}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <QuizPageInner />
    </Suspense>
  );
}