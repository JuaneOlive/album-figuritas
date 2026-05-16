#!/bin/bash
# ssh-tunnel.sh - Conectar a VPS con tunnel a BD

echo "🔗 Abriendo SSH tunnel a VPS..."
echo "   Comando: ssh -L 5432:localhost:5432 root@161.97.139.241"
echo "   Presiona Ctrl+C para cerrar tunnel"
echo ""

ssh -L 5432:localhost:5432 root@161.97.139.241

echo ""
echo "❌ Tunnel cerrado"
