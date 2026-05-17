# listo

[![deploy website](https://github.com/jesodium/Listo/actions/workflows/static.yml/badge.svg)](https://github.com/jesodium/Listo/actions/workflows/static.yml)
[![license: mit](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

![avalanche](https://img.shields.io/badge/built%20on-avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)
![usdc](https://img.shields.io/badge/settlement-usdc-2775CA?style=for-the-badge&logo=circle&logoColor=white)

[en] cross-border payments for latam built on avalanche. removes crypto complexity for a premium banking experience.

[es] pagos transfronterizos para latam construidos sobre avalanche. elimina la complejidad crypto para una experiencia bancaria premium.

---

## tech stack / tecnologías

![react](https://img.shields.io/badge/react-20232a?style=flat-square&logo=react&logoColor=61dafb)
![vite](https://img.shields.io/badge/vite-646cff?style=flat-square&logo=vite&logoColor=white)
![tailwind](https://img.shields.io/badge/tailwind-38b2ac?style=flat-square&logo=tailwind-css&logoColor=white)
![node.js](https://img.shields.io/badge/node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![sqlite](https://img.shields.io/badge/sqlite-003b57?style=flat-square&logo=sqlite&logoColor=white)
![erc-4337](https://img.shields.io/badge/account--abstraction-erc--4337-E84142?style=flat-square)

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

---

built for avalanche latam hackathon / construido para el hackathon de avalanche latam.
