# Tech Stack

## El Principio Guía

> No escribas contratos inteligentes desde cero. Usa herramientas que ya existen y enfócate en hacer funcionar el demo.

---

## El Stack Completo

```
┌─────────────────────────────────────────────┐
│            FRONTEND                         │
│   React + Tailwind CSS                      │
│   Mobile-first, corre en browser            │
│   Sin app store necesario para el demo      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         WALLET ABSTRACTION                  │
│   Privy.io                                  │
│   Wallet desde número de teléfono           │
│   Sin seed phrases. 10 líneas de código.    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            BLOCKCHAIN                       │
│   Avalanche Fuji Testnet                    │
│   USDC testnet para transferencias          │
│   Gratis, rápido, sin dinero real           │
└──────────────────┬──────────────────────────┘
                   │
                   │
        ┌──────────▼──────────┐
        │                     │
        │  CURRENCY API       │
        │ exchangerate-api    │
        │  .com (free)        │
        └─────────────────────┘
```

---

## Herramienta por Herramienta

### 🔐 Privy.io — Tu Herramienta Más Importante
**Qué hace:** Crea wallets de Avalanche desde un número de teléfono. El usuario nunca ve seed phrases.

**Por qué lo usas:** Sin esto tienes que pedirle al usuario que instale MetaMask y copie direcciones 0x. Eso rompe toda la narrativa de "se siente como un banco."

**Costo:** Free tier es suficiente para el fin de semana.

**Cómo empezar:**
```bash
npm install @privy-io/react-auth
```

```jsx
// Tan simple como esto:
const { login } = usePrivy();
// El usuario ingresa su número → wallet creado → listo
```

---

### ⛓️ Avalanche Fuji Testnet
**Qué hace:** La red de pruebas de Avalanche. Transacciones reales, sin dinero real.

**Por qué lo usas:** Velocidad sub-segundo, fees casi cero, mismo comportamiento que mainnet.

**Setup:**
- RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
- Chain ID: `43113`
- Faucet (tokens gratis): `https://faucet.avax.network/`

**USDC en testnet:** Usa el bridge de testnet o deploya un ERC-20 simple con OpenZeppelin.

---

### 💱 Exchange Rate API
**Qué hace:** Convierte USDC → MXN / COP / PAB para mostrar al usuario.

**Por qué lo usas:** El usuario nunca debe ver "USDC." Solo ve pesos o su moneda local.

**Costo:** Free tier: 1,500 requests/mes. Más que suficiente.

```javascript
// Una sola llamada:
const rate = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
const mxnRate = rate.json().rates.MXN; // → 17.2
const displayAmount = usdcAmount * mxnRate; // → "$862 MXN"
```

---

### 🎨 Tailwind CSS
**Qué hace:** Utilidades CSS que hacen que tu app se vea profesional sin escribir CSS.

**Por qué lo usas:** Con Tailwind puedes hacer que algo se vea como Nequi en horas, no días.

**Paleta de colores sugerida (feel bancario):**
```
Background: #F8F9FA (gris muy claro)
Primary:    #1A1A2E (azul marino oscuro)
Accent:     #00C9A7 (verde menta — confianza + modernidad)
Text:       #2D3748
Success:    #48BB78
```

---

## Estructura de Archivos Sugerida

```
/src
  /components
    BalanceCard.jsx       ← El número grande de saldo
    SendFlow.jsx          ← Flujo de envío paso a paso
    TransactionHistory.jsx ← Estado de cuenta
    InstitutionalDash.jsx  ← Dashboard de Bankaool
  /hooks
    useWallet.js          ← Privy integration
    useTransfer.js        ← Lógica de transferencia
  /utils
    currency.js           ← Conversiones de moneda
    avalanche.js          ← Config de red
  App.jsx
  index.js
```

---

## Orden de Instalación

```bash
# 1. Crear proyecto
npx create-react-app nombre-del-proyecto
cd nombre-del-proyecto

# 2. Instalar dependencias
npm install @privy-io/react-auth
npm install ethers
npm install @tailwindcss/forms

# 3. Inicializar Tailwind
npx tailwindcss init

# 4. Listo para construir
npm start
```

---

## Lo Que NO Necesitas

- ❌ Solidity / contratos inteligentes propios
- ❌ Hardhat o Foundry
- ❌ The Graph (el faucet de Fuji tiene explorer)
- ❌ MetaMask (Privy lo reemplaza)
- ❌ Backend propio (todo en frontend para el demo)

---

## Plan de Contingencia

Si algo no funciona, en este orden:

1. **Privy falla** → Usa RainbowKit con MetaMask como fallback
2. **Exchange rate API falla** → Hardcodea rates (MXN: 17.2, COP: 4100)
3. **Demo en vivo falla** → Reproduce la grabación de pantalla de backup
4. **WiFi falla** → Hotspot del teléfono + grabación de backup
