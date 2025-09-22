#!/bin/bash

# AIOStreams - Fly.io Deployment Script
# Este script automatiza el despliegue en Fly.io

set -e

echo "🚀 AIOStreams - Despliegue en Fly.io"
echo "===================================="

# Verificar si flyctl está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ flyctl no está instalado. Instálalo desde: https://fly.io/docs/flyctl/install/"
    exit 1
fi

# Verificar autenticación
echo "🔐 Verificando autenticación..."
if ! fly auth whoami &> /dev/null; then
    echo "❌ No estás autenticado. Ejecuta: fly auth login"
    exit 1
fi

echo "✅ Autenticación verificada"

# Validar configuración
echo "🧪 Validando configuración..."
if ! node scripts/validate-flyio-config.js; then
    echo "❌ La configuración tiene errores. Corrige los problemas antes de continuar."
    exit 1
fi

echo "✅ Configuración validada"

# Verificar si la app ya existe
if fly apps list | grep -q "aiostreams"; then
    echo "📱 App 'aiostreams' ya existe"
    APP_EXISTS=true
else
    echo "📱 App 'aiostreams' no existe, se creará automáticamente"
    APP_EXISTS=false
fi

# Configurar secrets
echo "🔑 Configurando secrets..."

# Generar secret key si no existe
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(openssl rand -hex 32)
    echo "🔐 Secret key generada automáticamente"
fi

fly secrets set SECRET_KEY="$SECRET_KEY"

# Configurar API keys si se proporcionan
if [ -n "$TMDB_ACCESS_TOKEN" ]; then
    fly secrets set TMDB_ACCESS_TOKEN="$TMDB_ACCESS_TOKEN"
    echo "🎬 TMDB Access Token configurado"
fi

if [ -n "$TRAKT_CLIENT_ID" ]; then
    fly secrets set TRAKT_CLIENT_ID="$TRAKT_CLIENT_ID"
    echo "📺 Trakt Client ID configurado"
fi

if [ -n "$DEFAULT_TORBOX_API_KEY" ]; then
    fly secrets set DEFAULT_TORBOX_API_KEY="$DEFAULT_TORBOX_API_KEY"
    echo "📦 TorBox API Key configurado"
fi

if [ -n "$DEFAULT_REALDEBRID_API_KEY" ]; then
    fly secrets set DEFAULT_REALDEBRID_API_KEY="$DEFAULT_REALDEBRID_API_KEY"
    echo "🔗 RealDebrid API Key configurado"
fi

if [ -n "$DEFAULT_ALLDEBRID_API_KEY" ]; then
    fly secrets set DEFAULT_ALLDEBRID_API_KEY="$DEFAULT_ALLDEBRID_API_KEY"
    echo "🔗 AllDebrid API Key configurado"
fi

echo "✅ Secrets configurados"

# Desplegar
echo "🚀 Desplegando aplicación..."
if [ "$APP_EXISTS" = true ]; then
    fly deploy
else
    fly launch --no-deploy
    fly deploy
fi

echo ""
echo "🎉 ¡Despliegue completado!"
echo ""
echo "📊 Comandos útiles:"
echo "   fly logs          - Ver logs en tiempo real"
echo "   fly status        - Ver estado de la aplicación"
echo "   fly ssh console   - Acceder a la consola"
echo "   fly checks list   - Ver health checks"
echo ""
echo "🌐 Tu aplicación estará disponible en: https://aiostreams.fly.dev"
echo ""
echo "📝 Para configurar un dominio personalizado:"
echo "   fly certs add tu-dominio.com"
echo ""
echo "📖 Consulta README-FLYIO.md para más información"