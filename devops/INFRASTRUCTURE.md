# Guía de Infraestructura VPS - Album Mundial

## 🔗 Nota: Desarrollo Remoto via SSH Tunnel

Los desarrolladores NO tienen PostgreSQL local. En su lugar, usan SSH tunnel para acceder a la BD del VPS desde sus máquinas. Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para setup.

```bash
# Los devs hacen esto:
./ssh-tunnel.sh                    # Terminal 1: Abre tunnel
npm run dev                        # Terminal 2: App con nodemon
```

---

## Arquitectura General

```
VPS Ubuntu 24.04 (IP: 161.97.139.241)
    ├─ Nginx :80/:443 (reverse proxy + SSL)
    ├─ PostgreSQL :5432 (accesible vía SSH tunnel desde devs)
    ├─ Express :3000 (producción, main branch)
    └─ Express :3001 (staging, develop branch)
```

---

## 1. Estado Actual del VPS

### Sistema Base

```bash
cat /etc/os-release                    # Ubuntu 24.04 LTS
df -h                                  # 127GB libres
free -h                                # 2GB+ RAM
nproc                                  # CPU cores
```

### Servicios Instalados

```bash
node --version                         # v20.x
npm --version
pm2 --version
psql --version                         # PostgreSQL
nginx -v
ufw status
```

### Procesos PM2

```bash
pm2 status
# Esperado:
# │ 0 │ album-mundial        │ fork │ online │
# │ 1 │ album-mundial-staging│ fork │ online │
```

---

## 2. Directorios Clave

```
/var/www/
├── album-mundial/              ← PRODUCCIÓN (main)
│   ├── app.js
│   ├── .env                    (credenciales prod)
│   ├── deploy.sh
│   └── rollback.sh
│
└── album-mundial-staging/      ← STAGING (develop)
    ├── app.js
    ├── .env                    (credenciales staging)
    └── deploy.sh

/etc/nginx/sites-available/     ← Config HTTP/HTTPS
├── album-mundial              (main + staging)

~/.pm2/logs/                    ← Logs de aplicaciones
├── album-mundial-error.log
└── album-mundial-out.log
```

---

## 3. Bases de Datos

### Listar BDs

```bash
psql -U postgres -c "\l"
```

### Producción

```bash
psql -U album_user -d album_mundial -c "SELECT COUNT(*) FROM \"Figuritas\";"
# Esperado: 980
```

### Staging

```bash
psql -U album_user -d album_mundial_staging -c "SELECT COUNT(*) FROM \"Figuritas\";"
# Esperado: 980
```

### Usuarios PostgreSQL

```bash
psql -U postgres -c "\du"
# Esperado:
# - postgres (superuser)
# - album_user (aplicación)
```

---

## 4. Nginx - Reverse Proxy

### Verificar configuración

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Archivos de configuración

```
/etc/nginx/sites-available/album-mundial    ← Configuración
/etc/nginx/sites-enabled/album-mundial      ← Symlink habilitado
```

### Logs Nginx

```bash
tail -f /var/log/nginx/access.log           # Peticiones
tail -f /var/log/nginx/error.log            # Errores
```

---

## 5. PM2 - Process Manager

### Ver procesos

```bash
pm2 status
pm2 monit                                    # Monitor en vivo
```

### Logs

```bash
pm2 logs album-mundial
pm2 logs album-mundial-staging
pm2 logs album-mundial --lines 100
```

### Comandos útiles

```bash
pm2 stop album-mundial
pm2 restart album-mundial
pm2 delete album-mundial
pm2 save                                     # Guardar estado
pm2 startup                                  # Auto-start en boot
```

---

## 6. UFW - Firewall

### Estado

```bash
sudo ufw status
sudo ufw show added                          # Reglas agregadas
```

### Puertos que deben estar abiertos

```bash
sudo ufw allow 22/tcp                        # SSH
sudo ufw allow 80/tcp                        # HTTP
sudo ufw allow 443/tcp                       # HTTPS
```

### Puertos que DEBEN estar CERRADOS

- Puerto 5432 (PostgreSQL) - Solo localhost
- Puerto 3000 (Node.js prod) - Solo localhost
- Puerto 3001 (Node.js staging) - Solo localhost

### Verificar que están cerrados

```bash
ss -tlnp | grep 3000
# Esperado: vacío (o solo localhost)

ss -tlnp | grep 5432
# Esperado: vacío (o solo localhost)
```

---

## 7. Certificados SSL/TLS

### Ver certificados

```bash
sudo certbot certificates
```

### Renovación automática

```bash
sudo systemctl list-timers snap.certbot.renew.timer
sudo certbot renew --dry-run                # Test
```

### Si necesitas renovar manualmente

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 8. Logs y Monitoreo

### PM2 Logs

```bash
pm2 logs album-mundial
pm2 logs album-mundial --lines 50
pm2 logs album-mundial | grep ERROR
```

### Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### PostgreSQL Logs

```bash
sudo tail -f /var/log/postgresql/postgresql.log
```

---

## 9. Backups

### Crear backup manual

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U album_user album_mundial | gzip > \
  /home/app-deploy/backups/album_mundial_$TIMESTAMP.sql.gz
```

### Listar backups

```bash
ls -lh /home/app-deploy/backups/
```

### Restaurar desde backup

```bash
gunzip < /home/app-deploy/backups/album_mundial_20260515_100000.sql.gz | \
  psql -U album_user album_mundial
```

---

## 10. Mantenimiento Regular

### Semanal

```bash
pm2 logs album-mundial | grep ERROR
df -h
free -h
pm2 status
```

### Mensual

```bash
sudo apt update && sudo apt upgrade -y
sudo journalctl --vacuum=30d
sudo certbot renew
```

### Trimestral

```bash
pm2 monit
sudo ufw show added
sudo certbot certificates
ls -lh /home/app-deploy/backups/
```

---

## 11. Troubleshooting

### Nginx no carga

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### PM2 no inicia proceso

```bash
pm2 status
pm2 logs
pm2 kill
pm2 start app.js --name album-mundial
```

### PostgreSQL no responde

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo tail -f /var/log/postgresql/postgresql.log
```

### Certificado SSL expirado

```bash
sudo certbot certificates
sudo certbot renew
sudo systemctl reload nginx
```

---

Para más info, ver [README.md](./README.md)
