'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS = {
  1: 'border-yellow-500/50 bg-yellow-500/10',
  2: 'border-slate-400/50 bg-slate-400/10',
  3: 'border-amber-600/50 bg-amber-600/10',
};

function Skeleton({ className }) {
  return <div className={`skeleton ${className}`} />;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?page=${page}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🏆 <span className="gradient-text">Leaderboard</span></h1>
          <p className="text-slate-400">Ranked by XP, accuracy, and daily streak</p>
        </motion.div>

        {/* Top 3 podium */}
        {!loading && data?.users?.length >= 3 && page === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex justify-center items-end gap-4 mb-8">
            {[1, 0, 2].map(idx => {
              const user = data.users[idx];
              if (!user) return null;
              const rank = idx + 1;
              const heights = [20, 28, 16];
              return (
                <motion.div key={user._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className={`flex flex-col items-center glass-card p-4 border-2 ${RANK_COLORS[rank] || 'border-white/10'}`}
                  style={{ minWidth: '100px', paddingBottom: `${heights[idx]}px` }}>
                  <div className="text-3xl mb-2">{RANK_ICONS[rank]}</div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold mb-2">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-center truncate max-w-[80px]">{user.name}</p>
                  <p className="text-xs text-yellow-400">⚡ {user.xp}</p>
                  <p className="text-xs text-slate-500">Lv.{user.level}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 text-xs text-slate-500 uppercase px-4 py-3 border-b border-white/5">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Player</span>
            <span className="col-span-2 text-right">XP</span>
            <span className="col-span-2 text-right">Acc.</span>
            <span className="col-span-2 text-right">Streak</span>
            <span className="col-span-1 text-right">Lv.</span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : data?.users?.map((user, i) => {
            const isMe = user._id === session?.user?.id;
            return (
              <motion.div key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-12 items-center px-4 py-4 border-b border-white/5 transition hover:bg-white/5 ${
                  isMe ? 'bg-purple-600/10 border-l-2 border-l-purple-500' : ''
                }`}>
                <span className={`col-span-1 font-bold text-sm ${user.rank <= 3 ? 'text-lg' : 'text-slate-400'}`}>
                  {RANK_ICONS[user.rank] || `#${user.rank}`}
                </span>
                <div className="col-span-4 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name} {isMe && <span className="text-purple-400 text-xs">(you)</span>}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {(user.badges || []).slice(0, 3).map(b => (
                        <span key={b} className="text-xs">
                          {b === 'SPEED_MASTER' ? '⚡' : b === 'ACCURACY_KING' ? '🎯' : b === 'STREAK_LEGEND' ? '🔥' : b === 'TOPIC_EXPERT' ? '🏆' : b === 'FIRST_QUIZ' ? '🌟' : '💎'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="col-span-2 text-right text-yellow-400 font-semibold text-sm">
                  ⚡ {user.xp?.toLocaleString()}
                </span>
                <span className={`col-span-2 text-right text-sm font-medium ${
                  user.accuracy >= 70 ? 'text-green-400' : user.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {user.accuracy}%
                </span>
                <span className="col-span-2 text-right text-orange-400 text-sm">
                  {user.streak > 0 ? `🔥 ${user.streak}` : '-'}
                </span>
                <span className="col-span-1 text-right text-purple-400 text-sm font-bold">
                  {user.level}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="glass-card px-4 py-2 text-sm disabled:opacity-30 hover:border-purple-500/50 border border-white/10 transition">
              ← Prev
            </button>
            <span className="glass-card px-4 py-2 text-sm">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
              className="glass-card px-4 py-2 text-sm disabled:opacity-30 hover:border-purple-500/50 border border-white/10 transition">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
