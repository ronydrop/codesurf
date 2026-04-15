---
name: Sync Brain Vault
description: Sincroniza vault brain do WSL para Windows e verifica integridade
---

# Sync Brain Vault

## Quando usar
Apos modificacoes no vault ~/brain/ para sincronizar com o Obsidian no Windows.

## Passos

### 1. Verificar mudancas pendentes
```bash
cd ~/brain && git status
```

### 2. Commit se necessario
```bash
cd ~/brain && git add -A && git commit -m "vault: update $(date +%Y-%m-%d)"
```

### 3. Executar sync
```bash
~/brain/sync-to-obsidian.sh
```

### 4. Verificar sync
```bash
diff -rq ~/brain/wiki/ "/mnt/c/Users/ronyo/Documents/Obsidian Vault/wiki/" | head -20
```

### 5. Verificar integridade
```bash
cd ~/brain && bash lint.sh
```

## Notas
- Sync e unidirecional: WSL -> Windows
- Obsidian no Windows e read-only (so para visualizacao/graph view)
- Edicoes devem ser feitas no WSL (~/brain/)
