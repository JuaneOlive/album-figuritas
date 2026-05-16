# 🎯 ROADMAP EJECUTABLE - Album Mundial DevOps

> "Un gran objetivo es inalcanzable, pero muchos objetivos pequeños llevan a la cima"

**Descripción:** Checklist de micro-tareas para implementar arquitectura DevOps segura.

**Estrategia de desarrollo:** SSH tunnel remoto al VPS (sin ambiente local de PostgreSQL)

**Duración total:** 2-3 horas (tareas de 3-15 min cada una)
**Metodología:** Completa una tarea → Verifica → Marca ✅ → Siguiente

---

## 🗺️ MAPA DEL ROADMAP

```
SEMANA 1: CONFIGURACIÓN INICIAL (git + npm scripts)
├─ Tarea 1.1-1.2: Instalar nodemon y scripts
├─ Tarea 1.3-1.4: Variables de entorno (solo templates)
├─ Tarea 1.5: Instalar OpenSSH
├─ Tarea 1.6: Crear script SSH tunnel helper
└─ Tarea 1.7: Test remoto vía SSH tunnel

SEMANA 2: VERIFICACIONES VPS (preparar infraestructura)
├─ Tarea 2.1: Conectar y verificar servicios
├─ Tarea 2.2: Verificar recursos
└─ Tarea 2.3: Cambiar a rama main

SEMANA 3: STAGING (crear entorno de pruebas)
├─ Tarea 3.1-3.5: Clonar código y crear BD
├─ Tarea 3.6-3.7: Inicializar y levantar PM2
└─ Tarea 3.8-3.9: Configurar Nginx

SEMANA 4: SCRIPTS (automatizar deploys)
├─ Tarea 4.1-4.3: Crear scripts de deploy
└─ Tarea 4.4: Testear scripts

SEMANA 5: TESTING Y VALIDACIÓN
├─ Tarea 5.1-5.3: Validar staging y prod
└─ Tarea 5.4: Checklist final
```

---

# SEMANA 1: CONFIGURACIÓN INICIAL

## TAREA 1.1: Instalar nodemon

**Objetivo:** Agregar hot reload a desarrollo remoto

**Duración:** 2 minutos

**Comando a ejecutar:**

```bash
cd d:\Users\usuario\Desktop\Juane\FACULTAD\DDS\album-mundial
npm install --save-dev nodemon
```

**¿Cómo verifico que funcionó?**

```bash
npm list nodemon
```

**Resultado esperado:** 
```
nodemon@3.x.x (debe mostrar versión)
```

**✅ Si ves la versión:** Tarea completada
**❌ Si error:** Verifica que estés en la carpeta correcta

---

## TAREA 1.2: Actualizar package.json - Agregar scripts

**Objetivo:** Agregar comandos para desarrollo remoto vía SSH tunnel

**Duración:** 3 minutos

**Nota importante:** Ya hicimos algunos cambios. Esta tarea es verificar que todo esté correcto.

**Abre `package.json` y verifica que la sección `"scripts"` tenga:**

```json
"scripts": {
  "dev": "nodemon app.js",
  "dev:tunnel": "concurrently \"bash ssh-tunnel.sh\" \"nodemon app.js\"",
  "staging": "NODE_ENV=staging node app.js",
  "start": "node app.js",
  "init-db": "node scripts/initDb.js",
  "reset-db": "node scripts/resetDb.js",
  "lint": "eslint .",
  "tunnel": "bash ssh-tunnel.sh"
}
```

**✅ Si tienes estos scripts:** Tarea completada
**❌ Si falta alguno:** Actualiza package.json manualmente

---

## TAREA 1.3: Crear/Actualizar .env.example

**Objetivo:** Template para documentación sin credenciales reales

**Duración:** 2 minutos

**Verifica que `.env.example` contiene valores de PLACEHOLDER, NO reales:**

