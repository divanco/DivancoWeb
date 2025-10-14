#!/bin/bash

# Script de preparación para despliegue en Azure
# Este script ayuda a recopilar toda la información necesaria del cliente

echo "🔵 Preparación para Despliegue en Azure - DivancoWeb"
echo "=================================================="
echo ""

# Función para solicitar información
ask_info() {
  local prompt="$1"
  local var_name="$2"
  read -p "$prompt: " value
  export $var_name="$value"
}

echo "📋 PASO 1: Información de Azure del Cliente"
echo "-------------------------------------------"
ask_info "Subscription ID de Azure" AZURE_SUBSCRIPTION_ID
ask_info "Nombre del Resource Group (o crear nuevo)" RESOURCE_GROUP
ask_info "Región de Azure (ej: eastus, westeurope)" LOCATION

echo ""
echo "📊 PASO 2: Información de Base de Datos"
echo "---------------------------------------"
ask_info "Nombre del servidor PostgreSQL (ej: divanco-db)" DB_SERVER_NAME
ask_info "Usuario administrador de DB" DB_ADMIN_USER
ask_info "Contraseña de DB (mínimo 8 caracteres)" DB_ADMIN_PASSWORD
ask_info "Nombre de la base de datos" DB_NAME

echo ""
echo "🖥️ PASO 3: Información de Backend"
echo "----------------------------------"
ask_info "Nombre del App Service (ej: divanco-api)" APP_SERVICE_NAME
ask_info "JWT Secret (generado o personalizado)" JWT_SECRET

echo ""
echo "🎨 PASO 4: Información de Frontend"
echo "----------------------------------"
ask_info "Nombre de Static Web App (ej: divanco-web)" STATIC_APP_NAME

echo ""
echo "☁️ PASO 5: Cloudinary (mantener actual)"
echo "---------------------------------------"
ask_info "Cloudinary Cloud Name" CLOUDINARY_CLOUD_NAME
ask_info "Cloudinary API Key" CLOUDINARY_API_KEY
ask_info "Cloudinary API Secret" CLOUDINARY_API_SECRET

echo ""
echo "📧 PASO 6: Configuración de Email"
echo "---------------------------------"
ask_info "Email para notificaciones" EMAIL_USER
ask_info "App Password de email" EMAIL_PASS

echo ""
echo "✅ Información Recopilada"
echo "========================="
echo ""
echo "AZURE_SUBSCRIPTION_ID: $AZURE_SUBSCRIPTION_ID"
echo "RESOURCE_GROUP: $RESOURCE_GROUP"
echo "LOCATION: $LOCATION"
echo "DB_SERVER_NAME: $DB_SERVER_NAME"
echo "DB_ADMIN_USER: $DB_ADMIN_USER"
echo "DB_NAME: $DB_NAME"
echo "APP_SERVICE_NAME: $APP_SERVICE_NAME"
echo "STATIC_APP_NAME: $STATIC_APP_NAME"
echo ""

# Guardar en archivo .env.azure
cat > .env.azure << EOF
# Azure Configuration
AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID
RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION

# Database
DB_SERVER_NAME=$DB_SERVER_NAME
DB_ADMIN_USER=$DB_ADMIN_USER
DB_ADMIN_PASSWORD=$DB_ADMIN_PASSWORD
DB_NAME=$DB_NAME

# Backend
APP_SERVICE_NAME=$APP_SERVICE_NAME
JWT_SECRET=$JWT_SECRET

# Frontend
STATIC_APP_NAME=$STATIC_APP_NAME

# Cloudinary
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# Email
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EOF

echo "💾 Configuración guardada en .env.azure"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Revisar el archivo AZURE_DEPLOYMENT.md para instrucciones detalladas"
echo "2. Ejecutar: source .env.azure"
echo "3. Ejecutar: az login"
echo "4. Seguir los pasos en AZURE_DEPLOYMENT.md"
echo ""
