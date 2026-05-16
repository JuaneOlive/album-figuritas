# SSH Tunnel Guide - Album Mundial

**Estrategia de desarrollo:** Sin ambiente local, todo contra VPS vía SSH tunnel.

---

## ¿Qué es SSH Tunnel?

SSH tunnel crea una conexión segura que redirecciona un puerto local a un puerto remoto en el VPS.

```
Tu máquina (Windows/Mac/Linux)           VPS (161.97.139.241)
┌──────────────────────────┐             ┌──────────────────────┐
│ localhost:5432  ←─────────────SSH──────→  localhost:5432       │
│ (tu app)              tunnel            (PostgreSQL)           │
└──────────────────────────┘             └──────────────────────┘
```

**Ventajas:**
- Desarrollo remoto seguro (HTTPS)
- Base de datos compartida (staging y prod también usan misma BD)
- Sin necesidad de PostgreSQL local
- Cambios en tiempo real

---

## Requisitos

- SSH instalado (Git Bash lo trae)
- Credenciales VPS
  - Usuario: `root`
  - IP: `161.97.139.241`
  - Contraseña: Pedir a DevOps

---

## Setup (Una sola vez)

### 1. Crear script helper

En la raíz de `album-mundial/`, crea `ssh-tunnel.sh`:

```bash
#!/bin/bash
echo "🔗 Abriendo SSH tunnel a VPS..."
echo "   IP: 161.97.139.241"
echo "   Puerto local: 5432 → VPS: 5432"
echo "   Presiona Ctrl+C para cerrar"
echo ""
ssh -L 5432:localhost:5432 root@161.97.139.241
echo ""
echo "❌ Tunnel cerrado"
```

Hacer ejecutable:

```bash
chmod +x ssh-tunnel.sh
```

### 2. Verificar SSH

```bash
ssh -V
# Resultado: OpenSSH_9.x.x o similar
```

Si no tienes SSH, reinstala Git Bash.

---

## Uso Diario

### Paso 1: Abrir Tunnel (Terminal 1)

```bash
./ssh-tunnel.sh
```

Verás:
```
🔗 Abriendo SSH tunnel a VPS...
   IP: 161.97.139.241
   Puerto local: 5432 → VPS: 5432
   Presiona Ctrl+C para cerrar
   
root@161.97.139.241's password: [escribe contraseña]
```

**Dejar abierta esta terminal durante todo tu desarrollo.**

### Paso 2: Verificar Tunnel (Terminal 2)

```bash
# Windows PowerShell:
netstat -ano | findstr 5432

# Git Bash:
netstat -an | grep 5432
```

Resultado esperado:
```
ESTABLISHED TCP  127.0.0.1:5432  127.0.0.1:xxxxx
```

### Paso 3: Iniciar App (Terminal 2)

```bash
npm run dev
```

Resultado:
```
[nodemon] 3.0.1
[nodemon] watching path(s): *.*
listening on port 3000...
```

### Paso 4: Usar Normalmente (Terminal 3)

```bash
# Editar código en VS Code
# nodemon reinicia automáticamente
# Hacer commits normales
```

---

## Debugging

### Error: "Permission denied (publickey)"

**Causa:** SSH key no coincide

**Solución:**

```bash
# Limpiar conocidos hosts
ssh-keygen -R 161.97.139.241

# Reintentar
./ssh-tunnel.sh
```

### Error: "Connection timeout"

**Causa:** VPS no responde o firewall

**Solución:**

```bash
# Verificar que IP es correcta
ping 161.97.139.241

# Si no responde, esperar unos minutos
# Si sigue sin responder, contactar DevOps
```

### Error: "Address already in use"

**Causa:** Otro proceso ya usa puerto 5432

**Solución:**

```bash
# Windows: Ver qué usa 5432
netstat -ano | findstr 5432

# Cerrar el proceso
taskkill /PID <PID> /F

# O cambiar puerto:
ssh -L 5433:localhost:5432 root@161.97.139.241
# Y cambiar DB_PORT=5433 en .env
```

### Error: "too many authentication failures"

**Causa:** Demasiados intentos SSH fallidos

**Solución:**

```bash
# Esperar 15-30 minutos
# O:
ssh-keygen -R 161.97.139.241
./ssh-tunnel.sh
```

---

## Troubleshooting App

### "connect ECONNREFUSED 127.0.0.1:5432"

App no puede conectar a BD.

