# go-new-endpoint

Cria um novo endpoint HTTP no projeto Go (estilo aprovei-shadow).

## Quando usar
Quando precisar adicionar um novo handler/rota na API Go.

## Passos

1. Pergunte (se não souber):
   - Nome do recurso (ex: `payment`, `user`, `report`)
   - Método HTTP
   - Se precisa de autenticação
   - Parâmetros de entrada esperados

2. Leia os arquivos existentes para entender os padrões do projeto:
   - Um handler existente similar
   - O arquivo de rotas (`routes.go` ou similar)
   - O middleware de autenticação (se necessário)

3. Crie o handler seguindo o padrão encontrado:
   - Struct de request com json tags
   - Struct de response
   - Validação de input (retorna 400 com mensagem clara)
   - Lógica de negócio
   - Erros internos retornam 500 sem expor detalhes

4. Registre a rota no arquivo de rotas

5. Crie o arquivo de teste `_test.go` com:
   - Table-driven tests
   - Caso de sucesso
   - Caso de input inválido
   - Caso de erro interno (mock do dep)

6. Execute `go build ./...` para confirmar que compila

7. Execute `go test ./...` para confirmar que os testes passam

## Padrão de erro

```go
// Erro de validação
w.WriteHeader(http.StatusBadRequest)
json.NewEncoder(w).Encode(map[string]string{"error": "mensagem clara"})

// Erro interno
log.Printf("erro ao processar X: %v", err)
w.WriteHeader(http.StatusInternalServerError)
```
