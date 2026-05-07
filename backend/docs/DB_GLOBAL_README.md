# 📦 GUÍA DE IMPLEMENTACIÓN - DB GLOBAL MODULE

## ARCHIVO CREADO: `db_global.js`

Este archivo centraliza toda la configuración y conexión a la base de datos SQLite Cloud para evitar código duplicado en múltiples archivos HTML.

---

## 🎯 ARCHIVOS QUE DEBEN USAR ESTE MÓDULO

Los siguientes archivos actualmente tienen la conexión hardcodeada y deben migrar a usar `db_global.js`:

1. ✅ `panel_admin.html` (línea 383)
2. ✅ `panel_admin_productos.html` (línea 934)
3. ✅ `tienda.html` (línea 1535)
4. ✅ `tienda4.html` (línea 1116)
5. ✅ `checkout.html` (línea 507)
6. ✅ `perfil.html` (línea 320)
7. ✅ `registro_admin.html` (línea 893)

---

## 📋 PASOS PARA IMPLEMENTAR

### PASO 1: Agregar Import Map en el `<head>`

En cada archivo HTML que use la BD, agrega esto en el `<head>`:

```html
<!-- Import Map para SQLite Cloud -->
<script type="importmap">
    {
        "imports": {
            "@sqlitecloud/drivers": "https://esm.sh/@sqlitecloud/drivers@latest"
        }
    }
</script>

<!-- Script Global de Base de Datos -->
<script src="db_global.js"></script>
```

### PASO 2: Eliminar Código Duplicado

**ELIMINA** estas líneas de cada archivo:

```javascript
// ❌ ELIMINAR ESTO:
import { Database } from '@sqlitecloud/drivers';

const CONNECTION_STRING = 'sqlitecloud://cxaerd5fvk.g2.sqlite.cloud:8860/infinihon_store.db?apikey=cfHa2k4KOhBzxKL5g484dhAf4xlC4znLp5M6wzirgvc';

let db = null;

async function connectDB() {
    if (!db) {
        db = new Database(CONNECTION_STRING);
        await db.connect();
    }
    return db;
}
```

### PASO 3: Usar las Funciones Globales

**REEMPLAZA** con esto:

```javascript
// ✅ USAR ESTO:

// Opción A: Usando funciones helper (RECOMENDADO)
async function cargarProductos() {
    try {
        const resultados = await window.queryDatabase('SELECT * FROM productos');
        console.log('Productos cargados:', resultados);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Opción B: Usando la conexión directa
async function conectarYConsultar() {
    const db = await window.connectToDatabase();
    const resultados = await db.run('SELECT * FROM usuarios');
    return resultados;
}

// Opción C: Verificar estado
if (window.isDatabaseConnected()) {
    console.log('✅ Ya hay conexión activa');
}
```

---

## 🔧 FUNCIONES DISPONIBLES

### `connectToDatabase()`
Conecta a la base de datos y retorna la instancia.
```javascript
const db = await window.connectToDatabase();
```

### `queryDatabase(sql, params)`
Ejecuta una consulta SQL de forma segura.
```javascript
const productos = await window.queryDatabase('SELECT * FROM productos WHERE categoria = ?', ['laptops']);
```

### `executeTransaction(queries)`
Ejecuta múltiples consultas como transacción.
```javascript
await window.executeTransaction([
    { sql: 'INSERT INTO pedidos VALUES (?, ?)', params: [id, fecha] },
    { sql: 'UPDATE stock SET cantidad = cantidad - 1 WHERE id = ?', params: [productoId] }
]);
```

### `closeDatabase()`
Cierra la conexión activa.
```javascript
await window.closeDatabase();
```

### `isDatabaseConnected()`
Verifica si hay una conexión activa.
```javascript
if (window.isDatabaseConnected()) {
    console.log('Conectado ✅');
}
```

### `getDatabaseConfigInfo()`
Obtiene información de configuración (API Key enmascarada).
```javascript
const info = window.getDatabaseConfigInfo();
console.log(info);
// { host: '...', port: 8860, database: 'infinihon_store.db', apiKey: 'cfHa2k4...', isConnected: true }
```

---

## 🎨 EJEMPLO COMPLETO - PANEL_ADMIN.HTML

