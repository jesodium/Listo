import { useState } from 'react';

export function SendFlow({ onSend, onCancel }) {
  const [step, setStep] = useState(1);
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1 && targetUsername) {
      setStep(2);
    } else if (step === 2 && amount) {
      onSend({ targetUsername, amount: parseFloat(amount) });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Enviar dinero</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-600 mb-2">
            @usuario del destinatario
          </label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-3 text-gray-400 font-medium">@</span>
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              placeholder="isabella456"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={!targetUsername}
            className="w-full bg-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 mb-2">Enviando a: <span className="font-medium text-primary">@{targetUsername}</span></p>
          <label className="block text-sm text-gray-600 mb-2">
            Monto (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={!amount}
              className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
