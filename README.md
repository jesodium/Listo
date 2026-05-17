# listo

[![deploy website](https://github.com/jesodium/Listo/actions/workflows/static.yml/badge.svg)](https://github.com/jesodium/Listo/actions/workflows/static.yml)
[![license: mit](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

cross-border payments for latam built on avalanche. removes crypto complexity for a premium banking experience.

## features
- email-to-wallet: no seed phrases, powered by privy.
- gasless: erc-4337 smart wallets via pimlico.
- multi-currency: mxn, cop, gtq, pen, clp, ars.
- instant: <3s settlement on avalanche fuji.
- banking ui: mobile-native design and interactions.

## stack
- frontend: react, vite, tailwind.
- auth/wallet: privy.
- chain: avalanche fuji (usdc).
- infra: permissionless.js, pimlico.
- backend: node.js, express, sqlite.

## setup
1. node.js v18+ required.
2. `cp listo-app/.env.example listo-app/.env`
3. add `VITE_PRIVY_APP_ID`.
4. `npm run install-all`
5. `npm run dev`

## structure
- `listo-app/`: react frontend and blockchain hooks.
- `listo-backend/`: express server and user directory.
- `website/`: static marketing landing page.
- `docs/`: documentation and roadmap.

built for avalanche latam hackathon.
