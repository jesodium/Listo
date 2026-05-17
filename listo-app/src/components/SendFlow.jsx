import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';

export function SendFlow({ onSend, onCancel, onLookup, currentUsername, initialRecipient, currentBalance }) {
  const [step, setStep] = useState(initialRecipient ? 2 : 1);
  const [targetUsername, setTargetUsername] = useState(initialRecipient?.username || '');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(initialRecipient || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);

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
      setError(`Saldo insuficiente. Tienes $${currentBalance.toFixed(2)} USDC.`);
      return;
    }
    if (numAmount && recipient) {
      onSend({ targetUsername, amount: numAmount, recipientAddress: recipient.wallet_address });
    }
  };

  return (
    <>
      {/* backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <motion.div
          className="w-full max-w-[480px] bg-background rounded-t-[32px] p-6 pb-10 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
        >

          {/* grabber */}
          <div className="w-12 h-1.5 bg-muted/20 rounded-full mx-auto mb-6" />

          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em]">Paso {step} de 2</p>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                {step === 1 ? 'Enviar a quién' : '¿Cuánto enviar?'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted active:scale-95 transition"
            >
              ✕
            </button>
          </div>

          {/* progress */}
          <div className="flex gap-1.5 mb-6">
            <div className="flex-1 h-1 rounded-full bg-accent" />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step === 2 ? 'bg-accent' : 'bg-muted/10'}`} />
          </div>

          {step === 1 ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Usuario destinatario</label>
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className={`text-xs font-bold flex items-center gap-1.5 transition ${showScanner ? 'text-danger' : 'text-accent'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3m4 0h-1m-3 3v3m3-3v3m-3-3h3"/>
                  </svg>
                  {showScanner ? 'Cancelar cámara' : 'Escanear QR'}
                </button>
              </div>

              {showScanner && (
                <div className="mb-4 rounded-2xl overflow-hidden bg-black aspect-square relative border-2 border-accent/20">
                  <div id="qr-reader" className="w-full h-full" />
                  <div className="absolute inset-0 border-2 border-accent/30 pointer-events-none animate-pulse" />
                </div>
              )}

              <form onSubmit={handleNext}>
                <div className={`relative mb-4 rounded-2xl bg-surface border-2 transition ${error ? 'border-danger' : 'border-transparent focus-within:border-accent'}`}>
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">@</span>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => { setError(null); setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_x]/g, '').toLowerCase()); }}
                    placeholder="nombre_de_usuario"
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 bg-transparent rounded-2xl focus:outline-none font-bold text-primary placeholder:text-muted/30"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={!targetUsername || loading}
                  className="w-full bg-primary text-background py-4 rounded-2xl font-bold text-base disabled:opacity-40 active:scale-[0.98] transition shadow-xl shadow-primary/10"
                >
                  {loading ? 'Buscando...' : 'Continuar'}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* recipient card */}
              <div className="flex items-center gap-3 mb-6 bg-surface p-3 rounded-2xl border border-muted/5 shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-background flex-shrink-0">
                  {recipient?.avatar ? (
                    <img src={recipient.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-accent-soft flex items-center justify-center text-accent font-black text-lg">
                      {targetUsername[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Enviando a</p>
                  <p className="font-bold text-primary truncate">
                    {recipient?.display_name || (targetUsername.startsWith('0x') ? `${targetUsername.slice(0,6)}...${targetUsername.slice(-4)}` : `@${targetUsername}`)}
                  </p>
                  {recipient?.display_name && <p className="text-[10px] text-muted font-bold">@{targetUsername}</p>}
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-accent font-bold active:scale-95 px-2">Cambiar</button>
              </div>

              {/* amount */}
              <div className="text-center py-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold mb-2">Monto</p>
                <div className="flex items-center justify-center gap-1 px-4">
                  <span className={`font-black text-muted transition-all ${amount.length > 5 ? 'text-2xl' : 'text-4xl'}`}>$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setError(null); setAmount(e.target.value); }}
                    placeholder="0"
                    min="0.01"
                    step="0.01"
                    autoFocus
                    className={`bg-transparent text-center font-black tracking-tighter focus:outline-none placeholder:text-muted/10 transition-all ${
                      amount.length > 8 ? 'text-3xl' : 
                      amount.length > 5 ? 'text-4xl' : 
                      'text-6xl'
                    } ${error ? 'text-danger' : 'text-primary'} w-full max-w-full`}
                    required
                  />
                </div>
                <p className="text-xs font-bold text-muted mt-1 uppercase tracking-wider">USDC</p>
                {error && step === 2 && (
                  <p className="text-xs font-bold text-danger mt-3 animate-pulse px-4">{error}</p>
                )}
              </div>

              {/* quick amounts */}
              <div className="flex gap-2 mb-6 justify-center">
                {[10, 25, 50, 100].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className="px-4 py-2 rounded-full bg-surface text-primary text-sm font-bold border border-muted/5 shadow-sm active:scale-95 transition hover:bg-accent-soft hover:text-accent"
                  >
                    ${v}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-accent/30 disabled:opacity-40 active:scale-[0.98] transition"
              >
                Confirmar envío
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
