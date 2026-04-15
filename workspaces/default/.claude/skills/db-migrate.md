---
name: Executar Migration
description: Roda migration PostgreSQL inline via pgx, com verificacao pre/pos
---

# Executar Migration

## Quando usar
Ao aplicar mudancas de schema no PostgreSQL do Aprovei.

## Passos

### 1. Pre-verificacao
Verificar schema atual:
```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### 2. Backup do schema
```bash
ssh root@216.238.114.122 "pg_dump -s aprovei > /tmp/schema-backup-$(date +%Y%m%d%H%M).sql"
```

### 3. Executar migration UP
Rodar a migration inline via pgx/v5 (transacao completa, BEGIN/COMMIT).

### 4. Pos-verificacao
Repetir query do passo 1 e comparar com pre-verificacao.

### 5. Testar rollback
Em ambiente de staging, verificar que a migration DOWN reverte corretamente.

## Regras
- NUNCA execute DROP TABLE/COLUMN em producao sem backup
- Colunas monetarias: BIGINT (centavos)
- Adicionar coluna NOT NULL: primeiro adicione nullable, backfill, depois set NOT NULL
- Indices: CREATE INDEX CONCURRENTLY para nao bloquear reads
