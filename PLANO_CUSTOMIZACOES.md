# Plano de Customizacoes Contex — Baseado no Vault "brain"

Gerado em 2026-04-13 a partir da analise do vault Obsidian (`~/brain/`), dos 3 VPS, dos projetos ativos e do stack tecnico real.

---

## 1. PROMPTS (14 templates)

### 1.1 Desenvolvimento Go (Aprovei/Shadow)

| ID | Nome | Campos | Template resumido |
|----|------|--------|-------------------|
| `go-http-handler` | Go HTTP Handler | `method`, `path`, `entity` | Handler stdlib net/http com middleware chain, error handling, JSON response |
| `go-table-test` | Go Table Test | `function`, `package` | Table-driven test com subtests, setup/teardown, edge cases |
| `go-migration-sql` | Migracao SQL | `table`, `operation(select: add-column/create-table/alter/index)` | SQL migration inline (sem ORM), com rollback, idempotente |

### 1.2 Financas e Pagamentos

| ID | Nome | Campos | Template resumido |
|----|------|--------|-------------------|
| `stripe-webhook` | Stripe Webhook Handler | `event_type`, `language(select: go/php/node)` | Handler com HMAC verification, idempotency check, valores em centavos (nunca float) |
| `payment-flow` | Fluxo de Pagamento | `provider(select: stripe/pix/boleto)`, `plan` | Checkout -> webhook -> ativacao, com retry e dead-letter |

### 1.3 Next.js / Frontend

| ID | Nome | Campos | Template resumido |
|----|------|--------|-------------------|
| `nextjs-server-action` | Next.js Server Action | `action`, `entity` | Server action com Zod validation, revalidatePath, error boundary |
| `nextjs-page` | Next.js App Router Page | `route`, `data_source` | Page com generateMetadata, loading.tsx, error.tsx, server component default |

### 1.4 Infraestrutura

| ID | Nome | Campos | Template resumido |
|----|------|--------|-------------------|
| `nginx-reverse-proxy` | Nginx Reverse Proxy | `domain`, `upstream_port`, `ssl(select: yes/no)` | Block server com proxy_pass, headers, rate limiting, TLS |
| `systemd-service` | Systemd Unit | `service_name`, `exec_path`, `user` | Unit file com restart policy, journal logging, env file |
| `pm2-ecosystem` | PM2 Ecosystem | `app_name`, `script`, `instances` | ecosystem.config.js com cluster mode, log rotation, env |

### 1.5 Operacional

| ID | Nome | Campos | Template resumido |
|----|------|--------|-------------------|
| `incident-report` | Relatorio de Incidente | `service`, `severity(select: P1/P2/P3)`, `summary` | Timeline, root cause, mitigation, follow-up actions |
| `pr-description` | Descricao de PR | `type(select: feat/fix/refactor/chore)`, `scope` | Summary, changes, test plan, breaking changes |
| `commit-conventional` | Commit Convencional | `type(select: feat/fix/refactor/perf/chore/docs)`, `scope`, `description` | Conventional commit message em ingles |
| `vault-ingest` | Vault Ingest | `source`, `topic`, `tags` | Template para ingerir conteudo no brain vault seguindo o protocolo |

---

## 2. SKILLS (10 habilidades)

### 2.1 Deploy e Operacoes

| ID | Nome | Comando | Descricao |
|----|------|---------|-----------|
| `deploy-shadow` | Deploy VPS Shadow | `/deploy-shadow` | SSH em 216.238.114.122, git pull, go build, symlink swap, systemd restart. Verifica health endpoint apos deploy. Zero-downtime. |
| `deploy-jarvis` | Deploy VPS Jarvis | `/deploy-jarvis` | SSH em 76.13.166.104, git pull, pm2 restart por app name. Verifica PM2 status e logs de erro. |
| `vps-health` | Health Check VPS | `/vps-health` | Checa os 3 VPS (Jarvis, Shadow, yt-copilot): disk, memory, CPU, servicos rodando, certificados SSL, uptime. Relatorio consolidado. |

### 2.2 Desenvolvimento

