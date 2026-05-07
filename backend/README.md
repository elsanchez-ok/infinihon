# 🚀 Backend API InfiniHon

Backend seguro con Node.js y Express para gestionar la base de datos SQLite Cloud sin exponer credenciales en el frontend.

## 📁 Estructura del Proyecto

```
backend/
├── server.js                 # Punto de entrada principal
├── package.json              # Dependencias y scripts
├── .env.example              # Plantilla de variables de entorno
├── .env                      # Variables reales (NO COMMITIR)
├── config/
│   ├── database.js           # Conexión a SQLite Cloud
│   └── vercel.json           # Configuración Vercel
├── routes/
│   ├── productos.js          # API de productos
│   ├── pedidos.js            # API de pedidos
│   └── usuarios.js           # API de usuarios
├── controllers/              # Lógica de negocio (opcional)
└── middleware/               # Middlewares personalizados
```

## 🔧 Instalación

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y agrega tu API Key real de SQLite Cloud:
```env
SQLITE_HOST=cxaerd5fvk.g2.sqlite.cloud
SQLITE_PORT=8860
SQLITE_DATABASE=infinihon_store.db
SQLITE_API_KEY=TU_API_KEY_REAL_AQUI
PORT=3000
NODE_ENV=development
```

### 3. Iniciar el servidor
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## 📡 Endpoints de la API

### Productos
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Pedidos
- `GET /api/pedidos` - Listar todos los pedidos
- `GET /api/pedidos/:id` - Obtener pedido por ID
- `POST /api/pedidos` - Crear nuevo pedido

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios/login` - Autenticar usuario
- `POST /api/usuarios/register` - Registrar nuevo usuario

### Salud
- `GET /api/health` - Verificar estado del servidor

## 🔗 Cómo usar desde el Frontend

### Ejemplo: Obtener productos

**ANTES (inseguro - credenciales expuestas):**
```javascript
// En el HTML directamente
import { sqliteCloudConnect } from '@sqlitecloud/drivers';
const db = await sqliteCloudConnect({ apikey: 'KEY_EXPUESTA' });
```

**AHORA (seguro - usando API):**
```javascript
// En tu archivo JS del frontend
const response = await fetch('http://localhost:3000/api/productos');
const data = await response.json();
console.log(data.data); // Array de productos
```

### Ejemplo: Crear pedido

```javascript
const nuevoPedido = {
    usuario_id: 1,
    productos: [{ id: 1, cantidad: 2 }],
    total: 199.99,
    estado: 'pendiente'
};

const response = await fetch('http://localhost:3000/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoPedido)
});

const result = await response.json();
```

## 🛡️ Seguridad

### ✅ Ventajas de esta implementación:
1. **Credenciales ocultas**: La API Key está solo en el servidor (.env)
2. **Validación de datos**: El backend valida todas las entradas
3. **CORS configurado**: Controla qué dominios pueden acceder
4. **Manejo de errores**: Los errores no exponen detalles internos

### ⚠️ Mejoras recomendadas para producción:
- [ ] Implementar autenticación con JWT
- [ ] Usar bcrypt para hash de contraseñas
- [ ] Agregar rate limiting
- [ ] Implementar prepared statements para prevenir SQL injection
- [ ] Usar HTTPS en producción
- [ ] Agregar logging y monitoreo

## 📦 Archivos Movidos

Todos los archivos no-HTML han sido organizados:

```
/workspace/
├── index.html, tienda.html, etc.  # HTMLs se quedan en raíz
├── assets/
│   ├── css/                       # Hojas de estilo
│   ├── js/                        # Scripts frontend
│   ├── img/                       # Imágenes
│   └── fonts/                     # Fuentes
└── backend/
    ├── server.js                  # Servidor principal
    ├── config/                    # Configuraciones
    ├── routes/                    # Endpoints API
    ├── controllers/               # Lógica de negocio
    └── middleware/                # Middlewares
```

## 🚀 Deploy en Vercel

El backend puede desplegarse en Vercel como Serverless Functions:

1. Asegúrate de tener `vercel.json` configurado
2. Agrega las variables de entorno en el dashboard de Vercel
3. Ejecuta `vercel --prod`

## 🧪 Testing

Probar endpoints con curl:
```bash
# Health check
curl http://localhost:3000/api/health

# Obtener productos
curl http://localhost:3000/api/productos

# Crear producto
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","precio":99.99}'
```

## 📝 Notas Importantes

1. **NUNCA** commits el archivo `.env` a Git
2. Las credenciales de SQLite Cloud ahora están seguras en el backend
3. Los archivos HTML deben actualizar sus llamadas para usar la API
4. En producción, usa variables de entorno de tu hosting

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa los logs del servidor
2. Verifica que `.env` tenga las credenciales correctas
3. Asegúrate de que el puerto 3000 esté disponible
4. Consulta la documentación de Express y SQLite Cloud
