# Listo

Avalanche LatAm Hackathon — Cross-border payments infrastructure. Phone number onboarding. Instant settlement. Designed for banks.

## Problem

50% of adults in Latin America don't have a bank account. 80%+ have smartphones. Cross-border remittances cost 5-10% in fees and take 2-5 days.

## Solution

A mobile-first web app that lets users send money across borders using their phone number. No bank account, no seed phrases, no crypto knowledge needed. Settlement happens on Avalanche Fuji testnet in seconds.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Wallet:** Privy.io (phone number → embedded wallet)
- **Blockchain:** Avalanche Fuji Testnet (USDC)
- **Currency:** exchangerate-api.com (USD → MXN/COP/PAB)

## Quick Start

You can now start both the frontend and backend with a single command from the root directory:

```bash
npm install
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3001`

If you need to install dependencies for all subprojects:
```bash
npm run install-all
```

## Setup

1. Create account at [privy.io](https://privy.io)
2. Get your App ID from dashboard
3. Copy `.env.example` to `.env` and add your App ID:

```
VITE_PRIVY_APP_ID=your-privy-app-id
```

## Project Structure

```
listo-app/src/
  components/
    AppProvider.jsx    ← Privy wrapper
    BalanceCard.jsx    ← Balance display
    SendFlow.jsx       ← Send money flow
  hooks/
    useWallet.js       ← Wallet abstraction
  utils/
    avalanche.js       ← Fuji testnet config
    currency.js        ← Exchange rate helpers
  App.jsx              ← Main screen
  main.jsx             ← Entry point
```

## Features

- Phone number login → embedded wallet created automatically
- Balance displayed in local currency (MXN/COP/PAB)
- Send money flow: phone → amount → confirm
- Mobile-first, responsive design
- Banking-style UI (dark navy + mint green palette)

## Docs

See `docs/` for project planning:

- `proyecto.md` — Project overview and problem space
- `posicionamiento.md` — B2B2C positioning strategy
- `mvp.md` — MVP requirements
- `tech-stack.md` — Technical decisions
- `pitch.md` — Pitch narrative and slides
- `plan.md` — Weekend build schedule