```env
# Entorno de ejecución
NODE_ENV=development|staging|production

# Puerto del servidor (desarrollo remoto)
PORT=3000

# Conexión PostgreSQL (vía SSH tunnel)
# Cuando usas SSH tunnel: ssh -L 5432:localhost:5432 root@161.97.139.241
DB_HOST=localhost
DB_PORT=5432
DB_NAME=album_mundial
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# CORS
CORS_ORIGIN=http://localhost:3000
```

**✅ Si contiene placeholders (`your_...` NO valores reales):** Tarea completada
**❌ Si tiene `postgres` u otros valores reales:** Actualiza con placeholders

---

## TAREA 1.4: Actualizar .gitignore

**Objetivo:** Asegurar que NO se suba ningún `.env` real

**Duración:** 1 minuto

**Verifica que `.gitignore` contiene:**

```bash
cat .gitignore | grep -E "^\.env"
```

**Resultado esperado:**
```
.env
.env.local
.env*.local
.env.development
```

**✅ Si `.gitignore` tiene estos patrones:** Tarea completada
**❌ Si falta:** Agrega manualmente

---

## TAREA 1.5: Instalar OpenSSH (Windows)

**Objetivo:** Preparar SSH para tunnel al VPS

**Duración:** 2 minutos

**En Git Bash, verifica que tienes SSH:**

```bash
ssh -V
```

**Resultado esperado:**
```
OpenSSH_9.x.x (o similar)
```

**✅ Si ves versión:** Tarea completada
**❌ Si no funciona:** Reinstala Git Bash desde https://git-scm.com/download/win

---

## TAREA 1.6: Crear script SSH tunnel helper

**Objetivo:** Script para facilitar conexión remota al VPS

**Duración:** 2 minutos

**Verifica que existe `ssh-tunnel.sh` en la raíz con contenido:**

```bash
#!/bin/bash
# ssh-tunnel.sh - Conectar a VPS con tunnel a BD

echo "🔗 Abriendo SSH tunnel a VPS..."
echo "   Comando: ssh -L 5432:localhost:5432 root@161.97.139.241"
echo "   Presiona Ctrl+C para cerrar tunnel"
echo ""

ssh -L 5432:localhost:5432 root@161.97.139.241

echo ""
echo "❌ Tunnel cerrado"
```

**✅ Si existe y es ejecutable:** Tarea completada
**❌ Si falta:** Crea manualmente

---

## TAREA 1.7: Test remoto vía SSH tunnel (EXPLICACIÓN MEJORADA)

**Objetivo:** Verificar que npm run dev:tunnel funciona contra VPS

**Duración:** 10 minutos

⚠️ **IMPORTANTE:** Esta tarea requiere **3 TERMINALES SIMULTÁNEAMENTE ABIERTAS**

### TERMINAL 1 - ABRE EL TUNNEL (y DÉJALO ABIERTO)

En Git Bash:
```bash
cd d:\Users\usuario\Desktop\Juane\FACULTAD\DDS\album-mundial
./ssh-tunnel.sh
```

**Verás:**
```
🔗 Abriendo SSH tunnel a VPS...
   Comando: ssh -L 5432:localhost:5432 root@161.97.139.241
   Presiona Ctrl+C para cerrar tunnel

root@161.97.139.241's password: [escribe contraseña aquí]
```

**⚠️ Deja esta terminal ABIERTA durante todo el test. NO la cierres.**

### TERMINAL 2 - VERIFICA QUE EL TUNNEL ESTÁ CONECTADO

Mientras Terminal 1 está abierta, en PowerShell o Git Bash:
```bash
netstat -ano | findstr 5432
```

**Resultado esperado (si es ESTABLECIDO):**
```
TCP    127.0.0.1:5432    127.0.0.1:XXXXX    ESTABLISHED
```

**Si ves ESTABLISHED:** El tunnel está OK ✅

**Si NO ves nada:** Espera 5 segundos en Terminal 1 a que se conecte, luego reintentar

### TERMINAL 3 - INICIA LA APP

