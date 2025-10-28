# 🔑 Cómo Obtener tu Subscription ID de Azure

## ❓ ¿Qué es el Subscription ID?

El **Subscription ID** es simplemente un **código identificador único** que Azure asigna AUTOMÁTICAMENTE y GRATIS a tu cuenta cuando la creas. 

**NO es algo que se compra** ni viene en ningún "plan especial".

---

## ✅ MÉTODO 1: Desde el Portal de Azure (Más Fácil)

### Paso a Paso:

1. **Abrir tu navegador** y ir a: https://portal.azure.com

2. **Iniciar sesión** con tu cuenta de Microsoft/Azure

3. **Buscar "Subscriptions"** (Suscripciones):
   - Opción A: En el menú de la izquierda busca "Subscriptions"
   - Opción B: En la barra de búsqueda superior escribe "Subscriptions"

4. **Ver tu Subscription ID**:
   - Verás una tabla con tu(s) suscripción(es)
   - La columna "Subscription ID" muestra tu código
   - Se ve así: `12345678-1234-1234-1234-123456789abc`

5. **Copiar el ID**:
   - Haz clic en el ícono de "copiar" al lado del ID
   - O simplemente selecciona el texto y copia (Ctrl+C)

### 📸 Referencia Visual:

```
╔════════════════════════════════════════════════════════════╗
║  Azure Portal > Subscriptions                              ║
╠════════════════════════════════════════════════════════════╣
║  Subscription name     │ Subscription ID                   ║
║  ─────────────────────────────────────────────────────────║
║  Pay-As-You-Go         │ 12345678-1234-1234-1234-12345678 ║
║  Free Trial            │ 87654321-4321-4321-4321-87654321 ║
╚════════════════════════════════════════════════════════════╝
                                    👆 Este es tu Subscription ID
```

---

## ✅ MÉTODO 2: Desde la Línea de Comandos (Azure CLI)

Si tienes Azure CLI instalado:

```bash
# 1. Iniciar sesión
az login

# 2. Ver todas tus suscripciones
az account list --output table

# 3. Ver solo el ID de la suscripción activa
az account show --query id --output tsv
```

---

## 🆕 ¿No tienes cuenta de Azure aún?

### Crear Cuenta GRATIS:

1. **Ir a**: https://azure.microsoft.com/free/

2. **Hacer clic en** "Start free" o "Comenzar gratis"

3. **Seguir el proceso de registro**:
   - Necesitas un email (puede ser Gmail, Outlook, etc.)
   - Tarjeta de crédito/débito (solo para verificación, NO se cobra)
   - Número de teléfono

4. **Beneficios de la cuenta gratuita**:
   - $200 USD en créditos por 30 días
   - Servicios gratuitos por 12 meses
   - Más de 25 servicios siempre gratuitos

5. **Al completar el registro**:
   - Azure crea AUTOMÁTICAMENTE tu primera suscripción
   - Ya tienes tu Subscription ID disponible
   - Sigue los pasos del "MÉTODO 1" para verlo

---

## 🔍 ¿Qué tipos de suscripciones tienen Subscription ID?

### TODAS las suscripciones tienen Subscription ID:

- ✅ **Free Trial** (Prueba gratuita) - $200 crédito
- ✅ **Pay-As-You-Go** (Pago por uso)
- ✅ **Microsoft 365** (si incluye Azure)
- ✅ **Enterprise Agreement** (Empresarial)
- ✅ **Student** (Estudiantes)
- ✅ **Azure for Students** (Gratuita para estudiantes)
- ✅ **Visual Studio Subscription** (Desarrolladores)
- ✅ **MSDN Platforms**

**Conclusión**: Si tienes una cuenta de Azure, automáticamente tienes un Subscription ID.

---

## 🚨 PROBLEMA ACTUAL: Permisos de Contributor No Disponibles (2024-2025)

### ¿Qué está pasando?

Microsoft ha actualizado las políticas de seguridad de Azure y ahora es común que **NO aparezca la opción "Contributor"** en las asignaciones de roles, especialmente en:

- ✅ Cuentas nuevas de Azure
- ✅ Suscripciones Free Trial
- ✅ Cuentas corporativas con políticas restrictivas
- ✅ Azure for Students

### 🛠️ SOLUCIONES ALTERNATIVAS

#### **Opción A: Usar Roles Más Específicos**

En lugar de "Contributor", busca y asigna estos roles:

