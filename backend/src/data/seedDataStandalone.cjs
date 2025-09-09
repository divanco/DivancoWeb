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

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'COP'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  subcategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subcategory,
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

// Establecer relaciones
// Ninguna relación es necesaria ya que solo tenemos el modelo User

// Datos a cargar
const seedData = {
  categories: [
    {
      name: 'Amoblamientos',
      description: 'Muebles y elementos de amoblamiento para espacios residenciales y comerciales',
      isActive: true,
      subcategories: [
        {
          name: 'Muebles de Sala',
          description: 'Sofás, sillones, mesas de centro y complementos para sala de estar'
        },
        {
          name: 'Muebles de Dormitorio',
          description: 'Camas, armarios, cómodas y mesas de noche para dormitorios'
        },
        {
          name: 'Muebles de Comedor',
          description: 'Mesas, sillas, buffets y vitrinas para espacios de comedor'
        }
      ]
    },
    {
      name: 'Accesorios',
      description: 'Elementos decorativos y funcionales para complementar espacios',
      isActive: true,
      subcategories: [
        {
          name: 'Iluminación',
          description: 'Lámparas, luminarias y sistemas de iluminación decorativa'
        },
        {
          name: 'Textiles',
          description: 'Cortinas, cojines, alfombras y elementos textiles decorativos'
        },
        {
          name: 'Decoración',
          description: 'Cuadros, espejos, jarrones y objetos decorativos'
        }
      ]
    },
    {
      name: 'Materiales',
      description: 'Materiales de construcción y acabados para proyectos arquitectónicos',
      isActive: true,
      subcategories: [
        {
          name: 'Revestimientos',
          description: 'Cerámicas, porcelanatos, piedras y materiales de revestimiento'
        },
        {
          name: 'Pisos',
          description: 'Maderas, laminados, vinilos y materiales para pisos'
        },
        {
          name: 'Pinturas',
          description: 'Pinturas, barnices, esmaltes y productos de acabado'
        }
      ]
    },
    {
      name: 'Herramientas',
      description: 'Herramientas y equipos para construcción y carpintería',
      isActive: true,
      subcategories: [
        {
          name: 'Herramientas Manuales',
          description: 'Martillos, destornilladores, llaves y herramientas básicas'
        },
        {
          name: 'Herramientas Eléctricas',
          description: 'Taladros, sierras, lijadoras y herramientas con motor'
        },
        {
          name: 'Equipos de Medición',
          description: 'Niveles, metros, escuadras y instrumentos de precisión'
        }
      ]
    }
  ],

  products: {
    'Muebles de Sala': [
      { name: 'Sofá Modular Esquinero', description: 'Sofá esquinero modular de 3 piezas en tela beige', price: 2890000, stock: 5 },
      { name: 'Mesa de Centro Moderna', description: 'Mesa de centro en vidrio templado con base metálica', price: 650000, stock: 8 },
      { name: 'Sillón Reclinable Premium', description: 'Sillón reclinable individual con masajeador incorporado', price: 1450000, stock: 6 },
      { name: 'Mesa Lateral Roble', description: 'Mesa lateral de roble con cajón oculto', price: 420000, stock: 12 }
    ],
    'Muebles de Dormitorio': [
      { name: 'Cama Queen Tapizada', description: 'Cama queen size con cabecero tapizado en cuero sintético', price: 1850000, stock: 3 },
      { name: 'Armario 6 Puertas Espejo', description: 'Armario de 6 puertas en melamina blanca con espejos', price: 3200000, stock: 2 },
      { name: 'Cómoda 5 Cajones Roble', description: 'Cómoda de 5 cajones en madera natural con tiradores metálicos', price: 980000, stock: 7 },
      { name: 'Mesa de Noche Flotante LED', description: 'Mesa de noche flotante con cajón y luz LED incorporada', price: 420000, stock: 12 }
    ],
    'Muebles de Comedor': [
      { name: 'Mesa Comedor Extensible Roble', description: 'Mesa de comedor extensible para 6-8 personas en madera roble', price: 2100000, stock: 4 },
      { name: 'Sillas Comedor Set x4', description: 'Set de 4 sillas para comedor con respaldo ergonómico', price: 890000, stock: 9 },
      { name: 'Buffet Moderno 4 Puertas', description: 'Buffet moderno de 4 puertas con compartimientos internos', price: 1680000, stock: 3 },
      { name: 'Vitrina Esquinera Vidrio', description: 'Vitrina esquinera con puertas de vidrio y luz interior', price: 1250000, stock: 4 }
    ],
    'Iluminación': [
      { name: 'Lámpara Colgante Industrial Cobre', description: 'Lámpara colgante estilo industrial con acabado en cobre', price: 320000, stock: 15 },
      { name: 'Lámpara Mesa LED Regulable', description: 'Lámpara de mesa LED regulable con carga inalámbrica', price: 195000, stock: 12 },
      { name: 'Apliques Pared LED Cálida', description: 'Par de apliques de pared LED con luz cálida regulable', price: 160000, stock: 18 },
      { name: 'Chandelier Cristal Moderno', description: 'Chandelier de cristal con luces LED regulables', price: 850000, stock: 4 }
    ],
    'Textiles': [
      { name: 'Cortinas Blackout Térmicas', description: 'Cortinas blackout térmicas con sistema de rieles incluido', price: 180000, stock: 25 },
      { name: 'Alfombra Persa 2x3m', description: 'Alfombra persa tradicional de 2x3 metros en tonos cálidos', price: 850000, stock: 4 },
      { name: 'Cojines Decorativos Set x3', description: 'Set de 3 cojines decorativos en diferentes texturas', price: 120000, stock: 20 },
      { name: 'Tapete Entrada Antideslizante', description: 'Tapete de entrada antideslizante con diseño personalizado', price: 85000, stock: 30 }
    ],
    'Decoración': [
      { name: 'Espejo Decorativo Redondo Dorado', description: 'Espejo decorativo redondo de 80cm con marco dorado', price: 290000, stock: 8 },
      { name: 'Cuadro Canvas Abstracto 120x80', description: 'Cuadro en canvas de arte abstracto moderno 120x80cm', price: 380000, stock: 6 },
      { name: 'Jarrón Cerámico Artesanal 45cm', description: 'Jarrón decorativo en cerámica artesanal de 45cm de altura', price: 240000, stock: 10 },
      { name: 'Escultura Moderna Metal', description: 'Escultura decorativa moderna en metal oxidado', price: 450000, stock: 5 }
    ],
    'Revestimientos': [
      { name: 'Porcelanato Rectificado Mármol 60x60', description: 'Porcelanato rectificado imitación mármol 60x60cm', price: 45000, stock: 150 },
      { name: 'Cerámica Subway Blanca 7.5x15', description: 'Cerámica tipo subway blanca brillante 7.5x15cm', price: 32000, stock: 200 },
      { name: 'Piedra Natural Pizarra 40x40', description: 'Piedra natural pizarra negra para revestimiento 40x40cm', price: 68000, stock: 75 },
      { name: 'Mosaico Veneciano Dorado', description: 'Mosaico veneciano con acabado dorado para baños', price: 120000, stock: 50 }
    ],
    'Pisos': [
      { name: 'Piso Laminado AC4 Roble', description: 'Piso laminado resistencia AC4 imitación roble, caja x 2.5m²', price: 95000, stock: 60 },
      { name: 'Vinilo Adhesivo Madera', description: 'Vinilo adhesivo decorativo imitación madera por m²', price: 28000, stock: 120 },
      { name: 'Parquet Macizo Nogal', description: 'Parquet de madera maciza de nogal natural', price: 180000, stock: 40 },
      { name: 'Piso Epóxico Industrial', description: 'Sistema de piso epóxico para uso industrial', price: 65000, stock: 80 }
    ],
    'Pinturas': [
      { name: 'Pintura Latex Interior Lavable', description: 'Pintura latex lavable para interiores, galón de 4 litros', price: 89000, stock: 80 },
      { name: 'Barniz Poliuretano Transparente', description: 'Barniz poliuretano transparente para madera, galón', price: 125000, stock: 35 },
      { name: 'Esmalte Sintético Brillante', description: 'Esmalte sintético brillante para metal y madera, galón', price: 78000, stock: 45 },
      { name: 'Pintura Anticorrosiva Roja', description: 'Pintura anticorrosiva base roja para metales', price: 95000, stock: 30 }
    ],
    'Herramientas Manuales': [
      { name: 'Martillo Carpintero 16oz Fibra', description: 'Martillo de carpintero 16oz con mango de fibra de vidrio', price: 45000, stock: 25 },
      { name: 'Juego Destornilladores 12pz Magnético', description: 'Juego de 12 destornilladores con puntas magnéticas', price: 85000, stock: 20 },
      { name: 'Escuadra Magnética Soldadura', description: 'Escuadra magnética ajustable para soldadura y carpintería', price: 75000, stock: 18 },
      { name: 'Llave Inglesa Ajustable 12"', description: 'Llave inglesa ajustable de 12" con apertura máxima 32mm', price: 52000, stock: 22 }
    ],
    'Herramientas Eléctricas': [
      { name: 'Taladro Percutor 800W Maletin', description: 'Taladro percutor de 800W con maletin y accesorios', price: 380000, stock: 12 },
      { name: 'Sierra Circular 7¼" Láser', description: 'Sierra circular de 7¼" con guía láser y disco incluido', price: 420000, stock: 8 },
      { name: 'Lijadora Orbital 280W Aspiración', description: 'Lijadora orbital de 280W con sistema de aspiración', price: 290000, stock: 10 },
      { name: 'Caladora Variable 650W Guía', description: 'Caladora con velocidad variable y guía de corte', price: 350000, stock: 9 }
    ],
    'Equipos de Medición': [
      { name: 'Nivel Laser Autonivelante Cruz', description: 'Nivel láser autonivelante con proyección cruzada', price: 680000, stock: 6 },
      { name: 'Metro Láser Digital 40m', description: 'Metro láser digital con alcance de 40 metros', price: 320000, stock: 15 },
      { name: 'Calibrador Digital Inox 150mm', description: 'Calibrador digital en acero inoxidable 150mm', price: 120000, stock: 12 },
      { name: 'Nivel Burbuja Aluminio 60cm', description: 'Nivel de burbuja en aluminio de 60cm con imanes', price: 85000, stock: 20 }
    ]
  }
};

