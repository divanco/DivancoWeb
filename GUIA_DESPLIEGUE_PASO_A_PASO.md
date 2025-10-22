# 🚀 Guía de Despliegue Paso a Paso - DivancoWeb

## 📋 Tu Plan de Acción

### ✅ Paso 1: Preparación (Cliente)
**El cliente debe hacer:**

1. **Agregar tu email como Contributor:**
   - Ir a Azure Portal: https://portal.azure.com
   - Ir a "Subscriptions" → Seleccionar su suscripción
   - Ir a "Access control (IAM)" en el menú lateral
   - Clic en "+ Add" → "Add role assignment"
   - Seleccionar rol **"Contributor"** → Next
   - Clic en "+ Select members"
   - Buscar tu email y seleccionarte
   - Clic en "Select" → "Review + assign"

2. **Compartir contigo:**
   - ✉️ **Subscription ID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - ✉️ Confirmación de que te agregó como Contributor

---

### ✅ Paso 2: Instalar Azure CLI (Tú)

**En tu máquina Windows:**

```bash
# Opción 1: Con winget (recomendado)
winget install -e --id Microsoft.AzureCLI

# Opción 2: Descargar instalador MSI
# https://aka.ms/installazurecliwindows
```

**Verificar instalación:**
```bash
az --version
```

Deberías ver algo como:
```
azure-cli                         2.xx.x
```

---

### ✅ Paso 3: Login a Azure (Tú)

```bash
# Iniciar sesión (se abrirá un navegador)
az login
```

**Pasos:**
1. Se abrirá tu navegador
2. Inicia sesión con **tu email de Azure** (el que le pasaste al cliente)
3. Autoriza el acceso
4. Vuelve a la terminal

**Verificar que tienes acceso:**
```bash
# Ver todas las suscripciones a las que tienes acceso
az account list --output table
```

Deberías ver la suscripción del cliente en la lista.

**Seleccionar la suscripción del cliente:**
```bash
# Reemplaza con el Subscription ID que te dio el cliente
az account set --subscription "AQUI_EL_SUBSCRIPTION_ID_DEL_CLIENTE"
```

**Verificar que está seleccionada:**
```bash
az account show --output table
```

---

### ✅ Paso 4: Preparar Variables de Entorno (Tú)

Crea un archivo `.env.azure` en la raíz del proyecto con esta información:

```bash
# AZURE CONFIGURATION
SUBSCRIPTION_ID="AQUI_EL_SUBSCRIPTION_ID_DEL_CLIENTE"
RESOURCE_GROUP="divanco-rg"
LOCATION="eastus"

# DATABASE
DB_SERVER_NAME="divanco-db-server"
DB_ADMIN_USER="divancoadmin"
DB_ADMIN_PASSWORD="TuPasswordSeguro123!"
DB_NAME="divanco_prod"

# BACKEND
APP_SERVICE_PLAN="divanco-backend-plan"
APP_SERVICE_NAME="divanco-backend-api"

# FRONTEND
STATIC_APP_NAME="divanco-frontend"

# CLOUDINARY (tus credenciales existentes)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# EMAIL (tus credenciales existentes)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-app-password"

# JWT
JWT_SECRET="genera-un-string-aleatorio-muy-largo-y-seguro-aqui"
```

**⚠️ IMPORTANTE:** 
- Agrega `.env.azure` a tu `.gitignore`
- **NUNCA** subas este archivo a GitHub
- Cambia las contraseñas por unas seguras

---

### ✅ Paso 5: Crear Script de Despliegue (Ya está listo)

Ya tienes el script `deploy-azure.sh` pero vamos a actualizarlo:

```bash
#!/bin/bash

# Cargar variables de entorno
source .env.azure

echo "🚀 Iniciando despliegue de DivancoWeb en Azure..."

# Verificar que estamos en la suscripción correcta
echo "📋 Verificando suscripción..."
az account set --subscription "$SUBSCRIPTION_ID"
CURRENT_SUB=$(az account show --query name -o tsv)
echo "✅ Suscripción activa: $CURRENT_SUB"

# Paso 1: Crear Resource Group
echo "📦 Creando Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Paso 2: Crear PostgreSQL Flexible Server
echo "🗄️  Creando PostgreSQL Server..."
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
  --public-access 0.0.0.0

# Paso 3: Crear base de datos
echo "💾 Creando base de datos..."
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME

# Paso 4: Crear App Service Plan
echo "🏗️  Creando App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1

# Paso 5: Crear Web App (Backend)
echo "🖥️  Creando Web App (Backend)..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE_NAME \
  --runtime "NODE:18-lts"

# Paso 6: Configurar variables de entorno del Backend
echo "⚙️  Configurando variables de entorno..."
DB_CONNECTION_STRING="postgresql://$DB_ADMIN_USER:$DB_ADMIN_PASSWORD@$DB_SERVER_NAME.postgres.database.azure.com/$DB_NAME?sslmode=require"

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings \
    NODE_ENV="production" \
    DB_DEPLOY="$DB_CONNECTION_STRING" \
    JWT_SECRET="$JWT_SECRET" \
    CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
    CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
    CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
    EMAIL_USER="$EMAIL_USER" \
    EMAIL_PASS="$EMAIL_PASS"

# Paso 7: Habilitar HTTPS
echo "🔒 Habilitando HTTPS..."
az webapp update \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --https-only true

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Desplegar código del backend: cd backend && zip -r backend.zip . && az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME --src backend.zip"
echo "2. Crear Static Web App desde Azure Portal para el frontend"
echo "3. URL del Backend: https://$APP_SERVICE_NAME.azurewebsites.net"
echo ""
```

