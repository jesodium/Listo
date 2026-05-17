import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExchangeRates, convertCurrency, formatCurrency } from '../utils/currency';

const CURRENCY_COLORS = {
  MXN: '#00C9A7', COP: '#FF6B6B', GTQ: '#4ECDC4', HNL: '#45B7D1',
  PEN: '#96CEB4', CLP: '#FFEAA7', ARS: '#DDA0DD'
};

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
      className="relative rounded-[28px] overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0D0D24 0%, #1A1A42 45%, #0F2535 100%)',
        boxShadow: '0 24px 48px -12px rgba(13,13,36,0.55), 0 8px 24px -8px rgba(0,201,167,0.15)',
      }}
    >
      {/* Mesh gradient orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,167,0.18) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Shine line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="relative z-10 p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-accent"
            />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Saldo disponible</span>
          </div>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-white/40 hover:text-white/80 text-[11px] font-bold uppercase tracking-wider active:scale-90 transition-all duration-150"
          >
            {hidden ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>

        {/* Balance */}
        <div className="mb-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayBalance}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-[52px] leading-none font-black tracking-tight text-white tabular"
            >
              {displayBalance}
            </motion.p>
          </AnimatePresence>
          <p className="text-[10px] font-bold text-white/30 tracking-[0.25em] uppercase mt-2">Saldo en dólares</p>
        </div>

        {/* Local currency footer */}
        {rate && (
          <div className="mt-6 pt-5 flex items-end justify-between"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1.5">Equivale aprox.</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={localDisplay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-black text-accent tabular"
                >
                  {localDisplay}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-4 h-4 rounded-full" style={{ background: CURRENCY_COLORS[preferredCurrency] || '#888', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              <span className="text-xs font-bold text-white">{preferredCurrency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