En otra terminal (Git Bash o PowerShell):
```bash
cd d:\Users\usuario\Desktop\Juane\FACULTAD\DDS\album-mundial
npm run dev
```

**Resultado esperado:**
```
> album-mundial@1.0.0 dev
> nodemon app.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node app.js`
Servidor de la API corriendo en http://127.0.0.1:3000
```

**✅ Si ves "corriendo en http://127.0.0.1:3000":** Éxito 🎉

**❌ Si ves error "ECONNREFUSED":** El tunnel NO está conectado en Terminal 1

### TERMINAL 4 - TEST HEALTH ENDPOINT (opcional)

En otra terminal:
```bash
curl http://localhost:3000/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"2026-05-16T..."}
```

### TERMINAL 3 - TEST NODEMON HOT RELOAD

Mientras Terminal 3 está corriendo con nodemon:
1. Edita cualquier archivo (ej: `app.js`)
2. Guarda el archivo
3. En Terminal 3 deberías ver:
```
[nodemon] restarting due to changes...
[nodemon] restarted
```

**✅ Si ves que nodemon reinicia automáticamente:** ¡Funcionan los hot reloads!

### PARA TERMINAR EL TEST

En cada terminal:
```bash
Ctrl+C
```

Verás en cada una:
- Terminal 1: `❌ Tunnel cerrado`
- Terminal 3: `[nodemon] clean exit`

**✅ Si todo lo anterior funcionó correctamente:** TAREA COMPLETADA

---

# SEMANA 2: VERIFICACIONES VPS

## TAREA 2.1: Conectar al VPS

**Objetivo:** Acceder por SSH

**Duración:** 1 minuto

**Comando:**

```bash
ssh root@161.97.139.241
```

**Se pedirá contraseña:** `kcg011ac850rl`

**Resultado esperado:**
```
root@album-mundial:~#
```

**✅ Si ves el prompt root@:** Tarea completada (estás dentro del VPS)
**❌ Si error de conexión:** Verifica IP y contraseña

---

## TAREA 2.2: Verificar servicios básicos

**Objetivo:** Confirmar que Node, PostgreSQL y Nginx están corriendo

**Duración:** 3 minutos

**Comando 1 - Node:**

```bash
node --version && npm --version
```

**Resultado esperado:**
```
v20.x.x
9.x.x
```

**Comando 2 - PostgreSQL:**

```bash
sudo systemctl status postgresql | grep -E "active|failed"
```

**Resultado esperado:**
```
active (running)
```

**Comando 3 - PM2 status:**

```bash
pm2 status
```

**Resultado esperado:**
```
│ 0  │ album-mundial │ fork │ online │
│ 1  │ album-api     │ fork │ online │
```

**Comando 4 - Nginx:**

```bash
sudo systemctl status nginx | grep -E "active|failed"
```

**Resultado esperado:**
```
active (running)
```

**✅ Si todo dice `active (running)` y `online`:** Tarea completada
**❌ Si algo está `inactive`:** Contacta DevOps

---

## TAREA 2.3: Cambiar a rama main (SI ES NECESARIO)

**Objetivo:** Verificar que producción está en rama `main`

**Duración:** 5 minutos

**Comando 1 - Ver rama actual:**

```bash
cd /var/www/album-mundial
git branch
```

**¿Ves `* main`?**

- **SÍ:** Tarea completada ✅ (Salta a Semana 3)
- **NO (ves `* rama-claude`):** Continúa...

**Comando 2 - Cambiar a main:**

```bash
git fetch origin
git checkout main
git pull origin main
```

**Comando 3 - Instalar dependencias:**

```bash
npm install --omit=dev
```

**Comando 4 - Reiniciar:**

```bash
pm2 restart album-mundial
pm2 status
```

**Comando 5 - Verificar:**

```bash
curl https://gestionatusfiguritas.duckdns.org/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

