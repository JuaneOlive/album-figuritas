# Guía de Deployment - Album Mundial

## Flujo de Deploy

```
LOCAL: feature/mi-cambio
         ↓ git push
GITHUB: develop branch
         ↓ deploy-staging.sh
STAGING: puerto 3001
         ↓ merge a main
GITHUB: main branch
         ↓ deploy-prod.sh
PRODUCCIÓN: puerto 3000 (HTTPS)
```

---

## 1. Deploy a Staging

### 1.1 Requisitos

- [ ] Cambios en rama `feature/xxx`
- [ ] Merge a `develop` completado
- [ ] Push a `origin develop` completado

### 1.2 Comando de Deploy

```bash
# En VPS:
ssh root@161.97.139.241
bash /var/www/album-mundial-staging/deploy.sh
```

### 1.3 Verificar que funciona

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/health
pm2 logs album-mundial-staging --lines 20
```

### 1.4 Testing en Staging

- [ ] Health check devuelve `{"status":"ok"}`
- [ ] `/api/figuritas` devuelve figuritas
- [ ] Puedo filtrar: `/api/figuritas?codigo=ARG`
- [ ] Puedo agregar/quitar figurita: PATCH
- [ ] No hay errores en logs
- [ ] BD tiene 980 figuritas

---

## 2. Deploy a Producción

### 2.1 Requisitos (CRÍTICO)

- [ ] Testing en staging completado
- [ ] No hay usuarios accediendo AHORA
- [ ] Cambios mergeados a `main`
- [ ] Backup de BD creado (script lo hace automático)

### 2.2 Comando de Deploy

```bash
ssh root@161.97.139.241
bash /var/www/album-mundial/deploy.sh
```

### 2.3 Verificar que funciona

```bash
curl https://gestionatusfiguritas.duckdns.org/health
pm2 logs album-mundial --lines 20
```

### 2.4 Downtime

- **Tiempo estimado:** 30-60 segundos
- **Downtime real:** < 5 segundos
- **Usuarios afectados:** Solo quienes hacían request en ese momento

---

## 3. Rollback

### 3.1 Rollback automático

Si deploy falla, el script `deploy-prod.sh` revierte automáticamente:

```
1. Health check falla
2. git revert HEAD
3. Reinstala dependencias
4. Reinicia PM2
```

### 3.2 Rollback manual

```bash
ssh root@161.97.139.241
bash /var/www/album-mundial/rollback.sh

# Verificar
curl https://gestionatusfiguritas.duckdns.org/health
```

---

## 4. Procedimiento Completo

```bash
# PASO 1: Verificar estado
git status
git log --oneline main | head -5

# PASO 2: Testear staging
curl http://gestionatusfiguritas.duckdns.org/staging/health
pm2 logs album-mundial-staging --lines 50

# PASO 3: Conectar al VPS
ssh root@161.97.139.241

# PASO 4: Hacer deploy
bash /var/www/album-mundial/deploy.sh

# PASO 5: Verificar
curl https://gestionatusfiguritas.duckdns.org/health
pm2 logs album-mundial --lines 20
```

---

## 5. Checklist Pre-Deploy

### Antes de merge a main

- [ ] Testeado localmente con `npm run dev`
- [ ] Desplegado en staging
- [ ] Testing completo en staging sin errores
- [ ] Logs de staging sin errores
- [ ] No hay datos sensibles en código
- [ ] No hay breaking changes

### Antes de ejecutar deploy-prod.sh

- [ ] Rama `main` actualizada
- [ ] Último commit es el deseado
- [ ] Backup automático de BD (script lo hace)
- [ ] Health check en staging OK
- [ ] Nadie accediendo a la app AHORA
- [ ] Terminal disponible para monitorear logs

---

## 6. Monitoreo Post-Deploy

### Primeros 5 minutos

```bash
# Terminal 1: Logs en vivo
pm2 logs album-mundial

# Terminal 2: Health check
curl https://gestionatusfiguritas.duckdns.org/health
curl https://gestionatusfiguritas.duckdns.org/api/figuritas?limit=1

# Terminal 3: Estado de procesos
pm2 status
```

### Si ves errores

1. `pm2 stop album-mundial`
2. `pm2 logs album-mundial --lines 100`
3. `bash /var/www/album-mundial/rollback.sh`

---

## 7. Scripts de Deploy

```
/var/www/album-mundial/deploy.sh      → A producción
/var/www/album-mundial/rollback.sh    → Revertir
/var/www/album-mundial-staging/deploy.sh → A staging
```

---

## 8. Diferencias Staging vs Producción

| Aspecto | Staging | Producción |
|---------|---------|-----------|
| Rama | develop | main |
| Puerto | 3001 | 3000 |
| BD | album_mundial_staging | album_mundial |
| URL | duckdns.org:3001 | duckdns.org |
| Usuarios reales | NO | SÍ |
| Datos | Limpios (seeders) | Reales |
| Downtime permitido | SÍ | NO (< 30 seg) |

---

## 9. Troubleshooting

### Error: "not a git repository"

```bash
cd /var/www/album-mundial
git status
```

### Error: "database connection failed"

```bash
systemctl status postgresql
systemctl restart postgresql
```

### Error: "PM2 process not found"

```bash
pm2 start app.js --name album-mundial
pm2 save
```

### Health check devuelve error

```bash
pm2 logs album-mundial --lines 100
# Si BD está vacía: npm run init-db
```

---

Para más info, ver [README.md](./README.md)