| ID | Nome | Comando | Descricao |
|----|------|---------|-----------|
| `aprovei-test` | Testar Aprovei | `/aprovei-test` | Roda `go test ./...` no backend, `npm run lint && npm run build` no frontend. Reporta falhas com contexto. |
| `cloaking-debug` | Debug Cloaking | `/cloaking-debug` | Analisa request contra as 8 camadas server-side + 40 sinais client-side do Aprovei. Identifica qual camada bloqueou/permitiu. |
| `db-migrate` | Executar Migration | `/db-migrate` | Roda migration inline do Go (pgx), verifica schema antes/depois, testa rollback. |

### 2.3 Vault e Conhecimento

| ID | Nome | Comando | Descricao |
|----|------|---------|-----------|
| `vault-sync` | Sync Brain Vault | `/vault-sync` | Executa sync-to-obsidian.sh, verifica diff entre WSL e Windows, reporta conflitos. |
| `vault-lint` | Lint Brain Vault | `/vault-lint` | Roda lint.sh no ~/brain. Verifica links quebrados, frontmatter faltando, paginas orfas, contradiscoes. |

### 2.4 Qualidade

| ID | Nome | Comando | Descricao |
|----|------|---------|-----------|
| `review-finance` | Review Codigo Financeiro | `/review-finance` | Analisa diff focando em: floats para dinheiro, falta de idempotency, webhook sem HMAC, race conditions em saldo. |
| `security-scan` | Scan de Seguranca | `/security-scan` | Verifica OWASP Top 10 no diff: SQL injection, XSS, SSRF, secrets expostos, headers faltando. Foco em Go e Next.js. |

---

## 3. AGENTS / MODOS (8 agentes)

### 3.1 Espelhando os Perfis Hermes

| ID | Nome | Icon | Cor | Tools | System Prompt resumido |
|----|------|------|-----|-------|----------------------|
| `sage` | Sage (Coder) | `bolt` | `#7aa2ff` | `null` (todos) | Codificador. Go idiomatico (stdlib, sem frameworks), Next.js 16 (App Router, server components), PHP 8.2+. Nunca planeja, so executa. Sem comentarios desnecessarios. Valores monetarios em centavos. Conventional commits em ingles. |
| `jarvis` | Jarvis (Planner) | `map` | `#f5a623` | `["Read", "Glob", "Grep", "WebSearch", "WebFetch"]` | Planejador. Analisa requirements, desenha arquitetura, define tasks. Nunca executa codigo. Output: plano numerado com arquivos, dependencias e ordem de execucao. Conhece o stack completo (Go/Next.js/PHP/PostgreSQL/Redis). |
| `phantom` | Phantom (Web) | `bolt` | `#a855f7` | `null` (todos) | Especialista em web automation, scraping, browser control. Nunca modifica codigo de producao. Foco em coleta de dados, testes E2E, verificacao visual. |
| `oracle` | Oracle (Knowledge) | `help` | `#22c55e` | `["Read", "Glob", "Grep", "WebSearch", "WebFetch"]` | Navegador do brain vault. Responde perguntas consultando ~/brain/wiki/. Sugere paginas relacionadas. Identifica gaps no conhecimento. Read-only. |

### 3.2 Especializados para Projetos

| ID | Nome | Icon | Cor | Tools | System Prompt resumido |
|----|------|------|-----|-------|----------------------|
| `aprovei-dev` | Aprovei Dev | `bolt` | `#ef4444` | `null` (todos) | Especialista Aprovei Shadow. Go 1.25 + pgx/v5 + go-redis/v9. Sistema de cloaking com 8 camadas server-side. Stripe payments (BRL, centavos). White page gen via Claude Opus. Conhece a arquitetura: proxy API no VPS Shadow, painel Next.js, PHP SDKs. |
| `infra-ops` | Infra Ops | `star` | `#f97316` | `null` (todos) | Operador de infraestrutura. Conhece os 3 VPS: Jarvis (76.13.166.104, PM2, 20+ servicos), Shadow (216.238.114.122, systemd, Go), yt-copilot (31.97.28.194). Nginx, systemd, PM2, SSL, DNS. Sempre verifica antes de modificar. |
| `finance-guard` | Finance Guard | `star` | `#eab308` | `["Read", "Glob", "Grep"]` | Revisor de codigo financeiro. Read-only. Verifica: floats para money (deve ser int), idempotency em webhooks, HMAC verification, race conditions, audit logging. Rejeita codigo inseguro com explicacao clara. |
| `scout` | Scout (Research) | `help` | `#06b6d4` | `["Read", "Glob", "Grep", "WebSearch", "WebFetch"]` | Pesquisador. Deep search em documentacao, APIs, CVEs, benchmarks. Sintetiza findings em formato denso e acionavel. Cita fontes. Read-only. |

