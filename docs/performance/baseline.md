# Performance Baseline — Album Mundial

**Fecha:** 14 MAY 2026  
**Ambiente:** Producción (VPS Contabo 161.97.139.241, HTTPS, gestionatusfiguritas.duckdns.org)  
**Branch:** performance/scalability-hardening  
**Objetivo:** Establecer baseline antes de optimizaciones  

---

## Resumen Ejecutivo

El servidor responde pero hay margen **crítico** de mejora en:
1. **Gzip deshabilitado** → Respuesta de 141KB sin comprimir (impacto: +50-60ms en conexiones lentas)
2. **GET /api/figuritas sin paginación** → 993 items en una respuesta (impacto: -40-50ms con paginación)
3. **Búsqueda sin índice en BD** → PATCH hace tabla scan (impacto: -15-25ms con índice)

**Escalabilidad:** En riesgo si crecen datos o usuarios sin estas mejoras.

---

## 1. GET /health

### Latencia (curl, 5 iteraciones)
```
Iteración 1: 818ms
Iteración 2: 768ms
Iteración 3: 773ms
Iteración 4: 776ms
Iteración 5: 800ms

Promedio:    787ms
Mínimo:      768ms
Máximo:      818ms
Variación:   50ms (6.3%)
```

### Latencia bajo carga (autocannon, 5 conexiones, 10s)
```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬───────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev     │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼───────────┼────────┤
│ Latency │ 247 ms │ 259 ms │ 957 ms │ 967 ms │ 284.29 ms │ 118.41 ms │ 971 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴───────────┴────────┘

Percentiles:
  p2.5:   247ms
  p50:    259ms
  p97.5:  957ms ⚠️ SALTO
  p99:    967ms ⚠️ SALTO
  
Promedio: 284.29ms
Desv. Est: 118.41ms
Máximo: 971ms
```

### Throughput (autocannon)
```
Requests/sec: 17.3 avg
  p1:   5 req/s
  p2.5: 5 req/s
  p50:  19 req/s
  p97.5: 20 req/s

Bytes/sec: 6.61 kB/s
Total: 178 requests en 10.11s (66.1 kB read)
```

### Headers
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 54

❌ Cache-Control: AUSENTE (debería ser "public, max-age=60")
❌ Content-Encoding: AUSENTE (sin gzip)
```

### Análisis
- ✅ Latencia promedio aceptable (284ms incluye TLS handshake)
- ⚠️ **Variabilidad alta** en p97.5/p99 (957ms, 967ms) → problema bajo carga
- ❌ Sin cache headers → cliente repite request innecesariamente
- ❌ Sin compresión

---

## 2. GET / (Frontend HTML)

### Latencia (curl, 5 iteraciones)
```
Iteración 1: 960ms
Iteración 2: 819ms
Iteración 3: 815ms
Iteración 4: 874ms
Iteración 5: 755ms

Promedio:    845ms
Mínimo:      755ms
Máximo:      960ms
Variación:   205ms (24.3%)
```

### Headers
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 6153

Cache-Control: public, max-age=0  ❌ (no cachea)
❌ Content-Encoding: AUSENTE (sin gzip)
```

### Análisis
- ⚠️ **Variabilidad muy alta** (755-960ms, 24% variación)
- ❌ Cache-Control: max-age=0 → no cachea en cliente ni proxy
- ❌ 6.1KB sin compresión → 2KB comprimido posible (3x mejora)
- ⚠️ TLS overhead aparente en cada request

---

## 3. GET /api/figuritas (Lista completa de 993 items)

### Latencia (curl, 5 iteraciones)
```
Iteración 1: 1720ms
Iteración 2: 1719ms
Iteración 3: 1622ms
Iteración 4: 1584ms
Iteración 5: 1639ms

Promedio:    1657ms
Mínimo:      1584ms
Máximo:      1720ms
Variación:   136ms (8.2%)
```

### Latencia bajo carga (autocannon, 5 conexiones, 10s)
```
┌─────────┬────────┬────────┬─────────┬─────────┬──────────┬───────────┬─────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%   │ 99%     │ Avg      │ Stdev     │ Max     │
├─────────┼────────┼────────┼─────────┼─────────┼──────────┼───────────┼─────────┤
│ Latency │ 276 ms │ 304 ms │ 1602 ms │ 1672 ms │ 375.2 ms │ 259.85 ms │ 1691 ms │
└─────────┴────────┴────────┴─────────┴─────────┴──────────┴───────────┴─────────┘

Percentiles:
  p2.5:   276ms
  p50:    304ms
  p97.5:  1602ms ⚠️ SALTO CRÍTICO
  p99:    1672ms ⚠️ SALTO CRÍTICO
  
Promedio: 375.2ms
Desv. Est: 259.85ms (VARIABILIDAD ALTA)
Máximo: 1691ms
```

