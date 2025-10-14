#!/bin/bash

# Script de Despliegue Automatizado en Azure - DivancoWeb
# Ejecutar después de configurar .env.azure

set -e  # Detener si hay errores

echo "🔵 Despliegue Automatizado en Azure - DivancoWeb"
echo "================================================"
echo ""

# Cargar variables de entorno
if [ -f .env.azure ]; then
  source .env.azure
  echo "✅ Variables cargadas desde .env.azure"
else
  echo "❌ Error: Archivo .env.azure no encontrado"
  echo "   Ejecuta primero: ./prepare-azure.sh"
  exit 1
fi

# Verificar Azure CLI
if ! command -v az &> /dev/null; then
  echo "❌ Azure CLI no está instalado"
  echo "   Instala desde: https://docs.microsoft.com/cli/azure/install-azure-cli"
  exit 1
fi

echo ""
echo "🔐 PASO 1: Login a Azure"
echo "------------------------"
az login

echo ""
echo "📦 PASO 2: Configurar Suscripción"
echo "---------------------------------"
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
echo "✅ Suscripción configurada: $AZURE_SUBSCRIPTION_ID"

echo ""
echo "📁 PASO 3: Crear Resource Group"
echo "-------------------------------"
if az group exists --name "$RESOURCE_GROUP" | grep -q true; then
  echo "⚠️  Resource Group ya existe: $RESOURCE_GROUP"
else
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
  echo "✅ Resource Group creado: $RESOURCE_GROUP"
fi

echo ""
echo "🗄️ PASO 4: Crear PostgreSQL"
echo "---------------------------"
echo "⏳ Esto puede tomar 5-10 minutos..."

if az postgres flexible-server show --name "$DB_SERVER_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  echo "⚠️  PostgreSQL ya existe: $DB_SERVER_NAME"
else
  az postgres flexible-server create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DB_SERVER_NAME" \
    --location "$LOCATION" \
    --admin-user "$DB_ADMIN_USER" \
    --admin-password "$DB_ADMIN_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 14 \
    --public-access 0.0.0.0-255.255.255.255 \
    --yes
  
  echo "✅ PostgreSQL creado: $DB_SERVER_NAME"
  
  # Crear base de datos
  az postgres flexible-server db create \
    --resource-group "$RESOURCE_GROUP" \
    --server-name "$DB_SERVER_NAME" \
    --database-name "$DB_NAME"
  
  echo "✅ Base de datos creada: $DB_NAME"
fi

# Obtener connection string
DB_CONNECTION_STRING="postgresql://$DB_ADMIN_USER:$DB_ADMIN_PASSWORD@$DB_SERVER_NAME.postgres.database.azure.com/$DB_NAME?sslmode=require"
echo "📝 Connection String: $DB_CONNECTION_STRING"

echo ""
echo "🖥️ PASO 5: Crear App Service (Backend)"
echo "---------------------------------------"

# Crear App Service Plan
APP_SERVICE_PLAN="${APP_SERVICE_NAME}-plan"

if az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  echo "⚠️  App Service Plan ya existe: $APP_SERVICE_PLAN"
else
  az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --is-linux \
    --sku B1
  
  echo "✅ App Service Plan creado: $APP_SERVICE_PLAN"
fi

# Crear Web App
if az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
  echo "⚠️  Web App ya existe: $APP_SERVICE_NAME"
else
  az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_SERVICE_NAME" \
    --runtime "NODE:18-lts"
  
  echo "✅ Web App creada: $APP_SERVICE_NAME"
fi

# Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --settings \
    NODE_ENV="production" \
    DB_DEPLOY="$DB_CONNECTION_STRING" \
    JWT_SECRET="$JWT_SECRET" \
    CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
    CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
    CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
    EMAIL_USER="$EMAIL_USER" \
    EMAIL_PASS="$EMAIL_PASS" \
    PORT="8080" \
    WEBSITE_NODE_DEFAULT_VERSION="18-lts"

echo "✅ Variables de entorno configuradas"

# Habilitar HTTPS only
az webapp update \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --https-only true

echo "✅ HTTPS habilitado"

echo ""
echo "📦 PASO 6: Desplegar Backend"
echo "----------------------------"
echo "⏳ Preparando código backend..."

cd backend
zip -r ../backend-deploy.zip . -x "node_modules/*" -x ".git/*" -x "uploads/*"
cd ..

echo "⏳ Subiendo a Azure... (puede tomar unos minutos)"
az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_SERVICE_NAME" \
  --src backend-deploy.zip

echo "✅ Backend desplegado"

# Limpiar archivo zip
rm backend-deploy.zip

echo ""
echo "🎨 PASO 7: Crear Static Web App (Frontend)"
echo "------------------------------------------"
echo ""
echo "⚠️  ATENCIÓN: Esta parte requiere GitHub"
echo ""
echo "Por favor, completa manualmente en Azure Portal:"
echo "1. Ve a: https://portal.azure.com"
echo "2. Create Resource → Static Web Apps"
echo "3. Configuración:"
echo "   - Resource Group: $RESOURCE_GROUP"
echo "   - Name: $STATIC_APP_NAME"
echo "   - Region: $LOCATION"
echo "   - Source: GitHub"
echo "   - Repository: divanco/DivancoWeb"
echo "   - Branch: main"
echo "   - Build preset: React"
echo "   - App location: /frontend"
echo "   - Output location: dist"
echo ""

read -p "Presiona ENTER cuando hayas completado el paso anterior..."

echo ""
echo "✅ DESPLIEGUE COMPLETADO"
echo "========================"
echo ""
echo "📊 URLs de tu aplicación:"
echo "-------------------------"
echo "Backend API: https://$APP_SERVICE_NAME.azurewebsites.net"
echo "Frontend: https://$STATIC_APP_NAME.azurestaticapps.net (verificar en portal)"
echo ""
echo "🗄️ Base de Datos:"
echo "-----------------"
echo "Host: $DB_SERVER_NAME.postgres.database.azure.com"
echo "Database: $DB_NAME"
echo "User: $DB_ADMIN_USER"
echo ""
echo "📝 Próximos pasos:"
echo "-----------------"
echo "1. Verificar que el backend responda:"
echo "   curl https://$APP_SERVICE_NAME.azurewebsites.net"
echo ""
echo "2. Configurar CORS en el backend para incluir la URL del frontend"
echo ""
echo "3. Configurar variables de entorno en Static Web App:"
echo "   VITE_API_URL=https://$APP_SERVICE_NAME.azurewebsites.net"
echo ""
echo "4. Configurar dominio personalizado (opcional)"
echo ""
echo "5. Configurar Application Insights para monitoreo"
echo ""
echo "📚 Documentación completa en: AZURE_DEPLOYMENT.md"
echo ""
