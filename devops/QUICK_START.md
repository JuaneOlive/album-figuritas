# 🚀 QUICK START - Cómo Desarrollar con DevOps Desplegado

**Guía rápida y práctica para empezar a desarrollar en 5 minutos**

---

## ¿Cuál es la estrategia?

No hay base de datos local. **Todo se ejecuta así:**

```
TU MÁQUINA                          VPS (SERVIDOR)
┌──────────────────────┐            ┌──────────────────────┐
│ VS Code              │            │ PostgreSQL           │
│ npm run dev          │ SSH TUNNEL │ Staging (3001)       │
│ localhost:3000       │ ←────────→ │ Producción (3000)    │
└──────────────────────┘ puerto 5432└──────────────────────┘
```

**Ventaja:** La BD es única. Tú, staging y producción usan la misma.

---

## PASO 1: Setup (Se hace UNA SOLA VEZ)

### 1.1 Ir al directorio del proyecto

```bash
cd d:\Users\usuario\Desktop\Juane\FACULTAD\DDS\album-mundial
```

### 1.2 Instalar dependencias

```bash
npm install
```

### 1.3 Verificar que existe ssh-tunnel.sh

```bash
ls ssh-tunnel.sh
# Si existe: OK
# Si no existe: Créalo (ver sección abajo)
```

**Si NO existe, crea el archivo:**

```bash
cat > ssh-tunnel.sh << 'EOF'
#!/bin/bash
echo "🔗 Abriendo SSH tunnel a VPS..."
echo "   IP: 161.97.139.241"
echo "   Puerto local: 5432 → VPS: 5432"
echo "   Presiona Ctrl+C para cerrar"
echo ""
ssh -L 5432:localhost:5432 root@161.97.139.241
echo ""
echo "❌ Tunnel cerrado"
EOF

chmod +x ssh-tunnel.sh
```

### 1.4 Verificar que existe .env.example

```bash
cat .env.example
# Debe mostrar variables de entorno (sin contraseñas)
```

**Listo para desarrollar.**

---

## PASO 2: Flujo de Desarrollo (TODOS LOS DÍAS)

### Abre 3 terminales:

#### Terminal 1: SSH Tunnel (NUNCA CIERRE)

```bash
./ssh-tunnel.sh
```

Verá:
```
🔗 Abriendo SSH tunnel a VPS...
   IP: 161.97.139.241
   Puerto local: 5432 → VPS: 5432
   Presiona Ctrl+C para cerrar

root@161.97.139.241's password: [escribe contraseña]
```

**Dejar abierta siempre. Si se cierra, reinicia con ./ssh-tunnel.sh**

---

#### Terminal 2: Ejecutar app (nodemon)

```bash
npm run dev
```

Verá:
```
[nodemon] 3.0.1
[nodemon] watching path(s): *.*
listening on port 3000...
```

**Automáticamente reinicia cuando guardas archivos.**

---

#### Terminal 3: Git, tests, curl (Tu trabajo)

```bash
# Editar código en VS Code
# Hacer commits
# Probar endpoints

curl http://localhost:3000/health
```

---

## PASO 3: Ciclo Normal de Desarrollo

### 3.1 Crear rama de feature

```bash
git checkout -b feature/mi-cambio
```

### 3.2 Editar código

Abre VS Code, edita lo que necesites. Nodemon reinicia automáticamente.

### 3.3 Probar cambios

```bash
# Terminal 3:
curl http://localhost:3000/health
curl http://localhost:3000/api/figuritas?limit=1
```

### 3.4 Commit y push

```bash
git add .
git commit -m "feat: descripción clara"
git push origin feature/mi-cambio
```

### 3.5 Merge a develop (para staging)

```bash
git checkout develop
git pull origin develop
git merge feature/mi-cambio
git push origin develop
```

**Resultado:** Tu código se despliega automáticamente a staging (VPS puerto 3001)

### 3.6 Probar en staging

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/health
curl http://gestionatusfiguritas.duckdns.org/staging/api/figuritas?limit=1
```

### 3.7 Merge a main (para producción)

Cuando estés SEGURO de que funciona en staging:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

**Resultado:** Alguien (DevOps) ejecuta el deploy a producción

---

## PASO 4: Comandos Básicos

### Trabajo Diario

```bash
# Abrir tunnel (Terminal 1)
./ssh-tunnel.sh

# Correr app (Terminal 2)
npm run dev

# Testear (Terminal 3)
curl http://localhost:3000/health

# Ver logs
pm2 logs album-mundial

# Git
git checkout -b feature/mi-cambio
git add .
git commit -m "feat: descripción"
git push origin feature/mi-cambio
```

### Deploy a Staging

```bash
# Desde tu máquina, Terminal 3:
git checkout develop
git pull origin develop
git merge feature/mi-cambio
git push origin develop

# Resultado: auto-deploy a staging (si CI/CD está configurado)
# O manualmente en el VPS:
bash /var/www/album-mundial-staging/deploy.sh
```

### Deploy a Producción

```bash
# Desde tu máquina, Terminal 3:
git checkout main
git pull origin main
git merge develop
git push origin main