### ANTES (Código actual):
```html
<script type="importmap">
    {
        "imports": {
            "@sqlitecloud/drivers": "https://esm.sh/@sqlitecloud/drivers@latest"
        }
    }
</script>

<script type="module">
import { Database } from '@sqlitecloud/drivers';

const CONNECTION_STRING = 'sqlitecloud://cxaerd5fvk.g2.sqlite.cloud:8860/infinihon_store.db?apikey=cfHa2k4KOhBzxKL5g484dhAf4xlC4znLp5M6wzirgvc';

let db = null;

async function initDB() {
    db = new Database(CONNECTION_STRING);
    await db.connect();
    cargarDatos();
}

async function cargarDatos() {
    const productos = await db.run('SELECT * FROM productos');
    // ... más código
}
</script>
```

### DESPUÉS (Con db_global.js):
```html
<!-- En el <head> -->
<script type="importmap">
    {
        "imports": {
            "@sqlitecloud/drivers": "https://esm.sh/@sqlitecloud/drivers@latest"
        }
    }
</script>
<script src="db_global.js"></script>

<!-- En el <body> o antes del </body> -->
<script>
async function initDB() {
    await window.connectToDatabase();
    cargarDatos();
}

async function cargarDatos() {
    const productos = await window.queryDatabase('SELECT * FROM productos');
    // ... más código
}
</script>
```

---

## ⚠️ NOTAS IMPORTANTES

### 1. ORDEN DE CARGA
El archivo `db_global.js` debe cargarse **ANTES** de cualquier script que use la base de datos.

```html
<!-- ✅ CORRECTO -->
<script src="db_global.js"></script>
<script src="mi_script_con_bd.js"></script>

<!-- ❌ INCORRECTO -->
<script src="mi_script_con_bd.js"></script>
<script src="db_global.js"></script>
```

### 2. SEGURIDAD - API KEY EXPUESTA
⚠️ **ADVERTENCIA CRÍTICA**: La API Key está expuesta en el código frontend. Esto es un riesgo de seguridad.

**Recomendaciones:**
- Implementar un backend proxy (Node.js, PHP, Python)
- Usar variables de entorno en el servidor
- Restringir permisos de la API Key en SQLite Cloud
- Implementar autenticación y autorización

### 3. MANEJO DE ERRORES
Siempre usa try-catch al trabajar con la BD:

```javascript
try {
    const resultados = await window.queryDatabase('SELECT * FROM tabla');
    // Procesar resultados
} catch (error) {
    console.error('Error en BD:', error.message);
    // Mostrar mensaje al usuario
}
```

### 4. CONEXIÓN ÚNICA
El módulo maneja automáticamente una única conexión. No necesitas preocuparte por conexiones múltiples.

```javascript
// Todas estas llamadas usan la misma conexión:
await window.connectToDatabase(); // Primera vez: conecta
await window.connectToDatabase(); // Segunda vez: retorna la existente
await window.queryDatabase(...);  // Usa la conexión existente
```

---

## 🧪 TESTING

Para probar que el módulo funciona correctamente, abre la consola del navegador y ejecuta:

```javascript
// Verificar que el módulo cargó
console.log(window.DB_CONFIG);

// Conectar a la BD
const db = await window.connectToDatabase();

// Hacer una consulta de prueba
const resultado = await window.queryDatabase('SELECT sqlite_version()');
console.log('Versión SQLite:', resultado);

// Verificar estado
console.log('¿Conectado?', window.isDatabaseConnected());

// Obtener info de configuración
console.log(window.getDatabaseConfigInfo());
```

---

## 📊 BENEFICIOS DE ESTA IMPLEMENTACIÓN

✅ **Centralización**: Un solo lugar para configurar la BD  
✅ **Mantenibilidad**: Cambios en un solo archivo  
✅ **Reutilización**: Funciones helper disponibles globalmente  
✅ **Consistencia**: Misma configuración en todos los archivos  
✅ **Debugging**: Logs centralizados y consistentes  
✅ **Seguridad**: Fácil de migrar a backend cuando sea necesario  

---

## 🔄 MIGRACIÓN RECOMENDADA

1. **Fase 1**: Agregar `db_global.js` a un archivo (ej: `panel_admin.html`)
2. **Fase 2**: Probar que funcione correctamente
3. **Fase 3**: Migrar el resto de archivos gradualmente
4. **Fase 4**: Eliminar código duplicado de todos los archivos
5. **Fase 5**: Implementar backend para proteger API Key

---

## 📞 SOPORTE

Si encuentras errores o necesitas ayuda:
1. Revisa la consola del navegador para logs de error
2. Verifica que el import map esté correctamente configurado
3. Asegúrate de que `db_global.js` se carga antes que otros scripts
4. Comprueba la conexión a internet (SQLite Cloud requiere conexión)

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Autor**: InfiniHon Dev Team
