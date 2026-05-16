# 🚀 DEVOPS - Album Mundial

**Guía completa de infraestructura, despliegue y desarrollo**

---

## 📚 ÍNDICE DE DOCUMENTACIÓN

### 🎯 EMPIEZA AQUÍ

1. **[QUICK_START.md](./QUICK_START.md)** ⭐ **COMIENZA AQUÍ (5 MIN)**
   - Guía rápida y práctica
   - Setup en 5 minutos
   - Flujo de desarrollo paso-a-paso
   - Problemas comunes y soluciones
   - **Léelo primero si no sabes por dónde empezar**

2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** ⭐ **LEE DESPUÉS**
   - Entiende la estrategia SSH tunnel en detalle
   - Setup inicial profundo (UNA SOLA VEZ)
   - Flujo de desarrollo diario avanzado
   - Debugging y troubleshooting completo
   - **Léelo para entender todo a fondo**

3. **[ROADMAP_EJECUTABLE.md](./ROADMAP_EJECUTABLE.md)** ⭐ **SI NECESITAS TODAS LAS TAREAS**
   - 60 tareas pequeñas paso-a-paso
   - 5 semanas de implementación
   - Cada tarea: 5-15 minutos
   - **Esto es lo que debes hacer exactamente en orden**

---

### 📖 DOCUMENTACIÓN DETALLADA

3. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Flujo de deploy a staging
   - Flujo de deploy a producción
   - Rollback y recuperación
   - Checklists pre-deploy
   - Monitoreo post-deploy

4. **[INFRASTRUCTURE.md](./INFRASTRUCTURE.md)**
   - Estado actual del VPS
   - Directorios y rutas clave
   - Configuración PostgreSQL
   - Nginx y PM2
   - UFW y seguridad
   - Backups y mantenimiento

---

### 🔗 SSH TUNNEL (CRÍTICO)

5. **[SSH_TUNNEL.md](./SSH_TUNNEL.md)**
   - Qué es SSH tunnel y cómo funciona
   - Setup inicial (una sola vez)
   - Uso diario: 3 terminales
   - Debugging y troubleshooting
   - Mejores prácticas y seguridad

6. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** (si empezaste con v1)
   - Qué cambió de documentación v1 a v2
   - Archivos a eliminar / crear
   - Comparación antes vs después
   - Cleanup si ya empezaste

---

## 🗺️ FLUJO VISUAL

```
LOCAL (tu máquina) via SSH Tunnel
├─ Editar código (VS Code)
├─ npm run dev       → nodemon contra BD del VPS
└─ ssh-tunnel.sh    → abre acceso a DB
     ↓ (via tunnel a 127.0.0.1:5432)
STAGING (VPS puerto 3001)
├─ Testeo seguro de cambios
├─ BD: album_mundial_staging
└─ Acceso: gestionatusfiguritas.duckdns.org/staging
     ↓ (merge a main)
PRODUCCIÓN (VPS puerto 3000)
├─ Usuarios reales
├─ BD: album_mundial
└─ Acceso: gestionatusfiguritas.duckdns.org (HTTPS)
```

---

## ⚡ QUICK START

### Opción A: Paso-a-paso (RECOMENDADO)

```bash
1. Abre ROADMAP_EJECUTABLE.md
2. Comienza TAREA 1.1: Instalar nodemon
3. Ejecuta cada comando exactamente
4. Verifica el resultado esperado
5. Pasa a siguiente tarea
6. Repite hasta CHECKLIST FINAL
```

**Tiempo:** 2-3 horas (o distribuidas en varios días)

---

### Opción B: Solo entender la arquitectura

```bash
1. Lee DEVELOPMENT.md (SSH tunnel - cómo trabajar)
2. Lee INFRASTRUCTURE.md (estado actual del VPS)
3. Lee DEPLOYMENT.md (cómo deployar a staging/prod)
```

**Tiempo:** 30 minutos

---

### Opción C: Ya tengo experiencia, solo actualícenme

```bash
1. Lee DEVELOPMENT.md sección 1-2 (SSH tunnel)
2. Ve directo a ROADMAP_EJECUTABLE.md SEMANA 2
3. Implementa infrastructure staging (SEMANA 3)
4. Crea scripts deploy (SEMANA 4)
```

**Tiempo:** 1-2 horas

---

## 📊 ESTRUCTURA DE CARPETAS

```
album-mundial/
├── devops/                          ← TÚ ESTÁS AQUÍ
│   ├── README.md                    ← Este archivo
│   ├── ROADMAP_EJECUTABLE.md        ← 55 tareas, empieza aquí
│   ├── DEVELOPMENT.md               ← Cómo trabajar (SSH tunnel)
│   ├── DEPLOYMENT.md                ← Cómo deployar
│   └── INFRASTRUCTURE.md            ← Estado del VPS
│
│
├── app.js                           ← Entry point
├── package.json
├── ssh-tunnel.sh                    ← Helper para SSH tunnel
├── .env.example                     ← Template documentado
│
├── models/                          ← Sequelize models
├── scripts/                         ← Init DB, seeders
├── public/                          ← Frontend
└── .gitignore                       ← (debe incluir .env)
```

