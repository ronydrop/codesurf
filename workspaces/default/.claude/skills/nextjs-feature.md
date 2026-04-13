# nextjs-feature

Scaffold completo de uma feature no Next.js App Router.

## Quando usar
Quando precisar criar uma nova página ou funcionalidade no frontend Next.js.

## Passos

1. Pergunte (se não souber):
   - Nome da feature / rota (ex: `/dashboard/payments`)
   - Se precisa de autenticação
   - Tipo de dados que vai exibir/manipular

2. Leia os arquivos existentes para entender os padrões do projeto:
   - Uma página similar já existente
   - Como a autenticação é verificada
   - Como as Server Actions são estruturadas

3. Crie os arquivos na ordem:
   ```
   app/<rota>/
   ├── page.tsx          # Server Component principal
   ├── loading.tsx       # Skeleton de loading
   ├── error.tsx         # Boundary de erro ('use client')
   └── _components/      # Componentes específicos desta rota
       └── <Feature>.tsx
   ```

4. Para cada Server Action necessária:
   - Arquivo separado `actions.ts` com `'use server'`
   - Schema Zod para validação
   - Tipagem completa de return (discriminated union success/error)

5. Verifique TypeScript: `npx tsc --noEmit`

## Padrão de Server Action

```typescript
'use server'
import { z } from 'zod'

const schema = z.object({ ... })

export async function minhaAction(formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { success: false, error: result.error.flatten() }
  }
  // lógica
  return { success: true, data: ... }
}
```

## Padrão de error.tsx

```typescript
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Erro: {error.message}</p>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```