# Desde el VPS (manual):
bash /var/www/album-mundial/deploy.sh
```

### Ver logs de staging

```bash
ssh root@161.97.139.241
pm2 logs album-mundial-staging --lines 50
```

### Ver logs de producción

```bash
ssh root@161.97.139.241
pm2 logs album-mundial --lines 50
```

### Rollback (revertir producción)

```bash
ssh root@161.97.139.241
bash /var/www/album-mundial/rollback.sh
```

---

## PASO 5: Problemas Comunes

### ❌ "connect ECONNREFUSED 127.0.0.1:5432"

**Causa:** Tunnel no está abierto

**Solución:**
```bash
# Terminal 1: Verifica tunnel
netstat -an | grep 5432

# Si no ves conexión, reabre:
./ssh-tunnel.sh
```

---

### ❌ "Address already in use :::3000"

**Causa:** Algo ya usa puerto 3000

**Solución:**
```bash
# Terminal 3: Encuentra qué lo usa
netstat -ano | findstr 3000

# Ciérralo
taskkill /PID <número> /F

# O reinicia Terminal 2
Ctrl+C
npm run dev
```

---

### ❌ "too many authentication failures"

**Causa:** SSH intentó demasiadas veces

**Solución:**
```bash
# Espera 15-30 minutos, o:
ssh-keygen -R 161.97.139.241
./ssh-tunnel.sh
```

---

### ❌ nodemon no reinicia al guardar

**Causa:** nodemon no está corriendo

**Solución:**
```bash
# Terminal 2: Verifica
npm list nodemon

# Si falta:
npm install --save-dev nodemon

# Reinicia
Ctrl+C
npm run dev
```

---

## PASO 6: Checklist Antes de Merge

### Antes de push a tu rama

- [ ] Tunnel abierto y funciona (`netstat -an | grep 5432`)
- [ ] `npm run dev` sin errores en Terminal 2
- [ ] `curl http://localhost:3000/health` responde
- [ ] No hay errores en la consola
- [ ] No subiste `.env` real

### Antes de merge a develop (staging)

- [ ] Probé en localhost completamente
- [ ] Commit message es claro (`feat: ...` o `fix: ...`)
- [ ] Sin console.logs de debugging
- [ ] Merge local sin conflictos

### Antes de merge a main (producción)

- [ ] Probé en staging completamente
- [ ] Sin errores en logs staging: `pm2 logs album-mundial-staging`
- [ ] Revisé que funciona en HTTPS: `https://gestionatusfiguritas.duckdns.org/staging/health`
- [ ] No hay breaking changes
- [ ] AlguienDevOps confirmó

---

## PASO 7: Entender el Flujo Completo

```
Tu máquina (localhost:3000)
    ↓ git push feature/... → GitHub
Repositorio GitHub
    ↓ git merge a develop → GitHub
Rama develop
    ↓ auto-deploy (si CI/CD) OR manual
Staging VPS (3001)
    ↓ git merge a main (manual)
Rama main
    ↓ manual deploy
Producción VPS (3000 - HTTPS)
    ↓ usuarios reales acceden aquí
```

---

## PASO 8: Referencia de URLs

### Local (mientras desarrollas)

```
http://localhost:3000          ← Tu app
http://localhost:3000/health   ← Health check
http://localhost:3000/api/figuritas?limit=1
```

### Staging (público, pruebas)

```
http://gestionatusfiguritas.duckdns.org/staging/health
http://gestionatusfiguritas.duckdns.org/staging/api/figuritas?limit=1
```

### Producción (público, usuarios reales)

```
https://gestionatusfiguritas.duckdns.org/health
https://gestionatusfiguritas.duckdns.org/api/figuritas?limit=1
```

---

## PASO 9: Credenciales

### VPS SSH

```
IP: 161.97.139.241
Usuario: root
Contraseña: Pedir a DevOps
```

### PostgreSQL

```
Usuario: album_user
Contraseña: En .env del VPS (no compartas)
Staging BD: album_mundial_staging
Producción BD: album_mundial
```

---

## PASO 10: Cuando Terminas el Día

```bash
# Terminal 1: Cierra tunnel
Ctrl+C

# Terminal 2: Cierra app
Ctrl+C

# Terminal 3: Guarda tu trabajo
git add .
git commit -m "wip: cambios del día"
git push origin feature/mi-cambio
```

---

## Documentación Completa

Si necesitas más detalles:

- **SSH Tunnel detallado** → [SSH_TUNNEL.md](./SSH_TUNNEL.md)
- **Desarrollo avanzado** → [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Cómo deployar** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Estado del VPS** → [INFRASTRUCTURE.md](./INFRASTRUCTURE.md)
- **Todas las tareas** → [ROADMAP_EJECUTABLE.md](./ROADMAP_EJECUTABLE.md)

---

## Resumen: 5 Cosas Importantes

1. **Abre 3 terminales:** tunnel → app → trabajo
2. **Terminal 1 nunca cierra:** si cierra, reopen con `./ssh-tunnel.sh`
3. **npm run dev** reinicia automático → edita y guarda
4. **Prueba en localhost:3000** antes de push
5. **Merge a develop → staging**, **merge a main → producción**

---

**¿Listo? Abre 3 terminales y empieza.**

Terminal 1: `./ssh-tunnel.sh`  
Terminal 2: `npm run dev`  
Terminal 3: Edita, git, curl
