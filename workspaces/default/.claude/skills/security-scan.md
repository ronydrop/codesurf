---
name: Scan de Seguranca
description: Verifica OWASP Top 10 no diff com foco em Go e Next.js
---

# Scan de Seguranca

## Quando usar
Antes de merge de PRs com mudancas em endpoints, inputs de usuario, ou autenticacao.

## Checklist OWASP Top 10

### 1. Injection (SQL, Command, LDAP)
- [ ] Queries parametrizadas (pgx: `$1, $2`, nunca string concat)
- [ ] Sem exec/system com input de usuario
- Buscar: string interpolation em queries, `fmt.Sprintf` com SQL

### 2. Broken Authentication
- [ ] Tokens com expiracao
- [ ] Rate limiting em login
- [ ] Senhas hasheadas (bcrypt/argon2)

### 3. Sensitive Data Exposure
- [ ] Sem secrets em codigo (API keys, passwords)
- [ ] HTTPS enforced
- [ ] Logs nao contem PII/senhas
- Buscar: `.env` commitado, hardcoded strings com "key", "secret", "password"

### 4. Broken Access Control
- [ ] Verificacao de ownership em toda rota protegida
- [ ] Sem IDOR (user A acessando dados de user B)

### 5. Security Misconfiguration
- [ ] CORS restritivo (nao `*` em producao)
- [ ] Headers de seguranca (CSP, X-Frame-Options, HSTS)
- [ ] Variaveis de ambiente em producao (nao hardcoded)

### 6. XSS
- [ ] Inputs sanitizados antes de render no frontend
- [ ] Next.js: conteudo HTML dinamico deve usar sanitizador (DOMPurify ou similar)
- [ ] CSP header configurado no Nginx

### 7. Insecure Deserialization
- [ ] Sem unmarshal em input nao validado sem schema

### 8. Components with Known Vulnerabilities
```bash
npm audit
go run golang.org/x/vuln/cmd/govulncheck@latest ./...
```

### 9. Insufficient Logging
- [ ] Auth failures logados com IP e timestamp
- [ ] Operacoes financeiras logadas com audit trail completo

### 10. Finance-specific
- [ ] HMAC em webhooks de payment providers
- [ ] Valores em centavos (int), nunca float
- [ ] Idempotency key em toda operacao de cobranca
