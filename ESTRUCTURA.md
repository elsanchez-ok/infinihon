# 📁 Estructura del Proyecto InfiniHon

## ✅ Organización Completada

Todos los archivos han sido organizados siguiendo las mejores prácticas:

### 🏠 Raíz (`/workspace/`)
Solo contiene **archivos HTML** y configuración esencial de Git:
- 34 archivos HTML (páginas web)
- `.gitignore` - Configuración de Git
- `LICENSE` - Licencia del proyecto
- `README.md` - Documentación principal
- `sitemap.xml` - Mapa del sitio para SEO

### 🎨 Assets (`/workspace/assets/`)
Recursos estáticos del frontend:
```
assets/
├── 3d/                    # Modelos 3D (.glb)
│   └── server rack.glb
├── css/                   # Hojas de estilo
├── fonts/                 # Fuentes personalizadas
├── img/                   # Imágenes generales
├── img-index/             # Imágenes específicas del index
├── js/                    # Scripts JavaScript del frontend
│   ├── guardian.js
│   └── sw.js (Service Worker)
├── humans.txt             # Archivo "humans.txt" para desarrolladores
├── manifest.json          # Web App Manifest
└── robots.txt             # Configuración para bots de búsqueda
```

### 🔧 Backend (`/workspace/backend/`)
Servidor API seguro con Node.js + Express:
```
backend/
├── server.js              # Punto de entrada del servidor
├── package.json           # Dependencias y scripts npm
├── .env.example           # Plantilla de variables de entorno
├── .env                   # Variables reales (¡NO COMMITIR!)
├── README.md              # Documentación del backend
├── config/                # Configuraciones
│   ├── database.js        # Conexión a SQLite Cloud
│   └── vercel.json        # Configuración para Vercel
├── routes/                # Endpoints de la API
│   ├── productos.js       # CRUD de productos
│   ├── pedidos.js         # Gestión de pedidos
│   └── usuarios.js        # Autenticación y usuarios
├── controllers/           # Lógica de negocio (opcional)
├── middleware/            # Middlewares personalizados
├── docs/                  # Documentación adicional
│   └── DB_GLOBAL_README.md
└── api/                   # APIs legacy (migrar o eliminar)
    └── estado.js
```

## 🔒 Seguridad Implementada

### ✅ Credenciales Protegidas
- Las credenciales de SQLite Cloud ahora están en el backend
- Archivo `.env` con variables sensibles (no commitear)
- API Key nunca se expone al navegador

### 🛡️ Endpoints Seguros
Todos los accesos a base de datos pasan por el backend:
- Frontend → API REST → Backend → SQLite Cloud
- Validación de datos en el servidor
- CORS configurado para controlar accesos

## 🚀 Cómo Usar

### 1. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env y agregar tu API Key real
```

### 3. Iniciar el servidor
```bash
npm start
```

### 4. Actualizar el frontend
Reemplazar llamadas directas a SQLite Cloud por llamadas a la API:

**ANTES:**
```javascript
import { sqliteCloudConnect } from '@sqlitecloud/drivers';
const db = await sqliteCloudConnect({ apikey: 'EXPOSED' });
```

**AHORA:**
```javascript
const response = await fetch('http://localhost:3000/api/productos');
const data = await response.json();
```

## 📊 Archivos por Tipo

| Tipo | Cantidad | Ubicación |
|------|----------|-----------|
| HTML | 34 | `/workspace/*.html` |
| JS Frontend | 2 | `/workspace/assets/js/` |
| CSS | - | `/workspace/assets/css/` |
| Imágenes | Varias | `/workspace/assets/img/` |
| Backend JS | 5+ | `/workspace/backend/` |
| Config | 3 | `/workspace/backend/config/` |

## 🔄 Próximos Pasos

1. **Instalar dependencias**: `cd backend && npm install`
2. **Configurar .env**: Agregar API Key real de SQLite Cloud
3. **Probar API**: `curl http://localhost:3000/api/health`
4. **Actualizar HTMLs**: Migrar llamadas de DB a endpoints API
5. **Deploy**: Subir a Vercel u otro hosting

## ⚠️ Importante

- **NUNCA** hagas commit del archivo `.env`
- Los archivos HTML siguen en la raíz para mantener compatibilidad
- El backend debe ejecutarse antes de usar las funcionalidades con DB
- En producción, usar variables de entorno del hosting

## 📞 Soporte

Para más detalles, revisar:
- `/backend/README.md` - Documentación completa del backend
- `/backend/docs/DB_GLOBAL_README.md` - Guía de migración de DB
