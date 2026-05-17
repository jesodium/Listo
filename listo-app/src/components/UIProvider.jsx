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
      <div className="fixed top-5 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-5 max-w-[480px] mx-auto">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: -8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.6 }}
              className="px-4 py-3 rounded-2xl flex items-center gap-3 w-full pointer-events-auto"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: t.type === 'error'
                  ? 'rgba(255,77,106,0.92)'
                  : t.type === 'success'
                  ? 'rgba(0,201,167,0.92)'
                  : 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                color: t.type === 'info' ? 'var(--primary)' : 'white',
              }}
            >
              <div className="flex-1 font-bold text-sm">{t.message}</div>
              <button
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                className="opacity-60 hover:opacity-100 active:scale-90 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
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
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={hideAlert}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.6 }}
              className="relative w-full max-w-sm rounded-[28px] p-7"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
            >
              <h3 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--primary)' }}>{modal.title}</h3>
              <p className="font-medium mb-7 leading-relaxed" style={{ color: 'var(--muted)' }}>{modal.message}</p>

              <div className="space-y-2.5">
                <button
                  onClick={() => { modal.onConfirm?.(); hideAlert(); }}
                  className="w-full py-3.5 rounded-2xl font-bold active:scale-[0.98] transition-transform"
                  style={modal.type === 'danger'
                    ? { background: '#FF4D6A', color: 'white', boxShadow: '0 6px 18px rgba(255,77,106,0.25)' }
                    : { background: 'var(--primary)', color: 'var(--background)', boxShadow: '0 6px 18px rgba(13,13,26,0.18)' }
                  }
                >
                  {modal.confirmText || 'Entendido'}
                </button>
                {modal.onCancel && (
                  <button
                    onClick={() => { modal.onCancel?.(); hideAlert(); }}
                    className="w-full py-3.5 rounded-2xl font-bold active:scale-[0.98] transition-transform"
                    style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
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
