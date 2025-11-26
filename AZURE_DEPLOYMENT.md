# 🚀 Guía de Despliegue en Azure - DivancoWeb (Actualizada 2025)

Esta guía documenta el proceso REAL de deployment basado en la arquitectura actual de producción.

## 📋 Prerrequisitos

### Información del Cliente
1. **Acceso a Azure Portal**
   - URL: https://portal.azure.com
   - Usuario y contraseña con permisos de Contributor/Owner
   - Subscription ID (se obtiene GRATIS al crear cuenta Azure - ver instrucciones abajo)

### 🔑 Sobre los Permisos Contributor/Owner

**Si TÚ creaste la cuenta de Azure:**
- ✅ Ya eres **Owner automáticamente**
- No necesitas hacer nada más
- Tienes todos los permisos necesarios

**Si tu CLIENTE creó la cuenta de Azure:**
El cliente debe darte permisos siguiendo estos pasos:

1. **Ir a Azure Portal** → https://portal.azure.com
2. **Ir a "Subscriptions"** (buscar en el menú superior)
3. **Seleccionar su suscripción** (hacer clic en el nombre)
4. **Ir a "Access control (IAM)"** (menú lateral izquierdo)
5. **Hacer clic en "+ Add"** → **"Add role assignment"**
6. **Seleccionar rol "Contributor"** → Hacer clic en "Next"
7. **Hacer clic en "+ Select members"**
8. **Buscar tu email** y seleccionarte
9. **Hacer clic en "Select"** y luego **"Review + assign"**

Ver guía detallada para el cliente en: `CLIENTE_INFO_AZURE.md`

### ⚠️ IMPORTANTE: Sobre el Subscription ID
El **Subscription ID NO es algo que se compra**. Es un identificador único que Azure asigna automáticamente y GRATIS cuando creas una cuenta de Azure.

**¿Cómo obtener tu Subscription ID?**

**Opción 1: Desde Azure Portal (Más Fácil)**
1. Ir a https://portal.azure.com
2. Iniciar sesión con tu cuenta Microsoft/Azure
3. En el menú superior, buscar "Subscriptions" o "Suscripciones"
4. Verás una lista con tu(s) suscripción(es)
5. El **Subscription ID** es el código tipo: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
6. Copiarlo (hay un botón de copiar al lado)

**Opción 2: Desde Azure CLI**
```bash
az login  # Primero iniciar sesión
az account list --output table  # Ver todas tus suscripciones
az account show --query id --output tsv  # Ver solo el ID de la suscripción activa
```

**Opción 3: Si no tienes cuenta Azure aún**
1. Ir a https://azure.microsoft.com/free/
2. Crear cuenta GRATIS (incluye $200 USD en créditos)
3. Al completar el registro, automáticamente se crea una suscripción
4. Seguir los pasos de "Opción 1" para ver el Subscription ID

**Tipos de Suscripción (todos tienen Subscription ID):**
- ✅ Cuenta gratuita (Free Trial) - $200 USD crédito
- ✅ Pay-As-You-Go (pago por uso)
- ✅ Suscripción empresarial
- ✅ Suscripción de estudiante

**Nota**: El cliente NO necesita comprar ningún "plan especial" para tener un Subscription ID. Solo necesita tener una cuenta de Azure activa (puede ser la gratuita).

2. **Herramientas Necesarias**
   - Azure CLI instalado localmente
   - Node.js 18+
   - Git

## 🎯 Arquitectura Azure (Actual en Producción)

### Servicios Utilizados
1. **Frontend**: Azure Static Web Apps (React + Vite)
2. **Backend**: Azure Container Apps (Node.js/Express en Docker)
3. **Base de Datos**: Azure Database for PostgreSQL - Flexible Server
4. **Container Registry**: Azure Container Registry (ACR)
5. **Storage**: Cloudinary (para imágenes)
6. **CI/CD**: GitHub Actions

### Arquitectura de Red
- **Frontend URL**: `https://polite-desert-0d77a5b1e.3.azurestaticapps.net`
- **Backend URL**: `https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io`
- **Database**: `divanco-db-server.postgres.database.azure.com`

## 📦 Costos Estimados (USD/mes)

- **Static Web Apps (Free tier)**: $0/mes (incluye 100GB bandwidth)
- **Container Apps (Consumption)**: ~$15-25/mes
- **Container Registry (Basic)**: ~$5/mes
- **PostgreSQL Flexible Server (Burstable B1ms)**: ~$12/mes
- **Total estimado**: ~$32-42/mes

