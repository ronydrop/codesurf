# Plano de Produtividade — CodeSurf

## Contexto

Stack do Rony: **Go (backend) · Next.js/TypeScript · PHP/Laravel · Python**
Projetos ativos: `aprovei-hub/aprovei-shadow`, `transcripthunter`, Jarvis (studio + WhatsApp bot)
Ambiente: WSL2 + VPS Jarvis/Shadow/yt-copilot

Objetivo: popular o CodeSurf com **Prompts**, **Skills** e **MCPs** que acelerem os fluxos reais desses projetos — evitando configurar agentes do zero a cada tile.

---

## 1. PROMPTS (templates reutilizáveis)

Prompts ficam em `~/.contex/customisation/prompts.json` ou `.claude/commands/`. Cada um tem variáveis `{{campo}}` que viram formulário na UI.

### Prioridade Alta

| Nome | Finalidade | Campos |
|---|---|---|
| **review-diff** | Revisar `git diff` atual (segurança, lógica, style) em PT-BR | `escopo` (staged/branch), `foco` (security/perf/dx) |
| **commit-message** | Analisa diff e gera conventional commit em inglês | `tipo` (feat/fix/refactor/chore) |
| **pr-description** | Gera título e corpo de PR (summary + test plan) | `base` (main/develop), `tipo` |
| **bug-triage** | Analisa stack trace e propõe causa raiz + fix | `stack` (textarea), `contexto` |
| **explain-file** | Explica um arquivo/função para documentação | `arquivo`, `nivel` (iniciante/senior) |

### Geradores de código

| Nome | Finalidade | Campos |
|---|---|---|
| **go-handler** | Handler HTTP Go + test (aprovei-shadow style) | `recurso`, `metodo`, `auth` (sim/não) |
| **nextjs-action** | Server Action tipado + validação Zod | `nome`, `schema_input` |
| **laravel-crud** | Migration + Model + Controller + Routes | `tabela`, `campos` |
| **test-writer** | Gera testes unitários do arquivo ativo | `framework` (go test/vitest/pytest/phpunit) |
| **sql-optimize** | Analisa query lenta, sugere índices | `query`, `ddl_tabela` |

### Utilidades

| Nome | Finalidade | Campos |
|---|---|---|
| **refactor-safe** | Refatora sem mudar comportamento | `objetivo` (clareza/perf) |
| **env-audit** | Lista `.env` vs uso real no código | — |
| **api-client** | Gera client tipado a partir de URL OpenAPI | `url_spec`, `linguagem` |

---

## 2. SKILLS (Claude Code `SKILL.md`)

Skills são arquivos markdown em `.claude/skills/` que o Claude Code carrega como capacidades. Diferente dos prompts, são **workflows multi-passo** que o agente pode invocar.

### Alta prioridade

1. **`go-new-endpoint`** — fluxo completo: criar handler, registrar rota, gerar teste, rodar `go test`.
2. **`nextjs-feature`** — scaffold de feature: page + loading.tsx + error.tsx + server action + component.
3. **`conventional-commit`** — stage files → analisar diff → escrever commit → commit.
4. **`vps-deploy-check`** — valida: migrations pendentes, env vars no destino, build passa, dependências atualizadas. (Depende do MCP de SSH.)
5. **`run-tests-for-diff`** — detecta arquivos alterados e roda apenas os testes relevantes (`go test ./pkg/...`, `vitest related`, `pytest --picked`).
6. **`db-schema-inspect`** — lê schema atual do Postgres dev via MCP e resume. (Depende do Postgres MCP.)

### Média prioridade

7. **`docker-optimize`** — analisa Dockerfile: cache layers, user não-root, multi-stage.
8. **`whatsapp-bot-handler`** — scaffold de novo handler para o clawdbot (Jarvis).
9. **`transcript-query`** — fluxo de busca no transcripthunter.

---

## 3. MCP Servers

Configurados em `~/.contex/mcp-server.json` ou no workspace. São injetados automaticamente ao lançar agentes.

### Essenciais

| MCP | Pra quê | Comando |
|---|---|---|
| **postgres** | Query direta no DB dev do aprovei-shadow | `npx @modelcontextprotocol/server-postgres <DATABASE_URL>` |
| **context7** | Fetch de docs atualizadas de libs (Go/Next/Laravel) | `npx -y @upstash/context7-mcp` |
| **sequential-thinking** | Raciocínio estruturado para bugs complexos | `npx -y @modelcontextprotocol/server-sequential-thinking` |
| **github** | PRs, issues, code search (já tem plugin no Claude Code) | `npx -y @modelcontextprotocol/server-github` |