**✅ Si todo OK:** Producción ahora en `main`, tarea completada
**❌ Si error en health:** Revierte: `git checkout rama-claude && pm2 restart`

---

# SEMANA 3: STAGING (ENTORNO DE PRUEBAS)

## TAREA 3.1: Crear directorio staging

**Objetivo:** Carpeta separada para staging

**Duración:** 1 minuto

**Comando:**

```bash
sudo mkdir -p /var/www/album-mundial-staging
ls -la /var/www | grep staging
```

**Resultado esperado:**
```
drwxr-xr-x album-mundial-staging
```

**✅ Si ves el directorio:** Tarea completada

---

## TAREA 3.2: Clonar código a staging

**Objetivo:** Copiar el repositorio a staging en rama `develop`

**Duración:** 3 minutos

**Comando:**

```bash
cd /var/www/album-mundial-staging
git clone https://github.com/JuaneOlive/album-figuritas.git .
git checkout develop
git pull origin develop
```

**Resultado esperado:**
```
Cloning into '.'...
Switched to branch 'develop'
Already up to date.
```

**Verifica:**

```bash
git branch
```

**✅ Si ves `* develop`:** Tarea completada

---

## TAREA 3.3: Instalar dependencias

**Objetivo:** npm install para staging

**Duración:** 2 minutos

**Comando:**

```bash
cd /var/www/album-mundial-staging
npm install --omit=dev
```

**✅ Si termina sin errores:** Tarea completada

---

## TAREA 3.4: Crear BD staging en PostgreSQL

**Objetivo:** Nueva BD vacía para staging

**Duración:** 2 minutos

**Comando:**

```bash
sudo -u postgres psql <<SQL
CREATE DATABASE album_mundial_staging OWNER album_user;
GRANT ALL PRIVILEGES ON DATABASE album_mundial_staging TO album_user;
\q
SQL
```

**Verifica:**

```bash
psql -U album_user -d album_mundial_staging -c "SELECT 1;"
```

**Resultado esperado:**
```
 ?column? 
----------
        1
(1 row)
```

**✅ Si ves `(1 row)`:** Tarea completada

---

## TAREA 3.5: Crear .env.staging en VPS

**Objetivo:** Variables de entorno para staging en el VPS

**Duración:** 2 minutos

**Comando:**

```bash
cat > /var/www/album-mundial-staging/.env <<EOF
NODE_ENV=staging
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=album_mundial_staging
DB_USER=album_user
DB_PASSWORD=postgres
CORS_ORIGIN=http://gestionatusfiguritas.duckdns.org:3001
EOF
```

**Verifica:**

```bash
cat /var/www/album-mundial-staging/.env
```

**✅ Si ves las variables:** Tarea completada

---

## TAREA 3.6: Inicializar BD staging con seeders

**Objetivo:** Cargar los 980 datos en staging

**Duración:** 2 minutos

**Comando:**

```bash
cd /var/www/album-mundial-staging
npm run init-db
```

**Verifica:**

```bash
psql -U album_user -d album_mundial_staging -c "SELECT COUNT(*) FROM \"Figuritas\";"
```

**Resultado esperado:**
```
 count 
-------
   980
(1 row)
```

**✅ Si ves `980`:** Tarea completada

---

## TAREA 3.7: Crear PM2 process para staging

**Objetivo:** Levantar el proceso en puerto 3001

**Duración:** 2 minutos

**Comando:**

```bash
cd /var/www/album-mundial-staging
pm2 start app.js --name album-mundial-staging
pm2 save
pm2 status
```

**Resultado esperado:**
```
│ 0  │ album-mundial         │ fork │ online │
│ 1  │ album-mundial-staging │ fork │ online │
```

**✅ Si ves 2 procesos `online`:** Tarea completada

---

## TAREA 3.8: Verificar que staging responde

**Objetivo:** Confirmar que el servidor en 3001 funciona

**Duración:** 2 minutos

**Comando 1 - Health check:**

```bash
curl http://127.0.0.1:3001/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"..."}
```

