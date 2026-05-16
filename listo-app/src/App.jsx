import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BalanceCard } from './components/BalanceCard';
import { SendFlow } from './components/SendFlow';

function App() {
  const { login, authenticated, user, ready } = usePrivy();
  const [balance, setBalance] = useState(0.00);
  const [showSend, setShowSend] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-lg">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-primary mb-2">Listo</h1>
          <p className="text-gray-600 mb-8">Pagos transfronterizos instantáneos</p>

          <button
            onClick={login}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:opacity-90 transition"
          >
            Iniciar sesión con teléfono
          </button>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Powered by Bankaool · Avalanche Fuji Testnet
          </p>
        </div>
      </div>
    );
  }

  const handleSend = ({ phone, amount }) => {
    console.log('Sending', amount, 'to', phone);
    setBalance((prev) => prev - amount);
    setShowSend(false);
    alert(`$${amount.toFixed(2)} enviado a ${phone}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Listo</h1>
          <div className="text-sm">
            {user?.wallet?.address
              ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
              : 'Conectado'}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <BalanceCard balance={balance} />

        <button
          onClick={() => setShowSend(true)}
          className="w-full bg-accent text-white py-4 rounded-xl font-semibold text-lg shadow-md hover:opacity-90 transition"
        >
          Enviar dinero
        </button>

        {showSend && <SendFlow onSend={handleSend} />}

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-primary mb-3">Historial</h2>
          <p className="text-gray-500 text-sm">Sin transacciones aún</p>
        </div>
      </main>
    </div>
  );
}

export default App;
