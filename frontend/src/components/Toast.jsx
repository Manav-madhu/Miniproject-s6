import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function Toast({ message, onClose }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-2xl backdrop-blur-xl"
          role="alert"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span>{message}</span>
            </div>
            <button type="button" onClick={onClose} className="text-rose-200">Dismiss</button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
