# 📋 Lista de Información Necesaria del Cliente para Azure

## ✅ Información Crítica Requerida

### 1. **Acceso a Azure Portal**
```
□ Email/Usuario de Azure: ___________________________
□ Subscription ID: ___________________________________
□ Permisos necesarios: Contributor o Owner
```

### 2. **Decisiones de Arquitectura**

#### Opción A: Todo en Azure (Recomendado)
- **Costo estimado**: $40-60 USD/mes
- Incluye: Frontend, Backend, Base de Datos
- **Ventaja**: Todo centralizado, mejor integración

#### Opción B: Híbrido
- Frontend en Azure Static Web Apps (~$10/mes)
- Backend y DB mantener en Render (~$25/mes)
- **Ventaja**: Menor costo inicial

**Pregunta al cliente: ¿Qué opción prefiere?**
```
□ Opción A - Todo en Azure
□ Opción B - Solo Frontend en Azure
```

### 3. **Configuración Regional**
```
□ Región preferida (cercana a usuarios):
   □ East US (Virginia)
   □ West Europe (Países Bajos)
   □ Brazil South (São Paulo)
   □ South Central US (Texas)
```

### 4. **Nombres de Recursos** (el cliente puede elegir o usar sugeridos)
```
□ Resource Group: _____________ (sugerido: divanco-rg)
□ App Service Backend: ________ (sugerido: divanco-api)
□ Static Web App: _____________ (sugerido: divanco-web)
□ PostgreSQL Server: __________ (sugerido: divanco-db)


### 5. **Dominio Personalizado** (opcional)
```
□ ¿Tienen dominio propio? Sí □ No □
□ Nombre del dominio: ___________
□ Acceso a DNS del dominio: Sí □ No □














