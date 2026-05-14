# Checklist de producción — Album Mundial

Leyenda: `[x]` = hecho · `[ ]` = pendiente · `[~]` = aceptado temporalmente

---

## 1. Código

- [x] `sync({ force: true })` eliminado — `scripts/initDb.js` usa `sync()` sin opciones
- [x] `npm start` seguro — no encadena `init-db`, solo `node app.js`
- [x] `npm run init-db` separado — script independiente, manual, uso único
- [x] URLs relativas en el frontend — `public/app.js` usa `/api/figuritas` sin hostname
- [x] `dotenv` instalado y cargado — `import 'dotenv/config'` en `app.js` y `data/db.js`
- [x] Conexión a PostgreSQL — `data/db.js` usa `dialect: 'postgres'` con env vars
- [x] `sqlite3` removido — no está en `package.json`
- [x] `pg` y `pg-hstore` instalados — en `dependencies`
- [x] CORS configurable — `cors({ origin: process.env.CORS_ORIGIN })` en `app.js`
- [x] `GET /health` disponible — responde `{"status":"ok","timestamp":"..."}` sin DB
- [x] `main` en `package.json` apunta a `app.js` — corregido de `index.js`
- [x] Exits explícitos en `initDb.js` — `process.exit(0)` / `process.exit(1)`
- [~] Sin autenticación en endpoints PATCH — aceptado para uso personal/académico actual
- [~] Sin migraciones Sequelize CLI — schema estable, pendiente antes del merge de usuarios

---

## 2. Entorno local

- [x] `.env` en `.gitignore` — reglas para `.env`, `.env.local`, `.env*.local`
- [x] `.env.example` commiteado — template con todas las claves, sin valores reales
- [x] `.env` no existe en el repositorio — verificado con `git ls-files`
- [ ] `.env` local creado con valores reales para desarrollo
- [ ] PostgreSQL corriendo localmente o accesible para desarrollo

---

## 3. VPS — Sistema

- [ ] `apt update && apt upgrade -y`
- [ ] Zona horaria configurada (`America/Argentina/Buenos_Aires`)
- [ ] Herramientas instaladas: `git`, `curl`, `wget`, `unzip`, `build-essential`
- [ ] Node.js LTS instalado (`node --version`)
- [ ] `npm` funcional (`npm --version`)
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] `pm2 startup` ejecutado y servicio systemd registrado

---

## 4. Base de datos

- [ ] PostgreSQL instalado (`apt install postgresql postgresql-contrib`)
- [ ] Servicio habilitado y activo (`systemctl enable --now postgresql`)
- [ ] Usuario `album_user` creado con password seguro
- [ ] Base `album_mundial` creada con `OWNER album_user`
- [ ] Permisos otorgados al usuario
- [ ] `listen_addresses = 'localhost'` verificado en `postgresql.conf`
- [ ] Puerto 5432 escucha solo en `127.0.0.1` (verificado con `ss -tlnp`)
- [ ] Puerto 5432 **NO** abierto en UFW

---

## 5. App

- [ ] Repositorio clonado en `/var/www/album-mundial`
- [ ] Branch correcta activa (`rama-claude` o `main` post-merge)
- [ ] `npm install --omit=dev` ejecutado
- [ ] `.env` de producción creado en el VPS (nunca en el repo)
- [ ] `npm run init-db` ejecutado **una sola vez**
- [ ] 993 figuritas en la DB (`SELECT COUNT(*) FROM figuritas;`)
- [ ] `pm2 start app.js --name album-mundial`
- [ ] `pm2 status` muestra `album-mundial | online`
- [ ] `pm2 save` ejecutado
- [ ] `curl localhost:3000/health` devuelve HTTP 200
- [ ] `curl localhost:3000/api/figuritas` devuelve JSON con figuritas

---

## 6. Nginx

- [ ] Nginx instalado y activo
- [ ] Server block creado en `/etc/nginx/sites-available/album-mundial`
- [ ] Symlink en `/etc/nginx/sites-enabled/`
- [ ] `nginx -t` sin errores
- [ ] `systemctl reload nginx`
- [ ] `curl http://161.97.139.241/health` devuelve HTTP 200 desde internet
- [ ] `curl http://161.97.139.241/` devuelve HTML de la app

---

## 7. SSL/HTTPS

- [ ] Dominio apuntando a la IP del VPS (pendiente — sin dominio confirmado)
- [ ] Certbot instalado (`apt install certbot python3-certbot-nginx`)
- [ ] Certificado obtenido (`certbot --nginx -d <dominio>`)
- [ ] Renovación automática verificada (`certbot renew --dry-run`)
- [ ] `CORS_ORIGIN` actualizado a `https://<dominio>` en el `.env`
- [ ] `pm2 restart album-mundial` tras actualizar `.env`

---

## 8. Validación final

- [ ] `pm2 status` → `album-mundial | online`
- [ ] `curl http://161.97.139.241/health` → `{"status":"ok",...}`
- [ ] `curl http://161.97.139.241/api/figuritas` → array de 993 figuritas
- [ ] Frontend carga correctamente en el browser
- [ ] Agregar figurita (botón `+`) funciona y persiste
- [ ] Quitar figurita (botón `–`) funciona y persiste
- [ ] **Reiniciar PM2** (`pm2 restart album-mundial`) y verificar que los datos persisten
- [ ] **Reboot del VPS** (con confirmación explícita) y verificar que PM2 arranca automáticamente
- [ ] Puerto 3000 no accesible desde internet (`curl http://161.97.139.241:3000` debe fallar o timeout)
- [ ] Puerto 5432 no accesible desde internet (`nc -zv 161.97.139.241 5432` debe fallar)
- [ ] Backup manual ejecutado y verificado (`ls -lh /backups/`)

---

## Estado actual del proyecto

```
Sección          Progreso
────────────────────────────────
Código           ████████████████ 100%  (14/14 ítems ✓ o ~)
Entorno local    ████░░░░░░░░░░░░  38%  (3/8 ítems ✓)
VPS Sistema      ░░░░░░░░░░░░░░░░   0%  (0/7 pendientes)
Base de datos    ░░░░░░░░░░░░░░░░   0%  (0/8 pendientes)
App              ░░░░░░░░░░░░░░░░   0%  (0/11 pendientes)
Nginx            ░░░░░░░░░░░░░░░░   0%  (0/7 pendientes)
SSL              ░░░░░░░░░░░░░░░░   0%  (pendiente dominio)
Validación       ░░░░░░░░░░░░░░░░   0%  (0/11 pendientes)
```
