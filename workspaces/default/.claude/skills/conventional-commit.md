# conventional-commit

Commita as mudanças staged seguindo Conventional Commits.

## Quando usar
Quando quiser criar um commit com mensagem bem formatada a partir do que está staged.

## Passos

1. Execute `git status` para ver o estado atual
2. Execute `git diff --staged` para ver o que está staged
3. Se não houver nada staged, execute `git diff` para ver o que foi modificado e pergunte ao usuário quais arquivos adicionar
4. Analise o diff e determine:
   - Tipo: feat / fix / refactor / chore / docs / test / perf / style / ci
   - Escopo (opcional): o módulo ou área afetada (ex: `auth`, `payments`, `api`)
   - Descrição: imperativo, inglês, max 72 chars
5. Se o diff for substancial, adicione um body explicando o "por quê"
6. Execute o commit com `git commit -m "<mensagem>"`
7. Confirme o hash do commit criado

## Formato da mensagem

```
<tipo>(<escopo>): <descrição curta>

[body opcional — explique o motivo, não o que foi feito]
```

## Exemplos

- `feat(auth): add JWT refresh token endpoint`
- `fix(payments): handle timeout on gateway callback`
- `refactor(user): simplify profile update logic`
- `chore(deps): update node-pty to v1.1.0`

## Regras

- Inglês sempre
- Sem emoji
- Sem ponto final na linha de assunto
- Body separado do assunto por linha em branco
