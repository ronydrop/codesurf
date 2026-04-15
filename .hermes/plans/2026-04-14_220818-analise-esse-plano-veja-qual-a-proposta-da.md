---
tags: [plan]
project: codesurf
author: jarvis
date: 2026-04-14
updated: 2026-04-14
status: draft
---

# CodeSurf — Port de features do CommandDeck (plano incrementado)

Plano analisado, cruzado com o estado real do repo e incrementado. O plano original
estava correto em direção mas precisa de alguns ajustes importantes baseados no que
já existe no CodeSurf (descobertas abaixo).

## Goal

Portar as features que o CommandDeck (WPF/.NET) tem e o CodeSurf (Electron/React)
não tem, respeitando o que já está implementado. Meta final: CodeSurf vira um
terminal manager + workspace IDE cross-platform tão capaz quanto o CommandDeck,
sem duplicar o que já existe.

## Descobertas sobre o estado real do CodeSurf (cross-check)

Inspecionei os pontos de enganche do plano original. Resumo das correções:

| Suposição original                         | Realidade no repo                                                                 | Impacto |
|--------------------------------------------|------------------------------------------------------------------------------------|---------|
| terminal.ts default = wsl.exe hardcoded    | ✅ Confirmado (linhas 304-306 de src/main/ipc/terminal.ts)                         | OK      |
| git.ts = 94 LOC, 2 handlers                | ✅ Confirmado — só `git:remote` e `git:status`                                     | OK      |
| Process Monitor não existe                 | ✅ Confirmado — zero handlers `processes:*` no main                                | OK      |
| Slash commands não existem                 | ⚠️ **PARCIAL** — ChatTile.tsx já tem autocomplete de slash/mention (linha 917+)    | Ajuste  |
| SplitPane precisa ser criado do zero       | ❌ **JÁ EXISTE** — PanelLayout.tsx (705 LOC) + LayoutBuilder.tsx (780 LOC)         | Ajuste  |
| Layout Modes precisa novo strategies.ts    | ❌ Infra de split/leaves já existe; falta só o seletor de modo + presets           | Ajuste  |
| Command Palette não existe                 | ✅ Confirmado — nenhum componente CommandPalette no renderer                       | OK      |
| Tool Registry não existe                   | ✅ Confirmado — slash no ChatTile é hardcoded, não tem registry                    | OK      |

**Conclusão:** fases 1, 2, 3 do plano original estão corretas. Fases 4, 5 e 6
precisam ser redesenhadas para aproveitar o que já existe.

## Current context / assumptions

