# 🚀 Workflow de Deployment - Divanco Web en Azure

## 📋 URLs de Producción

- **Frontend:** https://polite-desert-0d77a5b1e.3.azurestaticapps.net
- **Backend:** https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io
- **Database:** divanco-db-server.postgres.database.azure.com

---

## 🔄 Cómo Deployar Cambios

### 📱 **Frontend (React + Vite)**

Cada vez que hagas cambios en el frontend:

```bash
# 1. Build del frontend
cd frontend
VITE_API_BASE_URL=https://divanco-backend.blackcoast-f34b960d.westus.azurecontainerapps.io npm run build

# 2. Deploy a Azure Static Web Apps
swa deploy ./dist \
  --deployment-token "VER_AZURE_CREDENTIALS.md" \
  --env production
```

**✅ Listo!** Los cambios estarán en vivo en ~1 minuto.

---

### 🖥️ **Backend (Node.js + Express)**

El backend usa **GitHub Actions + Azure Container Apps**. El proceso es semi-automático:

```bash
# 1. Haz tus cambios en /backend
# 2. Commit y push
git add .
git commit -m "feat: descripción de los cambios"
git push origin main

# 3. GitHub Actions automáticamente:
#    - Compilará una imagen Docker
#    - La subirá a Azure Container Registry

# 4. Actualiza el Container App manualmente (ejecuta desde la raíz):
./update-container-app.sh
```

**⏱️ Tiempo total:** ~3-5 minutos

---

## 🔧 Comandos Útiles

### Ver logs del backend:
```bash
az containerapp logs show \
  --name divanco-backend \
  --resource-group divanco-rg \
  --follow
```

### Ver estado del Container App:
```bash
az containerapp show \
  --name divanco-backend \
  --resource-group divanco-rg \
  --query "properties.{Status:runningStatus,URL:configuration.ingress.fqdn}"
```

### Ver revisiones activas:
```bash
az containerapp revision list \
  --name divanco-backend \
  --resource-group divanco-rg \
  --query "[?properties.active==\`true\`]" \
  --output table
```

### Conectar a la base de datos:
```bash
psql "postgresql://divancoadmin:Dv1nc0_2024$Azur3@divanco-db-server.postgres.database.azure.com:5432/divancodb?sslmode=require"
```

---

## 📝 Notas Importantes

### CORS
El backend está configurado para aceptar requests desde:
- `https://polite-desert-0d77a5b1e.3.azurestaticapps.net` (producción)
- `http://localhost:5173` (desarrollo local)

Si cambias el dominio del frontend, actualiza `backend/src/app.js`.

### Content Security Policy (CSP)
El frontend tiene CSP configurado en `frontend/staticwebapp.config.json`:
- Permite conexiones a: `*.azurecontainerapps.io` (backend) y `*.cloudinary.com` (imágenes)

### Variables de Entorno
Todas las credenciales y secrets están en `AZURE_CREDENTIALS.md` (NO SUBIR A GIT).

---

## 🐛 Troubleshooting

### Error: "CORS policy blocked"
- Verifica que el frontend esté en la lista de `allowedOrigins` en `backend/src/app.js`
- Ejecuta `./update-container-app.sh` después de hacer cambios en CORS

### Error: "CSP violation"
- Agrega el dominio a `staticwebapp.config.json` en `globalHeaders.content-security-policy`
- Rebuild y redeploy el frontend

### Backend no responde
```bash
# Ver logs en tiempo real
az containerapp logs show \
  --name divanco-backend \
  --resource-group divanco-rg \
  --follow
```

### Frontend no actualiza
- Limpia caché del navegador: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
- Verifica que el deployment terminó: espera ~1 minuto después de `swa deploy`

---

## 📦 Archivos Importantes

- `AZURE_CREDENTIALS.md` - Todas las credenciales (NO subir a Git)
- `update-container-app.sh` - Script para actualizar el backend
- `.github/workflows/deploy-backend.yml` - GitHub Actions para build automático
- `frontend/staticwebapp.config.json` - Configuración de Static Web App
- `backend/Dockerfile` - Configuración Docker del backend

---

**Última actualización:** $(date)
**Mantenido por:** Deployment Team