## 🔧 Paso 1: Preparación

### 1.1 Instalar Azure CLI

```bash
# Windows (con winget)
winget install -e --id Microsoft.AzureCLI

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 1.2 Login a Azure

```bash
az login
```

### 1.3 Verificar suscripción

```bash
az account list --output table
az account set --subscription "SUBSCRIPTION_ID"
```

## 🗄️ Paso 2: Crear Base de Datos PostgreSQL

### 2.1 Crear servidor PostgreSQL

```bash
# Variables
RESOURCE_GROUP="divanco-rg"
LOCATION="eastus"
DB_SERVER_NAME="divanco-db-server"
DB_ADMIN_USER="divancoadmin"
DB_ADMIN_PASSWORD="TuPasswordSeguro123!"
DB_NAME="divanco_prod"

# Crear Resource Group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Crear PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_ADMIN_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0-255.255.255.255
```

### 2.2 Crear base de datos

```bash
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME
```

### 2.3 Obtener connection string

```bash
az postgres flexible-server show-connection-string \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME \
  --admin-user $DB_ADMIN_USER
```

## 🖥️ Paso 3: Desplegar Backend (Azure Container Apps)

### 3.1 Crear Azure Container Registry (ACR)

```bash
ACR_NAME="divancoregistry"

# Crear Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Obtener credenciales
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
```

### 3.2 Crear Container Apps Environment

```bash
CA_ENV_NAME="divanco-env"

# Crear ambiente para Container Apps
az containerapp env create \
  --name $CA_ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location westus
```

### 3.3 Build y Push de la imagen Docker

```bash
cd backend

# Login al ACR
az acr login --name $ACR_NAME

# Build la imagen localmente
docker build -t $ACR_NAME.azurecr.io/divanco-backend:latest .

# Push al ACR
docker push $ACR_NAME.azurecr.io/divanco-backend:latest
```

**O usar ACR Build (recomendado):**

```bash
az acr build \
  --registry $ACR_NAME \
  --image divanco-backend:latest \
  --file Dockerfile \
  ./backend
```

### 3.4 Crear Container App

```bash
CONTAINER_APP_NAME="divanco-backend"

az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CA_ENV_NAME \
  --image $ACR_NAME.azurecr.io/divanco-backend:latest \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3001 \
  --ingress external \
  --env-vars \
    NODE_ENV="production" \
    PORT="3001" \
    DATABASE_URL="postgresql://divancoadmin:Dv1nc0_2024\$Azur3@divanco-db-server.postgres.database.azure.com:5432/divancodb?sslmode=require" \
    JWT_SECRET="beb76599ef7b4c6556ef803b5ecc9c6114d5d74d2690365c9214768e4375d01a" \
    CLOUDINARY_CLOUD_NAME="dqkm2lqpb" \
    CLOUDINARY_API_KEY="898884648337931" \
    CLOUDINARY_API_SECRET="LL3-4uS5qX7_A84hzf_BwysACiE" \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 5
```

### 3.5 Configurar GitHub Actions para Backend

Crea `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Azure Container Apps

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and push to ACR
      run: |
        az acr build \
          --registry divancoregistry \
          --image divanco-backend:latest \
          --file Dockerfile \
          ./backend
    
    - name: Deploy to Container Apps
      run: |
        az containerapp update \
          --name divanco-backend \
          --resource-group divanco-rg \
          --image divancoregistry.azurecr.io/divanco-backend:latest
```

### 3.6 Actualizar Container App (deployments futuros)

```bash
# Después de hacer cambios en el código
az containerapp update \
  --name divanco-backend \
  --resource-group divanco-rg \
  --image $ACR_NAME.azurecr.io/divanco-backend:latest

# O crear nueva revisión
az containerapp revision copy \
  --name divanco-backend \
  --resource-group divanco-rg \
  --image $ACR_NAME.azurecr.io/divanco-backend:latest
```

## 🎨 Paso 4: Desplegar Frontend (Static Web Apps)

### 4.1 Deployment Manual con SWA CLI (RECOMENDADO)

El deployment manual te da control total sobre cuándo y qué se despliega. Es ideal para desarrollo y producción.

**Ventajas:**
- ✅ Control total del proceso
- ✅ No requiere configurar GitHub Actions
- ✅ Puedes probar antes de desplegar
- ✅ Más rápido para cambios frecuentes

**Pasos para deployment manual:**

**Pasos para deployment manual:**

```bash
# 1. Ir al directorio del frontend
cd frontend

# 2. Build del proyecto
npm run build

