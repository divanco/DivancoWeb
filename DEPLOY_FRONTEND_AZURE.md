# 🚀 Deploy Frontend a Azure Static Web Apps

## Opción 1: Desde el Portal de Azure (RECOMENDADO - Más Fácil)

### Paso 1: Crear Static Web App

1. Ve al Portal de Azure: https://portal.azure.com
2. Click en **"Create a resource"** (Crear un recurso)
3. Busca **"Static Web App"**
4. Click en **"Create"**

### Paso 2: Configurar el Static Web App

**Basics (Básico):**
- **Subscription**: Azure subscription 1
- **Resource Group**: `divanco-rg`
- **Name**: `divanco-frontend`
- **Plan type**: `Free`
- **Region**: `West US 2` o `East US 2`

**Deployment (Implementación):**
- **Source**: `GitHub`
- **GitHub Account**: Autoriza con tu cuenta de GitHub (Mlobeto)
- **Organization**: `divanco`
- **Repository**: `DivancoWeb`
- **Branch**: `main`

**Build Details (Detalles de Build):**
- **Build Presets**: `Custom` o `Vite`
- **App location**: `/frontend`
- **Api location**: (dejar vacío)
- **Output location**: `dist`

**Environment Variables:**
Click en **"Add"** y agrega:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io`

### Paso 3: Crear y esperar

1. Click en **"Review + Create"**
2. Click en **"Create"**
3. Espera 2-3 minutos a que se cree
4. Azure automáticamente:
   - Creará un GitHub Actions workflow en tu repo
   - Hará el primer build
   - Deployará el frontend

### Paso 4: Obtener la URL

Cuando termine, verás:
- **URL**: `https://divanco-frontend-XXXXX.azurestaticapps.net`

---

## Opción 2: Usando Azure CLI + GitHub Actions Manual

Si prefieres hacerlo por CLI (más complejo):

### 1. Necesitas crear un GitHub Personal Access Token

1. Ve a: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Scopes**: Marca `repo` y `workflow`
4. Copia el token generado

### 2. Crear el Static Web App

```bash
az staticwebapp create \
  --name divanco-frontend \
  --resource-group divanco-rg \
  --source https://github.com/divanco/DivancoWeb \
  --location "West US 2" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --token <TU_GITHUB_TOKEN>
```

### 3. Configurar variables de entorno

```bash
az staticwebapp appsettings set \
  --name divanco-frontend \
  --resource-group divanco-rg \
  --setting-names VITE_API_BASE_URL=https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io
```

---

## 🔧 Configuración de CORS en el Backend

Una vez que tengas la URL del frontend, necesitas configurar CORS en el backend.

**Edita** `backend/src/app.js` y agrega el dominio del frontend:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://divanco-frontend-XXXXX.azurestaticapps.net', // ← Agregar tu URL
  ],
  credentials: true,
};
```

Luego hacer commit y push para que GitHub Actions rebuilda el backend.

---

## 📝 Verificar el Deployment

1. **Frontend URL**: `https://divanco-frontend-XXXXX.azurestaticapps.net`
2. **Backend URL**: `https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io`

### Testing:
- ✅ Frontend carga correctamente
- ✅ Login funciona
- ✅ Puede crear proyectos/productos
- ✅ Subida de imágenes funciona (Cloudinary)

---

## 🎯 Próximos Pasos

1. **Dominio personalizado** (cuando te pasen los DNS)
2. **Configurar HTTPS** (automático en Azure)
3. **Monitoreo** con Application Insights
4. **Backups** de la base de datos

---

## 📌 URLs Finales

- **Backend**: https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io/
- **Frontend**: (se generará al crear Static Web App)
- **Database**: divanco-db-server.postgres.database.azure.com

¡Todo listo para producción! 🎉
