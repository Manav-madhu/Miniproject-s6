import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Sparkles } from 'lucide-react';
import { Hero } from './components/Hero';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Navbar } from './components/Navbar';
import { ResultCard } from './components/ResultCard';
import { SkeletonResult } from './components/SkeletonResult';
import { Toast } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { analyzeProduct } from './lib/api';

const historyKey = 'marketshield-history';
const starterUrl = 'https://www.amazon.com/Apple-iPhone-15-128GB/dp/example';

export default function App() {
  const [url, setUrl] = useState(starterUrl);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(historyKey) || '[]'));
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 6)));
  }, [history]);

  const progressItems = useMemo(
    () => [
      'Validate marketplace URL',
      'Extract product and seller metadata',
      'Compare benchmark pricing',
      'Generate Gemini risk explanation'
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = await analyzeProduct(url);
      setResult(payload);
      setHistory((current) => [payload.sourceUrl, ...current.filter((item) => item !== payload.sourceUrl)].slice(0, 6));
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-100 transition-colors duration-300 dark:text-slate-100">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <LoadingOverlay visible={loading} />

      <main className="pb-16">
        <Hero url={url} setUrl={setUrl} onSubmit={handleSubmit} loading={loading} />

        <section className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[32px] p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-indigo-200">
                  <Sparkles className="h-4 w-4" /> Analysis workflow
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Fast, explainable, production-ready fraud scoring</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <History className="h-4 w-4" />
                {history.length} recent checks saved locally
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {progressItems.map((item, index) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</p>
                  <p className="mt-2 font-medium text-white">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {loading ? <SkeletonResult /> : null}
        {result && !loading ? <ResultCard result={result} /> : null}

        {history.length > 0 ? (
          <section className="mx-auto mt-10 max-w-6xl px-6">
            <div className="glass-panel rounded-[32px] p-6">
              <h3 className="text-xl font-semibold text-white">Recent analyses</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {history.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setUrl(item)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-300/40 hover:bg-indigo-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Toast message={error} onClose={() => setError('')} />
    </div>
  );
}
