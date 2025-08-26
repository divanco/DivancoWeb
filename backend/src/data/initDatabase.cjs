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

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: false });
    console.log('📊 Tablas sincronizadas');
    
    // Ejecutar seeding
    console.log('🌱 Ejecutando seeding...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const seedProcess = spawn('node', ['src/data/seedDataStandalone.cjs'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      seedProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Inicialización de base de datos completada');
          resolve();
        } else {
          console.error('❌ Error en el seeding');
          reject(new Error(`Seeding failed with code ${code}`));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initializeDatabase().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = initializeDatabase;
