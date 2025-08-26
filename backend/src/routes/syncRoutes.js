import { Router } from 'express';
import sequelize from '../data/config/sequelize.js';

const router = Router();

// Endpoint temporal para force sync en producción
router.post('/force-sync-db', async (req, res) => {
  try {
    console.log('🔄 FORCE SYNC: Iniciando recreación de base de datos...');
    
    // Verificar que es ambiente de producción o desarrollo
    if (process.env.NODE_ENV === 'production' && !req.headers['x-force-sync-token']) {
      return res.status(403).json({
        success: false,
        message: 'Token de autorización requerido para force sync en producción'
      });
    }
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Usar force: true para recrear todas las tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada con force: true');
    
    res.json({
      success: true,
      message: 'Base de datos recreada exitosamente con todas las tablas actualizadas'
    });
    
  } catch (error) {
    console.error('❌ Error en force sync:', error);
    res.status(500).json({
      success: false,
      message: `Error recreando base de datos: ${error.message}`
    });
  }
});

export default router;