---

### ✅ Paso 6: Ejecutar el Despliegue (Tú)

**Dar permisos de ejecución al script:**
```bash
chmod +x deploy-azure.sh
```

**Ejecutar el script:**
```bash
./deploy-azure.sh
```

Esto creará:
- ✅ Resource Group
- ✅ PostgreSQL Database
- ✅ App Service (Backend)
- ✅ Variables de entorno configuradas

⏱️ **Tiempo estimado:** 10-15 minutos

---

### ✅ Paso 7: Desplegar el Código del Backend

```bash
cd backend

# Crear ZIP con el código
zip -r backend.zip .

# Desplegar a Azure
az webapp deployment source config-zip \
  --resource-group divanco-rg \
  --name divanco-backend-api \
  --src backend.zip

cd ..
```

---

### ✅ Paso 8: Crear Static Web App (Frontend)

**Opción A: Desde Azure Portal (Más fácil)**

1. Ir a Azure Portal: https://portal.azure.com
2. Buscar "Static Web Apps" → Create
3. Configuración:
   - **Subscription:** La del cliente
   - **Resource Group:** divanco-rg
   - **Name:** divanco-frontend
   - **Region:** East US
   - **Deployment:** GitHub
   - **GitHub Account:** Autorizar y seleccionar tu cuenta
   - **Organization:** divanco
   - **Repository:** DivancoWeb
   - **Branch:** main
   - **Build Presets:** React
   - **App location:** `/frontend`
   - **Output location:** `dist`
4. Review + Create → Create

Azure creará automáticamente el GitHub Actions workflow.

**Opción B: Desde CLI**

```bash
# Requiere token de GitHub
az staticwebapp create \
  --name divanco-frontend \
  --resource-group divanco-rg \
  --source https://github.com/divanco/DivancoWeb \
  --location eastus \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github
```

---

### ✅ Paso 9: Configurar CORS en el Backend

```bash
# Obtener la URL del Static Web App (aparecerá después del despliegue)
FRONTEND_URL="https://divanco-frontend.azurestaticapps.net"

az webapp cors add \
  --resource-group divanco-rg \
  --name divanco-backend-api \
  --allowed-origins $FRONTEND_URL "http://localhost:5173"
```

---

### ✅ Paso 10: Verificación

**Backend:**
```bash
curl https://divanco-backend-api.azurewebsites.net/api/health
```

**Frontend:**
Visitar: `https://divanco-frontend.azurestaticapps.net`

**Base de datos:**
```bash
psql "host=divanco-db-server.postgres.database.azure.com port=5432 dbname=divanco_prod user=divancoadmin password=TuPasswordSeguro123! sslmode=require"
```

---

## 🆘 Troubleshooting

### ❌ Error: "az: command not found"
**Solución:** Reinicia la terminal después de instalar Azure CLI

### ❌ Error: "No subscriptions found"
**Solución:** El cliente aún no te agregó como Contributor. Pídele que verifique.

### ❌ Error: "Insufficient permissions"
**Solución:** Necesitas rol "Contributor" o "Owner". Pídele al cliente que verifique el rol asignado.

### ❌ Error al crear recursos: "Name already exists"
**Solución:** Cambia los nombres en `.env.azure` (por ejemplo, `divanco-db-server-2`)

### 📞 Verificar permisos
```bash
# Ver tus roles en la suscripción
az role assignment list --assignee TU_EMAIL --output table
```

Deberías ver "Contributor" o "Owner" en la columna "Role".

---

## 📋 Checklist de Despliegue

- [ ] Cliente te agregó como Contributor
- [ ] Cliente te compartió Subscription ID
- [ ] Azure CLI instalado (`az --version` funciona)
- [ ] Login exitoso (`az login`)
- [ ] Suscripción seleccionada (`az account show`)
- [ ] Archivo `.env.azure` creado con datos correctos
- [ ] Script `deploy-azure.sh` ejecutado exitosamente
- [ ] Backend desplegado (código subido con ZIP)
- [ ] Static Web App creada
- [ ] CORS configurado
- [ ] Frontend y Backend funcionando

---

## 💰 Recordatorio de Costos

El cliente será facturado aproximadamente:
- PostgreSQL B1ms: ~$12/mes
- App Service B1: ~$13/mes
- Static Web App Standard: ~$10/mes
- **Total:** ~$35-40/mes

**Los primeros 30 días usa los $200 USD de créditos gratuitos.**

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás:
- ✅ Backend corriendo en Azure App Service
- ✅ Frontend en Azure Static Web Apps
- ✅ Base de datos PostgreSQL en Azure
- ✅ CI/CD automático desde GitHub
- ✅ HTTPS habilitado
- ✅ Todo en la cuenta del cliente

**URLs finales:**
- Backend: `https://divanco-backend-api.azurewebsites.net`
- Frontend: `https://divanco-frontend.azurestaticapps.net`
- Portal: `https://portal.azure.com`
