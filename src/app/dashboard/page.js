'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { BADGES } from '@/lib/gamification';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}

function Skeleton({ className }) {
  return <div className={`skeleton ${className}`} />;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const user = data?.user || {};
  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{session?.user?.name?.split(' ')[0] || 'Champion'}</span>! 👋
          </h1>
          <p className="text-slate-400 mt-1">Ready to crush some math today?</p>
        </motion.div>

        {/* Level + XP Card */}
        {loading ? (
          <div className="glass-card p-6 mb-6"><Skeleton className="h-8 w-48 mb-3" /><Skeleton className="h-4 w-full" /></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                  {user.level || 1}
                </div>
                <div>
                  <p className="font-bold text-lg">Level {user.level || 1}</p>
                  <p className="text-slate-400 text-sm">{user.xp || 0} / {stats.nextLevelXP || 100} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-orange-400"><span className="streak-flame">🔥</span>{user.streak || 0} day streak</span>
                <Link href="/topics">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-5 py-2 text-sm">
                    🎮 Play Now
                  </motion.button>
                </Link>
              </div>
            </div>
            {/* XP Bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.xpProgress || 0}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full xp-bar"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">{stats.xpProgress || 0}% to Level {(user.level || 1) + 1}</p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            <>
              <StatCard icon="📝" label="Quizzes Taken" value={stats.totalQuizzes || 0} sub="All time" color="text-blue-400" />
              <StatCard icon="🎯" label="Accuracy" value={`${stats.overallAccuracy || 0}%`} sub="Overall" color="text-green-400" />
              <StatCard icon="⏱️" label="Avg. Response" value={`${stats.avgResponseTime || 0}s`} sub="Per question" color="text-yellow-400" />
              <StatCard icon="❓" label="Questions" value={stats.totalQuestionsAnswered || 0} sub="Answered total" color="text-purple-400" />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weak Topics */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">⚠️ Topics to Improve</h2>
              {loading ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : data?.weakTopics?.length > 0 ? (
                <div className="space-y-3">
                  {data.weakTopics.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <span className="text-sm text-slate-300">{t.topic}</span>
                      <span className="text-sm font-bold text-red-400">{t.accuracy}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  {stats.totalQuizzes === 0 ? 'Play some quizzes to see your weak areas!' : '🎉 All topics looking good!'}
                </p>
              )}
              <Link href="/topics" className="mt-4 block text-center text-sm text-purple-400 hover:text-purple-300 transition">
                Practice now →
              </Link>
            </div>

            {/* Badges */}
            <div className="glass-card p-5 mt-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">🏅 Badges</h2>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(BADGES).map(badge => {
                  const earned = (user.badges || []).includes(badge.id);
                  return (
                    <motion.div key={badge.id} whileHover={{ scale: 1.1 }}
                      className={`badge-card ${!earned ? 'badge-locked' : ''}`}
                      title={badge.description}>
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs text-slate-400 leading-tight">{badge.name}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">📈 Recent Quizzes</h2>
                <Link href="/topics" className="text-sm text-purple-400 hover:text-purple-300">Play more →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : data?.recentAttempts?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentAttempts.map((attempt, i) => (
                    <motion.div key={attempt._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl p-4 transition">
                      <div>
                        <p className="font-medium text-sm">{attempt.topic}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(attempt.createdAt).toLocaleDateString()} · {attempt.totalQuestions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${attempt.accuracy >= 70 ? 'text-green-400' : attempt.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {attempt.accuracy}%
                        </p>
                        <p className="text-xs text-yellow-400">+{attempt.xpEarned} XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🎮</p>
                  <p className="text-slate-400 mb-4">No quizzes yet! Start your first quiz.</p>
                  <Link href="/topics">
                    <button className="btn-primary px-6 py-2">Start Playing</button>
                  </Link>
                </div>
              )}
            </div>

            {/* Performance by topic */}
            {data?.performance?.length > 0 && (
              <div className="glass-card p-5 mt-4">
                <h2 className="font-semibold mb-4">📚 Topic Performance</h2>
                <div className="space-y-3">
                  {data.performance.slice(0, 5).map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{p.topic}</span>
                        <span className={p.accuracy >= 70 ? 'text-green-400' : p.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                          {p.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.accuracy}%` }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background: p.accuracy >= 70 ? '#10b981' : p.accuracy >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
