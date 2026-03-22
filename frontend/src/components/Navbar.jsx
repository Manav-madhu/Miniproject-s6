import { motion } from 'framer-motion';
import { MoonStar, ShieldCheck, SunMedium } from 'lucide-react';

export function Navbar({ theme, onToggleTheme }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl dark:bg-slate-950/70"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 p-3 shadow-glow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">MarketShield AI</p>
            <h1 className="text-lg font-semibold text-white">Marketplace Fraud Analyzer</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="glass-panel rounded-full p-3 text-slate-200 transition hover:scale-105 hover:shadow-glow"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
      </div>
    </motion.header>
  );
}
