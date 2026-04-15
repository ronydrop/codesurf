---
name: Health Check VPS
description: Verifica saude dos 3 VPS — disk, memory, servicos, SSL, uptime
---

# Health Check VPS

## Quando usar
Para verificar o estado geral de toda a infraestrutura.

## Passos

Executar em paralelo nos 3 VPS:

### VPS Jarvis (76.13.166.104)
```bash
ssh root@76.13.166.104 "echo '=== DISK ===' && df -h / && echo '=== MEMORY ===' && free -m && echo '=== UPTIME ===' && uptime && echo '=== PM2 ===' && pm2 status && echo '=== NGINX ===' && systemctl is-active nginx && echo '=== SSL ===' && openssl s_client -connect jarvis.example.com:443 -servername jarvis.example.com </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo 'SSL check failed'"
```

### VPS Shadow (216.238.114.122)
```bash
ssh root@216.238.114.122 "echo '=== DISK ===' && df -h / && echo '=== MEMORY ===' && free -m && echo '=== UPTIME ===' && uptime && echo '=== SERVICES ===' && systemctl is-active aprovei postgresql redis-server nginx && echo '=== HEALTH ===' && curl -s http://127.0.0.1:8080/health && echo '=== CONNECTIONS ===' && ss -tlnp | grep -E '(8080|5432|6379)'"
```

### VPS yt-copilot (31.97.28.194)
```bash
ssh root@31.97.28.194 "echo '=== DISK ===' && df -h / && echo '=== MEMORY ===' && free -m && echo '=== UPTIME ===' && uptime && echo '=== SERVICES ===' && systemctl list-units --type=service --state=running --no-pager | head -20"
```

## Output
Consolidar em relatorio:
- OK / WARNING / CRITICAL por VPS
- Disk: WARNING se > 80%, CRITICAL se > 90%
- Memory: WARNING se > 80%
- Servicos: CRITICAL se algum down
