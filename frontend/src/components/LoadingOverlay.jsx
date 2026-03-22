import { AnimatePresence, motion } from 'framer-motion';

const steps = ['Analyzing product...', 'Checking price authenticity...', 'Comparing market data...'];

export function LoadingOverlay({ visible }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="h-16 w-16 rounded-full border-4 border-indigo-400/30 border-t-cyan-300"
          />
          <div className="space-y-2 text-center text-slate-100">
            {steps.map((step, index) => (
              <motion.p
                key={step}
                initial={{ opacity: 0.15 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.4, delay: index * 0.2 }}
                className="text-sm md:text-base"
              >
                {step}
              </motion.p>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
