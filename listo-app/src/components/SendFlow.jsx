import { useState } from 'react';

export function SendFlow({ onSend }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1 && phone) {
      setStep(2);
    } else if (step === 2 && amount) {
      onSend({ phone, amount: parseFloat(amount) });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-primary mb-4">Enviar dinero</h2>

      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-600 mb-2">
            Número de teléfono del destinatario
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={!phone}
            className="w-full mt-4 bg-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 mb-2">Enviando a: <span className="font-medium">{phone}</span></p>
          <label className="block text-sm text-gray-600 mb-2">
            Monto (USD)
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
