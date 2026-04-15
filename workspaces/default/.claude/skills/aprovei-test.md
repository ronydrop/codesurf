---
name: Testar Aprovei
description: Roda test suite completo do Aprovei (backend Go + frontend Next.js)
---

# Testar Aprovei

## Quando usar
Antes de deploy ou merge de mudancas no Aprovei.

## Passos

### Backend (Go)
```bash
cd /path/to/aprovei/backend
go vet ./...
go test ./... -v -count=1 -race
```

### Frontend (Next.js)
```bash
cd /path/to/aprovei/frontend
npm run lint
npx tsc --noEmit
npm run build
```

### Verificacoes adicionais
- Se mudou migrations: verificar que UP e DOWN funcionam
- Se mudou webhooks: verificar HMAC + idempotency presentes
- Se mudou cloaking layers: verificar que nenhuma camada foi removida sem substituicao

## Output
Reportar:
- Total de testes passando/falhando
- Warnings de lint
- Erros de tipo TypeScript
- Build success/failure
