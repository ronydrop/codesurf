# vps-deploy-check

Valida pré-condições antes de fazer deploy nas VPS.

## Quando usar
Antes de fazer deploy em Jarvis, Shadow ou yt-copilot.

## Passos

1. Pergunte qual VPS e serviço está sendo deployado

2. Checklist local (execute no repo):
   - [ ] `git status` — sem mudanças não commitadas
   - [ ] `git log origin/main..HEAD` — sem commits locais não pushed
   - [ ] Build passa? (ex: `go build ./...` ou `npm run build`)
   - [ ] Testes passam? (`go test ./...` ou similar)
   - [ ] Variáveis de `.env.example` todas documentadas?

3. Checklist de configuração:
   - [ ] Variáveis de ambiente no servidor estão atualizadas?
   - [ ] Migrations novas precisam rodar? Liste-as.
   - [ ] Dependências novas precisam ser instaladas?

4. Checklist de rollback:
   - [ ] Qual é o comando para reverter se der problema?
   - [ ] O deploy é backwards-compatible (não quebra clientes em produção)?

5. Reporte o resultado de cada item e diga se está PRONTO ou se precisa resolver algo antes.

## Comandos por VPS

- Jarvis: `ssh jarvis "cd /root/clawd/studio-app && git pull && ..."`
- Shadow: `ssh shadow "..."`
- yt-copilot: `ssh yt-copilot "cd /root/transcripthunter && ..."`

(ajuste conforme seu ~/.ssh/config)
