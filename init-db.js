const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initialize() {
  console.log('⚡ Iniciando inicialización de Base de Datos MySQL...');

  // Configuración de conexión inicial (sin base de datos, para crearla si no existe)
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true // Permitir múltiples statements en schema
  };

  const dbName = process.env.DB_NAME || 'reservauo_db';

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log(`🔌 Conectado al servidor MySQL en ${connectionConfig.host}`);

    // 1. Crear base de datos si no existe
    console.log(`🔨 Creando base de datos '${dbName}' si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Base de datos '${dbName}' verificada/creada.`);
    await connection.end();

    // 2. Conectarse a la base de datos específica para estructurar las tablas
    connectionConfig.database = dbName;
    connection = await mysql.createConnection(connectionConfig);
    console.log(`🔌 Conectado directamente a la base de datos '${dbName}'`);

    // 3. Leer e importar schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`📖 Leyendo archivo SQL en: ${schemaPath}`);
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    // Limpiar el script SQL y dividir por punto y coma para ejecutar cada sentencia por separado
    // (algunos drivers tienen problemas con múltiples consultas complejas en una sola llamada)
    const sqlStatements = sqlSchema
      .split(/;\s*$/m) // Dividir al final de cada línea con punto y coma
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));

    console.log(`🚀 Ejecutando ${sqlStatements.length} sentencias SQL...`);
    for (const statement of sqlStatements) {
      // Ignorar líneas de comentarios y ejecutar
      if (statement) {
        await connection.query(statement);
      }
    }

    console.log('🎉 ¡Base de datos ReservaUO inicializada con éxito!');
    console.log('👥 Datos de demostración listos (Tablas: usuarios, departamentos, espacios, reservas).');

  } catch (err) {
    console.error('❌ Error durante la inicialización de la base de datos:');
    console.error(err.message);
    console.log('\n💡 Sugerencia: Asegúrate de que las credenciales (DB_USER, DB_PASS) en tu archivo .env sean correctas y que tu servidor MySQL local esté encendido.');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initialize();
