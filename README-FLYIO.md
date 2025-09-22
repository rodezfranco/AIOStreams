# AIOStreams - Fly.io Deployment

Este documento describe cómo desplegar AIOStreams en Fly.io usando la configuración proporcionada.

## 🚀 Despliegue Rápido

### 1. Instalar Fly.io CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Autenticarse

```bash
fly auth login
```

### 3. Validar Configuración

Antes de desplegar, valida que la configuración sea correcta:

```bash
node scripts/validate-flyio-config.js
```

### 4. Configurar Secrets

```bash
# Clave secreta para encriptación (64 caracteres hexadecimales)
fly secrets set SECRET_KEY=1213d70f99bb78cc8fb33d4e4d9e9c53e1792a31ec07ecdb6b486465f0f879d7

# API Keys de servicios (opcionales)
fly secrets set TMDB_ACCESS_TOKEN=tu-tmdb-token
fly secrets set TRAKT_CLIENT_ID=tu-trakt-client-id
fly secrets set DEFAULT_TORBOX_API_KEY=tu-torbox-api-key
fly secrets set DEFAULT_REALDEBRID_API_KEY=tu-realdebrid-api-key
fly secrets set DEFAULT_ALLDEBRID_API_KEY=tu-alldebrid-api-key
```

**NOTA**: La SECRET_KEY ya ha sido generada automáticamente y validada. Puedes usar la que se muestra arriba o generar una nueva con:

```bash
# Generar nueva clave (opcional)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Desplegar

```bash
fly launch
```

O si ya tienes una app configurada:

```bash
fly deploy
```

## ⚙️ Configuración

### Variables de Entorno Importantes

El archivo `fly.toml` incluye las siguientes configuraciones:

- **PORT**: 8080 (puerto interno de Fly.io)
- **BASE_URL**: URL pública de tu aplicación
- **DATABASE_URI**: Base de datos SQLite en volumen persistente
- **SECRET_KEY**: Clave para encriptación (configurar como secret)

### Recursos

- **CPU**: 1 vCPU compartido
- **Memoria**: 512 MB
- **Almacenamiento**: Volumen persistente para la base de datos

### Health Check

- **Endpoint**: `/api/v1/status`
- **Intervalo**: 30 segundos
- **Timeout**: 5 segundos

## 🔧 Personalización

### Cambiar Región

Edita el `fly.toml`:

```toml
primary_region = 'iad'  # Cambia a tu región preferida
```

Regiones disponibles: `iad` (US East), `ord` (US Central), `lax` (US West), `fra` (Europe), `sin` (Asia), etc.

### Escalar Recursos

```toml
[[vm]]
  cpu_kind = 'shared'
  cpus = 2        # Aumentar CPUs
  memory_mb = 1024 # Aumentar memoria
```

### Configurar Proxy

Si necesitas un proxy, descomenta y configura en `fly.toml`:

```toml
[env]
  ADDON_PROXY = 'https://tu-proxy-url.com'
```

## 📊 Monitoreo

### Ver Logs

```bash
fly logs
```

### Ver Estado

```bash
fly status
```

### Health Checks

```bash
fly checks list
```

## 🔐 Seguridad

### Configurar Dominio Personalizado

```bash
fly certs add tu-dominio.com
```

### Configurar Autenticación

Si usas autenticación, configura las contraseñas:

```bash
fly secrets set ADDON_PASSWORD=tu-password-seguro
```

## 🐛 Solución de Problemas

### Error: "verifique que el nombre del elemento no sea una cadena"

Este error ocurre cuando hay problemas de sintaxis TOML. Soluciones:

1. **Validar configuración**:
   ```bash
   node scripts/validate-flyio-config.js
   ```

2. **Corregir comillas**: Asegúrate de usar comillas dobles para cadenas:
   ```toml
   cpu_kind = "shared"  # ✅ Correcto
   cpu_kind = 'shared'  # ❌ Incorrecto
   ```

3. **Verificar valores booleanos**: No usar comillas para `true`/`false`:
   ```toml
   force_https = true   # ✅ Correcto
   force_https = "true" # ❌ Incorrecto
   ```

### Error de Puerto

Asegúrate de que el puerto interno en `fly.toml` coincida con el puerto de tu aplicación:

```toml
[http_service]
  internal_port = 8080  # Debe coincidir con PORT
```

### Error de Base de Datos

El volumen persistente está montado en `/app/data`. Si tienes problemas:

```bash
fly ssh console
ls -la /app/data/
```

### Error de Memoria

Si la aplicación usa mucha memoria, aumenta en `fly.toml`:

```toml
[[vm]]
  memory_mb = 1024  # Aumentar según necesites
```

### Error de Variables de Entorno

Si faltan variables de entorno críticas:

```bash
# Ver variables actuales
fly secrets list

# Agregar variables faltantes
fly secrets set VARIABLE_NAME=value
```

### Error de Región

Si la región por defecto no está disponible:

```toml
primary_region = 'iad'  # Cambiar a: ord, fra, sin, etc.
```

## 📝 Notas Importantes

1. **Variables Sensibles**: Siempre configura API keys y contraseñas como secrets de Fly.io
2. **Base de Datos**: SQLite se almacena en un volumen persistente
3. **Logs**: Usa `fly logs` para debugging
4. **Actualizaciones**: Usa `fly deploy` para desplegar cambios

## 🔗 Enlaces Útiles

- [Documentación de Fly.io](https://fly.io/docs/)
- [Configuración de fly.toml](https://fly.io/docs/reference/configuration/)
- [Variables de Entorno](https://fly.io/docs/app-guides/environment-variables/)
- [Secrets](https://fly.io/docs/app-guides/secrets/)