**⚠️ NO hay `.env.development` local**
- Desarrollo se hace vía SSH tunnel al VPS
- Variables en VPS, no en tu máquina
- `.env.example` es solo documentación

---

## 🎯 PRÓXIMOS PASOS

### Si recién empiezas (RECOMENDADO):

1. **Abre [QUICK_START.md](./QUICK_START.md)** ⭐ **COMIENZA AQUÍ** (5 minutos)
2. **Lee [DEVELOPMENT.md](./DEVELOPMENT.md)** (entiende SSH tunnel)
3. **Abre [ROADMAP_EJECUTABLE.md](./ROADMAP_EJECUTABLE.md)** (si necesitas todas las tareas)
4. **Comienza TAREA 1.1: Instalar nodemon**
5. **Sigue paso-a-paso hasta CHECKLIST FINAL**

### Si ya tienes experiencia DevOps:

1. **Lee DEVELOPMENT.md sección 1-2** (SSH tunnel strategy)
2. **Lee INFRASTRUCTURE.md** (estado actual VPS)
3. **Lee DEPLOYMENT.md** (flujo deploy)
4. **Salta a ROADMAP_EJECUTABLE.md SEMANA 2** (verificaciones VPS)

### Si solo necesitas consultar algo:

- **¿Cómo abro SSH tunnel?** → DEVELOPMENT.md sección 2.1
- **¿Cómo deployo a staging/prod?** → DEPLOYMENT.md sección 2
- **¿Qué variables de entorno necesito?** → DEVELOPMENT.md sección 2.2
- **¿Puertos del VPS?** → INFRASTRUCTURE.md sección 2

---

## 📋 CHECKLIST RÁPIDO

Marcá mientras avanzes (ver ROADMAP_EJECUTABLE.md para detalles):

```
SEMANA 1: CONFIGURACIÓN INICIAL (SSH TUNNEL)
- [ ] 1.1 Instalar nodemon
- [ ] 1.2 Actualizar package.json
- [ ] 1.3-1.4 Crear .env.example y .gitignore
- [ ] 1.5 Crear script ssh-tunnel.sh
- [ ] 1.6 Test remoto vía SSH tunnel
- [ ] 1.7 Commit y push

SEMANA 2: VERIFICACIONES VPS
- [ ] 2.1-2.3 Conectar VPS y verificar servicios
- [ ] 2.4-2.5 Cambiar rama de rama-claude a main

SEMANA 3: STAGING (en VPS)
- [ ] 3.1-3.5 Crear directorio, BD y .env
- [ ] 3.6-3.7 Inicializar BD y crear PM2 process
- [ ] 3.8-3.9 Configurar Nginx para staging

SEMANA 4: SCRIPTS DE DEPLOY
- [ ] 4.1-4.3 Crear scripts deploy/rollback
- [ ] 4.4 Testear scripts en staging

SEMANA 5: TESTING Y VALIDACIÓN
- [ ] 5.1 Test remoto (SSH tunnel + nodemon)
- [ ] 5.2 Test staging (público)
- [ ] 5.3 Test producción (HTTPS)
- [ ] 5.4 CHECKLIST FINAL ✅
```

---

## 🆘 NECESITO AYUDA

**Si algo no funciona:**

1. Busca el error en la sección "Troubleshooting" del doc correspondiente
2. Verifica que ejecutaste el comando exacto
3. Comprueba el "Resultado esperado"
4. Si sigue sin funcionar, contacta DevOps

**Documentos de troubleshooting:**
- Problemas locales → DEVELOPMENT.md sección 6
- Problemas deploy → DEPLOYMENT.md sección 9
- Problemas infraestructura → INFRASTRUCTURE.md sección 12

---

## 📞 COMANDOS REFERENCIA RÁPIDA

### LOCAL - SSH Tunnel (DESARROLLO REMOTO)
```bash
# Terminal 1: Abrir tunnel
./ssh-tunnel.sh
# O manualmente:
ssh -L 5432:localhost:5432 root@161.97.139.241

# Terminal 2: Ejecutar app (contra BD del VPS)
npm run dev          # Hot reload con nodemon
npm run lint         # Verificar código
npm run init-db      # Inicializar BD (SOLO PRIMERA VEZ)

# Terminal 3: Tests
curl http://localhost:3000/health
curl http://localhost:3000/api/figuritas?limit=1
```

