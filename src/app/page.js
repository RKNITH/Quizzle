'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { icon: '🧠', title: 'AI-Powered Questions', desc: 'Gemini AI generates unique questions every session — no repetition, always fresh.' },
  { icon: '📈', title: 'Adaptive Difficulty', desc: 'The quiz adapts in real time based on your speed and accuracy. Get challenged optimally.' },
  { icon: '🏆', title: 'Gamified Learning', desc: 'Earn XP, level up, unlock badges, and compete on the global leaderboard.' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Identify weak topics, track improvement, and crush competitive exams.' },
  { icon: '⚡', title: 'Speed Bonuses', desc: 'Answer fast and correctly to earn bonus XP and trigger streak multipliers.' },
  { icon: '🔥', title: 'Daily Streaks', desc: 'Maintain daily login streaks for bonus rewards and exclusive badges.' },
];

const stats = [
  { value: '13+', label: 'Math Topics' },
  { value: '∞', label: 'AI Questions' },
  { value: '3', label: 'Difficulty Levels' },
  { value: '6+', label: 'Badges to Earn' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold gradient-text">MathQuest</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/login" className="text-slate-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5">Login</Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
          </motion.div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6 text-sm text-purple-300">
              <span>✨</span> AI-Powered Adaptive Quiz Engine for Competitive Maths
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Master Math. <span className="gradient-text">Beat Every Exam.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI generates fresh questions tailored to your level. Earn XP, climb the leaderboard, and transform from beginner to champion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
                  🚀 Start Playing Free
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-card px-8 py-4 text-lg border border-purple-500/30 hover:border-purple-500/60 transition w-full sm:w-auto">
                  Login to Continue →
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why <span className="gradient-text">MathQuest</span>?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Everything you need to ace competitive maths, gamified for maximum engagement.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="glass-card p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card p-12 text-center gradient-border">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-3xl font-bold mb-4">Ready to <span className="gradient-text">Level Up</span>?</h2>
          <p className="text-slate-400 mb-8">Join thousands of students mastering competitive math with AI.</p>
          <Link href="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-10 py-4 text-lg">
              Create Free Account 🚀
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        <p>© 2024 MathQuest — Adaptive Quiz Engine. Built with Next.js + Gemini AI.</p>
      </footer>
    </div>
  );
}
