# 🚀 Configuración de GitHub Actions para Deployment Automático

## 📋 Resumen
GitHub Actions está configurado para construir automáticamente la imagen Docker del backend y subirla a Azure Container Registry (ACR) cada vez que hagas push a la rama `main`.

## 🔑 Paso 1: Configurar Secrets en GitHub

Necesitas agregar estos secrets en tu repositorio de GitHub:

1. Ve a tu repositorio: https://github.com/divanco/DivancoWeb
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret** para cada uno:

### Secrets Requeridos:

| Secret Name | Value |
|------------|-------|
| `ACR_USERNAME` | `divancoregistry` |
| `ACR_PASSWORD` | *Ver archivo AZURE_CREDENTIALS.md (línea "ACR Password")* |

> ⚠️ **IMPORTANTE**: Copia y pega exactamente estos valores desde AZURE_CREDENTIALS.md. No agregues espacios adicionales.
> 
> 📋 **Para obtener el ACR Password**: Ejecuta `az acr credential show --name divancoregistry --resource-group divanco-rg` o consulta AZURE_CREDENTIALS.md

## 🔄 Paso 2: Workflow Actual

El workflow `.github/workflows/deploy-backend.yml` hace lo siguiente:

1. ✅ Se activa cuando hay cambios en `/backend` o cuando lo ejecutes manualmente
2. ✅ Construye la imagen Docker usando `backend/Dockerfile`
3. ✅ Sube la imagen a Azure Container Registry (ACR)
4. ✅ Etiqueta la imagen con el SHA del commit y como `:latest`

## 🖥️ Paso 3: Actualizar Container App (Manual)

Después de que GitHub Actions construya y suba la imagen, necesitas actualizar el Container App manualmente:

### Opción A: Usar el script automatizado (RECOMENDADO)

```bash
cd /c/Users/merce/Desktop/DivancoWeb
bash update-container-app.sh
```

### Opción B: Comando manual

```bash
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
```

## 🎯 Flujo de Trabajo Completo

1. **Hacer cambios** en el código del backend
2. **Commit y push** a la rama `main`:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. **GitHub Actions** construirá y subirá la imagen automáticamente (2-5 minutos)
4. **Actualizar Container App** ejecutando `bash update-container-app.sh`
5. **Verificar** que funcione: https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io/

## 🔍 Monitorear GitHub Actions

- Ve a tu repositorio → pestaña **Actions**
- Verás los workflows ejecutándose
- Click en cualquier workflow para ver logs detallados
- ✅ Verde = éxito, ❌ Rojo = error

## 🆘 Troubleshooting

### Error: "Image not found"
- Verifica que GitHub Actions haya completado exitosamente
- Revisa que los secrets `ACR_USERNAME` y `ACR_PASSWORD` sean correctos

### Error: "Authentication failed"
- Verifica las credenciales del ACR
- Ejecuta: `az acr credential show --name divancoregistry --resource-group divanco-rg`

### Error: "Container app not found"
- Verifica que el Container App exista: `az containerapp show --name divanco-backend --resource-group divanco-rg`

## 📝 Notas Importantes

1. **Por qué no es 100% automático**: Tu cuenta de Azure no tiene permisos para crear Service Principals, que son necesarios para el deployment automático completo. Por eso necesitas ejecutar el script de actualización manualmente.

2. **Alternativa futura**: Pídele al administrador de la cuenta Azure que te cree un Service Principal con permisos de Contributor. Con eso podrás hacer el deployment 100% automático.

3. **Seguridad**: Las credenciales están en los secrets de GitHub (encriptados) y en el script local. NUNCA las commits al repositorio.

## ✅ Próximos Pasos

Una vez que el backend esté deployado y funcionando:
1. Deploy del frontend (Azure Static Web Apps)
2. Configurar CORS entre frontend y backend
3. Ejecutar migraciones de base de datos
4. Testing completo de la aplicación

---

**URL del Backend**: https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io/
