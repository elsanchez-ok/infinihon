# 🚀 InfiniHon - Plataforma de Infraestructura IT

<div align="center">
  
  ![InfiniHon Logo](https://img.sanishtech.com/u/985b4a9e7be8a33c261b5c10d9ed14ca.png)
  
  ### Infraestructura de Grado Industrial para Empresas Modernas
  
  [![Website](https://img.shields.io/badge/Website-infinihon.vercel.app-blue?style=for-the-badge&logo=google-chrome)](https://infinihon.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-InfiniHon-181717?style=for-the-badge&logo=github)](https://github.com/infinihon)
  [![Instagram](https://img.shields.io/badge/Instagram-@InfiniHon-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/infinihon)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-InfiniHon-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/company/infinihon)

  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/Version-3.0.0-blue)](https://github.com/infinihon/platform/releases)
  [![Last Commit](https://img.shields.io/github/last-commit/infinihon/platform?style=for-the-badge&logo=git)](https://github.com/infinihon/platform/commits)
  
</div>

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos Disponibles](#-módulos-disponibles)
- [Instalación y Despliegue](#-instalación-y-despliegue)
- [API Endpoints](#-api-endpoints)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Descripción del Proyecto

**InfiniHon** es una plataforma web moderna de gestión de infraestructura IT y e-commerce de hardware especializado. Nuestro sistema integra múltiples módulos para administración de redes, venta de productos tecnológicos, paneles administrativos y centros de soporte técnico.

> "Conectando Visiones, Potenciando Infraestructuras"

### 🏢 Casos de Uso

- **E-commerce de Hardware**: Venta de servidores, Raspberry Pi y componentes especializados
- **Gestión Administrativa**: Paneles CRUD para administración de productos y usuarios
- **Soporte Técnico**: Sistema de tickets y centro de ayuda
- **Contenido Corporativo**: Landing pages, servicios, alianzas y blog
- **Experiencias Interactivas**: Gamificación y contenido multimedia

---

## ⭐ Características Principales

### 🎨 Diseño & UX
- ✅ **Dark Mode Premium** con paleta azul medianoche (#020617)
- ✅ **Glassmorphism** en componentes clave
- ✅ **Animaciones CSS** y transiciones suaves
- ✅ **Diseño 100% responsivo** (mobile-first)
- ✅ **Accesibilidad** y navegación intuitiva

### 🛒 E-commerce Completo
- ✅ Catálogo de productos con filtrado
- ✅ Carrito de compras y checkout
- ✅ Gestión de inventario
- ✅ Panel administrativo de productos
- ✅ Sistema de usuarios y autenticación

### 📊 Módulos Implementados

| Módulo | Archivo | Estado |
|--------|---------|--------|
| **Landing Principal** | `index.html` | ✅ Activo |
| **Tienda Online** | `tienda.html`, `tienda2-4.html` | ✅ Activo |
| **Checkout** | `checkout.html` | ✅ Activo |
| **Panel Admin** | `panel_admin*.html` | ✅ Activo |
| **Servicios** | `servicios.html` | ✅ Activo |
| **Alianzas** | `alianzas.html` | ✅ Activo |
| **Contacto** | `contacto.html` | ✅ Activo |
| **Soporte** | `soporte.html` | ✅ Activo |
| **Blog** | `blog.html` | ✅ Activo |
| **Sobre Nosotros** | `sobre-nosotros.html` | ✅ Activo |
| **Términos Legales** | `terminos.html` | ✅ Activo |
| **Perfil Usuario** | `perfil.html` | ✅ Activo |
| **Registro Admin** | `registro_admin.html` | ✅ Activo |
| **Páginas Especiales** | `minecraft.html`, `chestloot.html`, `elsanchezok.html` | ✅ Activo |
| **404 Page** | `404.html` | ✅ Activo |

---

## 💻 Tecnologías Utilizadas

### Core
```javascript
{
  "lenguajes": {
    "html5": "Estructura semántica y accesible",
    "css3": "Estilos modernos con animaciones",
    "javascript": "ES6+ para interactividad"
  },
  "frameworks": {
    "tailwindcss": "^3.4.1 - Utility-first CSS",
    "particles.js": "^2.0.0 - Efectos de partículas",
    "vanilla-tilt": "^1.8.1 - Efectos 3D"
  },
  "fuentes": {
    "inter": "Tipografía principal (Google Fonts)",
    "jetbrains-mono": "Texto técnico y código"
  },
  "iconos": {
    "lucide": "Iconos vectoriales modernos",
    "fontawesome": "Iconos adicionales"
  },
  "deploy": {
    "vercel": "Hosting y CI/CD automático"
  }
}
```

### Herramientas de Desarrollo
- 🎨 **Tailwind CSS** - Framework de utilidades CSS
- ⚡ **Vercel** - Deploy automático y edge functions
- 📦 **npm** - Gestión de dependencias
- 🔒 **HTTPS** - Seguridad SSL/TLS
- 📱 **Mobile First** - Diseño responsivo

---

## 📁 Estructura del Proyecto

```
infinihon-platform/
├── 📄 index.html                 # Landing page principal
├── 🛒 tienda*.html               # Módulos de e-commerce (4 versiones)
├── 💳 checkout.html              # Proceso de pago
├── 🔧 panel_admin*.html          # Paneles de administración (3 archivos)
├── 📊 servicios*.html            # Página de servicios
├── 🤝 alianzas*.html             # Ecosistema de partners
├── 📞 contacto.html              # Formulario de contacto
├── 🎧 soporte.html               # Centro de ayuda
├── 📝 blog.html                  # Blog corporativo
├── 👤 perfil.html                # Perfil de usuario
├── 📜 terminos.html              # Términos legales
├── 🏢 sobre-nosotros.html        # Información corporativa
├── 🎮 minecraft.html             # Página especial Minecraft
├── 💎 chestloot.html             # Gamificación
├── 🚫 404.html                   # Página de error personalizada
├── 📂 api/
│   └── estado.js                 # API endpoint de estado
├── 📂 assets/
│   ├── img/                      # Imágenes generales
│   ├── img-index/                # Imágenes del landing
│   └── 3d/                       # Recursos 3D
├── 📄 guardian.js                # Script de seguridad/protección
├── 📄 package.json               # Dependencias npm
├── 📄 manifest.json              # PWA manifest
├── 📄 humans.txt                 # Créditos del equipo
└── 📄 README.md                  # Documentación
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
- Node.js 18+ recomendado
- npm o yarn
- Cuenta en Vercel (opcional para deploy)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/infinihon/platform.git
cd platform

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Despliegue en Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy a producción
npm run deploy

# O usar el comando directo
vercel --prod
```

### Variables de Entorno
El proyecto está configurado para desplegarse automáticamente en Vercel sin configuración adicional.

---

## 🔌 API Endpoints

### Estado del Sistema
```
GET /api/estado.js
```
Devuelve el estado actual de los servicios y módulos.

**Respuesta:**
```json
{
  "status": "operational",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "web": "online",
    "api": "online",
    "database": "online"
  }
}
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Contribución
- Sigue el estilo de código existente
- Comenta tu código adecuadamente
- Asegúrate que el diseño sea responsive
- Testea en múltiples navegadores

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

**InfiniHon Team**

- 🌐 **Website**: [infinihon.vercel.app](https://infinihon.vercel.app)
- 📧 **Email**: contacto@infinihon.com
- 📸 **Instagram**: [@infinihon](https://instagram.com/infinihon)
- 💼 **LinkedIn**: [InfiniHon](https://linkedin.com/company/infinihon)
- 🐙 **GitHub**: [github.com/infinihon](https://github.com/infinihon)

---

<div align="center">
  
  ### ⭐ ¡Gracias por visitar InfiniHon! ⭐
  
  _"Conectando Visiones, Potenciando Infraestructuras"_
  
  ![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge)
  ![Hosted on Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-black?style=for-the-badge&logo=vercel)
  
</div>
