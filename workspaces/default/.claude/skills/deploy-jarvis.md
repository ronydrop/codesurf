---
name: Deploy VPS Jarvis
description: Deploy de servicos Node.js no VPS Jarvis (76.13.166.104) via PM2
---

# Deploy VPS Jarvis

## Quando usar
Ao fazer deploy de servicos Node.js/WhatsApp bots no VPS Jarvis.

## Passos

1. Verificar estado atual:
```bash
ssh root@76.13.166.104 "pm2 status && df -h && free -m"
```

2. Identificar o app a deployar e fazer pull:
```bash
ssh root@76.13.166.104 "cd /path/to/app && git pull origin main"
```

3. Instalar dependencias se necessario:
```bash
ssh root@76.13.166.104 "cd /path/to/app && npm ci --production"
```

4. Restart do app especifico:
```bash
ssh root@76.13.166.104 "pm2 restart APP_NAME"
```

5. Verificar logs:
```bash
ssh root@76.13.166.104 "pm2 logs APP_NAME --lines 30 --nostream"
```

6. Verificar status pos-deploy:
```bash
ssh root@76.13.166.104 "pm2 show APP_NAME"
```

## Rollback
```bash
ssh root@76.13.166.104 "cd /path/to/app && git checkout HEAD~1 && npm ci --production && pm2 restart APP_NAME"
```
