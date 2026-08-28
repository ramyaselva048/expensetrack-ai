import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useExpenses();

  return (
    <div 
      id="toast-container" 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/30'
                  : toast.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/30'
                  : 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                {toast.type === 'info' && (
                  <Info className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-slate-400 mt-1 leading-normal break-words">{toast.message}</p>
                )}
              </div>

              <button
                id={`btn-close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors shrink-0 p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
