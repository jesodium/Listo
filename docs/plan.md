# Plan de Fin de Semana

## La Regla de Oro

> Scope creep mata hackathons. Si no está en el MVP de [mvp.md](mvp.md), no lo construyas.

---

## División del Equipo

| | Tú (Técnico) | Tu Socio (Negocio) |
|---|---|---|
| **Foco** | React app + blockchain | Pitch + deck + narrativa |
| **Entregable** | Demo funcionando en 2 teléfonos | 8 slides + script de demo |
| **Criterio de éxito** | Send/receive funciona en vivo | Jueces entienden el negocio en 30 seg |

---

## Cronograma Detallado

### 🌅 Día 1 — Mañana (9am - 1pm)

**Tú:**
- [ ] `npx create-react-app` — proyecto creado
- [ ] Tailwind CSS instalado y funcionando
- [ ] Privy.io instalado — cuenta creada en privy.io
- [ ] Home screen con saldo en $0.00 visible en móvil
- [ ] Wallet de testnet creado desde número de teléfono

**Tu socio:**
- [ ] Investigar: estadísticas de remesas en LatAm (cifras reales)
- [ ] Investigar: fees actuales de Western Union MX→CO
- [ ] Escribir la historia de María e Isabella (2 párrafos)
- [ ] Slide 1 y Slide 2 terminados

**Check de mediodía:** ¿Privy crea wallet desde teléfono? Si no, resolver antes de continuar.

---

### ☀️ Día 1 — Tarde (2pm - 7pm)

**Tú:**
- [ ] Fuji testnet configurado
- [ ] USDC testnet en wallet de prueba (faucet)
- [ ] Botón "Enviar" muestra formulario
- [ ] Transacción de testnet ejecutada (aunque sea fea)
- [ ] Saldo del destinatario se actualiza

**Tu socio:**
- [ ] Diseño de UI en Canva/Figma — cómo debe verse la app
- [ ] Slide 3 (demo placeholder) y Slide 4 (por qué blockchain)
- [ ] Paleta de colores y tipografía definida

**Check de tarde:** ¿La transacción llega al destinatario? Ese es el hito más importante del Día 1.

---

### 🌆 Día 1 — Noche (8pm - 11pm)

**Tú:**
- [ ] UI empieza a verse como banco (aplicar diseño del socio)
- [ ] Conversión de moneda integrada (exchangerate-api)
- [ ] Fee visible en la pantalla de confirmación

**Tu socio:**
- [ ] Slide 5 (por qué Avalanche) y Slide 6 (modelo de negocio)
- [ ] Tabla de números de Bankaool calculada
- [ ] Empezar Slide 7 (mercado)

---

### 🌅 Día 2 — Mañana (9am - 1pm)

**Tú:**
- [ ] Dashboard institucional de Bankaool (pantalla separada)
- [ ] Transacción aparece en dashboard en tiempo real
- [ ] App funcionando en dos teléfonos físicos
- [ ] Saldo se actualiza instantáneamente

**Tu socio:**
- [ ] Slide 7 (mercado) y Slide 8 (el ask) terminados
- [ ] Deck completo — 8 slides revisados
- [ ] Script del demo escrito palabra por palabra

**Check de mediodía:** ¿El demo completo funciona de punta a punta en dos teléfonos? Si no, aquí se prioriza sobre cualquier feature adicional.

---

### ☀️ Día 2 — Tarde (2pm - 6pm)

**Tú:**
- [ ] Bugs del demo resueltos
- [ ] Historial de transacciones (si hay tiempo)
- [ ] Selector de corredor MX→CO (si hay tiempo)
- [ ] GitHub repo limpio con README

**Tu socio:**
- [ ] Primera prueba del pitch completo (8 min cronometrados)
- [ ] Ajustar slides según feedback
- [ ] Preparar preguntas difíciles y respuestas
- [ ] Grabación de pantalla de backup del demo

---

### 🌆 Día 2 — Noche (7pm - 9pm)

**Juntos:**
- [ ] Ensayo completo del pitch + demo 3 veces
- [ ] Cronometrar: debe caber en el tiempo asignado
- [ ] Verificar que el demo funciona en el WiFi del venue
- [ ] Tener hotspot como backup
- [ ] Cargar ambos teléfonos al 100%
- [ ] Dormir

---

## Decisiones Pre-tomadas (No Debatir el Fin de Semana)

Estas decisiones ya están tomadas. No las reabras durante el hackathon:

| Decisión | Respuesta |
|---|---|
| ¿Qué nombre usamos? | Decidir ANTES del hackathon |
| ¿Mainnet o testnet? | **Testnet siempre** |
| ¿Construimos cash-in? | **No. Lo mencionamos en el pitch** |
| ¿Construimos KYC? | **No. Bankaool lo maneja** |
| ¿Agregamos ScoreChain? | **No. Es roadmap** |
| ¿React Native o web? | **Web responsive** |

---

## Señales de Alarma

Si cualquiera de estas cosas pasa, para todo y reorienta:

- 🔴 Son las 7pm del Día 1 y la transacción no funciona → Simplifica. Usa mock data.
- 🔴 Son las 12pm del Día 2 y el demo no funciona en teléfonos → Usa laptops. No teléfonos.
- 🔴 El deck tiene más de 10 slides → Corta. 8 máximo.
- 🔴 El pitch dura más de 9 minutos → Corta el Slide 7.
- 🔴 Estás construyendo algo que no está en el MVP → Para. Vuelve a [mvp.md](mvp.md).

---

## Lo Que Entrega el Equipo

- [ ] **GitHub repo** — código limpio con README explicando cómo correr el proyecto
- [ ] **Demo en vivo** — dos teléfonos, funciona, 3 segundos
- [ ] **Pitch deck** — 8 slides, en PDF y en presentación
- [ ] **Video backup** — grabación del demo funcionando
- [ ] **Descripción del proyecto** — 200 palabras para el formulario de entrega

---

## Mantra del Fin de Semana

> **Un demo que funciona con 4 features gana a un demo que falla con 10.**
