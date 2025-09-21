# DivancoWeb - Estudio de Arquitectura

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Aplicación web completa para un estudio de arquitectura con sistema de gestión de contenido, portfolio interactivo y showroom de productos.

## 🏗️ Características Principales

### 🌐 Sitio Web Público
- **Homepage Moderna**: Landing page con Hero section, slogan y secciones destacadas
- **Portfolio de Proyectos**: Galería interactiva de proyectos arquitectónicos con filtros
- **Showroom de Productos**: Catálogo organizizado por categorías y subcategorías
- **Blog Corporativo**: Sistema de publicaciones con editor avanzado
- **Búsqueda Global**: Motor de búsqueda unificado para proyectos, productos y blog
- **Páginas Institucionales**: Sobre nosotros, contacto y servicios
- **Diseño Responsivo**: Optimizado para desktop, tablet y móvil

### 🎛️ Panel de Administración
- **Dashboard Interactivo**: Resumen estadístico con números reales
- **Gestión de Proyectos**: Editor completo con galería de imágenes responsivas
- **Gestión de Productos**: Administración de catálogo con categorías jerárquicas
- **Editor de Blog**: Sistema de publicaciones con EditorJS
- **Gestión de Usuarios**: Control de acceso con roles (admin, editor, user)
- **Sistema de Suscriptores**: Administración de newsletter
- **Subida de Medios**: Gestión de imágenes, videos y documentos

### 🔒 Sistema de Autenticación
- **Login/Registro**: Autenticación con JWT
- **Recuperación de Contraseña**: Sistema de reset por email
- **Roles y Permisos**: Control granular de acceso
- **Sesiones Persistentes**: Mantiene la sesión del usuario

## 🛠️ Tecnologías

### Frontend
- **React 18.2.0** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción y desarrollo
- **Redux Toolkit** - Gestión de estado global
- **React Router 6** - Navegación SPA
- **Tailwind CSS** - Framework de CSS utilitario
- **React Hook Form** - Gestión de formularios
- **Axios** - Cliente HTTP
- **EditorJS** - Editor de texto enriquecido
- **React Hot Toast** - Notificaciones
- **Swiper** - Carruseles y sliders
- **Leaflet** - Mapas interactivos
- **i18next** - Internacionalización

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para bases de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Cloudinary** - Gestión de medios en la nube
- **Multer** - Subida de archivos
- **Sharp** - Procesamiento de imágenes
- **Nodemailer** - Envío de emails
- **bcryptjs** - Hashing de contraseñas

### DevOps & Hosting
- **Render.com** - Hosting de backend
- **Vercel** - Hosting de frontend
- **GitHub** - Control de versiones
- **Cloudinary** - CDN para medios

## 📁 Estructura del Proyecto

```
DivancoWeb/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── public/      # Páginas públicas
│   │   │   ├── admin/       # Panel de administración
│   │   │   └── auth/        # Páginas de autenticación
│   │   ├── features/        # Funcionalidades con RTK Query
│   │   ├── router/          # Configuración de rutas
│   │   ├── services/        # Servicios de API
│   │   ├── contexts/        # Contextos de React
│   │   └── utils/           # Utilidades
│   └── public/              # Archivos estáticos
├── backend/                 # API REST Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── models/          # Modelos de Sequelize
│   │   ├── routes/          # Definición de rutas
│   │   ├── middlewares/     # Middlewares personalizados
│   │   ├── config/          # Configuraciones
│   │   ├── data/            # Migraciones y seeds
│   │   └── utils/           # Utilidades del backend
│   └── uploads/             # Archivos temporales
└── docs/                    # Documentación adicional
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0.0 o superior
- PostgreSQL 12 o superior
- Cuenta en Cloudinary (para medios)
- Cuenta de email (para notificaciones)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/DivancoWeb.git
cd DivancoWeb
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
```