---

## 4. MCP SERVERS (7 servidores)

### 4.1 Produtividade

| Nome | Tipo | Config | Descricao |
|------|------|--------|-----------|
| `github` | stdio | `cmd: "npx -y @modelcontextprotocol/server-github"` | Acesso a repos, PRs, issues, code search. Env: GITHUB_PERSONAL_ACCESS_TOKEN |
| `filesystem-brain` | stdio | `cmd: "npx -y @modelcontextprotocol/server-filesystem /home/ronyo/brain"` | Acesso direto ao vault brain para leitura/escrita de paginas wiki |

### 4.2 Banco de Dados

| Nome | Tipo | Config | Descricao |
|------|------|--------|-----------|
| `postgres-shadow` | stdio | `cmd: "npx -y @modelcontextprotocol/server-postgres"` | Acesso ao PostgreSQL do VPS Shadow (Aprovei). Env: POSTGRES_CONNECTION_STRING. Queries read-only por padrao. |

### 4.3 Infraestrutura

| Nome | Tipo | Config | Descricao |
|------|------|--------|-----------|
| `ssh-jarvis` | stdio | `cmd: "npx -y @anthropic/mcp-ssh"` | SSH no VPS Jarvis para PM2 status, logs, restarts |
| `ssh-shadow` | stdio | `cmd: "npx -y @anthropic/mcp-ssh"` | SSH no VPS Shadow para systemd, go builds, health checks |

### 4.4 Monitoramento

| Nome | Tipo | Config | Descricao |
|------|------|--------|-----------|
| `uptime` | http | `url: "https://api.uptimerobot.com/v2/"` | Monitoramento de uptime dos servicos. Env: UPTIMEROBOT_API_KEY |

### 4.5 Pagamentos

| Nome | Tipo | Config | Descricao |
|------|------|--------|-----------|
| `stripe` | stdio | `cmd: "npx -y @stripe/mcp"` | Acesso a dashboard Stripe: payments, subscriptions, webhooks, disputes. Env: STRIPE_SECRET_KEY |

---

## 5. PRIORIDADE DE IMPLEMENTACAO

### Fase 1 — Impacto imediato (criar primeiro)
1. Agents: `sage`, `jarvis`, `oracle`, `aprovei-dev`
2. Skills: `/vps-health`, `/deploy-shadow`, `/review-finance`
3. Prompts: `go-http-handler`, `stripe-webhook`, `commit-conventional`
4. MCPs: `github`, `stripe`

### Fase 2 — Operacional
5. Agents: `infra-ops`, `finance-guard`
6. Skills: `/deploy-jarvis`, `/vault-sync`, `/vault-lint`
7. Prompts: `nginx-reverse-proxy`, `systemd-service`, `nextjs-server-action`
8. MCPs: `filesystem-brain`, `postgres-shadow`

### Fase 3 — Complementar
9. Agents: `phantom`, `scout`
10. Skills: `/aprovei-test`, `/cloaking-debug`, `/db-migrate`, `/security-scan`
11. Prompts: restantes
12. MCPs: `ssh-jarvis`, `ssh-shadow`, `uptime`

---

## 6. ARQUIVOS A CRIAR/MODIFICAR

```
workspaces/default/.contex/customisation/
  prompts.json        — 14 prompt templates
  agents.json         — 8 agent modes
  skills.json         — (vazio, skills sao arquivos .md)

workspaces/default/.claude/skills/
  deploy-shadow.md
  deploy-jarvis.md
  vps-health.md
  aprovei-test.md
  cloaking-debug.md
  db-migrate.md
  vault-sync.md
  vault-lint.md
  review-finance.md
  security-scan.md

workspaces/default/.contex/customisation/mcp-servers.json  — 7 MCP servers
```

## 7. VERIFICACAO

1. Abrir Contex, ir no tile Customisation
2. Verificar aba Prompts: 14 templates com campos funcionais
3. Verificar aba Skills: 10 habilidades descobertas dos arquivos .md
4. Verificar aba Agents: 8 modos (alem dos 3 builtins)
5. Verificar Settings > MCP: 7 servidores listados
6. Testar: criar chat tile, selecionar modo "Sage", verificar system prompt injetado
7. Testar: abrir um prompt template, preencher campos, copiar output
