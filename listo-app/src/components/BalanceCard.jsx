import { useState, useEffect } from 'react';
import { getExchangeRates, convertCurrency, formatCurrency } from '../utils/currency';

const FLAGS = {
  MXN: '🇲🇽', COP: '🇨🇴', GTQ: '🇬🇹', HNL: '🇭🇳',
  PEN: '🇵🇪', CLP: '🇨🇱', ARS: '🇦🇷', USD: '🇺🇸'
};

export function BalanceCard({ balance = 0.00, preferredCurrency = 'MXN' }) {
  const [rates, setRates] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const rate = rates ? rates[preferredCurrency] : null;
  const display = hidden ? '••••••' : `$${balance.toFixed(2)}`;
  const localDisplay = rate
    ? (hidden ? '••••••' : formatCurrency(convertCurrency(balance, rate), preferredCurrency))
    : null;

  return (
    <div className="relative rounded-[28px] p-6 text-white overflow-hidden shadow-[0_20px_50px_-20px_rgba(26,26,46,0.5)]"
         style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2A2A55 60%, #1A1A2E 100%)' }}>
      {/* glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-accent/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.15em]">Saldo disponible</p>
          </div>
          <button
            onClick={() => setHidden(h => !h)}
            className="text-white/50 hover:text-white text-xs font-semibold active:scale-95 transition"
          >
            {hidden ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[56px] leading-none font-black tracking-tight tabular">{display}</span>
        </div>
        <p className="text-xs font-semibold text-white/40 tracking-wider uppercase">USDC · Cuenta digital</p>

        {rate && (
          <div className="mt-6 pt-5 border-t border-white/10 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-semibold mb-1">Aproximado en local</p>
              <p className="text-2xl font-black text-accent tabular">{localDisplay}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full">
              <span className="text-base leading-none">{FLAGS[preferredCurrency] || '🌎'}</span>
              <span className="text-xs font-bold text-white">{preferredCurrency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
