# Guía de Despliegue en Azure - DivancoWeb

## 📋 Prerrequisitos

### Información del Cliente
1. **Acceso a Azure Portal**
   - URL: https://portal.azure.com
   - Usuario y contraseña con permisos de Contributor/Owner
   - Subscription ID

2. **Herramientas Necesarias**
   - Azure CLI instalado localmente
   - Node.js 18+
   - Git

## 🎯 Arquitectura Azure

### Servicios a Utilizar
1. **Frontend**: Azure Static Web Apps (React)
2. **Backend**: Azure App Service (Node.js/Express)
3. **Base de Datos**: Azure Database for PostgreSQL - Flexible Server
4. **Storage**: Cloudinary (mantener) o Azure Blob Storage
5. **Networking**: Azure Application Gateway (opcional para SSL/CDN)

## 📦 Costos Estimados (USD/mes)

- **Static Web Apps (Standard)**: ~$10/mes
- **App Service (B1 - Basic)**: ~$13/mes
- **PostgreSQL Flexible Server (Burstable B1ms)**: ~$12/mes
- **Blob Storage (si se usa)**: ~$5-20/mes
- **Total estimado**: ~$40-60/mes

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

## 🖥️ Paso 3: Desplegar Backend (App Service)

### 3.1 Crear App Service Plan

```bash
APP_SERVICE_PLAN="divanco-backend-plan"
APP_SERVICE_NAME="divanco-backend-api"

# Crear App Service Plan (Linux)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1
```

### 3.2 Crear Web App

```bash
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE_NAME \
  --runtime "NODE:18-lts"
```

### 3.3 Configurar variables de entorno

```bash
# Connection string de PostgreSQL
DB_CONNECTION_STRING="postgresql://$DB_ADMIN_USER:$DB_ADMIN_PASSWORD@$DB_SERVER_NAME.postgres.database.azure.com/$DB_NAME?sslmode=require"

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings \
    NODE_ENV="production" \
    DB_DEPLOY="$DB_CONNECTION_STRING" \
    JWT_SECRET="tu-jwt-secret-muy-seguro-cambiar" \
    CLOUDINARY_CLOUD_NAME="tu-cloud-name" \
    CLOUDINARY_API_KEY="tu-api-key" \
    CLOUDINARY_API_SECRET="tu-api-secret" \
    EMAIL_USER="tu-email@gmail.com" \
    EMAIL_PASS="tu-app-password"
```

### 3.4 Configurar despliegue desde GitHub

```bash
# Configurar GitHub Actions deployment
az webapp deployment github-actions add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --repo "divanco/DivancoWeb" \
  --branch "main" \
  --token "GITHUB_PAT_TOKEN" \
  --runtime-stack node \
  --runtime-version 18
```

**O desplegar manualmente:**

```bash
cd backend
zip -r backend.zip .
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --src backend.zip
```

### 3.5 Habilitar CORS

```bash
FRONTEND_URL="https://divanco-frontend.azurestaticapps.net"

az webapp cors add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --allowed-origins $FRONTEND_URL "http://localhost:5173"
```

## 🎨 Paso 4: Desplegar Frontend (Static Web Apps)

### 4.1 Crear Static Web App desde Azure Portal

1. Ve a Azure Portal → Create Resource → Static Web Apps
2. Configuración:
   - **Subscription**: Tu suscripción
   - **Resource Group**: divanco-rg
   - **Name**: divanco-frontend
   - **Region**: East US
   - **Deployment details**: GitHub
   - **Organization**: divanco
   - **Repository**: DivancoWeb
   - **Branch**: main
   - **Build presets**: React
   - **App location**: `/frontend`
   - **Output location**: `dist`

### 4.2 Configurar variables de entorno en Static Web App

```bash
STATIC_APP_NAME="divanco-frontend"

az staticwebapp appsettings set \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names \
    VITE_API_URL="https://$APP_SERVICE_NAME.azurewebsites.net" \
    VITE_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
```

### 4.3 Archivo de configuración (ya existe en tu proyecto)

Asegúrate de tener `frontend/staticwebapp.config.json`:

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
