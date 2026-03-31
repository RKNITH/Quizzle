'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { BADGES, xpForNextLevel, xpForCurrentLevel } from '@/lib/gamification';

function Skeleton({ className }) {
  return <div className={`skeleton ${className}`} />;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setEditName(d.user?.name || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(p => ({ ...p, user: updated.user }));
        setEditing(false);
        toast.success('Profile updated!');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const user = data?.user || {};
  const stats = data?.stats || {};
  const performance = data?.performance || [];
  const recentAttempts = data?.recentAttempts || [];

  const currentLevelXP = xpForCurrentLevel(user.level || 1);
  const nextLevelXP = xpForNextLevel(user.level || 1);
  const xpProgress = nextLevelXP > currentLevelXP
    ? Math.round(((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6">👤 My Profile</motion.h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: User card */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>

                {editing ? (
                  <div className="space-y-2 mb-4">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center text-white"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 btn-primary py-2 text-sm">
                        {saving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(false)}
                        className="flex-1 glass-card py-2 text-sm border border-white/10">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <button onClick={() => setEditing(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition">
                      ✏️ Edit name
                    </button>
                  </div>
                )}

                {/* Level */}
                <div className="glass-card p-3 mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Level {user.level || 1}</span>
                    <span className="text-purple-400">{user.xp || 0} XP</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full xp-bar"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{xpProgress}% to Level {(user.level || 1) + 1}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/5 rounded-xl p-2 text-center">
                    <div className="text-orange-400 text-xl">🔥{user.streak || 0}</div>
                    <div className="text-slate-500 text-xs">Day Streak</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 text-center">
                    <div className="text-blue-400 text-xl">{stats.totalQuizzes || 0}</div>
                    <div className="text-slate-500 text-xs">Quizzes</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 text-center">
                    <div className="text-green-400 text-xl">{stats.overallAccuracy || 0}%</div>
                    <div className="text-slate-500 text-xs">Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 text-center">
                    <div className="text-yellow-400 text-xl">{stats.avgResponseTime || 0}s</div>
                    <div className="text-slate-500 text-xs">Avg. Time</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-4">
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''}
                </p>
              </motion.div>
            )}

            {/* Badges */}
            <div className="glass-card p-5">
              <h2 className="font-semibold mb-3">🏅 Badges ({(user.badges || []).length}/{Object.keys(BADGES).length})</h2>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(BADGES).map(badge => {
                  const earned = (user.badges || []).includes(badge.id);
                  return (
                    <motion.div key={badge.id} whileHover={{ scale: 1.1 }}
                      className={`badge-card ${!earned ? 'badge-locked' : ''}`}
                      title={badge.description}>
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs text-slate-400 leading-tight">{badge.name}</div>
                      {earned && <div className="text-xs text-green-400 mt-0.5">✓ Earned</div>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Stats & history */}
          <div className="lg:col-span-2 space-y-4">
            {/* Topic performance */}
            {performance.length > 0 && (
              <div className="glass-card p-5">
                <h2 className="font-semibold mb-4">📚 Topic Performance</h2>
                <div className="space-y-3">
                  {performance.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{p.topic}</span>
                        <div className="flex gap-3 text-xs text-slate-400">
                          <span>{p.totalAttempts} attempts</span>
                          <span className={p.accuracy >= 70 ? 'text-green-400 font-semibold' : p.accuracy >= 40 ? 'text-yellow-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {p.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.accuracy}%` }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: p.accuracy >= 70 ? '#10b981' : p.accuracy >= 40 ? '#f59e0b' : '#ef4444' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent attempts */}
            <div className="glass-card p-5">
              <h2 className="font-semibold mb-4">📈 Recent Activity</h2>
              {recentAttempts.length > 0 ? (
                <div className="space-y-3">
                  {recentAttempts.map((attempt, i) => (
                    <motion.div key={attempt._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium">{attempt.topic}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' '}· {attempt.totalQuestions} Qs
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${attempt.accuracy >= 70 ? 'text-green-400' : attempt.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {attempt.accuracy}%
                        </p>
                        <p className="text-xs text-yellow-400">+{attempt.xpEarned} XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-4xl mb-2">📝</p>
                  <p>No quiz history yet.</p>
                </div>
              )}
            </div>

            {loading && (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