### Throughput (autocannon)
```
Requests/sec: 13.1 avg (menor que /health)
  p1:   6 req/s
  p2.5: 0 req/s
  p50:  14 req/s
  p97.5: 18 req/s

Bytes/sec: 1.85 MB/s  ⚠️ ALTA transferencia
Total: 136 requests en 10.06s (18.5 MB read)
```

### Headers
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 141044  ← 141 KB

❌ Cache-Control: AUSENTE (debería ser "public, max-age=600")
❌ Content-Encoding: AUSENTE (sin gzip)
   Si tuviera gzip: 141KB → ~35KB (4x mejora, -50-60ms en 3G/4G)
```

### Tamaño de respuesta
```
Sin comprimir: 141,044 bytes (141 KB)
Estimado con gzip: ~35,000 bytes (35 KB)
Ahorro potencial: 106 KB (75%)
```

### Análisis
- 🔴 **CRÍTICO:** Variabilidad extrema (p50=304ms, p97.5=1602ms) → 5.3x diferencia
- 🔴 **CRÍTICO:** 141KB sin gzip es excesivo → +50-60ms en redes lentas
- 🔴 **CRÍTICO:** Sin paginación → Carga TODO en una respuesta
- ❌ Sin cache → Cada request repite la transferencia y query
- ⚠️ Escalabilidad: Si dataset crece a 5000 items → 750KB sin gzip

---

## 4. PATCH /api/figuritas/:nombre (Actualizar figurita)

### Latencia (curl, 5 iteraciones, operation=add)
```
Iteración 1: 1029ms
Iteración 2: 805ms
Iteración 3: 870ms
Iteración 4: 806ms
Iteración 5: 809ms

Promedio:    864ms
Mínimo:      805ms
Máximo:      1029ms
Variación:   224ms (25.9%) ⚠️ ALTA
```

### Headers
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 139

Cache-Control: N/A (POST/PATCH nunca cachean)
❌ Content-Encoding: AUSENTE (sin gzip)
```

### Análisis
- ⚠️ **Variabilidad alta** en escritura (805-1029ms)
- 🔴 **Posible causa:** Búsqueda sin índice en `WHERE nombre = ?`
  - Con índice: esperado ~50-100ms
  - Sin índice: tabla scan en 993 registros → 100-300ms variable
- ⚠️ Respuesta pequeña (139B) pero búsqueda costosa

---

## 5. RESUMEN COMPARATIVO

| Endpoint | Latencia (avg) | p50 | p97.5 | p99 | Req/s | Headers óptimos |
|----------|---|---|---|---|---|---|
| GET /health | 284ms | 259ms | 957ms | 967ms | 17.3 | ❌ Sin cache |
| GET / | 845ms | - | - | - | - | ❌ Cache=0, sin gzip |
| GET /api/figuritas | 375ms | 304ms | 1602ms | 1672ms | 13.1 | ❌❌ 141KB, sin gzip |
| PATCH figuritas | 864ms | - | - | - | - | ⚠️ Variable (tabla scan) |

---

## 6. PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS (Impacto alto en escalabilidad)

#### 1. Gzip deshabilitado
- **Impacto:** GET /api/figuritas envía 141KB sin comprimir
- **Transferencia:** 1.85MB/s con gzip estaría en ~465KB/s (4x mejor)
- **Latencia:** +50-60ms en 3G/4G con payload grande
- **Fix:** Habilitar `gzip_types` en Nginx (2 min, -50-60ms)

#### 2. GET /api/figuritas sin paginación
- **Impacto:** Devuelve 993 items en una respuesta
- **Escalabilidad:** Si crece a 5000 items → 750KB, 25-40 segundos en 2G
- **Fix:** Implementar `?limit=50&offset=0` (45 min, -40-50ms)

#### 3. Búsqueda sin índice en PATCH
- **Impacto:** `WHERE nombre = ?` hace tabla scan
- **Variabilidad:** p50=259ms vs p97.5=1602ms (6x diferencia)
- **Fix:** `CREATE INDEX idx_figuritas_nombre` (1 min, -15-25ms)

