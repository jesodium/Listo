const FALLBACK_RATES = {
  MXN: 17.2,
  COP: 4100,
  PAB: 1,
  GTQ: 7.8,
  HNL: 24.6,
  PEN: 3.7,
  CLP: 940,
  ARS: 850,
  USD: 1,
};

export async function getExchangeRates() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    return data.rates;
  } catch {
    console.warn('Using fallback exchange rates');
    return FALLBACK_RATES;
  }
}

export function convertCurrency(amount, rate) {
  return amount * rate;
}

export function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(amount);
}

export function formatCurrencyCode(amount, currency) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
  }).format(amount);
}
