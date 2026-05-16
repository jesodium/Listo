# MVP

## El MVP en Una Oración

> Una interfaz con marca Bankaool donde un usuario envía dinero cross-border en Avalanche testnet, llega en segundos, y un dashboard bancario muestra la transacción en tiempo real.

---

## Lo Que DEBE Funcionar (No Negociable)

### 1. ✅ Creación de Wallet por Número de Teléfono
- Usuario ingresa número de teléfono + PIN
- App crea un wallet de Avalanche en el fondo
- Usuario NUNCA ve seed phrase ni dirección 0x
- Solo ve su **saldo: $0.00**

> Sin esto, toda la historia se cae.

---

### 2. ✅ Flujo de Envío
```
Toca "Enviar"
→ Ingresa número de teléfono del destinatario
→ Ingresa monto en moneda local (pesos, no USDC)
→ Ve fee: "$1.50"
→ Confirma con PIN
→ "Enviado ✓" en menos de 5 segundos
```

> Este es tu momento demo. Debe ser impecable. Practicarlo 20 veces.

---

### 3. ✅ Saldo en Múltiples Monedas
- App permite seleccionar moneda preferida (MXN, COP, GTQ, PEN, etc.)
- Convierte saldo USDC a la moneda elegida automáticamente
- Se actualiza en tiempo real usando Exchange Rate API

### 4. ✅ Historial de Transacciones
- Se ve como un estado de cuenta bancario
- Muestra nombre del remitente (del número de teléfono)
- Fecha, monto, fee, estado: Completado ✓

---

## Lo Que DEBERÍA Funcionar (Bueno Tener)

### 5. Selector de Corredor Dinámico
- Usuario elige la moneda de destino en el flujo de envío
- App muestra tasa de cambio y fee por adelantado
- Sin sorpresas en la confirmación

---

## Lo Que MENCIONAS Pero NO Construyes

Sé explícito en el pitch — los jueces respetan la honestidad:

| Feature | Por Qué No Lo Construyes |
|---|---|
| ❌ Cash-in en OXXO / Baloto | Estrategia de go-to-market, no MVP |
| ❌ KYC real / compliance | Bankaool lo maneja bajo su licencia |
| ❌ ScoreChain (crédito) | Roadmap a 6 meses |
| ❌ Red de agentes multi-país | Estrategia de partnerships |
| ❌ Dinero real / mainnet | Estás en testnet — está bien |

---

## El Riesgo Más Grande

> No es el código. Es que el demo falle en vivo.

**Mitigaciones:**
- Usa testnet, no mainnet — sin sorpresas de gas
- Ten el demo pre-cargado en ambos teléfonos antes de subir al escenario
- Ten una grabación de pantalla de backup por si falla el WiFi
- Practica el flujo exacto del demo, no solo el código

---

## Criterios de Evaluación vs Tu MVP

| Criterio | Cómo Lo Cumples |
|---|---|
| **Viabilidad de negocio** | Números de Bankaool + mercado $150B |
| **Viabilidad técnica** | Demo funcionando en testnet |
| **Avance del MVP** | Send/receive + dashboard = loop completo |
| **Uso de Avalanche** | Fuji testnet + USDC nativo + dashboard institucional |
| **Modelo de negocio** | $0.50/tx wholesale, claro y simple |