**Checklist:**

1. ¿Tunnel está abierto?
   ```bash
   netstat -an | grep 5432
   # Debe mostrar ESTABLISHED
   ```

2. ¿Variables de entorno correctas?
   ```bash
   echo $DB_HOST $DB_PORT
   # Debe ser: localhost 5432
   ```

3. ¿App está esperando correctamente?
   ```bash
   # En app.js, verificar:
   const sequelize = new Sequelize(
     process.env.DB_NAME,
     process.env.DB_USER,
     process.env.DB_PASSWORD,
     {
       host: process.env.DB_HOST,
       port: process.env.DB_PORT,
       dialect: 'postgres'
     }
   );
   ```

### "App starts but can't reach DB"

**Debug:**

```bash
# Terminal: Probar conexión directo
psql -h 127.0.0.1 -U postgres -d album_mundial
# Si no funciona, tunnel no está bien

# Terminal: Testear con curl
curl http://localhost:3000/health
# Si "Cannot GET", app está levantada
# Si "ECONNREFUSED", BD no responde
```

---

## Mejores Prácticas

### 1. Mantén Terminal 1 siempre abierta

Si cierras el tunnel, `npm run dev` se desconecta.

```bash
# Si cierra accidentalmente:
# Terminal 1: Reabre tunnel
./ssh-tunnel.sh

# Terminal 2: Reinicia app
Ctrl+C
npm run dev
```

### 2. No cierres terminal sin Ctrl+C

No cierres Terminal 1 directamente o la conexión queda "zombie".

```bash
# Correcto:
Ctrl+C en Terminal 1
# Verás: ❌ Tunnel cerrado

# Incorrecto:
❌ Cerrar ventana directamente
```

### 3. Una terminal por tarea

```
Terminal 1: ./ssh-tunnel.sh        (NUNCA CIERRES)
Terminal 2: npm run dev            (Reinicia si es necesario)
Terminal 3: curl, git, tests, etc. (Usa para todo lo demás)
```

### 4. Verificar tunnel antes de empezar

```bash
# Cuando abres Terminal 2, antes de npm run dev:
netstat -an | grep 5432
# Si no ves resultado, aún tunnel no está listo
# Espera 5-10 segundos y reintenta
```

---

## Seguridad

### Nunca hagas esto:

```bash
❌ Usar contraseña en scripts
❌ Guardar contraseña en .env
❌ Compartir IP/credenciales
❌ Usar tunnel con firewall deshabilitado
```

### Siempre:

```bash
✅ Usa SSH con contraseña/key
✅ Cierra tunnel cuando terminas (Ctrl+C)
✅ Usa Ctrl+C para cerrar, no cerrar ventana
✅ Verificar que tunnel está ESTABLISHED
```

---

## Alternativas (No recomendadas)

### Opción: PostgreSQL local

```bash
# Instalar PostgreSQL en tu máquina
# Crear BD local album_mundial
# npm run dev conecta a localhost:5432 local
```

**Desventaja:** 
- Base de datos duplicada (confusión)
- Datos no sincronizados con staging/prod
- Más complejidad

---

## Referencia Rápida

```bash
# Abrir tunnel
./ssh-tunnel.sh

# Verificar tunnel
netstat -an | grep 5432

# Iniciar app
npm run dev

# Testear
curl http://localhost:3000/health

# Detener tunnel
Ctrl+C en Terminal 1

# Troubleshoot
ssh -v -L 5432:localhost:5432 root@161.97.139.241
# (-v = verbose, muestra qué pasa)
```

---

## Preguntas Frecuentes

**P: ¿Puedo dejar tunnel abierto todo el tiempo?**
A: Sí, es seguro. Simplemente ciérralo con Ctrl+C cuando termines.

**P: ¿Qué pasa si pierdo conexión a internet?**
A: Tunnel se cierra automáticamente. Reabre con `./ssh-tunnel.sh`.

**P: ¿Por qué no usar PostgreSQL local?**
A: Porque staging y producción usan la misma BD remota. Tunnel sincroniza todo.

**P: ¿Puedo tener 2 tunnels abiertos?**
A: No, solo uno. O usan puertos diferentes.

**P: ¿Es lento trabajar vía tunnel?**
A: No. Latencia es < 100ms. Normalmente imperceptible.

---

Para más info, ver [DEVELOPMENT.md](./DEVELOPMENT.md)
