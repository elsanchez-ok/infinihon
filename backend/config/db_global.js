/**
 * ============================================================================
 * CONFIGURACIÓN GLOBAL DE BASE DE DATOS - INFINIHON
 * ============================================================================
 * 
 * Este archivo centraliza la conexión a SQLite Cloud para todos los módulos
 * que requieren acceso a la base de datos.
 * 
 * ARCHIVOS QUE DEBEN IMPORTAR ESTE MÓDULO:
 * - panel_admin.html
 * - panel_admin_productos.html
 * - tienda.html
 * - tienda4.html
 * - checkout.html
 * - perfil.html
 * - registro_admin.html
 * 
 * USO:
 * 1. Importar este script antes de cualquier script que use la BD
 * 2. Usar las variables globales: DB_CONFIG, DB_CONNECTION_STRING
 * 3. Usar las funciones helper: connectToDatabase(), queryDatabase()
 * 
 * ============================================================================
 */

// Configuración de la base de datos
const DB_CONFIG = {
    host: 'cxaerd5fvk.g2.sqlite.cloud',
    port: 8860,
    database: 'infinihon_store.db',
    apiKey: 'cfHa2k4KOhBzxKL5g484dhAf4xlC4znLp5M6wzirgvc'
};

// String de conexión completo
const DB_CONNECTION_STRING = `sqlitecloud://${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}?apikey=${DB_CONFIG.apiKey}`;

// Variables globales para la instancia de la base de datos
let dbInstance = null;
let isConnecting = false;

/**
 * Conecta a la base de datos SQLite Cloud
 * @returns {Promise<Database>} Instancia de la base de datos
 */
async function connectToDatabase() {
    if (dbInstance) {
        console.log('✅ Ya existe una conexión activa a la BD');
        return dbInstance;
    }

    if (isConnecting) {
        console.log('⏳ Conexión en progreso...');
        return new Promise((resolve) => {
            const checkConnection = setInterval(() => {
                if (dbInstance) {
                    clearInterval(checkConnection);
                    resolve(dbInstance);
                }
            }, 100);
        });
    }

    isConnecting = true;
    console.log('🔌 Conectando a SQLite Cloud...');

    try {
        // Importar el driver de SQLite Cloud
        const { Database } = await import('@sqlitecloud/drivers');
        
        // Crear instancia de la base de datos
        dbInstance = new Database(DB_CONNECTION_STRING);
        
        // Verificar conexión
        await dbInstance.connect();
        
        console.log('✅ Conectado exitosamente a la base de datos:', DB_CONFIG.database);
        console.log('📊 Host:', DB_CONFIG.host);
        
        isConnecting = false;
        return dbInstance;
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        isConnecting = false;
        throw new Error(`No se pudo conectar a la BD: ${error.message}`);
    }
}

/**
 * Ejecuta una consulta SQL de forma segura
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta (opcional)
 * @returns {Promise<Array>} Resultados de la consulta
 */
async function queryDatabase(sql, params = []) {
    try {
        const db = await connectToDatabase();
        const results = await db.run(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en consulta SQL:', error.message);
        console.error('SQL:', sql);
        throw error;
    }
}

/**
 * Ejecuta una transacción múltiple
 * @param {Array<{sql: string, params: Array}>} queries - Lista de consultas a ejecutar
 * @returns {Promise<Array>} Resultados de todas las consultas
 */
async function executeTransaction(queries) {
    try {
        const db = await connectToDatabase();
        const results = [];
        
        for (const query of queries) {
            const result = await db.run(query.sql, query.params || []);
            results.push(result);
        }
        
        return results;
    } catch (error) {
        console.error('❌ Error en transacción:', error.message);
        throw error;
    }
}

/**
 * Cierra la conexión a la base de datos
 * @returns {Promise<void>}
 */
async function closeDatabase() {
    if (dbInstance) {
        try {
            await dbInstance.close();
            console.log('🔌 Conexión a la BD cerrada');
            dbInstance = null;
        } catch (error) {
            console.error('❌ Error al cerrar la BD:', error.message);
        }
    }
}

/**
 * Verifica el estado de la conexión
 * @returns {boolean} True si hay una conexión activa
 */
function isDatabaseConnected() {
    return dbInstance !== null;
}

/**
 * Obtiene información de la configuración (sin exponer API Key completa)
 * @returns {Object} Información segura de la configuración
 */
function getDatabaseConfigInfo() {
    const maskedApiKey = DB_CONFIG.apiKey.substring(0, 8) + '...' + DB_CONFIG.apiKey.substring(DB_CONFIG.apiKey.length - 4);
    return {
        host: DB_CONFIG.host,
        port: DB_CONFIG.port,
        database: DB_CONFIG.database,
        apiKey: maskedApiKey,
        isConnected: isDatabaseConnected()
    };
}

// Exportar para uso en módulos ES6 (si se usa type="module")
if (typeof window !== 'undefined') {
    window.DB_CONFIG = DB_CONFIG;
    window.DB_CONNECTION_STRING = DB_CONNECTION_STRING;
    window.connectToDatabase = connectToDatabase;
    window.queryDatabase = queryDatabase;
    window.executeTransaction = executeTransaction;
    window.closeDatabase = closeDatabase;
    window.isDatabaseConnected = isDatabaseConnected;
    window.getDatabaseConfigInfo = getDatabaseConfigInfo;
    
    console.log('📦 DB Global Module cargado correctamente');
    console.log('ℹ️ Usa window.connectToDatabase() para conectar');
    console.log('ℹ️ Usa window.queryDatabase(sql, params) para consultar');
}

// Import map necesario para SQLite Cloud (debe estar en el HTML)
// <script type="importmap">
// {
//     "imports": {
//         "@sqlitecloud/drivers": "https://esm.sh/@sqlitecloud/drivers@latest"
//     }
// }
// </script>
