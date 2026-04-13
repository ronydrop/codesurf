# run-tests-for-diff

Detecta arquivos alterados e roda apenas os testes relevantes.

## Quando usar
Antes de commitar para confirmar que nada quebrou, sem rodar a suite inteira.

## Passos

1. Execute `git diff --name-only HEAD` para listar arquivos modificados

2. Para cada arquivo modificado, determine o framework de teste:
   - `.go` → `go test`
   - `.ts`, `.tsx` → vitest ou jest
   - `.py` → pytest
   - `.php` → phpunit

3. Para arquivos **Go**:
   - Identifique o package: `dirname` do arquivo
   - Execute: `go test ./caminho/do/package/...`
   - Se o arquivo for `pkg/payments/handler.go`, teste `./pkg/payments/...`

4. Para arquivos **TypeScript**:
   - Execute: `npx vitest related <arquivo1> <arquivo2>` ou `jest --findRelatedTests`

5. Para arquivos **Python**:
   - Execute: `pytest --co -q` para listar, depois `pytest <arquivo_teste>`

6. Reporte:
   - Quantos testes rodaram
   - Quais passaram / falharam
   - Output completo de falhas

## Se não houver testes

Informe quais arquivos não têm testes correspondentes e sugira criar testes para eles.
