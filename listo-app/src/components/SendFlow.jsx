import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { getExchangeRates, convertCurrency } from '../utils/currency';

const spring = { type: 'spring', damping: 36, stiffness: 360, mass: 0.7 };
const EASE = "easeInOutSine";

export function SendFlow({ onSend, onCancel, onLookup, currentUsername, initialRecipient, currentBalance, preferredCurrency = 'MXN' }) {
  const [step, setStep] = useState(initialRecipient ? 2 : 1);
  const [targetUsername, setTargetUsername] = useState(initialRecipient?.username || '');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(initialRecipient || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  const isNone = preferredCurrency === 'NONE';
  const displayCurrency = isNone ? 'USD' : preferredCurrency;

  const convertAmount = () => {
    if (!amount || !rates || isNone) return null;
    const rate = rates[preferredCurrency];
    if (!rate) return null;
    const converted = convertCurrency(parseFloat(amount) || 0, rate);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: displayCurrency,
      currencyDisplay: 'code',
    }).format(converted);
  };

  const handleNext = async (e) => {
    if (e) e.preventDefault();
    if (!targetUsername) return;
    setError(null);
    if (targetUsername.toLowerCase() === currentUsername?.toLowerCase()) {
      setError('No puedes enviarte dinero a ti mismo.');
      return;
    }
    setLoading(true);
    try {
      const data = await onLookup(targetUsername);
      setRecipient(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      const qr = new Html5Qrcode('qr-reader');
      scannerRef.current = qr;
      qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => {
          qr.stop().then(() => { scannerRef.current = null; });
          setShowScanner(false);
          if (text.startsWith('0x') && text.length === 42) {
            setRecipient({ wallet_address: text, username: 'Dirección escaneada' });
            setTargetUsername(text);
            setStep(2);
          } else {
            setTargetUsername(text.replace('@', ''));
          }
        },
        () => {}
      ).catch(() => {
        setError('Error al iniciar la cámara.');
        setShowScanner(false);
      });
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => { scannerRef.current = null; });
      }
    };
  }, [showScanner]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (numAmount > currentBalance) {
      setError(`Saldo insuficiente. Tienes $${currentBalance.toFixed(2)}.`);
      return;
    }
    if (numAmount && recipient) {
      onSend({ targetUsername, amount: numAmount, recipientAddress: recipient.wallet_address });
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{ background: 'rgba(8,8,20,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onCancel}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <motion.div
          className="w-full max-w-[480px] rounded-t-[32px] flex flex-col max-h-[92vh] overflow-hidden"
          style={{ background: 'var(--surface)', boxShadow: '0 -24px 64px rgba(8,8,20,0.28), 0 -2px 8px rgba(8,8,20,0.08)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={spring}
        >
          {/* Grabber */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 pb-10 pt-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>
                  {step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}
                </p>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--primary)' }}>
                  {step === 1 ? 'Enviar a quién' : '¿Cuánto enviar?'}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform mt-1"
                style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mb-7">
              {[1, 2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-accent, #00C9A7)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: step >= i ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
                      Usuario destinatario
                    </label>
                    <button
                      onClick={() => setShowScanner(!showScanner)}
                      className="text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                      style={{ color: showScanner ? '#FF4D6A' : '#00C9A7' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3m4 0h-1m-3 3v3m3-3v3m-3-3h3"/>
                      </svg>
                      {showScanner ? 'Cancelar' : 'Escanear QR'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showScanner && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="mb-4 overflow-hidden"
                      >
                        <div className="rounded-2xl overflow-hidden bg-black aspect-square relative" style={{ border: '2px solid rgba(0,201,167,0.25)' }}>
                          <div id="qr-reader" className="w-full h-full" />
                          <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid rgba(0,201,167,0.3)' }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleNext}>
                    <div
                      className="relative mb-3 rounded-2xl transition-all duration-200"
                      style={{
                        background: 'var(--surface2)',
                        border: `2px solid ${error ? '#FF4D6A' : 'transparent'}`,
                        outline: 'none',
                      }}
                      onFocus={() => {}}
                    >
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-xl" style={{ color: 'var(--muted)' }}>@</span>
                      <input
                        type="text"
                        value={targetUsername}
                        onChange={(e) => { setError(null); setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_x]/g, '').toLowerCase()); }}
                        placeholder="nombre_de_usuario"
                        autoFocus
                        className="w-full pl-10 pr-4 py-4 bg-transparent rounded-2xl focus:outline-none font-bold text-lg"
                        style={{ color: 'var(--primary)' }}
                        required
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
                          style={{ background: 'rgba(255,77,106,0.1)', color: '#FF4D6A' }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={!targetUsername || loading}
                      className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-40"
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--background)',
                        boxShadow: '0 8px 24px rgba(13,13,26,0.2)',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                          />
                          Buscando...
                        </span>
                      ) : 'Continuar →'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <form onSubmit={handleSubmit}>
                    {/* Recipient card */}
                    <div
                      className="flex items-center gap-3 mb-7 p-3.5 rounded-2xl"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--accent-soft)' }}>
                        {recipient?.avatar ? (
                          <img src={recipient.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-lg" style={{ color: '#00C9A7' }}>
                            {targetUsername[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5" style={{ color: 'var(--muted)' }}>Enviando a</p>
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--primary)' }}>
                          {recipient?.display_name || (targetUsername.startsWith('0x') ? `${targetUsername.slice(0,6)}…${targetUsername.slice(-4)}` : `@${targetUsername}`)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg active:scale-95 transition-transform"
                        style={{ color: '#00C9A7', background: 'rgba(0,201,167,0.1)' }}
                      >
                        Cambiar
                      </button>
                    </div>

                    {/* Amount input */}
                    <div className="text-center py-4 mb-2">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="font-black transition-all duration-200"
                          style={{
                            fontSize: amount.length > 5 ? '28px' : '40px',
                            color: 'var(--muted)',
                          }}
                        >USD</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => { setError(null); setAmount(e.target.value); }}
                          placeholder="0"
                          min="0.01"
                          step="0.01"
                          autoFocus
                          className="bg-transparent text-center font-black tracking-tighter focus:outline-none placeholder:opacity-10 transition-all duration-200 w-full max-w-[220px]"
                          style={{
                            fontSize: amount.length > 8 ? '32px' : amount.length > 5 ? '44px' : '64px',
                            color: error ? '#FF4D6A' : 'var(--primary)',
                          }}
                          required
                        />
                      </div>
                      {amount && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm font-bold mt-2"
                          style={{ color: '#00C9A7' }}
                        >
                          ≈ {convertAmount()}
                        </motion.p>
                      )}

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-bold mt-3 px-4"
                            style={{ color: '#FF4D6A' }}
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2 mb-7 justify-center">
                      {[10, 25, 50, 100].map(v => (
                        <motion.button
                          key={v}
                          type="button"
                          onClick={() => setAmount(String(v))}
                          whileTap={{ scale: 0.92 }}
                          className="px-4 py-2 rounded-full text-sm font-bold transition-colors duration-150"
                          style={amount === String(v) ? {
                            background: 'rgba(0,201,167,0.12)',
                            color: '#00C9A7',
                            border: '1.5px solid rgba(0,201,167,0.3)',
                          } : {
                            background: 'var(--surface2)',
                            color: 'var(--primary)',
                            border: '1.5px solid var(--border)',
                          }}
                        >
                          ${v}
                        </motion.button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="w-full py-4 rounded-2xl font-bold text-base text-white active:scale-[0.98] transition-transform disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #00C9A7 0%, #00A88A 100%)',
                        boxShadow: '0 8px 24px rgba(0,201,167,0.35)',
                      }}
                    >
                      Confirmar envío
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
