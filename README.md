# 🏦 Listo — Cross-Border Payments for LatAm

> **"Financial inclusion shouldn't require a seed phrase."**

Listo is a mobile-native payments infrastructure built on **Avalanche** that allows anyone in Latin America to send money across borders instantly. We've removed the complexity of crypto to create an experience that feels like a premium banking app.

---

## 🌟 Key Features

*   **📧 Email-to-Wallet Onboarding:** No seed phrases, no private keys. Users sign in with their email, and an embedded wallet is created automatically via **Privy**.
*   **⛽ Gasless Transactions (ERC-4337):** Powered by **Smart Wallets**.
*   **🌎 Multi-Currency Reference:** Display balances and transaction previews in local currencies (**MXN, COP, GTQ, PEN, CLP, ARS**) using real-time exchange rates.
*   **⚡ Instant Settlement:** Cross-border transfers settle on the **Avalanche Fuji Testnet** in less than 3 seconds.
*   **📱 Banking-Grade UI:** A "crypto-invisible" design focused on institutional trust, sleek animations, and mobile-native interactions.
*   **📜 Live Transaction History:** A real-time ledger with block explorer links and user avatars for a social, personal feel.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite) + Tailwind CSS
*   **Auth & Wallet:** [Privy.io](https://privy.io) (Embedded Wallets + Email Auth)
*   **Blockchain:** Avalanche Fuji Testnet
*   **Assets:** USDC (Native/Testnet)
*   **Smart Accounts:** Permissionless.js + Pimlico (ERC-4337)
*   **Backend:** Node.js + Express + SQLite (Username-to-Address mapping)
*   **Rates:** ExchangeRate-API

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- A Privy App ID (from [dashboard.privy.io](https://dashboard.privy.io))

### 2. Environment Setup
Copy the example env file in `listo-app`:
```bash
cp listo-app/.env.example listo-app/.env
```
Add your Privy App ID:
```
VITE_PRIVY_APP_ID=your-privy-app-id
```

### 3. Run the Project
From the root directory, install everything and start both servers:
```bash
# Install all dependencies
npm run install-all

# Start Frontend (5173) and Backend (3001)
npm run dev
```

---

## 📂 Project Structure

*   `listo-app/`: The React frontend containing the banking UI and blockchain hooks.
*   `listo-backend/`: Express server managing the username directory and transaction persistence.
*   `website/`: Static marketing landing page, deployed to GitHub Pages.
*   `docs/`: Full project documentation, including the pitch deck script and roadmap.
*   `agents.md`: Documentation of the multi-agent orchestration used to build this project.

---

## 🏆 Hackathon Tracks
*   **Inclusión Financiera Digital:** By removing the barrier of crypto complexity and providing a familiar "banking" interface, we enable the 50% of unbanked LatAm adults to enter the digital economy.

---

**Built with 💙 for the Avalanche LatAm Hackathon.**
