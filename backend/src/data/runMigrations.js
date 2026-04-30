import sequelize from './config/sequelize.js';
import { up as addKuulaSliderFields } from './migrations/20250817_add_kuula_and_slider_fields.js';
import { up as createSiteSettings } from './migrations/20260429000000-create-site-settings.js';

const runMigrations = async () => {
  try {
    console.log('🚀 Iniciando migraciones...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Ejecutar migraciones
    await addKuulaSliderFields(sequelize.getQueryInterface());
    await createSiteSettings(sequelize.getQueryInterface(), sequelize.constructor);
    
    console.log('🎉 Todas las migraciones completadas');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si el archivo se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;