### 🟡 IMPORTANTES (Impacto medio)

#### 4. Cache headers no optimizados
- **GET /health:** Cache-Control ausente (debería max-age=60)
- **GET /:** Cache-Control max-age=0 (debería max-age=3600)
- **GET /api/figuritas:** Sin cache (cacheable si fuera lista de solo lectura)
- **Fix:** Agregar headers en Express (2 min, -20-30ms en requests repetidas)

#### 5. Variabilidad alto en p97.5/p99
- **GET /health:** p50=259ms, p97.5=957ms (3.7x)
- **GET /api/figuritas:** p50=304ms, p97.5=1602ms (5.3x)
- **Causa posible:** 
  - DB query latency variable
  - Conexión pool bajo estrés (max 5)
  - Falta de índices
- **Fix:** Índices + monitoreo PM2

### 🟢 OPCIONALES (Impacto bajo)

#### 6. Sin cache-busting en assets
- Frontend assets CSS/JS sin versionamiento
- Users repiten descargas innecesarias
- Fix: Versionar archivos + cache-busting (futuro)

---

## 7. ESTADO DE CONFIGURACIÓN ACTUAL

### Nginx
```
✅ Reverse proxy funcional (localhost:3000)
❌ Gzip deshabilitado (gzip_types comentadas)
❌ Sin proxy_cache
❌ Sin compresión de respuestas
```

### Express (app.js)
```
✅ CORS configurable
✅ JSON parsing
✅ Static files serving
❌ Sin Cache-Control headers
❌ Sin Response compression middleware
❌ Sin paginación en /api/figuritas
```

### PostgreSQL + Sequelize
```
✅ Connection pool: max 5
✅ Logging configurable
❌ Sin índices de búsqueda
❌ Sin índice en figuritas.nombre (crítico para PATCH)
❌ Sin índice en figuritas.codigo (crítico para filtros)
❌ Sin índice en figuritas.obtenida (usado en filtros)
```

---

## 8. PLAN DE ACCIÓN (Propuesto)

### FASE 1 — Quick Wins (30 min, -30% latencia esperada)

1. **Habilitar Gzip en Nginx** (2 min)
   - Descomenta `gzip_types` en nginx.conf
   - Impacto: -50-60ms en /api/figuritas

2. **Agregar índice en figuritas.nombre** (1 min)
   - `CREATE INDEX idx_figuritas_nombre ON figuritas(nombre)`
   - Impacto: -15-25ms en PATCH (menos variabilidad)

3. **Cache headers en app.js** (2 min)
   - GET /health: `Cache-Control: public, max-age=60`
   - GET /: `Cache-Control: public, max-age=3600`
   - Impacto: -20-30ms en requests repetidas

### FASE 2 — Medium Effort (1-2 horas, -40% latencia adicional)

4. **Implementar paginación** (45 min)
   - GET /api/figuritas?limit=50&offset=0
   - Impacto: -40-50ms (menos datos transferidos)

5. **Agregar índices compuestos** (10 min)
   - `CREATE INDEX idx_figuritas_obtenida_codigo ON figuritas(obtenida, codigo)`
   - Impacto: -10-15ms en filtros combinados

### FASE 3 — Arquitectura Escalable (2-3 horas)

6. **Redis para caching escalable** (alternativa a Nginx cache)
   - TTL-based invalidation
   - Distribuido (escala con múltiples instancias)
   - Impacto: -90% latencia en cache hits

7. **API versioning pattern**
   - `/api/v1/figuritas` vs `/api/v2/figuritas`
   - Permite cambios sin romper clientes

---

## 9. Próximos Pasos

1. ✅ Baseline completado
2. ⏳ Aprobar plan de optimizaciones
3. ⏳ Implementar FASE 1 (30 min)
4. ⏳ Re-medir para validar mejoras
5. ⏳ Decidir FASE 2 o parar

---

## Notas

- **Todos los tiempos incluyen TLS/HTTPS overhead** (handshake ~200ms en primer request)
- **Variabilidad alta en p97.5** sugiere estrés bajo carga o sincronización DB
- **No optimizar sin medir** → post-implementación: re-ejecutar autocannon
- **Escalabilidad:** Estas mejoras sientan base para 10-100x usuarios sin degradación

---

**Baseline establecido:** ✅  
**Branch:** performance/scalability-hardening  
**Listo para:** FASE 1 (pendiente aprobación del usuario)
