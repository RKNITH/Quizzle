'use client';
import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { BADGES } from '@/lib/gamification';

function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      color: ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'][Math.floor(Math.random()*5)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    const timeout = setTimeout(() => cancelAnimationFrame(frame), 5000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '10');
  const xp = parseInt(searchParams.get('xp') || '0');
  const accuracy = parseInt(searchParams.get('accuracy') || '0');
  const topic = searchParams.get('topic') || 'Math';
  const newBadges = JSON.parse(searchParams.get('badges') || '[]');

  const grade = accuracy >= 90 ? 'S' : accuracy >= 75 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';
  const gradeColor = { S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400', C: 'text-orange-400', D: 'text-red-400' }[grade];
  const showConfetti = accuracy >= 70;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      {showConfetti && <Confetti />}
      <div className="pt-20 pb-10 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className={`text-8xl font-extrabold mb-2 ${gradeColor}`}>{grade}</div>
          <h1 className="text-3xl font-bold mb-1">
            {accuracy >= 90 ? 'Outstanding! 🌟' : accuracy >= 70 ? 'Great job! 🎉' : accuracy >= 50 ? 'Good effort! 💪' : 'Keep practicing! 📚'}
          </h1>
          <p className="text-slate-400">{topic} Quiz Complete</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Score', value: `${score}/${total}`, icon: '📝', color: 'text-blue-400' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯', color: accuracy >= 70 ? 'text-green-400' : 'text-yellow-400' },
            { label: 'XP Earned', value: `+${xp}`, icon: '⚡', color: 'text-yellow-400' },
            { label: 'Grade', value: grade, icon: '🏆', color: gradeColor },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card p-6 mb-6 border-2 border-yellow-500/30 bg-yellow-500/5">
            <h2 className="text-center font-bold mb-4 text-yellow-400">🎉 New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</h2>
            <div className="flex gap-4 justify-center flex-wrap">
              {newBadges.map(badgeId => {
                const badge = BADGES[badgeId];
                if (!badge) return null;
                return (
                  <motion.div key={badgeId} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl mx-auto mb-2`}>
                      {badge.icon}
                    </div>
                    <p className="text-sm font-semibold">{badge.name}</p>
                    <p className="text-xs text-slate-400">{badge.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Performance message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="glass-card p-5 mb-6 text-center">
          {accuracy >= 90 && <p className="text-green-400">🔥 Exceptional performance! You&apos;ve mastered this topic.</p>}
          {accuracy >= 70 && accuracy < 90 && <p className="text-blue-400">👏 Solid work! A bit more practice will make you a master.</p>}
          {accuracy >= 50 && accuracy < 70 && <p className="text-yellow-400">💡 Good attempt! Focus on reviewing the explanations.</p>}
          {accuracy < 50 && <p className="text-orange-400">📖 Don&apos;t give up! Review the topic and try again. You&apos;ve got this!</p>}
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3">
          <Link href="/topics" className="flex-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 text-base">
              🎮 Play Again
            </motion.button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="glass-card w-full py-3 text-base border border-white/10 hover:border-purple-500/50 transition">
              📊 Dashboard
            </motion.button>
          </Link>
          <Link href="/leaderboard" className="flex-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="glass-card w-full py-3 text-base border border-white/10 hover:border-yellow-500/50 transition">
              🏆 Leaderboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
