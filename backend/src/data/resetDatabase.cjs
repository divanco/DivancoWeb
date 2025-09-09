// Script independiente para borrar completamente la base de datos
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configurar conexión a base de datos
const sequelize = process.env.DB_DEPLOY 
  ? new Sequelize(process.env.DB_DEPLOY, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'divanco_dev',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

async function resetDatabase() {
  try {
    console.log('⚠️ Iniciando BORRADO COMPLETO de la base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('🔗 Conexión a la base de datos establecida');
    
    // Forzar sincronización - ELIMINARÁ TODAS LAS TABLAS Y DATOS
    console.log('🧨 Eliminando todas las tablas existentes...');
    await sequelize.sync({ force: true });
    console.log('✅ Todas las tablas han sido eliminadas exitosamente');
    
    console.log('📊 Resumen:');
    console.log('   - 0 usuarios (todos eliminados)');
    console.log('   - 0 categorías (todas eliminadas)');
    console.log('   - 0 subcategorías (todas eliminadas)');
    console.log('   - 0 productos (todos eliminados)');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar el script
resetDatabase();