// Función para generar slug
// No necesitamos crear slugs para los usuarios
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando carga de usuarios predeterminados...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('🔗 Conexión a la base de datos establecida');
    
    // Verificar si ya hay usuarios
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('� Ya existen usuarios en la base de datos.');
      console.log('🔄 Verificando usuarios predeterminados...');
    } else {
      console.log('🧹 No hay usuarios, creando usuarios predeterminados...');
    }
    
    // Crear usuario admin predeterminado
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin1234';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Verificar si el usuario admin ya existe
    const adminExists = await User.findOne({ where: { email: 'admin@divanco.co' } });
    
    if (!adminExists) {
      console.log('� Creando usuario administrador predeterminado...');
      await User.create({
        name: 'Admin',
        email: 'admin@divanco.co',
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Usuario admin creado exitosamente');
    } else {
      console.log('✅ Usuario admin ya existe, omitiendo creación');
    }
    
    // Crear usuario editor predeterminado
    const editorExists = await User.findOne({ where: { email: 'editor@divanco.co' } });
    
    if (!editorExists) {
      console.log('� Creando usuario editor predeterminado...');
      await User.create({
        name: 'Editor',
        email: 'editor@divanco.co',
        username: 'editor',
        password: hashedPassword,
        role: 'editor'
      });
      console.log('✅ Usuario editor creado exitosamente');
    } else {
      console.log('✅ Usuario editor ya existe, omitiendo creación');
    }
    
    console.log('✅ Usuarios predeterminados verificados/creados exitosamente!');
    console.log('📊 Resumen:');
    console.log('   - 2 usuarios (admin y editor)');
    console.log('   - 0 categorías (carga omitida)');
    console.log('   - 0 subcategorías (carga omitida)');
    console.log('   - 0 productos (carga omitida)');
    
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