**Comando 2 - Ver logs:**

```bash
pm2 logs album-mundial-staging --lines 10
```

**✅ Si todo OK sin errores en rojo:** Tarea completada

---

## TAREA 3.9: Configurar Nginx para staging

**Objetivo:** Hacer accesible staging público en Nginx

**Duración:** 3 minutos

**Comando 1 - Editar config:**

```bash
sudo nano /etc/nginx/sites-available/album-mundial
```

**Comando 2 - Agregar al final del archivo (antes del último `}`)**

```nginx
    # STAGING - Location /staging
    location /staging {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_redirect off;
    }
```

**Para salir de nano:** `Ctrl+X → Y → Enter`

**Comando 3 - Validar y recargar:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Comando 4 - Testear:**

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/health
```

**Resultado esperado:**
```json
{"status":"ok"}
```

**✅ Si ves `status":"ok"`:** Tarea completada

---

# SEMANA 4: SCRIPTS DE DEPLOY

## TAREA 4.1: Crear deploy-staging.sh

**Objetivo:** Script para desplegar cambios a staging automáticamente

**Duración:** 3 minutos

**Comando:**

```bash
sudo cat > /var/www/album-mundial-staging/deploy.sh <<'EOF'
#!/bin/bash
set -e

cd /var/www/album-mundial-staging

echo "📥 Descargando cambios..."
git pull origin develop

echo "📦 Instalando dependencias..."
npm install --omit=dev

echo "🌱 Inicializando BD..."
npm run init-db

echo "🔄 Reiniciando proceso..."
pm2 restart album-mundial-staging

echo "✅ Deploy a staging completado"
curl http://127.0.0.1:3001/health
EOF

sudo chmod +x /var/www/album-mundial-staging/deploy.sh
```

**✅ Si ejecuta sin errores:** Tarea completada

---

## TAREA 4.2: Crear deploy-prod.sh

**Objetivo:** Script para desplegar cambios a producción con backup

**Duración:** 3 minutos

**Comando:**

```bash
sudo cat > /var/www/album-mundial/deploy.sh <<'EOF'
#!/bin/bash
set -e

cd /var/www/album-mundial
BACKUP_DIR="/home/app-deploy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Backup de BD..."
pg_dump -U album_user album_mundial | gzip > $BACKUP_DIR/album_mundial_$TIMESTAMP.sql.gz

echo "📥 Descargando cambios..."
git pull origin main

echo "📦 Instalando dependencias..."
npm install --omit=dev

echo "🔄 Reiniciando..."
pm2 restart album-mundial
sleep 3

echo "🏥 Verificando..."
if curl -f http://127.0.0.1:3000/health > /dev/null 2>&1; then
    echo "✅ DEPLOY EXITOSO"
else
    echo "❌ ROLLBACK"
    git revert HEAD
    npm install --omit=dev
    pm2 restart album-mundial
    exit 1
fi
EOF

sudo chmod +x /var/www/album-mundial/deploy.sh
```

**✅ Si ejecuta sin errores:** Tarea completada

---

## TAREA 4.3: Crear rollback.sh

**Objetivo:** Script para revertir deployment de producción

**Duración:** 2 minutos

**Comando:**

```bash
sudo cat > /var/www/album-mundial/rollback.sh <<'EOF'
#!/bin/bash
set -e

cd /var/www/album-mundial

echo "⏮️  ROLLBACK IN PROGRESS"

git revert HEAD
npm install --omit=dev
pm2 restart album-mundial

sleep 3

if curl -f http://127.0.0.1:3000/health > /dev/null 2>&1; then
    echo "✅ ROLLBACK COMPLETE"
else
    echo "❌ ROLLBACK FAILED"
    exit 1
fi
EOF

sudo chmod +x /var/www/album-mundial/rollback.sh
```

**✅ Si ejecuta sin errores:** Tarea completada

---

# SEMANA 5: TESTING Y VALIDACIÓN

