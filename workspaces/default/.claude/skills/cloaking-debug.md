---
name: Debug Cloaking
description: Analisa request contra as camadas de cloaking do Aprovei
---

# Debug Cloaking

## Quando usar
Quando um request esta sendo bloqueado/permitido inesperadamente pelo sistema de cloaking.

## Camadas Server-Side (8)
1. **IP Reputation** — Blacklists, datacenter IPs, proxy detection
2. **GeoIP** — MaxMind GeoLite2 + IPInfo.io, pais/ASN/org
3. **User-Agent** — Bots conhecidos, headless browsers, UA malformado
4. **Referrer** — Validacao de referrer contra campanha configurada
5. **Header Fingerprint** — Headers faltando, ordem anomala, Accept inconsistente
6. **Rate Limiting** — Requests/min por IP, fail-open se Redis indisponivel
7. **Behavioral Score** — Score acumulado das camadas anteriores
8. **TLS Fingerprint** — JA3/JA4 hash, fingerprints de bots conhecidos

## Camadas Client-Side (40+ sinais)
Canvas fingerprint, WebGL renderer, AudioContext, fonts instaladas, screen resolution, timezone vs GeoIP, navigator properties, WebRTC leak, battery API, connection API, timing attacks...

## Passos de Debug
1. Obter o request suspeito (IP, headers, timestamp)
2. Verificar logs: `journalctl -u aprovei --since "TIME" | grep IP`
3. Para cada camada, verificar o score individual
4. Identificar qual camada tomou a decisao final
5. Se bloqueio incorreto: ajustar threshold da camada especifica
6. Lembrar: sistema e fail-open (na duvida, mostra white page)
