export function BalanceCard({ balance = 0.00, currency = 'USD' }) {
  return (
    <div className="bg-primary rounded-2xl p-6 text-white shadow-lg">
      <p className="text-sm text-gray-300 mb-1">Saldo disponible</p>
      <p className="text-4xl font-bold">
        ${balance.toFixed(2)} <span className="text-lg font-normal">{currency}</span>
      </p>
    </div>
  );
}
