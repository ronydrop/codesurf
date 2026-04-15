---
name: Deploy VPS Shadow
description: Deploy zero-downtime do Aprovei no VPS Shadow (216.238.114.122)
---

# Deploy VPS Shadow

## Quando usar
Ao fazer deploy de mudancas no backend Go do Aprovei Shadow.

## Passos

1. Verificar estado atual:
```bash
ssh root@216.238.114.122 "systemctl status aprovei && df -h && free -m"
```

2. Pull do codigo:
```bash
ssh root@216.238.114.122 "cd /opt/aprovei && git pull origin main"
```

3. Build do binario:
```bash
ssh root@216.238.114.122 "cd /opt/aprovei && go build -o aprovei-new ./cmd/server"
```

4. Swap do binario (zero-downtime):
```bash
ssh root@216.238.114.122 "cd /opt/aprovei && mv aprovei-new aprovei-live && systemctl restart aprovei"
```

5. Verificar health:
```bash
ssh root@216.238.114.122 "sleep 3 && curl -s http://127.0.0.1:8080/health"
```

6. Verificar logs pos-deploy:
```bash
ssh root@216.238.114.122 "journalctl -u aprovei --since '2 minutes ago' --no-pager"
```

## Rollback
Se o health check falhar:
```bash
ssh root@216.238.114.122 "cd /opt/aprovei && git checkout HEAD~1 && go build -o aprovei-live ./cmd/server && systemctl restart aprovei"
```
