#!/bin/bash

# Script para actualizar el Container App con la última imagen del ACR
# Ejecutar después de que GitHub Actions haya construido la imagen

echo "🔄 Actualizando Container App con la última imagen..."

# Configurar variables de entorno
az containerapp update \
  --name divanco-backend \
  --resource-group divanco-rg \
  --image divancoregistry.azurecr.io/divanco-backend:latest \
  --set-env-vars \
    NODE_ENV=production \
    PORT=3001 \
    DATABASE_URL="postgresql://divancoadmin:Dv1nc0_2024\$Azur3@divanco-db-server.postgres.database.azure.com:5432/divancodb?sslmode=require" \
    JWT_SECRET="beb76599ef7b4c6556ef803b5ecc9c6114d5d74d2690365c9214768e4375d01a762500ae12ab85f46d75e7416dc1b3e5abd286f443adc07c3f6f485fa72ce75a" \
    CLOUDINARY_CLOUD_NAME="dqkm2lqpb" \
    CLOUDINARY_API_KEY="898884648337931" \
    CLOUDINARY_API_SECRET="LL3-4uS5qX7_A84hzf_BwysACiE"

echo "✅ Container App actualizado exitosamente!"
echo "🌐 URL: https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io/"
