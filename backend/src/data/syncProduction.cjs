const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configurar conexión a base de datos
const sequelize = process.env.DB_DEPLOY 
  ? new Sequelize(process.env.DB_DEPLOY, {
      dialect: 'postgres',
      logging: console.log,
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
        logging: console.log
      }
    );

async function syncProductionDatabase() {
  try {
    console.log('🔄 Sincronizando base de datos de producción...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Usar alter: true para actualizar sin perder datos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada con alter');
    
    await sequelize.close();
    console.log('✅ Sincronización completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncProductionDatabase();