#### Variables de Entorno (Backend)
```env
# Base de datos
DB_NAME=divanco_dev
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# Producción (opcional)
DB_DEPLOY=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Configuración
NODE_ENV=development
PORT=3001
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install

# Crear archivo .env
cp .env.example .env
```

#### Variables de Entorno (Frontend)
```env
VITE_API_URL=http://localhost:3001
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
```

### 4. Inicializar Base de Datos
```bash
cd ../backend

# Crear base de datos e inicializar tablas
npm run start
```

### 5. Ejecutar en Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📊 Modelos de Datos

### Usuario (User)
- Gestión de usuarios con roles
- Autenticación y autorización
- Perfiles de administrador, editor y usuario

### Proyecto (Project)
- Portfolio de proyectos arquitectónicos
- Galería de imágenes responsivas
- Metadatos (año, cliente, descripción)
- Imágenes para slider principal

### Producto (Product)
- Catálogo de productos/servicios
- Organización jerárquica por categorías
- Especificaciones técnicas
- Galería de imágenes

### Categoría/Subcategoría
- Sistema de clasificación de productos
- Navegación jerárquica
- Gestión de slugs para SEO

### Blog (BlogPost)
- Sistema de publicaciones
- Editor rico con EditorJS
- Categorización y etiquetas
- Estados de publicación

### Archivos (MediaFile)
- Gestión centralizada de medios
- Imágenes responsivas automáticas
- Videos optimizados
- Documentos PDF

### Suscriptores (Subscriber)
- Lista de correos para newsletter
- Gestión de suscripciones
- Estados activo/inactivo

## 🎨 Características de Diseño

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Imágenes Adaptivas**: Diferentes resoluciones según dispositivo

### Optimización de Imágenes
- **Múltiples Formatos**: WebP con fallback
- **Compresión Inteligente**: Automática según tamaño
- **Lazy Loading**: Carga diferida de imágenes
- **CDN Global**: Entrega rápida vía Cloudinary

### SEO Optimizado
- **Meta Tags Dinámicos**: Por página y contenido
- **URLs Amigables**: Slugs semánticos
- **Sitemap Automático**: Generación dinámica
- **Schema Markup**: Datos estructurados

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar en producción
npm run dev        # Desarrollo con nodemon
npm run reset-db   # Reiniciar base de datos
npm test           # Ejecutar tests
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Construir para producción
npm run preview    # Vista previa de build
```

## 🚀 Despliegue

### Backend (Render.com)
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Comando de build: `npm install`
4. Comando de inicio: `npm start`

### Frontend (Vercel)
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Directorio raíz: `frontend`
4. Comando de build: `npm run build`

## 🔐 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Hashing de Contraseñas**: bcrypt con salt
- **Validación de Entrada**: Sanitización de datos
- **CORS Configurado**: Dominios permitidos específicos
- **Rate Limiting**: Protección contra abuso
- **Headers de Seguridad**: Configuración robusta

## 📱 API Endpoints

### Autenticación
```
POST /auth/login           # Iniciar sesión
POST /auth/register        # Registro
POST /auth/forgot-password # Recuperar contraseña
POST /auth/reset-password  # Resetear contraseña
```

### Proyectos
```
GET    /projects           # Listar proyectos
POST   /projects           # Crear proyecto
GET    /projects/:id       # Obtener proyecto
PUT    /projects/:id       # Actualizar proyecto
DELETE /projects/:id       # Eliminar proyecto
```

### Productos
```
GET    /products           # Listar productos
POST   /products           # Crear producto
GET    /products/:id       # Obtener producto
PUT    /products/:id       # Actualizar producto
DELETE /products/:id       # Eliminar producto
```

### Blog
```
GET    /blog               # Listar posts
POST   /blog               # Crear post
GET    /blog/:slug         # Obtener post
PUT    /blog/:id           # Actualizar post
DELETE /blog/:id           # Eliminar post
```

### Búsqueda
```
GET    /search?q=query     # Búsqueda global
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.