### LOCAL - Git Workflow
```bash
git checkout -b feature/mi-cambio
npm run dev          # Probar cambios
git add .
git commit -m "feature: descripción"
git push origin feature/mi-cambio
git checkout develop && git merge feature/mi-cambio && git push
```

### VPS - SSH
```bash
ssh root@161.97.139.241
```

### VPS - Logs
```bash
pm2 logs album-mundial              # Producción
pm2 logs album-mundial-staging      # Staging
pm2 logs album-mundial --lines 100  # Últimas 100 líneas
```

### VPS - Deploy (manual)
```bash
bash /var/www/album-mundial-staging/deploy.sh  # A staging
bash /var/www/album-mundial/deploy.sh          # A producción
bash /var/www/album-mundial/rollback.sh        # Revertir
```

### Testing
```bash
# Local (contra BD del VPS)
curl http://localhost:3000/health

# Staging (público)
curl http://gestionatusfiguritas.duckdns.org/staging/health

# Producción (público HTTPS)
curl https://gestionatusfiguritas.duckdns.org/health
```

---

## 🎓 CONCEPTOS CLAVE

| Concepto | Explicación |
|----------|-------------|
| **SSH tunnel** | ⭐ Conecta puerto local (5432) al puerto del VPS. Desarrollo remoto seguro |
| **nodemon** | Reinicia app automáticamente cuando cambias archivos |
| **staging** | Copia de producción para probar sin afectar usuarios reales |
| **PM2** | Ejecuta procesos Node.js en background, monitorea y reinicia |
| **Nginx** | Reverse proxy, maneja HTTPS/HTTP, rutea requests a puertos internos |
| **rollback** | Revertir a versión anterior si algo falla en producción |
| **seeders** | Scripts que cargan datos iniciales (980 figuritas) en BD |
| **git flow** | Ramas: main (prod) ← develop (staging) ← feature/* (development) |

---

## 🚀 OBJETIVO FINAL

Cuando termines el ROADMAP tendrás:

```
✅ Desarrollo local con hot reload automático
✅ Staging separado en VPS (pruebas seguras)
✅ Producción en VPS con HTTPS
✅ Scripts de deploy automatizados
✅ Rollback disponible si algo falla
✅ Documentación completa
✅ Infraestructura profesional lista
```

---

---

## 🚀 NUEVA ESTRATEGIA: SSH TUNNEL REMOTO

**Marzo 2026:** Cambio de estrategia de desarrollo

### ¿Qué cambió?

| Antes | Ahora |
|-------|-------|
| PostgreSQL local | PostgreSQL en VPS (vía SSH tunnel) |
| `.env.development` | Solo `.env.example` (template) |
| `npm run dev` local | `npm run dev` contra BD remota |
| Datos duplicados | BD única compartida |
| Confusión de entornos | Claridad: dev → staging → prod |

### ¿Por qué?

✅ Una sola base de datos para todos (dev, staging, prod)
✅ Datos sincronizados en tiempo real
✅ Menos overhead local (sin PostgreSQL)
✅ Desarrollo remoto seguro (SSH)
✅ Más realista que ambiente local

### Flujo Nuevo:

```
Terminal 1: ./ssh-tunnel.sh                    (Abre tunnel)
Terminal 2: npm run dev                        (App con nodemon)
Terminal 3: curl, git, editar código           (Tu trabajo)
```

---

## 📋 Cambios en la Documentación

- ✅ **ROADMAP_EJECUTABLE.md** - Actualizado a SSH tunnel
- ✅ **DEVELOPMENT.md** - Reescrito para SSH tunnel
- ✅ **SSH_TUNNEL.md** - Nueva guía específica (LEER)
- ✅ **README.md** - Este archivo, actualizado
- ✅ **INFRASTRUCTURE.md** - Nota sobre SSH tunnel

---

## 📝 HISTORIAL

- **2026-05-15 (v2):** Cambio a SSH tunnel remoto
  - Eliminada estrategia de desarrollo local
  - Roadmap y documentación actualizada
  - Nueva guía SSH_TUNNEL.md
- **2026-05-15 (v1):** Documentación inicial creada
- **Stack:** Node.js + Express + Sequelize + PostgreSQL
- **Infraestructura:** VPS Ubuntu 24.04 con Nginx, PM2, PostgreSQL
- **Objetivo:** Setup DevOps profesional para "bombazo" 🚀

---

**¿Listo para empezar? →**

1. **Lee:** [DEVELOPMENT.md](./DEVELOPMENT.md) (SSH tunnel basics)
2. **Lee:** [SSH_TUNNEL.md](./SSH_TUNNEL.md) (Setup detallado)
3. **Empieza:** [ROADMAP_EJECUTABLE.md](./ROADMAP_EJECUTABLE.md) (TAREA 1.1)
