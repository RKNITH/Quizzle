'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { TOPICS } from '@/lib/gamification';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', icon: '🌱', desc: 'Class 5-7, basic concepts', color: 'border-green-500/30 hover:border-green-500', activeColor: 'bg-green-500/20 border-green-500' },
  { id: 'medium', label: 'Medium', icon: '🔥', desc: 'Class 8-9, moderate', color: 'border-yellow-500/30 hover:border-yellow-500', activeColor: 'bg-yellow-500/20 border-yellow-500' },
  { id: 'hard', label: 'Hard', icon: '💎', desc: 'Class 10, competitive', color: 'border-red-500/30 hover:border-red-500', activeColor: 'bg-red-500/20 border-red-500' },
];

export default function TopicsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  const handleStart = () => {
    if (!selected) return;
    const params = new URLSearchParams({ topic: selected.name, difficulty });
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Choose Your <span className="gradient-text">Topic</span></h1>
          <p className="text-slate-400">Select a topic and difficulty. AI will generate unique questions just for you.</p>
        </motion.div>

        {/* Difficulty Selection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-3 text-center">Starting Difficulty</h2>
          <div className="flex gap-3 justify-center flex-wrap">
            {DIFFICULTIES.map(d => (
              <motion.button
                key={d.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d.id)}
                className={`glass-card px-6 py-3 border-2 transition-all text-center min-w-[130px] ${
                  difficulty === d.id ? d.activeColor : `border-white/10 ${d.color}`
                }`}
              >
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className="font-semibold">{d.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d.desc}</div>
              </motion.button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            💡 Difficulty adapts automatically based on your performance
          </p>
        </motion.div>

        {/* Topics Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-4 text-center">Select a Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {TOPICS.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(topic)}
                className={`glass-card p-5 cursor-pointer border-2 transition-all ${
                  selected?.id === topic.id
                    ? 'border-purple-500 bg-purple-600/10 glow-purple'
                    : 'border-white/10 hover:border-purple-500/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl mb-3`}>
                  {topic.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{topic.name}</h3>
                <p className="text-xs text-slate-400">{topic.description}</p>
                {selected?.id === topic.id && (
                  <div className="mt-2 text-xs text-purple-400 font-medium">✓ Selected</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          {selected ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <p className="text-slate-400 text-sm mb-1">Ready to play:</p>
              <p className="text-lg font-bold mb-1">
                {selected.icon} {selected.name}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Starting at{' '}
                <span className={`font-semibold ${
                  difficulty === 'easy' ? 'text-green-400' : difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                {' '}· Adaptive AI questions · 10-15 questions
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="btn-primary px-10 py-3 text-base w-full"
              >
                🚀 Start Quiz!
              </motion.button>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">👆 Select a topic above to start</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
