# 🐾 Cougar-Club

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 📖 Descripción

Cougar-Club es una plataforma de comercio electrónico integral que permite a los negocios generar su propia página de comercio electrónico personalizada. La plataforma proporciona herramientas completas para gestionar usuarios, productos, marcas y licencias de manera eficiente, ofreciendo una experiencia de compra moderna y profesional.

## ✨ Características Principales

### 🛍️ **Para Clientes**
- **Catálogo de Productos**: Navegación intuitiva con filtros avanzados por categoría, precio y disponibilidad
- **Búsqueda Inteligente**: Sistema de búsqueda con overlay y sugerencias en tiempo real
- **Carrito de Compras**: Gestión completa del carrito con persistencia de datos
- **Proceso de Pago**: Integración con MercadoPago para transacciones seguras
- **Perfil de Usuario**: Gestión de información personal y historial de compras
- **Sistema de Cupones**: Aplicación de descuentos y promociones

### 🏢 **Para Empresas**
- **Dashboard de Gestión**: Panel completo para administrar productos, marcas y pedidos
- **Gestión de Productos**: CRUD completo con imágenes y categorización
- **Gestión de Marcas**: Administración de marcas propias
- **Sistema de Planes**: Diferentes niveles de suscripción (Mensual/Anual)
- **Estadísticas**: Métricas de ventas y rendimiento
- **Panel de Administración**: Gestión de empresas y usuarios

### 👨‍💼 **Para Administradores**
- **Gestión de Empresas**: Supervisión y administración de todas las empresas registradas
- **Gestión de Usuarios**: Control de usuarios y permisos
- **Monitoreo del Sistema**: Estadísticas globales y reportes

## 🛠️ Stack Tecnológico

### Frontend
- **Vue.js 3.2.13** - Framework progresivo para interfaces de usuario
- **Vue Router 4.5.0** - Enrutamiento oficial para Vue.js
- **Axios 1.9.0** - Cliente HTTP para peticiones a la API
- **Vue Toastification 2.0.0-rc.5** - Sistema de notificaciones
- **CSS3** - Estilos personalizados con diseño responsive

### Backend
- **Node.js** - Runtime de JavaScript
- **Express 4.21.2** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose 8.14.1** - ODM para MongoDB
- **JWT 9.0.2** - Autenticación y autorización
- **MercadoPago 1.5.10** - Procesamiento de pagos
- **Firebase Admin 13.3.0** - Servicios de autenticación y almacenamiento
- **Multer 1.4.5-lts.2** - Manejo de archivos multipart
- **Nodemailer 7.0.3** - Envío de correos electrónicos

### Herramientas de Desarrollo
- **Vue CLI 5.0.0** - Herramientas de desarrollo para Vue.js
- **ESLint 7.32.0** - Linter para JavaScript
- **Babel 7.12.16** - Transpilador de JavaScript

## 🚀 Despliegue

### Enlace de Producción
- **Frontend**: [https://cougar-club-cojsco-n21t.vercel.app/](https://cougar-club-cojsco-n21t.vercel.app/)

### Plataformas de Despliegue
- **Frontend**: Vercel (optimizado para aplicaciones Vue.js)
- **Backend**: Render (servicio web con soporte para Node.js)
- **Base de Datos**: MongoDB Atlas (servicio en la nube)

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn


### Instalación del Backend

```bash
# Navegar al directorio del servidor
cd server

# Instalar dependencias
npm install


# Ejecutar en desarrollo
node server.js

# Ejecutar en producción
npm start
```

### Instalación del Frontend

```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run serve

# Construir para producción
npm run build

```

## 🔧 Configuración

### Variables de Entorno (Backend)

Crear un archivo `.env` en el directorio `server/`:

```env
# Base de datos
MONGODB_URI=tu_uri_de_mongodb

# JWT
JWT_SECRET=tu_jwt_secret

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token

# Firebase
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_PRIVATE_KEY=tu_private_key
FIREBASE_CLIENT_EMAIL=tu_client_email

# Email
EMAIL_HOST=tu_email_host
EMAIL_PORT=587
EMAIL_USER=tu_email_user
EMAIL_PASS=tu_email_password

# Servidor
PORT=3000
NODE_ENV=development
```

### Variables de Entorno (Frontend)

Crear un archivo `.env` en el directorio `client/`:

```env
# API
VUE_APP_API_URL=http://localhost:3000/api

# Firebase
VUE_APP_FIREBASE_API_KEY=tu_api_key
VUE_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VUE_APP_FIREBASE_PROJECT_ID=tu_project_id
```

## 📁 Estructura del Proyecto

```
Cougar-Club/
├── client/                 # Frontend Vue.js
│   ├── public/            # Archivos públicos
│   │   ├── api/           # Configuración de API
│   │   ├── assets/        # Recursos estáticos
│   │   ├── components/    # Componentes Vue
│   │   ├── router/        # Configuración de rutas
│   │   ├── services/      # Servicios de negocio
│   │   ├── views/         # Vistas de la aplicación
│   │   └── main.js        # Punto de entrada
│   └── package.json
├── server/                # Backend Node.js
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores
│   ├── middleware/       # Middlewares
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Rutas de la API
│   ├── uploads/         # Archivos subidos
│   └── server.js        # Punto de entrada
└── README.md
```

## 🔐 Autenticación y Autorización

El sistema utiliza JWT (JSON Web Tokens) para la autenticación y autorización:

- **Usuarios**: Registro, login y gestión de perfiles
- **Administradores**: Panel de administración con permisos especiales
- **Gerentes**: Gestión de productos y marcas de su empresa

La aplicación está diseñada para funcionar perfectamente en:

- 📱 Tablets
- 💻 Computadoras de escritorio
- 🖥️ Pantallas grandes


**Desarrollado con ❤️ por el equipo de Cougar-Club**