```
✅ Storage Blob Data Contributor
✅ Storage Account Contributor  
✅ App Service Contributor
✅ Website Contributor
✅ Key Vault Contributor (si usas Key Vault)
```

#### **Opción B: Crear Service Principal con Azure CLI**

Si tienes Azure CLI instalado:

```bash
# 1. Crear Service Principal
az ad sp create-for-rbac --name "DivancoWebApp" \
  --role "Website Contributor" \
  --scopes "/subscriptions/TU_SUBSCRIPTION_ID"

# 2. El comando te dará:
# - appId (Client ID)
# - password (Client Secret)  
# - tenant (Tenant ID)
```

#### **Opción C: Usar Managed Identity**

Para deployment directo sin service principal:

1. **App Service**: Crear con Managed Identity habilitada
2. **Static Web Apps**: Usar GitHub Actions con OIDC
3. **Container Apps**: Deployment directo desde GitHub

#### **Opción D: Solicitar Permisos al Administrador**

Si es cuenta corporativa/organizacional:

```
📧 Email Template para enviar:

Asunto: Solicitud de permisos Azure para desarrollo web

Hola [Administrador],

Necesito permisos en Azure para desplegar una aplicación web.
¿Podrías asignarme los siguientes roles en la suscripción [ID]?

- App Service Contributor
- Storage Account Contributor  
- Website Contributor

Es para el proyecto: [Nombre del proyecto]
Repositorio: [URL del repo]

Gracias,
[Tu nombre]
```

### 🆕 MÉTODO ALTERNATIVO: GitHub Actions + OIDC (Recomendado 2024)

**Sin necesidad de Service Principal**:

1. **En Azure Portal**:
   - Ir a "Microsoft Entra ID" > "App registrations"
   - Create new registration
   - Configurar Federated Credentials para GitHub

2. **En GitHub**:
   - Agregar secrets para AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID
   - Usar GitHub Actions para deployment

3. **Beneficios**:
   - ✅ Más seguro (no secrets permanentes)
   - ✅ Recomendado por Microsoft
   - ✅ Evita problemas de permisos

---

## ❌ Errores Comunes

### "No encuentro mi Subscription ID"

**Posible causa 1**: No has iniciado sesión
- **Solución**: Asegúrate de estar en https://portal.azure.com con tu cuenta

**Posible causa 2**: Tu cuenta no tiene ninguna suscripción asignada
- **Solución**: Contactar al administrador de tu organización o crear una cuenta gratuita

**Posible causa 3**: Estás usando una cuenta de Microsoft personal sin Azure
- **Solución**: Crear una suscripción gratuita desde https://azure.microsoft.com/free/

### "Dice que necesito comprar algo"

- **Aclaración**: NO necesitas comprar nada para obtener el Subscription ID
- El ID se genera automáticamente al crear la cuenta
- Puedes usar la cuenta gratuita indefinidamente

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos no puedes encontrar tu Subscription ID:

1. **Verifica que realmente tienes una cuenta de Azure**:
   - Intenta acceder a https://portal.azure.com
   - ¿Te deja iniciar sesión?

2. **Verifica que tu cuenta tiene al menos una suscripción**:
   - En el portal, busca "Subscriptions"
   - ¿Aparece algo en la lista?

3. **Si la lista está vacía**:
   - Significa que tu cuenta no tiene suscripciones asignadas
   - Necesitas crear una (puede ser la gratuita)

---

## 📋 Resumen Rápido

```
┌─────────────────────────────────────────────┐
│  PASOS RÁPIDOS:                             │
│                                              │
│  1. Ir a https://portal.azure.com           │
│  2. Iniciar sesión                          │
│  3. Buscar "Subscriptions"                  │
│  4. Copiar el Subscription ID               │
│  5. ¡Listo! Ya lo tienes                    │
└─────────────────────────────────────────────┘
```

**Formato del Subscription ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Ejemplo** (NO usar este): `12345678-abcd-1234-efgh-123456789012`

---

## ✍️ Nota para el Cliente

Tu Subscription ID es como el "número de cuenta" de Azure. Lo necesitamos para:

- Crear recursos en tu cuenta de Azure
- Configurar el despliegue de la aplicación
- Gestionar la facturación y los costos

**Es seguro compartir el Subscription ID** con tu equipo de desarrollo de confianza, ya que para acceder a tu cuenta también se necesitan las credenciales de inicio de sesión.

---

**¿Listo para continuar?** Una vez que tengas tu Subscription ID, podremos proceder con el despliegue en Azure. 🚀
