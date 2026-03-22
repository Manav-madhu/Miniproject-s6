import { motion } from 'framer-motion';
import { Link2, SearchCheck } from 'lucide-react';

export function Hero({ url, setUrl, onSubmit, loading }) {
  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-16">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200"
        >
          <SearchCheck className="h-4 w-4" />
          AI + benchmark powered authenticity checks
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl"
        >
          Detect risky marketplace deals with a <span className="gradient-text">premium AI fraud radar</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-base text-slate-300 md:text-lg"
        >
          Paste an Amazon, Flipkart, eBay, Walmart, Etsy, or Best Buy product URL to compare pricing, inspect seller trust signals, and receive a Gemini-powered legitimacy verdict.
        </motion.p>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-panel mx-auto mt-10 flex max-w-4xl flex-col gap-4 rounded-[28px] p-4 md:flex-row md:items-center"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 focus-within:border-indigo-400/70 focus-within:shadow-glow">
            <Link2 className="h-5 w-5 text-indigo-200" />
            <input
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.amazon.com/..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 md:text-base"
              aria-label="Marketplace URL"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 px-6 py-4 font-semibold text-white transition duration-200 hover:scale-[1.02] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Analyzing…' : 'Analyze listing'}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