- Branch atual: `feature/event-bus-mcp` (tem event bus + MCP upgrade + chat tile)
- Plataforma-alvo primária para ESTE plano: Windows (o plano do Rony é "alcançar
  paridade com CommandDeck em Windows"). Cross-platform (Linux/macOS) é secundário
  mas NÃO pode ser quebrado.
- node_modules precisa estar instalado via WSL2 (nota do projeto)
- node-pty precisa rebuild quando mexe em deps nativas (`npm run rebuild`)
- App.tsx tem ~4806 LOC (o CLAUDE.md diz 1700, mas cresceu) — ser extra-surgical
- Event bus já existe e é o canal preferido pra comunicação cross-tile

## Proposed approach

Executar em 6 fases ordenadas por risco crescente e independência. Cada fase
deixa o app funcionando (commit/validação no meio). Delegar para Sage uma fase
por vez, com Jarvis validando cada resultado antes de autorizar a próxima.

Ordem: shell flex → git rico → process monitor → tool registry → command
palette → layout modes. Justificativa: as 3 primeiras são puro backend IPC
(baixo risco UI), e as 3 últimas são UI/UX progressivo em cima da base.

---

## Fase 1 — Windows shell flexibility (CMD / PowerShell / WSL / Git Bash)

**Problema:** `src/main/ipc/terminal.ts:304-306` hardcoda WSL no Windows. O
CommandDeck permite escolher o shell por projeto/por terminal. CodeSurf não.

**Entrega:**

- Config de shells disponíveis auto-detectados:
  - Windows: CMD (`cmd.exe`), PowerShell (`powershell.exe`), PowerShell 7
    (`pwsh.exe`), WSL (`wsl.exe`), Git Bash (`bash.exe` de `Git/bin/`)
  - Linux/macOS: zsh, bash, fish (detectar via `which`)
- Novo handler `shells:list` que retorna `Array<{id, name, path, icon, available: boolean}>`
- Preferência salva em `~/.codesurf/workspaces/{id}/canvas.json` (por-tile)
  E em settings globais como default
- UI: botão no header do TerminalTile com dropdown de shells (como no
  Windows Terminal). Abrir novo terminal com shell X recria PTY.
- Fallback: se o shell salvo não existe mais (removeram do PATH), cai pro default

**Arquivos que mudam (read-only confirmado):**

- `src/main/ipc/terminal.ts` — adiciona `shells:list`, remove hardcode, aceita
  `shellId` em `terminal:create`
- `src/main/ipc/shells.ts` — **novo**, detector de shells por plataforma
- `src/renderer/src/components/TerminalTile.tsx` — dropdown de shell
- `src/preload/index.ts` — expõe `shells.list()`
- `src/shared/types.ts` — tipo `ShellInfo`

**Testes / validação:**

- Abrir terminal no Windows → dropdown mostra pelo menos CMD + PowerShell + WSL
- Trocar shell do terminal → PTY recriado sem perder a posição do tile no canvas
- Shell inválido → fallback silencioso pro default + warn no console

**Riscos:**

- `node-pty` no Windows pode ter quirks com GitBash (precisa MSYS env vars).
  Se der problema, deixar GitBash como "known broken" e documentar.
- Detecção de pwsh.exe no PATH pode ser lenta no primeiro load — cache no main.

---

## Fase 2 — Git rico (20+ ops com cache de 10s)

**Problema:** `git.ts` tem 94 LOC e só expõe 2 handlers (`git:remote`, `git:status`).
O CommandDeck tem GitService que faz branch/stash/diff/commit/stage/unstage/log.

**Entrega — handlers IPC novos:**

1. `git:branch:list` — local + remote branches, com tracking info
2. `git:branch:current` — nome do branch atual + upstream
3. `git:branch:checkout` — troca branch
4. `git:branch:create` — cria branch (opt. `from` ref)
5. `git:branch:delete` — com flag `force`
6. `git:log` — últimos N commits (json: hash, author, subject, relativeDate)
7. `git:diff` — diff de um arquivo ou do index (porcelain)
8. `git:diff:staged` — diff do que está staged
9. `git:stage` — stage um arquivo
10. `git:unstage` — unstage
11. `git:stage:all` — stage tudo
12. `git:commit` — commit com mensagem (bloqueia se houver hooks que falham)
13. `git:stash:list`
14. `git:stash:save` — com mensagem opcional
15. `git:stash:pop`
16. `git:stash:drop`
17. `git:pull`
18. `git:push` — com flag `force`
19. `git:fetch`
20. `git:remotes` — lista todos os remotes (não só origin)

**Cache de 10s:** wrapper `cachedGit(key, fn)` — chave inclui cwd + args. TTL
10000ms. Invalidar manualmente em mutations (checkout, commit, stash pop etc.
limpam o cache do repo inteiro). Implementar como `Map<string, {data, expiry}>`
simples, sem LRU (max 200 entries, prune on insert se passar).

**BranchSelector component:** novo componente React que mostra branch atual
com dropdown. Usado no header de CodeTile, TerminalTile e FileExplorerTile.
Dropdown mostra:
- Branch atual (bold)
- Locais (ícone de branch)
- Remotos (ícone de cloud, agrupados por remote)
- Input de filtro no topo
- Botão "Create branch from here"

**Arquivos que mudam:**

- `src/main/ipc/git.ts` — 94 → ~450 LOC
- `src/main/ipc/git-cache.ts` — **novo**, wrapper de cache
- `src/renderer/src/components/BranchSelector.tsx` — **novo**
- `src/renderer/src/components/TerminalTile.tsx` — usa BranchSelector
- `src/renderer/src/components/CodeTile.tsx` — usa BranchSelector
- `src/renderer/src/components/FileExplorerTile.tsx` — usa BranchSelector
- `src/preload/index.ts` — namespace `git` expandido
- `src/shared/types.ts` — tipos `GitBranch`, `GitCommit`, `GitStash`, etc.

**Testes / validação:**

- `git:branch:list` num repo com 50+ branches → retorna em <500ms
- Checkout de branch → eventos `git:branch:changed` no bus
- Cache: 2 chamadas consecutivas de `git:status` — 2ª é <5ms
- Commit vazio (sem stage) → erro tratado, não quebra UI

**Riscos:**

- Git hooks podem travar indefinidamente. Timeout de 30s em mutations.
- `git push` pode pedir credenciais interativas — só funciona com credential
  helper configurado. Documentar como "requer git credential manager".
- Repos grandes (monorepos): `git log` sem limit engasga. Sempre passar `-n 50`.

---

## Fase 3 — Process Monitor cross-platform

**Problema:** não existe nenhum handler de processos. Não dá pra ver o que o
terminal/agent spawn rodando, nem matar processo travado sem ir pro task manager.

**Entrega:**

- `src/main/ipc/processes.ts` — **novo**, 5 handlers:
  1. `processes:list` — retorna `Array<ProcessInfo>` (pid, name, cpu, memMB, user, cmdline)
  2. `processes:tree` — versão hierárquica com children
  3. `processes:kill` — kill por pid (signal customizável; no Windows sempre SIGKILL)
  4. `processes:find` — busca por name/cmdline regex
  5. `processes:watch` — subscribe via event bus `processes:tick` (emit a cada 2s)

- **Implementação cross-platform:**
  - Windows: `tasklist /v /fo csv` + `wmic process get ProcessId,ParentProcessId,CommandLine`
    (ou `Get-CimInstance Win32_Process` via pwsh — mais rápido)
  - Linux: ler `/proc/*/stat` + `/proc/*/cmdline` + `/proc/*/status` direto
  - macOS: `ps -axww -o pid,ppid,pcpu,pmem,comm,command`
  - CPU %: calcular delta entre ticks (guardar último sample por pid)
  - Cache de 2s (evita chamadas repetidas num mesmo tick)

- **Tile novo: ProcessMonitorTile.tsx**
  - Lista ordenável (por CPU, RAM, nome)
  - Filtro por nome
  - Botão "kill" em cada linha (com confirmação)
  - Agrupamento "filtro: só processos do workspace" (filtra pelo cwd)
  - Auto-refresh 2s (toggle)

**Event bus:** publish `processes:spawned`, `processes:killed`, `processes:tick`.
Isso permite que agents via MCP reajam ("meu terminal morreu" → notifica canvas).

**Arquivos que mudam:**

- `src/main/ipc/processes.ts` — **novo**, ~300 LOC
- `src/main/index.ts` — registra o handler
- `src/preload/index.ts` — expõe `processes`
- `src/renderer/src/components/ProcessMonitorTile.tsx` — **novo**
- `src/renderer/src/App.tsx` — adiciona ProcessMonitorTile no switch de tipos de tile
- `src/shared/types.ts` — tipo `ProcessInfo` + `'processMonitor'` no TileType union

**Testes / validação:**

- Abrir ProcessMonitorTile → lista populada em <1s
- Kill um `node` processo de teste → some da lista no tick seguinte
- Deixar 10min rodando → memória do main não sobe indefinidamente (vazamento de
  listeners? validar com `bus.list` mostrando subscriptions)

**Riscos:**

- `wmic` é deprecated no Win11. Pular direto pra pwsh `Get-CimInstance` (requer
  pwsh no PATH — fallback pra `tasklist` básico se não tiver).
- Lista de processos no Windows pode ter 400+ entries. Sempre paginar no renderer.
- Kill com PID reutilizado é um race. Documentar como "best effort".

---

## Fase 4 — Tool Registry + promoção dos slash commands

**Problema:** `ChatTile.tsx:917+` já tem autocomplete de `/slash` e `@mention`
HARDCODED no componente. Não tem registry global, não tem como extensões
adicionarem comandos, não tem bridge MCP.

**Entrega:**

- `src/main/tools/registry.ts` — **novo**, singleton
  - `registerTool(tool: Tool)` — ID único + title + description + handler + icon + scope
  - `listTools(scope?)` — filtro por escopo (chat, palette, extension, mcp)
  - `invokeTool(id, args, context)` — executa + emite evento no bus
- Migra os slash commands do ChatTile pra chamadas em `toolRegistry.listTools('chat')`
- Adiciona tools padrão do CodeSurf (~15-20):
  - `canvas.addTile`, `canvas.focusTile`, `canvas.arrangeGrid`, `canvas.resetZoom`
  - `workspace.switch`, `workspace.create`, `workspace.rename`
  - `git.status`, `git.commit`, `git.branch.checkout` (usa Fase 2)
  - `terminal.new`, `terminal.split` (usa Fase 1)
  - `processes.kill` (usa Fase 3)
  - `layout.setMode` (usa Fase 6)
- **Bridge MCP:** cada tool registrada vira automaticamente uma tool MCP
  exposta em `mcp-server.ts`. Isso deixa agents externos (Claude Desktop etc.)
  invocarem as mesmas ações que o user via slash.

**Arquivos que mudam:**

- `src/main/tools/registry.ts` — **novo**
- `src/main/tools/builtin.ts` — **novo**, registra as ~20 tools nativas
- `src/main/mcp-server.ts` — auto-registra tools do registry como MCP tools
- `src/renderer/src/components/ChatTile.tsx` — consome do registry via IPC
- `src/preload/index.ts` — expõe `tools.list`, `tools.invoke`
- `src/shared/tools.ts` — **novo**, tipos compartilhados

**Testes / validação:**

- Digitar `/` no ChatTile → mostra lista vinda do registry (não hardcoded)
- Invocar `/canvas.arrangeGrid` → tiles se reorganizam
- Adicionar tool via extensão de teste → aparece no dropdown sem reload
- MCP: `curl http://localhost:{port}/tools/list` mostra as builtin tools
- MCP: invocar `git.status` via endpoint HTTP → mesmo resultado do IPC

**Riscos:**

- Conflito de escopo: uma tool que mexe no canvas só faz sentido no renderer.
  Resolver com `scope: 'main' | 'renderer' | 'both'` e routing via IPC quando
  chamada vem do lado errado.
- Mudança breaking no formato do slash atual — reverter ChatTile com cuidado
  pra não quebrar o ux atual (mesma UX visual, só troca a fonte de dados).

---

## Fase 5 — Command Palette (Ctrl+Shift+P)

**Problema:** não existe. Descoberta inegável, não apareceu nenhum CommandPalette
em nenhum search do repo.

**Entrega:**

- `src/renderer/src/components/CommandPalette.tsx` — **novo**, ~250 LOC
  - Overlay modal centralizado (fade-in + backdrop-blur)
  - Atalho global `Ctrl+Shift+P` / `Cmd+Shift+P`
  - Input de filtro fuzzy (fuzzy-search simples, sem dep nova — implementar inline)
  - Agrupamento por categoria (Canvas, Git, Terminal, Workspace, Layout...)
  - Fonte: `tools.list('palette')` do registry (Fase 4)
  - Histórico de "recent commands" (últimas 10, salvas em localStorage)
  - Keyboard nav: ↑↓ Enter Esc

**Integrações:**

- Dispara tool via `tools.invoke(id, args)`
- Mostra ícone e descrição de cada tool
- Suporta "arguments inline": se uma tool tem `args: [{name: 'branch', type: 'string'}]`,
  o palette pede o valor depois de selecionar (tipo VSCode QuickPick)
- Botão "⚙" abre settings da tool (se existir)

**Arquivos que mudam:**

- `src/renderer/src/components/CommandPalette.tsx` — **novo**
- `src/renderer/src/App.tsx` — monta `<CommandPalette />` no root + listener
  de atalho global
- `src/renderer/src/hooks/useCommandPalette.ts` — **novo**, hook com estado

**Testes / validação:**

- Ctrl+Shift+P abre em <100ms
- Digitar "git comm" → mostra `git.commit`
- Enter executa + fecha
- Esc cancela
- Fuzzy: "addtile" acha `canvas.addTile`
- Histórico: comandos recentes aparecem no topo quando palette abre vazio

**Riscos:**

- Conflito de atalho com Monaco editor (Ctrl+Shift+P é o comando dele também).
  Solução: quando Monaco tem foco, o atalho do palette é inibido — o user
  precisa clicar fora primeiro. Alternativa: usar F1 como atalho alternativo.
- Renderização lenta se o registry tem 100+ tools. Virtualizar lista se >50.

---

## Fase 6 — Layout Modes (aproveitando PanelLayout existente)

**CORREÇÃO IMPORTANTE DO PLANO ORIGINAL:** já existe `PanelLayout.tsx` (705 LOC)
e `LayoutBuilder.tsx` (780 LOC) com `splitLeaf`, `closeOthersInLeaf`, etc. A
infra de split pane tá pronta. O que FALTA é o seletor de modo global e os
presets auto-aplicáveis.

**Entrega:**

- `src/renderer/src/layout/modes.ts` — **novo**, define os modos:
  1. **Canvas** (atual) — pan/zoom livre, tiles posicionados no mundo 2D
  2. **Tiled** — aplica `PanelLayout` full-screen, tiles ocupam painéis
  3. **Bento** — presets nomeados (2x2, 3x1, 1+2, maximize-one), escolhe
     qual tile vai pra qual célula
  4. **Focus** — um tile ocupa 100%, os outros ficam no dock da direita

- `src/renderer/src/layout/strategies.ts` — **novo**, transforma de um modo pra
  outro. Ex: ao trocar Canvas → Tiled, converte as posições x/y em leaves
  do `PanelLayout`. Ao voltar, re-popula x/y preservando ordem.

- **Seletor na UI:** dropdown no canto superior direito (ou integrado ao
  `ArrangeToolbar.tsx` existente) com as 4 opções.

- **Persistência:** salva modo atual em `canvas.json`. Ao abrir workspace com
  modo não-canvas, o App.tsx entra já no modo certo.

- **Tool registry:** `layout.setMode(mode: LayoutMode)` — expõe pro Command
  Palette e pro MCP.

**Arquivos que mudam:**

- `src/renderer/src/layout/modes.ts` — **novo**
- `src/renderer/src/layout/strategies.ts` — **novo**
- `src/renderer/src/App.tsx` — cirurgia: isolar a parte de renderização de
  tiles por modo (hoje hardcoded em canvas). Trocar o switch central.
- `src/renderer/src/components/ArrangeToolbar.tsx` — adiciona dropdown de modos
- `src/main/ipc/canvas.ts` — persiste `layoutMode` no canvas.json

**Testes / validação:**

- Canvas → Tiled → tiles viram painéis preservando ordem
- Tiled → Canvas → tiles voltam a ter x/y (grid reconstruído)
- Bento 2x2 com 5 tiles → 4 visíveis, 1 fica "parked" (mostra aviso)
- Focus mode: tiles dockados na direita, clicar troca o ativo
- Undo/redo continua funcionando em todos os modos

**Riscos:**

- **ALTO:** App.tsx tem 4806 LOC e a lógica de canvas tá profundamente acoplada.
  Essa fase tem o maior risco de regressão. Precisa de mais QA manual.
- Conversão Canvas ↔ Tiled perde informação (posição precisa). Aceitar isso
  e documentar: "o modo Canvas é a fonte da verdade; outros modos derivam dele".
- Undo history fica confuso ao trocar modo. Talvez resetar o stack na transição
  (com confirmação se o stack não está vazio).

---

## Cronograma de delegação proposto (sugestão)

| Ordem | Fase                  | Complexidade | LOC estimado | Risco  |
|-------|-----------------------|--------------|--------------|--------|
| 1     | Shell flex            | Média        | ~300         | Baixo  |
| 2     | Git rico              | Alta         | ~500         | Médio  |
| 3     | Process Monitor       | Alta         | ~500         | Médio  |
| 4     | Tool Registry         | Média        | ~350         | Médio  |
| 5     | Command Palette       | Média        | ~300         | Baixo  |
| 6     | Layout Modes          | Muito Alta   | ~600         | ALTO   |

Delegar 1 fase por vez pro Sage. Após cada fase: Jarvis valida o diff, pede `npm
run dev` no Windows pra confirmar, e só aí libera a próxima. Fase 6 deve ser
delegada por último e idealmente dividida em sub-tarefas (primeiro só o modo
Tiled, depois Bento, depois Focus).

## Pontos de atenção gerais

- **Nunca misturar npm install do PowerShell com WSL** — fazer tudo pelo WSL2
- **`npm run rebuild` obrigatório** se alguma dep nativa for tocada
- **App.tsx não aguenta cirurgias grandes casadas** — se Fase 6 bater com outras
  edições em App.tsx, resolver conflitos a mão (não trust merge)
- **Testar no Windows real** — WSL só pega parte dos bugs. O Rony tá no Win11.
- **Branch atual é `feature/event-bus-mcp`** — criar sub-branches por fase
  (`feat/shell-flex`, `feat/git-rich`, etc.) ou commitar direto? Decidir antes.

## Open Questions

1. **Escolha do shell padrão por plataforma:** no Windows, qual deve ser o
   default após esse plano? Manter WSL como agora ou mudar pra PowerShell 7?
2. **Fase 6 — modo Bento:** quantos presets fornecer de fábrica? (Sugestão: 4)
3. **Branching strategy:** cada fase num branch separado ou tudo em
   `feature/event-bus-mcp` direto?
4. **Tool Registry — escopo MCP automático:** todas as tools viram MCP ou o
   user opta-in por tool? (Sugestão: opt-in via flag `exposeOverMCP: boolean`
   por questão de segurança — uma tool "workspace.delete" não deveria ser
   chamável por agent externo sem consentimento).
5. **Process Monitor no Windows:** aceita depender de pwsh 7 no PATH ou
   obrigado a suportar `tasklist` puro? (Sugestão: pwsh preferido, tasklist fallback)
