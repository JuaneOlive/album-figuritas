# Album Mundial — Guía de Deploy y Comandos

Stack: Node.js + Express + Sequelize + PostgreSQL · VPS Ubuntu 24.04 · PM2 · Nginx

---

## Índice

1. [Desarrollo local](#desarrollo-local)
2. [VPS — Sistema base](#vps--sistema-base)
3. [VPS — PostgreSQL](#vps--postgresql)
4. [VPS — Deploy de la app](#vps--deploy-de-la-app)
5. [VPS — Nginx](#vps--nginx)
6. [VPS — Firewall UFW](#vps--firewall-ufw)
7. [Backups](#backups)
8. [Verificación final](#verificación-final)

---

## Desarrollo local

### Requisitos

- Node.js LTS
- PostgreSQL corriendo localmente (o usar la instancia del VPS vía SSH tunnel)

### Instalación

```bash
git clone <url-del-repo>
cd album-mundial
git checkout rama-claude
npm install
```

### Variables de entorno

Copiar el template y completar:

```bash
cp .env.example .env
```

Contenido mínimo para desarrollo:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=album_mundial
DB_USER=album_user
DB_PASSWORD=tu_password_local
CORS_ORIGIN=http://localhost:3000
```

> `.env` está en `.gitignore`. Nunca commitear este archivo.

### Inicializar la base de datos

```bash
npm run init-db
```

> ⚠️ **Solo una vez.** Crea las tablas y carga los 993 datos del catálogo.
> Los seeders son idempotentes: si la DB ya tiene datos, no duplican nada.
> **Este comando NO debe estar encadenado a `npm start` ni correr en cada deploy.**

### Levantar el servidor

```bash
npm run dev     # modo desarrollo con --watch (reinicia al guardar)
npm start       # modo producción sin watch
```

### Verificaciones locales

```bash
# Health check
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}

# API figuritas (requiere DB con datos)
curl http://localhost:3000/api/figuritas | head -c 200

# Sin URLs hardcodeadas en el frontend
grep -r "localhost\|127\.0\.0\.1\|:3000" public/
# → sin output (correcto)
```

---

## VPS — Sistema base

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Zona horaria
timedatectl set-timezone America/Argentina/Buenos_Aires

# Herramientas esenciales
apt install -y git curl wget unzip build-essential

# Node.js LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs
node --version && npm --version

# PM2
npm install -g pm2
```

---

## VPS — PostgreSQL

### Instalación

```bash
apt install postgresql postgresql-contrib -y
systemctl enable --now postgresql
systemctl status postgresql
```

### Crear usuario y base de datos

```bash
sudo -u postgres psql <<SQL
CREATE USER album_user WITH PASSWORD '<password_seguro>';
CREATE DATABASE album_mundial OWNER album_user;
GRANT ALL PRIVILEGES ON DATABASE album_mundial TO album_user;
\q
SQL
```

### Verificar configuración de red

```bash
# Debe mostrar 'localhost' — no '*' ni '0.0.0.0'
sudo -u postgres psql -c "SHOW listen_addresses;"

# Debe mostrar 127.0.0.1:5432 — NO 0.0.0.0:5432
ss -tlnp | grep 5432
```

> 🚫 **El puerto 5432 NO debe abrirse en UFW ni en el firewall de Contabo.**
> Solo la app Node.js (en el mismo servidor) necesita conectarse a Postgres.
>
> Si `listen_addresses` muestra `*`, editar:
> `/etc/postgresql/*/main/postgresql.conf` → `listen_addresses = 'localhost'`
> Luego: `systemctl restart postgresql`

---

## VPS — Deploy de la app

### 1. Clonar el repositorio

```bash
mkdir -p /var/www/album-mundial
cd /var/www/album-mundial
git clone <url-del-repo> .
git checkout rama-claude   # o main si ya fue mergeado
```

### 2. Dependencias de producción

```bash
npm install --omit=dev
```

### 3. Crear `.env` de producción

```bash
nano /var/www/album-mundial/.env
```

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=album_mundial
DB_USER=album_user
DB_PASSWORD=<password_configurado_en_postgres>
CORS_ORIGIN=http://161.97.139.241
```

> Solo existe en el VPS. Nunca en el repositorio.

### 4. Inicializar la base de datos

```bash
cd /var/www/album-mundial
npm run init-db
```

> ⚠️ **Solo en el primer deploy.** No repetir en actualizaciones.

### 5. Iniciar con PM2

```bash
pm2 start app.js --name album-mundial
pm2 save
pm2 startup    # ejecutar el comando que muestre como root
```

### 6. Actualizar la app (deploys futuros)

```bash
cd /var/www/album-mundial
git pull
npm install --omit=dev   # solo si cambiaron dependencias
pm2 restart album-mundial
```

---

## VPS — Nginx

### Configuración como reverse proxy

Crear `/etc/nginx/sites-available/album-mundial`:

```nginx
server {
    listen 80;
    server_name 161.97.139.241;   # reemplazar por dominio cuando esté disponible

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/album-mundial /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Agregar HTTPS (cuando haya dominio)

```bash
certbot --nginx -d tu-dominio.com
certbot renew --dry-run   # verificar renovación automática
```

Actualizar en `.env`: `CORS_ORIGIN=https://tu-dominio.com`
Luego: `pm2 restart album-mundial`

---

## VPS — Firewall UFW

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Puertos **3000 y 5432 deben estar cerrados** al exterior. No agregar reglas para ellos.

---

## Backups

### Backup manual

```bash
mkdir -p /backups

# Backup con fecha
pg_dump -U album_user -h localhost album_mundial > /backups/album_$(date +%Y%m%d).sql

# Verificar
ls -lh /backups/
head -5 /backups/album_$(date +%Y%m%d).sql
# → debe empezar con: -- PostgreSQL database dump
```

### Cron diario a las 02:00

```bash
crontab -e
# Agregar:
0 2 * * * pg_dump -U album_user -h localhost album_mundial > /backups/album_$(date +\%Y\%m\%d).sql
```

> Los `%` deben escaparse como `\%` en crontab.

> ⚠️ Los backups contienen datos reales. `/backups/` está fuera de `/var/www/` — no accesible por web.
> No commitear archivos `.sql`. Para offsite: usar `scp` o `rsync`.

---

## Riesgos de producción

| # | Riesgo | Gravedad |
|---|---|---|
| R-01 | `sync({ force: true })` destruye datos | CRÍTICA |
| R-02 | `npm start` encadenado a `init-db` | CRÍTICA |
| R-03 | `localhost` hardcodeado en el frontend | CRÍTICA |
| R-04 | `.env` commiteado al repositorio | ALTA |
| R-05 | PostgreSQL expuesto a internet | ALTA |
| R-06 | CORS abierto sin restricción | MEDIA |
| R-07 | API sin autenticación | MEDIA |
| R-08 | Sin migraciones formales | MEDIA |

---

### R-01 — `sync({ force: true })` destruye datos

**Gravedad:** CRÍTICA

**Qué puede pasar:** `sync({ force: true })` ejecuta `DROP TABLE IF EXISTS` en cada tabla antes de recrearla. Si está en el script de arranque, cada restart de PM2 o deploy borra todos los datos del usuario. Pérdida total e irrecuperable si no hay backup.

**Mitigación actual:** `sync()` sin opciones — solo crea tablas si no existen, nunca las toca si ya existen. Seeders con guards idempotentes (`if count > 0 → skip`). `npm start` no llama a `init-db`.

**Mejora pendiente:** implementar Sequelize CLI migrations para cambios de esquema controlados y auditables.

---

### R-02 — `npm start` encadenado a `init-db`

**Gravedad:** CRÍTICA

**Qué puede pasar:** si el script `start` corre `init-db` antes de levantar la app, cualquier restart automático de PM2 ante un crash dispararía el seeder. Aunque los seeders son idempotentes, el riesgo combinado con un `force: true` residual sería pérdida total de datos en producción sin intervención humana.

**Mitigación actual:** `"start": "node app.js"` — sin encadenamiento. `init-db` solo existe como `npm run init-db`, a correr manualmente una vez en el deploy inicial.

**Mejora pendiente:** documentar explícitamente en el README que `npm run init-db` es operación de una sola vez.

---

### R-03 — `localhost` hardcodeado en el frontend

**Gravedad:** CRÍTICA

**Qué puede pasar:** `fetch("http://localhost:3000/api/figuritas")` en el browser del usuario final intenta conectarse al `localhost` de *su propia máquina*, no al servidor. Todos los GET y PATCH fallan silenciosamente. La app es 100% no funcional en producción sin que el servidor tire ningún error.

**Mitigación actual:** URL relativa `/api/figuritas` — el browser resuelve contra el origen de la página. Funciona detrás de cualquier dominio, IP o proxy sin cambios de código.

**Mejora pendiente:** ninguna. Solución definitiva.

---

### R-04 — `.env` commiteado al repositorio

**Gravedad:** ALTA

**Qué puede pasar:** credenciales de base de datos, claves de API y passwords quedan expuestos en el historial de git de forma permanente. Incluso si se borra el archivo después, `git log` los preserva. Si el repo es público o compartido con la cátedra, compromete el servidor.

**Mitigación actual:** `.env` y `.env*.local` en `.gitignore`. `.env.example` commiteado como template sin valores reales.

**Mejora pendiente:** agregar un pre-commit hook que detecte patrones de credenciales antes de commitear (herramienta: `git-secrets` o `detect-secrets`).

---

### R-05 — PostgreSQL expuesto a internet (puerto 5432)

**Gravedad:** ALTA

**Qué puede pasar:** PostgreSQL expuesto en `0.0.0.0:5432` permite ataques de fuerza bruta sobre el usuario de DB, exploits de versión, y acceso directo a los datos sin pasar por la capa de aplicación. Es uno de los vectores de ataque más comunes en VPS mal configurados.

**Mitigación actual:** `listen_addresses = 'localhost'` en PostgreSQL (predeterminado en Ubuntu). Puerto 5432 no abierto en UFW. Verificación explícita con `ss -tlnp | grep 5432` en el checklist de deploy.

**Mejora pendiente:** considerar autenticación por certificado (`pg_hba.conf`) en lugar de solo password si el proyecto escala a datos sensibles.

---

### R-06 — CORS abierto sin restricción

**Gravedad:** MEDIA

**Qué puede pasar:** `cors()` sin opciones responde `Access-Control-Allow-Origin: *` a cualquier origen. Cualquier sitio web externo puede consumir la API y modificar figuritas de cualquier usuario (sin autenticación, el impacto es mayor).

**Mitigación actual:** `cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' })`. En producción, `CORS_ORIGIN=http://161.97.139.241` restringe al origen real. Wildcard eliminado.

**Mejora pendiente:** cuando se implemente autenticación, revisar política CORS por ruta — las rutas públicas pueden ser más permisivas que las protegidas.

---

### R-07 — API sin autenticación

**Gravedad:** MEDIA (aceptable en el estado actual, crítica con usuarios múltiples)

**Qué puede pasar:** cualquier persona que conozca la IP puede hacer `PATCH /api/figuritas/ARG1?operation=add` y modificar las figuritas. Sin sesiones, no hay forma de distinguir quién hizo qué. Con múltiples usuarios, un usuario puede modificar el álbum de otro.

**Mitigación actual:** app de uso personal/académico. El acceso está limitado por el hecho de que la IP no es pública en ningún directorio. CORS restringe el consumo desde otros sitios.

**Mejora pendiente:** implementar autenticación (JWT o sessions) antes de abrir la app a múltiples usuarios. La tabla de usuarios y la relación `figuritas_usuario` están planificadas para el próximo merge.

---

### R-08 — Sin migraciones formales de esquema

**Gravedad:** MEDIA

**Qué puede pasar:** cambios en los modelos Sequelize (agregar columna, cambiar tipo, renombrar) no tienen historia de versiones. Para aplicar un cambio en producción las opciones son: `sync({ alter: true })` (impredecible en Postgres, puede borrar datos), `sync({ force: true })` (destruye todo), o SQL manual (sin auditabilidad).

**Mitigación actual:** el esquema actual es estable (2 tablas, sin cambios previstos a corto plazo). `sync()` sin opciones crea tablas si no existen y no toca las existentes.

**Mejora pendiente:** implementar Sequelize CLI migrations (`npx sequelize-cli migration:generate`) antes de cualquier cambio de esquema en producción. Obligatorio antes del merge de cuentas de usuario.

---

## Verificación final

```bash
# App corriendo
pm2 status

# Health check
curl http://localhost:3000/health

# API responde
curl http://localhost:3000/api/figuritas | python3 -m json.tool | head -20

# Nginx activo
systemctl status nginx

# PostgreSQL activo
systemctl status postgresql

# Puertos expuestos (solo 22, 80 deben aparecer como LISTEN en 0.0.0.0)
ss -tlnp | grep -E ':(22|80|443|3000|5432)'

# Firewall
ufw status
```
