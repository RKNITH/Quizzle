'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/topics', label: 'Play', icon: '🎮' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold gradient-text hidden sm:block">MathQuest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith(l.href)
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden md:flex items-center gap-3">
                <div className="glass-card px-3 py-1.5 text-xs">
                  <span className="text-yellow-400">⚡ {session.user.xp || 0} XP</span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-orange-400">🔥 {session.user.streak || 0}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs text-slate-400 hover:text-red-400 transition px-2 py-1"
                >
                  Logout
                </button>
              </div>
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    pathname.startsWith(l.href)
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  {l.icon} {l.label}
                </Link>
              ))}
              {session && (
                <>
                  <div className="border-t border-white/10 mt-2 pt-2 text-sm text-slate-400 px-4 py-2">
                    {session.user.name} · ⚡{session.user.xp || 0} XP · 🔥{session.user.streak || 0}
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-left px-4 py-2 text-red-400 text-sm hover:bg-red-500/10 rounded-xl"
                  >
                    🚪 Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
