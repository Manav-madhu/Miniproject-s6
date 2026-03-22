import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BadgeCheck,
  CircleDollarSign,
  Copy,
  ExternalLink,
  ShieldAlert,
  Star,
  Store
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const statusStyles = {
  Fraud: 'bg-fraud/15 text-fraud border-fraud/40',
  Suspicious: 'bg-suspicious/15 text-suspicious border-suspicious/40',
  'Likely Legit': 'bg-legit/15 text-legit border-legit/40'
};

function Metric({ icon: Icon, label, value, helper }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center gap-3 text-slate-300">
        <Icon className="h-5 w-5 text-indigo-200" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

export function ResultCard({ result }) {
  const priceChartData = [
    { name: 'Listed', price: result.price },
    { name: 'Average', price: result.averagePrice }
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.sourceUrl);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-8 grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <div className="glass-panel overflow-hidden rounded-[32px] p-6">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40">
          <img
            src={result.image}
            alt={result.title}
            className="h-[360px] w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusStyles[result.fraudPrediction]}`}>
            {result.fraudPrediction}
          </span>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-100">
            Confidence {result.confidence}%
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            {result.marketplace}
          </span>
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold text-white">{result.title}</h3>
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
            >
              View original listing <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="glass-panel rounded-2xl p-3 text-slate-200 transition hover:scale-105"
            title="Copy product link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CircleDollarSign} label="Listed Price" value={`$${result.price}`} helper="Current marketplace price" />
          <Metric icon={BadgeCheck} label="Average Market Price" value={`$${result.averagePrice}`} helper="Computed from similar items" />
          <Metric
            icon={ShieldAlert}
            label="Price Difference"
            value={`${result.priceDifference}%`}
            helper={result.priceDifference < 0 ? 'Lower than market average' : 'Above market average'}
          />
          <Metric icon={Store} label="Seller" value={result.seller} helper={result.sellerVerified ? 'Verified seller profile' : 'Seller verification missing'} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-amber-300" />
              <h4 className="text-lg font-semibold">Ratings & Reviews Summary</h4>
            </div>
            <p className="mt-4 text-slate-300">
              Rated <span className="font-semibold text-white">{result.rating}/5</span> across{' '}
              <span className="font-semibold text-white">{result.reviewCount}</span> reviews.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{result.reviewSummary}</p>
            {!result.scrapedLive ? (
              <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Live scraping fallback active: {result.scrapeWarning || 'benchmark data was used for unavailable fields.'}
              </p>
            ) : null}
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <h4 className="text-lg font-semibold text-white">Price Snapshot</h4>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                  <Bar dataKey="price" radius={[12, 12, 0, 0]}>
                    {priceChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === 'Listed' ? '#38bdf8' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-[32px] p-6">
          <h4 className="text-lg font-semibold text-white">AI Explanation</h4>
          <p className="mt-4 text-sm leading-7 text-slate-300">{result.explanation}</p>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h4 className="text-lg font-semibold">Warnings & Risk Signals</h4>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {result.warnings.length > 0 ? (
              result.warnings.map((warning) => (
                <li key={warning} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {warning}
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                No major fraud warnings were detected for this listing.
              </li>
            )}
          </ul>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <h4 className="text-lg font-semibold text-white">Comparable Products</h4>
          <div className="mt-4 space-y-4">
            {result.similarProducts.map((product) => (
              <div key={product.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{product.title}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>${product.price}</span>
                  <span>{product.seller}</span>
                  <span>{product.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
