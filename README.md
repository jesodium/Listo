# listo

[![deploy website](https://github.com/jesodium/Listo/actions/workflows/static.yml/badge.svg)](https://github.com/jesodium/Listo/actions/workflows/static.yml)
[![license: mit](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

[en] cross-border payments for latam built on avalanche. removes crypto complexity for a premium banking experience.

[es] pagos transfronterizos para latam construidos sobre avalanche. elimina la complejidad crypto para una experiencia bancaria premium.

---

## features / características

### [en]
- email-to-wallet: no seed phrases, powered by privy.
- gasless: erc-4337 smart wallets via pimlico.
- multi-currency: mxn, cop, gtq, pen, clp, ars.
- instant: <3s settlement on avalanche fuji.
- banking ui: mobile-native design and interactions.

### [es]
- email-to-wallet: sin frases semilla, potenciado por privy.
- gasless: smart wallets erc-4337 vía pimlico.
- multi-moneda: mxn, cop, gtq, pen, clp, ars.
- instantáneo: liquidación <3s en avalanche fuji.
- ui bancaria: diseño y funciones nativas móviles.

---

## stack / tecnologías
- frontend: react, vite, tailwind.
- auth/wallet: privy.
- chain/red: avalanche fuji (usdc).
- infra: permissionless.js, pimlico.
- backend: node.js, express, sqlite.

---

## setup / configuración
1. node.js v18+ required.
2. `cp listo-app/.env.example listo-app/.env`
3. add `VITE_PRIVY_APP_ID`.
4. `npm run install-all`
5. `npm run dev`

---

## structure / estructura
- `listo-app/`: react frontend & blockchain hooks.
- `listo-backend/`: express server & user directory.
- `website/`: static marketing landing page.
- `docs/`: documentation & roadmap.

---

built for avalanche latam hackathon / construido para el hackathon de avalanche latam.
