import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExchangeRates, convertCurrency, formatCurrency } from '../utils/currency';

export function BalanceCard({ balance = 0.00, preferredCurrency = 'MXN' }) {
  const [rates, setRates] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const rate = rates ? rates[preferredCurrency] : null;
  const displayBalance = hidden ? '••••' : `$${balance.toFixed(2)}`;
  const localDisplay = rate
    ? (hidden ? '••••' : formatCurrency(convertCurrency(balance, rate), preferredCurrency))
    : null;

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Saldo</span>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-[10px] font-bold uppercase tracking-wider active:scale-90 transition-transform"
            style={{ color: 'var(--muted)' }}
          >
            {hidden ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={displayBalance}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[40px] leading-none font-black tracking-tight tabular"
            style={{ color: 'var(--primary)' }}
          >
            {displayBalance}
          </motion.p>
        </AnimatePresence>

        {rate && localDisplay && (
          <motion.p
            key={localDisplay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-black mt-2"
            style={{ color: '#00C9A7' }}
          >
            {localDisplay} {preferredCurrency}
          </motion.p>
        )}
      </div>
    </div>
  );
}