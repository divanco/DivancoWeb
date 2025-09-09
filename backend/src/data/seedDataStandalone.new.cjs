// Script independiente para crear usuarios predeterminados
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
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

// Definir solo el modelo de usuario
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'editor', 'author'),
    defaultValue: 'user',
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// No necesitamos relaciones ya que solo tenemos el modelo User

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando carga de usuarios predeterminados...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('🔗 Conexión a la base de datos establecida');
    
    // Forzar sincronización - ELIMINARÁ TODAS LAS TABLAS Y DATOS
    console.log('⚠️ Eliminando todas las tablas existentes...');
    await sequelize.sync({ force: true });
    console.log('🔄 Tablas recreadas exitosamente');
    
    // No es necesario verificar usuarios existentes ya que acabamos de borrar todo
    const existingUsers = 0;
    if (existingUsers > 0) {
      console.log('👥 Ya existen usuarios en la base de datos.');
      console.log('🔄 Verificando usuarios predeterminados...');
    } else {
      console.log('🧹 No hay usuarios, creando usuarios predeterminados...');
    }
    
    // Crear usuario admin predeterminado
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin1234';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    console.log('👤 Creando usuario administrador predeterminado...');
    await User.create({
      name: 'Admin',
      email: 'admin@divanco.co',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Usuario admin creado exitosamente');
    
    // Crear usuario editor predeterminado
    console.log('👤 Creando usuario editor predeterminado...');
    await User.create({
      name: 'Editor',
      email: 'editor@divanco.co',
      username: 'editor',
      password: hashedPassword,
      role: 'editor'
    });
    console.log('✅ Usuario editor creado exitosamente');
    
    console.log('✅ Usuarios predeterminados creados exitosamente!');
    console.log('📊 Resumen:');
    console.log('   - 2 usuarios (admin y editor)');
    console.log('   - 0 categorías (todas eliminadas)');
    console.log('   - 0 subcategorías (todas eliminadas)');
    console.log('   - 0 productos (todos eliminados)');
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar el script
seedDatabase();
