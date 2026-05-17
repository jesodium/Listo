import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // { title, message, type, onConfirm, confirmText, cancelText }

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showAlert = useCallback((config) => {
    setModal(config);
  }, []);

  const hideAlert = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, showAlert, hideAlert }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 min-w-[280px] pointer-events-auto border backdrop-blur-md ${
                t.type === 'error' ? 'bg-danger/90 border-white/20 text-white' : 
                t.type === 'success' ? 'bg-accent/90 border-white/20 text-white' : 
                'bg-surface/90 border-muted/10 text-primary'
              }`}
            >
              <div className="flex-1 font-bold text-sm">{t.message}</div>
              <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} className="opacity-60 hover:opacity-100">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Alert Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideAlert}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface rounded-[32px] p-8 shadow-2xl border border-muted/10"
            >
              <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">{modal.title}</h3>
              <p className="text-muted font-medium mb-8 leading-relaxed">{modal.message}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    modal.onConfirm?.();
                    hideAlert();
                  }}
                  className={`w-full py-4 rounded-2xl font-bold transition active:scale-[0.98] shadow-lg ${
                    modal.type === 'danger' ? 'bg-danger text-white shadow-danger/20' : 'bg-primary text-white shadow-primary/20'
                  }`}
                >
                  {modal.confirmText || 'Entendido'}
                </button>
                {modal.onCancel && (
                  <button
                    onClick={() => {
                      modal.onCancel?.();
                      hideAlert();
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-muted hover:bg-muted/5 transition"
                  >
                    {modal.cancelText || 'Cancelar'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
