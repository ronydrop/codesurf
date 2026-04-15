---
name: Review Codigo Financeiro
description: Analisa diff buscando violacoes em codigo que toca em dinheiro
---

# Review Codigo Financeiro

## Quando usar
Antes de merge de qualquer PR que envolva pagamentos, billing, subscriptions ou manipulacao de valores monetarios.

## Checklist

### 1. Tipos Monetarios
- [ ] Valores em int/int64 (centavos). NUNCA float/double/decimal.
- Buscar: `float`, `double`, `decimal`, `parseFloat`, `Number(` em contexto de money/price/amount

### 2. Idempotency
- [ ] Toda operacao financeira tem idempotency key
- [ ] Webhooks verificam se evento ja foi processado
- Buscar: ausencia de `idempotency`, `event_id` check

### 3. HMAC Verification
- [ ] Webhooks Stripe verificam signature antes de processar
- Buscar: `stripe.webhooks.constructEvent`, `webhook.ConstructEvent`, `Stripe::Webhook::Sig`

### 4. Race Conditions
- [ ] SELECT FOR UPDATE em operacoes de saldo
- [ ] Transacoes serializaveis quando necessario
- Buscar: read-then-write patterns sem lock, `UPDATE ... SET balance = balance +`

### 5. Audit Logging
- [ ] Log com: who, what, when, amount, idempotency_key
- Buscar: mutacoes sem log adjacente

### 6. Fail-Safe
- [ ] Na duvida, NAO cobra duas vezes
- [ ] Retry com exponential backoff
- Buscar: retry sem backoff, catch vazio em cobranca

### 7. Currency
- [ ] BRL em centavos. Conversao para display so em apresentacao.
- Buscar: `/ 100`, `* 100` fora da camada de view
