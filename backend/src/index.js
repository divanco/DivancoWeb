
import sequelize from './data/config/sequelize.js';  // ✅ Agregada extensión .js
import { syncAllModels } from './data/models/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3001;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production' || !!process.env.DB_DEPLOY;

// Función para inicializar la aplicación
async function initializeApp() {
  try {
    
    
    // Sincronizar modelos en orden correcto
    // Siempre usar force: true en producción
    console.log(`⚠️ Entorno detectado: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log('⚠️ RECREANDO TODAS LAS TABLAS - MODO FORCE: true');
    await syncAllModels(true);
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 Entorno: ${env}`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error.message);
    process.exit(1);
  }
}

// Inicializar la aplicación
initializeApp();