# 3. Deploy a Azure Static Web App
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "1ae33b1ed710711d29b06727645e2e970957f9307e10212e335dca74e4ccf4ad03-ccaae90c-1880-49b4-b8d7-59b208d1843b01e25080d77a5b1e" \
  --env production
```

**⚠️ IMPORTANTE:** Guarda el deployment token en un lugar seguro (como `AZURE_CREDENTIALS.md`). Lo necesitarás para cada deployment.

**Para futuros deployments:**
```bash
# Solo necesitas estos 2 comandos
cd frontend
npm run build
npx @azure/static-web-apps-cli deploy ./dist --deployment-token "TU_TOKEN" --env production
```

Si necesitas obtener el token nuevamente:

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca tu Static Web App (`divanco-frontend`)
3. En el menú izquierdo, ve a **Settings > Configuration**
4. Busca **Deployment token** y haz clic en **Copy**

### 4.3 Verificación del Deployment

Después del deployment, verifica que todo funcione:

```bash
# El comando mostrará la URL al terminar:
✔ Project deployed to https://polite-desert-0d77a5b1e.3.azurestaticapps.net 🚀
```

**Checklist de verificación:**
- [ ] Abre la URL en el navegador
- [ ] Presiona `Ctrl+Shift+R` para forzar recarga sin cache
- [ ] Verifica que el frontend cargue correctamente
- [ ] Prueba login y navegación
- [ ] Verifica que las imágenes del blog se vean correctamente

Si trabajas en equipo y prefieres deployments automáticos con cada push:

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Crea un nuevo secret:
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value:** Tu deployment token

El workflow `.github/workflows/deploy-frontend.yml` ya está configurado y se ejecutará automáticamente en cada push a `main`.

---

## 🔧 Paso 5: Troubleshooting Común

### Problema: Frontend muestra versión antigua después del deployment

**Síntoma:** Acabas de hacer deployment pero ves la versión anterior.

**Solución:**
```bash
# En el navegador, presiona:
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac
```
Esto fuerza una recarga sin cache del navegador.

### Problema: Error "deployment token is invalid"

**Solución:**
1. Ve al Azure Portal
2. Navega a tu Static Web App
3. Settings > Configuration > Deployment token
4. Copia el token nuevamente
5. Actualiza el token en tu comando o en `AZURE_CREDENTIALS.md`

### Problema: Build falla con error de memoria

**Síntoma:** `JavaScript heap out of memory`

**Solución:**
```bash
# Aumenta la memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Problema: Backend no responde después del deployment

**Checklist:**
1. Verifica que el Container App esté corriendo:
   ```bash
   az containerapp show --name divanco-backend --resource-group divanco-resources
   ```

2. Verifica los logs:
   ```bash
   az containerapp logs show --name divanco-backend --resource-group divanco-resources --follow
   ```

3. Verifica las variables de entorno en Azure Portal:
   - Container Apps > divanco-backend > Settings > Containers > Environment variables

### Problema: Error de CORS al conectar frontend con backend

**Solución:** Verifica que las URLs estén correctas en:
- `frontend/src/services/api.js`: baseURL debe apuntar a tu backend en Azure
- `backend/src/app.js`: CORS debe incluir tu frontend URL

---

## 📝 Comandos Quick Reference

### Frontend Deployment
```bash
cd frontend
npm run build
npx @azure/static-web-apps-cli deploy ./dist --deployment-token "TU_TOKEN" --env production
```

### Backend Deployment
```bash
cd backend
az acr build --registry divancoregistry --image divanco-backend:latest .
az containerapp update --name divanco-backend --resource-group divanco-resources --image divancoregistry.azurecr.io/divanco-backend:latest
```

### Ver logs del backend
```bash
az containerapp logs show --name divanco-backend --resource-group divanco-resources --follow
```

### Conectarse a PostgreSQL
```bash
psql -h divanco-db-server.postgres.database.azure.com -U divancoadmin -d divancodb
```

---

## ✅ Checklist Post-Deployment

Después de cada deployment, verifica:

**Frontend:**
- [ ] La aplicación carga sin errores
- [ ] El login funciona correctamente
- [ ] Las imágenes se muestran correctamente
- [ ] Los formularios guardan datos
- [ ] No hay errores en la consola del navegador

**Backend:**
- [ ] El Container App está en estado "Running"
- [ ] Los endpoints responden correctamente
- [ ] No hay errores en los logs
- [ ] La conexión a base de datos funciona