## TAREA 5.1: Test remoto - Verificar SSH tunnel

**Objetivo:** Validar que SSH tunnel y nodemon funcionan

**Duración:** 5 minutos

**Requisito:** Ya completaste TAREA 1.7 exitosamente

**Comando simple:**

```bash
npm run dev:tunnel
```

**Resultado esperado:**
```
[0] 🔗 Abriendo SSH tunnel a VPS...
[1] [nodemon] 3.1.14
[1] Servidor de la API corriendo en http://127.0.0.1:3000
```

**✅ Si ves ambas líneas:** Tarea completada (Ctrl+C para terminar)

---

## TAREA 5.2: Test staging - Acceder desde internet

**Objetivo:** Verificar que staging es accesible

**Duración:** 2 minutos

**Test 1:**

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/health
```

**Test 2:**

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/api/figuritas?limit=1
```

**✅ Si ambos devuelven datos JSON:** Tarea completada

---

## TAREA 5.3: Test producción

**Objetivo:** Confirmar que producción sigue funcionando

**Duración:** 2 minutos

**Test:**

```bash
curl https://gestionatusfiguritas.duckdns.org/health
```

**✅ Si devuelve `{"status":"ok"}`:** Tarea completada

---

## TAREA 5.4: CHECKLIST FINAL ✅

Marca cada ✅ si pasó:

### DESARROLLO REMOTO
- [ ] ✅ `npm run dev:tunnel` funciona
- [ ] ✅ `npm run dev` (remoto) conecta a BD del VPS vía tunnel
- [ ] ✅ `curl http://localhost:3000/health` devuelve OK
- [ ] ✅ Editar archivo → nodemon reinicia automático

### STAGING
- [ ] ✅ `pm2 status` muestra 2 procesos `online`
- [ ] ✅ `curl http://gestionatusfiguritas.duckdns.org/staging/health` devuelve OK
- [ ] ✅ BD `album_mundial_staging` tiene 980 figuritas

### PRODUCCIÓN
- [ ] ✅ VPS está en rama `main`
- [ ] ✅ `curl https://gestionatusfiguritas.duckdns.org/health` devuelve OK

### SCRIPTS & DEPLOY
- [ ] ✅ `/var/www/album-mundial-staging/deploy.sh` existe
- [ ] ✅ `/var/www/album-mundial/deploy.sh` existe
- [ ] ✅ `/var/www/album-mundial/rollback.sh` existe

---

## 🎉 SI MARCASTE TODOS LOS ✅

**¡FELICIDADES! Tu infraestructura DevOps está lista:**

```
✅ Desarrollo REMOTO vía SSH tunnel
✅ Nodemon hot reload contra BD del VPS
✅ Staging separado en VPS (puerto 3001)
✅ Producción en VPS (puerto 3000, HTTPS)
✅ Scripts de deploy automatizados
✅ Rollback disponible
```

---

## 📚 REFERENCIA RÁPIDA

```bash
# LOCAL - Desarrollo
npm run dev:tunnel    # Abre tunnel + app (recomendado)
npm run dev           # Solo app (requiere tunnel abierto en otra terminal)
npm run tunnel        # Solo tunnel

# LOCAL - Testing
curl http://localhost:3000/health

# VPS - SSH
ssh root@161.97.139.241

# VPS - Deploy
bash /var/www/album-mundial-staging/deploy.sh  # A staging
bash /var/www/album-mundial/deploy.sh          # A producción (CON BACKUP)
bash /var/www/album-mundial/rollback.sh        # Revertir

# VPS - Ver logs
pm2 logs album-mundial
pm2 logs album-mundial-staging

# VPS - Ver procesos
pm2 status

# VERIFICAR SALUD
curl http://gestionatusfiguritas.duckdns.org/staging/health     # Staging
curl https://gestionatusfiguritas.duckdns.org/health            # Producción
```

---

**¡Listo para tu "bombazo" 🚀!**
