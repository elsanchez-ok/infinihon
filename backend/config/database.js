import { sqliteCloudConnect } from '@sqlitecloud/drivers';
import dotenv from 'dotenv';

dotenv.config();

let dbConnection = null;

/**
 * Conecta a la base de datos SQLite Cloud
 * @returns {Promise<any>} Instancia de conexión
 */
export async function connectToDatabase() {
    if (dbConnection) {
        console.log('✅ Conexión a base de datos ya establecida');
        return dbConnection;
    }

    try {
        const config = {
            host: process.env.SQLITE_HOST,
            port: parseInt(process.env.SQLITE_PORT),
            database: process.env.SQLITE_DATABASE,
            apikey: process.env.SQLITE_API_KEY
        };

        console.log('🔌 Conectando a SQLite Cloud...');
        dbConnection = await sqliteCloudConnect(config);
        console.log('✅ Conectado exitosamente a la base de datos');
        
        return dbConnection;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        throw error;
    }
}

/**
 * Ejecuta una consulta SQL
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise<Array>} Resultados
 */
export async function query(sql, params = []) {
    try {
        const db = await connectToDatabase();
        // Nota: sqliteCloud drivers usa template strings para queries parametrizadas
        // Para queries simples sin parámetros complejos
        const result = await db.sql(sql);
        return result;
    } catch (error) {
        console.error('❌ Error ejecutando query:', error.message);
        throw error;
    }
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDatabase() {
    if (dbConnection) {
        await dbConnection.close();
        dbConnection = null;
        console.log('🔌 Conexión cerrada');
    }
}

/**
 * Verifica si hay conexión activa
 * @returns {boolean}
 */
export function isConnected() {
    return dbConnection !== null;
}