**Base de Datos:**
- [ ] Las migraciones se aplicaron correctamente
- [ ] Los datos se guardan y recuperan sin problemas
- [ ] Las consultas tienen buen rendimiento

---

## 📚 Recursos Adicionales

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Database for PostgreSQL Documentation](https://learn.microsoft.com/azure/postgresql/)
- [SWA CLI Documentation](https://azure.github.io/static-web-apps-cli/)

---

**Última actualización:** 25 de Noviembre, 2025
**Mantenedor:** Documentado durante deployment real del proyecto Divanco

**Para obtener el deployment token:**
```bash
az staticwebapp secrets list \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" -o tsv
```

O desde Azure Portal:
- Ir a Static Web App → Overview → "Manage deployment token"

### 4.4 Configurar variables de entorno

```bash
az staticwebapp appsettings set \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names \
    VITE_API_BASE_URL="https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io"
```

**⚠️ Importante sobre variables de entorno en Vite:**
Las variables que comiencen con `VITE_` estarán disponibles en el frontend. Deben configurarse ANTES del build.

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif,svg}", "/assets/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https://*.azurewebsites.net https://cloudinary.com"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "text/javascript",
    ".css": "text/css"
  }
}
```

## 🔒 Paso 5: Seguridad y SSL

### 5.1 Habilitar HTTPS only

```bash
# Backend
az webapp update \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --https-only true

# Las Static Web Apps ya tienen HTTPS por defecto
```

### 5.2 Configurar dominio personalizado (opcional)

```bash
# Para Static Web App
az staticwebapp hostname set \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --hostname "www.divanco.co"
```

## 📊 Paso 6: Monitoreo

### 6.1 Habilitar Application Insights

```bash
APPINSIGHTS_NAME="divanco-insights"

# Crear Application Insights
az monitor app-insights component create \
  --app $APPINSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web

# Vincular con App Service
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app $APPINSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## 🔄 Paso 7: CI/CD con GitHub Actions

Azure creará automáticamente un workflow de GitHub Actions. Verifica que exista en:
`.github/workflows/azure-static-web-apps-*.yml`

Para el backend, crea `.github/workflows/azure-backend-deploy.yml`:

```yaml
name: Deploy Backend to Azure App Service

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend
```

## 🧪 Paso 8: Verificación

### 8.1 Verificar Backend

```bash
curl https://$APP_SERVICE_NAME.azurewebsites.net
```

### 8.2 Verificar Frontend

```bash
# La URL será proporcionada después del despliegue
curl https://divanco-frontend.azurestaticapps.net
```

### 8.3 Verificar Base de Datos

```bash
# Conectar con psql
psql "host=$DB_SERVER_NAME.postgres.database.azure.com port=5432 dbname=$DB_NAME user=$DB_ADMIN_USER password=$DB_ADMIN_PASSWORD sslmode=require"
```

## 📝 Paso 9: Migración de Datos

Si tienes datos en Render.com que quieres migrar:

```bash
# 1. Exportar desde Render
pg_dump $RENDER_DATABASE_URL > divanco_backup.sql

# 2. Importar a Azure
psql "host=$DB_SERVER_NAME.postgres.database.azure.com port=5432 dbname=$DB_NAME user=$DB_ADMIN_USER password=$DB_ADMIN_PASSWORD sslmode=require" < divanco_backup.sql
```

## 🆘 Troubleshooting

### Ver logs del backend
```bash
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME
```

### Ver logs de despliegue
```bash
az webapp log deployment show \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME
```

### Reiniciar servicios
```bash
# Backend
az webapp restart \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME
```

## 💰 Optimización de Costos

1. **Usar tiers más bajos en desarrollo**: Cambiar a Free/Shared tier para testing
2. **Auto-shutdown**: Configurar apagado automático fuera de horario
3. **Usar Azure Reserved Instances**: Descuentos del 30-50% con compromiso anual
4. **Monitoring**: Usar Azure Cost Management para alertas

## 📚 Recursos Adicionales

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure PostgreSQL Docs](https://docs.microsoft.com/azure/postgresql/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)

## ✅ Checklist Final

- [ ] PostgreSQL creado y accesible
- [ ] Backend desplegado y corriendo
- [ ] Frontend desplegado y accesible
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] SSL/HTTPS habilitado
- [ ] Monitoring configurado
- [ ] CI/CD funcionando
- [ ] Dominio personalizado configurado (opcional)
- [ ] Backup de base de datos configurado

---

**Nota**: Esta es una guía completa. Los comandos pueden ejecutarse secuencialmente o usar el Azure Portal para una experiencia más visual.
