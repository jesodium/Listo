import { useState } from 'react';

export function SendFlow({ onSend, onCancel, onLookup }) {
  const [step, setStep] = useState(1);
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async (e) => {
    e.preventDefault();
    if (!targetUsername) return;
    
    setLoading(true);
    try {
      const data = await onLookup(targetUsername);
      setRecipient(data);
      setStep(2);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && recipient) {
      onSend({ 
        targetUsername, 
        amount: parseFloat(amount), 
        recipientAddress: recipient.wallet_address 
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary">Enviar dinero</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
      </div>

      {step === 1 && (
        <form onSubmit={handleNext}>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Destinatario
          </label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">@</span>
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              placeholder="nombre_de_usuario"
              className="w-full pl-8 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all bg-gray-50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!targetUsername || loading}
            className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? 'Buscando...' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-4 border-white shadow-sm">
              {recipient?.avatar ? (
                <img src={recipient.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent/10 flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
            <p className="font-bold text-primary text-lg">@{targetUsername}</p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">{recipient?.wallet_address.slice(0,6)}...{recipient?.wallet_address.slice(-4)}</p>
          </div>

          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
            ¿Cuánto quieres enviar?
          </label>
          <div className="relative mb-6">
            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">USDC</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full pl-16 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-right text-xl font-bold bg-gray-50"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={!amount}
              className="flex-[2] bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
            >
              Confirmar Pago
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
