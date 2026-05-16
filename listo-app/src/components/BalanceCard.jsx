import { useState, useEffect } from 'react';
import { getExchangeRates, convertCurrency, formatCurrency } from '../utils/currency';

export function BalanceCard({ balance = 0.00, preferredCurrency = 'MXN' }) {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const rate = rates ? rates[preferredCurrency] : null;

  return (
    <div className="bg-primary rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Saldo disponible</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tighter">${balance.toFixed(2)}</span>
          <span className="text-xl font-medium opacity-50">USDC</span>
        </div>

        {rate && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Aproximado</p>
            <p className="text-2xl font-black text-accent">
              {formatCurrency(convertCurrency(balance, rate), preferredCurrency)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