### Estendem muito o fluxo

| MCP | Pra quê | Comando |
|---|---|---|
| **playwright** | Testar frontend do Next.js, tirar screenshots | `npx -y @modelcontextprotocol/server-playwright` |
| **filesystem** (escopado) | Leitura/escrita controlada em dirs específicos | `npx -y @modelcontextprotocol/server-filesystem <dir>` |
| **fetch** | Fetch de URLs arbitrárias (docs, API specs) | `npx -y @modelcontextprotocol/server-fetch` |
| **memory** | Knowledge graph persistente entre sessões | `npx -y @modelcontextprotocol/server-memory` |

### Avançado (requer setup)

| MCP | Pra quê | Observação |
|---|---|---|
| **ssh-exec** | Executar comandos nas VPS Jarvis/Shadow | Requer MCP custom ou wrapper — alto risco, só usar em modos restritos |
| **docker** | Listar/reiniciar containers no dev | `npx -y mcp-server-docker` ou similar |

---

## 4. Ordem de Criação (fases)

### Fase 1 — Base imediata (1 sessão)
1. Instalar MCPs: `postgres` (aprovei), `context7`, `sequential-thinking`
2. Criar 3 prompts críticos: `commit-message`, `pr-description`, `review-diff`
3. Criar skill `conventional-commit`

**Valor:** loop básico de dev (código → commit → PR) acelerado em todos os projetos.

### Fase 2 — Geradores (1 sessão)
1. Prompts: `go-handler`, `nextjs-action`, `test-writer`, `bug-triage`
2. Skills: `go-new-endpoint`, `nextjs-feature`, `run-tests-for-diff`
3. MCP: `playwright` para testes E2E

**Valor:** scaffold de features novas nos projetos Go/Next.

### Fase 3 — Avançado (sob demanda)
1. Prompts: `sql-optimize`, `refactor-safe`, `env-audit`, `api-client`
2. Skills: `docker-optimize`, `whatsapp-bot-handler`, `db-schema-inspect`
3. MCPs: `memory`, `filesystem` escopado, `fetch`
4. Modo de agente dedicado por projeto (Agent Mode com system prompt sobre aprovei/jarvis)

---

## 5. Agent Modes Sugeridos

Além dos padrões (Agent/Ask/Plan), criar modos específicos por contexto:

| Modo | System Prompt | Ferramentas |
|---|---|---|
| **Aprovei Dev** | Especialista Go + Next + Postgres no contexto aprovei-shadow | Full + postgres MCP |
| **Revisor PT-BR** | Revisa código e responde em português, foco em segurança | Read, Grep, Glob apenas |
| **Jarvis Ops** | Trabalha com VPS, Docker, deploys | Bash + ssh-exec |
| **Laravel Dev** | Convenções Laravel, PHP 8+, Eloquent | Full |

---

## 6. Verificação

Como validar que tudo funciona:

1. **Prompts:** abrir Configurações → Prompts, criar um template, abrir um tile chat/terminal, aplicar o prompt com valores e verificar que a substituição de `{{campo}}` aconteceu.
2. **Skills:** criar `.claude/skills/<nome>/SKILL.md`, lançar `claude` num terminal do CodeSurf, pedir para invocar a skill, verificar que o Claude reconhece.
3. **MCPs:** lançar `claude` num terminal, executar `/mcp` e confirmar que os servidores aparecem na lista; chamar uma tool exposta pelo MCP (ex: `postgres__query`).
4. **Agent Modes:** abrir Configurações → Agentes, criar modo, lançar agente no tile com o modo selecionado, confirmar que o system prompt está aplicado.

---

## 7. Arquivos-Chave (implementação)

- `~/.contex/customisation/prompts.json` — prompts
- `~/.contex/customisation/skills.json` — flags de enable/disable
- `~/.claude/skills/<nome>/SKILL.md` — conteúdo da skill
- `~/.contex/mcp-server.json` — MCP servers globais
- `<workspace>/.contex/mcp-servers.json` — MCP servers do workspace
- `~/.contex/customisation/agents.json` — modos de agente

O código do CodeSurf que lê esses arquivos:
- `src/main/ipc/terminal.ts:283` — handler `terminal:create`, injeta MCP + allowedTools
- `src/main/ipc/workspace.ts` — lê settings e customisation
- `src/renderer/src/components/CustomisationTile.tsx` — UI de edição
