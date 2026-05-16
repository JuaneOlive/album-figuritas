# Guía de Desarrollo - Album Mundial

## ⚠️ Estrategia: Desarrollo REMOTO vía SSH Tunnel

**No hay ambiente de desarrollo local.** La app se ejecuta en tu máquina, pero la BD está en el VPS del servidor.

```
┌──────────────────────────────────────────────────┐
│  TU MÁQUINA (Windows / Mac / Linux)              │
│  - Editar código (VS Code)                       │
│  - npm run dev (nodemon)                         │
│  - Port: localhost:3000                          │
└──────────────────────────────────────────────────┘
         ↓ SSH Tunnel: 127.0.0.1:5432
┌──────────────────────────────────────────────────┐
│  VPS (161.97.139.241)                            │
│  - PostgreSQL:5432 (BD compartida)               │
│  - STAGING: puerto 3001 (develop branch)         │
│  - PRODUCCIÓN: puerto 3000 (main branch)         │
└──────────────────────────────────────────────────┘
```

---

## 1. Setup Inicial (UNA SOLA VEZ)

### 1.1 Requisitos

- Node.js LTS (v20.x o superior) ✅
- npm ✅
- git ✅
- Git Bash o PowerShell ✅
- VS Code (recomendado) ✅
- SSH instalado (Git Bash lo trae) ✅

### 1.2 Clonar y preparar repo

```bash
cd d:\Users\usuario\Desktop\Juane\FACULTAD\DDS\album-mundial

# Instalar dependencias
npm install

# Verificar nodemon
npm list nodemon
```

### 1.3 Crear script SSH Tunnel

Ya debe existir `ssh-tunnel.sh` en la raíz. Si no:

```bash
cat > ssh-tunnel.sh << 'EOF'
#!/bin/bash
echo "🔗 Abriendo SSH tunnel a VPS..."
echo "   Comando: ssh -L 5432:localhost:5432 root@161.97.139.241"
echo "   Presiona Ctrl+C para cerrar"
echo ""
ssh -L 5432:localhost:5432 root@161.97.139.241
echo ""
echo "❌ Tunnel cerrado"
EOF

chmod +x ssh-tunnel.sh
```

---

## 2. Flujo de Desarrollo Diario

### Paso 1: Abre SSH Tunnel (Terminal 1)

```bash
./ssh-tunnel.sh

# Verás:
# 🔗 Abriendo SSH tunnel a VPS...
# (espera a que se conecte - pide contraseña del VPS)
```

**Credenciales:**
- Usuario: `root`
- IP: `161.97.139.241`
- Contraseña: Pedir a DevOps

**Verificar conexión:**

```bash
# En otra terminal:
netstat -an | grep 5432
# Debe mostrar: ESTABLISHED o LISTEN en 5432
```

### Paso 2: Inicia app con nodemon (Terminal 2)

```bash
npm run dev

# Verás:
# [nodemon] 3.0.1
# [nodemon] watching path(s): *.*
# listening on port 3000...
```

### Paso 3: Edita código (Terminal 3 / VS Code)

```bash
# Editar cualquier archivo
# nodemon reinicia automáticamente en Terminal 2
```

### Paso 4: Prueba cambios

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/figuritas?limit=1
```

### Paso 5: Commit y push

```bash
git add .
git commit -m "feature: descripción clara"
git push origin feature/mi-cambio
```

---

## 3. Flujo de Ramas

```
Tu rama local
  ↓ (git push)
GitHub rama develop
  ↓ (auto deploy a staging)
Staging VPS:3001
  ↓ (manual merge a main)
GitHub rama main
  ↓ (manual deploy)
Producción VPS:3000
```

### 3.1 Crear rama de feature

```bash
git checkout -b feature/mi-cambio
```

### 3.2 Trabajar y commitear

```bash
# Editar archivos
npm run dev  # Probar cambios

git add .
git commit -m "feature: descripción clara"
git push origin feature/mi-cambio
```

### 3.3 Merge a develop

```bash
git checkout develop
git pull origin develop
git merge feature/mi-cambio
git push origin develop
```

**Resultado:** Cambios se auto-deployan a staging (si GitHub Actions está configurado)

### 3.4 Merge a main (cuando está probado)

```bash
# Después de que revisaste en staging:

git checkout main
git pull origin main
git merge develop
git push origin main
```

**Resultado:** Alguien debe ejecutar el deploy manualmente en VPS

---

## 4. Scripts npm

```bash
npm run dev           # Hot reload (usa SSH tunnel a BD)
npm run staging       # Simula environment staging
npm start             # Simula environment producción
npm run init-db       # Inicializar BD (SOLO PRIMERA VEZ)
npm run reset-db      # Limpiar BD (cuidado!)
npm run lint          # Verificar código
```

**Nota:** `npm run staging` y `npm start` son **solo para simular** localmente. No se usan en el flujo normal.

---

## 5. Debugging

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Causa:** SSH tunnel no está abierto

**Solución:**

```bash
# Terminal 1: Verifica que tunnel está activo
netstat -an | grep 5432

# Si no ve conexión:
./ssh-tunnel.sh
# O manualmente:
ssh -L 5432:localhost:5432 root@161.97.139.241
```

### Error: "EADDRINUSE: address already in use :::3000"

**Causa:** Ya hay algo usando puerto 3000

**Solución:**

```bash
# Windows PowerShell:
netstat -ano | findstr 3000
taskkill /PID <PID> /F

# Git Bash:
lsof -i :3000
kill -9 <PID>
```

### nodemon no reinicia al guardar

**Causa:** Archivo no se guardó o nodemon no está corriendo

**Solución:**

```bash
# Verificar:
npm list nodemon

# Si falta:
npm install --save-dev nodemon

# Reiniciar Terminal 2:
Ctrl+C
npm run dev
```

### Error: "too many authentication failures"

**Causa:** Demasiados intentos SSH fallidos

**Solución:**

```bash
# Esperar unos minutos o:
ssh-keygen -R 161.97.139.241
./ssh-tunnel.sh
```

---

## 6. Testing

### Local (contra BD del VPS vía tunnel)

```bash
# Terminal: curl
curl http://localhost:3000/health
curl http://localhost:3000/api/figuritas?limit=1
curl http://localhost:3000/api/figuritas?codigo=ARG
```

### Staging (público en VPS:3001)

```bash
curl http://gestionatusfiguritas.duckdns.org/staging/health
curl http://gestionatusfiguritas.duckdns.org/staging/api/figuritas?limit=1
```

### Producción (público en VPS:3000)

```bash
curl https://gestionatusfiguritas.duckdns.org/health
curl https://gestionatusfiguritas.duckdns.org/api/figuritas?limit=1
```

---

## 7. Checklist Antes de Hacer Merge

### Antes de push a tu rama

- [ ] SSH tunnel abierto y funciona
- [ ] `npm run dev` sin errores
- [ ] Health check OK: `curl http://localhost:3000/health`
- [ ] No hay errores en Terminal 2 (app)
- [ ] No subí `.env` real

### Antes de merge a develop

- [ ] Code review hecho
- [ ] Commit message claro
- [ ] Sin console.logs de debugging

### Antes de merge a main (producción)

- [ ] Probé en staging completamente
- [ ] Testing completo sin errores
- [ ] Revisé logs: `pm2 logs album-mundial-staging`
- [ ] No hay breaking changes

---

## 8. Convenciones de Commit

```bash
# Feature (nueva funcionalidad)
git commit -m "feat: agregar endpoint /api/usuarios"

# Fix (arregliar bug)
git commit -m "fix: corregir validación en figuritas"

# Refactor (mejora de código)
git commit -m "refactor: simplificar obtención de BD"

# Docs (documentación)
git commit -m "docs: actualizar README"

# Tests
git commit -m "test: agregar tests para figuritas"
```

---

## 9. Terminales Recomendadas

**Para desarrollo óptimo, abre 3 terminales:**

| Terminal | Comando | Propósito |
|----------|---------|-----------|
| Terminal 1 | `./ssh-tunnel.sh` | Mantener tunnel abierto |
| Terminal 2 | `npm run dev` | App con nodemon |
| Terminal 3 | `curl ...` / `git ...` | Tests y git |

---

## 10. Preguntas Frecuentes

**P: ¿Puedo trabajar sin tunnel?**
R: No. La BD está en el VPS. Necesitas tunnel siempre.

**P: ¿Puedo tener dos ramas abiertas?**
R: Sí, pero necesitas cambiar de rama antes con `git checkout`.

**P: ¿Qué pasa si cierra el tunnel?**
R: npm run dev se desconecta. Reabre tunnel y reinicia app.

**P: ¿Puedo usar PostgreSQL local?**
R: Sí, pero entonces no compartes BD con staging/prod. No recomendado.

---

Para más info, ver [README.md](./README.md)
