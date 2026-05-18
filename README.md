# listo

[![github license](https://img.shields.io/github/license/jesodium/Listo?color=E84142&style=flat-square)](https://github.com/jesodium/Listo/blob/main/LICENSE)
[![github stars](https://img.shields.io/github/stars/jesodium/Listo?color=E84142&style=flat-square)](https://github.com/jesodium/Listo/stargazers)
[![avalanche network](https://img.shields.io/badge/network-avalanche-E84142?style=flat-square)](https://docs.avax.network)

[en] cross-border payments for latam built on avalanche. removes crypto complexity for a premium banking experience.

[es] pagos transfronterizos para latam construidos sobre avalanche. elimina la complejidad crypto para una experiencia bancaria premium.

---

## app / aplicación

<img src="readme%20assets/iMockup%20-%20iPhone%2014.png" width="200"/>
<img src="readme%20assets/iMockup%20-%20iPhone%2014-2.png" width="200"/>
<img src="readme%20assets/iMockup%20-%20iPhone%2014-3.png" width="200"/>
<img src="readme%20assets/iMockup%20-%20iPhone%2014-4.png" width="200"/>
<img src="readme%20assets/iMockup%20-%20iPhone%2014-5.png" width="200"/>

---

## core engine / motor principal

![avalanche](https://img.shields.io/badge/avalanche-sub--second%20finality-E84142?style=for-the-badge&logo=avalanche&logoColor=white)
![erc-4337](https://img.shields.io/badge/erc--4337-account%20abstraction-2775CA?style=for-the-badge&logo=ethereum&logoColor=white)

---

## tech stack / tecnologías

- **chain / red:** avalanche fuji testnet (usdc)
- **auth / billetera:** privy (email-to-wallet)
- **infra:** permissionless.js + pimlico (erc-4337)
- **frontend:** react, vite, tailwind, framer motion
- **backend:** node.js, express, sqlite

---

## features / características

### [en]
- email-to-wallet: no seed phrases, powered by privy.
- gasless: erc-4337 smart wallets via pimlico.
- multi-currency: real-time local rates (mxn, cop, pen, etc).
- instant: sub-second finality on avalanche.

### [es]
- email-to-wallet: sin frases semilla, potenciado por privy.
- gasless: smart wallets erc-4337 vía pimlico.
- multi-moneda: tasas locales en tiempo real (mxn, cop, pen, etc).
- instantáneo: finalidad en menos de un segundo en avalanche.

---

## setup / configuración
1. node.js v18+ required.
2. `cp listo-app/.env.example listo-app/.env`
3. add `VITE_PRIVY_APP_ID`.
4. `npm install` (root) & `npm run install-all`
5. `npm run dev`

---

## structure / estructura
- `listo-app/`: react frontend & blockchain hooks.
- `listo-backend/`: express server & user directory.
- `website/`: static marketing landing page.

---

built for avalanche latam hackathon / construido para el hackathon de avalanche latam.
