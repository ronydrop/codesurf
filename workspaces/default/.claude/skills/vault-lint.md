---
name: Lint Brain Vault
description: Verifica saude do vault — links quebrados, frontmatter, orfas, contradiscoes
---

# Lint Brain Vault

## Quando usar
Periodicamente ou apos grandes ingestoes de conteudo no vault.

## Passos

### 1. Lint programatico
```bash
cd ~/brain && bash lint.sh
```

### 2. Verificacoes manuais adicionais

**Links quebrados:**
```bash
cd ~/brain/wiki && grep -roh '\[\[.*\]\]' *.md **/*.md | sort -u | while read link; do
  target=$(echo "$link" | sed 's/\[\[//;s/\]\]//;s/|.*//')
  [ ! -f "${target}.md" ] && [ ! -f "*/${target}.md" ] && echo "BROKEN: $link"
done
```

**Paginas orfas (nao referenciadas por nenhuma outra):**
```bash
cd ~/brain/wiki && for f in *.md **/*.md; do
  base=$(basename "$f" .md)
  count=$(grep -rl "\[\[$base" . 2>/dev/null | wc -l)
  [ "$count" -eq 0 ] && echo "ORPHAN: $f"
done
```

**INDEX.md atualizado:**
Verificar se todas as paginas em wiki/ estao listadas no INDEX.md.

**Frontmatter:**
Verificar que toda pagina tem: title, tags, created, updated.

## Output
- Total de paginas
- Links quebrados (count + lista)
- Paginas orfas (count + lista)
- Frontmatter faltando (count + lista)
- Sugestoes de correcao
